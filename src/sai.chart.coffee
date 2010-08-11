# A chart composes plots and organizes them with e.g. axes
class Sai.Chart
  
  constructor: (@r, @x, @y, @w, @h, data, @opts) ->
    @opts ?= {}
    @opts.bgcolor ?= 'white'
    
    @setData(data)
    
    @padding = {
      left: 2
      right: 2
      top: 2
      bottom: 2
    }
  
  groupsToNullPad: () ->
    return []
  
  nonNegativeGroups: () ->
    []
  
  setData: (data) ->
    @data = {}
    
    # deep copy
    for series of data
      if data[series] instanceof Array
        @data[series] = data[series].slice(0)
      else
        @data[series] = data[series]
    
    # do any necessary null padding
    groups = @dataGroups(data)
    nngroups = @nonNegativeGroups()
    
    for group of groups
      if group in nngroups
        for series in groups[group]
          if @data[series]?
            for i in [0...@data[series].length]
              if @data[series][i] < 0 then @data[series][i] *= -1
    
    for group in @groupsToNullPad()
      for series in groups[group]
        @nullPad(series)
    
    @normalize(@data)
  
  nullPad: (seriesName) ->
    if seriesName of @data
      @data[seriesName] = [null].concat @data[seriesName].concat [null]
  
  # a line chart plots everything, but a stock chart only cares about e.g. high low open close avg vol
  caresAbout: (seriesName) ->
    return not seriesName.match("^__")
  
  # Used to determine whether a data series should be used to scale the overall chart.
  # For example, in a stock chart, volume doesn't scale the chart.
  dataGroups: (data) ->
    {
      'all': seriesName for seriesName of data when @caresAbout(seriesName)
      '__META__': seriesName for seriesName of data when seriesName.match("^__")
    }
  
  getYAxisVals: (min, max, nopad) ->
    if min is max then return [0, max, max * 2]
    
    nopad ?= false
    factor = 1
    while((max - min) * factor) < 10
      factor *= 10
    
    # scale everything up if neccessary, making the following simpler
    min *= factor
    max *= factor
    
    mag = Math.floor(rawmag = (Math.log(max - min) / Math.LN10) - 0.4)
    step = Math.pow(10, mag)
    if rawmag % 1 > 0.7 and not nopad
      step *= 4
    else if rawmag % 1 > 0.35 and not nopad
      step *= 2
    
    bottom = Sai.util.round(min - (if nopad then (step / 2.1) else (step / 1.9)), step)
    bottom = 0 if bottom <= 0 <= min
    top = Sai.util.round(max + (if nopad then (step / 2.1) else (step / 1.9)), step)
    
    # scale back down
    bottom /= factor
    top /= factor
    step /= factor
    
    return Sai.util.round(i, step) for i in [bottom..top] by step
  
  # takes e.g. groups[group], not just a group name
  getMax: (data, group) ->
    return Math.max.apply(Math, Math.max.apply(Math, d for d in data[series] when d? and typeof d is "number") for series in group when data[series]?)
  
  # takes e.g. groups[group], not just a group name
  getMin: (data, group) ->
    return Math.min.apply(Math, Math.min.apply(Math, d for d in data[series] when d? and typeof d is "number") for series in group when data[series]?)
  
  getStackedMax: (data, group) ->
    return Math.max.apply(Math, Sai.util.sumArray(data[series][i] for series in group) for i in [0...@data['__LABELS__'].length])
  
  # stacked charts generally have a 0 baseline
  getStackedMin: (data, group) ->
    return 0
  
  normalize: (data) ->
    groups = @dataGroups(data)
    @ndata = {}
    if @opts.stacked? then @stackedNdata = {}
    
    norm = (val, min, max) ->
      if typeof val is "number"
        if min is max
          return 1
        else
          return (val - min) / (max - min)
      
      return null
    
    for group of groups
      continue if group.match('^__')
      @ndata[group] = {}
      if @opts.stacked?
        @stackedNdata[group] = {}
        baselines = {}
      minf = if @opts.stacked then @getStackedMin else @getMin
      maxf = if @opts.stacked then @getStackedMax else @getMax
      min = minf(data, groups[group])
      max = maxf(data, groups[group])
      yvals = @getYAxisVals(min, max)
      min = yvals[0]
      max = yvals[yvals.length - 1]
      for series in groups[group]
        continue unless data[series]?
        @ndata[group][series] = (if data[series][i]? and (nval = norm(data[series][i], min, max)) isnt null then [i / (data[series].length - 1 or 1), nval] else null) for i in [0...data[series].length]
        if @opts.stacked?
          @stackedNdata[group][series] = []
          for i in [0...data[series].length]
            baseline = baselines[i] or 0
            stackedPoint = [i / (data[series].length - 1 or 1), if data[series][i]? and (nval = norm(data[series][i], min, max)) isnt null then nval + baseline else baseline]
            @stackedNdata[group][series].push(stackedPoint)
            baselines[i] = stackedPoint[1] unless stackedPoint is null
        
        @ndata[group].__YVALS__ = yvals
  
  addAxes: (group) ->
    
    LINE_HEIGHT = 10
    
    @axisWidth = 1.5
    
    # height of text + space between ticks and text + height of tick + height of axis
    haxis_height = LINE_HEIGHT + 2 + 10
    
    # the 5 is for the half a text line at the top tick
    @padding.top += 5
    # (over)estimate how much padding we need for the last label
    for i in [@data['__LABELS__'].length-1..0]
      if @data['__LABELS__'][i]?
        tmptext = @r.text(0, 0, Sai.util.prettystr(@data['__LABELS__'][i]))
        @padding.right += tmptext.getBBox().width / 2
        tmptext.remove()
        break
    
    
    vlen = @h - (@padding.bottom + haxis_height + @padding.top)
    @vaxis = @r.sai.prim.vaxis(@ndata[group].__YVALS__, @x + @padding.left, @y - (@padding.bottom + haxis_height), vlen, @axisWidth)
    @vaxis.translate(@vaxis.getBBox().width, 0)
    @padding.left += @vaxis.getBBox().width
    
    hlen = @w - @padding.left - @padding.right
    @haxis = @r.sai.prim.haxis(@data['__LABELS__'], @x + @padding.left, @y - @padding.bottom, hlen, @axisWidth)
    @haxis.translate(0, -haxis_height)
    @padding.bottom += haxis_height
    
    @setPlotCoords()
    
    return @r.set().push(@haxis).push(@vaxis)

  setPlotCoords: () ->
    @px = @x + @padding.left
    @py = @y - @padding.bottom
    @pw = @w - @padding.left - @padding.right
    @ph = @h - @padding.bottom - @padding.top
  
  drawBG: () ->
    @bg = @r.rect(
      @px? and @px or @x,
      @py? and (@py - @ph) or (@y - @h),
      @pw? and @pw or @w,
      @ph? and @ph or @h
    ).attr({fill: @opts.bgcolor, 'stroke-width': 0, 'stroke-opacity': 0}).toBack()
  
  logoPos: () ->
    w = 160
    h = 34
    [
      @px + @pw - w - 5,
      @py - @ph + 5,
      w,
      h
    ]
  
  drawLogo: () ->
    [x, y, w, h] = @logoPos()
    @logo = @r.image(Sai.imagePath + 'logo.png', x, y, w, h).attr({opacity: 0.25})
  
  render: () ->
    @plot ?= new Sai.Plot(@r)
    @plot.render()
    return this
  
  # map from series name to color
  setColors: (colors) ->
    @colors ?= {}
    for series of colors
      if series of @data
        @colors[series] = colors[series]
    return this
  
  setColor: (series, color) ->
    @colors ?= {}
    @colors[series] = color
    return this
  
  drawGuideline: (h, group) ->
    group ?= 'all'
    ymin = @ndata[group].__YVALS__[0]
    ymax = @ndata[group].__YVALS__[@ndata[group].__YVALS__.length - 1]
    return unless h > ymin 
    nh = (h - ymin) / (ymax - ymin)
    
    @guidelines ?= @r.set()
    
    guideline = new Sai.LinePlot(
      @r,
      @px,
      @py,
      @pw, @ph,
      {'guideline': [[0, nh], [1, nh]]}
    )
    
    guideline.render({'guideline': '#ccc'})
    
    @guidelines.push(guideline.set)
  
  drawLegend: (colors) ->
    colors ?= @colors
    if colors
      @legend = @r.sai.prim.legend(@x, @y - @padding.bottom, @w, colors)
      @padding.bottom += @legend.getBBox().height + 15
      @legend.translate((@w - @legend.getBBox().width) / 2, 0)
  
  drawTitle: () ->
    if @opts.title?
      @title = @r.text(@x + (@w / 2), @y - @h, @opts.title).attr({'font-size': 20})
      @title.translate(0, @title.getBBox().height / 2)
      @padding.top += @title.getBBox().height + 5
  
  # this reserves room for the info thing
  setupInfoSpace: () ->
    @info_y = @y - @h + @padding.top
    @info_x = @x + @padding.left
    @info_w = @w - @padding.left - @padding.right
    @padding.top += 30
  
  drawInfo: (info, clear) =>  
    clear ?= true
    
    info ?= if @default_info? then @default_info() else {}
    
    # clear out anything that already exists
    if clear
      @info_data = {}
    
    if @info
      @info.remove()
    
    for label of info
      unless label.match("^__")
        @info_data[label] = info[label] or '(no data)'
    
    @info = @r.sai.prim.info(@info_x, @info_y, @info_w, @info_data)
  
  getIndex: (evt) ->
    tx = Sai.util.transformCoords(evt, @r.canvas).x
    return Math.round((@data.__LABELS__.length - 1) * (tx - @px) / @pw)


