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

  Plugin.create('note', {
    init: () ->
      # Load up specific classes to listen to or use the default
      types = @settings.types
      for className, hasTitle of types

        semanticBlock.activateHandler(className, (element) ->
          if hasTitle
            titleElement = element.children('.title')

            if titleElement.length
              title = titleElement.text() # Titles may contain markup `.children` instead?
              titleElement.remove()
            else
              title = ''

          type = element.data('type') or className

          body = element.children()
          element.children().remove()

          if hasTitle
            titleContainer = jQuery(TITLE_CONTAINER)
            titleContainer.find('.title').text(title)
            titleContainer.find('.type').text(type)
            titleContainer.prependTo(element)
            titleContainer.children('.title').aloha()

          # Create the body and add some placeholder text
          $('<div>').addClass('body')
          .attr('placeholder', "Type the text of your #{className} here.")
          .append(body)
          .appendTo(element)
          .aloha()

        )
        semanticBlock.deactivateHandler(className, (element) ->
          body = element.children('.body').children()
          element.children('.body').remove()

          if hasTitle
            title = element.children('.title-container').children('.title').text()
            element.children('.title-container').remove()
            jQuery("<div>").addClass('title').text(title).prependTo(element)

          element.append(body)
        )
        # Add a listener
        UI.adopt "insert-#{className}", Button,
          click: -> semanticBlock.insertAtCursor(TEMPLATE)

        # For legacy toolbars listen to 'insertNote'
        if 'note' == className
          UI.adopt "insertNote", Button,
            click: -> semanticBlock.insertAtCursor(TEMPLATE)
    })
