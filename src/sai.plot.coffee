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
  
  setDenormalizedData: () ->
    if this.data instanceof Array
      this.dndata: this.denormalize(dnPoint) for dnPoint in this.data
    else
      this.dndata ?= {}
      for column of this.data
        this.dndata[column]: this.denormalize(dnPoint) for dnPoint in this.data[column]
  
  denormalize: (point) ->
    unless point is null
      return [this.x + (this.w * point[0]), this.y - (this.h * point[1])]

  render: () ->
    this.r.rect(20, 20, 20, 20).attr('fill', 'red')
    this.r.circle(40, 40, 10).attr('fill', 'blue')
    return this


class Sai.LinePlot extends Sai.Plot
  
  render: (color, width) ->
    this.line: this.r.sai.prim.line(this.dndata, color or 'black', width or 1)
    return this


# Raphael.fn.sai.prim.candlestick: (x, by0, by1, sy0, sy1, body_width, color) ->
class Sai.CandlestickPlot extends Sai.Plot

  render: (colors, body_width, fSetInfo) ->
    cup: colors and colors['up'] or 'black'
    cdown: colors and colors['down'] or 'red'
    body_width ?= 5
    
    this.candlesticks: this.r.set()
    for i in [0...this.dndata['open'].length]
      
      continue unless this.dndata['close'][i]?
      
      # Y coords are inverted, which makes a lot of stuff seem backwards...
      upDay: this.dndata['close'][i][1] < this.dndata['open'][i][1]
      
      info: {}
      for p of this.rawdata
        info[p]: this.rawdata[p][i]
      
      this.candlesticks.push(
        this.r.sai.prim.candlestick(
          this.dndata['open'][i][0],
          upDay and this.dndata['close'][i][1] or this.dndata['open'][i][1]
          upDay and this.dndata['open'][i][1] or this.dndata['close'][i][1]
          this.dndata['high'][i][1],
          this.dndata['low'][i][1],
          body_width or 5,
          (i and this.dndata['close'][i-1]? and (this.dndata['close'][i-1][1] < this.dndata['close'][i][1])) and cdown or cup,
          not upDay,
          true,
          Sai.util.infoSetters(fSetInfo, info)
        )
      )
    
    return this

class Sai.BarPlot extends Sai.Plot
  
  # if stacked, graph is rendered stacked...else, grouped
  # colors maps from series name to color string
  render: (stacked, colors) ->
    len: 0
    colorArray: []
    barfunc: if stacked then this.r.sai.prim.stackedBar else this.r.sai.prim.groupedBar
    
    for column of this.dndata
      len: this.dndata[column].length
      colorArray.push(colors and colors[column] or 'black')
    
    this.bars: this.r.set()
    
    for i in [0...len]
      bardata = []
      for column of this.dndata
        bardata.push(this.dndata[column][i])
      
      this.bars.push(
        barfunc(bardata, colorArray, this.w / len, this.y)
      )
    
    
    return this
