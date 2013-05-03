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
        <div class="note" data-type="note">
            <div class="title"></div>
            <div class="body" semantic-editable placeholder="Type the text of your note here."></div>
        </div>
	'''
	TITLE_CONTAINER = '''
        <div class="title-container dropdown">
            <a class="type" data-toggle="dropdown"></a>
            <span class="title" placeholder="Add a title (optional)"></span>
            <ul class="dropdown-menu">
                <li><a href="">Note</a></li>
                <li><a href="">Aside</a></li>
                <li><a href="">Warning</a></li>
                <li><a href="">Tip</a></li>
                <li><a href="">Important</a></li>
            </ul>
        </div>
	'''

	#element.find('[semantic-editable]').aloha();
	#element.find('[placeholder]').blur();
	Plugin.create('note', {
		init: () ->
			semanticBlock.activateHandler('note', (element) ->
				titleElement = element.children('.title')

				if titleElement.length
					title = titleElement.text()
					titleElement.remove()
				else
					title = ""

				if element.data('type')
					type = element.data('type')
				else
					type = "note"

				titleContainer = jQuery(TITLE_CONTAINER)
				titleContainer.find('.title').text(title)
				titleContainer.find('.type').text(type)
				titleContainer.prependTo(element)
				titleContainer.children('.title').aloha()
				element.children('.body').aloha()

			)
			semanticBlock.deactivateHandler('note', (element) ->
				title = element.children('.title-container').children('.title').text()
				element.children('.title-container').remove()
				jQuery("<div>").addClass('title').text(title).prependTo(element)
				element.children('.body').mahalo()
			)
			UI.adopt 'insertNote', Button,
				click: (a, b, c) ->
					semanticBlock.insertAtCursor(TEMPLATE)
		})
