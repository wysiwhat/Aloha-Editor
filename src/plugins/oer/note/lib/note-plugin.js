// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!note/css/note-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var TYPE_CONTAINER, notishClasses;
    TYPE_CONTAINER = jQuery('<span class="type-container dropdown aloha-ephemera">\n    <a class="type" data-toggle="dropdown"></a>\n    <ul class="dropdown-menu">\n    </ul>\n</span>');
    notishClasses = {};
    return Plugin.create('note', {
      defaults: [
        {
          label: 'Note',
          cls: 'note',
          hasTitle: true
        }
      ],
      init: function() {
        var types,
          _this = this;
        types = this.settings;
        return jQuery.each(types, function(i, type) {
          var className, hasTitle, label, newTemplate, selector, tagName, titleTagName, typeName;
          className = type.cls || (function() {
            throw 'BUG Invalid configuration of not plugin. cls required!';
          })();
          typeName = type.type;
          hasTitle = !!type.hasTitle;
          label = type.label || (function() {
            throw 'BUG Invalid configuration of not plugin. label required!';
          })();
          tagName = type.tagName || 'div';
          titleTagName = type.titleTagName || 'div';
          selector = "." + className + ":not([data-type])";
          if (typeName) {
            selector = "." + className + "[data-type='" + typeName + "']";
          }
          notishClasses[className] = true;
          newTemplate = jQuery("<" + tagName + "></" + tagName);
          newTemplate.addClass(className);
          if (typeName) {
            newTemplate.attr('data-type', typeName);
          }
          if (hasTitle) {
            newTemplate.append("<" + titleTagName + " class='title'></" + titleTagName);
          }
          semanticBlock.activateHandler(selector, function($element) {
            var $body, $title, typeContainer;
            type = $element.attr('data-type') || className;
            $title = $element.children('.title');
            $title.attr('placeholder', 'Add a title (optional)');
            $title.aloha();
            $body = $element.contents().not($title);
            typeContainer = TYPE_CONTAINER.clone();
            jQuery.each(_this.settings, function(i, foo) {
              var $option;
              $option = jQuery('<li><a href=""></a></li>');
              $option.appendTo(typeContainer.find('.dropdown-menu'));
              $option = $option.children('a');
              $option.text(foo.label);
              return $option.on('click', function() {
                var $newTitle, key;
                if (foo.hasTitle) {
                  if (!$element.children('.title')[0]) {
                    $newTitle = jQuery("<" + (foo.titleTagName || 'span') + " class='title'></" + (foo.titleTagName || 'span'));
                    $element.append($newTitle);
                    $newTitle.aloha();
                  }
                } else {
                  $element.children('.title').remove();
                }
                if (foo.type) {
                  $element.attr('data-type', foo.type);
                } else {
                  $element.removeAttr('data-type');
                }
                for (key in notishClasses) {
                  $element.removeClass(key);
                }
                return $element.addClass(foo.cls);
              });
            });
            typeContainer.find('.type').text(label);
            typeContainer.prependTo($element);
            return $('<div>').addClass('body').attr('placeholder', "Type the text of your " + className + " here.").append($body).appendTo($element).aloha();
          });
          semanticBlock.deactivateHandler(selector, function($element) {
            var $body, $title;
            $body = $element.children('.body');
            $body = $body.children();
            $element.children('.body').remove();
            if (hasTitle) {
              $title = $element.children('.title');
              if (!$title[0]) {
                $title = jQuery("<" + titleTagName + "></" + titleTagName + ">");
                $title.addClass('title');
                $title.prependTo($element);
              }
            }
            return $element.append($body);
          });
          UI.adopt("insert-" + className + typeName, Button, {
            click: function() {
              return semanticBlock.insertAtCursor(newTemplate.clone());
            }
          });
          if ('note' === className && !typeName) {
            return UI.adopt("insertNote", Button, {
              click: function() {
                return semanticBlock.insertAtCursor(newTemplate.clone());
              }
            });
          }
        });
      }
    });
  });

}).call(this);
