// Generated by CoffeeScript 1.3.3

/*
Register a couple of assorted oer plugins
*/


(function() {

  define(['popover', './link', './figure', './title-figcaption'], function(Bubble, linkConfig, figureConfig, figcaptionConfig) {
    Bubble.register(linkConfig);
    Bubble.register(figureConfig);
    return Bubble.register(figcaptionConfig);
  });

}).call(this);