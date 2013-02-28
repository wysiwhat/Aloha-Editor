define [ 'aloha', 'aloha/plugin', 'jquery', 'popover', 'ui/ui', 'css!../../../cnx/angular/css/angular.css' ], (Aloha, Plugin, jQuery, Popover, UI) ->

  DIALOG_HTML = '''
    <form class="modal" id="angular-variable-modal" tabindex="-1" role="dialog" aria-labelledby="angular-variable-modalLabel" aria-hidden="true">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
        <h3 id="angular-variable-modalLabel">Add Variable</h3>
      </div>
      <div class="modal-body">
        <div id="link-text">
          <h4>Variable name</h4>
          <div>
            <input id="angular-variable-name" class="input-xlarge" type="text" placeholder="Enter a variable name here" required />
          </div>
        </div>
      <div class="modal-footer">
        <button class="btn btn-primary link-save">Submit</button>
        <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
      </div>
    </form>'''

  attachVariableEvents = ($el) ->
    $el.alohaBlock()
    $el.each (i, node) ->
      $node = jQuery(node)
      $node.tooltip {title: "Variable #{$node.data 'variable'}.\nDrag to change."}
      $input = $node.children('.ng-model-input')
      $input.val($node.data('ng-value') or '0')
      $node.children('.ng-model-value').text $input.val()


    $el.on 'mousedown', (evt) =>
      $el = jQuery(evt.target)
      $el.data('startX', evt.pageX)
      $input = $el.children('.ng-model-input')
      $el.data('startValue', parseFloat($input.val() or 0))

    $el.on 'mousemove', (evt) =>
      $el = jQuery(evt.target)
      return if not $el.data('startX')
      $input = $el.children('.ng-model-input')

      diff = evt.pageX - $el.data('startX')
      startValue = $el.data('startValue')
      $input.val(diff + startValue)
      $input.trigger 'input'

    $el.on 'mouseup', (evt) =>
      $el = jQuery(evt.target)
      x = $el.data('startX', null)



  attachExpressionEvents = ($el) ->
    $el.alohaBlock()


  Aloha.bind 'aloha-editable-activated', (evt, ed) =>
    # Start angular on the editable area
    $app = ed.editable.obj

    attachVariableEvents $app.find('.ng-model-wrapper')
    attachExpressionEvents $app.find('.ng-expression-wrapper')

    $app.on 'input', '.ng-model-input', (evt) =>
      $el = jQuery(evt.target)
      $el.parent().children('.ng-model-value').text $el.val()

    $app.on 'input', '.ng-expression-input', (evt) =>
      $el = jQuery(evt.target)
      $el.parent().find('.ng-expression-rendered').remove()
      $rendered = jQuery('<span></span>')
      .addClass('ng-expression-rendered')
      .attr('ng-bind', $el.val())

      $el.parent().append($rendered)

      # Squirrel away the input values since `anular.bootstrap` clears them for some reason
      $app.find('.ng-model-wrapper input').each (i, el) =>
        $el = jQuery(el)
        $el.data('ng-value', $el.val())

      angular.bootstrap($app[0])

      # UN-Squirrel away the input values since `anular.bootstrap` clears them for some reason
      $app.find('.ng-model-wrapper input').each (i, el) =>
        $el = jQuery(el)
        $el.val($el.data('ng-value') or '0')
        # Trigger that the input changed
        $el.trigger('input')

    angular.bootstrap($app[0])




  showModalDialog = ($el) ->
      root = Aloha.activeEditable.obj
      dialog = jQuery(DIALOG_HTML)

      dialog.on 'submit', (evt) =>
        evt.preventDefault()

        # Set the variable name
        $input = dialog.find('#angular-variable-name')
        variableName = $input.val()
        $el.attr 'data-variable', variableName
        $el.children('input').attr('ng-model', variableName)
        dialog.modal('hide')

      dialog.modal('show')
      dialog.on 'hidden', () ->
        dialog.remove()
      dialog


  insertNgVariable = () ->
    $el = jQuery('<span class="ng-model-wrapper"><span class="ng-model-value"></span><input class="ng-model-input" type="number"/></span>')
    range = Aloha.Selection.getRangeObject()
    if range.isCollapsed()
      GENTICS.Utils.Dom.insertIntoDOM $el, range, Aloha.activeEditable.obj
      # Callback opens up the math editor by "clicking" on it
      $el.trigger 'show'
      makeCloseIcon($el)
    else
      # a math meta-element needs to followed by a non-breaking space in a span
      $tail = jQuery('<span class="aloha-ephemera-wrapper">&#160;</span>')
      # Assume the user highlighted ASCIIMath (by putting the text in backticks)
      variable = range.getText()
      $el.attr('data-variable', variable)
      $input = $el.children('input')
      $el.append($input)
      $el.attr('ng-model', variable)

      GENTICS.Utils.Dom.removeRange range
      GENTICS.Utils.Dom.insertIntoDOM $el.add($tail), range, Aloha.activeEditable.obj

  # Register the button with an action
  UI.adopt 'insertNgVariable', null,
    click: () ->
      newVariable = jQuery('<span class="ng-model-wrapper aloha-new-link"><span class="ng-model-value"></span><input class="ng-model-input" type="number"/></span>')
      dialog = showModalDialog(newVariable)

      # Wait until the dialog is closed before inserting it into the DOM
      # That way if it is cancelled nothing is inserted
      dialog.on 'hidden', =>

        # If the user cancelled then don't create the link
        if not newVariable.data 'variable'
          return
        # Either insert a new span around the cursor and open the box or just open the box
        range = Aloha.Selection.getRangeObject()

        # Extend to the whole word 1st
        if range.isCollapsed()
          # if selection is collapsed then extend to the word.
          GENTICS.Utils.Dom.extendToWord(range)

        if range.isCollapsed()
          # insert a link with text here
          GENTICS.Utils.Dom.insertIntoDOM newVariable,
            range,
            Aloha.activeEditable.obj
          range.startContainer = range.endContainer = newVariable.contents()[0]
          range.startOffset = 0
          range.endOffset = newVariable.text().length
        else
          GENTICS.Utils.Dom.addMarkup(range, newVariable, false)

        # addMarkup takes a template so we need to look up the inserted object
        #   and remove the marker class
        newVariable = Aloha.activeEditable.obj.find('.aloha-new-link')
        newVariable.removeClass('aloha-new-link')

        attachVariableEvents(newVariable)

  # Register the button with an action
  UI.adopt 'insertNgExpression', null,
    click: () ->
      $newExpression = jQuery('<span contenteditable="false" class="aloha-new-link ng-expression-wrapper"><input class="ng-expression-input" value="x+y"/><span class="ng-expression-rendered">{{x+y}}</span></span>')
      setExpression = ($expr, value) ->
        $expr.find('input').val(value)
        $expr.find('.ng-expression-rendered').text("{{#{value}}}")


      # Either insert a new span around the cursor and open the box or just open the box
      range = Aloha.Selection.getRangeObject()

      # Extend to the whole word 1st
      if range.isCollapsed()
        # if selection is collapsed then extend to the word.
        GENTICS.Utils.Dom.extendToWord(range)

      if range.isCollapsed()
        # insert a link with text here
        GENTICS.Utils.Dom.insertIntoDOM $newExpression,
          range,
          Aloha.activeEditable.obj
        range.startContainer = range.endContainer = $newExpression.contents()[0]
        range.startOffset = 0
        range.endOffset = $newExpression.text().length
      else
        GENTICS.Utils.Dom.addMarkup(range, $newExpression, false)

      # addMarkup takes a template so we need to look up the inserted object
      #   and remove the marker class
      $newExpression = Aloha.activeEditable.obj.find('.aloha-new-link')
      $newExpression.removeClass('aloha-new-link')

      $newExpression.alohaBlock()


  variablePopulator = ($el) ->
    $min = jQuery('<input style="width: 2em;"/>')
    $max = jQuery('<input style="width: 2em;"/>')
    $slider = jQuery('<span></span>')

    $bubble = jQuery('<span></span>')
    $bubble.append $min
    $bubble.append $slider
    $bubble.append $max

    # Set the values for min/max
    min = $el.data('min') or 0
    max = $el.data('max') or 100
    val = Math.max(min, Math.min($el.data('value') or 0, max))

    $min.val(min)
    $max.val(max)

    $slider.slider
      min: min
      max: max
      value: val
      slide: (event, ui) ->
        val = ui.value
        $input = $el.children('.ng-model-input')
        $input.val(val)
        $input.trigger 'input'

        $el.children('.ng-model-value').text(val)

    $min.on 'input', ->
      val = $min.val()
      $el.data 'min', val
      $slider.slider
        min: val

    $max.on 'input', ->
      val = $max.val()
      $el.data 'max', val
      $slider.slider
        max: val


    return $bubble


  Popover.register
    hover: false
    selector: '.ng-model-wrapper'
    populator: variablePopulator
