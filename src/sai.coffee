Raphael.sai: {} unless Raphael.sai?

class Raphael.sai.SaiChart

  constructor: (r, x, y, w, h) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
  
  # a line chart plots everything, but a stock chart only cares about certain series
  caresAbout: (seriesName) ->
    true
  
  # Used to determine whether a data series should be used to scale the overall chart.
  # For example, in a stock chart, volume doesn't scale the chart.
  dataGroups: (data) ->
    [seriesName for seriesName of data when this.caresAbout(seriesName)]
  
  render: () ->
    this.r.rect(20, 20, 20, 20).attr('fill', 'red')
    return this



class Raphael.sai.SaiPlot extends Raphael.sai.SaiChart
  constructor: (x, y, w, h) ->
    super(x, y, w, h)
  
  normalize: (data) ->
    groups = this.dataGroups(data)
    ndata = {}
    
    for group in groups
      max = Math.max.apply(Math, Math.max.apply(Math, data[series]) for series in group)
      min = Math.min.apply(Math, Math.min.apply(Math, data[series]) for series in group)
      for series in group
        ndata[series] = ((val-min) / (max-min)) for val in data[series]
    
    return ndata


Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type) ->
  type = {
    # todo
  }[type] or type
  
  type ?= Raphael.sai.SaiChart
  
  chart: new type(this, x, y, w, h)
  chart.render()
  