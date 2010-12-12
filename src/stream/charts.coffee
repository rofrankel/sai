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
      
      @ndata[group]['__YVALS__'] = (Math.abs(v) for v in @ndata[group]['__YVALS__'])
      
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
 
  addAxes: (groups, titles={}) ->
    if 'left' not of titles then titles['left'] = 'magnitude'
    super(groups, titles)

  getBaseline: (group) ->
    return @baselines[group]
