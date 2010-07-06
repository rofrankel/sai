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
  
  getYAxisVals: (min, max) ->
    mag: Math.floor((Math.log(max - min) / Math.LN10) - 0.5)
    step: Math.pow(10, mag)
    bottom: Sai.util.round(min - (1.1 * step), mag)
    bottom: 0 if bottom < 0 and min > 0
    top: Sai.util.round(max + (1.1 * step), mag)
    return Sai.util.range(bottom, top + 1, step)
  
  normalize: (data) ->
    groups = this.dataGroups(data)
    ndata = {}
    
    for group of groups
      ndata[group]: {}
      max: Math.max.apply(Math, Math.max.apply(Math, data[series]) for series in groups[group])
      min: Math.min.apply(Math, Math.min.apply(Math, data[series]) for series in groups[group])
      yvals: this.getYAxisVals(min, max)
      min: yvals[0]
      max: yvals[yvals.length - 1]
      for series in groups[group]
        ndata[group][series] = [i / (data[series].length - 1), ((data[series][i]-min) / (max-min))] for i in [0...data[series].length]
        ndata[group].__YVALS__ = yvals
    
    return ndata
  
  # padding should contain left, right, top, and bottom values
  addAxes: (group, padding, vticks) ->
    
    this.axisPadding = padding
    
    this.pOrigin = origin = [this.x + padding.left, this.y - padding.bottom]
    this.pw = hlen = this.w - padding.left - padding.right
    this.ph = vlen = this.h - padding.bottom - padding.top
    vmin = this.ndata[group].__YVALS__[0]
    vmax = this.ndata[group].__YVALS__[this.ndata[group].__YVALS__.length - 1]
    
    vticks ?= Math.floor(vlen / 15.0)
    
    haxis = this.r.sai.prim.haxis(this.data['__LABELS__'], origin[0], origin[1], hlen)
    vaxis = this.r.sai.prim.vaxis(this.ndata[group].__YVALS__, origin[0], origin[1], vlen)
    
    return this.r.set().push(haxis).push(vaxis)
  
  render: () ->
    this.plot ?= new Sai.Plot(this.r)
    this.plot.render()
    return this
  
  # map from series name to color
  setColors: (colors) ->
    this.colors ?= {}
    for series of colors
      this.colors[series] = colors[series]
    return this
  
  setColor: (series, color) ->
    this.colors ?= {}
    this.colors[series] = color
    return this



class Sai.LineChart extends Sai.Chart
  
  render: () ->
    this.addAxes('all', {left: 10, right: 0, top: 0, bottom: 10})
    
    this.plots = this.r.set()
    for series of this.ndata['all']
      if series is '__YVALS__'
        continue
      
      this.plots.push(
        (new Sai.LinePlot(this.r,
                          this.pOrigin[0],
                          this.pOrigin[1],
                          this.pw, this.ph,
                          this.ndata['all'][series]))
        .render(this.colors and this.colors[series] or 'black')
      )
    
    return this
