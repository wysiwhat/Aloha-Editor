define [
  'aloha'
  'aloha/plugin'
  'jquery'
  'aloha/ephemera'
  'ui/ui'
  'ui/button'
  'semanticblock/semanticblock-plugin'
  'css!equation/css/equation-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

  TEMPLATE = '<div class="equation"></div>'

  Plugin.create 'equation',
    init: () ->
      semanticBlock.activateHandler '.equation', ($element) ->
        $element.aloha()
      semanticBlock.deactivateHandler '.equation', ($element) ->
        $element.aloha()

      # Add a listener
      UI.adopt "insert-equation", Button,
        click: (e) -> e.preventDefault(); semanticBlock.insertAtCursor(jQuery(TEMPLATE))
      UI.adopt "insertNote", Button,
        click: (e) -> e.preventDefault(); semanticBlock.insertAtCursor(jQuery(TEMPLATE))
