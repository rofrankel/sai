# A chart composes plots and organizes them with e.g. axes
class Sai.Chart

  constructor: (r, x, y, w, h, data) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
    this.setData(data)
  
  setData: (data) ->
    this.data = data
    this.ndata  = this.normalize(data)
  
  # a line chart plots everything, but a stock chart only cares about e.g. high low open close avg vol
  caresAbout: (seriesName) ->
    return seriesName isnt '__LABELS__'
  
  # Used to determine whether a data series should be used to scale the overall chart.
  # For example, in a stock chart, volume doesn't scale the chart.
  dataGroups: (data) ->
    {'all': seriesName for seriesName of data when this.caresAbout(seriesName)}
  
  normalize: (data) ->
    groups = this.dataGroups(data)
    ndata = {}
    
    for group of groups
      ndata[group] = {}
      max = Math.max.apply(Math, Math.max.apply(Math, data[series]) for series in groups[group])
      min = Math.min.apply(Math, Math.min.apply(Math, data[series]) for series in groups[group])
      for series in groups[group]
        ndata[group][series] = ((val-min) / (max-min)) for val in data[series]
        ndata[group].__MAX__ = max
        ndata[group].__MIN__ = min
    
    return ndata
  
  # padding should contain left, right, top, and bottom values
  addAxes: (group, padding, vticks) ->
    vticks ?= 10
    
    origin = [this.x + padding.left, this.y - padding.bottom]
    hlen = this.w - padding.left - padding.right
    vlen = this.h - padding.bottom - padding.top
    vmin = this.ndata[group].__MIN__
    vmax = this.ndata[group].__MAX__
    
    haxis = this.r.sai.prim.haxis(this.data['__LABELS__'], origin[0], origin[1], hlen)
    vaxis = this.r.sai.prim.vaxis(vmin + ((vmax - vmin) * dy / (vticks-1)) for dy in [0..vticks-1], origin[0], origin[1], vlen)
    
    return this.r.set().push()
  
  render: () ->
    this.plot ?= new Sai.Plot(this.r)
    this.plot.render()
  


