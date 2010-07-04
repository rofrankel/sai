Sai: {} unless Sai?

Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type, data) ->
  type = {
    # todo
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h, data)
  chart.render()
  