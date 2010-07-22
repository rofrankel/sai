# A chart composes plots and organizes them with e.g. axes
class Sai.Chart

  constructor: (r, x, y, w, h, data, bgcolor, title_text, interactive) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
    
    this.setData(data)
    
    this.title_text = title_text
    this.interactive = interactive
    this.bgcolor = if bgcolor? then bgcolor else 'white'
    
    this.padding: {
      left: 2
      right: 2
      top: 2
      bottom: 2
    }
  
  groupsToNullPad: () ->
    return []
  
  setData: (data) ->
    this.data = {}
    
    # deep copy
    for series of data
      if  data[series] instanceof Array
        this.data[series] = data[series].slice(0)
      else
        this.data[series] = data[series]
    
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
  
  getYAxisVals: (min, max, nopad) ->
    nopad ?= false
    mag: Math.floor(rawmag: (Math.log(max - min) / Math.LN10) - 0.4)
    step: Math.pow(10, mag)
    if rawmag % 1 > 0.7 and not nopad
      step *= 4
    else if rawmag % 1 > 0.35 and not nopad
      step *= 2
    
    bottom: Sai.util.round(min - (if nopad then (step / 2.1) else (step / 1.9)), step)
    bottom: 0 if bottom < 0 <= min
    top: Sai.util.round(max + (if nopad then (step / 2.1) else (step / 1.9)), step)
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
      continue if group.match('^__')
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
    
    this.setPlotCoords()
    
    return this.r.set().push(this.haxis).push(this.vaxis)

  setPlotCoords: () ->
    this.px: this.x + this.padding.left
    this.py: this.y - this.padding.bottom
    this.pw: this.w - this.padding.left - this.padding.right
    this.ph: this.h - this.padding.bottom - this.padding.top
  
  drawBG: () ->
    this.bg: this.r.rect(this.px? and this.px or this.x,
                         this.py? and (this.py - this.ph) or (this.y - this.h),
                         this.pw? and this.pw or this.w,
                         this.ph? and this.ph or this.h).attr({fill: this.bgcolor, 'stroke-width': 0, 'stroke-opacity': 0}).toBack()
  
  logoPos: () ->
    w: 160
    h: 34
    [
      this.px + this.pw - w - 5,
      this.py - this.ph + 5,
      w,
      h
    ]
  
  drawLogo: () ->
    [x, y, w, h] = this.logoPos()
    this.logo: this.r.image(Sai.imagePath + 'logo.png', x, y, w, h).attr({opacity: 0.25})
  
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
                                      this.px,
                                      this.py,
                                      this.pw, this.ph,
                                      [[0, nh], [1, nh]]))
    .render('#ccc')
  
  drawLegend: (colors) ->
    colors ?= this.colors
    if colors
      this.legend: this.r.sai.prim.legend(this.x, this.y - this.padding.bottom, this.w, colors)
      this.padding.bottom += this.legend.getBBox().height + 15
      this.legend.translate((this.w - this.legend.getBBox().width) / 2, 0)
  
  drawTitle: () ->
    if this.title_text?
      this.title: this.r.text(this.x + (this.w / 2), this.y - this.h, this.title_text).attr({'font-size': 20})
      this.title.translate(0, this.title.getBBox().height / 2)
      this.padding.top += this.title.getBBox().height + 5
  
  # this reserves room for the info thing
  setupInfoSpace: () ->
    this.info_y: this.y - this.h + this.padding.top
    this.info_x: this.x + this.padding.left
    this.info_w: this.w - this.padding.left - this.padding.right
    this.padding.top += 30
  
  drawInfo: (info, clear) =>  
    clear ?= true
    
    # clear out anything that already exists
    if clear
      this.info_data: {}
    
    if this.info
      this.info.remove()
    
    for label of info
      unless label.match("^__")
        this.info_data[label]: info[label] isnt 'undefined' and info[label] or '(no data)'
    
    this.info: this.r.sai.prim.info(this.info_x, this.info_y, this.info_w, this.info_data)
  
  getIndex: (mx, my) ->
    tx: Sai.util.transformCoords({x: mx, y: my}, this.r.canvas).x
    return Math.round((this.data.__LABELS__.length - 1) * (tx - this.px) / this.pw)


