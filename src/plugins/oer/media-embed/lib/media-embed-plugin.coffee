define [
  'aloha'
  'aloha/plugin'
  'jquery'
  'aloha/ephemera'
  'ui/ui'
  'ui/button'
  'semanticblock/semanticblock-plugin'
  'css!media-embed/css/media-embed-plugin.css'], (Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) ->

  DIALOG = '''
<div id="mediaEmbedDialog" class="modal hide fade" tabindex="-1" role="dialog" data-backdrop="false">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3>Add video, slides or other media</h3>
  </div>
  <div class="modal-body">
    <form>
      <label style="display: inline-block">
        URL: 
        <input type="text" name="videoUrl" size="90">
      </label>
      <button class="btn">Go</button>
    </form>
  </div>
  <div class="modal-footer">
    <button class="btn cancel">Cancel</button>
  </div>
</div>
'''
  CONFIRM_DIALOG = '''
<div id="mediaConfirmEmbedDialog" class="modal hide fade" tabindex="-1" role="dialog" data-backdrop="false">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3>Add video, slides or other media</h3>
  </div>
  <div class="modal-body">
    <div class="embed-preview"></div>
    <form>
      <label>
        Figure Title: 
        <input type="text" name="figureTitle" size="120">
      </label>
      <em>shows above the embedded content</em>

      <label>Figure Caption:</label>
      <textarea name="figureCaption" rows="4"></textarea>
      <em>shows below the embedded content</em>
    </form>
  </div>
  <div class="modal-footer">
    <button class="btn cancel">Back</button>
    <button class="btn primary embed">Insert Now</button>
  </div>
</div>
'''

  TEMPLATE = '''
<figure data-type="embed" itemscope="itemscope" itemtype="http://schema.org/CreativeWork">
  <div data-type="title"></div>
  <div data-type="alternates"> 
  </div>
  <meta itemprop="url" content=""/>
  <span itemscope="itemscope" itemtype="http://schema.org/Person" itemprop="author">
      <meta itemprop="name" content="Mr. Bees" />
      <meta itemprop="url" content="http://www.flickr.com/photos/bees/" />
  </span>
  <meta itemprop="accessibilityFeature" content="captions" />
  <figcaption>
    <a itemprop="url" href="">Source</a>: by 
    <a itemprop="author" href=""></a>
  </figcaption>
</figure>
'''

  endpoints =
    default: 'http://noembed.com/embed'
    #vimeo: 'http://vimeo.com/api/oembed.json'
    #slideshare: 'http://www.slideshare.net/api/oembed/2'
    #flickr: 'http://www.flickr.com/services/oembed'

  embed = Plugin.create 'mediaEmbed',

    ignore: '[data-type="title"],[data-type="alternates"],.noembed-embed,.noembed-embed *'

    create: (thing) =>
      $thing = $(TEMPLATE)

      $thing.find('[data-type="title"]').text(thing.title)
      $thing.find('[itemprop="url"]').attr('content', thing.url)
      $thing.find('[itemprop="author"] [itemprop="name"]').attr('content', thing.author)
      $thing.find('[itemprop="author"] [itemprop="url"]').attr('content', thing.authorUrl)
      $thing.find('a[itemprop="author"]').attr('href', thing.authorUrl)
      $thing.find('a[itemprop="author"]').text(thing.author)

      $thing.find('figcaption').append(thing.caption)
      $thing.find('[data-type="alternates"]').html(thing.html)

      semanticBlock.insertOverPlaceholder($thing, $('.oer-placeholder'))

    confirm: (thing) =>
      $dialog = $('#mediaConfirmEmbedDialog')
      $dialog = $(CONFIRM_DIALOG) if not $dialog.length

      $dialog.find('.embed-preview').empty().append(thing.html)

      $dialog.find('input,textarea').val('')

      $dialog.find('input[name="figureTitle"]').val(thing.title) if thing.title

      $dialog.find('.cancel').off('click').click (e) ->
        e.preventDefault(true)
        $dialog.modal 'hide'
        embed.showDialog()
      $dialog.find('.embed').off('.embed').click (e) ->
        e.preventDefault(true)
        $(@).parents('.modal').first().find('form').submit()

      $dialog.find('form').off('submit').submit (e) ->
        e.preventDefault(true)
        $dialog.modal 'hide'
        embed.create
          url: thing.url
          html: thing.html
          title: $dialog.find('[name="figureTitle"]').val()
          caption: $dialog.find('[name="figureCaption"]').val()
          author: thing.author
          authorUrl: thing.authorUrl

      $dialog.modal {show: true}

    embedByUrl: (url) =>
      bits = url.match(/(?:https?:\/\/)?(?:www\.)?([^\.]*)/)

      if bits.length == 2
        domain = bits[1]

        endpoint = endpoints[domain] || endpoints['default']

        $.ajax(
          url: endpoint,
          data: {format: 'json', url: url}
          dataType: 'json'
        )
        .done (data) ->
          embed.confirm
            url: data.url || url
            html: data.html
            title: data.title
            author: data.author_name
            authorUrl: data.author_url
        .fail () =>
          console.log 'foobar'
 
    showDialog: () ->
      $dialog = $('#mediaEmbedDialog')
      $dialog = $(DIALOG) if not $dialog.length

      $dialog.find('input').val('')

      $dialog.find('form').off('submit').submit (e) =>
        e.preventDefault(true)

        $dialog.modal 'hide'
        @embedByUrl($dialog.find('input[name="videoUrl"]').val())

      $dialog.modal 'show'

    init: () ->
      # Add a listener
      UI.adopt "insert-mediaEmbed", Button,
        click: =>
          @showDialog()

      # For legacy toolbars
      UI.adopt "insertMediaEmbed", Button,
        click: =>
          range = Aloha.Selection.getRangeObject()
          GENTICS.Utils.Dom.insertIntoDOM $('<span class="aloha-ephemera oer-placeholder"></span>'), range, Aloha.activeEditable.obj
          
          @showDialog()

      semanticBlock.register(this)



