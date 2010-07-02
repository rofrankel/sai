class SaiChart

  constructor: (x, y, w, h) ->
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.r = Raphael(x, y, w, h)
  
  # a line chart plots everything, but a stock chart only cares about certain series
  caresAbout: (seriesName) ->
    true
  
  # Used to determine whether a data series should be used to scale the overall chart.
  # For example, in a stock chart, volume doesn't scale the chart.
  dataGroups: (data) ->
    seriesName for seriesName of data when this.caresAbout(seriesName)
  
  render: () ->
    false


class SaiPlot extends SaiLine
  constructor: (x, y, w, h) ->
    super(x, y, w, h)