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
    mag: Math.floor(rawmag: (Math.log(max - min) / Math.LN10) - 0.35)
    step: Math.pow(10, mag)
    if rawmag % 1 > 0.7
      step *= 4
    else if rawmag % 1 > 0.35
      step *= 2
    
    bottom: Sai.util.round(min - (step / 1.9), step)
    bottom: 0 if bottom < 0 and min >= 0
    top: Sai.util.round(max + (step / 1.9), step)
    return Sai.util.round(i, step) for i in [bottom..top] by step
  
  # takes e.g. groups[group], not just a group name
  getMax: (data, group) ->
    return Math.max.apply(Math, Math.max.apply(Math, data[series]) for series in group)
  
  # takes e.g. groups[group], not just a group name
  getMin: (data, group) ->
    return Math.min.apply(Math, Math.min.apply(Math, data[series]) for series in group)
  
  normalize: (data) ->
    groups = this.dataGroups(data)
    ndata = {}
    
    for group of groups
      ndata[group]: {}
      max: this.getMax(data, groups[group])
      min: this.getMin(data, groups[group])
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
  
  drawGuideline: (h) ->
    ymin: this.ndata['all'].__YVALS__[0]
    ymax: this.ndata['all'].__YVALS__[this.ndata['all'].__YVALS__.length - 1]
    return unless h > ymin 
    nh: (h - ymin) / (ymax - ymin)
    this.guideline: (new Sai.LinePlot(this.r,
                                     this.pOrigin[0],
                                     this.pOrigin[1],
                                     this.pw, this.ph,
                                     [[0, nh], [1, nh]]))
    .render('#ddd')


class Sai.LineChart extends Sai.Chart
  
  render: () ->
    this.addAxes('all', {left: 30, right: 0, top: 0, bottom: 20}) #todo: set axis padding intelligently
    
    this.drawGuideline(0)
    
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


class Sai.BarChart extends Sai.Chart
  
  render: () ->
    this.addAxes('all', {left: 30, right: 0, top: 0, bottom: 20}) #todo: set axis padding intelligently
    
    this.guidelines = this.r.set()
    for yval in this.ndata['all']['__YVALS__']
      this.drawGuideline(yval)
    
    this.plots = this.r.set()
    data: {}
    for series of this.ndata['all']
      unless series is '__YVALS__'
        data[series] = this.ndata['all'][series]
    
    this.plots.push(
      (new Sai.BarPlot(this.r,
                       this.pOrigin[0],
                       this.pOrigin[1],
                       this.pw, this.ph,
                       data))
      .render(this.stacked?, this.colors)
    )
    
    return this

class Sai.StackedBarChart extends Sai.BarChart

  constructor: (r, x, y, w, h, data) ->
    super(r, x, y, w, h, data)
    this.stacked: true
  
  getMax: (data, group) ->
    return Math.max.apply(Math, Sai.util.sumArray(data[series][i] for series in group) for i in [0...this.data['__LABELS__'].length])
  
  # bar charts always have a 0 baseline
  getMin: (data, group) ->
    return 0



class Sai.StockChart extends Sai.Chart
  
  render: () ->
    this.addAxes('all', {left: 30, right: 0, top: 0, bottom: 20}) #todo: set axis padding intelligently
    
    this.drawGuideline(0)
    
    this.plots = this.r.set()
    
    for group of this.ndata
      continue unless this.ndata[group]['open'] and this.ndata[group]['close'] and this.ndata[group]['high'] and this.ndata[group]['low']
      
      this.plots.push(
        (new Sai.CandlestickPlot(this.r,
                                 this.pOrigin[0],
                                 this.pOrigin[1],
                                 this.pw, this.ph
                                 {'open': this.ndata[group]['open'],
                                  'close': this.ndata[group]['close'],
                                  'high': this.ndata[group]['high'],
                                  'low': this.ndata[group]['low']
                                 }))
        .render(this.colors, Math.min(5, (this.pw / this.ndata[group]['open'].length) - 2))
      )
      
      for series of this.ndata[group]
        continue if series in ['open', 'close', 'high', 'low', '__YVALS__']
        this.plots.push(
          (new Sai.LinePlot(this.r,
                            this.pOrigin[0],
                            this.pOrigin[1],
                            this.pw, this.ph,
                            this.ndata[group][series]))
          .render(this.colors and this.colors[series] or 'black')
        )
    
    return this
