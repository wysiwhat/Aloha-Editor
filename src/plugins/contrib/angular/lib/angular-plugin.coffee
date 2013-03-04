define [ 'aloha', 'aloha/plugin', 'jquery', 'popover', 'ui/ui', 'css!../../../contrib/angular/css/angular.css' ], (Aloha, Plugin, jQuery, Popover, UI) ->

  VARIABLE_DIALOG_HTML = '''
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
          <h4>Initial Value</h4>
          <div>
            <input id="angular-variable-value" class="input-xlarge" type="number" placeholder="Enter an initial value for the variable" required />
          </div>
        </div>
      <div class="modal-footer">
        <button class="btn btn-primary link-save">Submit</button>
        <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
      </div>
    </form>'''

  EXPRESSION_DIALOG_HTML = '''
    <form class="modal" id="angular-expression-modal" tabindex="-1" role="dialog" aria-labelledby="angular-expression-modalLabel" aria-hidden="true">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
        <h3 id="angular-expression-modalLabel">Add Variable</h3>
      </div>
      <div class="modal-body">
        <div id="link-text">
          <h4>Expression</h4>
          <div>
            <input id="angular-expression-name" class="input-xlarge" type="text" placeholder="Enter an expression here" required />
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
      # Set the variable name and value to the wrapper element
      # (so the CSS can render it)
      $input = $node.children('[ng-model]')
      $node.attr 'data-ng-model', $input.attr('ng-model')
      $node.attr 'data-ng-value', $input.val()

      $input.on 'input', ->
        val = parseFloat($input.val())
        $node.attr 'data-ng-value', val


  attachExpressionEvents = ($el) ->
    $el.alohaBlock()
    $el.each (i, node) ->
      $node = jQuery(node)

  startAngular = ($editable) ->
    # Grab the outermost editable
    $editable = $editable.last()

    $allVariables = $editable.find('.ng-model-wrapper')

    angular.bootstrap($editable)

    # UN-Squirrel away the input values since `anular.bootstrap` clears them for some reason
    $allVariables.each (i, el) =>
      $el = jQuery(el)
      $input = $el.find('input')
      $input.val($el.attr('data-ng-value') or '0')
      # Trigger that the input changed
      $input.trigger('input')


  updateExpression = ($el, expression) ->
    $el.data 'ng-expression', expression

    # Clone the old rendered element so we keep the namespace and other attributes (ie in SVG)
    $rendered = $el.find('.ng-expression-rendered').clone(true)
    $el.find('.ng-expression-rendered').remove()

    $rendered.attr('ng-bind', expression)
    .appendTo($el)

    # Re-run angular on anything that is not bound yet
    startAngular $el.parents('.aloha-editable')

  Aloha.bind 'aloha-editable-activated', (evt, ed) =>
    # Start angular on the editable area
    $app = ed.editable.obj

    # Find everything with a `[ng-model]` and wrap it in a `.ng-model-wrapper`
    $app.find('[ng-model]').each (i, el) ->
      $el = jQuery(el)
      # Skip if the input has already been wrapped
      return if $el.parent().hasClass('ng-model-wrapper')

      $wrapper = jQuery('<span></span>').addClass 'ng-model-wrapper'
      $el.replaceWith $wrapper
      $wrapper.append $el
      attachVariableEvents $wrapper

    # Find everything with a `[ng-bind]` and wrap it in a `.ng-expression-wrapper`
    $app.find('[ng-bind]').each (i, el) ->
      $el = jQuery(el)
      # Skip if the expression has already been wrapped
      return if $el.parent().hasClass('ng-expression-wrapper')

      $wrapper = jQuery('<span></span>').addClass 'ng-expression-wrapper'
      $el.replaceWith $wrapper
      $wrapper.append $el
      $wrapper.data 'ng-expression', $el.attr('ng-bind')
      attachExpressionEvents $wrapper


    # attachVariableEvents $app.find('.ng-model-wrapper')
    attachExpressionEvents $app.find('.ng-expression-wrapper')

    startAngular $app




  showVariableDialog = ($el, variableText) ->
    root = Aloha.activeEditable.obj
    dialog = jQuery(VARIABLE_DIALOG_HTML)

    # Try and prepopulate either the variable name or value
    variableValue = parseFloat(variableText)
    variableName = ''
    variableName = variableText if isNaN(variableValue) and /[a-zA-Z]+/.test(variableText)
    variableValue = 0 if isNaN(variableValue)

    $el.attr 'data-ng-value', variableValue

    $input = dialog.find('#angular-variable-name')
    $inputValue = dialog.find('#angular-variable-value')

    $input.val(variableName)
    $inputValue.val(variableValue)

    dialog.on 'submit', (evt) =>
      evt.preventDefault()

      # Set the variable name
      variableName = $input.val()
      variableValue = parseFloat($inputValue.val())
      $el.attr 'data-variable', variableName
      $el.children('input').val(variableValue)
      $el.children('input').attr('ng-model', variableName)
      dialog.modal('hide')

    dialog.modal('show')
    dialog.on 'hidden', () ->
      dialog.remove()

    setTimeout (-> $input.focus()), 100
    dialog


  showExpressionDialog = ($el, expressionText) ->
    root = Aloha.activeEditable.obj
    dialog = jQuery(EXPRESSION_DIALOG_HTML)

    $input = dialog.find('#angular-expression-name')

    $input.val(expressionText)

    dialog.on 'submit', (evt) =>
      evt.preventDefault()

      # Set the variable name
      expression = $input.val()
      $el.attr 'data-expression', expression
      $el.children().attr('ng-bind', expression)
      dialog.modal('hide')

    dialog.modal('show')
    dialog.on 'hidden', () ->
      dialog.remove()

    setTimeout (-> $input.focus()), 100
    dialog


  insertNgVariable = () ->
    $el = jQuery('<span class="ng-model-wrapper aloha-ephemera-wrapper"><input type="number"/></span>')
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
      newVariable = jQuery('<span class="ng-model-wrapper aloha-new-link"><input class="ng-model-input" type="number"/></span>')

      # If the user selected a piece of text try to use it either as the variable name or value
      range = Aloha.Selection.getRangeObject()
      variableText = if range.isCollapsed() then "" else range.getText()
      dialog = showVariableDialog(newVariable, variableText)

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
        startAngular Aloha.activeEditable.obj

  # Register the button with an action
  UI.adopt 'insertNgExpression', null,
    click: () ->
      # If the user selected a piece of text try to use it either as the variable name or value
      range = Aloha.Selection.getRangeObject()

      if range.startContainer == range.endContainer and range.startOffset == 0 and range.endOffset == range.startContainer.length
        $rendered = jQuery(range.getCommonAncestorContainer())
        $newExpression = $rendered.parent()
      else
        $newExpression = jQuery('<span class="aloha-new-link ng-expression-wrapper"><span class="ng-expression-rendered"></span></span>')


      expressionText = if range.isCollapsed() then "" else range.getText()
      dialog = showExpressionDialog($newExpression, expressionText)

      # Wait until the dialog is closed before inserting it into the DOM
      # That way if it is cancelled nothing is inserted
      dialog.on 'hidden', =>
        # The user did not hit cancel then a `ng-bind` attribute is set
        if $newExpression.children('[ng-bind]')[0]
          # If it's a new element and has not been added to the DOM then add it.
          if not $newExpression.parent()[0]
            # Extend to the whole word 1st
            if range.isCollapsed()
              # if selection is collapsed then extend to the word.
              GENTICS.Utils.Dom.extendToWord(range)

            $newExpression.addClass('aloha-new-element')
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
            $newExpression = Aloha.activeEditable.obj.find('.aloha-new-element')
            $newExpression.removeClass('aloha-new-element')

            $newExpression.alohaBlock()
          # always startAngular when `ng-bind` attribute was added
          startAngular Aloha.activeEditable.obj







  variablePopulator = ($el) ->
    $min = jQuery('<input style="width: 2em;"/>')
    $max = jQuery('<input style="width: 2em;"/>')
    $slider = jQuery('<span></span>')

    $bubble = jQuery('<span class="aloha-dialog"></span>')
    $bubble.append $min
    $bubble.append $slider
    $bubble.append $max

    $input = $el.children('[ng-model]')

    # Set the values for min/max
    min = $input.data('ng-min') or 0
    max = $input.data('ng-max') or 10
    val = Math.max(min, Math.min($el.attr('data-ng-value') or 0, max))

    $min.val(min)
    $max.val(max)

    $slider.slider
      min: min
      max: max
      value: val
      slide: (event, ui) ->
        val = ui.value
        $input.val(val)
        $input.trigger 'input'

        $el.attr 'data-ng-value', val

    $min.on 'input', ->
      val = $min.val()
      $el.data 'ng-min', val
      $slider.slider
        min: val

    $max.on 'input', ->
      val = $max.val()
      $el.data 'ng-max', val
      $slider.slider
        max: val

    return $bubble


  expressionPopulator = ($el) ->
    $expression = jQuery('<input style="width: 7em;"/>')
    $done = jQuery('<button class="btn btn-primary">Done</button>')

    $bubble = jQuery('<span class="aloha-dialog"></span>')
    $bubble.append $expression
    $bubble.append $done


    $expression.val($el.children('[ng-bind]').attr 'ng-bind')
    $done.on 'click', ->
      expression = $expression.val()
      updateExpression($el, expression)
      $el.popover 'hide'

    return $bubble


  Popover.register
    hover: false
    selector: '.ng-model-wrapper'
    populator: variablePopulator

  Popover.register
    hover: false
    selector: '.ng-expression-wrapper'
    populator: expressionPopulator
