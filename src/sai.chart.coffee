# A chart composes plots and organizes them with e.g. axes
class Sai.Chart
  
  constructor: (@r, @x, @y, @w, @h, data, @__LABELS__, @opts) ->
    @opts ?= {}
    @opts.bgcolor ?= 'white'
    
    @setData(data)
    
    init_padding = if @opts.simple then 0 else 5
    
    @padding = {
      left: init_padding
      right: init_padding
      top: init_padding
      bottom: init_padding
    }
  
  groupsToNullPad: () ->
    return []
  
  nonNegativeGroups: () ->
    []
  
  nextSeriesSuffix: () ->
    @suffixCtr = (@suffixCtr ? 0) + 1
    return "[#{@suffixCtr}]"
  
  fixSeriesName: (seriesName) ->
    return seriesName + (if seriesName.match(/^\s+$/) then @nextSeriesSuffix() else '')
  
  setSemanticRename: (seriesName) ->
    return unless @semanticRenamePatterns?
    @semanticRenames ?= {}
    for rename of @semanticRenamePatterns
      if seriesName.match(@semanticRenamePatterns[rename])
        @semanticRenames[rename] = seriesName
  
  getBaseline: (group) ->
    nh0 = @normalizedHeight(0, group ? 'all')
    return [[0,nh0],[1,nh0]]
  
  setData: (data) ->
    
    @data = {}
    @renames = {}
    
    empty = (obj) ->
      for e of obj
        if obj.hasOwnProperty(e) then return false
      return true
    
    if empty(data)
      @render = ->
        @showError("(no data -> empty chart)")
      return
    
    # deep copy
    for series of data
      loop
        seriesName = @fixSeriesName(series)
        @setSemanticRename(seriesName)
        break if seriesName is series or seriesName not of data
      
      @renames[series] = seriesName
      
      if data[series] instanceof Array
        if @__LABELS__ is series
          @__LABELS__ = seriesName
          @data[seriesName] = String(d) for d in data[series]
        else
          @data[seriesName] = (if typeof d is 'string' and d.match(/^[+-]?[\d,]+(\.\d+)?$/) and not isNaN(pd = parseFloat(d.replace(/,/g, ''))) then pd else d) for d in data[series]
      else
        @data[seriesName] = data[series]
    
    groups = @dataGroups(@data)
    nngroups = @nonNegativeGroups()
    for group of groups when groups[group].length > 0
      if group in nngroups
        for series in groups[group]
          if @data[series]?
            for i in [0...@data[series].length]
              if @data[series][i] < 0 then @data[series][i] *= -1
    
    # do any necessary null padding
    for group in @groupsToNullPad() when group of groups
      for series in groups[group]
        @nullPad(series)
    
    @normalize(@data)
  
  nullPad: (seriesName) ->
    if seriesName of @data
      @data[seriesName] = [null].concat(@data[seriesName].concat([null]))
  
  # a line chart plots everything, but a stock chart only cares about e.g. high low open close avg vol
  caresAbout: (seriesName) ->
    return not (seriesName.match("^__") or seriesName is @__LABELS__)
  
  # Used to determine whether a data series should be used to scale the overall chart.
  # For example, in a stock chart, volume doesn't scale the chart.
  dataGroups: (data) ->
    {
      'all': seriesName for seriesName of data when @caresAbout(seriesName)
      '__META__': seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__
    }
  
  getYAxisVals: (min, max, nopad) ->
    return [min, max] unless typeof min is "number" and typeof max is "number"
    
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
    
    bottom = Sai.util.round(min - (if nopad then (step / 2.1) else (step / 1.75)), step)
    bottom = 0 if bottom < 0 <= min
    top = Sai.util.round(max + (if nopad then (step / 2.1) else (step / 1.75)), step)
    
    # scale back down
    bottom /= factor
    top /= factor
    step /= factor
    
    i = bottom
    vals = [i]
    while i < top
      i = Sai.util.round(i + step, step)
      vals.push(i)
    
    return vals
  
  # takes e.g. groups[group], not just a group name
  getMax: (data, group) ->
    return Math.max.apply(Math, Math.max.apply(Math, d for d in data[series] when d? and typeof d is "number") for series in group when data[series]?)
  
  # takes e.g. groups[group], not just a group name
  getMin: (data, group) ->
    return Math.min.apply(Math, Math.min.apply(Math, d for d in data[series] when d? and typeof d is "number") for series in group when data[series]?)
  
  getStackedMax: (data, group) ->
    @stackedMax ?= {}
    @stackedMax[group] = @stackedMax[group] ? Math.max.apply(Math, Sai.util.sumArray(data[series][i] for series in group when series isnt @__LABELS__ and data[series][i] >= 0) for i in [0...data[@__LABELS__].length])
    return @stackedMax[group]
  
  # stacked charts generally have a 0 baseline
  getStackedMin: (data, group) ->
    @stackedMin ?= {}
    @stackedMin[group] = @stackedMin[group] ? Math.min.apply(Math, Sai.util.sumArray(data[series][i] for series in group when series isnt @__LABELS__ and data[series][i] < 0) for i in [0...data[@__LABELS__].length])
    return @stackedMin[group]
  
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
    
    all = (f, a) ->
      for e in a
        if not f(e) then return false
      return true
    
    empty = (a) ->
      for e in a
        if typeof e is 'number' then return false
      return true
    
    for group of groups
      continue if group.match('^__') or Sai.util.sumArray(@data[series].length for series in groups[group]) is 0 or all(empty, @data[series] for series in groups[group])
      
      @ndata[group] = {}
      if @opts.stacked?
        @stackedNdata[group] = {}
        baselines = {}
      
      minf = if @opts.stacked then (d, g) => return @getStackedMin(d, g) else @getMin
      maxf = if @opts.stacked then (d, g) => return @getStackedMax(d, g) else @getMax
      min = minf(data, groups[group])
      max = maxf(data, groups[group])
      yvals = @getYAxisVals(min, max)
      min = yvals[0]
      max = yvals[yvals.length - 1]
      @ndata[group]['__YVALS__'] = yvals
      
      for series in groups[group]
        continue unless data[series]?
        @ndata[group][series] = (if data[series][i]? and (nval = norm(data[series][i], min, max)) isnt null then [i / (data[series].length - 1 or 1), nval] else null) for i in [0...data[series].length]
        if @opts.stacked?
          norm0 = norm(0, min, max)
          @stackedNdata[group][series] = []
          for i in [0...data[series].length]
            bli = if data[series][i]? and data[series][i] < 0 then 0 else 1
            baselines[i] ?= [norm0, norm0]
            baseline = baselines[i][bli]
            stackedPoint = [i / (data[series].length - 1 or 1), ((norm(data[series][i], min, max) ? norm0) - norm0) + baseline]
            @stackedNdata[group][series].push(stackedPoint)
            baselines[i][bli] = stackedPoint[1] unless stackedPoint is null
  
  addAxes: (groups, titles) ->
    
    LINE_HEIGHT = 10
    
    @axisWidth = 1.5
    
    # the 5 is for the half a text line at the top tick
    @padding.top += 5
    # (over)estimate how much padding we need for the last label
    for i in [@data[@__LABELS__].length-1..0]
      if @data[@__LABELS__][i]?
        tmptext = @r.text(0, 0, Sai.util.prettystr(@data[@__LABELS__][i]))
        @padding.right += tmptext.getBBox().width / 2
        tmptext.remove()
        break
    
    vlen = @h - (@padding.bottom + @padding.top)
    
    doLeftAxis = @ndata[groups[0]]? or not @ndata[groups[1]]?
    doRightAxis = @ndata[groups[1]]?
    
    if doLeftAxis
      _vaxis = @r.sai.prim.vaxis(
        @ndata[groups[0]]?['__YVALS__'] ? [0, '?'],
        @x + @padding.left,
        @y - @padding.bottom,
        vlen,
        {width: @axisWidth, title: titles?.left}
      )
      vaxis_width = _vaxis.items[0].getBBox().width
      _vaxis.remove()
    else
      vaxis_width = 0
      
    if doRightAxis
      _vaxis = @r.sai.prim.vaxis(
        @ndata[groups[1]]?['__YVALS__'] ? [0, '?'],
        @x + @padding.left,
        @y - @padding.bottom,
        vlen,
        {width: @axisWidth, title: titles?.right}
      )
      vaxis2_width = _vaxis.getBBox().width
      _vaxis.remove()
    else
      vaxis2_width = 0
    
    hlen = @w - @padding.left - @padding.right - vaxis_width - vaxis2_width
    @haxis = @r.sai.prim.haxis(
      @data[@__LABELS__],
      @x + @padding.left + vaxis_width,
      @y - @padding.bottom,
      hlen,
      {width: @axisWidth,title: titles?.bottom}
    )
    hbb = @haxis.getBBox()
    haxis_height = hbb.height
    if isNaN(haxis_height) then haxis_height = 1
    @haxis.translate(0, -haxis_height)
    @padding.bottom += haxis_height
    
    vlen = @h - (@padding.bottom + @padding.top)
    
    if doLeftAxis
      @vaxis = @r.sai.prim.vaxis(
        @ndata[groups[0]]?['__YVALS__'] ? [0, '?'],
        @x + @padding.left,
        @y - @padding.bottom,
        vlen,
        {width: @axisWidth, title: titles?.left}
      )
      vbbw = @vaxis.items[0].getBBox().width
      @vaxis.translate(vbbw, 0)
      @padding.left += vbbw
    
    if doRightAxis
      @vaxis_right = @r.sai.prim.vaxis(
        @ndata[groups[1]]?['__YVALS__'] ? [0, '?'],
        @w - @padding.right,
        @y - @padding.bottom,
        vlen,
        {width: @axisWidth, right: true, title: titles?.right, color: if @ndata[groups[0]]? then @colors.__RIGHTAXIS__ ? 'blue' else 'black'}
      )
      vrbbw = @vaxis_right.items[0].getBBox().width
      @vaxis_right.translate(-vrbbw, 0)
      @padding.right += vrbbw
    
    @setPlotCoords()
    
    return @r.set().push(@haxis).push(@vaxis)

  setPlotCoords: () ->
    @px = @x + @padding.left
    @py = @y - @padding.bottom
    @pw = @w - @padding.left - @padding.right
    @ph = @h - @padding.bottom - @padding.top
    
    lbb = @legend?.getBBox()
    @legend?.translate(@px + @pw/2 - (lbb.x + lbb.width/2), 0)
    
    hlbb = @histogramLegend?.getBBox()
    @histogramLegend?.translate(@px + @pw/2 - (hlbb.x + hlbb.width/2), 0)
  
  drawBG: () ->
    @bg = @r.rect(
      @px? and @px or @x,
      @py? and (@py - @ph) or (@y - @h),
      @pw? and @pw or @w,
      @ph? and @ph or @h
    ).attr({fill: @opts.bgcolor, 'stroke-width': 0, 'stroke-opacity': 0}).toBack()
  
  logoPos: () ->
    w = 150
    h = 28
    x = if @px? and @pw? then @px + @pw - w - 5 else @w + @x - w - @padding.right
    y = if @py? and @ph? then @py - @ph + 5 else @y - @h + @padding.top
    return [x, y, w, h]
  
  drawLogo: () ->
    return if @opts.simple
    
    [x, y, w, h] = @logoPos()
    
    path_width = 344
    path_height = 65
    path_start_offset = [328.3, 53.06]
    scale = [w / path_width, h / path_height]
    
    x += path_start_offset[0] * scale[0]
    y += path_start_offset[1] * scale[1]
    
    logo_path = "M#{x},#{y}h1.9v1.6c0.5-0.5,0.9-0.9,1.3-1.2,0.6-0.4,1.4-0.7,2.2-0.7,0.9,0,1.6,0.3,2.2,0.7,0.3,0.3,0.6,0.7,0.9,1.2,0.4-0.7,0.9-1.1,1.5-1.4,0.6-0.3,1.2-0.5,2-0.5,1.5,0,2.6,0.6,3.1,1.7,0.3,0.6,0.5,1.4,0.5,2.5v7.7h-2v-8.1c0-0.7-0.2-1.3-0.6-1.6-0.4-0.2-0.9-0.4-1.4-0.4-0.8,0-1.4,0.3-2,0.8-0.5,0.5-0.8,1.3-0.8,2.5v6.8h-2v-7.6c0-0.8-0.1-1.3-0.3-1.7-0.3-0.5-0.8-0.8-1.6-0.8-0.8,0-1.4,0.3-2,0.8-0.6,0.6-0.9,1.6-0.9,3.1v6.2h-2v-11.6zm-3.9,1.1c1,1,1.5,2.5,1.5,4.4,0,1.9-0.4,3.4-1.3,4.7-0.9,1.2-2.3,1.8-4.2,1.8-1.6,0-2.9-0.6-3.8-1.6-0.9-1.1-1.4-2.6-1.4-4.4,0-1.9,0.5-3.5,1.5-4.6,1-1.2,2.3-1.7,3.9-1.7,1.5,0,2.8,0.5,3.8,1.4zm-1.2,7.7c0.5-0.9,0.7-2,0.7-3.2,0-1.1-0.2-2-0.5-2.6-0.6-1.1-1.5-1.6-2.8-1.6-1.2,0-2,0.4-2.6,1.3-0.5,0.9-0.8,2-0.8,3.3,0,1.2,0.3,2.2,0.8,3.1,0.6,0.8,1.4,1.2,2.6,1.2,1.2,0,2.1-0.5,2.6-1.5zm-10.6-8.2c0.8,0.6,1.3,1.7,1.5,3.3h-1.9c-0.1-0.7-0.4-1.3-0.8-1.8-0.4-0.5-1.1-0.7-2-0.7-1.2,0-2.1,0.6-2.6,1.8-0.4,0.8-0.6,1.8-0.6,2.9,0,1.2,0.3,2.1,0.8,2.9,0.5,0.8,1.2,1.2,2.3,1.2,0.8,0,1.4-0.2,1.9-0.7,0.5-0.5,0.8-1.2,1-2h1.9c-0.2,1.5-0.8,2.6-1.7,3.3-0.8,0.7-1.9,1.1-3.3,1.1-1.5,0-2.7-0.6-3.6-1.7-0.9-1.1-1.3-2.4-1.3-4.1,0-2,0.5-3.6,1.4-4.7,1-1.2,2.3-1.7,3.8-1.7,1.3,0,2.4,0.3,3.2,0.9zm-13.3,8.6h2.2v2.4h-2.2v-2.4zm-181-15.8-6,12.9h-7.6c-0.9-0.4-4.5-6-5.3-7.2-3.3-4.5-6.8-8.9-10.1-13.5-1.2-1.7-2.8-3.2-4-5.1h-8.9v-2.8h17.7c3.4,0,7.2,0.3,9.6-0.8,2.2-0.9,3.9-2.5,5.2-4.3,1.1-1.7,2.8-4.6,2.1-8-1.2-4.9-4-7.791-8.5-9.251-2.6-0.81-9.8-0.61-9.8-0.61h-21v56.361h4.7v-26h6.5c6.4,8.6,12.9,17.3,19.3,26h12.9l6.5-13.1h34.5l6.4,13.1h5.4l-8.6-17.7h-41zm-41.9-34.10h17.7c4.5,0,7.8-0.1,10,2.1,1.1,1.1,2.8,3.2,2.1,5.9-0.5,2.2-1.9,4-3.9,4.8-2,0.9-5.8,0.7-8.4,0.7h-17.5v-13.50zm61.1-4.751-17.4,36.051h37.5l-17.4-36.051h-2.7zm-9.9,31.251,11-22.9,11.4,22.9h-22.4zm-127.60-26.500h25.800v51.8h4.7v-56.361h-30.500v4.561zm276.70-12.341-35.6,29.741v-29.741h-4.8v39.441l48-39.441h-7.6zm19.4,0h-7.4l-32.3,26.941,32.3,37.2h6.2l-31.6-36.400,32.8-27.741zm-163.3,0-25.1,50.841-5.9-7.8-3.4-4.5v-0.4c9.7,0,16-4.9,18.8-11.6,4.8-11.3-2.7-21.961-10.4-25.211-3.4-1.44-8-1.33-12.9-1.33h-20.3h-73.600v4.74h64.100v2.97l-30.7,0.1v56.331h4.7v-51.8h26v51.8h4.7v-59.401h22.8c4,0,8.8-0.46,12,0.57,3.4,1.12,5.9,3.35,7.7,6.031,1.7,2.6,3.5,7.2,2.1,11.6-0.7,2.3-1.9,4.2-3.2,5.9-1.3,1.7-4.4,3.4-6.6,4.2-1,0.3-3.1,0.5-3.1,0.5h-11.5c5.6,7.7,11.3,15.3,17,23h4.4c0.6-0.4,25-50.151,25.4-51.801h6.1l29.2,59.401h5.1l-31.3-64.141h-12.1zm103.5,43.641v20.5h4.8v-18.2l12.5-10.5,25,28.7h6.3l-30.6-35.1-18,14.6zm-7.7-28.3c-6.1-9.141-17.1-15.251-29.6-15.251-19.2,0-34.8,14.351-34.8,32.151,0,17.7,15.6,32.1,34.8,32.1,10.5,0,22.4-4.1,29.7-10.8v10.6h4.8v-19c-1.7,0.8-3.3,1.8-4.9,2.8v0.1c-10.9,7.1-19.4,11.2-29.9,11.3-16.4,0-29.6-12.2-29.6-27.2,0-15.1,13.2-27.311,29.6-27.311,11.5,0,21.5,6.011,26.4,14.811,0,0,2.2-1.4,3.5-2.2v20.8c-1.3,0.9-4.5,3.3-4.6,3.4-8.2,5.4-17.9,10.3-25.5,10.4-12,0-21.7-9-21.7-19.9,0-11,9.7-19.9,21.7-19.9,8.4,0,15.7,4.4,19.3,10.8l0.1,0.1c0.2,0.2,0.5,0.2,0.7,0.1,0,0,0.1-0.1,0.1-0.1,0.1-0.1,0.9-0.6,1.7-1,0.4-0.3,0.8-0.5,1.1-0.7,0.1,0,0.2-0.1,0.3-0.2h0.1l0.1-0.1c0.2-0.1,0.3-0.5,0.1-0.7-4.5-7.8-13.3-12.971-23.4-12.971-14.8,0-26.7,11.071-26.7,24.771,0,13.7,11.9,24.7,26.7,24.7,9.6,0,25.4-8.1,29.9-12.2,1.6-1.1,3.1-2.4,4.9-3.2v-41.561h-4.9v15.361z"
    
    @logo = @r.path(logo_path)
    .hide()
    .attr({
      fill: @opts.logoColor ? '#AA5128'
      'stroke-width': 0
      'stroke-opacity': 0
      opacity: 0.25
      cx: x + w/2
      cy: y - h/2
    })
    .scale(scale[0], scale[1], x, y)
    .show()
  
  drawFootnote: (text) ->
    text ?= @opts.footnote ? ''
    
    # don't try to draw an empty footnote
    return if text.match(/^\s*$/)
    
    @footnote = @r.sai.prim.wrappedText(@x + @padding.left, @y - @padding.bottom, @w, text, ' ')
    h = @footnote.getBBox().height
    @padding.bottom += h + 10
    @footnote.translate(0,  -h)
  
  render: () ->
    if @opts.simple and @renderPlots?
      @renderPlots()
    else
      @renderFull()
    
    return this
  
  renderFull: () ->
    @plot ?= new Sai.Plot(@r)
    @plot.render()
    return this

  
  showError: (error) ->
    err = this.r.text(@x + @padding.left + ((@pw ? @w)/2), @y - @padding.bottom - ((@ph ? @h)/2), error)
  
  # map from series name to color
  setColors: (colors) ->
    @colors ?= {}
    for series of colors
      seriesName = @renames[series]
      if seriesName of @data
        @colors[seriesName] = colors[series]
    return this
  
  setColor: (series, color) ->
    @colors ?= {}
    @colors[@renames[series]] = color
    return this

  normalizedHeight: (h, group) ->  
    return unless @ndata[group]?['__YVALS__']?
    
    ymin = @ndata[group]['__YVALS__'][0]
    ymax = @ndata[group]['__YVALS__'][@ndata[group]['__YVALS__'].length - 1]
    
    if h < ymin then h = ymin else if h > ymax then h = ymax
    
    nh = (h - ymin) / (ymax - ymin)
  
  drawGuideline: (h, group) ->
    group ?= 'all'
    
    return unless @ndata[group]?['__YVALS__']?
    
    nh = @normalizedHeight(h, group)
    
    @guidelines ?= @r.set()
    
    guideline = new Sai.LinePlot(
      @r,
      @px, @py, @pw, @ph,
      {'guideline': [[0, nh], [1, nh]]}
    )
    
    guideline.render({'guideline': '#ccc'})
    
    @guidelines.push(guideline.set)
  
  drawLegend: (colors) ->
    colors ?= @colors
    if colors
      _colors = {}
      _highlightColors = {}
      for l of colors when l isnt @__LABELS__
        _colors[l] = colors[l]
        _highlightColors[l] = 'black'
        if @opts.groups?.right?
          if l in @opts.groups.right
            _highlightColors[l] = if @ndata.left? then @colors.__RIGHTAXIS__ ? 'blue' else 'black'
      @legend = @r.sai.prim.legend(@x, @y - @padding.bottom, @w, _colors, _highlightColors)
      bbox = @legend.getBBox()
      if @legend.length > 0 then @padding.bottom += bbox.height + 15
      @legend.translate((@w - bbox.width) / 2, 0)
  
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
        @info_data[label] = info[label] ? '(no data)'
    
    @info = @r.sai.prim.info(@info_x, @info_y, @info_w, @info_data)
  
  getIndex: (evt) ->
    tx = Sai.util.transformCoords(evt, @r.canvas).x
    return Math.round((@data[@__LABELS__].length - 1) * (tx - @px) / @pw)
  
  drawHistogramLegend: (seriesNames, colors) ->
    colors ?= @colors
    
    @histogramLegend = @r.set()
    extrapadding = 20
    height = Math.max(0.1 * (@h - @padding.bottom - @padding.top), 50)
    width = Math.min(150, (@w - @padding.left - @padding.right - extrapadding) / seriesNames.length)
    
    for i in [0...seriesNames.length]
      series = seriesNames[i]
      data = @ndata[series][series][j][1] for j in [0...@ndata[series][series].length] when @ndata[series][series][j]?
      
      if @bounds?[series]?
        [min, max] = @bounds[series]
      else
        dataWithoutNulls = x for x in @data[series] when x?
        [min, max] = [Math.min.apply(Math, dataWithoutNulls), Math.max.apply(Math, dataWithoutNulls)]
      
      yvals =  @getYAxisVals(min, max, true)
      minLabel = yvals[0]
      maxLabel = yvals[yvals.length - 1]
      color = colors[series]
      @histogramLegend.push(
        histogram = @r.sai.prim.histogram(
          @x + (i * width),
          @y - @padding.bottom,
          width * 0.8, height,
          data,
          minLabel,
          maxLabel,
          series,
          if typeof color is 'object' then [color.__LOW__, color.__HIGH__] else [color],
          'white',
          @opts.fromWhite
        )
      )
      
      if @opts.interactive then @setupHistogramInteraction(histogram, series)
    
    @histogramLegend.translate((@w - @padding.left - @padding.right - @histogramLegend.getBBox().width) / 2, 0)
    @padding.bottom += height + 5

  setupHistogramInteraction: (histogram, series) ->
    null


