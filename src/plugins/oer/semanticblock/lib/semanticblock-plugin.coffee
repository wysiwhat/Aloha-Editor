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
    name: 'mouseover'
    selector: '.aloha-oer-block'
    callback: ->
      activate jQuery(this)
  ,
    name: 'mouseleave'
    selector: '.semantic-container'
    callback: ->
      deactivate jQuery(this).children('.aloha-oer-block')  unless jQuery(this).data('dragging')
  ,
    name: 'click'
    selector: '.semantic-container .semantic-delete'
    callback: (e) ->
      e.preventDefault()
      jQuery(this).parents('.semantic-container').first().slideUp 'slow', ->
        jQuery(this).remove()

  ,
    name: 'click'
    selector: '[placeholder]'
    callback: ->
      jQuery(this).removeClass 'placeholder'
      jQuery(this).text ''  if jQuery(this).attr('placeholder') is jQuery(this).text()
  ,
    name: 'blur'
    selector: '[placeholder]'
    callback: ->
      unless jQuery(this).text()
        jQuery(this).text jQuery(this).attr('placeholder')
        jQuery(this).addClass 'placeholder'
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
      element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock()
      type = undefined
      for type of activateHandlers
        if element.hasClass(type)
          activateHandlers[type] element
          break

  deactivate = (element) ->
    if element.parent('.semantic-container').length
      element.find('[placeholder]').trigger 'click'
      type = undefined
      for type of deactivateHandlers
        if element.hasClass(type)
          deactivateHandlers[type] element
          break
      element.siblings('.semantic-controls').remove()
      BlockManager.getBlock(element.parent('.semantic-container').get(0)).unblock()
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
    jQuery('.semantic-drag-source').children().each ->
      element = jQuery(this)
      element.draggable
        connectToSortable: jQuery('#canvas')
        revert: 'invalid'
        helper: ->
          helper = jQuery(blockDragHelper).clone()
          helper.find('.title').text 'im a helper'
          helper

        start: (e, ui) ->
          jQuery('#canvas').addClass 'aloha-block-dropzone'
          jQuery(ui.helper).addClass 'dragging'

        refreshPositions: true


    bindEvents jQuery(document)

  Plugin.create 'semanticblock',

    init: ->
      Aloha.bind 'aloha-editable-created', (e, params) =>
        $root = params.obj
        # Add a `.aloha-oer-block` to all registered classes
        classes = []
        classes.push ".#{cls}" for cls of activateHandlers
        $root.find(classes.join()).each (i, el) ->
          $el = jQuery(el)
          $el.addClass 'aloha-oer-block' if not $el.parents('.semantic-drag-source')[0]
        
        if $root.is('.aloha-block-blocklevel-sortable') and not $root.parents('.aloha-editable').length
          $root.sortable 'option', 'stop', (e, ui) ->
            $el = jQuery(ui.item)
            $el.addClass 'aloha-oer-block'

    insertAtCursor: (template) ->
      element = blockTemplate.clone().append(template)
      range = Aloha.Selection.getRangeObject()
      element.addClass 'semantic-temp'
      GENTICS.Utils.Dom.insertIntoDOM element, range, Aloha.activeEditable.obj
      element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp')
      element.addClass 'aloha-oer-block'

    appendElement: (element, target) ->
      element = blockTemplate.clone().append(element)
      element.addClass 'semantic-temp'
      target.append element
      element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp')
      element.addClass 'aloha-oer-block'

    activateHandler: (type, handler) ->
      activateHandlers[type] = handler

    deactivateHandler: (type, handler) ->
      deactivateHandlers[type] = handler

    registerEvent: (name, selector, callback) ->
      pluginEvents.push
        name: name
        selector: selector
        callback: callback

