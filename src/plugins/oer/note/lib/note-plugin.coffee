define [
  'aloha'
  'aloha/plugin'
  'jquery'
  'aloha/ephemera'
  'ui/ui'
  'ui/button'
  'semanticblock/semanticblock-plugin'
  'css!note/css/note-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

  TITLE_CONTAINER = '''
        <div class="type-container dropdown">
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

  Plugin.create 'note',
    init: () ->
      # Load up specific classes to listen to or use the default
      types = @settings.types or {note: true}
      jQuery.each types, (i, type) ->
        className = type.cls or throw 'BUG Invalid configuration of not plugin. cls required!'
        typeName = type.type
        hasTitle = !!type.hasTitle
        label = type.label or throw 'BUG Invalid configuration of not plugin. label required!'

        # These 2 variables allow other note-ish classes
        # to define what the element name is that is generated for the note and
        # for the title.
        #
        # Maybe they could eventually be functions so titles for inline notes generate
        # a `span` instead of a `div` for example.
        tagName = type.tagName or 'div'
        titleTagName = type.titleTagName or 'div'

        selector = ".#{className}:not([data-type])"
        selector = ".#{className}[data-type='#{typeName}']" if typeName


        newTemplate = jQuery("<#{tagName}></#{tagName}")
        newTemplate.addClass(className)
        newTemplate.attr('data-type', typeName) if typeName
        if hasTitle
          newTemplate.append("<#{titleTagName} class='title'></#{titleTagName}")

        semanticBlock.activateHandler(selector, (element) ->
          if hasTitle
            titleElement = element.children('.title')

            if titleElement.length
              title = titleElement.html()
              titleElement.remove()
            else
              title = ''

          type = element.attr('data-type') or className

          body = element.children()
          element.children().remove()

          if hasTitle
            titleContainer = jQuery(TITLE_CONTAINER)
            titleContainer.find('.title').text(title)
            titleContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1) )
            titleContainer.prependTo(element)
            titleContainer.children('.title').aloha()

          # Create the body and add some placeholder text
          $('<div>').addClass('body')
          .attr('placeholder', "Type the text of your #{className} here.")
          .append(body)
          .appendTo(element)
          .aloha()
        )
        semanticBlock.deactivateHandler(selector, (element) ->
          bodyElement = element.children('.body')
          body = bodyElement.children()

          if body == bodyElement.attr('placeholder')
            body = ''

          element.children('.body').remove()

          if hasTitle
            titleElement = element.children('.type-container').children('.title')
            title = titleElement.text()

            if title == titleElement.attr('placeholder')
              title = ''

            element.children('.type-container').remove()
            jQuery("<div>").addClass('title').text(title).prependTo(element)

          element.append(body)
        )
        # Add a listener
        UI.adopt "insert-#{className}#{typeName}", Button,
          click: -> semanticBlock.insertAtCursor(newTemplate.clone())

        # For legacy toolbars listen to 'insertNote'
        if 'note' == className and not typeName
          UI.adopt "insertNote", Button,
            click: -> semanticBlock.insertAtCursor(newTemplate.clone())