class Sai.LineChart extends Sai.Chart
  
  nonNegativeGroups: () ->
    if @opts.stacked then ['all'] else []
  
  render: () ->
    @drawTitle()
    @setupInfoSpace()
    @drawLegend()
    @addAxes('all')
    @drawBG()
    @drawLogo()
    
    @drawGuideline(0)
    
    @lines = []
    @dots = @r.set()
    
    ndata = if @opts.stacked? then @stackedNdata else @ndata
    
    plotType = if @opts.area then Sai.AreaPlot else Sai.LinePlot
    
    @plot = (new plotType(
      @r,
      @px, @py, @pw, @ph,
      ndata['all'],
    ))
    .render(@colors, 2, @opts.stacked)
    
    for series of ndata['all']
      if series is '__YVALS__'
        continue
      
      color = @colors and @colors[series] or 'black'
      
      @dots.push(@r.circle(0, 0, 4).attr({'fill': color}).hide())
    
    everything = @r.set().push(@bg, @plot.set, @dots, @logo, @guidelines).mousemove(
      moveDots = (event) =>
        
        idx = @getIndex(event)
        
        info = {}
        for series of ndata['all']
          if @data[series]? then info[series] = @data[series][idx]
        @drawInfo(info)
        
        i = 0
        for series of @plot.dndata when not series.match('^__')
          pos = @plot.dndata[series][idx]
          if pos? then @dots[i].attr({cx: pos[0], cy: pos[1]}).show().toFront() else @dots[i].hide()
          i++
        
    ).mouseout(
      (event) =>
        @drawInfo({}, true)
        @dots.hide()
    )
    
    @logo?.toFront()
    
    return this


