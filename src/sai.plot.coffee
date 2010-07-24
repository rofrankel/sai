# A plot is a primitive visualization of data
class Sai.Plot
  constructor: (r, x, y, w, h, data, rawdata) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
    this.data = data
    this.setDenormalizedData()
    this.rawdata = rawdata
    this.set: this.r.set()
  
  setDenormalizedData: () ->
    if this.data instanceof Array
      this.dndata: this.denormalize(dnPoint) for dnPoint in this.data
    else
      this.dndata ?= {}
      for column of this.data
        this.dndata[column]: this.denormalize(dnPoint) for dnPoint in this.data[column]
  
  denormalize: (point) ->
    if point instanceof Array
      return [this.x + (this.w * point[0]), this.y - (this.h * point[1])]

  render: () ->
    this.set.push(
      this.r.rect(20, 20, 20, 20).attr('fill', 'red'),
      this.r.circle(40, 40, 10).attr('fill', 'blue')
    )
    return this


class Sai.LinePlot extends Sai.Plot
  
  render: (color, width) ->
    
    this.set.remove()
    
    this.set.push(
      this.line: this.r.sai.prim.line(this.dndata, color or 'black', width or 1)
    )
    return this


# Raphael.fn.sai.prim.candlestick: (x, by0, by1, sy0, sy1, body_width, color) ->
class Sai.CandlestickPlot extends Sai.Plot

  render: (colors, body_width, shouldInteract, fSetInfo) ->
    
    this.set.remove()
    
    cup: colors and colors['up'] or 'black'
    cdown: colors and colors['down'] or 'red'
    body_width ?= 5
    
    for i in [0...this.dndata['open'].length]
      
      continue unless this.dndata['close'][i]?
      
      # Y coords are inverted, which makes a lot of stuff seem backwards...
      upDay: this.dndata['close'][i][1] < this.dndata['open'][i][1]
      
      info: {}
      for p of this.rawdata
        info[p]: this.rawdata[p][i]
      
      this.set.push(
        this.r.sai.prim.candlestick(
          this.dndata['open'][i][0],
          upDay and this.dndata['close'][i][1] or this.dndata['open'][i][1]
          upDay and this.dndata['open'][i][1] or this.dndata['close'][i][1]
          this.dndata['high'][i][1],
          this.dndata['low'][i][1],
          body_width or 5,
          (i and this.dndata['close'][i-1]? and (this.dndata['close'][i-1][1] < this.dndata['close'][i][1])) and cdown or cup,
          not upDay,
          shouldInteract,
          fSetInfo,
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
    
    return this

class Sai.BarPlot extends Sai.Plot
  
  # if stacked, graph is rendered stacked...else, grouped
  # colors maps from series name to color string
  render: (stacked, colors, shouldInteract, fSetInfo) ->
    
    this.set.remove()
    
    len: 0
    colorArray: []
    barfunc: if stacked then this.r.sai.prim.stackedBar else this.r.sai.prim.groupedBar
    
    for column of this.dndata
      len: this.dndata[column].length
      colorArray.push(colors and colors[column] or 'black')
    
    for i in [0...len]
      bardata = []
      for column of this.dndata
        bardata.push(this.dndata[column][i])
      
      info: {}
      for p of this.rawdata
        info[p]: this.rawdata[p][i]
      
      this.set.push(
        barfunc(
          bardata,
          colorArray,
          this.w / len,
          this.y,
          shouldInteract,
          fSetInfo,
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
    
    return this


# map looks like {width: w, height: h, paths: {CODE: "...", CODE: "..."}}
# data looks like {series: {series: [a, b, c]}, series2: {series2: [b, c, a]}, __META__: {__REGION__: [CODE, CODE, CODE]}}
class Sai.GeoPlot extends Sai.Plot

  render: (colors, map, mainSeries, bgcolor, shouldInteract, fSetInfo) ->
    
    this.set.remove()
    
    regions: this.rawdata.__REGION__
    ri: {}
    for i in [0...regions.length]
      ri[regions[i]]: i
    
    for region of map.paths
      ridx: ri[region]
      
      info: {region}
      for series of this.rawdata
        info[series]: this.rawdata[series][ridx]
      
      val: this.data[mainSeries][ridx] and this.data[mainSeries][ridx][1] or 0
      
      this.set.push(
        # fDraw, attrs, extras, hoverattrs
        hoverShape: this.r.sai.prim.hoverShape(
          ((path, scale, x, y) ->
            return (r) ->
              r.path(path).translate(x, y).scale(scale, scale, x, y)
          )(map.paths[region], Math.min(this.w / map.width, this.h / map.height), this.x, this.y - this.h),
          {
            'fill': Sai.util.multiplyColor(colors[mainSeries], val)
            'stroke': bgcolor
            'stroke-width': 0.75
          }
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
      
    bbox: this.set.getBBox()
    this.set.translate((this.w - bbox.width) / 2, (this.h - bbox.height) / 2)
    
    return this