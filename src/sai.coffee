Sai: {} unless Sai?

Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type) ->
  type = {
    # todo
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h)
  chart.render()
  