class Sai.Sparkline extends Sai.Chart
  
  dataGroups: (data) ->
    {
      'data': ['data']
    }
  
  render: () ->
    @drawBG()
    
    @plots = @r.set()
    
    @plots.push(
      (new Sai.LinePlot(@r,
                        @x,
                        @y,
                        @w,
                        @h,
                        @ndata['data']))
      .render({data: @colors and @colors[series] or 'black'}, 1)
      .set
    )
    
    return this


class Sai.BarChart extends Sai.Chart
  
  getMin: (data, group) ->
    return 0
  
  groupsToNullPad: () ->
    return group for group of @dataGroups()

  nonNegativeGroups: () ->
    return group for group of @dataGroups()
  
  render: () ->
    @drawTitle()
    @setupInfoSpace()
    @drawLegend()
    @addAxes('all')
    @drawLogo()
    @drawBG()
    
    @guidelines = @r.set()
    for yval in @ndata['all']['__YVALS__']
      @drawGuideline(yval)
    
    @plots = @r.set()
    data = {}
    rawdata = {}
    
    ndata = if @opts.stacked? then @stackedNdata else @ndata
    
    for series of ndata['all']
      unless series.match('^__')
        data[series] = ndata['all'][series]
        rawdata[series] = @data[series]
    
    @plots.push(
      (new Sai.BarPlot(@r,
                       @px,
                       @py,
                       @pw,
                       @ph,
                       data,
                       rawdata))
      .render(@opts.stacked?, @colors, @opts.interactive, @drawInfo)
      .set
    )
    
    @logo?.toFront()
    
    return this


