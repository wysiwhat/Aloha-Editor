define 'collaborate/collaborate-plugin', [ 'toolbar/toolbar-plugin', '../../appmenu/appmenu', 'jquery', "i18n!format/nls/i18n", "i18n!aloha/nls/i18n", "aloha/console", "css!./collaborate.css" ], (toolbar, appmenu, $, i18n, i18nCore) ->

  shared =
    socket: null # Shared between enable and reset
    changeHandler: null

  reset = () ->
    shared.socket.emit 'document:reset'
    shared.changeHandler(null, null)

  enable = (evt, url) ->
    
    unless url? then url = prompt 'What is the collaboration server URL?', 'http://localhost:3001'
    shared.socket = socket = io.connect url
  
    socket.on 'connect', () ->
      $doc = Aloha.activeEditable.obj
      console.log "On socket connection the activeEditable is #{Aloha.activeEditable}"
      debugReceive = (command) ->
        socket.on command, (message) ->
          if command == 'node:operation'
            console.log 'Received: OP: ' + message.op, message
          else
            console.log 'Received: ' + command, message
      
      debugReceive 'document.reset'
      debugReceive 'user:hello'
      debugReceive 'user:list'
      debugReceive 'user:join'
      debugReceive 'user:leave'
      debugReceive 'node:select'
      debugReceive 'node:operation'
      debugReceive 'node:update'
  
      $doc[0].innerHTML = ''
      resetBtn.setDisabled false # Enable resetting of the document

      # Keeps a mapping of all active nodes used in the document
      # This allows us to tell when a node was deleted
      nodeMap = {}
  
      users = {} # This will be populated by active users
      me = null
      
      # Replay changes made by others
      onOperation = (msg) ->
       switch msg.op
         when 'append'
           $context = $doc
           $context = $('#' + msg.context) if msg.context
           console.warn 'message is missing an element name' if not msg.tag
           $el = $("<#{ msg.tag } />").appendTo $context
           $el.attr 'id', msg.node
           for attrName, attrValue of msg.attrs
             $el.attr attrName, attrValue
           nodeMap[msg.node] = $el
         when 'insertbefore'
           $context = $('#' + msg.context)
           $el = $("<#{ msg.tag } />").insertBefore $context
           $el.attr 'id', msg.node
           for attrName, attrValue of msg.attrs
             $el.attr attrName, attrValue
           nodeMap[msg.node] = $el
         when 'delete'
           if msg.node of nodeMap
             $node = nodeMap[msg.node]
             $node.remove()
           else
             console.warn 'BUG: Attempting to delete a node that does not exist'
           delete nodeMap[msg.node]
         else
            console.log 'Could not understand operation ', msg.op, msg

      socket.on 'node:operation', onOperation

      socket.on 'document:reset', () ->
        $doc[0].innerHTML = ''
      
      socket.on 'user:hello', (msg) ->
        me = msg
  
      socket.on 'user:join', (msg) ->
        users[msg.user] = msg.color
  
      socket.on 'user:leave', (msg) ->
        delete users[msg.user]
        
      # Update the handle bars when a selection change occurs
      socket.on 'node:select', (msg) ->
        # Remove all handles TODO: reduce flicker
        $('.handle').remove()
        $('.remote-selected').removeClass('remote-selected').removeAttr('contenteditable')
        
        for node, user of msg
          $node = $('#' + node)
  
          $handle = $("<div id='#{ node }-handle' contenteditable='false'></div>").addClass('handle')
          $handle.addClass('handle').hide().appendTo('body')
  
          $handle.attr('style', "background-color: #{ users[user] };")
          css = {}
          css.top = $node.offset().top
          css.height = $node.height()
          $handle.data node: $node
          $handle.css(css).show()
          
          if user != me.user
            $node.addClass('remote-selected')
            $node.attr('contenteditable', false)
  
      socket.on 'node:update', (msg) ->
        setTimeout( () ->
          $n = $('#' + msg.node)
          if msg.tag and $n[0].tagName.toLowerCase() != msg.tag
            $newNode = Aloha.jQuery("<#{ msg.tag } />")
            $n.replaceWith $newNode
            $n = $newNode
            $n.attr 'id', msg.node
          
          if msg.attrs
            for attrName, attrValue of msg.attrs
              $n.attr attrName, attrValue
          if $n.length
            $n[0].innerHTML = msg.html
        , 10)
  
      autoId = 0 # Incremented
      # Lock a node when selection changes
      shared.changeHandler = (event, rangeObject) ->
        if rangeObject
          $parent = $(rangeObject.startContainer).parents('*[id]').first()
          if $parent.length && $doc[0] != $parent[0]
            # make sure the element is a descendant of the document
            if $parent.parents().index($doc) >= 0
              node = $parent.attr('id')
              socket.emit 'node:select', [ node ]
            
              # The selection also changes every time text is edited
              attribs = {}
              for attr in $parent[0].attributes
                if attr.name != 'id'
                  attribs[attr.name] = attr.value
              socket.emit 'node:update',
                node: node
                tag: $parent[0].tagName.toLowerCase()
                attribs: attribs
                html: $parent[0].innerHTML

        # Check if any nodes were deleted
        for key, $node of nodeMap
          if $node.parents().index($doc) < 0
            # The node was removed. notify!
            socket.emit 'node:operation'
              op: 'delete'
              node: key
            delete nodeMap[key]
              
        # If there is loose text (not in a para) wrap it in one
        $doc.contents().filter( () ->
          @nodeType == 3;
        ).wrap('<p></p>')
        $doc.find('br:not(.aloha-end-br)').remove()
        
        # If anything doesn't have @id's treat them as appends
        # The user created a new element by pressing Enter
        # Either it's a insertbefore or an append message
        # Find the new node
        orphans = $doc.children('*:not([id])').add($doc.find('p:not([id]),div:not([id])'))
        
        # Orphans _could_ also have id's. Adding an image gives the image an id
        $doc.children('*[id]').each () ->
          $child = $(@)
          if $child.attr('id') not of nodeMap
            orphans = orphans.add $child
        
        # TODO: Handle tables and blocks that are created (Aloha gives them id's)
        orphans.each () ->
          orphan = @
          $orphan = $(@)

          html = orphan.innerHTML
          attribs = {}
          for attr in orphan.attributes
            if attr.name != 'id'
              attribs[attr.name] = attr.value
          id = $orphan.attr('id') or "auto-#{ me.user }-id#{ ++autoId }"
          $orphan.attr('id', id)
          nodeMap[id] = $orphan

          # The user probably hit enter. so update the previous node
          $prev = $orphan.prev('*[id]')
          if $prev.length
            if $prev.parents().index($doc) >= 0
              # The selection also changes every time text is edited
              socket.emit 'node:update',
                node: $prev.attr 'id'
                tag: $prev[0].tagName.toLowerCase()
                html: $prev[0].innerHTML

          $next = $orphan.next('*[id]')
          if $next.length
            op = 'insertbefore'
            context = $next.attr 'id'
          else
            op = 'append'
            # For now, collab doesn't do nesting. append is always on the doc
            context = null
            #if $doc[0] = parent.parent()[0]
            #  context = null
            #else 
            #  context = parent.parent().attr 'id'
          socket.emit 'node:operation'
            op: op
            node: id
            context: context
            tag: orphan.tagName.toLowerCase()
            attribs: attribs
            html: html
          socket.emit 'node:select', [ id ]

      Aloha.bind "aloha-selection-changed", shared.changeHandler
      # On focus the cursor isn't available yet so fire the event after a period of time
      $doc.bind 'focusPHILBLAH', (evt) ->
        setTimeout (() ->
          sel = rangy.getSelection()
          ranges = sel.getAllRanges()
          return  if ranges.length is 0
          rangeObject = ranges[0]
          shared.changeHandler evt, rangeObject), 10

      $doc.bind 'blur', (evt) ->
        socket.emit 'node:select', []

  resetBtn = new appmenu.MenuItem('Reset Document', {accel: 'Meta+Shift+E', action: reset, disabled: true})

  collabMenu = new appmenu.MenuButton('Collaborate!', new appmenu.Menu([
    new appmenu.MenuItem('Enable!', {accel: 'Meta+E', action: (evt) -> enable evt, 'http://boole.cnx.rice.edu:3001'})
    resetBtn
    new appmenu.Separator()
    new appmenu.MenuItem('Enable localhost (dev)', {accel: 'Meta+Shift+L', action: (evt) -> enable evt, 'http://localhost:3001'})
    new appmenu.MenuItem('Enable...', {action: enable})
  ]))
  collabMenu.setDisabled(true) # Disable it by default
  toolbar.menubar.append(collabMenu)
  
  Aloha.bind 'aloha-editable-activated', (e, params) ->
    collabMenu.setDisabled(not window.io?)

  Aloha.bind 'aloha-editable-deactivated', (e, params) ->
    collabMenu.setDisabled(true)

