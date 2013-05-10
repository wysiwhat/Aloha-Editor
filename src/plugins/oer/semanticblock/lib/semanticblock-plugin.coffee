define ['aloha', 'block/blockmanager', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'css!semanticblock/css/semanticblock-plugin.css'], (Aloha, BlockManager, Plugin, pluginManager, jQuery, Ephemera, UI, Button) ->

  # hack to accomodate multiple executions
  return pluginManager.plugins.semanticblock  if pluginManager.plugins.semanticblock
  blockTemplate = jQuery('<div class="semantic-container"></div>')
  blockControls = jQuery('<div class="semantic-controls"><button class="semantic-delete"><i class="icon-remove"></i></button><button><i class="icon-cog"></i></button></div>')
  blockDragHelper = jQuery('<div class="semantic-drag-helper"><div class="title"></div><div class="body">Drag me to the desired location in the document</div></div>')
  activateHandlers = {}
  deactivateHandlers = {}
  pluginEvents = [
    name: 'mouseenter'
    selector: '.aloha-block-draghandle'
    callback: ->
      jQuery(this).parents('.semantic-container').addClass 'drag-active'
  ,
    name: 'mouseleave'
    selector: '.aloha-block-draghandle'
    callback: ->
      jQuery(this).parents('.semantic-container').removeClass 'drag-active'  unless jQuery(this).parents('.semantic-container').data('dragging')
  ,
    name: 'mousedown'
    selector: '.aloha-block-draghandle'
    callback: (e) ->
      e.preventDefault()
      jQuery(this).parents('.semantic-container').data 'dragging', true
  ,
    name: 'mouseup'
    selector: '.aloha-block-draghandle'
    callback: ->
      jQuery(this).parents('.semantic-container').data 'dragging', false
  ,
    name: 'click'
    selector: '.semantic-container .semantic-delete'
    callback: (e) ->
      e.preventDefault()
      jQuery(this).parents('.semantic-container').first().slideUp 'slow', ->
        jQuery(this).remove()
  ,
    name: 'mouseover'
    selector: '.semantic-container'
    callback: ->
      jQuery(this).parents('.semantic-container').removeClass('focused')
      jQuery(this).addClass('focused') unless jQuery(this).find('.focused').length
  ,
    name: 'mouseout'
    selector: '.semantic-container'
    callback: ->
      jQuery(this).removeClass('focused')
  ,
    name: 'click'
    selector: '.aloha-oer-block .title-container li a'
    callback: (e) ->
      e.preventDefault()
      jQuery(this).parents('.title-container').first().children('.type').text jQuery(this).text()
      jQuery(this).parents('.aloha-oer-block').first().attr 'data-type', jQuery(this).text().toLowerCase()
  ]
  insertElement = (element) ->

  activate = (element) ->
    unless element.parent('.semantic-container').length
      element.addClass 'aloha-oer-block'
      element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock()
      type = undefined
      for type of activateHandlers
        if element.hasClass(type)
          activateHandlers[type] element
          break

  deactivate = (element) ->
    if element.parent('.semantic-container').length
      element.removeClass 'aloha-oer-block ui-draggable'
      element.removeAttr 'style'

      type = undefined
      for type of deactivateHandlers
        if element.hasClass(type)
          deactivateHandlers[type] element
          break
      element.siblings('.semantic-controls').remove()
      element.unwrap()

  bindEvents = (element) ->
    return  if element.data('oerBlocksInitialized')
    element.data 'oerBlocksInitialized', true
    event = undefined
    i = undefined
    i = 0
    while i < pluginEvents.length
      event = pluginEvents[i]
      element.on event.name, event.selector, event.callback
      i++

  Aloha.ready ->
    bindEvents jQuery(document)

  Plugin.create 'semanticblock',

    makeClean: (content) ->
      for type of deactivateHandlers
        content.find('.aloha-oer-block.'+type).each ->
          deactivate jQuery(this)

    init: ->
      Aloha.bind 'aloha-editable-activated', (e, params) =>
        element = jQuery(params.editable.obj)
        if element.attr('placeholder')
          element.removeClass 'placeholder'
          element.text '' if element.attr('placeholder') is element.text()
      Aloha.bind 'aloha-editable-deactivated', (e, params) =>
        element = jQuery(params.editable.obj)
        if element.attr('placeholder') and element.text() == ''
          element.text element.attr('placeholder')
          element.addClass 'placeholder'
        
      Aloha.bind 'aloha-editable-created', (e, params) =>
        $root = params.obj
        # Add a `.aloha-oer-block` to all registered classes
        classes = []
        classes.push ".#{cls}" for cls of activateHandlers
        $root.find(classes.join()).each (i, el) ->
          $el = jQuery(el)
          $el.addClass 'aloha-oer-block' if not $el.parents('.semantic-drag-source')[0]
          activate $el

        if $root.is('.aloha-block-blocklevel-sortable') and not $root.parents('.aloha-editable').length

          # setting up these drag sources may break if there is more than one top level editable on the page
          jQuery('.semantic-drag-source').children().each ->
            element = jQuery(this)
            element.draggable
              connectToSortable: $root
              revert: 'invalid'
              helper: ->
                helper = jQuery(blockDragHelper).clone()
                helper.find('.title').text 'im a helper'
                helper

              start: (e, ui) ->
                $root.addClass 'aloha-block-dropzone'
                jQuery(ui.helper).addClass 'dragging'

              refreshPositions: true

          $root.sortable 'option', 'stop', (e, ui) ->
            $el = jQuery(ui.item)
            activate $el

    insertAtCursor: (template) ->
      element = blockTemplate.clone().append(template)
      range = Aloha.Selection.getRangeObject()
      element.addClass 'semantic-temp'
      GENTICS.Utils.Dom.insertIntoDOM element, range, Aloha.activeEditable.obj
      element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp')
      activate element

    appendElement: (element, target) ->
      element.addClass 'semantic-temp'
      target.append element
      element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp')
      activate element

    activateHandler: (type, handler) ->
      activateHandlers[type] = handler

    deactivateHandler: (type, handler) ->
      deactivateHandlers[type] = handler

    registerEvent: (name, selector, callback) ->
      pluginEvents.push
        name: name
        selector: selector
        callback: callback

