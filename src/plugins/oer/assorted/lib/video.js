(function() {

  define(['aloha', 'jquery', 'popover', 'ui/ui', 'css!assorted/css/image.css'], function(Aloha, jQuery, Popover, UI) {
    var CONCORD_ID, DIALOG_HTML, SLIDESHARE_ID, VIMEO_ID, YOUTUBE_ID, active_embedder, active_embedder_value, checkURL, concord_embed_code_generator, concord_embedder, concord_query_generator, concord_search_results_generator, concord_url_validator, embedder, embedders, getTimeString, lastKnownUrlId, lastWorkingEmbedder, showModalDialog, slideshare_embed_code_generator, slideshare_embedder, slideshare_query_generator, slideshare_search_results_generator, slideshare_url_validator, vimeo_embed_code_generator, vimeo_embedder, vimeo_query_generator, vimeo_search_results_generator, vimeo_url_validator, youtube_embed_code_generator, youtube_embedder, youtube_query_generator, youtube_search_results_generator, youtube_url_validator;
    embedder = function(url_validator, embed_code_generator, query_generator, search_results_generator) {
      var result;
      this.embed_code_gen = embed_code_generator;
      this.url_validator = url_validator;
      this.query_generator = query_generator;
      this.search_results_generator = search_results_generator;
      return result = this;
    };
    YOUTUBE_ID = 0;
    VIMEO_ID = 1;
    SLIDESHARE_ID = 2;
    CONCORD_ID = 3;
    lastKnownUrlId = '';
    lastWorkingEmbedder = -1;
    /* 
    
    Youtube Plugin
    */
    youtube_url_validator = function(url) {
      var regexp;
      regexp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
      if (url.match(regexp)) {
        lastKnownUrlId = RegExp.$1;
        lastWorkingEmbedder = YOUTUBE_ID;
        return RegExp.$1;
      } else {
        lastWorkingEmbedder = -1;
        return false;
      }
    };
    youtube_embed_code_generator = function(id) {
      return jQuery("<iframe style=\"width:640px; height:360px\" width=\"640\" height=\"360\" \nsrc=\"http:\/\/www.youtube.com/embed/" + id + "?wmode=transparent\" frameborder=\"0\" allowfullscreen></iframe>");
    };
    youtube_query_generator = function(queryTerms) {
      var terms;
      terms = queryTerms.split(' ');
      return 'https://gdata.youtube.com/feeds/api/videos?q=' + terms.join('+') + '&alt=json&v=2';
    };
    youtube_search_results_generator = function(responseObj) {
      var eleList, idTokens, newEntry, thumbnailHeight, thumbnailUrl, thumbnailWidth, video, videoDescription, videoId, videoLengthString, videoList, videoTitle, _i, _len;
      eleList = [];
      videoList = responseObj.feed.entry;
      for (_i = 0, _len = videoList.length; _i < _len; _i++) {
        video = videoList[_i];
        thumbnailUrl = video.media$group.media$thumbnail[0].url;
        thumbnailHeight = video.media$group.media$thumbnail[0].height;
        thumbnailWidth = video.media$group.media$thumbnail[0].width;
        videoTitle = video.title.$t;
        videoDescription = video.media$group.media$description.$t;
        videoLengthString = getTimeString(video.media$group.yt$duration.seconds);
        idTokens = video.id.$t.split(':');
        videoId = idTokens[idTokens.length - 1];
        newEntry = jQuery("<div style=\"width:100%;border-bottom: 1px solid black;\" class=\"search-result\" id=\"" + videoId + "\"><table>\n<tr><td width=20% rowspan=3><img src=\"" + thumbnailUrl + "\"/></td>\n<td><b>" + videoTitle + "</b></td></tr><tr><td>" + videoDescription + "</td></tr>\n<tr><td>Duration:" + videoLengthString + "</td></tr></table></div>");
        eleList.push(newEntry);
      }
      return eleList;
    };
    /*
    
      Vimeo Plugin
    */
    vimeo_url_validator = function(url) {
      var c, intRegex, offset, videoIdStr, _i, _len;
      if (url.indexOf('vimeo.com/') !== -1) {
        offset = url.indexOf('vimeo.com/');
        offset = offset + 10;
        videoIdStr = url.substring(offset);
        intRegex = /^[0-9]$/;
        for (_i = 0, _len = videoIdStr.length; _i < _len; _i++) {
          c = videoIdStr[_i];
          if (!intRegex.test(c)) return false;
        }
        lastKnownUrlId = videoIdStr;
        lastWorkingEmbedder = VIMEO_ID;
        return videoIdStr;
      }
      lastWorkingEmbedder = -1;
      return false;
    };
    vimeo_embed_code_generator = function(id) {
      return jQuery("<iframe style=\"width:640px; height:380px\" src=\"http://player.vimeo.com/video/" + id + "\" \nwidth=\"640\" height=\"380\" frameborder=\"0\" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>");
    };
    vimeo_query_generator = function(queryTerms) {
      var terms, url;
      terms = queryTerms.split(' ');
      url = "http://vimeo.com/api/rest/v2&format=json&method=vimeo.videos.search&oauth_consumer_key=c1f5add1d34817a6775d10b3f6821268&\noauth_nonce=da3f0c0437ad303c7cdb11c522abef4f&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1365564937&oauth_token=1bba5c6f35030672b0b4b5c8cf8ed156&\noauth_version=1.0&page=0&per_page=50&query=" + (terms.join('+')) + "&user_id=jmaxg3";
      return url;
    };
    vimeo_search_results_generator = function(responseObj) {
      return [];
    };
    /*
    
      Slideshare Plugin
    */
    slideshare_url_validator = function(inputurl, inputbox) {
      var encodedUrl;
      if (inputurl.indexOf('slideshare.net') === -1) return false;
      encodedUrl = encodeURIComponent(inputurl);
      jQuery.ajax({
        url: "http://www.slideshare.net/api/oembed/2?url=" + encodedUrl + "&format=jsonp",
        async: true,
        dataType: 'jsonp',
        success: function(result, status, statusObject) {
          var id;
          id = result.slideshow_id;
          if (inputurl === inputbox.value) {
            inputbox.className = 'validURL';
            lastKnownUrlId = id;
            lastWorkingEmbedder = SLIDESHARE_ID;
            return true;
          }
        },
        error: function(result, status, statusObject) {
          return false;
        }
      });
      lastWorkingEmbedder = -1;
      return false;
    };
    slideshare_embed_code_generator = function(id) {
      return jQuery("<iframe style=\"width:427px; height:356px\" src=\"http://www.slideshare.net/slideshow/embed_code/" + id + "\" width=\"427\" height=\"356\" frameborder=\"0\" \nmarginwidth=\"0\" marginheight=\"0\" scrolling=\"no\" style=\"border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px\" \nallowfullscreen webkitallowfullscreen mozallowfullscreen> </iframe>");
    };
    slideshare_query_generator = function(queryTerms) {
      return false;
    };
    slideshare_search_results_generator = function(responseObj) {
      return [];
    };
    /*
    
      Concord Plugin
    */
    concord_url_validator = function(url) {
      var concordLabUrl, id, offset, post;
      concordLabUrl = 'lab.concord.org/examples/interactives/embeddable.html#interactives/basic-examples/';
      if (url.indexOf(concordLabUrl) !== -1) {
        offset = url.indexOf(concordLabUrl);
        offset = offset + concordLabUrl.length;
        id = url.substring(offset);
        if (id.length > 5) {
          post = id.substring(id.length - 5);
          if (post === '.json') {
            id = id.substring(0, id.length - 5);
            lastKnownUrlId = id;
            lastWorkingEmbedder = CONCORD_ID;
            return id;
          }
        }
      }
      return false;
    };
    concord_embed_code_generator = function(id) {
      return jQuery("<iframe style=\"width:925px; height:575px\" width=\"925\" height=\"575\" frameborder=\"no\" scrolling=\"no\" \nsrc=\"http://lab.concord.org/examples/interactives/embeddable.html#interactives/basic-examples/" + id + ".json\"></iframe>");
    };
    concord_query_generator = function(queryTerms) {
      return false;
    };
    concord_search_results_generator = function(responseObj) {
      return [];
    };
    youtube_embedder = new embedder(youtube_url_validator, youtube_embed_code_generator, youtube_query_generator, youtube_search_results_generator);
    vimeo_embedder = new embedder(vimeo_url_validator, vimeo_embed_code_generator, vimeo_query_generator, vimeo_search_results_generator);
    slideshare_embedder = new embedder(slideshare_url_validator, slideshare_embed_code_generator, slideshare_query_generator, slideshare_search_results_generator);
    concord_embedder = new embedder(concord_url_validator, concord_embed_code_generator, concord_query_generator, concord_search_results_generator);
    embedders = [];
    embedders[YOUTUBE_ID] = youtube_embedder;
    embedders[VIMEO_ID] = vimeo_embedder;
    embedders[SLIDESHARE_ID] = slideshare_embedder;
    embedders[CONCORD_ID] = concord_embedder;
    active_embedder = youtube_embedder;
    active_embedder_value = 'youtube';
    checkURL = function(url, inputbox) {
      var embedder, _i, _len;
      for (_i = 0, _len = embedders.length; _i < _len; _i++) {
        embedder = embedders[_i];
        if (embedder.url_validator(url, inputbox)) return true;
      }
      return false;
    };
    DIALOG_HTML = '<form class="plugin video modal hide fade" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n    <h3>Insert video</h3>\n  </div>\n  <div class="modal-body">\n    <div class="image-options">\n        <center><input type="text" style="width:80%;" id="video-url-input" class="upload-url-input" placeholder="Enter URL of video ..."/></center>\n    </div>\n    <center>OR</center>\n    <div class="modal-body" >\n        <center><input type="text" style="width:80%;" id="video-search-input" class-"upload-url-input" placeholder="Enter search terms for your video ..."/></center>\n        <!-- <center><table><tr><td><input id=\'media-sites\' type="radio" name="video-site" value="youtube" checked>Youtube</input></td><td><input disabled id=\'media-sites\' type="radio" name="video-site" value="vimeo">Vimeo (search not working)</input></td></tr></table></center> -->\n        <center><button type="search" class="btn btn-primary action search">Search YouTube</button></center>\n    </div>\n    <div class="modal-body" >\n        <div style="border:1px solid; height:200px; width:100%; overflow-x:auto; overflow-y:scroll;" id="search-results">\n        </div>\n    </div>\n  </div>\n  <div class="modal-footer">\n    <button type="submit" class="btn btn-primary action insert">Insert</button>\n    <button class="btn action cancel">Cancel</button>\n  </div>\n</form>';
    getTimeString = function(timeInSeconds) {
      var ivalue, nHours, nMinutes, nSeconds, str;
      nHours = 0;
      nMinutes = 0;
      nSeconds = 0;
      ivalue = parseInt(timeInSeconds);
      if (ivalue > 3600) {
        nHours = Math.floor(ivalue / 3600);
        ivalue = ivalue - (3600 * nHours);
      }
      if (ivalue > 60) {
        nMinutes = Math.floor(ivalue / 60);
        ivalue = ivalue - (60 * nMinutes);
      }
      nSeconds = ivalue;
      str = '';
      if (nHours > 0) str = str + nHours.toString() + ' hours';
      if (nMinutes > 0) {
        if (str.length !== 0) str = str + ', ';
        str = str + nMinutes.toString() + ' mins';
      }
      if (nSeconds > 0) {
        if (str.length !== 0) str = str + ', ';
        str = str + nSeconds.toString() + ' secs';
      }
      return str;
    };
    showModalDialog = function($el) {
      var $placeholder, $searchResults, $searchTerms, $submit, $uploadUrl, deferred, dialog, loadLocalFile, radio, root, settings, setvideoSource, videoSource, _i, _len, _ref,
        _this = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      root = Aloha.activeEditable.obj;
      dialog = jQuery(DIALOG_HTML);
      $placeholder = dialog.find('.placeholder.preview');
      $uploadUrl = dialog.find('.upload-url-input');
      $searchTerms = dialog.find('#video-search-input');
      $searchResults = dialog.find('#search-results');
      $submit = dialog.find('.action.insert');
      dialog.find("#video-url-input")[0].onkeyup = function(event) {
        var currentVal, target, valid;
        target = event.currentTarget;
        currentVal = target.value;
        valid = checkURL(currentVal, target);
        if (valid) {
          return target.className = 'validURL';
        } else {
          return target.className = 'invalidURL';
        }
      };
      _ref = dialog.find('#media-sites');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        radio = _ref[_i];
        radio.onclick = function(event) {
          var index, radio, val, _j, _len2, _ref2, _results;
          val = event.target.value;
          if (active_embedder_value !== val) {
            index = 0;
            _ref2 = dialog.find('#media-sites');
            _results = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              radio = _ref2[_j];
              if (radio.value === val) {
                active_embedder_value = radio.value;
                active_embedder = embedders[index];
                break;
              }
              _results.push(index = index + 1);
            }
            return _results;
          }
        };
      }
      videoSource = '';
      if (checkURL(videoSource, $uploadUrl)) {
        $uploadUrl.val(videoSource);
        $uploadUrl.show();
      }
      setvideoSource = function(href) {
        videoSource = href;
        return $submit.removeClass('disabled');
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
      $uploadUrl.on('change', function() {
        var url;
        url = $uploadUrl.val();
        return setvideoSource(url);
      });
      deferred = $.Deferred();
      dialog.on('click', '.btn.btn-primary.action.insert', function(evt) {
        var child, mediaElement, video_id, _j, _len2, _ref2;
        evt.preventDefault();
        if (videoSource.length === 0) {
          _ref2 = $searchResults.children();
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            child = _ref2[_j];
            if (child.className === 'search-result-selected') {
              video_id = child.id;
              mediaElement = active_embedder.embed_code_gen(video_id);
              break;
            }
          }
        } else {
          if (lastWorkingEmbedder === -1) return;
          mediaElement = embedders[lastWorkingEmbedder].embed_code_gen(lastKnownUrlId);
        }
        AlohaInsertIntoDom(mediaElement);
        return dialog.modal('hide');
      });
      dialog.on('click', '.btn.btn-primary.action.search', function(evt) {
        var queryUrl;
        evt.preventDefault();
        queryUrl = active_embedder.query_generator($searchTerms[0].value);
        $searchResults.empty();
        $searchResults.append(jQuery('<div style="width=100%" >Searching...</div>'));
        return jQuery.get(queryUrl, function(responseObj) {
          var ele, searchElements, _j, _len2, _results;
          $searchResults.empty();
          if ((typeof responseObj) === 'string') {
            responseObj = jQuery.parseJSON(responseObj);
          }
          searchElements = active_embedder.search_results_generator(responseObj);
          _results = [];
          for (_j = 0, _len2 = searchElements.length; _j < _len2; _j++) {
            ele = searchElements[_j];
            ele[0].onclick = function(evt) {
              var child, target, targetId, _k, _len3, _ref2, _results2;
              target = evt.target;
              while (target.tagName !== 'DIV') {
                target = target.parentNode;
              }
              targetId = target.id;
              _ref2 = $searchResults.children();
              _results2 = [];
              for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
                child = _ref2[_k];
                if (child.id === targetId) {
                  _results2.push(child.className = 'search-result-selected');
                } else {
                  _results2.push(child.className = 'search-result');
                }
              }
              return _results2;
            };
            _results.push($searchResults.append(ele));
          }
          return _results;
        });
      });
      dialog.on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        return dialog.modal('hide');
      });
      dialog.on('hidden', function(event) {
        return dialog.remove();
      });
      return jQuery.extend(true, deferred.promise(), {
        show: function(title) {
          if (title) dialog.find('.modal-header h3').text(title);
          return dialog.modal('show');
        }
      });
    };
    return UI.adopt('insertVideo-oer', null, {
      click: function() {
        var promise;
        promise = showModalDialog(null);
        return promise.show();
      }
    });
  });

}).call(this);
