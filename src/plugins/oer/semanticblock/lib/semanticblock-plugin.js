define(
['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button'],
function(Aloha, Plugin, jQuery, Ephemera, UI, Button) {

	var blockTemplate = jQuery("<div class=\"semantic-container\"><div class=\"semantic-controlls\"><a href=\"\" class=\"semantic-delete\"><i class=\"icon-remove\"></i></a><a href=\"\"><i class=\"icon-cog\"></i></a></div></div>"),
        blockDragHelper = jQuery("<div class=\"semantic-drag-helper\"><div class=\"title\"></div><div class=\"body\">Drag me to the desired location in the document</div></div>");
   
    var insertElement = function(element) {
            var range = Aloha.Selection.getRangeObject();
          
            element.addClass('semantic-temp');

            GENTICS.Utils.Dom.insertIntoDOM(element, range, Aloha.activeEditable.obj);
            
            element = Aloha.jQuery('.semantic-temp')
                .removeClass('semantic-temp');
            
            enable(element);
        },
        enable = function(element) {
            element.find('[semantic-editable]').aloha();
            element.alohaBlock();

            bindEvents(mostSeniorEditable(element)); 
            element.find('[placeholder]').blur();
        },
        bindEvents = function(element) {
            if (element.data('noteEventsInitialized')) {
                return;
            }

            element.data('noteEventsInitialized', true);

            // drag handle
            element
                .on('mouseenter', '.aloha-block-draghandle', function() {
                    $(this).parents('.semantic-container').addClass('drag-active');
                })
                .on('mouseleave', '.aloha-block-draghandle', function() {
                    if (!$(this).data('dragging')) {
                        $(this).parents('.semantic-container').removeClass('drag-active');
                    }
                })
                .on('mousedown', '.aloha-block-draghandle', function() {
                    $(this).data('dragging', true);
                })
                .on('mouseup', '.aloha-block-draghandle', function() {
                    $(this).data('dragging', false);
                });

            // active state when hovering on a note when hovering 
            // over a nested note only the child is active 
            element
                .on('mouseover' , '.semantic-container', function() {
                    if (!$(this).find('.semantic-container.active').length) {
                        $(this).addClass('active'); 
                    }
                    $(this).parents('.semantic-container').removeClass('active');
                })
                .on('mouseleave', '.semantic-container', function() {
                    $(this).removeClass('active');
                });

            // block controlls 
            element
                .on('click', '.semantic-container .semantic-delete', function(e) {
                    e.preventDefault();
                    $(this).parents('.semantic-container').first()
                        .slideUp('slow', function() {
                            $(this).remove();
                        });
                })

            // placeholder text 
            element
                .on('click', '.semantic-container [placeholder]', function() { 
                    $(this).removeClass('placeholder');
                    if ($(this).attr('placeholder') == $(this).text()) {
                        $(this).text('');
                    }
                })
                .on('blur', '.semantic-container [placeholder]', function() {
                    if (!$(this).text()) {
                        $(this).text($(this).attr('placeholder'));
                        $(this).addClass('placeholder');
                    }
                });

            // block type selector 
            element
                .on('click' , '.semantic-container .title-container li a', function(e) {
                    e.preventDefault();
                    $(this).parents('.title-container').first().children('.type').text($(this).text());
                });

        },
        mostSeniorEditable = function(element) {
		    return element.parents('.aloha-editable').last();
        };
 
	Aloha.ready(function() {
		$('#canvas').sortable({
			'beforeStop': function(e, ui) {
                if (ui.item.is('.semantic-container')) {
                    enable(ui.item);
                }
		    }
	    });
    });

    return Plugin.create('semanticblock', {
        init: function(){
        },
        insertAtCursor: function(template) {
            insertElement(blockTemplate.clone().append(template));
        },
        enableDragToAdd: function(containerSelector, template) {

            $(containerSelector).append(blockTemplate.clone().append(template)).find('.semantic-container').draggable({
                connectToSortable: $('#canvas'),
                revert: 'invalid',
                helper: function() {
                    return $(blockDragHelper);
                },
                start: function(e, ui) {
                    $('#canvas').addClass('aloha-block-dropzone');
                    $(ui.helper).addClass('dragging');
                },
                stop: function(e, ui) {
                    $('#canvas').removeClass('aloha-block-dropzone');
                },
                refreshPositions: true
            });
        }
    });

});
