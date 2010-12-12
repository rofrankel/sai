class Sai.BarChart extends Sai.Chart
  
  getMin: (data, group) ->
    return Math.min(super, 0)

  groupsToNullPad: () ->
    return (group for group of @dataGroups())

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
