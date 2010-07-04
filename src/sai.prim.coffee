Raphael.fn.sai.prim ?= {}

Raphael.fn.sai.prim.candlestick: (x, by0, by1, sy0, sy1, body_width, color) ->
  color ?= '#000'
  body_width++ unless body_width % 2
  bx: x - (body_width / 2.0)
  
  body: this.rect(bx, by0, body_width, by1-by0).attr('stroke', color)
  shadow: this.path("M" + x + " " + sy0 +
                    "L" + x + " " + by0 +
                    "M" + x + " " + by1 +
                    "L" + x + " " + sy1).attr('stroke', color)
  
  return this.set().push(body, shadow)


Raphael.fn.sai.prim.line: (coords, width, color) ->
  color ?= '#000'
  width ?= 1
  
  for coord in coords
    if path?
      path += ("L" + coord[0] + " " + coord[1])
    else
      path = ("M" + coord[0] + " " + coord[1])
  
  return this.path(path).attr({'stroke': color, 'stroke-width': width})


Raphael.fn.sai.prim.haxis: (vals, x, y, len, ticklen, width, color) ->
  ticklen ?= 2
  width ?= 1
  color ?= '#000'
  
  line: this.path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color)
  ticks: this.set()
  labels: this.set()
  
  dx: len / (vals.length - 1)
  xpos: x
  
  for val in vals
    ticks.push(this.path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color))
    label: this.text(xpos, y + ticklen + 2, val)
    label.attr('y', label.attr('y') + (label.getBBox().height / 2.0))
    labels.push(label)
    xpos += dx
  
  return this.set().push(line, ticks, labels)

Raphael.fn.sai.prim.vaxis: (vals, x, y, len, ticklen, width, color) ->
  ticklen ?= 2
  width ?= 1
  color ?= '#000'
  
  line: this.path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color)
  ticks: this.set()
  labels: this.set()
  
  dy: len / (vals.length - 1)
  ypos: y
  
  for val in vals
    ticks.push(this.path("M" + x + " " + ypos + "l" + (-ticklen) + " 0").attr('stroke', color))
    label: this.text(x - ticklen - 2, ypos, val)
    label.attr('x', label.attr('x') - (label.getBBox().width / 2.0))
    labels.push(label)
    ypos -= dy
  
  return this.set().push(line, ticks, labels)