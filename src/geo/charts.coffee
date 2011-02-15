class Sai.GeoChart extends Sai.Chart
    
    plotType: Sai.GeoPlot
    interactiveHistogram: true
    
    getMax: (data, series) ->
        Math.max.apply(Math, data)
    
    getMin: (data, series) ->
        d = data
        if @opts.ignoreZeroes
            d = (e for e in d when e != 0)
        Math.min.apply(Math, d)
    
    normalize: (data) ->
        @ndata = {}
        @bounds = {}
        maxes = {}
        mins = {}
        
        for series of data
            continue if series.match('^__') or series is @__LABELS__
            continue unless data[series]?
            dataWithoutNulls = (d for d in data[series] when d?)
            maxes[series] = @getMax(dataWithoutNulls, series)
            if not overallMax? or maxes[series] > overallMax then overallMax = maxes[series]
            mins[series] = @getMin(dataWithoutNulls, series)
            if not overallMin? or mins[series] < overallMin then overallMin = mins[series]
        
        for series of data
            continue if series.match('^__') or series is @__LABELS__
            continue unless data[series]?
            if @opts.groupedNormalization
                max = overallMax
                min = overallMin
            else
                max = maxes[series]
                min = mins[series]
            @bounds[series] = [min, max]
            @ndata[series] = {}
            @ndata[series][series] = ((if data[series][i]? then [i / (data[series].length - 1), ((data[series][i]-min) / (max-min))] else null) for i in [0...data[series].length])
    
    dataGroups: (data) ->
        groups = {
            '__META__': seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__
        }
        
        for seriesName of data
            unless seriesName.match("^__") or seriesName is @__LABELS__
                groups[seriesName] = [seriesName]
        
        return groups
    
    setupHistogramInteraction: (histogram, series) ->    
        histogram.click( () => @renderPlots(series) )
        drawInfo = @drawInfo
        Sai.util.setHover(
            histogram,
            {'fill-opacity': 0.75},
            {'fill-opacity': 1.0},
            [
                do (drawInfo, series) -> ->
                    drawInfo({'Click to display on map': series})
                ,
                do (drawInfo) -> ->
                    drawInfo()
            ]
        )
    
    renderPlots: (mainSeries) =>
        
        @setPlotCoords() unless @px?
        
        @bg?.remove()
        @logo?.remove()
        @geoPlot?.set.remove()
        
        @drawBG()
        @drawLogo()
        
        ndata = {}
        for series of @ndata
            ndata[series] = @ndata[series][series]
        
        @geoPlot = (new @plotType(
            @r,
            @px, @py, @pw, @ph,
            ndata,
            @data,
            {fromWhite: @opts.fromWhite}
        ))
        .render(@colors or {}, @data['__MAP__'], @__LABELS__, mainSeries ? @data['__DEFAULT__'], @opts.bgcolor, @opts.interactive and not @opts.simple, @drawInfo)
        
        return this
    
    default_info: () ->
        {'': if @opts.interactive then 'Click histogram below to change map display' else ''}

    renderFull: () ->
        
        @drawTitle()
        @setupInfoSpace()
        @drawFootnote()
        @drawHistogramLegend(series for series of @data when not (series.match('^__') or series is @__LABELS__))
        
        @setPlotCoords()
        
        @drawInfo()
        
        @renderPlots()
        
        everything = @r.set().push(
            @geoPlot.set,
            @bg,
            @logo,
            @info,
            @footnote
        )
        
        if @opts.href then everything.attr({
            href: @opts.href
            target: '_blank'
        })
        
        return this


class Sai.ChromaticGeoChart extends Sai.GeoChart
    
    plotType: Sai.ChromaticGeoPlot
    interactiveHistogram: false
    
    default_info: () ->
        {}
    
    setupHistogramInteraction: (histogram, series) ->    
        false
