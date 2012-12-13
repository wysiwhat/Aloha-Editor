# Aloha Link Plugin
# * -----------------
# * This plugin provides a bubble next to a link when it is selected
#
define ['aloha', 'jquery', 'popover', 'ui/ui', 'aloha/console'], (Aloha, jQuery, Popover, UI, console) ->

  DIALOG_HTML = '''
    <form class="modal" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
        <h3 id="linkModalLabel">Edit Concord Simulation (experimental)</h3>
      </div>
      <div class="modal-body">
        <h4>Concord iframe URL</h4>
        <div>
          <select id="experiment-url">
            <option>--- Concord Examples ---</option>
            <option value="http://concord-consortium.github.com/lab/examples/interactives/embeddable.html#interactives/basic-examples/pulling-uncharged-atoms.json">pulling-uncharged-atoms</option>
            <option value="http://concord-consortium.github.com/lab/examples/interactives/embeddable.html#interactives/sam/intermolecular-attractions-page-1.json">intermolecular-attractions-page-1</option>
            <option value="http://concord-consortium.github.com/lab/examples/interactives/embeddable.html#interactives/sam/intermolecular-attractions-page-2.json">intermolecular-attractions-page-2</option>
            <option value="http://concord-consortium.github.com/lab/examples/interactives/embeddable.html#interactives/sam/intermolecular-attractions-page-3-1.json">intermolecular-attractions-page-3-1</option>
            <option value="http://concord-consortium.github.com/lab/examples/interactives/embeddable.html#interactives/sam/intermolecular-attractions-page-3-2.json">intermolecular-attractions-page-3-2</option>
            <option value="http://concord-consortium.github.com/lab/examples/interactives/embeddable.html#interactives/basic-examples/boiling-point-with-energy-graph.json">boiling-point-with-energy-graph</option>
            <option>--- PhET Examples ---</option>
            <option value="http://www.colorado.edu/physics/phet/dev/faraday-html/00.00.01/faraday.html">PhET: Faraday</option>
            <option value="http://www.colorado.edu/physics/phet/dev/energy-skate-park-html/00.00.13/">PhET: Skate Park
          </select>
        </div>
        <div>
          <label>Width: </label>
          <input name="width" type="number" placeholder="Width" required/>
          <label>Height: </label>
          <input name="height" type="number" placeholder="Height" required/>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary link-save">Submit</button>
        <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
      </div>
    </form>'''

  showModalDialog = ($el) ->
      root = Aloha.activeEditable.obj
      dialog = jQuery(DIALOG_HTML)

      #dialog.find('#link-tab-internal').tab('show')
      $save = dialog.find('.link-save')
      $url = dialog.find('#experiment-url')
      $width = dialog.find('*[name=width]')
      $height = dialog.find('*[name=height]')

      # Prepopulate and then focus on it
      $url.val($el.attr('src'))
      $url.focus()


      $width.val($el.attr('width'))
      $height.val($el.attr('height'))

      # Trigger the save
      $save.on 'click', (evt) =>
        evt.preventDefault()
        dialog.trigger('submit')

      dialog.on 'submit', (evt) =>
        evt.preventDefault()

        # Set the source attribute
        $el.attr('src', $url.val())
        dialog.modal('hide')

      dialog.modal('show')
      dialog.on 'hidden', () ->
        dialog.remove()
      dialog

  selector = 'iframe'

  populator = ($el) ->
      # When a click occurs, the activeEditable is cleared so squirrel it
      editable = Aloha.activeEditable
      $bubble = jQuery('<div class="link-popover"></div>')

      change = jQuery('<button class="btn">Change...</div>').appendTo($bubble)
      # TODO: Convert the mousedown to a click. To do that the aloha-deactivated event need to not hide the bubbles yet and instead fire a 'hide' event
      change.on 'click', =>
        # unsquirrel the activeEditable
        Aloha.activeEditable = editable
        dialog = showModalDialog($el)
      remove = jQuery('<button class="btn btn-danger">Remove</div>').appendTo($bubble)
      remove.on 'click', =>
        $el.remove()
        jQuery(@).popover('hide')
      $bubble.contents()


  UI.adopt 'insertSimulation', null,
    click: () ->
      newFrame = jQuery('<iframe frameborder="1" height="400" scrolling="no" width="800"></iframe>')
      dialog = showModalDialog(newFrame)

      # Wait until the dialog is closed before inserting it into the DOM
      # That way if it is cancelled nothing is inserted
      dialog.on 'hidden', =>

        # If the user cancelled then don't create the link
        if not newFrame.attr 'src'
          return
        # Either insert a new span around the cursor and open the box or just open the box
        range = Aloha.Selection.getRangeObject()

        # Extend to the whole word 1st
        if range.isCollapsed()
          # if selection is collapsed then extend to the word.
          GENTICS.Utils.Dom.extendToWord(range)

        if range.isCollapsed()
          # insert a link with text here
          GENTICS.Utils.Dom.insertIntoDOM newFrame,
            range,
            Aloha.activeEditable.obj
          range.startContainer = range.endContainer = newFrame.contents()[0]
          range.startOffset = 0
          range.endOffset = newFrame.text().length
        else
          GENTICS.Utils.Dom.addMarkup(range, newFrame, false)

        # addMarkup takes a template so we need to look up the inserted object
        #   and remove the marker class
        newFrame = Aloha.activeEditable.obj.find('.aloha-new-link')
        newFrame.removeClass('aloha-new-link')


  Popover.register
    hover: true
    selector: selector
    populator: populator
