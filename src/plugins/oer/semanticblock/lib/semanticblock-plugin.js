define(
['aloha', 'block/blockmanager', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'css!semanticblock/css/semanticblock-plugin.css'],
function(Aloha, BlockManager, Plugin, pluginManager, jQuery, Ephemera, UI, Button) {

    // hack to accomodate multiple executions
    if (pluginManager.plugins.semanticblock) {
        return pluginManager.plugins.semanticblock;
    }

	var blockTemplate = jQuery("<div class=\"semantic-container\"></div>"),
        blockControls = jQuery("<div class=\"semantic-controls\"><button class=\"semantic-delete\"><i class=\"icon-remove\"></i></button><button><i class=\"icon-cog\"></i></button></div>"),
        blockDragHelper = jQuery("<div class=\"semantic-drag-helper\"><div class=\"title\"></div><div class=\"body\">Drag me to the desired location in the document</div></div>"),
        activateHandlers = {},
        deactivateHandlers = {},
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
                callback: function(e) {
                    e.preventDefault();
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
                selector: '.semantic-block',
                callback: function() {
                    activate($(this));
                }
            },
            {
                name: 'mouseleave',
                selector: '.semantic-container',
                callback: function() {
                    if (!$(this).data('dragging')) {
                        deactivate($(this).children('.semantic-block'));
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
                selector: '[placeholder]',
                callback: function() { 
                    $(this).removeClass('placeholder');
                    if ($(this).attr('placeholder') == $(this).text()) {
                        $(this).text('');
                    }
                }
            },
            {
                name: 'blur',
                selector: '[placeholder]',
                callback: function() {
                    if (!$(this).text()) {
                        $(this).text($(this).attr('placeholder'));
                        $(this).addClass('placeholder');
                    }
                }
            },
            {
                name: 'click',
                selector: '.semantic-block .title-container li a',
                callback: function(e) {
                    e.preventDefault();
                    $(this).parents('.title-container').first().children('.type').text($(this).text());
                    $(this).parents('.semantic-block').first().attr('data-type', $(this).text().toLowerCase());
                }
            }
        ];
   
    var insertElement = function(element) {
        },
        activate = function(element) {
            if (!element.parent('.semantic-container').length) {
                element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock();

                var type;
                for (type in activateHandlers) {
                    if (element.hasClass(type)) {
                        activateHandlers[type](element);
                        break;
                    }
                }
            }
        },
        deactivate = function(element) {
            if (element.parent('.semantic-container').length) {

                element.find('[placeholder]').trigger('click');

                var type;
                for (type in deactivateHandlers) {
                    if (element.hasClass(type)) {
                        deactivateHandlers[type](element);
                        break;
                    }
                }

                element.siblings('.semantic-controls').remove();
                BlockManager.getBlock(element.parent('.semantic-container').get(0)).unblock();
                element.unwrap();
            }
        },
        register = function(element) {
            element.addClass('semantic-block');
        },
        crawl = function(elements) {
            jQuery('.note').not('.semantic-block').each(function() {
                if (!$(this).parents('.semantic-drag-source').length) {
                    register($(this));
                }
            });            
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
        };

	Aloha.ready(function() {

        $('.semantic-drag-source').children().each(function() {
            var element = $(this); 

            element.draggable({
                connectToSortable: $('#canvas'),
                revert: 'invalid',
                helper: function() {
                    var helper = $(blockDragHelper).clone();
                    helper.find('.title').text('im a helper');
                    return helper;
                },
                start: function(e, ui) {
                    $('#canvas').addClass('aloha-block-dropzone');
                    $(ui.helper).addClass('dragging');
                },
                stop: function(e, ui) {
                    $('#canvas').removeClass('aloha-block-dropzone');
                    crawl();
                },
                refreshPositions: true
            });
        });

        bindEvents($(document));
    });

    Aloha.bind('aloha-editable-created', function() {
        crawl();
    });

    return Plugin.create('semanticblock', {
        insertAtCursor: function(template) {
            var element = blockTemplate.clone().append(template),
                range = Aloha.Selection.getRangeObject();
          
            element.addClass('semantic-temp');

            GENTICS.Utils.Dom.insertIntoDOM(element, range, Aloha.activeEditable.obj);
            
            element = Aloha.jQuery('.semantic-temp')
                .removeClass('semantic-temp');
            
            register(element);
        },
        appendElement: function(element, target) {
            element = blockTemplate.clone().append(element);

            element.addClass('semantic-temp');

            target.append(element);

            element = Aloha.jQuery('.semantic-temp')
                .removeClass('semantic-temp');
    
            register(element);            
        },
        activateHandler: function(type, handler){
            activateHandlers[type] = handler;
        },
        deactivateHandler: function(type, handler){
            deactivateHandlers[type] = handler;
        },
        registerEvent: function(name, selector, callback) {
            pluginEvents.push({
                name: name,
                selector: selector,
                callback: callback
            });
        }
    });

});