class Sai.LineChart extends Sai.Chart
  
  nonNegativeGroups: () ->
    if @opts.stacked then ['all', 'left', 'right'] else []
  
  dataGroups: (data) ->
    groups = super
    
    if @opts.groups?.left? and @opts.groups?.right?
      groups.left = x for x in @opts.groups.left when @caresAbout(x) and x of @data
      groups.right = x for x in @opts.groups.right when @caresAbout(x) and x of @data
    
    return groups
  
  renderPlots: () ->
    @setPlotCoords() unless @px?
    
    @drawBG()
    @drawLogo()
    saxis = 'right' of @ndata
    ndata = if @opts.stacked? then @stackedNdata else @ndata
    plotType = if @opts.area then Sai.AreaPlot else Sai.LinePlot
    
    if saxis
      if @ndata.left?['__YVALS__'][0] < 0
        @drawGuideline(0, 'left')
      if @ndata.right?['__YVALS__'][0] < 0
        @drawGuideline(0, 'right')
    else
      if @ndata.all['__YVALS__'][0] < 0
        @drawGuideline(0, 'all')
    
    @plots = []
    
    if saxis
      if ndata.left?
        @plots.push(
          (new plotType(
            @r,
            @px, @py, @pw, @ph,
            ndata['left'],
          ))
          .render(@colors, @opts.lineWidth ? 2, @opts.stacked, @getBaseline('left'))
        )
      
      if ndata.right?
        @plots.push(
          (new plotType(
            @r,
            @px, @py, @pw, @ph,
            ndata['right'],
          ))
          .render(@colors, @opts.lineWidth ? 2, @opts.stacked, @getBaseline('right'))
        )
    else
      @plots.push(
        (new plotType(
          @r,
          @px, @py, @pw, @ph,
          ndata['all'],
        ))
        .render(@colors, @opts.lineWidth ? 2, @opts.stacked, @getBaseline('all'))
      )
  
  renderFull: () ->
    @drawTitle()
    @setupInfoSpace()
    @drawFootnote()
    @drawLegend()
    saxis = 'right' of @ndata
    if saxis then @addAxes(['left', 'right']) else @addAxes(['all'])
    
    @renderPlots()
    @plotSets = @r.set()
    @plotSets.push(plot.set) for plot in @plots
    
    @dots = @r.set()
    
    for series of @ndata['all'] when series isnt '__YVALS__'
      @dots.push(@r.circle(0, 0, 4).attr({'fill': @colors?[series] ? 'black'}).hide())
    
    everything = @r.set().push(@bg, @plotSets, @dots, @logo, @guidelines).mousemove(
      moveDots = (event) =>
        
        idx = @getIndex(event)
        
        info = {}
        if @data[@__LABELS__]?.length > idx >= 0
          info[@__LABELS__] = @data[@__LABELS__][idx]
          
          for series of @ndata['all']
            if @data[series]? then info[series] = @data[series][idx]
        
        @drawInfo(info)
        
        i = 0
        for series of @ndata['all'] when series isnt '__YVALS__'
          for plot in @plots when series of plot.dndata
            pos = plot.dndata[series][idx]
            if @data[series][idx]? then @dots[i].attr({cx: pos[0], cy: pos[1]}).show().toFront() else @dots[i].hide()
            i++
        
    ).mouseout(
      (event) =>
        @drawInfo({}, true)
        @dots.hide()
    )
    
    if @opts.href then everything.attr({
      href: @opts.href
      target: '_blank'
    })
    
    return this


