define [
	'aloha'
	'aloha/plugin'
	'jquery'
	'aloha/ephemera'
	'ui/ui'
	'ui/button'
    'semanticblock/semanticblock-plugin'
    'css!exercise/css/exercise-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

    TEMPLATE = '''
        <div class="exercise" data-type="exercise">
            <div class="problem"></div>
        </div>
	'''
    SOLUTION_TEMPLATE = '''
        <div class="solution">
        </div> 
	'''
    TYPE_CONTAINER = '''
        <div class="type-container dropdown">
            <a class="type" data-toggle="dropdown"></a>
            <ul class="dropdown-menu">
                <li><a href="">Exercise</a></li>
                <li><a href="">Homework</a></li>
                <li><a href="">Problem</a></li>
                <li><a href="">Question</a></li>
                <li><a href="">Task</a></li>
            </ul>
        </div>
    '''
    SOLUTION_TYPE_CONTAINER = '''
        <div class="type-container dropdown">
            <a class="type" data-toggle="dropdown"></a>
            <ul class="dropdown-menu">
                <li><a href="">Answer</a></li>
                <li><a href="">Solution</a></li>
            </ul>
        </div>
    '''

    Plugin.create('exercise', {
      init: () ->
        semanticBlock.activateHandler('exercise', (element) ->


          type = element.attr('data-type') or 'exercise'

          problem = element.children('.problem')
          solutions = element.children('.solution')

          element.children().remove()

          typeContainer = jQuery(TYPE_CONTAINER)
          typeContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1) )
          typeContainer.prependTo(element)

          problem
            .attr('placeholder', "Type the text of your problem here.")
            .appendTo(element)
            .aloha()

          jQuery('<div>')
            .addClass('solutions')
            .appendTo(element)

          jQuery('<div>')
            .addClass('solution-controls')
            .append('<a class="add-solution">Click here to add an answer/solution</a>')
            .append('<a class="solution-toggle"></a>')
            .appendTo(element)

          if not solutions.length
            element.children('.solution-controls').children('.solution-toggle').hide()
        )
        semanticBlock.deactivateHandler('exercise', (element) ->
          problem = element.children('.problem')
          solutions = element.children('.solutions').children()
          
          if problem.text() == problem.attr('placeholder')
            problem.text('')

          element.children().remove()

          jQuery("<div>").addClass('problem').html(problem.html()).appendTo(element)

          element.append(solutions)
        )
        semanticBlock.activateHandler('solution', (element) ->
          type = element.attr('data-type') or 'solution'

          body = element.children()
          element.children().remove()

          typeContainer = jQuery(SOLUTION_TYPE_CONTAINER)
          typeContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1) )
          typeContainer.prependTo(element)

          jQuery('<div>')
            .addClass('body')
            .append(body)
            .appendTo(element)
            .aloha()
        )
        semanticBlock.deactivateHandler('solution', (element) ->
          content = element.children('.body')
 
          element.children().remove()

          element.append(content.html())
        )
        
        UI.adopt 'insertExercise', Button,
          click: -> semanticBlock.insertAtCursor(TEMPLATE)

        semanticBlock.registerEvent('click', '.exercise .solution-controls a.add-solution', () ->
          exercise = $(this).parents('.exercise').first()
          controls = exercise.children('.solution-controls')

          controls.children('.add-solution').hide()
          controls.children('.solution-toggle').text('hide solution').show()

          semanticBlock.appendElement($(SOLUTION_TEMPLATE), exercise.children('.solutions'))
        )
        semanticBlock.registerEvent('click', '.exercise .solution-controls a.solution-toggle', () ->
          exercise = $(this).parents('.exercise').first()
          controls = exercise.children('.solution-controls')
          solutions = exercise.children('.solutions')

          solutions.slideToggle ->
            if solutions.is(':visible')
              controls.children('.solution-toggle').text('hide solution')
            else
              controls.children('.solution-toggle').text('show solution')
          
        )
        semanticBlock.registerEvent('click', '.exercise .semantic-delete', () ->
          exercise = $(this).parents('.exercise').first()
          controls = exercise.children('.solution-controls')
          controls.children('.add-solution').show()
          controls.children('.solution-toggle').hide()
        )
    })