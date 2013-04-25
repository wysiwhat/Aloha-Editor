define [
	'aloha'
	'aloha/plugin'
	'jquery'
	'aloha/ephemera'
	'ui/ui'
	'ui/button'
    'semanticblock/semanticblock-plugin'
    'css!note/css/note-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

	TEMPLATE = '''
        <div class="note">
            <div class="title-container dropdown">
                <a class="type" data-toggle="dropdown">Note</a>
                <ul class="dropdown-menu">
                    <li><a href="">Note</a></li>
                    <li><a href="">Aside</a></li>
                    <li><a href="">Warning</a></li>
                    <li><a href="">Tip</a></li>
                    <li><a href="">Important</a></li>
                </ul>
                <span class="title" semantic-editable placeholder="Add a title (optional)"></span>
            </div>
            <div class="body" semantic-editable placeholder="Type the text of your note here."></div>
        </div>
	'''

	Plugin.create('note', {
		init: () ->
			semanticBlock.enableDragToAdd('Note to Reader', '[semantic-drag-source=note]', TEMPLATE)
			UI.adopt 'insertNote', Button,
				click: (a, b, c) ->
					semanticBlock.insertAtCursor(TEMPLATE)
		})
