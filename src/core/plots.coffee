# A plot is a primitive visualization of data
class Sai.Plot
    constructor: (@r, @x, @y, @w, @h, @data, @rawdata, @opts={}) ->
        @setDenormalizedData()
        @set = @r.set()
    
    setDenormalizedData: () ->
        if @data instanceof Array
            @dndata = (@denormalize(dnPoint) for dnPoint in @data)
        else
            @dndata ?= {}
            for series of @data
                @dndata[series] = (@denormalize(dnPoint) for dnPoint in @data[series])
    
    denormalize: (point) ->
        if point instanceof Array
            return [@x + (@w * point[0]), @y - (@h * point[1])]

    render: () ->
        @set.push(
            @r.rect(20, 20, 20, 20).attr('fill', 'red'),
            @r.circle(40, 40, 10).attr('fill', 'blue')
        )
        return this
    
    getInfoToggle: (setInfo, info) ->
        [
            () -> setInfo(info),
            () -> setInfo()
        ]
