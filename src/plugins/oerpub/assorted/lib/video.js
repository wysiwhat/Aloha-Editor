(function() {

  define(['aloha', 'jquery', 'popover', 'ui/ui', 'css!assorted/css/image.css'], function(Aloha, jQuery, Popover, UI) {
    var DIALOG_HTML, WARNING_IMAGE_PATH, embedder, embedders, populator, selector, showModalDialog, uploadImage, youtube_embed_code_generator, youtube_embedder, youtube_url_validator;
    WARNING_IMAGE_PATH = '/../plugins/oerpub/image/img/warning.png';
    DIALOG_HTML = '<form class="plugin video modal hide fade" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n    <h3>Insert video</h3>\n  </div>\n  <div class="modal-body">\n    <div class="image-options">\n        <input type="url" class="upload-url-input" placeholder="Enter URL of video ..."/>\n    </div>\n    <div class="image-alt">\n      <div class="forminfo">\n        Please provide a description of this video for the visually impaired.\n      </div>\n      <div>\n        <textarea name="alt" type="text" required="required" placeholder="Enter description ..."></textarea>\n      </div>\n    </div>\n  </div>\n  <div class="modal-footer">\n    <button type="submit" class="btn btn-primary action insert">Save</button>\n    <button class="btn action cancel">Cancel</button>\n  </div>\n</form>';
    embedder = function(url_validator, embed_code_generator) {
      var result, set_embed_code_generator, set_url_validator;
      this.embed_code_gen = embed_code_generator;
      this.url_validator = url_validator;
      embed_code_generator = function(url) {
        var embed_html;
        embed_html = '<p> Hello World </p>';
        return 'Validates a URL. Returns video id if URL is valide. Else returns false.\nShould be replaced with actual function. The default validates youtube URLs';
      };
      url_validator = function(url) {
        var regexp, result;
        regexp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
        return result = url.match(regexp) ? RegExp.$1 : false;
      };
      set_embed_code_generator = function(url) {
        return this.embed_code_gen = embed_code_generator;
      };
      set_url_validator = function(url) {
        return this.url_validator = url_validator;
      };
      return result = this;
    };
    youtube_url_validator = function(url) {
      var regexp, result;
      regexp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
      return result = url.match(regexp) ? RegExp.$1 : false;
    };
    youtube_embed_code_generator = function(url) {
      var embed_html, video_id;
      video_id = youtube_url_validator(url);
      embed_html = '';
      if (video_id) {
        embed_html = '<div class="multimedia-video"><iframe width="640" height="360" src="http:\/\/www.youtube.com/embed/' + video_id + '?wmode=transparent" frameborder="0" allowfullscreen></iframe></div>';
      }
      return embed_html;
    };
    youtube_embedder = new embedder(youtube_url_validator, youtube_embed_code_generator);
    embedders = [];
    embedders[0] = youtube_embedder;
    console.debug('initializing');
    showModalDialog = function($el) {
      var $placeholder, $submit, $uploadUrl, checkURL, deferred, dialog, getEmbedEle, getEmbedder, imageAltText, loadLocalFile, root, settings, setvideoSource, videoSource,
        _this = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      root = Aloha.activeEditable.obj;
      dialog = jQuery(DIALOG_HTML);
      $placeholder = dialog.find('.placeholder.preview');
      $uploadUrl = dialog.find('.upload-url-input');
      $submit = dialog.find('.action.insert');
      if ($el.is('img')) {
        videoSource = $el.attr('src');
        imageAltText = $el.attr('alt');
      } else {
        videoSource = '';
        imageAltText = '';
      }
      dialog.find('[name=alt]').val(imageAltText);
      checkURL = function(url) {
        var embedder, _i, _len;
        for (_i = 0, _len = embedders.length; _i < _len; _i++) {
          embedder = embedders[_i];
          if (embedder.url_validator(url)) return true;
        }
        return false;
      };
      console.debug('Checking');
      if (checkURL(videoSource)) {
        console.debug('Checked');
        $uploadUrl.val(videoSource);
        $uploadUrl.show();
      }
      getEmbedder = function(url) {
        var embedder, _i, _len;
        for (_i = 0, _len = embedders.length; _i < _len; _i++) {
          embedder = embedders[_i];
          if (embedder.url_validator(url)) return embedder;
        }
        return false;
      };
      setvideoSource = function(href) {
        videoSource = href;
        return $submit.removeClass('disabled');
      };
      getEmbedEle = function(url) {
        var video;
        if (!(embedder = getEmbedder(url))) {
          console.debug("Error: URL not supported");
          dialog.modal('hide');
        }
        video = jQuery(embedder.embed_code_gen(url));
        video.attr('alt', dialog.find('[name=alt]').val());
        return video;
      };
      loadLocalFile = function(file, $img, callback) {
        var reader;
        reader = new FileReader();
        reader.onloadend = function() {
          if ($img) $img.attr('src', reader.result);
          setvideoSource(reader.result);
          if (callback) return callback(reader.result);
        };
        return reader.readAsDataURL(file);
      };
      dialog.find('.upload-image-link').on('click', function(evt) {
        evt.preventDefault();
        $placeholder.hide();
        $uploadUrl.hide();
        return console.debug('Hiding placeholder url');
      });
      dialog.find('.upload-url-link').on('click', function(evt) {
        evt.preventDefault();
        $placeholder.hide();
        return $uploadUrl.show();
      });
      $uploadUrl.on('change', function() {
        var $previewImg, url;
        $previewImg = $placeholder.find('img');
        url = $uploadUrl.val();
        setvideoSource(url);
        console.debug('changing');
        if (settings.image.preview) {
          $previewImg.attr('src', url);
          return $placeholder.show();
        }
      });
      deferred = $.Deferred();
      dialog.on('submit', function(evt) {
        var video;
        evt.preventDefault();
        if ($el.is('img')) {
          $el.attr('src', videoSource);
          return $el.attr('alt', dialog.find('[name=alt]').val());
        } else {
          console.debug("Embedding the video");
          video = getEmbedEle(videoSource);
          $el.replaceWith(video);
          return dialog.modal('hide');
        }
      });
      dialog.on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        deferred.reject({
          target: $el[0]
        });
        return dialog.modal('hide');
      });
      dialog.on('hidden', function(event) {
        if (deferred.state() === 'pending') {
          deferred.reject({
            target: $el[0]
          });
        }
        return dialog.remove();
      });
      return jQuery.extend(true, deferred.promise(), {
        show: function(title) {
          if (title) dialog.find('.modal-header h3').text(title);
          return dialog.modal('show');
        }
      });
    };
    selector = 'img';
    populator = function($el, pover) {
      var $bubble, editable, href;
      editable = Aloha.activeEditable;
      $bubble = jQuery('<div class="link-popover-details">\n    <a class="change">\n      <img src="' + Aloha.settings.baseUrl + '/../plugins/oerpub/assorted/img/edit-link-03.png" />\n  <span title="Change the image\'s properties">Edit image...</span>\n</a>\n&nbsp; | &nbsp;\n<a class="remove">\n  <img src="' + Aloha.settings.baseUrl + '/../plugins/oerpub/assorted/img/unlink-link-02.png" />\n      <span title="Delete the image">Delete</span>\n    </a>\n</div>');
      href = $el.attr('src');
      $bubble.find('.change').on('click', function() {
        var promise;
        Aloha.activeEditable = editable;
        promise = showModalDialog($el);
        promise.done(function(data) {
          if (data.files.length) {
            jQuery(data.target).addClass('aloha-image-uploading');
            return uploadImage(data.files[0], function(url) {
              return jQuery(data.target).attr('src', url).removeClass('aloha-image-uploading');
            });
          }
        });
        return promise.show('Edit image');
      });
      $bubble.find('.remove').on('click', function() {
        pover.stopOne($el);
        return $el.remove();
      });
      return $bubble.contents();
    };
    uploadImage = function(file, callback) {
      var f, plugin, settings, xhr;
      plugin = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      xhr = new XMLHttpRequest();
      if (xhr.upload) {
        if (!settings.image.uploadurl) throw new Error("uploadurl not defined");
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
        f = new FormData();
        f.append(settings.image.uploadfield || 'upload', file, file.name);
        return xhr.send(f);
      }
    };
    Aloha.bind('aloha-image-selected', function(event, target) {
      var $el, nodes;
      $el = jQuery(target);
      nodes = jQuery(Aloha.activeEditable.obj).find(selector);
      nodes = nodes.not($el);
      nodes.trigger('hide');
      $el.trigger('show');
      $el.data('aloha-bubble-selected', true);
      return $el.off('.bubble');
    });
    UI.adopt('insertVideo-oer', null, {
      click: function() {
        var newEl, promise;
        newEl = jQuery('<span class="aloha-ephemera image-placeholder"> </span>');
        GENTICS.Utils.Dom.insertIntoDOM(newEl, Aloha.Selection.getRangeObject(), Aloha.activeEditable.obj);
        promise = showModalDialog(newEl);
        promise.done(function(data) {
          if (data.files.length) {
            newEl.addClass('aloha-image-uploading');
            return uploadImage(data.files[0], function(url) {
              jQuery(data.target).attr('src', url);
              return newEl.removeClass('aloha-image-uploading');
            });
          }
        });
        promise.fail(function(data) {
          var $target;
          $target = jQuery(data.target);
          if (!$target.is('img')) return $target.remove();
        });
        return promise.show();
      }
    });
    return {
      selector: selector,
      populator: populator
    };
  });

}).call(this);
