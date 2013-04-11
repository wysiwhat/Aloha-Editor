define [
	'aloha'
	'aloha/plugin'
	'jquery'
	'aloha/ephemera'
	'ui/ui'
	'ui/button'], (Aloha, Plugin, jQuery, Ephemera, UI, Button) ->

	NEW_NOTE_TEMPLATE = '''
        <div class="note-container">
            <div class="note-controlls">
               <a href="" class="note-delete"><i class="icon-remove"></i></a> 
               <a href=""><i class="icon-cog"></i></a> 
            </div> 
            <div class="note">
                <div class="title"></div>
                <div class="body">Replace this with the body of the note</div>
            </div>
        </div>
	'''

	UI.adopt 'insertNote', Button,
		click: (a, b, c) ->
			# The action for creating a new note
      range = Aloha.Selection.getRangeObject()
      $newNote = jQuery(NEW_NOTE_TEMPLATE)
      # Insert the note into the DOM
      $newNote.addClass('aloha-new-note')
      GENTICS.Utils.Dom.insertIntoDOM $newNote,
        range,
        Aloha.activeEditable.obj
      $newNote = Aloha.jQuery('.aloha-new-note')
      $newNote.removeClass('aloha-new-note')
      enable($newNote)

	mostSeniorEditableOf = ($node) ->
		$node.parents('.aloha-editable').last()

	bindNoteEventsTo = ($node) ->
		return if $node.data('noteEventsInitialized')
		console.log('binding note events')

		$node.data('noteEventsInitialized', true)

 	    # events for the drag handle
		$node
			.on('mouseenter', '.aloha-block-draghandle', () -> $(this).parents('.note-container').addClass('drag-active'))
			.on('mouseleave', '.aloha-block-draghandle', () -> $(this).parents('.note-container').removeClass('drag-active') if not $(this).data('dragging'))
			.on('mousedown' , '.aloha-block-draghandle', () -> $(this).data('dragging', true))
			.on('mouseup'   , '.aloha-block-draghandle', () -> $(this).data('dragging', false))

 	    # events for active state when hovering on a note
 	    # when hovering over a nested note only the child is active 
		$node
			.on('mouseover' , '.note-container', () ->
				$(this).addClass('active') if !$(this).find('.note-container.active').length
				$(this).parents('.note-container').removeClass('active'))
			.on('mouseleave', '.note-container', () -> $(this).removeClass('active'))

 	    # events for note controlls 
		$node
			.on('click' , '.note-container .note-delete', (e) ->
				e.preventDefault()
				$note = $(this).parents('.note-container').first()
				$note.slideUp 'slow', () -> $note.remove()
			)

	# ## Enable Editing a Note
	# Cleans up a Note (`.note`) and prepares it for editing by:
	#
	# 1. Makes sure there is a title
	# 2. Collects all other children into a `.body` div
	# 3. Enables aloha on the title
	# 4. Enables aloha on the body (all the other children)
	# 5. Register the note with the block plugin (so it can be moved around)
	enable = ($noteContainer) ->
		# get the note from the container 
		$note = $noteContainer.children('.note')
		# Pull out the title (as long as it's the 1st element)
		$title = $note.children('.title')
		# If there is no title, prepend one
		$title = jQuery('<h1 class="title"></h1>').prependTo $note if not $title.is('.title')

		# Move all the other children into an editable body div
		$body = $note.find('.body')
		if not $body[0]
			$body = jQuery('<div class="body"></div>')
			# Fill the new body element with the original children
			$note.children().not($title).appendTo $body
		# Mark that the body div should be unwrapped
		# TODO: a Div cannot have both a class of "aloha-editable" and "aloha-ephemera-wrapper"
		# Ephemera.markWrapper($body)
		$body.appendTo($note)

		$title.aloha()
		$body.aloha()

		# After setting up the editable children, enable the block
		$noteContainer.alohaBlock()

		# Bind all JS events needed for note interaction 
		bindNoteEventsTo mostSeniorEditableOf $noteContainer


	Aloha.bind 'aloha-editable-activated', (evt, props) ->
		props.editable.obj.find('.note').each (i, note) ->
			enable(jQuery(note))
