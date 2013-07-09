define [
  'aloha'
  'aloha/plugin'
  'jquery'
  'aloha/ephemera'
  'ui/ui'
  'ui/button'
  'semanticblock/semanticblock-plugin'
  'css!quotation/css/quotation-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

  TEMPLATE = "<div class=\"quotation\"></div>"

  Plugin.create 'quotation',
    init: () ->
      semanticBlock.activateHandler '.quotation', ($element) =>
        $element.aloha()
      semanticBlock.deactivateHandler '.quotation', ($element) ->
        $element.mahalo()
        $element.attr('class', 'quotation')

      # Add a listener
      UI.adopt "insert-quotation", Button,
        click: -> semanticBlock.insertAtCursor(jQuery(TEMPLATE))

      # For legacy toolbars listen to 'insertNote'
      UI.adopt "insertQutoation", Button,
        click: -> semanticBlock.insertAtCursor(jQuery(TEMPLATE))
