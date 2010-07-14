# A chart composes plots and organizes them with e.g. axes
class Sai.Chart

  constructor: (r, x, y, w, h, data) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
    
    this.setData(data)
    
    this.padding: {
      left: 0
      right: 0
      top: 0
      bottom: 0
    }
  
  groupsToNullPad: () ->
    return []
  
  setData: (data) ->
    this.data = {}
    
    # deep copy
    for series of data
      this.data[series] = data[series].slice(0)
    
    # do any necessary null padding
    groups = this.dataGroups(data)
    
    for group in this.groupsToNullPad()
      for series in groups[group]
        this.nullPad(series)
    
    # normalize data
    this.ndata = this.normalize(this.data)
  
  nullPad: (seriesName) ->
    if seriesName of this.data
      this.data[seriesName] = [null].concat(this.data[seriesName].concat([null]))
  
  # a line chart plots everything, but a stock chart only cares about e.g. high low open close avg vol
  caresAbout: (seriesName) ->
    return not seriesName.match("^__")
  
  # Used to determine whether a data series should be used to scale the overall chart.
  # For example, in a stock chart, volume doesn't scale the chart.
  dataGroups: (data) ->
    {
      'all': seriesName for seriesName of data when this.caresAbout(seriesName)
      '__META__': seriesName for seriesName of data when seriesName.match("^__")
    }
  
  getYAxisVals: (min, max) ->
    mag: Math.floor(rawmag: (Math.log(max - min) / Math.LN10) - 0.35)
    step: Math.pow(10, mag)
    if rawmag % 1 > 0.7
      step *= 4
    else if rawmag % 1 > 0.35
      step *= 2
    
    bottom: Sai.util.round(min - (step / 1.9), step)
    bottom: 0 if bottom < 0 <= min
    top: Sai.util.round(max + (step / 1.9), step)
    return Sai.util.round(i, step) for i in [bottom..top] by step
  
  # takes e.g. groups[group], not just a group name
  getMax: (data, group) ->
    return Math.max.apply(Math, Math.max.apply(Math, d for d in data[series] when d isnt null) for series in group)
  
  # takes e.g. groups[group], not just a group name
  getMin: (data, group) ->
    return Math.min.apply(Math, Math.min.apply(Math, d for d in data[series] when d isnt null) for series in group)
  
  normalize: (data) ->
    groups = this.dataGroups(data)
    ndata = {}
    
    for group of groups
      continue if group is '__META__'
      ndata[group]: {}
      max: this.getMax(data, groups[group])
      min: this.getMin(data, groups[group])
      yvals: this.getYAxisVals(min, max)
      min: yvals[0]
      max: yvals[yvals.length - 1]
      for series in groups[group]
        continue unless data[series]?
        ndata[group][series] = (data[series][i]? and [i / (data[series].length - 1), ((data[series][i]-min) / (max-min))] or null) for i in [0...data[series].length]
        ndata[group].__YVALS__ = yvals
    
    return ndata
  
  addAxes: (group) ->
    
    LINE_HEIGHT: 10
    
    this.axisWidth: 1.5
    
    # height of text + space between ticks and text + height of tick + height of axis
    haxis_height: LINE_HEIGHT + 2 + 10
    
    # the 5 is for the half a text line at the top tick
    this.padding.top += 5
    # (over)estimate how much padding we need for the last label
    if this.data['__LABELS__'][this.data['__LABELS__'].length - 1]?
      this.padding.right += (this.data['__LABELS__'][this.data['__LABELS__'].length - 1].length / 2) * 5
    
    
    vlen: this.h - (this.padding.bottom + haxis_height + this.padding.top)
    this.vaxis = this.r.sai.prim.vaxis(this.ndata[group].__YVALS__, this.x + this.padding.left, this.y - (this.padding.bottom + haxis_height), vlen, this.axisWidth)
    this.vaxis.translate(this.vaxis.getBBox().width, 0)
    this.padding.left += this.vaxis.getBBox().width
    
    hlen: this.w - this.padding.left - this.padding.right
    this.haxis = this.r.sai.prim.haxis(this.data['__LABELS__'], this.x + this.padding.left, this.y - this.padding.bottom, hlen, this.axisWidth)
    this.haxis.translate(0, -haxis_height)
    this.padding.bottom += haxis_height
    
    # this.r.rect(this.x, this.y - this.h, this.w, this.h)
    # this.r.rect(this.vaxis.getBBox().x, this.vaxis.getBBox().y, this.vaxis.getBBox().width, this.vaxis.getBBox().height).attr('stroke', 'red')
    # this.r.rect(this.haxis.getBBox().x, this.haxis.getBBox().y, this.haxis.getBBox().width, this.haxis.getBBox().height).attr('stroke', 'blue')
    
    this.pOrigin = origin = [this.x + this.padding.left, this.y - this.padding.bottom]
    this.pw = hlen = this.w - this.padding.left - this.padding.right
    this.ph = vlen = this.h - this.padding.bottom - this.padding.top
    
    
    return this.r.set().push(this.haxis).push(this.vaxis)
  
  render: () ->
    this.plot ?= new Sai.Plot(this.r)
    this.plot.render()
    return this
  
  # map from series name to color
  setColors: (colors) ->
    this.colors ?= {}
    for series of colors
      if series of this.data
        this.colors[series] = colors[series]
    return this
  
  setColor: (series, color) ->
    this.colors ?= {}
    this.colors[series] = color
    return this
  
  drawGuideline: (h, group) ->
    group ?= 'all'
    ymin: this.ndata[group].__YVALS__[0]
    ymax: this.ndata[group].__YVALS__[this.ndata[group].__YVALS__.length - 1]
    return unless h > ymin 
    nh: (h - ymin) / (ymax - ymin)
    this.guideline: (new Sai.LinePlot(this.r,
                                      this.pOrigin[0],
                                      this.pOrigin[1],
                                      this.pw, this.ph,
                                      [[0, nh], [1, nh]]))
    .render('#ccc')
  
  drawLegend: () ->
    if this.colors
      this.legend: this.r.sai.prim.legend(this.x, this.y - this.padding.bottom, this.w, this.colors)
      this.padding.bottom += this.legend.getBBox().height + 8
      this.legend.translate((this.w - this.legend.getBBox().width) / 2, 0)
  
  


