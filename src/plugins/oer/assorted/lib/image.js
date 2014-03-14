// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'jquery', 'aloha/plugin', 'image/image-plugin', 'ui/ui', 'figure/figure-plugin', 'css!assorted/css/image.css'], function(Aloha, jQuery, AlohaPlugin, Image, UI, Figure) {
    var DIALOG_HTML, DIALOG_HTML2, DIALOG_HTML_CONTAINER, WARNING_IMAGE_PATH, initialize, insertImage, setEditText, setThankYou, showCreateDialog, showEditDialog, showModalDialog2;
    WARNING_IMAGE_PATH = '/../plugins/oer/assorted/img/warning.png';
    DIALOG_HTML_CONTAINER = '<form class="plugin image modal hide fade form-horizontal" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false" />';
    DIALOG_HTML = '<div class="modal-header">\n  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n  <h3>Insert image</h3>\n</div>\n<div class="modal-body">\n  <div class="image-options">\n      <div class="image-selection">\n        <div class="dia-alternative">\n          <span class="upload-image-link btn-link">Choose an image to upload</span>\n          <input type="file" class="upload-image-input">\n        </div>\n        <div class="dia-alternative">\n          OR\n        </div>\n        <div class="dia-alternative">\n          <span class="upload-url-link btn-link">get image from the Web</span>\n          <input type="url" class="upload-url-input" placeholder="Enter URL of image ...">\n        </div>\n      </div>\n      <div class="placeholder preview hide">\n        <img class="preview-image"/>\n      </div>\n  </div>\n  <div class="image-alt">\n    <div class="forminfo">\n      <i class="icon-warning"></i><strong>Describe the image for someone who cannot see it.</strong> This description can be read aloud, making it possible for visually impaired learners to understand the content.</strong>\n    </div>\n    <div>\n      <textarea name="alt" placeholder="Enter description ..." rows="3"></textarea>\n    </div>\n  </div>\n</div>\n<div class="modal-footer">\n  <button class="btn action cancel">Cancel</button>\n  <button type="submit" disabled="true" class="btn btn-primary action insert">Next</button>\n</div>';
    DIALOG_HTML2 = '<div class="modal-header">\n  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n  <h3>Insert image</h3>\n</div>\n<div class="modal-body">\n  <div>\n    <strong>Source for this image (Required)</strong>\n  </div>\n  <div class="source-selection">\n    <ul style="list-style-type: none; padding: 0; margin: 0;">\n      <li id="listitem-i-own-this">\n        <label class="radio">\n          <input type="radio" name="image-source-selection" value="i-own-this">I own it (no citation needed) \n        </label>\n      </li>\n      <li id="listitem-i-got-permission">\n        <label class="radio">\n          <input type="radio" name="image-source-selection" value="i-got-permission">I am allowed to reuse it: \n        </label>\n        <div class="source-selection-allowed">\n          <fieldset>\n            <label>Who is the original author of this image?</label>\n            <input type="text" disabled="disabled" id="reuse-author">\n\n            <label>What organization owns this image?</label>\n            <input type="text" disabled="disabled" id="reuse-org">\n\n            <label>What is the original URL of this image?</label>\n            <input type="text" disabled="disabled" id="reuse-url" placeholder="http://">\n\n            <label>Permission to reuse</label>\n            <select id="reuse-license" disabled="disabled">\n              <option value="">Choose a license</option>\n              <option value="http://creativecommons.org/licenses/by/3.0/">\n                Creative Commons Attribution - CC-BY</option>\n              <option value="http://creativecommons.org/licenses/by-nd/3.0/">\n                Creative Commons Attribution-NoDerivs - CC BY-ND</option>\n              <option value="http://creativecommons.org/licenses/by-sa/3.0/">\n                Creative Commons Attribution-ShareAlike - CC BY-SA</option>\n              <option value="http://creativecommons.org/licenses/by-nc/3.0/">\n                Creative Commons Attribution-NonCommercial - CC BY-NC</option>\n              <option value="http://creativecommons.org/licenses/by-nc-sa/3.0/">\n                Creative Commons Attribution-NonCommercial-ShareAlike - CC BY-NC-SA</option>\n              <option value="http://creativecommons.org/licenses/by-nc-nd/3.0/">\n                Creative Commons Attribution-NonCommercial-NoDerivs - CC BY-NC-ND</option>\n              <option value="http://creativecommons.org/publicdomain/">\n                Public domain</option>\n              <option>other</option>\n            </select>\n          </fieldset>\n        </div>\n      </li>\n      <li id="listitem-i-dont-know">\n        <label class="radio">\n          <input type="radio" name="image-source-selection" value="i-dont-know">I don\'t know (skip citation for now)\n        </label>\n      </li>\n    </ul>\n  </div>\n</div>\n<div class="modal-footer">\n  <button type="submit" class="btn btn-primary action insert">Save</button>\n  <button class="btn action cancel">Cancel</button>\n</div>';
    showEditDialog = function($el) {
      var deferred, dialog,
        _this = this;
      dialog = jQuery(DIALOG_HTML_CONTAINER);
      dialog.append(jQuery(DIALOG_HTML));
      dialog.find('.image-options').remove();
      dialog.find('.btn.action.attribution').show();
      dialog.find('[name=alt]').val($el.attr('alt'));
      dialog.find('.btn.action.insert').text('Save').removeAttr('disabled');
      deferred = $.Deferred();
      dialog.find('.btn.action.attribution').click(function() {
        return deferred.done(function() {
          return showModalDialog2($el);
        });
      });
      dialog.on('submit', function(evt) {
        evt.preventDefault();
        setEditText($el);
        if (dialog.find('[name=alt]').val() && !$el.attr('alt')) {
          setThankYou($el);
        }
        $el.attr('alt', dialog.find('[name=alt]').val());
        dialog.modal('hide');
        return deferred.resolve($el);
      });
      dialog.on('shown', function() {
        return dialog.find('input,textarea,select').filter(':visible').first().focus();
      });
      dialog.on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        deferred.reject();
        return dialog.modal('hide');
      });
      dialog.modal({
        show: true
      });
      return deferred.promise();
    };
    showCreateDialog = function() {
      var $imageselect, $placeholder, $submit, $uploadImage, $uploadUrl, deferred, dialog, imageSource, loadLocalFile, setImageSource, settings, showRemoteImage,
        _this = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      dialog = jQuery(DIALOG_HTML_CONTAINER);
      dialog.append(jQuery(DIALOG_HTML));
      $submit = dialog.find('.action.insert');
      $imageselect = dialog.find('.image-selection');
      $placeholder = dialog.find('.placeholder.preview');
      $uploadImage = dialog.find('.upload-image-input').hide();
      $uploadUrl = dialog.find('.upload-url-input').hide();
      $submit = dialog.find('.action.insert');
      imageSource = null;
      (function(img, baseurl) {
        return img.onerror = function() {
          var errimg;
          errimg = baseurl + WARNING_IMAGE_PATH;
          if (img.src !== errimg) {
            return img.src = errimg;
          }
        };
      })(dialog.find('.placeholder.preview img')[0], Aloha.settings.baseUrl);
      setImageSource = function(href) {
        imageSource = href;
        return $submit.removeAttr('disabled');
      };
      loadLocalFile = function(file, $img, callback) {
        var reader;
        reader = new FileReader();
        reader.onloadend = function() {
          if ($img) {
            $img.attr('src', reader.result);
          }
          setImageSource(reader.result);
          if (callback) {
            return callback(reader.result);
          }
        };
        return reader.readAsDataURL(file);
      };
      dialog.find('.upload-image-link').on('click', function() {
        $placeholder.hide();
        $uploadUrl.hide();
        return $uploadImage.click();
      });
      dialog.find('.upload-url-link').on('click', function() {
        $placeholder.hide();
        $uploadImage.hide();
        return $uploadUrl.show().focus();
      });
      $uploadImage.on('change', function() {
        var $previewImg, files;
        files = $uploadImage[0].files;
        if (files.length > 0) {
          if (settings.image.preview) {
            $previewImg = $placeholder.find('img');
            loadLocalFile(files[0], $previewImg);
            $placeholder.show();
            return $imageselect.hide();
          } else {
            return loadLocalFile(files[0]);
          }
        }
      });
      showRemoteImage = function() {
        var $previewImg, url;
        $previewImg = $placeholder.find('img');
        url = $uploadUrl.val();
        setImageSource(url);
        if (settings.image.preview) {
          $previewImg.attr('src', url);
          $placeholder.show();
          return $imageselect.hide();
        }
      };
      $uploadUrl.on('change', showRemoteImage);
      $uploadUrl.on('keydown', null, 'return', function(e) {
        e.preventDefault();
        return showRemoteImage();
      });
      deferred = $.Deferred();
      dialog.on('submit', function(evt) {
        var $el;
        evt.preventDefault();
        $el = $('<img>');
        $el.attr('src', imageSource);
        $el.attr('alt', dialog.find('[name=alt]').val());
        dialog.modal('hide');
        return deferred.resolve($el);
      });
      dialog.on('shown', function() {
        return dialog.find('input,textarea,select').filter(':visible').first().focus();
      });
      dialog.on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        deferred.reject();
        return dialog.modal('hide');
      });
      dialog.modal({
        show: true
      });
      return deferred.promise();
    };
    showModalDialog2 = function($img) {
      var $dialog, $option, basedOnURL, creator, deferred, publisher, rightsUrl, src,
        _this = this;
      $dialog = jQuery(DIALOG_HTML_CONTAINER);
      $dialog.append(jQuery(DIALOG_HTML2));
      src = $img.attr('src');
      if (src && /^http/.test(src)) {
        $dialog.find('input#reuse-url').val(src);
      }
      creator = $img.attr('data-lrmi-creator');
      if (creator) {
        $dialog.find('input#reuse-author').val(creator);
      }
      publisher = $img.attr('data-lrmi-publisher');
      if (publisher) {
        $dialog.find('input#reuse-org').val(publisher);
      }
      basedOnURL = $img.attr('data-lrmi-isBasedOnURL');
      if (basedOnURL) {
        $dialog.find('input#reuse-url').val(basedOnURL);
      }
      rightsUrl = $img.attr('data-lrmi-useRightsURL');
      if (rightsUrl) {
        $option = $dialog.find('select#reuse-license option[value="' + rightsUrl + '"]');
        if ($option) {
          $option.prop('selected', true);
        }
      }
      if (creator || publisher || rightsUrl) {
        $dialog.find('input[value="i-got-permission"]').prop('checked', true);
      }
      $dialog.find('input[type=radio]').click();
      $dialog.find('input[name="image-source-selection"]').click(function(evt) {
        var inputs;
        inputs = jQuery('.source-selection-allowed').find('input,select');
        if (jQuery(this).val() === 'i-got-permission') {
          inputs.removeAttr('disabled');
        } else {
          inputs.attr('disabled', 'disabled');
        }
        evt.stopPropagation();
      });
      $dialog.find('li#listitem-i-own-this, li#listitem-i-got-permission, li#listitem-i-dont-know').click(function(evt) {
        var $cb, $current_target;
        $current_target = jQuery(evt.currentTarget);
        $cb = $current_target.find('input[name="image-source-selection"]');
        if ($cb) {
          $cb.click();
        }
      });
      deferred = $.Deferred();
      $dialog.off('submit').on('submit', function(evt) {
        var attribution, buildAttribution, editableId, rightsName;
        evt.preventDefault();
        buildAttribution = function(creator, publisher, basedOnURL, rightsName) {
          var attribution, baseOn, baseOnEscaped;
          attribution = "";
          if (creator && creator.length > 0) {
            attribution += "Image by " + creator + ".";
          }
          if (publisher && publisher.length > 0) {
            attribution += "Published by " + publisher + ".";
          }
          if (basedOnURL && basedOnURL.length > 0) {
            baseOn = '<link src="' + basedOnURL + '">Original source</link>.';
            baseOnEscaped = jQuery('<div />').text(baseOn).html();
            attribution += baseOn;
          }
          if (rightsName && rightsName.length > 0) {
            attribution += 'License: ' + rightsName + ".";
          }
          return attribution;
        };
        if ($dialog.find('input[value="i-got-permission"]').prop('checked')) {
          creator = $dialog.find('input#reuse-author').val();
          if (creator && creator.length > 0) {
            $img.attr('data-lrmi-creator', creator);
          } else {
            $img.removeAttr('data-lrmi-creator');
          }
          publisher = $dialog.find('input#reuse-org').val();
          if (publisher && publisher.length > 0) {
            $img.attr('data-lrmi-publisher', publisher);
          } else {
            $img.removeAttr('data-lrmi-publisher');
          }
          basedOnURL = $dialog.find('input#reuse-url').val();
          if (basedOnURL && basedOnURL.length > 0) {
            $img.attr('data-lrmi-isBasedOnURL', basedOnURL);
          } else {
            $img.removeAttr('data-lrmi-isBasedOnURL');
          }
          $option = $dialog.find('select#reuse-license :selected');
          rightsUrl = $option.attr('value');
          rightsName = $.trim($option.text());
          if (rightsUrl && rightsUrl.length > 0) {
            $img.attr('data-lrmi-useRightsURL', rightsUrl);
          } else {
            $img.removeAttr('data-lrmi-useRightsURL');
          }
          attribution = buildAttribution(creator, publisher, basedOnURL, rightsName);
          if (attribution && attribution.length > 0) {
            $img.attr('data-tbook-permissionText', attribution);
          } else {
            $img.removeAttr('data-tbook-permissionText');
          }
        } else {
          $img.removeAttr('data-lrmi-creator');
          $img.removeAttr('data-lrmi-publisher');
          $img.removeAttr('data-lrmi-isBasedOnURL');
          $img.removeAttr('data-lrmi-useRightsURL');
          $img.removeAttr('data-tbook-permissionText');
        }
        editableId = $img.parents('.aloha-editable').last().attr('id');
        Aloha.getEditableById(editableId).smartContentChange({
          type: 'block-change'
        });
        deferred.resolve($img);
        return $dialog.modal('hide');
      });
      $dialog.off('click').on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        deferred.reject($img);
        return $dialog.modal('hide');
      });
      $dialog.modal({
        show: true
      });
      return deferred.promise();
    };
    insertImage = function() {
      var marker;
      marker = Figure.insertPlaceholder();
      return showCreateDialog().then(function(image) {
        Figure.insertOverPlaceholder(image, marker);
        return showModalDialog2(image);
      });
    };
    $('body').bind('aloha-image-resize', function() {
      return Aloha.activeEditable.smartContentChange({
        type: 'block-change'
      });
    });
    setThankYou = function($img) {
      var editDiv, wrapper;
      wrapper = $img.parents('.image-wrapper').first();
      if (!wrapper.length) {
        return;
      }
      editDiv = wrapper.children('.image-edit');
      editDiv.html('<i class="icon-edit"></i> Thank You!').removeClass('passive');
      editDiv.addClass('thank-you');
      return editDiv.animate({
        opacity: 0
      }, 2000, 'swing', function() {
        return setEditText($img);
      });
    };
    setEditText = function($img) {
      var alt, editDiv, wrapper;
      wrapper = $img.parents('.image-wrapper').first();
      if (!wrapper.length) {
        return;
      }
      alt = wrapper.children('img').attr('alt');
      editDiv = wrapper.children('.image-edit').removeClass('thank-you').css('opacity', 1);
      if (alt) {
        return editDiv.html('<i class="icon-edit"></i>').addClass('passive');
      } else {
        editDiv.html('<i class="icon-warning"></i><span class="warning-text">Description missing</span>').removeClass('passive');
        editDiv.off('mouseenter').on('mouseenter', function(e) {
          return editDiv.find('.warning-text').text('Image is missing a description for the visually impaired. Click to provide one.');
        });
        return editDiv.off('mouseleave').on('mouseleave', function(e) {
          return editDiv.find('.warning-text').text('Description missing');
        });
      }
    };
    initialize = function($img) {
      var edit, wrapper;
      wrapper = $('<div class="image-wrapper aloha-ephemera-wrapper">');
      edit = $('<div class="image-edit aloha-ephemera">');
      $img.wrap(wrapper).parent().prepend(edit);
      return setEditText($img);
    };
    return AlohaPlugin.create('oer-image', {
      init: function() {
        var plugin;
        plugin = this;
        UI.adopt('insertImage-oer', null, {
          click: function(e) {
            return insertImage.bind(plugin)(e);
          }
        });
        $(document).on('mouseover', 'img', function() {
          if (!$(this).parent().is('.image-wrapper') && $(this).parents('.aloha-root-editable').length) {
            return initialize($(this));
          }
        });
        return $(document).on('click', 'figure.aloha-oer-block .image-edit', function() {
          var $img;
          $img = $(this).siblings('img');
          return showEditDialog($img);
        });
      },
      uploadImage: function(file, el, callback) {
        var f, plugin, settings, xhr;
        plugin = this;
        settings = Aloha.require('assorted/assorted-plugin').settings;
        xhr = new XMLHttpRequest();
        if (xhr.upload && settings.image.uploadurl) {
          xhr.onload = function() {
            var url;
            if (settings.image.parseresponse) {
              url = parseresponse(xhr);
            } else {
              url = JSON.parse(xhr.response).url;
            }
            return callback(url);
          };
          xhr.open("POST", settings.image.uploadurl, true);
          xhr.setRequestHeader("Cache-Control", "no-cache");
          if (settings.image.uploadSinglepart) {
            xhr.setRequestHeader("Content-Type", "");
            xhr.setRequestHeader("X-File-Name", file.name);
            return xhr.send(file);
          } else {
            f = new FormData();
            f.append(settings.image.uploadfield || 'upload', file, file.name);
            return xhr.send(f);
          }
        }
      }
    });
  });

}).call(this);
