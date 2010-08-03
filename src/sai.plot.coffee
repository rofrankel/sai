# A plot is a primitive visualization of data
class Sai.Plot
  constructor = (r, x, y, w, h, data, rawdata) ->
    @r = r
    @x = x or 0
    @y = y or 0
    @w = w or 640
    @h = h or 480
    @data = data
    @setDenormalizedData()
    @rawdata = rawdata
    @set = @r.set()
  
  setDenormalizedData = () ->
    if @data instanceof Array
      @dndata = @denormalize(dnPoint) for dnPoint in @data
    else
      @dndata ?= {}
      for column of @data
        @dndata[column] = @denormalize(dnPoint) for dnPoint in @data[column]
  
  denormalize = (point) ->
    if point instanceof Array
      return [@x + (@w * point[0]), @y - (@h * point[1])]

  render = () ->
    @set.push(
      @r.rect(20, 20, 20, 20).attr('fill', 'red'),
      @r.circle(40, 40, 10).attr('fill', 'blue')
    )
    return this


class Sai.LinePlot extends Sai.Plot
  
  render = (colors, width) ->
    @set.remove()
    
    for series of @dndata when not series.match('^__')
      @set.push(
        @r.sai.prim.line(@dndata[series], (colors?[series] or 'black'), width or 1)
      )
    
    return this


class Sai.AreaPlot extends Sai.Plot
  
  render = (colors, width, stacked) ->
    
    @set.remove()
    
    for series of @dndata when not series.match('^__')
      baseline ?= [@denormalize([0, 0]),@denormalize([1, 0])]
      @set.push(
        @r.sai.prim.area(@dndata[series], colors?[series] or 'black', width or 1, baseline)
      )
      
      if stacked then baseline = ([d[0], d[1] - width/2] for d in @dndata[series])
    
    return this

# Raphael.fn.sai.prim.candlestick = (x, by0, by1, sy0, sy1, body_width, color) ->
class Sai.CandlestickPlot extends Sai.Plot

  render = (colors, body_width, shouldInteract, fSetInfo) ->
    
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
  render = (stacked, colors, shouldInteract, fSetInfo) ->
    
    @set.remove()
    
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
          @y,
          shouldInteract,
          fSetInfo,
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
    
    return this


# map looks like {width: w, height: h, paths: {CODE: "...", CODE: "..."}}
# data looks like {series: {series: [a, b, c]}, series2 = {series2: [b, c, a]}, __META__ = {__LABELS__: [CODE, CODE, CODE]}}
class Sai.GeoPlot extends Sai.Plot
  
  getRegionColor = (colors, ridx, mainSeries) ->
    return Sai.util.multiplyColor(colors[mainSeries], @data[mainSeries][ridx]?[1] or 0).str
  
  getRegionOpacity = (ridx, mainSeries) ->
    if @data[mainSeries][ridx]?[1]? then 1 else 0.25
  
  render = (colors, map, mainSeries, bgcolor, shouldInteract, fSetInfo) ->
    
    @set.remove()
    
    regions = @rawdata.__LABELS__
    ri = {}
    for i in [0...regions.length]
      ri[regions[i]] = i
    
    for region of map.paths
      ridx = ri[region]
      name = map.name[region]
      
      info = {region: if name? then name else region}
      for series of @rawdata
        info[series] = @rawdata[series][ridx]
      
      color = @getRegionColor(colors, ridx, mainSeries)
      opacity = @getRegionOpacity(ridx, mainSeries)
      
      @set.push(
        # fDraw, attrs, extras, hoverattrs
        hoverShape = @r.sai.prim.hoverShape(
          ((path, scale, x, y) ->
            return (r) ->
              r.path(path).translate(x, y).scale(scale, scale, x, y)
          )(map.paths[region], Math.min(@w / map.width, @h / map.height), @x, @y - @h),
          {
            'fill': color
            'stroke': bgcolor
            'stroke-width': 0.75
            'opacity': opacity
          }
          if shouldInteract then Sai.util.infoSetters(fSetInfo, info) else null,
          if shouldInteract then [{'fill-opacity': .75}, {'fill-opacity': 1}] else null
        )
      )
      
    bbox = @set.getBBox()
    @set.translate((@w - bbox.width) / 2, (@h - bbox.height) / 2)
    
    return this


class Sai.ChromaticGeoPlot extends Sai.GeoPlot
  
  getRegionColor = (colors, ridx, mainSeries) ->
    r = g = b = 0
    for series of @data
      rgb = Sai.util.multiplyColor(colors[series], @data[series][ridx]?[1] or 0)
      r += rgb.r
      g += rgb.g
      b += rgb.b
    
    return  "rgb($r, $g, $b)"
  
  getRegionOpacity = (ridx, mainSeries) ->
    for series of @data
      if @data[series][ridx]?[1]? then return 1
    
    return 0.25
  