class Sai.LineChart extends Sai.Chart
  
  render: () ->
    this.drawLegend()
    this.addAxes('all')
    
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
        .render(this.colors and this.colors[series] or 'black', 2)
      )
    
    return this


class Sai.BarChart extends Sai.Chart
  
  groupsToNullPad: () ->
    return group for group of this.dataGroups()

  
  render: () ->
    this.drawLegend()
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
  
  groupsToNullPad: () ->
    return group for group of this.dataGroups()
  
  dataGroups: (data) ->
    {
      '__META__': ['__LABELS__']
      'volume': ['volume']
      'prices': seriesName for seriesName of data when this.caresAbout(seriesName) and seriesName not in ['__LABELS__', 'volume']
    }

  render: () ->
    this.addAxes('prices', {left: 30, right: 0, top: 0, bottom: 20}) #todo: set axis padding intelligently
    
    this.drawGuideline(0, 'prices')
    
    this.plots = this.r.set()
    
    vol: {
      'up': []
      'down': []
    }
    
    if 'volume' of this.ndata.volume
      for i in [0...this.ndata['volume']['volume'].length]
        if this.ndata['volume']['volume'][i] isnt null
          if i and this.ndata['prices']['close'][i-1] and (this.ndata['prices']['close'][i][1] < this.ndata['prices']['close'][i-1][1])
            vol.down.push(this.ndata['volume']['volume'][i])
            vol.up.push([this.ndata['volume']['volume'][i][0], 0])
          else
            vol.up.push(this.ndata['volume']['volume'][i])
            vol.down.push([this.ndata['volume']['volume'][i][0], 0])
        else
          vol.up.push([0, 0])
          vol.down.push([0, 0])
      
      this.plots.push(
        (new Sai.BarPlot(this.r
                         this.pOrigin[0],
                         this.pOrigin[1],
                         this.pw, this.ph * 0.2,
                         vol))
        .render(true, {'up': this.colors and this.colors['vol_up'] or '#666', 'down': this.colors and this.colors['vol_down'] or '#c66'})
      )
    
    this.plots.push(
      (new Sai.CandlestickPlot(this.r,
                               this.pOrigin[0],
                               this.pOrigin[1],
                               this.pw, this.ph
                               {'open': this.ndata['prices']['open'],
                                'close': this.ndata['prices']['close'],
                                'high': this.ndata['prices']['high'],
                                'low': this.ndata['prices']['low']
                               }))
      .render(this.colors, Math.min(5, (this.pw / this.ndata['prices']['open'].length) - 2))
    )
    
    for series of this.ndata['prices']
      continue if (series in ['open', 'close', 'high', 'low']) or series.match("^__")
      this.plots.push(
        (new Sai.LinePlot(this.r,
                          this.pOrigin[0],
                          this.pOrigin[1],
                          this.pw, this.ph,
                          this.ndata['prices'][series]))
        .render(this.colors and this.colors[series] or 'black')
      )
    
    return this
