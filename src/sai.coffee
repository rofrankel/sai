Sai ?= {}
Sai.util ?= {}

Sai.util.range: (start, stop, inc) ->
  inc: or 1 # we don't want an inc of 0...
  x: start
  result: []
  mag: Math.round(-Math.log(inc) / Math.LN10)
  unless stop
    stop = start
    start = 0
  
  inc *= -1 if (start < stop) isnt (inc > 0)
  
  while (x < stop and inc > 0) or (x > stop and inc < 0)
    result.push(x)
    x: Sai.util.round(x + inc, mag)
  
  return result

Sai.util.round: (x, mag) ->
  mag ?= 0
  mag = 0 if mag < 0
  return parseFloat(x.toFixed(mag))


Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type, data) ->
  type = {
    # todo
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h, data)
  chart.render()
  