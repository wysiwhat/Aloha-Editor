###
Register a couple of assorted oer plugins
###
define [ 'popover', './link', './image', './figure', './title-figcaption', './simulation' ], (Popover, linkConfig, imageConfig, figureConfig, figcaptionConfig, simulationConfig) ->

  Popover.register linkConfig
  Popover.register imageConfig
  # Popover.register figureConfig
  Popover.register figcaptionConfig
  Popover.register simulationConfig
