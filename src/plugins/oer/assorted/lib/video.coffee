# Aloha Video Plugin
# * -----------------
# * This plugin handles when the insertVideo button is clicked
#
define ['aloha', 'jquery', 'popover', 'ui/ui', 'css!assorted/css/image.css'], (Aloha, jQuery, Popover, UI) ->

  embedder = (url_validator, embed_code_generator, query_generator, search_results_generator) ->
    this.embed_code_gen = embed_code_generator
    this.url_validator = url_validator
    this.query_generator = query_generator
    this.search_results_generator = search_results_generator
    result = this


  YOUTUBE_ID = 0
  VIMEO_ID = 1
  SLIDESHARE_ID = 2
  CONCORD_ID = 3

  lastKnownUrlId = ''
  lastWorkingEmbedder = -1

  ### 

  Youtube Plugin 

  ###
  # Creates a youtube embedder
  youtube_url_validator = (url) ->
    regexp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/
    if url.match(regexp)
      lastKnownUrlId = RegExp.$1
      lastWorkingEmbedder = YOUTUBE_ID
      return RegExp.$1
    else
      lastWorkingEmbedder = -1
      return false
  
  youtube_embed_code_generator = (id) ->
    return jQuery("""<iframe style="width:640px; height:360px" width="640" height="360" 
      src="http:\/\/www.youtube.com/embed/#{id}?wmode=transparent" frameborder="0" allowfullscreen></iframe>""")
  youtube_query_generator = (queryTerms) -> 
    terms = queryTerms.split(' ')
    return 'https://gdata.youtube.com/feeds/api/videos?q='+terms.join('+')+'&alt=json&v=2'

  youtube_search_results_generator = (responseObj) ->
    eleList = [ ]
    videoList = responseObj.feed.entry
    for video in videoList
      thumbnailUrl = video.media$group.media$thumbnail[0].url
      thumbnailHeight = video.media$group.media$thumbnail[0].height
      thumbnailWidth = video.media$group.media$thumbnail[0].width
      videoTitle = video.title.$t
      videoDescription = video.media$group.media$description.$t
      videoLengthString = getTimeString(video.media$group.yt$duration.seconds)
      idTokens = video.id.$t.split(':')
      videoId = idTokens[idTokens.length-1]
      # newEntry = jQuery('<div style="width:100%;border-bottom: 1px solid black;" class="search-result" id='+videoId+'><table><tr><td width=20% rowspan=3><img src='+thumbnailUrl+' /></td><td><b>'+videoTitle+'</b></td></tr><tr><td>'+videoDescription+'</td></tr><tr><td>Duration: '+videoLengthString+'</td></tr></table></div>')
      newEntry = jQuery("""<div style="width:100%;border-bottom: 1px solid black;" class="search-result" id="#{videoId}"><table>
        <tr><td width=20% rowspan=3><img src="#{thumbnailUrl}"/></td>
        <td><b>#{videoTitle}</b></td></tr><tr><td>#{videoDescription}</td></tr>
        <tr><td>Duration:#{videoLengthString}</td></tr></table></div>""")
      eleList.push(newEntry)
    return eleList

  ### 

  Vimeo Plugin 

  ###
  vimeo_url_validator = (url) ->
    if url.indexOf('vimeo.com/') != -1
      offset = url.indexOf('vimeo.com/')
      offset = offset + 10
      videoIdStr = url.substring(offset)
      intRegex = /^[0-9]$/
      for c in videoIdStr
        if !intRegex.test(c)
          return false
      lastKnownUrlId = videoIdStr
      lastWorkingEmbedder = VIMEO_ID
      return videoIdStr
    lastWorkingEmbedder = -1
    return false

  vimeo_embed_code_generator = (id) ->
    return jQuery("""<iframe style="width:640px; height:380px" src="http://player.vimeo.com/video/#{id}" 
      width="640" height="380" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>""") 

  vimeo_query_generator = (queryTerms) -> 
    terms = queryTerms.split(' ')
    url = """http://vimeo.com/api/rest/v2&format=json&method=vimeo.videos.search&oauth_consumer_key=c1f5add1d34817a6775d10b3f6821268&
    oauth_nonce=da3f0c0437ad303c7cdb11c522abef4f&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1365564937&oauth_token=1bba5c6f35030672b0b4b5c8cf8ed156&
    oauth_version=1.0&page=0&per_page=50&query=#{terms.join('+')}&user_id=jmaxg3"""
    return url

  vimeo_search_results_generator = (responseObj) ->
    return [ ]

  
  slideshare_url_validator = (inputurl, inputbox) ->
    if inputurl.indexOf('slideshare.net') == -1
      return false

    encodedUrl = encodeURIComponent(inputurl)
    jQuery.ajax({
            url: """http://www.slideshare.net/api/oembed/2?url=#{encodedUrl}&format=jsonp""",
            async:false,
            dataType: 'jsonp',
            success: (result, status, statusObject) -> 
              id = result.slideshow_id
              if inputurl == inputbox.value
                inputbox.style.class = 'validURL'
                lastKnownUrlId = id
                lastWorkingEmbedder = SLIDESHARE_ID
            })
    
    lastWorkingEmbedder = -1
    return false
  
  slideshare_embed_code_generator = (id) ->
    return jQuery("""<iframe style="width:427px; height:356px" src="http://www.slideshare.net/slideshow/embed_code/#{id}" width="427" height="356" frameborder="0" 
      marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" 
      allowfullscreen webkitallowfullscreen mozallowfullscreen> </iframe>""") 

  slideshare_query_generator = (queryTerms) -> 
    return false

  slideshare_search_results_generator = (responseObj) ->
    return [ ]

  concord_url_validator = (url) ->
    concordLabUrl = 'lab.concord.org/examples/interactives/interactives.html#interactives/samples/'
    if url.indexOf(concordLabUrl) != -1
      offset = url.indexOf(concordLabUrl)
      offset = offset + concordLabUrl.length
      id = url.substring(offset)
      if id.length > 5
        post = id.substring(id.length-5)
        if post == '.json'
          id = id.substring(0, id.length-5)
          lastKnownUrlId = id
          lastWorkingEmbedder = CONCORD_ID
          return id

    return false

  concord_embed_code_generator = (id) ->
    return jQuery("""<iframe style="width:925px; height:575px" width="925" height="575" frameborder="no" scrolling="no" 
      src="http://lab.concord.org/examples/interactives/embeddable.html#interactives/samples/#{id}.json"></iframe>""")

  concord_query_generator = (queryTerms) -> 
    false

  concord_search_results_generator = (responseObj) ->
    return [ ]

  youtube_embedder = new embedder(youtube_url_validator, youtube_embed_code_generator, youtube_query_generator, youtube_search_results_generator)
  vimeo_embedder = new embedder(vimeo_url_validator, vimeo_embed_code_generator, vimeo_query_generator, vimeo_search_results_generator)
  slideshare_embedder = new embedder(slideshare_url_validator, slideshare_embed_code_generator, slideshare_query_generator, slideshare_search_results_generator)
  concord_embedder = new embedder(concord_url_validator, concord_embed_code_generator, concord_query_generator, concord_search_results_generator)

  # Adds the youtube embedders to the list of embedders
  embedders = []
  embedders[YOUTUBE_ID] = youtube_embedder
  embedders[VIMEO_ID] = vimeo_embedder
  embedders[SLIDESHARE_ID] = slideshare_embedder
  embedders[CONCORD_ID] = concord_embedder

  active_embedder = youtube_embedder
  active_embedder_value = 'youtube'
  
  checkURL = (url, inputbox) ->
    for embedder in embedders
      if (embedder.url_validator(url, inputbox)) 
        return true
    return false

  DIALOG_HTML = '''
    <form class="plugin video modal hide fade" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3>Insert video</h3>
      </div>
      <div class="modal-body">
        <div class="image-options">
            <center><input type="text" style="width:80%;" id="video-url-input" class="upload-url-input" placeholder="Enter URL of video ..."/></center>
        </div>
        <center>OR</center>
        <div class="modal-body" >
            <center><input type="text" style="width:80%;" id="video-search-input" class-"upload-url-input" placeholder="Enter search terms for your video ..."/></center>
            <center><table><tr><td><input id='media-sites' type="radio" name="video-site" value="youtube" checked>Youtube</input></td><td><input disabled id='media-sites' type="radio" name="video-site" value="vimeo">Vimeo (search not working)</input></td></tr></table></center>
            <center><button type="search" class="btn btn-primary action search">Search</button></center>
        </div>
        <div class="modal-body" >
            <div style="border:1px solid; height:200px; width:100%; overflow-x:auto; overflow-y:scroll;" id="search-results">
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary action insert">Insert</button>
        <button class="btn action cancel">Cancel</button>
      </div>
    </form>'''

 
  getTimeString = (timeInSeconds) ->
    nHours = 0
    nMinutes = 0
    nSeconds = 0
    ivalue = parseInt(timeInSeconds)

    if ivalue > 3600
      nHours = Math.floor(ivalue / 3600)
      ivalue = ivalue - (3600 * nHours)
    if ivalue > 60
      nMinutes = Math.floor(ivalue / 60)
      ivalue = ivalue - (60 * nMinutes)
    nSeconds = ivalue

    str = ''
    if nHours > 0
      str = str + nHours.toString()+' hours'
    if nMinutes > 0
      if str.length != 0
        str = str + ', '
      str = str + nMinutes.toString() + ' mins'
    if nSeconds > 0
      if str.length != 0
        str = str + ', '
      str = str + nSeconds.toString() + ' secs'
    return str

  # Defines a template for an embedder object which is responsible for generating embed html and validating a url
  showModalDialog = ($el) ->
      settings = Aloha.require('assorted/assorted-plugin').settings
      root = Aloha.activeEditable.obj
      dialog = jQuery(DIALOG_HTML)

      # Find the dynamic modal elements and bind events to the buttons
      $placeholder = dialog.find('.placeholder.preview')
      $uploadUrl =   dialog.find('.upload-url-input')
      $searchTerms = dialog.find('#video-search-input')
      $searchResults = dialog.find('#search-results')
      $submit = dialog.find('.action.insert')
      dialog.find("#video-url-input")[0].onkeyup = (event) -> 
        target = event.currentTarget
        currentVal = target.value
        valid = checkURL(currentVal, target)
        if(valid) 
            target.style.class = 'validURL'
        else
            # jQuery(this).addClass('invalidURL')
            jQuery(this).attr('class', 'invalidURL')
            target.style.class = 'invalidURL'
            target.class = 'invalidURL'
            target.className = 'invalidURL'
            # target.style.borderColor = 'Red';

      for radio in dialog.find('#media-sites')
        radio.onclick = (event) ->
          val = event.target.value
          if active_embedder_value != val
            index = 0
            for radio in dialog.find('#media-sites')
              if radio.value == val
                active_embedder_value = radio.value
                active_embedder = embedders[index]
                break
              index = index + 1
              
      # If we're editing an image pull in the src.
      # It will be undefined if this is a new image.
      #
      # This variable is updated when one of the following occurs:
      # * selects an image from the filesystem
      # * enters a URL (TODO: Verify it's an image)
      # * drops an image into the drop div

      # $el might not be an image, it might be a placeholder for a future image
      # if $el.is('img')
      #   # On submit $el.attr('src') will point to what is set in this variable
      #   # preserve the alt text if editing an image
      #   videoSource = $el.attr('src')
      #   imageAltText = $el.attr('alt')
      # else
      #   videoSource = ''
      #   imageAltText = ''

      videoSource = ''
      # dialog.find('[name=alt]').val(imageAltText)
      # Checks if the URL is a valid one -- i.e. if one of the embedders can parse and generate embedded html for it
      # Retrieves embedder which can matches the format of the URL
      if checkURL(videoSource, $uploadUrl)
        $uploadUrl.val(videoSource)
        $uploadUrl.show()
      setvideoSource = (href) ->
        videoSource = href
        $submit.removeClass('disabled')

      # Uses the File API to render a preview of the image
      # and updates the modal's videoSource
      loadLocalFile = (file, $img, callback) ->
        reader = new FileReader()
        reader.onloadend = () ->
          if $img
            $img.attr('src', reader.result)
          # If we get an image then update the modal's videoSource
          setvideoSource(reader.result)
          callback(reader.result) if callback
        reader.readAsDataURL(file)

      # Add click handlers
      # dialog.find('.upload-image-link').on 'click', (evt) ->
      #   evt.preventDefault()
      #   $placeholder.hide()
      #   $uploadUrl.hide()

      # dialog.find('.upload-url-link').on 'click', (evt) ->
      #   evt.preventDefault()
      #   $placeholder.hide()
      #   $uploadUrl.show()

      $uploadUrl.on 'change', () ->
        # $previewImg = $placeholder.find('img')
        url = $uploadUrl.val()
        setvideoSource(url)
        # if settings.image.preview
        #   $previewImg.attr 'src', url
        #   $placeholder.show()

      # On save update the actual video element. Use the submit event because this
      # allows the use of html5 validation.
      deferred = $.Deferred()

      dialog.on 'click', '.btn.btn-primary.action.insert', (evt) =>
        evt.preventDefault() # Don't submit the form
        # if $el.is('img')
        #   $el.attr 'src', videoSource
        #   $el.attr 'alt', dialog.find('[name=alt]').val()
        # else
        # Embeds the video into the page
        #mediaWrapper = jQuery('<div class="media"></div>')
        if videoSource.length == 0
          # Use search results
          for child in $searchResults.children()
            if child.className == 'search-result-selected'
              video_id = child.id
              mediaElement = active_embedder.embed_code_gen(video_id)
              break
        else
          # Use url
          if lastWorkingEmbedder == -1
            return
          mediaElement = embedders[lastWorkingEmbedder].embed_code_gen(lastKnownUrlId)

        #mediaWrapper.append(mediaElement)
        #AlohaInsertIntoDom(mediaWrapper)
        AlohaInsertIntoDom(mediaElement)
        dialog.modal('hide')

      dialog.on 'click', '.btn.btn-primary.action.search', (evt) =>
        evt.preventDefault() # Don't submit the form
        queryUrl = active_embedder.query_generator($searchTerms[0].value)
        $searchResults.empty()
        $searchResults.append(jQuery('<div style="width=100%" >Searching...</div>'))
        jQuery.get(queryUrl, (responseObj) => 
                $searchResults.empty()
                if (typeof responseObj) == 'string'
                  responseObj = jQuery.parseJSON(responseObj)

                searchElements = active_embedder.search_results_generator(responseObj)
                for ele in searchElements
                  ele[0].onclick = (evt) => 
                   target = evt.target
                   while target.tagName != 'DIV'
                     target = target.parentNode
                   targetId = target.id
                   for child in $searchResults.children()
                     if child.id == targetId
                       child.className = 'search-result-selected'
                     else
                       child.className = 'search-result'
                  $searchResults.append(ele)
                )

      dialog.on 'click', '.btn.action.cancel', (evt) =>
        evt.preventDefault() # Don't submit the form
        # deferred.reject(target: $el[0])
        dialog.modal('hide')

      dialog.on 'hidden', (event) ->
        # If hidden without being confirmed/cancelled, reject
        # if deferred.state()=='pending'
          # deferred.reject(target: $el[0])
        # Clean up after dialog was hidden
        dialog.remove()

      # Return promise, with an added show method
      jQuery.extend true, deferred.promise(),
        show: (title) ->
            if title
              dialog.find('.modal-header h3').text(title)
            dialog.modal 'show'

  selector = 'img'

  # populator = ($el, pover) ->
  #     # When a click occurs, the activeEditable is cleared so squirrel it
  #     editable = Aloha.activeEditable
  #     $bubble = jQuery '''
  #       <div class="link-popover-details">
  #           <a class="change">
  #             <img src="''' + Aloha.settings.baseUrl + '''/../plugins/oerpub/assorted/img/edit-link-03.png" />
  #             <span title="Change the image's properties">Edit image...</span>
  #           </a>
  #           &nbsp; | &nbsp;
  #           <a class="remove">
  #             <img src="''' + Aloha.settings.baseUrl + '''/../plugins/oerpub/assorted/img/unlink-link-02.png" />
  #             <span title="Delete the image">Delete</span>
  #           </a>
  #       </div>'''

  #     href = $el.attr('src')
  #     $bubble.find('.change').on 'click', ->
  #       # unsquirrel the activeEditable
  #       Aloha.activeEditable = editable
  #       promise = showModalDialog($el)
 
  #       promise.done (data)->
  #         # Uploading if a local file was chosen
  #         if data.files.length
  #           jQuery(data.target).addClass('aloha-image-uploading')
  #           uploadImage data.files[0], (url) ->
  #             jQuery(data.target).attr('src', url).removeClass(
  #               'aloha-image-uploading')
  #       promise.show('Edit image')

  #     $bubble.find('.remove').on 'click', ->
  #       pover.stopOne($el)
  #       $el.remove()
  #     $bubble.contents()


  # uploadImage = (file, callback) ->
  #   # plugin = @
  #   settings = Aloha.require('assorted/assorted-plugin').settings
  #   xhr = new XMLHttpRequest()
  #   if xhr.upload
  #     if not settings.image.uploadurl
  #       throw new Error("uploadurl not defined")

  #     xhr.onload = () ->
  #       if settings.image.parseresponse
  #         url = parseresponse(xhr)
  #       else
  #         url = JSON.parse(xhr.response).url
  #       callback(url)

  #     xhr.open("POST", settings.image.uploadurl, true)
  #     xhr.setRequestHeader("Cache-Control", "no-cache")
  #     f = new FormData()
  #     f.append(settings.image.uploadfield or 'upload', file, file.name)
  #     xhr.send(f)


  # Aloha.bind 'aloha-image-selected', (event, target) ->
  #     # Hide other tooltips of the same type
  #     $el = jQuery(target)
  #     nodes = jQuery(Aloha.activeEditable.obj).find(selector)
  #     nodes = nodes.not($el)
  #     nodes.trigger 'hide'
  #     $el.trigger 'show'
  #     $el.data('aloha-bubble-selected', true)
  #     $el.off('.bubble')

  UI.adopt 'insertVideo-oer', null,
    click: () ->
      # newEl = jQuery('<span class="aloha-ephemera image-placeholder"> </span>')    
      # GENTICS.Utils.Dom.insertIntoDOM newEl, Aloha.Selection.getRangeObject(), Aloha.activeEditable.obj
      promise = showModalDialog(null)

      ## Add code here to handle video uploading. This is not currently supported ##
      # promise.done (data)->
      #   # Uploading if a local file was chosen
      #   if data.files.length
      #     newEl.addClass('aloha-image-uploading')
      #     uploadImage data.files[0], (url) ->
      #       jQuery(data.target).attr('src', url)
      #       newEl.removeClass('aloha-image-uploading')

      # promise.fail (data) ->
      #   # Clean up placeholder if needed
      #   $target = jQuery(data.target)
      #   if not $target.is('img')
      #     $target.remove()

      # Finally show the dialog
      promise.show()

  # Return config
  # selector: selector
  # populator: populator
