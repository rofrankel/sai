class Sai.LinePlot extends Sai.Plot
  
  setDenormalizedData: () ->
    super
    for series of @dndata
      if @dndata[series].length is 1 and @dndata[series]?[0]?[0] is @x
        @dndata[series].push([@x + @w, @dndata[series][0][1]])

  render: (colors, width) ->
    @set.remove()
    
    for series of @dndata when not series.match('^__')
      @set.push(
        @r.sai.prim.line(@dndata[series], (colors?[series] or 'black'), width or 1)
      )
    
    return this


class Sai.AreaPlot extends Sai.LinePlot
  
  render: (colors, width, stacked, baseline) ->
    
    @set.remove()
    
    dnbl = (@denormalize(p) for p in baseline)
    
    for series of @dndata when not series.match('^__')
      for i in [0...@dndata[series].length]
        first = @dndata[series][i]
        if first?
          break
      
      for i in [@dndata[series].length-1..0]
        last = @dndata[series][i]
        if last?
          break
      
      _baseline = ([Math.max(Math.min(last[0], p[0]), first[0]), p[1]] for p in dnbl)
      
      @set.push(
        @r.sai.prim.area(@dndata[series], colors?[series] or 'black', width or 1, _baseline)
      )
      
      if stacked then dnbl = @dndata[series]
    
    return this
