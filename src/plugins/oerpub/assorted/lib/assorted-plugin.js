
/*
Register a couple of assorted oer plugins
*/

(function() {

  define(['aloha/plugin', 'jquery', 'popover', './link', './image', './video', './figure', './title-figcaption', './list'], function(Plugin, $, Popover, linkConfig, imageConfig, videoConfig, figureConfig, figcaptionConfig) {
    return Plugin.create('assorted', {
      defaultSettings: {
        image: {
          preview: true
        }
      },
      init: function() {
        this.settings = $.extend(true, this.defaultSettings, this.settings);
        Popover.register(linkConfig);
        Popover.register(imageConfig);
        return Popover.register(videoConfig);
      }
    });
  });

}).call(this);
