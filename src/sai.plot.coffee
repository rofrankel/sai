# A plot is a primitive visualization of data
class Sai.Plot
  constructor: (r, x, y, w, h, data) ->
    this.r = r
    this.x = x or 0
    this.y = y or 0
    this.w = w or 640
    this.h = h or 480
    this.data = data
  
  denormalize: (point) ->
    return [this.x + (this.w * point[0]), this.y - (this.h * point[1])]

  render: () ->
    this.r.rect(20, 20, 20, 20).attr('fill', 'red')
    this.r.circle(40, 40, 10).attr('fill', 'blue')
    return this


class Sai.LinePlot extends Sai.Plot
  constructor: (r, x, y, w, h, data) ->
    super(r, x, y, w, h, data)
    this.denormalizedData = this.denormalize(dnPoint) for dnPoint in this.data
    return this
  
  render: () ->
    this.line: r.sai.prim.line(this.denormalizedData)
    return this
