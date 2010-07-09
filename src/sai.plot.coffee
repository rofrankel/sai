# A plot is a primitive visualization of data
class Sai.Plot
  constructor: (r, x, y, w, h, data) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
    this.data = data
    this.setDenormalizedData()
  
  setDenormalizedData: () ->
    this.dndata: this.denormalize(dnPoint) for dnPoint in this.data
  
  denormalize: (point) ->
    return [this.x + (this.w * point[0]), this.y - (this.h * point[1])]

  render: () ->
    this.r.rect(20, 20, 20, 20).attr('fill', 'red')
    this.r.circle(40, 40, 10).attr('fill', 'blue')
    return this


class Sai.LinePlot extends Sai.Plot
  
  render: (color, width) ->
    this.line: r.sai.prim.line(this.dndata, color or 'black', width or 1)
    return this


# Raphael.fn.sai.prim.candlestick: (x, by0, by1, sy0, sy1, body_width, color) ->
class Sai.CandlestickPlot extends Sai.Plot
  
  setDenormalizedData: () ->
    this.dndata ?= {}
    this.dndata['open']: this.denormalize(dnPoint) for dnPoint in this.data['open']
    this.dndata['close']: this.denormalize(dnPoint) for dnPoint in this.data['close']
    this.dndata['high']: this.denormalize(dnPoint) for dnPoint in this.data['high']
    this.dndata['low']: this.denormalize(dnPoint) for dnPoint in this.data['low']

  render: (colors, body_width) ->
    cup: colors and colors['up'] or 'black'
    cdown: colors and colors['down'] or 'red'
    body_width ?= 5
    
    this.candlesticks: r.set()
    for i in [0...this.dndata['open'].length]
      
      # Y coords are inverted, which makes a lot of stuff seem backwards...
      upDay: this.dndata['close'][i][1] < this.dndata['open'][i][1]
      
      this.candlesticks.push(
        r.sai.prim.candlestick(this.dndata['open'][i][0],
                               upDay and this.dndata['close'][i][1] or this.dndata['open'][i][1]
                               upDay and this.dndata['open'][i][1] or this.dndata['close'][i][1]
                               this.dndata['high'][i][1],
                               this.dndata['low'][i][1],
                               body_width or 5,
                               (i and (this.dndata['close'][i-1][1] < this.dndata['close'][i][1])) and cdown or cup,
                               not upDay)
      )
    
    return this

class Sai.BarPlot extends Sai.Plot
  