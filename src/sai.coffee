`Sai = {};` # create a global Sai object
Sai.util = {}

Sai.util.round = (x, step) ->
    return parseFloat((Math.round(x / step) * step).toFixed(Math.max(0, Math.ceil(-1 * Math.log(step) / Math.LN10))))

Sai.util.sumArray = (a) ->
    sum = 0
    for e in a
        sum += e if typeof e is 'number'
    
    return sum

Sai.util.num_abbrev = (x, precision=2, abbrev_precision=1) ->
    if typeof x is 'number'
        suffixes = ['k', 'm', 'b', 't']
        for magnitude in [suffixes.length-1 .. 0] by -1
            zeroes = 3 * (magnitude + 1)
            threshold = Math.pow(10, zeroes)
            
            # if our precision includes the whole number, then don't abbreviate it
            if abbrev_precision > zeroes
                return x
            
            if Math.abs(x) >= threshold
                return parseFloat((x / threshold).toFixed(abbrev_precision)) + suffixes[magnitude]
        
        # if we got here then x is under 1000, so we can't really abbreviate it
        return String(parseFloat(x.toFixed(precision)))
    
    # if we got here then x is not a number, so just return it
    return x

Sai.util.num_pretty = (num) ->
    if isNaN(parseFloat(num)) or not String(num).match(/^[-+]?\d+(\.\d+)?$/)
        return undefined
    
    num = String(num).split('.')
    rgx = /(\d+)(\d{3})/
    while rgx.test(num[0])
        num[0] = num[0].replace(rgx, '$1,$2')
    
    return num[0] + (if num.length > 1 then parseFloat("0." +num[1]).toFixed(2).slice(1) else '')

Sai.util.infoSetters = (setInfo, info) ->
    [
        () ->
            setInfo(info)
        ,
        () ->
            setInfo()
    ]

Sai.util.transformCoords = (evt, canvas) ->
    if canvas.getScreenCTM
        svgPoint = canvas.createSVGPoint();
        svgPoint.x = evt.clientX
        svgPoint.y = evt.clientY
        coords = svgPoint.matrixTransform(canvas.getScreenCTM().inverse())
        # stupid WebKit bug
        # todo: make this detection a little cleaner?
        if navigator.userAgent.toLowerCase().indexOf('chrome') isnt -1 or navigator.userAgent.toLowerCase().indexOf('safari') isnt -1
            coords.x += document.body.scrollLeft
            coords.y += document.body.scrollTop
        return {x: coords.x, y: coords.y}
    else
        {x: evt.x, y: evt.y}


Sai.util.multiplyColor = (colorStr, coeff, fromWhite, padding=0) ->
    coeff = padding + (1.0 - padding) * coeff
    rgb = Raphael.getRGB(colorStr)
    if fromWhite
        r = rgb.r + ((255 - rgb.r) * (1.0 - coeff))
        g = rgb.g + ((255 - rgb.g) * (1.0 - coeff))
        b = rgb.b + ((255 - rgb.b) * (1.0 - coeff))
    else
        r = rgb.r * coeff
        g = rgb.g * coeff
        b = rgb.b * coeff
    return {
        r: Math.max(r, 0), g: Math.max(g, 0), b: Math.max(b, 0),
        str: "rgb(#{r}, #{g}, #{b})"
    }

Sai.util.colerp = (color1, color2, alpha) ->
    rgb1 = Raphael.getRGB(color1)
    rgb2 = Raphael.getRGB(color2)
    r = rgb2.r * alpha + rgb1.r * (1 - alpha)
    g = rgb2.g * alpha + rgb1.g * (1 - alpha)
    b = rgb2.b * alpha + rgb1.b * (1 - alpha)
    return "rgb(#{r}, #{g}, #{b})"


# if a channel is 2/3 of the way from black to mirror, then the result in that
# channel is 2/3 of the way from white to the mirror, or 1/3 of the way from
# the mirror to white
Sai.util.reflectColor = (color, mirror) ->
    max = 255
    crgb = Raphael.getRGB(color)
    mrgb = Raphael.getRGB(mirror)
    rgb = {}
    
    for channel in ['r', 'g', 'b']
        c = crgb[channel]
        m = mrgb[channel]
        if c == m
            rgb[channel] = c
        
        # if c is .9 and m is .2 then c is 1/8 of the way from white to m, so
        # we want 1/8 of the way from 0 to .2 = .2 * (1-.9)/(1-.2) = .2 * 1/8
        else if c > m 
            rgb[channel] = m * ((max - c) / (max - m))
        
        # otherwise, we want to invert that, so solving for c we get
        # c' = m * ((max - c) / (max - m))
        # c' / m = (max - c) / (max - m)
        # c' * (max - m) / m = max - c
        # c = max - (c' * (max - m) / m)
        else
            rgb[channel] = max - (c * (max - m) / m)
    
    return "rgb(#{rgb.r}, #{rgb.g}, #{rgb.b})"


Sai.util.setHover = (target, attrOn, attrOff, extras) ->
    return target.hover(
        () ->
            target.attr(attrOn)
            extras?[0]?(target)
        ,
        () ->
            target.attr(attrOff)
            extras?[1]?(target)
    )


# for maps
Sai.data ?= {}
Sai.data.map ?= {}


Raphael.fn.sai ?= {}
