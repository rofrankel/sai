Sai ?= {}
Sai.util ?= {}

Sai.util.round: (x, mag) ->
  mag ?= 0
  target: Math.pow(10, mag)
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, mag)))


Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type, data) ->
  type = {
    'line': Sai.LineChart
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h, data)
  chart.render()
  