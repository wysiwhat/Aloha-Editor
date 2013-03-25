 # Aloha Video Plugin
# * -----------------
# * This plugin handles when the insertVideo button is clicked
#
define ['aloha', 'jquery', 'popover', 'ui/ui', 'css!assorted/css/image.css'], (Aloha, jQuery, Popover, UI) ->

  embedder = (url_validator, embed_code_generator) ->
    this.embed_code_gen = embed_code_generator
    this.url_validator = url_validator
    embed_code_generator = (url) ->
      # Generates embed html -- this function should be replaced
      embed_html = '<p> Hello World </p>'
      '''
      Validates a URL. Returns video id if URL is valide. Else returns false.
      Should be replaced with actual function. The default validates youtube URLs
      '''
    url_validator = (url) ->
      regexp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/
      result = if(url.match(regexp)) then RegExp.$1 else false
    set_embed_code_generator = (url) ->
      this.embed_code_gen = embed_code_generator
    set_url_validator = (url) ->
      this.url_validator = url_validator
    result = this

  # Creates a youtube embedder
  youtube_url_validator = (url) ->
    regexp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/
    result = if(url.match(regexp)) then RegExp.$1 else false
  
  youtube_embed_code_generator = (url) ->
    video_id = youtube_url_validator(url)
    embed_html = ''
    if (video_id)
      embed_html = '<div class="multimedia-video"><iframe width="640" height="360" src="http:\/\/www.youtube.com/embed/' + video_id + '?wmode=transparent" frameborder="0" allowfullscreen></iframe></div>'
    return embed_html
  youtube_embedder = new embedder(youtube_url_validator, youtube_embed_code_generator)

  # Adds the youtube embedders to the list of embedders
  embedders = []
  embedders[0] = youtube_embedder
  console.debug 'initializing'

  checkURL = (url) ->
    for embedder in embedders
      if (embedder.url_validator(url)) 
        return true
    return false

  # This will be prefixed with Aloha.settings.baseUrl
  WARNING_IMAGE_PATH = '/../plugins/oerpub/image/img/warning.png'

  DIALOG_HTML = '''
    <form class="plugin video modal hide fade" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3>Insert video</h3>
      </div>
      <div class="modal-body">
        <div class="image-options">
            <input type="text" id="video-url-input" class="upload-url-input" placeholder="Enter URL of video ..."/>
        </div>
        <div class="image-alt">
          <div class="forminfo">
            Please provide a description of this video for the visually impaired.
          </div>
          <div>
            <textarea name="alt" type="text" required="required" placeholder="Enter description ..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary action insert">Save</button>
        <button class="btn action cancel">Cancel</button>
      </div>
    </form>'''

  # Defines a template for an embedder object which is responsible for generating embed html and validating a url
  showModalDialog = ($el) ->
      settings = Aloha.require('assorted/assorted-plugin').settings
      root = Aloha.activeEditable.obj
      dialog = jQuery(DIALOG_HTML)

      # Find the dynamic modal elements and bind events to the buttons
      $placeholder = dialog.find('.placeholder.preview')
      $uploadUrl =   dialog.find('.upload-url-input')
      $submit = dialog.find('.action.insert')
      dialog.find("#video-url-input")[0].onkeyup = (event) -> 
        target = event.currentTarget
        currentVal = target.value
        valid = checkURL(currentVal)
        if(valid) 
            target.style.borderColor='green'
            target.style.borderWidth='medium'
        else
            target.style.borderColor='red'
            target.style.borderWidth='medium'

      # If we're editing an image pull in the src.
      # It will be undefined if this is a new image.
      #
      # This variable is updated when one of the following occurs:
      # * selects an image from the filesystem
      # * enters a URL (TODO: Verify it's an image)
      # * drops an image into the drop div

      # $el might not be an image, it might be a placeholder for a future image
      if $el.is('img')
        # On submit $el.attr('src') will point to what is set in this variable
        # preserve the alt text if editing an image
        videoSource = $el.attr('src')
        imageAltText = $el.attr('alt')
      else
        videoSource = ''
        imageAltText = ''

      dialog.find('[name=alt]').val(imageAltText)
      # Checks if the URL is a valid one -- i.e. if one of the embedders can parse and generate embedded html for it
      console.debug 'Checking'
      # /^https?:\/\// - old regex
      if checkURL(videoSource)
        console.debug 'Checked'
        $uploadUrl.val(videoSource)
        $uploadUrl.show()
      # Retrieves embedder which can matches the format of the URL
      getEmbedder = (url) ->
        for embedder in embedders
          if (embedder.url_validator(url)) 
            return embedder
        return false
      setvideoSource = (href) ->
        videoSource = href
        $submit.removeClass('disabled')
      getEmbedEle = (url) ->
        # Retrieves the embedder for this type of video
        if(!(embedder = getEmbedder(url)))
          console.debug("Error: URL not supported")
          # TODO - ADD HELPFUL MESSAGE TO USER
          dialog.modal('hide')

        video = jQuery(embedder.embed_code_gen(url));
        video.attr 'alt', dialog.find('[name=alt]').val()
        return video
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
      dialog.find('.upload-image-link').on 'click', (evt) ->
        evt.preventDefault()
        $placeholder.hide()
        $uploadUrl.hide()
        console.debug 'Hiding placeholder url'

      dialog.find('.upload-url-link').on 'click', (evt) ->
        evt.preventDefault()
        $placeholder.hide()
        $uploadUrl.show()

      $uploadUrl.on 'change', () ->
        $previewImg = $placeholder.find('img')
        url = $uploadUrl.val()
        setvideoSource(url)
        console.debug 'changing'
        if settings.image.preview
          $previewImg.attr 'src', url
          $placeholder.show()

      # On save update the actual video element. Use the submit event because this
      # allows the use of html5 validation.
      deferred = $.Deferred()
      dialog.on 'submit', (evt) =>
        evt.preventDefault() # Don't submit the form
        if $el.is('img')
          $el.attr 'src', videoSource
          $el.attr 'alt', dialog.find('[name=alt]').val()
        else
          console.debug("Embedding the video")
          # Embeds the video into the page
          video = getEmbedEle(videoSource)
          $el.replaceWith(video)
          # $el = video -- not sure why this is necessary
          dialog.modal('hide')

      dialog.on 'click', '.btn.action.cancel', (evt) =>
        evt.preventDefault() # Don't submit the form
        deferred.reject(target: $el[0])
        dialog.modal('hide')

      dialog.on 'hidden', (event) ->
        # If hidden without being confirmed/cancelled, reject
        if deferred.state()=='pending'
          deferred.reject(target: $el[0])
        # Clean up after dialog was hidden
        dialog.remove()

      # Return promise, with an added show method
      jQuery.extend true, deferred.promise(),
        show: (title) ->
            if title
              dialog.find('.modal-header h3').text(title)
            dialog.modal 'show'

  selector = 'img'

  populator = ($el, pover) ->
      # When a click occurs, the activeEditable is cleared so squirrel it
      editable = Aloha.activeEditable
      $bubble = jQuery '''
        <div class="link-popover-details">
            <a class="change">
              <img src="''' + Aloha.settings.baseUrl + '''/../plugins/oerpub/assorted/img/edit-link-03.png" />
              <span title="Change the image's properties">Edit image...</span>
            </a>
            &nbsp; | &nbsp;
            <a class="remove">
              <img src="''' + Aloha.settings.baseUrl + '''/../plugins/oerpub/assorted/img/unlink-link-02.png" />
              <span title="Delete the image">Delete</span>
            </a>
        </div>'''

      href = $el.attr('src')
      $bubble.find('.change').on 'click', ->
        # unsquirrel the activeEditable
        Aloha.activeEditable = editable
        promise = showModalDialog($el)
 
        promise.done (data)->
          # Uploading if a local file was chosen
          if data.files.length
            jQuery(data.target).addClass('aloha-image-uploading')
            uploadImage data.files[0], (url) ->
              jQuery(data.target).attr('src', url).removeClass(
                'aloha-image-uploading')
        promise.show('Edit image')

      $bubble.find('.remove').on 'click', ->
        pover.stopOne($el)
        $el.remove()
      $bubble.contents()


  uploadImage = (file, callback) ->
    plugin = @
    settings = Aloha.require('assorted/assorted-plugin').settings
    xhr = new XMLHttpRequest()
    if xhr.upload
      if not settings.image.uploadurl
        throw new Error("uploadurl not defined")

      xhr.onload = () ->
        if settings.image.parseresponse
          url = parseresponse(xhr)
        else
          url = JSON.parse(xhr.response).url
        callback(url)

      xhr.open("POST", settings.image.uploadurl, true)
      xhr.setRequestHeader("Cache-Control", "no-cache")
      f = new FormData()
      f.append(settings.image.uploadfield or 'upload', file, file.name)
      xhr.send(f)


  Aloha.bind 'aloha-image-selected', (event, target) ->
      # Hide other tooltips of the same type
      $el = jQuery(target)
      nodes = jQuery(Aloha.activeEditable.obj).find(selector)
      nodes = nodes.not($el)
      nodes.trigger 'hide'
      $el.trigger 'show'
      $el.data('aloha-bubble-selected', true)
      $el.off('.bubble')

  UI.adopt 'insertVideo-oer', null,
    click: () ->
      newEl = jQuery('<span class="aloha-ephemera image-placeholder"> </span>')
      GENTICS.Utils.Dom.insertIntoDOM newEl, Aloha.Selection.getRangeObject(), Aloha.activeEditable.obj
      promise = showModalDialog(newEl)

      promise.done (data)->
        # Uploading if a local file was chosen
        if data.files.length
          newEl.addClass('aloha-image-uploading')
          uploadImage data.files[0], (url) ->
            jQuery(data.target).attr('src', url)
            newEl.removeClass('aloha-image-uploading')

      promise.fail (data) ->
        # Clean up placeholder if needed
        $target = jQuery(data.target)
        if not $target.is('img')
          $target.remove()

      # Finally show the dialog
      promise.show()

  # Return config
  selector: selector
  populator: populator