class Sai.StreamChart extends Sai.LineChart
  
  constructor: (@r, @x, @y, @w, @h, data, @__LABELS__, @opts) ->
    @opts.stacked = true
    super
  
  getStackedMax: (data, group) ->
    naive = super
    return naive / 2.0
  
  # stacked charts generally have a 0 baseline
  getStackedMin: (data, group) ->
    naive = super
    stackedMax = @getStackedMax(data, group)
    return naive - stackedMax
  
  normalize: (data) ->
    super
    
    groups = @dataGroups(@data)
    @baselines ?= {}
    
    for group of @stackedNdata
      nh0 = @normalizedHeight(0, group ? 'all')
      stackedMin = @normalizedHeight(@getStackedMin(data, groups[group]), group)
      @baselines[group] = []
      
      @ndata[group]['__YVALS__'] = Math.abs(v) for v in @ndata[group]['__YVALS__']
      
      ###
      # Real stream graph, but doesn't match the yvals...
      n = 0
      for series of @stackedNdata[group]
        topSeries = series
        n++
      
      for i in [0...@stackedNdata[group][series].length]
        #offset = (@stackedNdata[group][topSeries][i][1] - nh0) / 2
        offset = 0
        j = 0
        for series of @stackedNdata[group]
          j++
          offset += (n - j + 1) * (@stackedNdata[group][series][i][1] - nh0)
        offset /= n + 1
        for series of @stackedNdata[group]
          point = @stackedNdata[group][series][i]
          continue unless point?
          point[1] -= offset
        @baselines[group].push([point[0], nh0 - offset])
      ###
      
      # ThemeRiver
      for series of @stackedNdata[group]
        topSeries = series
      
      for i in [0...@stackedNdata[group][series].length]
        offset = (@stackedNdata[group][topSeries][i][1] - nh0) / 2
        for series of @stackedNdata[group]
          point = @stackedNdata[group][series][i]
          continue unless point?
          point[1] -= offset
        @baselines[group].push([point[0], nh0 - offset])
 
  addAxes: (groups, titles) ->
    titles ?= {}
    if 'left' not of titles then titles['left'] = 'magnitude'
    super(groups, titles)

  getBaseline: (group) ->
    return @baselines[group]
  
  
