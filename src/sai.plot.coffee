# A plot is a primitive visualization of data
class Sai.Plot
  constructor: (@r, @x, @y, @w, @h, @data, @rawdata, @opts) ->
    @opts ?= {}
    @setDenormalizedData()
    @set = @r.set()
  
  setDenormalizedData: () ->
    if @data instanceof Array
      @dndata = @denormalize(dnPoint) for dnPoint in @data
    else
      @dndata ?= {}
      for series of @data
        @dndata[series] = @denormalize(dnPoint) for dnPoint in @data[series]
  
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
  
  render: (colors, width, stacked, zeroline) ->
    
    @set.remove()
    
    denzel = [@denormalize([0, zeroline]),@denormalize([1, zeroline])]
    
    for series of @dndata when not series.match('^__')
      for i in [0...@dndata[series].length]
        first = @dndata[series][i]
        if first?
          break
      
      for i in [@dndata[series].length-1..0]
        last = @dndata[series][i]
        if last?
          break
      
      unless baseline? and stacked
        baseline = [[first[0], denzel[0][1]], [last[0], denzel[1][1]]]
      @set.push(
        @r.sai.prim.area(@dndata[series], colors?[series] or 'black', width or 1, baseline)
      )
      
      if stacked then baseline = ([d[0], d[1] - width/2] for d in @dndata[series])
    
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
  render: (stacked, baseline, colors, shouldInteract, fSetInfo) ->
    
    @set.remove()
    baseline = @denormalize([0, baseline])[1]
    
    len = 0
    colorArray = []
    barfunc = if stacked then @r.sai.prim.stackedBar else @r.sai.prim.groupedBar
    
    for series of @dndata
      len = @dndata[series].length
      colorArray.push(colors?[series] or 'black')
    
    for i in [0...len]
      bardata = []
      for series of @dndata
        bardata.push(@dndata[series][i])
      
      info = {}
      for p of @rawdata
        info[p] = @rawdata[p][i]
      
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
    
    regions = region.toUpperCase() for region in @rawdata[regionSeries]
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
          if shouldInteract then [{'fill-opacity': .75, 'stroke-width': (if @opts.fromWhite then 2 else 0.5)}, {'fill-opacity': 1, 'stroke-width': 0.5}] else null
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

  render: (mappings, colors, radii, stroke_widths) ->
    @set.remove()
    
    for series of @dndata
      num_points = @dndata[series].length
      break
    
    for i in [0...num_points]
      alert mappings.x
      alert @dndata[mappings.x]
      x = @dndata[mappings.x]?[i][1] * (@w / @h)
      y = @dndata[mappings.y]?[i][1]
      color = if mappings.color? then Sai.util.colerp(colors[0], colors[1], @data[mappings.color]?[i][1]) else 'black'
      radius = if mappings.radius? then (radii[0] + ((radii[1] - radii[0]) * @data[mappings.radius]?[i][1])) else '20'
      stroke_width = if mappings.stroke_width then (stroke_widths[0] + ((stroke_widths[1] - stroke_widths[0]) * @data[mappings.stroke_width]?[i][1])) else '2'
      
      @set.push(
        @r.circle(x, y, radius).attr({'fill': color, 'stroke-width': stroke_width})
      )
    
    return this
    