class Sai.StockChart extends Sai.Chart
  
  groupsToNullPad: () ->
    return group for group of @dataGroups()
  
  dataGroups: (data) ->
    {
      '__META__': ['__LABELS__']
      'volume': ['volume']
      'prices': seriesName for seriesName of data when @caresAbout(seriesName) and seriesName not in ['__LABELS__', 'volume']
    }
  
  nonNegativeGroups: () ->
    ['volume']

  render: () ->
    @drawTitle()
    @setupInfoSpace()
    
    avgColors = {}
    shouldDrawLegend = false
    for series of @ndata['prices'] when series not in ['open', 'close', 'high', 'low'] and not series.match('^__')
      avgColors[series] = @colors?[series] or 'black'
      shouldDrawLegend = true
    if shouldDrawLegend then @drawLegend(avgColors)
    
    @colors ?= {}
    @colors['up'] ?= 'black'
    @colors['down'] ?= 'red'
    @colors['vol_up'] ?= '#666666'
    @colors['vol_down'] ?= '#cc6666'
    
    # @drawLegend({up: @colors.up, down: @colors.down})
    
    @addAxes('prices')
    @drawLogo()
    @drawBG()
    
    @drawGuideline(0, 'prices')
    
    @plots = @r.set()
    
    vol = {
      'up': []
      'down': []
    }
    
    rawdata = {}
    for p of @ndata['prices']
      unless p.match('^__')
        rawdata[p] = @data[p]
    if @data['volume']? then rawdata['vol'] = @data['volume']
    
    if 'volume' of @ndata.volume
      for i in [0...@ndata['volume']['volume'].length]
        if @ndata['volume']['volume'][i] isnt null
          if i and @ndata['prices']['close'][i-1] and (@ndata['prices']['close'][i][1] < @ndata['prices']['close'][i-1][1])
            vol.down.push(@ndata['volume']['volume'][i])
            vol.up.push([@ndata['volume']['volume'][i][0], 0])
          else
            vol.up.push(@ndata['volume']['volume'][i])
            vol.down.push([@ndata['volume']['volume'][i][0], 0])
        else
          vol.up.push([0, 0])
          vol.down.push([0, 0])
      
      @plots.push(
        (new Sai.BarPlot(@r
                         @px,
                         @py,
                         @pw, @ph * 0.2,
                         vol,
                         rawdata))
        .render(true, {'up': @colors['vol_up'], 'down': @colors['vol_down']})
        .set
      )
    
    @plots.push(
      (new Sai.CandlestickPlot(@r,
                               @px,
                               @py,
                               @pw, @ph,
                               {
                                'open': @ndata['prices']['open'],
                                'close': @ndata['prices']['close'],
                                'high': @ndata['prices']['high'],
                                'low': @ndata['prices']['low']
                               },
                               rawdata))
      .render(@colors, Math.min(5, (@pw / @ndata['prices']['open'].length) - 2))
      .set
    )
    
    
    avgNdata = {}
    for series of @ndata['prices']
      unless (series in ['open', 'close', 'high', 'low']) or series.match("^__")
        avgNdata[series] = @ndata['prices'][series]
    
    @plots.push(
      (new Sai.LinePlot(@r,
                        @px, @py, @pw, @ph,
                        avgNdata))
      .render(@colors)
      .set
    )
    
    
    
    glow_width = @pw / (@data.__LABELS__.length - 1)
    @glow = @r.rect(@px - (glow_width / 2), @py - @ph, glow_width, @ph)
                      .attr({fill: "0-#{@opts.bgcolor}-#DDAA99-#{@opts.bgcolor}", 'stroke-width': 0, 'stroke-opacity': 0})
                      .toBack()
                      .hide()
    
    @bg.toBack()
    
    everything = @r.set().push(@bg, @plots, @logo, @glow, @guidelines).mousemove(
      moveGlow = (event) =>
        
        idx = @getIndex(event)
        
        info = {}
        notNull = false
        for series of @ndata['prices'] when not series.match('^__')
          if @data[series]?[idx]?
            info[series] = @data[series][idx]
            notNull = true
        if @data['volume']?[idx]?
          info['volume'] = @data['volume'][idx]
          notNull = true
        @drawInfo(info)
        if notNull
          @glow.attr({x: @px + (glow_width * (idx - 0.5))}).show()
        
    ).mouseout(
      (event) =>
        @drawInfo({}, true)
        @glow.hide()
    )
    
    @logo?.toFront()
    
    return this