class Sai.Sparkline extends Sai.Chart
  
  dataGroups: (data) ->
    {
      'data': ['data']
    }
  
  renderFull: () ->
    @drawBG()
    
    @plots = @r.set()
    
    @plots.push(
      (new Sai.LinePlot(
        @r,
        @x,
        @y,
        @w,
        @h,
        @ndata['data'])
      )
      .render({data: @colors and @colors[series] or 'black'}, 1)
      .set
    )
    
    return this


class Sai.BarChart extends Sai.Chart
  
  getMin: (data, group) ->
    return Math.min(super, 0)

  groupsToNullPad: () ->
    return group for group of @dataGroups()

  tooMuchData: () ->
    
    maxBars = @w / 3
    barsToDraw = 0
    
    for series of @data when series isnt @__LABELS__
      barsToDraw += @data[series].length
      break if @opts.stacked
    
    return barsToDraw > maxBars
  
  renderPlots: () ->
    @setPlotCoords() unless @px?
    
    @drawLogo()
    @drawBG()
    
    if @tooMuchData()
      @showError('Sorry, the chart isn\'t wide enough to plot this much data.\n \nPossible solutions include downsampling your data\n (e.g. weekly instead of daily) or using a line chart')
      return this
    
    if 'all' of @ndata
      @guidelines = @r.set()
      for yval in @ndata['all']['__YVALS__'].slice(1, @ndata['all']['__YVALS__'].length - 1)
        @drawGuideline(yval)
    
    @plots = @r.set()
    data = {}
    rawdata = {}
    rawdata[@__LABELS__] = @data[@__LABELS__]
    
    
    ndata = if @opts.stacked? then @stackedNdata else @ndata
    
    for series of ndata['all']
      unless series.match('^__') or series is @__LABELS__
        data[series] = ndata['all'][series]
        rawdata[series] = @data[series]
    
    @plots.push(
      (new Sai.BarPlot(
        @r,
        @px,
        @py,
        @pw,
        @ph,
        data,
        rawdata)
      )
      .render(@opts.stacked?, @normalizedHeight(0, 'all'), @colors, @opts.interactive and not @opts.simple, @drawInfo, @__LABELS__)
      .set
    )
  
  
  renderFull: () ->
    @drawTitle()
    @setupInfoSpace()
    @drawFootnote()
    @drawLegend()
    @addAxes(['all'])
    
    @renderPlots()
    
    everything = @r.set().push(
      @plots,
      @bg,
      @logo,
      @guidelines
    )
    
    if @opts.href then everything.attr({
      href: @opts.href
      target: '_blank'
    })
    
    return this