class Sai.LineChart extends Sai.Chart
  
  render: () ->
    this.drawTitle()
    this.setupInfoSpace()
    this.drawLegend()
    this.addAxes('all')
    this.drawBG()
    this.drawLogo()
    
    this.drawGuideline(0)
    
    this.lines: []
    this.dots: this.r.set()
    this.plots: this.r.set()
    
    for series of this.ndata['all']
      if series is '__YVALS__'
        continue
      
      color: this.colors and this.colors[series] or 'black'
      
      line: (new Sai.LinePlot(this.r,
                              this.px,
                              this.py,
                              this.pw, this.ph,
                              this.ndata['all'][series]))
      .render(color, 3)
      
      this.lines.push(line)
      this.plots.push(line.set)
      this.dots.push(this.r.circle(0, 0, 4).attr({'fill': color}).hide())
    
    this.r.set().push(this.bg, this.plots, this.dots, this.logo).mousemove(
      (event) =>
        
        idx: this.getIndex(event.clientX, event.clientY)
        
        info: {}
        for series of this.ndata['all']
          if this.data[series]? then info[series]: this.data[series][idx]
        this.drawInfo(info)
        
        for i in [0...this.lines.length]
          pos: this.lines[i].dndata[idx]
          this.dots[i].attr({cx: pos[0], cy: pos[1]}).show().toFront()
        
    ).mouseout(
      (event) =>
        this.drawInfo({})
        this.dots.hide()
    )
    
    return this


class Sai.Sparkline extends Sai.Chart
  
  dataGroups: (data) ->
    {
      'data': ['data']
    }
  
  render: () ->
    this.drawBG()
    
    this.plots = this.r.set()
    
    this.plots.push(
      (new Sai.LinePlot(this.r,
                        this.x,
                        this.y,
                        this.w,
                        this.h,
                        this.ndata['data']['data']))
      .render(this.colors and this.colors[series] or 'black', 1)
      .set
    )
    
    return this


class Sai.BarChart extends Sai.Chart
  
  groupsToNullPad: () ->
    return group for group of this.dataGroups()

  
  render: () ->
    this.drawTitle()
    this.setupInfoSpace()
    this.drawLegend()
    this.addAxes('all', {left: 30, right: 0, top: 0, bottom: 20}) #todo: set axis padding intelligently
    this.drawLogo()
    this.drawBG()
    
    this.guidelines = this.r.set()
    for yval in this.ndata['all']['__YVALS__']
      this.drawGuideline(yval)
    
    this.plots = this.r.set()
    data: {}
    rawdata: {}
    for series of this.ndata['all']
      unless series.match('^__')
        data[series] = this.ndata['all'][series]
        rawdata[series] = this.data[series]
    
    this.plots.push(
      (new Sai.BarPlot(this.r,
                       this.px,
                       this.py,
                       this.pw,
                       this.ph,
                       data,
                       rawdata))
      .render(this.stacked?, this.colors, this.interactive, this.drawInfo)
      .set
    )
    
    return this


class Sai.StackedBarChart extends Sai.BarChart

  stacked: true
  
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
    this.drawTitle()
    this.setupInfoSpace()
    
    this.colors ?= {}
    this.colors['up'] ?= 'black'
    this.colors['down'] ?= 'red'
    this.colors['vol_up'] ?= '#666'
    this.colors['vol_down'] ?= '#c66'
    
    # this.drawLegend({up: this.colors.up, down: this.colors.down})
    
    this.addAxes('prices', {left: 30, right: 0, top: 0, bottom: 20}) #todo: set axis padding intelligently
    this.drawLogo()
    this.drawBG()
    
    this.drawGuideline(0, 'prices')
    
    this.plots = this.r.set()
    
    vol: {
      'up': []
      'down': []
    }
    
    rawdata: {}
    for p of this.ndata['prices']
      unless p.match('^__')
        rawdata[p]: this.data[p]
    if this.data['volume']? then rawdata['vol']: this.data['volume']
    
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
                         this.px,
                         this.py,
                         this.pw, this.ph * 0.2,
                         vol,
                         rawdata))
        .render(true, {'up': this.colors['vol_up'], 'down': this.colors['vol_down']}, this.interactive, this.drawInfo)
        .set
      )
    
    this.plots.push(
      (new Sai.CandlestickPlot(this.r,
                               this.px,
                               this.py,
                               this.pw, this.ph,
                               {'open': this.ndata['prices']['open'],
                                'close': this.ndata['prices']['close'],
                                'high': this.ndata['prices']['high'],
                                'low': this.ndata['prices']['low']
                               },
                               rawdata))
      .render(this.colors, Math.min(5, (this.pw / this.ndata['prices']['open'].length) - 2), false, this.drawInfo)
      .set
    )
    
    for series of this.ndata['prices']
      continue if (series in ['open', 'close', 'high', 'low']) or series.match("^__")
      this.plots.push(
        (new Sai.LinePlot(this.r,
                          this.px,
                          this.py,
                          this.pw, this.ph,
                          this.ndata['prices'][series]))
        .render(this.colors and this.colors[series] or 'black')
        .set
      )
    
    glow_width: this.pw / (this.data.__LABELS__.length - 1)
    this.glow: this.r.rect(this.px - (glow_width / 2), this.py - this.ph, glow_width, this.ph)
                      .attr({fill: "0-$this.bgcolor-#DDAA99-$this.bgcolor", 'stroke-width': 0, 'stroke-opacity': 0})
                      .toBack()
                      .hide()
    
    this.bg.toBack()
    
    this.r.set().push(this.bg, this.plots, this.logo, this.glow).mousemove(
      (event) =>
        
        idx: this.getIndex(event.clientX, event.clientY)
        
        info: {}
        notNull: true
        for series of this.ndata['prices']
          if this.data[series]? then info[series]: this.data[series][idx]
          if info[series] is null then notNull = false
        this.drawInfo(info)
        
        if notNull
          this.glow.attr({x: this.px + (glow_width * (idx - 0.5))}).show()
        
    ).mouseout(
      (event) =>
        this.drawInfo({})
        this.glow.hide()
    )
    
    return this


