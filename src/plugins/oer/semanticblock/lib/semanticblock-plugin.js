define(
['aloha', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button'],
function(Aloha, Plugin, pluginManager, jQuery, Ephemera, UI, Button) {

    // hack to accomodate multiple executions
    if (pluginManager.plugins.semanticblock) {
        return pluginManager.plugins.semanticblock;
    }

	var blockTemplate = jQuery("<div class=\"semantic-container\"><div class=\"semantic-controlls\"><a href=\"\" class=\"semantic-delete\"><i class=\"icon-remove\"></i></a><a href=\"\"><i class=\"icon-cog\"></i></a></div></div>"),
        blockDragHelper = jQuery("<div class=\"semantic-drag-helper\"><div class=\"title\"></div><div class=\"body\">Drag me to the desired location in the document</div></div>"),
        pluginEvents = [
            {
                name: 'mouseenter',
                selector: '.aloha-block-draghandle',
                callback: function() {
                    $(this).parents('.semantic-container').addClass('drag-active');
                }
            },
            {
                name: 'mouseleave',
                selector: '.aloha-block-draghandle',
                callback: function() {
                    if (!$(this).parents('.semantic-container').data('dragging')) {
                        $(this).parents('.semantic-container').removeClass('drag-active');
                    }
                }
            },
            {
                name: 'mousedown',
                selector: '.aloha-block-draghandle',
                callback: function() {
                    $(this).parents('.semantic-container').data('dragging', true);
                }
            },
            {
                name: 'mouseup',
                selector: '.aloha-block-draghandle',
                callback: function() {
                    $(this).parents('.semantic-container').data('dragging', false);
                }
            },
            {
                name: 'mouseover',
                selector: '.semantic-container',
                callback: function() {
                    if (!$(this).find('.semantic-container.active').length) {
                        $(this).addClass('active'); 
                    }
                    $(this).parents('.semantic-container').removeClass('active');
                }
            },
            {
                name: 'mouseleave',
                selector: '.semantic-container',
                callback: function() {
                    if (!$(this).data('dragging')) {
                        $(this).removeClass('active');
                    }
                }
            },
            {
                name: 'click',
                selector: '.semantic-container .semantic-delete',
                callback: function(e) {
                    e.preventDefault();
                    $(this)
                        .parents('.semantic-container')
                        .first()
                        .slideUp('slow', function() {
                            $(this).remove();
                        });
                }
            },
            {
                name: 'click',
                selector: '.semantic-container [placeholder]',
                callback: function() { 
                    $(this).removeClass('placeholder');
                    if ($(this).attr('placeholder') == $(this).text()) {
                        $(this).text('');
                    }
                }
            },
            {
                name: 'click',
                selector: '.semantic-container [placeholder]',
                callback: function() { 
                    $(this).removeClass('placeholder');
                    if ($(this).attr('placeholder') == $(this).text()) {
                        $(this).text('');
                    }
                }
            },
            {
                name: 'blur',
                selector: '.semantic-container [placeholder]',
                callback: function() {
                    if (!$(this).text()) {
                        $(this).text($(this).attr('placeholder'));
                        $(this).addClass('placeholder');
                    }
                }
            },
            {
                name: 'click',
                selector: '.semantic-container .title-container li a',
                callback: function(e) {
                    e.preventDefault();
                    $(this).parents('.title-container').first().children('.type').text($(this).text());
                }
            }
        ];
   
    var insertElement = function(element) {
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

            var event,
                i; 
            for (i = 0; i < pluginEvents.length; i++) {
                event = pluginEvents[i];
                element.on(event.name, event.selector, event.callback);
            }
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
            var element = blockTemplate.clone().append(template),
                range = Aloha.Selection.getRangeObject();
          
            element.addClass('semantic-temp');

            GENTICS.Utils.Dom.insertIntoDOM(element, range, Aloha.activeEditable.obj);
            
            element = Aloha.jQuery('.semantic-temp')
                .removeClass('semantic-temp');
            
            enable(element);
        },
        appendElement: function(element, target) {
            element = blockTemplate.clone().append(element);

            element.addClass('semantic-temp');

            target.append(element);

            element = Aloha.jQuery('.semantic-temp')
                .removeClass('semantic-temp');
            
            enable(element);            
        },
        registerEvent: function(name, selector, callback) {
            pluginEvents.push({
                name: name,
                selector: selector,
                callback: callback
            });
        },
        enableDragToAdd: function(label, containerSelector, template) {

            var element = blockTemplate.clone().append(template).css('after', label),
                labelElement = $('<span>').text(label);

            $(containerSelector).append(labelElement);
            $(containerSelector).append(element);

            element.draggable({
                connectToSortable: $('#canvas'),
                revert: 'invalid',
                helper: function() {
                    var helper = $(blockDragHelper).clone();
                    helper.find('.title').text(label);
                    return helper;
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
