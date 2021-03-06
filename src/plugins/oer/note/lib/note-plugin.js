// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!note/css/note-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var TITLE_CONTAINER;
    TITLE_CONTAINER = '<div class="type-container dropdown">\n    <a class="type" data-toggle="dropdown"></a>\n    <span class="title" placeholder="Add a title (optional)"></span>\n    <ul class="dropdown-menu">\n        <li><a href="">Note</a></li>\n        <li><a href="">Aside</a></li>\n        <li><a href="">Warning</a></li>\n        <li><a href="">Tip</a></li>\n        <li><a href="">Important</a></li>\n    </ul>\n</div>';
    return Plugin.create('note', {
      init: function() {
        var types;
        types = this.settings.types || {
          note: true
        };
        return jQuery.map(types, function(hasTitle, className) {
          var newTemplate, tagName, titleTagName;
          tagName = 'div';
          titleTagName = 'div';
          newTemplate = jQuery("<" + tagName + "></" + tagName);
          newTemplate.addClass(className);
          newTemplate.attr('data-type', className);
          if (hasTitle) {
            newTemplate.append("<" + titleTagName + " class='title'></" + titleTagName);
          }
          semanticBlock.activateHandler(className, function(element) {
            var body, title, titleContainer, titleElement, type;
            if (hasTitle) {
              titleElement = element.children('.title');
              if (titleElement.length) {
                title = titleElement.html();
                titleElement.remove();
              } else {
                title = '';
              }
            }
            type = element.attr('data-type') || className;
            body = element.children();
            element.children().remove();
            if (hasTitle) {
              titleContainer = jQuery(TITLE_CONTAINER);
              titleContainer.find('.title').text(title);
              titleContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1));
              titleContainer.prependTo(element);
              titleContainer.children('.title').aloha();
            }
            return $('<div>').addClass('body').attr('placeholder', "Type the text of your " + className + " here.").append(body).appendTo(element).aloha();
          });
          semanticBlock.deactivateHandler(className, function(element) {
            var body, bodyElement, title, titleElement;
            bodyElement = element.children('.body');
            body = bodyElement.children();
            if (body === bodyElement.attr('placeholder')) {
              body = '';
            }
            element.children('.body').remove();
            if (hasTitle) {
              titleElement = element.children('.type-container').children('.title');
              title = titleElement.text();
              if (title === titleElement.attr('placeholder')) {
                title = '';
              }
              element.children('.type-container').remove();
              jQuery("<div>").addClass('title').text(title).prependTo(element);
            }
            return element.append(body);
          });
          UI.adopt("insert-" + className, Button, {
            click: function() {
              return semanticBlock.insertAtCursor(newTemplate.clone());
            }
          });
          if ('note' === className) {
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
