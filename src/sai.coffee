Sai ?= {}
Sai.util ?= {}

Sai.util.roundToMag: (x, mag) ->
  mag ?= 0
  target: Math.pow(10, mag)
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, mag)))

Sai.util.round: (x, target) ->
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, Math.log(x) / Math.LN10)))

# why isn't this already in JS? :/
Sai.util.sumArray: (a) ->
  sum: 0
  for i in [0...a.length]
    sum += if typeof a[i] == 'number' then a[i] else 0
  
  return sum



Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type, data) ->
  type = {
    'line': Sai.LineChart
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h, data)
  chart.render()
  