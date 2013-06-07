define [
  'aloha'
  'aloha/plugin'
  'jquery'
  'aloha/ephemera'
  'ui/ui'
  'ui/button'
  'semanticblock/semanticblock-plugin'
  'css!note/css/note-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

  TYPE_CONTAINER = jQuery '''
      <span class="type-container dropdown aloha-ephemera">
          <a class="type" data-toggle="dropdown"></a>
          <ul class="dropdown-menu">
          </ul>
      </span>
  '''

  # Find all classes that could mean something is "notish"
  # so they can be removed when the type is changed from the dropdown.
  notishClasses = {}

  Plugin.create 'note',
    # Default Settings
    # -------
    # The plugin can listen to various classes that should "behave" like a note.
    # For each notish element provide a:
    # - `label`: **Required** Shows up in dropdown
    # - `cls` :  **Required** The classname to enable this plugin on
    # - `hasTitle`: **Required** `true` if the element allows optional titles
    # - `type`: value in the `data-type` attribute.
    # - `tagName`: Default: `div`. The HTML element name to use when creating a new note
    # - `titleTagName`: Default: `div`. The HTML element name to use when creating a new title
    #
    # For example, a Warning could look like this:
    #
    #     { label:'Warning', cls:'note', hasTitle:false, type:'warning'}
    #
    # Then, when the user selects "Warning" from the dropdown the element's
    # class and type will be changed and its `> .title` will be removed.
    defaults: [
      { label: 'Note', cls: 'note', hasTitle: true }
    ]
    init: () ->
      # Load up specific classes to listen to or use the default
      types = @settings
      jQuery.each types, (i, type) =>
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

        notishClasses[className] = true


        newTemplate = jQuery("<#{tagName}></#{tagName}")
        newTemplate.addClass(className)
        newTemplate.attr('data-type', typeName) if typeName
        if hasTitle
          newTemplate.append("<#{titleTagName} class='title'></#{titleTagName}")

        semanticBlock.activateHandler(selector, ($element) =>
          type = $element.attr('data-type') or className

          $title = $element.children('.title')
          $title.attr('placeholder', 'Add a title (optional)')
          $title.aloha()

          $body = $element.contents().not($title)

          typeContainer = TYPE_CONTAINER.clone()
          # Add dropdown elements for each possible type
          jQuery.each @settings, (i, foo) =>
            $option = jQuery('<li><a href=""></a></li>')
            $option.appendTo(typeContainer.find('.dropdown-menu'))
            $option = $option.children('a')
            $option.text(foo.label)
            $option.on 'click', =>
              # Remove the title if this type does not have one
              if foo.hasTitle
                # If there is no `.title` element then add one in and enable it as an Aloha block
                if not $element.children('.title')[0]
                  $newTitle = jQuery("<#{foo.titleTagName or 'span'} class='title'></#{foo.titleTagName or 'span'}")
                  $element.append($newTitle)
                  $newTitle.aloha()

              else
                $element.children('.title').remove()

              # Remove the `data-type` if this type does not have one
              if foo.type
                $element.attr('data-type', foo.type)
              else
                $element.removeAttr('data-type')

              # Remove all notish class names and then add this one in
              for key of notishClasses
                $element.removeClass key
              $element.addClass(foo.cls)


          typeContainer.find('.type').text(label)
          typeContainer.prependTo($element)

          # Create the body and add some placeholder text
          $('<div>').addClass('body')
          .attr('placeholder', "Type the text of your #{className} here.")
          .append($body)
          .appendTo($element)
          .aloha()
        )
        semanticBlock.deactivateHandler(selector, ($element) ->
          $body = $element.children('.body')
          $body = $body.children()

          $element.children('.body').remove()

          if hasTitle
            $title = $element.children('.title')
            if not $title[0]
              $title = jQuery("<#{titleTagName}></#{titleTagName}>")
              $title.addClass 'title'

              $title.prependTo($element)

          $element.append($body)
        )
        # Add a listener
        UI.adopt "insert-#{className}#{typeName}", Button,
          click: -> semanticBlock.insertAtCursor(newTemplate.clone())

        # For legacy toolbars listen to 'insertNote'
        if 'note' == className and not typeName
          UI.adopt "insertNote", Button,
            click: -> semanticBlock.insertAtCursor(newTemplate.clone())
