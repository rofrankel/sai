# map looks like {width: w, height: h, paths: {CODE: "...", CODE: "..."}}
# data looks like {series: {series: [a, b, c]}, series2 = {series2: [b, c, a]}, __META__ = {__LABELS__: [CODE, CODE, CODE]}}
class Sai.GeoPlot extends Sai.Plot
    
    getRegionColor: (colors, ridx, mainSeries) ->
        return Sai.util.multiplyColor(colors[mainSeries], @data[mainSeries][ridx]?[1] or 0, @opts.fromWhite, if @opts.fromWhite then 0.2 else 0).str
    
    getRegionOpacity: (ridx, mainSeries) ->
        if @data[mainSeries][ridx]?[1]? then 1 else (if @opts.fromWhite then .15 else 0.25)
    
    render: (colors, map, regionSeries, mainSeries, bgcolor, shouldInteract, fSetInfo) ->
        
        @set.remove()
        
        regions = (region.toUpperCase() for region in @rawdata[regionSeries])
        ri = {}
        for i in [0...regions.length]
            ri[regions[i]] = i
        
        for region of map.paths
            ridx = ri[region]
            name = map.name[region]
            
            info = {region: name ? region}
            for series of @rawdata when series isnt regionSeries
                info[series] = @rawdata[series][ridx]
            
            color = @getRegionColor(colors, ridx, mainSeries)
            opacity = @getRegionOpacity(ridx, mainSeries)
            
            infoSetters = Sai.util.infoSetters(fSetInfo, info)
            
            path = map.paths[region]
            scale = Math.min(@w / map.width, @h / map.height)
            region_x = @x
            region_y = @y - @h
            
            @set.push(
                # fDraw, attrs, extras, hoverattrs
                hoverShape = @r.sai.prim.hoverShape(
                    do (path, scale, region_x, region_y) ->
                        return (r) ->
                            r.path(path).translate(region_x, region_y).scale(scale, scale, region_x, region_y)
                    ,
                    {
                        'fill': color
                        'stroke': if @opts.fromWhite then 'black' else bgcolor
                        'stroke-width': 0.5
                        'opacity': opacity
                    },
                    (if shouldInteract
                        [
                            do (infoSetters) ->
                                (target) ->
                                    # opera and IE have a bug where calling toFront() blocks the mouseout event
                                    target.toFront() unless navigator.userAgent.toLowerCase().indexOf('msie') isnt -1 or navigator.userAgent.toLowerCase().indexOf('opera') isnt -1
                                    infoSetters[0]()
                            ,
                            do (infoSetters) ->
                                infoSetters[1]
                        ]
                    else
                        null),
                    if shouldInteract then [{'fill-opacity': .75, 'stroke-width': (if @opts.fromWhite then 1.5 else 0.5)}, {'fill-opacity': 1, 'stroke-width': 0.5}] else null
                )
            )
            
        bbox = @set.getBBox()
        @set.translate((@w - bbox.width) / 2, (@h - bbox.height) / 2)
        
        return this


class Sai.ChromaticGeoPlot extends Sai.GeoPlot
    
    getRegionColor: (colors, ridx, mainSeries) ->
        r = g = b = 0
        for series of @data
            rgb = Sai.util.multiplyColor(colors[series], @data[series][ridx]?[1] or 0, @opts.fromWhite)
            r += rgb.r
            g += rgb.g
            b += rgb.b
        
        return    "rgb(#{r}, #{g}, #{b})"
    
    getRegionOpacity: (ridx, mainSeries) ->
        for series of @data
            if @data[series][ridx]?[1]? then return 1
        
        return 0.25
