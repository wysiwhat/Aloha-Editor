#global define: true

#!
#* Aloha Editor
#* Author & Copyright (c) 2010-2012 Gentics Software GmbH
#* aloha-sales@gentics.com
#* Licensed unter the terms of http://www.aloha-editor.com/license.html
#

###
@name contenthandler
###
define ['jquery', 'aloha/plugin', 'aloha/contenthandlermanager'], ($, Plugin, ContentHandlerManager) ->

  Plugin.create 'cnxmlplus-handler',

    ###
    Will simply register the default content handlers.

    @override
    ###
    init: ->
      handler = ContentHandlerManager.createHandler
          handleContent: (content) ->
            return '<h2>Hello. a heading was just pasted</h2>'
      ContentHandlerManager.register 'cnxmlplus', handler


      Aloha.bind 'aloha-smart-content-changed', (evt, options) ->
      	return if options.triggerType != 'paste'
      	$root = options.editable.obj
      	content = options.getSnapshotContent()

