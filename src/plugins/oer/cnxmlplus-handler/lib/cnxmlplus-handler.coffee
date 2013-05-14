# sanitizecontenthandler.js is part of Aloha Editor project http://aloha-editor.org
# *
# * Aloha Editor is a WYSIWYG HTML5 inline editing library and editor.
# * Copyright (c) 2010-2012 Gentics Software GmbH, Vienna, Austria.
# * Contributors http://aloha-editor.org/contribution.php
# *
# * Aloha Editor is free software; you can redistribute it and/or
# * modify it under the terms of the GNU General Public License
# * as published by the Free Software Foundation; either version 2
# * of the License, or any later version.
# *
# * Aloha Editor is distributed in the hope that it will be useful,
# * but WITHOUT ANY WARRANTY; without even the implied warranty of
# * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# * GNU General Public License for more details.
# *
# * You should have received a copy of the GNU General Public License
# * along with this program; if not, write to the Free Software
# * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
# *
# * As an additional permission to the GNU GPL version 2, you may distribute
# * non-source (e.g., minimized or compacted) forms of the Aloha-Editor
# * source code without the copy of the GNU GPL normally required,
# * provided you include this license notice and a URL through which
# * recipients can access the Corresponding Source.
#
define ["aloha/core", "jquery", "aloha/contenthandlermanager", "aloha/plugin", "aloha/console", "vendor/sanitize"], (Aloha, jQuery, ContentHandlerManager, Plugin, console) ->

  # predefined set of sanitize options if no dynamic or custom config is used

  # very restricted sanitize config

  # sanitize  config allowing a bit more (no tables)

  #add_attributes: {
  #  'a': {'rel': 'nofollow'}
  #},

  # relaxed sanitize config allows also tables
  initSanitize = (configAllows) ->
    filter = ["restricted", "basic", "relaxed"]
    config = Aloha.defaults.supports # @TODO: needs to be implemented into all plugins

    # @TODO think about Aloha.settings.contentHandler.sanitize name/options
    if Aloha.settings.contentHandler.sanitize and jQuery.inArray(Aloha.settings.contentHandler.sanitize, filter) > -1
      config = Aloha.defaults.sanitize[Aloha.settings.contentHandler.sanitize]
    else

      # use relaxed filter by default
      config = Aloha.defaults.sanitize.relaxed

    # @TODO move to Aloha.settings.contentHandler.sanitize.allows ?
    config = Aloha.settings.contentHandler.allows  if Aloha.settings.contentHandler.allows
    config = configAllows  if configAllows

    # add a filter to stop cleaning elements with contentEditable "false"
    config.filters = [(elem) ->
      elem.contentEditable isnt "false"
    ]
    sanitize = new Sanitize(config, jQuery)
  "use strict"
  sanitize = undefined
  Aloha.defaults.sanitize = {}  unless Aloha.defaults.sanitize
  Aloha.defaults.sanitize.restricted = elements: ["b", "em", "i", "strong", "u", "del", "p", "span", "div", "br"]
  Aloha.defaults.sanitize.basic =
    elements: ["a", "abbr", "b", "blockquote", "br", "cite", "code", "dd", "del", "dl", "dt", "em", "i", "li", "ol", "p", "pre", "q", "small", "strike", "strong", "sub", "sup", "u", "ul"]
    attributes:
      a: ["href"]
      blockquote: ["cite"]
      q: ["cite"]
      abbr: ["title"]

    protocols:
      a:
        href: ["ftp", "http", "https", "mailto", "__relative__"]

      blockquote:
        cite: ["http", "https", "__relative__"]

      q:
        cite: ["http", "https", "__relative__"]

  Aloha.defaults.sanitize.relaxed =
    elements: ["a", "abbr", "b", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "del", "dl", "dt", "em", "h1", "h2", "h3", "h4", "h5", "h6", "i", "img", "li", "ol", "p", "pre", "q", "small", "strike", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul", "span", "hr", "object", "div"]
    attributes:
      a: ["href", "title", "id", "class", "target", "data-gentics-aloha-repository", "data-gentics-aloha-object-id"]
      div: ["id", "class", "style"]
      abbr: ["title"]
      blockquote: ["cite"]
      br: ["class"]
      col: ["span", "width"]
      colgroup: ["span", "width"]
      img: ["align", "alt", "height", "src", "title", "width", "class", "data-caption", "data-align", "data-width", "data-original-image"]
      ol: ["start", "type"]
      p: ["class", "style", "id"]
      q: ["cite"]
      table: ["summary", "width"]
      td: ["abbr", "axis", "colspan", "rowspan", "width"]
      th: ["abbr", "axis", "colspan", "rowspan", "scope", "width"]
      ul: ["type"]
      span: ["class", "style", "lang", "xml:lang", "role"]

    protocols:
      a:
        href: ["ftp", "http", "https", "mailto", "__relative__"]

      blockquote:
        cite: ["http", "https", "__relative__"]

      img:
        src: ["http", "https", "__relative__"]

      q:
        cite: ["http", "https", "__relative__"]


  ###
  Handle the content from eg. paste action and sanitize the html
  @param content
  ###
  SanitizeContentHandler = ContentHandlerManager.createHandler(handleContent: (content) ->
    sanitizeConfig = undefined
    contentHandlerConfig = undefined
    if Aloha.activeEditable and Aloha.settings.contentHandler and Aloha.settings.contentHandler.handler and Aloha.settings.contentHandler.handler.sanitize

      # individual sanitize config per editable -- should support merging of configs from other plugins ...
      contentHandlerConfig = Aloha.settings.contentHandler.handler.sanitize  if Aloha.settings.contentHandler.handler.sanitize
      containerId = contentHandlerConfig["#" + Aloha.activeEditable.getId()]
      if typeof containerId isnt "undefined"
        sanitizeConfig = contentHandlerConfig
      else
        containerClasses = Aloha.activeEditable.obj.attr("class").split(" ")
        i = 0

        while i < containerClasses.length
          sanitizeConfig = contentHandlerConfig["." + containerClasses[i]]  if typeof contentHandlerConfig["." + containerClasses[i]] isnt "undefined"
          i++
    initSanitize sanitizeConfig  if typeof sanitize is "undefined" or typeof sanitizeConfig isnt "undefined"
    if typeof content is "string"
      content = jQuery("<div>" + content + "</div>").get(0)
    else content = jQuery("<div>").append(content).get(0)  if content instanceof jQuery
    jQuery("<div>").append(sanitize.clean_node(content)).html()
  )
  SanitizeContentHandler
