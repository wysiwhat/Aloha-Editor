module.exports = (app) ->
  ###
  Communication protocol:
  
  server              client
  ---------------------------
                  <--    connect
  user:hello  -->
  (operations)*   -->
  node:selected   -->
  user:join     -->>
  
  
                  <--  node:select
  node:select   -->>
  
  
                  <--  node:move
  node:moved      -->> { rev++ }
  
  
                  <-- node:update
  node:updated    -->> { rev++ }
  
  
  
  user: the socket id
  ###

  socketio = require('socket.io')
  io = socketio.listen(app)
  COLORS = [ '#cc3333', '#3333cc', '#33cc33', '#cccc33', '#cc33cc', '#33cccc' ]
  lastColor = 0
  locks = {}
  # Contains a list of appends that completely defines the document
  history = []
  sessions = {}
  
  # Keep track of messages emitted so new clients can 'catch up'
  emitAll = (command, params) ->
    io.sockets.emit command, params

  io.sockets.on 'connection', (socket) ->
    emit = (command, params) ->
      socket.emit command, params

    color = COLORS[lastColor++ % COLORS.length]
    sessions[socket.id] = color
    
    # Let the client know which user they are
    emit 'user:hello',
      user: socket.id
      color: color

    # Let everyone know this client has joined in
    socket.broadcast.emit 'user:join',
      user: socket.id
      color: color

    # Give the client a list of active users
    for user, color of sessions
      emit 'user:join',
        user: socket.id
        color: color
    
    # Send a history of changes
    for h in history
      emit h.command, h.message

    # Send a set of locked elements
    emitAll 'node:select', locks
    
    # When a new user starts collaborating reset the doc
    socket.on 'document:reset', (nodes) ->
      # Remove all locks this user has
      
      # Can't just bind history to a new empty array because some functions have it stored in local vars
      while history.length
        history.pop()
      for node of locks
        delete locks[node]
      
      socket.broadcast.emit 'document:reset'
      emitAll 'node:select', locks

    # When a user tries to lock something lock it
    socket.on 'node:select', (nodes) ->
      changed = false
      # Remove all locks this user has
      for node, user of locks
        if user == socket.id and node not in nodes
          delete locks[node]
          changed = true
      
      for node in nodes
        if not locks[node]
          locks[node] = socket.id
          changed = true

      if changed
        emitAll 'node:select', locks

    # Handle document operations
    socket.on 'node:operation', (operation) ->
      # TODO: Check that it's a valid operation
      operation.user = socket.id # Just for good measure/debugging?
      socket.broadcast.emit 'node:operation', operation
      switch operation.op
        when 'delete'
          for item, index in history
            if item.message.node == operation.node
              history.splice index, 1 # remove the append/insert
              break
        else
          history.push { command: 'node:operation', message: operation }

    # Broadcast edits
    socket.on 'node:update', (msg) ->
      node = msg.node
      # TODO: Check that it's a valid operation
      # operation.user = socket.id # Just for good measure/debugging?
      socket.broadcast.emit 'node:update', msg
      
      # Search through the history and if there's already an edit for this node collapse it
      replacedAnotherEdit = false
      for entry in history
        if entry.command == 'node:update'
          if entry.message.node == node
            entry.message = msg
            replacedAnotherEdit = true
        
      if not replacedAnotherEdit
        history.push { command: 'node:update', message: msg }

    # Handle disconnects by notifying everyone the user disconnected
    socket.on 'disconnect', ->
      emitAll 'user:leave', socket.id

      # Remove all locks held by this user
      for node, user of locks
        if user == socket.id
          delete locks[node]

      emitAll 'node:select', locks

      delete sessions[socket.id]