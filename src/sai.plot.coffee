# A plot is a primitive visualization of data
class Sai.Plot
  constructor: (@r, @x, @y, @w, @h, @data, @rawdata, @opts) ->
    @opts ?= {}
    @setDenormalizedData()
    @set = @r.set()
  
  setDenormalizedData: () ->
    if @data instanceof Array
      @dndata = (@denormalize(dnPoint) for dnPoint in @data)
    else
      @dndata ?= {}
      for series of @data
        @dndata[series] = (@denormalize(dnPoint) for dnPoint in @data[series])
  
  denormalize: (point) ->
    if point instanceof Array
      return [@x + (@w * point[0]), @y - (@h * point[1])]

  render: () ->
    @set.push(
      @r.rect(20, 20, 20, 20).attr('fill', 'red'),
      @r.circle(40, 40, 10).attr('fill', 'blue')
    )
    return this


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


class Sai.CandlestickPlot extends Sai.Plot

  render: (colors, body_width, shouldInteract, fSetInfo) ->
    
    @set.remove()
    
    cup = colors?['up'] or 'black'
    cdown = colors?['down'] or 'red'
    body_width ?= 5
    
    for i in [0...@dndata['open'].length]
      
      continue unless @dndata['close'][i]?
      
      # Y coords are inverted, which makes a lot of stuff seem backwards...
      upDay = @dndata['close'][i][1] < @dndata['open'][i][1]
      
      info = {}
      for p of @rawdata
        info[p] = @rawdata[p][i]
      
      @set.push(
        @r.sai.prim.candlestick(
          @dndata['open'][i][0],
          upDay and @dndata['close'][i][1] or @dndata['open'][i][1]
          upDay and @dndata['open'][i][1] or @dndata['close'][i][1]
          @dndata['high'][i][1],
          @dndata['low'][i][1],
          body_width or 5,
          if (i and @dndata['close'][i-1]? and (@dndata['close'][i-1][1] < @dndata['close'][i][1])) then cdown else cup,
          not upDay,
          shouldInteract,
          fSetInfo,
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
    
    return this

class Sai.BarPlot extends Sai.Plot
  
  # if stacked, plot is rendered stacked...else, grouped
  # colors maps from series name to color string
  render: (stacked, baseline, colors, shouldInteract, fSetInfo, __LABELS__) ->
    
    @set.remove()
    baseline = @denormalize([0, baseline])[1]
    
    len = 0
    colorArray = []
    barfunc = if stacked then @r.sai.prim.stackedBar else @r.sai.prim.groupedBar
    
    for series of @dndata
      len = Math.max(len, @dndata[series].length)
      colorArray.push(colors?[series] or 'black')
    
    for i in [0...len]
      bardata = []
      for series of @dndata
        bardata.push(@dndata[series][i])
      
      info = {}
      for p of @rawdata
        info[p] = @rawdata[p][i]
      
      if stacked
        magnitude = 0
        net = 0
        for series of @rawdata when series isnt __LABELS__
          unless isNaN(@rawdata[series][i])
            magnitude += Math.abs(@rawdata[series][i])
            net += @rawdata[series][i]
        info['(magnitude)'] = magnitude
        # info['(net)'] = net
      
      @set.push(
        barfunc(
          bardata,
          colorArray,
          @w / len,
          baseline,
          shouldInteract,
          fSetInfo,
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
    
    return this


# map looks like {width: w, height: h, paths: {CODE: "...", CODE: "..."}}
# data looks like {series: {series: [a, b, c]}, series2 = {series2: [b, c, a]}, __META__ = {__LABELS__: [CODE, CODE, CODE]}}
class Sai.GeoPlot extends Sai.Plot
  
  getRegionColor: (colors, ridx, mainSeries) ->
    return Sai.util.multiplyColor(colors[mainSeries], @data[mainSeries][ridx]?[1] or 0, @opts.fromWhite, if @opts.fromWhite then 0.2 else 0).str
  
  getRegionOpacity: (ridx, mainSeries) ->
    if @data[mainSeries][ridx]?[1]? then 1 else (if @opts.fromWhite then .15 else 0.25)
  
  render: (colors, map, regionSeries, mainSeries, bgcolor, shouldInteract, fSetInfo) ->
    
    @set.remove()
    
    regions = (region.toUpperCase() for region in @rawdata[regionSeries])
    ri = {}
    for i in [0...regions.length]
      ri[regions[i]] = i
    
    for region of map.paths
      ridx = ri[region]
      name = map.name[region]
      
      info = {region: name ? region}
      for series of @rawdata when series isnt regionSeries
        info[series] = @rawdata[series][ridx]
      
      color = @getRegionColor(colors, ridx, mainSeries)
      opacity = @getRegionOpacity(ridx, mainSeries)
      
      infoSetters = Sai.util.infoSetters(fSetInfo, info)
      
      @set.push(
        # fDraw, attrs, extras, hoverattrs
        hoverShape = @r.sai.prim.hoverShape(
          ((path, scale, x, y) ->
            return (r) ->
              r.path(path).translate(x, y).scale(scale, scale, x, y)
          )(map.paths[region], Math.min(@w / map.width, @h / map.height), @x, @y - @h),
          {
            'fill': color
            'stroke': if @opts.fromWhite then 'black' else bgcolor
            'stroke-width': 0.5
            'opacity': opacity
          },
          (if shouldInteract
            [
              (target) ->
                # opera and IE have a bug where calling toFront() blocks the mouseout event
                target.toFront() unless navigator.userAgent.toLowerCase().indexOf('msie') isnt -1 or navigator.userAgent.toLowerCase().indexOf('opera') isnt -1
                infoSetters[0]()
              ,
              infoSetters[1]
            ]
          else
            null),
          if shouldInteract then [{'fill-opacity': .75, 'stroke-width': (if @opts.fromWhite then 1.5 else 0.5)}, {'fill-opacity': 1, 'stroke-width': 0.5}] else null
        )
      )
      
    bbox = @set.getBBox()
    @set.translate((@w - bbox.width) / 2, (@h - bbox.height) / 2)
    
    return this


class Sai.ChromaticGeoPlot extends Sai.GeoPlot
  
  getRegionColor: (colors, ridx, mainSeries) ->
    r = g = b = 0
    for series of @data
      rgb = Sai.util.multiplyColor(colors[series], @data[series][ridx]?[1] or 0, @opts.fromWhite)
      r += rgb.r
      g += rgb.g
      b += rgb.b
    
    return  "rgb(#{r}, #{g}, #{b})"
  
  getRegionOpacity: (ridx, mainSeries) ->
    for series of @data
      if @data[series][ridx]?[1]? then return 1
    
    return 0.25
  

class Sai.ScatterPlot extends Sai.Plot

  render: (mappings, colors, radii, stroke_opacities, stroke_colors, shouldInteract, fSetInfo) ->
    @set.remove()
    
    for series of @dndata
      num_points = @dndata[series].length
      break
    
    lerp = (a, b, alpha) -> (b * alpha) + (a * (1 - alpha))
    y2x = (y) => @x + (@w * ((y - @y) / -@h))
    
    for i in [0...num_points]
      x = y2x(@dndata[mappings.x]?[i][1])
      y = @dndata[mappings.y]?[i][1]
      
      if colors instanceof Array and mappings.color?
        color = Sai.util.colerp(colors[0], colors[1], (@data[mappings.color]?[i]?[1] ? 0))
      else if colors instanceof Object and mappings.color?
        color = colors[@rawdata[mappings.color][i]]
      else
        color = 'black'
      
      if stroke_colors instanceof Array and mappings.stroke_color?
        stroke_color = Sai.util.colerp(stroke_colors[0], stroke_colors[1], (@data[mappings.stroke_color]?[i]?[1] ? 0))
      else if colors instanceof Object and mappings.color?
        stroke_color = stroke_colors[@rawdata[mappings.stroke_color][i]]
      else
        stroke_color = 'black'
      
      if radii instanceof Array and mappings.radius?
        radius = lerp(radii[0], radii[1], (@data[mappings.radius]?[i]?[1] ? 0))
      else if radii instanceof Object and mappings.radius?
        radius = radii[@rawdata[mappings.radius][i]]
      else
        radius = 5.0
      
      if stroke_opacities instanceof Array and mappings.stroke_opacity?
        stroke_opacity = lerp(stroke_opacities[0], stroke_opacities[1], (@data[mappings.stroke_opacity]?[i]?[1] ? 0))
      else if stroke_opacities instanceof Object and mappings.stroke_opacity?
        stroke_opacity = stroke_opacities[@rawdata[mappings.stroke_opacity][i]]
      else
        stroke_opacity = 1.0
      
      if shouldInteract
        info = {}
        for series of @rawdata when not series.match('^__')
          info[series] = @rawdata[series][i]
        infoSetters = Sai.util.infoSetters(fSetInfo, info)
      
      @set.push(
        circle = @r.circle(x, y, radius)
        .attr({
          'fill': color
          'stroke-opacity': stroke_opacity
          'stroke': stroke_color
          'fill-opacity': 0.8
          'stroke-width': 2
        })
        
        if shouldInteract
          circle.hover(
            ((infoSetter) ->
              ->
                infoSetter()
                this.attr('fill-opacity', 0.5)
            )(infoSetters[0])
            ,
            ((infoSetter) ->
              ->
                infoSetter()
                this.attr('fill-opacity', 0.8)
            )(infoSetters[1])
          )
      )
    
    return this
    