class Sai.StockChart extends Sai.Chart
  
  semanticRenamePatterns: {
    'open': /^open$/i
    'close': /^close$/i
    'high': /^high$/i
    'low': /^low$/i
    'volume': /^vol(ume)?$/i
  }
  
  groupsToNullPad: () ->
    return ['prices', 'volume', '__META__']
  
  dataGroups: (data) ->
    groups = {
      '__META__': [@__LABELS__]
    }
    volume_name = @semanticRenames['volume'] ? 'volume'
    if volume_name of @data then groups['volume'] = [volume_name]
    for seriesName of data when @caresAbout(seriesName) and seriesName not in [@__LABELS__, volume_name]
      groups.prices ?= []
      groups.prices.push(seriesName)
    return groups
  
  nonNegativeGroups: () ->
    ['volume']
  
  renderPlots: () ->
    @setPlotCoords() unless @px?
    
    open_name = @semanticRenames['open'] ? 'open'
    close_name = @semanticRenames['close'] ? 'close'
    high_name = @semanticRenames['high'] ? 'high'
    low_name = @semanticRenames['low'] ? 'low'
    volume_name = @semanticRenames['volume'] ? 'volume'
    
    @colors ?= {}
    @colors['up'] ?= 'black'
    @colors['down'] ?= 'red'
    @colors['vol_up'] ?= '#666666'
    @colors['vol_down'] ?= '#cc6666'
    
    # @drawLegend({up: @colors.up, down: @colors.down})
    
    @drawLogo()
    @drawBG()
    
    unless @ndata.prices? and open_name of @ndata.prices and close_name of @ndata.prices and high_name of @ndata.prices and low_name of @ndata.prices 
      @showError("This chart requires data series named\nopen, close, high, and low.\n \nOnce you add series with these names, the chart will display.")
      return
    
    if @ndata.prices['__YVALS__'][0] < 0
      @drawGuideline(0, 'prices')
    
    @plots = @r.set()
    
    vol = {
      'up': []
      'down': []
    }
    
    rawdata = {}
    for p of @ndata['prices']
      unless p.match('^__') or p is @__LABELS__
        rawdata[p] = @data[p]
    if @data[volume_name]? then rawdata['vol'] = @data[volume_name]
    
    if 'volume' of @ndata
      for i in [0...@ndata['volume'][volume_name].length]
        if @ndata['volume'][volume_name][i] isnt null
          if i and @ndata['prices'][close_name][i-1] and (@ndata['prices'][close_name][i][1] < @ndata['prices'][close_name][i-1][1])
            vol.down.push(@ndata['volume'][volume_name][i])
            vol.up.push([@ndata['volume'][volume_name][i][0], 0])
          else
            vol.up.push(@ndata['volume'][volume_name][i])
            vol.down.push([@ndata['volume'][volume_name][i][0], 0])
        else
          vol.up.push([0, 0])
          vol.down.push([0, 0])
      
      @plots.push(
        (new Sai.BarPlot(
          @r
          @px,
          @py,
          @pw, @ph * 0.2,
          vol,
          rawdata)
        )
        .render(true, @normalizedHeight(0, volume_name), {'up': @colors['vol_up'], 'down': @colors['vol_down']})
        .set
      )
    
    @plots.push(
      (new Sai.CandlestickPlot(
        @r,
        @px,
        @py,
        @pw, @ph,
        {
         'open': @ndata['prices'][open_name],
         'close': @ndata['prices'][close_name],
         'high': @ndata['prices'][high_name],
         'low': @ndata['prices'][low_name]
        },
        rawdata)
      )
      .render(@colors, Math.min(5, (@pw / @ndata['prices'][open_name].length) - 2))
      .set
    )
    
    
    avgNdata = {}
    for series of @ndata['prices']
      unless (series in [open_name, close_name, high_name, low_name]) or series.match("^__") or series is @__LABELS__
        avgNdata[series] = @ndata['prices'][series]
    
    @plots.push(
      (new Sai.LinePlot(@r,
                        @px, @py, @pw, @ph,
                        avgNdata))
      .render(@colors)
      .set
    )
  
  renderFull: () ->
    @drawTitle()
    @setupInfoSpace()
    @drawFootnote()
    
    open_name = @semanticRenames['open'] ? 'open'
    close_name = @semanticRenames['close'] ? 'close'
    high_name = @semanticRenames['high'] ? 'high'
    low_name = @semanticRenames['low'] ? 'low'
    volume_name = @semanticRenames['volume'] ? 'volume'
    
    avgColors = {}
    shouldDrawLegend = false
    for series of @ndata['prices'] when series not in [open_name, close_name, high_name, low_name] and not (series.match('^__') or series is @__LABELS__)
      avgColors[series] = @colors?[series] or 'black'
      shouldDrawLegend = true
    if shouldDrawLegend then @drawLegend(avgColors)
    
    @addAxes(['prices'])
    
    @renderPlots()
    
    glow_width = @pw / (@data[@__LABELS__].length - 1)
    @glow = @r.rect(@px - (glow_width / 2), @py - @ph, glow_width, @ph)
              .attr({fill: "0-#{@opts.bgcolor}-#DDAA99-#{@opts.bgcolor}", 'stroke-width': 0, 'stroke-opacity': 0})
              .toBack()
              .hide()
    
    @bg.toBack()
    
    everything = @r.set().push(@bg, @plots, @logo, @glow, @guidelines).mousemove(
      moveGlow = (event) =>
        
        idx = @getIndex(event)
        
        info = {}
        
        if @data[@__LABELS__][idx]? then info[@__LABELS__] = @data[@__LABELS__][idx]
        
        notNull = false
        for series of @ndata['prices'] when not (series.match('^__') or series is @__LABELS__)
          if @data[series]?[idx]?
            info[series] = @data[series][idx]
            notNull = true
        if @data[volume_name]?[idx]?
          info[volume_name] = @data[volume_name][idx]
          notNull = true
        @drawInfo(info)
        if notNull
          @glow.attr({x: @px + (glow_width * (idx - 0.5))}).show()
        
    ).mouseout(
      (event) =>
        @drawInfo({}, true)
        @glow.hide()
    )
    
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
      continue if series.match('^__') or series is @__LABELS__
      continue unless data[series]?
      dataWithoutNulls = d for d in data[series] when d?
      maxes[series] = @getMax(dataWithoutNulls, series)
      if not overallMax? or maxes[series] > overallMax then overallMax = maxes[series]
      mins[series] = @getMin(dataWithoutNulls, series)
      if not overallMin? or mins[series] < overallMin then overallMin = mins[series]
    
    for series of data
      continue if series.match('^__') or series is @__LABELS__
      continue unless data[series]?
      if @opts.groupedNormalization
        max = overallMax
        min = overallMin
      else
        max = maxes[series]
        min = mins[series]
      @bounds[series] = [min, max]
      @ndata[series] = {}
      @ndata[series][series] = (if data[series][i]? then [i / (data[series].length - 1), ((data[series][i]-min) / (max-min))] else null) for i in [0...data[series].length]
  
  
  dataGroups: (data) ->
    groups = {
      '__META__': seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__
    }
    
    for seriesName of data
      unless seriesName.match("^__") or seriesName is @__LABELS__
        groups[seriesName] = [seriesName]
    
    return groups
  
  setupHistogramInteraction: (histogram, series) ->  
    histogram.click( () => @renderPlots(series) )
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
  
  renderPlots: (mainSeries) =>
    
    @setPlotCoords() unless @px?
    
    @bg?.remove()
    @logo?.remove()
    @geoPlot?.set.remove()
    
    @drawBG()
    @drawLogo()
    
    ndata = {}
    for series of @ndata
      ndata[series] = @ndata[series][series]
    
    @geoPlot = (new @plotType(
      @r,
      @px, @py, @pw, @ph,
      ndata,
      @data,
      {fromWhite: @opts.fromWhite}
    ))
    .render(@colors or {}, @data['__MAP__'], @__LABELS__, mainSeries ? @data['__DEFAULT__'], @opts.bgcolor, @opts.interactive and not @opts.simple, @drawInfo)
    
    return this
  
  default_info: () ->
    {'': if @opts.interactive then 'Click histogram below to change map display' else ''}

  renderFull: () ->
    
    @drawTitle()
    @setupInfoSpace()
    @drawFootnote()
    @drawHistogramLegend(series for series of @data when not (series.match('^__') or series is @__LABELS__))
    
    @setPlotCoords()
    
    @drawInfo()
    
    @renderPlots()
    
    everything = @r.set().push(
      @geoPlot.set,
      @bg,
      @logo,
      @info,
      @footnote
    )
    
    if @opts.href then everything.attr({
      href: @opts.href
      target: '_blank'
    })
    
    return this