class Sai.GeoChart extends Sai.Chart
  
  plotType: Sai.GeoPlot
  interactiveHistogram: true
  
  getMax: (data, series) ->
    Math.max.apply(Math, data)
  
  getMin: (data, series) ->
    Math.min.apply(Math, data)
  
  normalize: (data) ->
    @ndata = {}
    @bounds = {}
    maxes = {}
    mins = {}
    
    for series of data
      continue if series.match('^__')
      continue unless data[series]?
      dataWithoutNulls = d for d in data[series] when d?
      maxes[series] = @getMax(dataWithoutNulls, series)
      if not overallMax? or maxes[series] > overallMax then overallMax = maxes[series]
      mins[series] = @getMin(dataWithoutNulls, series)
      if not overallMin? or mins[series] < overallMin then overallMin = mins[series]
    
    for series of data
      continue if series.match('^__')
      continue unless data[series]?
      if @opts.groupedNormalization
        max = overallMax
        min = overallMin
      else
        max = maxes[series]
        min = mins[series]
      @bounds[series] = [min, max]
      @ndata[series] = (if data[series][i]? then [i / (data[series].length - 1), ((data[series][i]-min) / (max-min))] else null) for i in [0...data[series].length]
  
  
  dataGroups: (data) ->
    groups = {
      '__META__': seriesName for seriesName of data when seriesName.match("^__")
    }
    
    for seriesName of data
      unless seriesName.match("^__")
        groups[seriesName] = [seriesName]
    
    return groups
  
  drawHistogramLegend: (seriesNames) ->
    @histogramLegend = @r.set()
    extrapadding = 20
    height = Math.max(0.1 * (@h - @padding.bottom - @padding.top), 50)
    width = Math.min(150, (@w - @padding.left - @padding.right - extrapadding) / seriesNames.length)
    
    for i in [0...seriesNames.length]
      series = seriesNames[i]
      px = @x + (i * width)
      data = @ndata[series][j][1] for j in [0...@ndata[series].length] when @ndata[series][j]?
      
      if @bounds?[series]?
        [min, max] = @bounds[series]
      else
        dataWithoutNulls = x for x in @data[series] when x?
        [min, max] = [Math.min.apply(Math, dataWithoutNulls), Math.max.apply(Math, dataWithoutNulls)]
      
      yvals =  @getYAxisVals(min, max, true)
      minLabel = yvals[0]
      maxLabel = yvals[yvals.length - 1]
      @histogramLegend.push(
        histogram = @r.sai.prim.histogram(
          px,
          @y - @padding.bottom,
          width * 0.8, height,
          data,
          minLabel,
          maxLabel,
          series,
          @colors[series],
          'white',
          @opts.fromWhite
        )
      )
      
      if @opts.interactive then @setupHistogramInteraction(histogram, series)
    
    @histogramLegend.translate((@w - @padding.left - @padding.right - @histogramLegend.getBBox().width) / 2, 0)
    @padding.bottom += height + 5

  setupHistogramInteraction: (histogram, series) ->  
    histogram.click( () => @renderPlot(series) )
    .hover(
      ((set) =>
        () =>
          set.attr({'fill-opacity': 0.75})
          @drawInfo({'Click to display on map': series})
      )(histogram)
      ,
      ((set) =>
        () =>
          set.attr({'fill-opacity': 1.0})
          @drawInfo()
      )(histogram)
    )
  
  renderPlot: (mainSeries) =>
    
    @geoPlot?.set.remove()
    
    @geoPlot = (new @plotType(
      @r,
      @px, @py, @pw, @ph,
      @ndata,
      @data,
      {fromWhite: @opts.fromWhite}
    ))
    .render(@colors or {}, @data['__MAP__'], mainSeries, @opts.bgcolor, @opts.interactive, @drawInfo)
    
    @logo?.toFront()
  
  default_info: () ->
    {'': if @opts.interactive then 'Click histogram below to change map display' else ''}

  render: () ->
    
    @drawTitle()
    @setupInfoSpace()
    @drawHistogramLegend(series for series of @data when not series.match('^__'))
    
    @setPlotCoords()
    
    @drawLogo()
    @drawBG()
    @drawInfo()
    
    @renderPlot(@data['__DEFAULT__'])
    
    return this


class Sai.ChromaticGeoChart extends Sai.GeoChart
  
  plotType: Sai.ChromaticGeoPlot
  interactiveHistogram: false
  
  default_info: () ->
    {}
  
  setupHistogramInteraction: (histogram, series) ->  
    false