class Sai.GeoChart extends Sai.Chart
  
  normalize: (data) ->
    ndata = {}
    
    for series of data
      continue if series.match('^__')
      continue unless data[series]?
      max: Math.max.apply(Math, data[series])
      min: Math.min.apply(Math, data[series])
      ndata[series] = (data[series][i]? and [i / (data[series].length - 1), ((data[series][i]-min) / (max-min))] or null) for i in [0...data[series].length]
    
    return ndata
  
  
  dataGroups: (data) ->
    groups: {
      '__META__': seriesName for seriesName of data when seriesName.match("^__")
    }
    
    for seriesName of data
      unless seriesName.match("^__")
        groups[seriesName]: [seriesName]
    
    return groups
  
  
  drawHistogramLegend: (seriesNames) ->
    this.histogramLegend: this.r.set()
    extrapadding: 20
    height: Math.max(0.1 * (this.h - this.padding.bottom - this.padding.top), 50)
    width: Math.min(150, (this.w - this.padding.left - this.padding.right - extrapadding) / seriesNames.length)
    
    for i in [0...seriesNames.length]
      series: seriesNames[i]
      px: this.x + this.padding.left + (extrapadding / 2) + (i * width)
      data: this.ndata[series][j][1] for j in [0...this.ndata[series].length]
      min: Math.min.apply(Math, this.data[series])
      max: Math.max.apply(Math, this.data[series])
      yvals: this.getYAxisVals(min, max, true)
      minLabel: yvals[0]
      maxLabel: yvals[yvals.length - 1]
      this.histogramLegend.push(
        histogram: this.r.sai.prim.histogram(
          px,
          this.y - this.padding.bottom,
          width * 0.8, height,
          data,
          minLabel,
          maxLabel,
          series,
          this.colors[series], 'white'
        )
      )
      
      histogram.click( () => this.renderPlot(series) )
      .hover(
        ((set) =>
          () =>
            set.attr({'fill-opacity': 0.75})
            this.drawInfo({'Click to display on map': series})
        )(histogram)
        ,
        ((set) =>
          () =>
            set.attr({'fill-opacity': 1.0})
            this.drawInfo({})
        )(histogram)
      )
    
    
    this.histogramLegend.translate((this.w - this.padding.left - this.padding.right - this.histogramLegend.getBBox().width) / 2, 0)
    
    this.padding.bottom += height + 5
  
  renderPlot: (mainSeries) =>
    this.geoPlot?.set.remove()
    
    this.geoPlot: (new Sai.GeoPlot(
      this.r,
      this.px, this.py, this.pw, this.ph,
      this.ndata,
      this.data
    ))
    .render(this.colors or {}, this.data['__MAP__'], mainSeries, this.bgcolor, this.interactive, this.drawInfo)
  
  render: () ->
    this.drawTitle()
    this.setupInfoSpace()
    this.drawHistogramLegend(series for series of this.data when not series.match('^__'))
    
    this.setPlotCoords()
    
    this.drawLogo()
    this.drawBG()
    
    this.renderPlot(this.data['__DEFAULT__'])
    
    return this