class Sai.ChromaticGeoChart extends Sai.GeoChart
  
  plotType: Sai.ChromaticGeoPlot
  interactiveHistogram: false
  
  default_info: () ->
    {}
  
  setupHistogramInteraction: (histogram, series) ->  
    false


class Sai.ScatterChart extends Sai.Chart

  dataGroups: (data) ->
    groups = {
      '__META__': seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__
    }
    
    for seriesName of data
      unless seriesName.match("^__") or seriesName is @__LABELS__
        groups[seriesName] = [seriesName]
    
    return groups
  
  renderPlots: () ->
    
    @setPlotCoords() unless @px?
    
    colors = @opts.colors ? @colors ? ['black', 'white']
    stroke_opacity = @opts.stroke_opacity ? [0, 1]
    stroke_colors = @opts.stroke_colors ? ['black', 'black']
    radii = @opts.radius ? [4, 12]
    
    @drawLogo()
    @drawBG()
    
    ndata = {}
    for series of @ndata
      ndata[series] = @ndata[series][series]
    
    @plots = @r.set()
    
    @plots.push(
      (new Sai.ScatterPlot(
        @r,
        @px,
        @py,
        @pw,
        @ph,
        ndata,
        @data)
      )
      .render(@opts.mappings, colors, radii, stroke_opacity, stroke_colors, @opts.interactive and not @opts.simple, @drawInfo)
      .set
    )
    
    return this
  
  renderFull: () ->
    @drawTitle()
    @setupInfoSpace()
    @drawFootnote()
    
    colors = @opts.colors ? @colors ? ['black', 'white']
    stroke_opacity = @opts.stroke_opacity ? [0, 1]
    stroke_colors = @opts.stroke_colors ? ['black', 'black']
    radii = @opts.radius ? [4, 12]
    
    histogramSeries = []
    histogramColors = {}
    
    if colors instanceof Array
      histogramSeries.push(@opts.mappings.color)
      histogramColors[@opts.mappings.color] = {__LOW__: colors[0], __HIGH__: colors[1]}
    else
      legend_colors ?= {}
      draw_legend = true
      for c of colors
        legend_colors[c] = colors[c]
    
    if stroke_colors instanceof Array
      null
      # histogramSeries.push(@opts.mappings.stroke_color)
      # histogramColors[@opts.mappings.stroke_color] = {__LOW__: stroke_colors[0], __HIGH__: stroke_colors[1]}
    else
      legend_colors ?= {}
      draw_legend = true
      for c of colors
        legend_colors[c] = stroke_colors[c]
    
    ###
    if @opts.mappings.stroke_opacity
      histogramSeries.push(@opts.mappings.stroke_opacity)
      so_colors = [
        Sai.util.colerp(stroke_colors[0], stroke_colors[1], stroke_opacity[0]),
        Sai.util.colerp(stroke_colors[0], stroke_colors[1], stroke_opacity[1]),
      ]
      histogramColors[@opts.mappings.stroke_opacity] = {__LOW__: so_colors[0], __HIGH__: so_colors[1]}
    ###
    
    if histogramSeries.length
      @drawHistogramLegend(histogramSeries, histogramColors)
    
    if draw_legend
      @drawLegend(colors)
    
    @__LABELS__ = '__XVALS__'
    @data.__XVALS__ = @ndata[@opts.mappings.x]['__YVALS__']
    @addAxes([@opts.mappings.y], {left: @opts.mappings.y, bottom: @opts.mappings.x})
    
    @renderPlots()
    
    everything = @r.set().push(
      @plots,
      @bg,
      @logo,
      @info,
      @footnote,
      @histogramLegend,
      @legend
    )
    
    if @opts.href then everything.attr({
      href: @opts.href
      target: '_blank'
    })
    
    return this
