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
        <div class="exercise">
            <div class="title-container dropdown">
                <a class="type" data-toggle="dropdown">Exercise</a>
                <ul class="dropdown-menu">
                    <li><a href="">Exercise</a></li>
                    <li><a href="">Homework</a></li>
                    <li><a href="">Problem</a></li>
                    <li><a href="">Question</a></li>
                    <li><a href="">Task</a></li>
                </ul>
                <span class="title" semantic-editable placeholder="Add a title (optional)"></span>
            </div>
            <div class="body" semantic-editable placeholder="Type the text of your exercise here."></div>
            <div class="solution-placeholder">Click to add an Answer/Solution</div>
            <div class="solution-controlls" style="display: none">
                <a href="">[SHOW SOLUTION]</a>
            </div>
        </div>
	'''

	SOLUTION_TEMPLATE = '''
        <div class="solution">
            <div class="title-container dropdown">
                <a class="type" data-toggle="dropdown">Solution</a>
                <ul class="dropdown-menu">
                    <li><a href="">Solution</a></li>
                    <li><a href="">Answer</a></li>
                </ul>
            </div>
            <div class="body" semantic-editable placeholder="Type your solution here."></div>
            <div class="solution-controlls">
                <a href="">[HIDE SOLUTION]</a>
            </div>
        </div> 
	'''

	Plugin.create('exercise', {
		init: () ->
			semanticBlock.registerEvent('click', '.exercise .solution-placeholder', () ->
				$(this).hide()
				semanticBlock.appendElement($(SOLUTION_TEMPLATE), $(this).parent())
			)

			semanticBlock.registerEvent('click', '.exercise .semantic-delete', () ->
				$(this).parents('.semantic-container').first().siblings('.solution-placeholder').removeAttr('style')
			)

			semanticBlock.registerEvent('click', '.exercise .solution-controlls a', (e) ->
				e.preventDefault()
				controlls = $(this).parent()
				if (controlls.parent().is('.solution'))
					container = controlls.parents('.semantic-container').first()
					container.slideUp('slow', () ->
						container.siblings('.solution-controlls').show()
					)
				else
					controlls.hide()
					controlls.siblings('.semantic-container').slideDown('slow')
			)


			UI.adopt 'insertExercise', Button,
				click: (a, b, c) ->
					semanticBlock.insertAtCursor(TEMPLATE)
		})
