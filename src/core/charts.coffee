# A chart composes plots and organizes them with e.g. axes
class Sai.Chart
    
    constructor: (@r, @x, @y, @w, @h, data, @__LABELS__, @opts={}) ->
        @opts.bgcolor ?= 'white'
        @colors = @opts['colors'] ? @random_colors(data)
        @setData(data)
    
    random_colors: (data) ->
        n = 0
        n++ for series of data
        colors_list = Sai.util.n_colors(n, Math.random)
        colors = {}
        pos = 0
        
        for series of data when not series.match('^__')
            colors[series] = colors_list[pos++]
        
        return colors
    
    groupsToNullPad: () ->
        return []
    
    nonNegativeGroups: () ->
        []
    
    nextSeriesSuffix: () ->
        @suffixCtr = (@suffixCtr ? 0) + 1
        return "[#{@suffixCtr}]"
    
    fixSeriesName: (seriesName) ->
        return seriesName + (if seriesName.match(/^\s+$/) then @nextSeriesSuffix() else '')
    
    setSemanticRename: (seriesName) ->
        return unless @semanticRenamePatterns?
        @semanticRenames ?= {}
        for rename of @semanticRenamePatterns
            if seriesName.match(@semanticRenamePatterns[rename])
                @semanticRenames[rename] = seriesName
    
    getBaseline: (group) ->
        nh0 = @normalizedHeight(0, group ? 'all')
        return [[0,nh0],[1,nh0]]
    
    setData: (data) ->
        
        @data = {}
        @renames = {}
        
        empty = (obj) ->
            for e of obj
                if obj.hasOwnProperty(e) then return false
            return true
        
        if empty(data)
            @render = ->
                @showError("(no data -> empty chart)")
            return
        
        # deep copy
        for series of data
            loop
                seriesName = @fixSeriesName(series)
                @setSemanticRename(seriesName)
                break if seriesName is series or seriesName not of data
            
            @renames[series] = seriesName
            
            if data[series] instanceof Array
                if @__LABELS__ is series
                    @__LABELS__ = seriesName
                    @data[seriesName] = (String(d) for d in data[series])
                else
                    @data[seriesName] = ((if typeof d is 'string' and d.match(/^( +)?[+-]?[\d,]+(\.\d+)?( +)?$/) and not isNaN(pd = parseFloat(d.replace(/,/g, ''))) then pd else d) for d in data[series])
            else
                @data[seriesName] = data[series]
        
        groups = @dataGroups(@data)
        nngroups = @nonNegativeGroups()
        for group of groups when groups[group].length > 0
            if group in nngroups
                for series in groups[group]
                    if @data[series]?
                        for i in [0...@data[series].length]
                            if @data[series][i] < 0 then @data[series][i] *= -1
        
        # do any necessary null padding
        for group in @groupsToNullPad() when group of groups
            for series in groups[group]
                @nullPad(series)
        
        @normalize(@data)
    
    nullPad: (seriesName) ->
        if seriesName of @data
            @data[seriesName] = [null].concat(@data[seriesName].concat([null]))
    
    # a line chart plots everything, but a stock chart only cares about e.g. high low open close avg vol
    caresAbout: (seriesName) ->
        return not (seriesName.match("^__") or seriesName is @__LABELS__)
    
    # Used to determine whether a data series should be used to scale the overall chart.
    # For example, in a stock chart, volume doesn't scale the chart.
    dataGroups: (data) ->
        {
            'all': (seriesName for seriesName of data when @caresAbout(seriesName))
            '__META__': (seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__)
        }
    
    getYAxisVals: (min, max, nopad=false) ->
        return [min, max] unless typeof min is "number" and typeof max is "number"
        
        if min is max then return [0, max, max * 2]
        
        factor = 1
        while((max - min) * factor) < 10
            factor *= 10
        
        # scale everything up if neccessary, making the following simpler
        min *= factor
        max *= factor
        
        mag = Math.floor(rawmag = (Math.log(max - min) / Math.LN10) - 0.4)
        step = Math.pow(10, mag)
        if rawmag % 1 > 0.7 and not nopad
            step *= 4
        else if rawmag % 1 > 0.35 and not nopad
            step *= 2
        
        bottom = Sai.util.round(min - (if nopad then (step / 2.1) else (step / 1.75)), step)
        bottom = 0 if bottom < 0 <= min
        top = Sai.util.round(max + (if nopad then (step / 2.1) else (step / 1.75)), step)
        
        # scale back down
        bottom /= factor
        top /= factor
        step /= factor
        
        i = bottom
        vals = [i]
        while i < top
            i = Sai.util.round(i + step, step)
            vals.push(i)
        
        return vals
    
    # takes e.g. groups[group], not just a group name
    getMax: (data, group) ->
        return Math.max.apply(Math, Math.max.apply(Math, d for d in data[series] when d? and typeof d is "number") for series in group when data[series]?)
    
    # takes e.g. groups[group], not just a group name
    getMin: (data, group) =>
        return Math.min.apply(Math, Math.min.apply(Math, d for d in data[series] when d? and typeof d is "number" and (not @opts.ignoreZeroes or d != 0)) for series in group when data[series]?)
    
    getStackedMax: (data, group) ->
        @stackedMax ?= {}
        @stackedMax[group] = @stackedMax[group] ? Math.max.apply(Math, Sai.util.sumArray(data[series][i] for series in group when series isnt @__LABELS__ and data[series][i] >= 0) for i in [0...data[@__LABELS__].length])
        return @stackedMax[group]
    
    # stacked charts generally have a 0 baseline
    getStackedMin: (data, group) ->
        @stackedMin ?= {}
        @stackedMin[group] = @stackedMin[group] ? Math.min.apply(Math, Sai.util.sumArray(data[series][i] for series in group when series isnt @__LABELS__ and data[series][i] < 0) for i in [0...data[@__LABELS__].length])
        return @stackedMin[group]
    
    normalize: (data) ->
        groups = @dataGroups(data)
        @ndata = {}
        if @opts.stacked? then @stackedNdata = {}
        
        norm = (val, min, max) ->
            if typeof val is "number"
                if min is max
                    return 1
                else
                    return (val - min) / (max - min)
            
            return null
        
        all = (f, a) ->
            for e in a
                if not f(e) then return false
            return true
        
        empty = (a) ->
            for e in a
                if typeof e is 'number' then return false
            return true
        
        for group of groups
            continue if group.match('^__') or Sai.util.sumArray(@data[series].length for series in groups[group]) is 0 or all(empty, @data[series] for series in groups[group])
            
            @ndata[group] = {}
            if @opts.stacked?
                @stackedNdata[group] = {}
                baselines = {}
            
            minf = if @opts.stacked then (d, g) => return @getStackedMin(d, g) else @getMin
            maxf = if @opts.stacked then (d, g) => return @getStackedMax(d, g) else @getMax
            min = minf(data, groups[group])
            max = maxf(data, groups[group])
            yvals = @getYAxisVals(min, max)
            min = yvals[0]
            max = yvals[yvals.length - 1]
            @ndata[group]['__YVALS__'] = yvals
            
            for series in groups[group]
                continue unless data[series]?
                @ndata[group][series] = ((if data[series][i]? and (nval = norm(data[series][i], min, max)) isnt null then [i / (data[series].length - 1 or 1), nval] else null) for i in [0...data[series].length])
                if @opts.stacked?
                    norm0 = norm(0, min, max)
                    @stackedNdata[group][series] = []
                    for i in [0...data[series].length]
                        bli = if data[series][i]? and data[series][i] < 0 then 0 else 1
                        baselines[i] ?= [norm0, norm0]
                        baseline = baselines[i][bli]
                        stackedPoint = [i / (data[series].length - 1 or 1), ((norm(data[series][i], min, max) ? norm0) - norm0) + baseline]
                        @stackedNdata[group][series].push(stackedPoint)
                        baselines[i][bli] = stackedPoint[1] unless stackedPoint is null
    
    addAxes: (groups, titles) ->
        
        LINE_HEIGHT = 10
        
        @axisWidth = 1.5
        
        # the 5 is for the half a text line at the top tick
        @padding.top += 5
        # (over)estimate how much padding we need for the last label
        for i in [@data[@__LABELS__].length-1..0]
            if @data[@__LABELS__][i]?
                tmptext = @r.text(0, 0, Sai.util.num_abbrev(@data[@__LABELS__][i]))
                @padding.right += tmptext.getBBox().width / 2
                tmptext.remove()
                break
        
        vlen = @h - (@padding.bottom + @padding.top)
        
        doLeftAxis = @ndata[groups[0]]? or not @ndata[groups[1]]?
        doRightAxis = @ndata[groups[1]]?
        
        if doLeftAxis
            _vaxis = @r.sai.prim.vaxis(
                @ndata[groups[0]]?['__YVALS__'] ? [0, '?'],
                @x + @padding.left,
                @y - @padding.bottom,
                vlen,
                {width: @axisWidth, title: titles?.left}
            )
            vaxis_width = _vaxis.items[0].getBBox().width
            _vaxis.remove()
        else
            vaxis_width = 0
            
        if doRightAxis
            _vaxis = @r.sai.prim.vaxis(
                @ndata[groups[1]]?['__YVALS__'] ? [0, '?'],
                @x + @padding.left,
                @y - @padding.bottom,
                vlen,
                {width: @axisWidth, title: titles?.right}
            )
            vaxis2_width = _vaxis.getBBox().width
            _vaxis.remove()
        else
            vaxis2_width = 0
        
        hlen = @w - @padding.left - @padding.right - vaxis_width - vaxis2_width
        @haxis = @r.sai.prim.haxis(
            @data[@__LABELS__],
            @x + @padding.left + vaxis_width,
            @y - @padding.bottom,
            hlen,
            {width: @axisWidth,title: titles?.bottom}
        )
        hbb = @haxis.getBBox()
        haxis_height = hbb.height
        if isNaN(haxis_height) then haxis_height = 1
        @haxis.translate(0, -haxis_height)
        @padding.bottom += haxis_height
        
        vlen = @h - (@padding.bottom + @padding.top)
        
        if doLeftAxis
            @vaxis = @r.sai.prim.vaxis(
                @ndata[groups[0]]?['__YVALS__'] ? [0, '?'],
                @x + @padding.left,
                @y - @padding.bottom,
                vlen,
                {width: @axisWidth, title: titles?.left}
            )
            vbbw = @vaxis.items[0].getBBox().width
            @vaxis.translate(vbbw, 0)
            @padding.left += vbbw
        
        if doRightAxis
            @vaxis_right = @r.sai.prim.vaxis(
                @ndata[groups[1]]?['__YVALS__'] ? [0, '?'],
                @w - @padding.right,
                @y - @padding.bottom,
                vlen,
                {width: @axisWidth, right: true, title: titles?.right, color: if @ndata[groups[0]]? then @colors.__RIGHTAXIS__ ? 'blue' else 'black'}
            )
            vrbbw = @vaxis_right.items[0].getBBox().width
            @vaxis_right.translate(-vrbbw, 0)
            @padding.right += vrbbw
        
        @setPlotCoords()
        
        @axes = @r.set().push(@haxis).push(@vaxis)
        
        @everything ?= @r.set()
        @everything.push(@axes)
        
        return @axes

    setPlotCoords: () ->
        @px = @x + @padding.left
        @py = @y - @padding.bottom
        @pw = @w - @padding.left - @padding.right
        @ph = @h - @padding.bottom - @padding.top
        
        lbb = @legend?.getBBox()
        @legend?.translate(@px + @pw/2 - (lbb.x + lbb.width/2), 0)
        
        hlbb = @histogramLegend?.getBBox()
        @histogramLegend?.translate(@px + @pw/2 - (hlbb.x + hlbb.width/2), 0)
    
    drawBG: () ->
        @bg = @r.rect(
            @px? and @px or @x,
            @py? and (@py - @ph) or (@y - @h),
            @pw? and @pw or @w,
            @ph? and @ph or @h
        ).attr({fill: @opts.bgcolor, 'stroke-width': 0, 'stroke-opacity': 0}).toBack()
    
    drawFootnote: (text) ->
        text ?= @opts.footnote ? ''
        
        # don't try to draw an empty footnote
        return if text.match(/^\s*$/)
        
        @footnote = @r.sai.prim.wrappedText(@x + @padding.left, @y - @padding.bottom, @w, text, ' ')
        h = @footnote.getBBox().height
        @padding.bottom += h + 10
        @footnote.translate(0, -h)
        
        @everything ?= @r.set()
        @everything.push(@footnote)
    
    render: () ->
        @everything?.remove()
        
        init_padding = if @opts.simple then 0 else 5
        @padding = {
            left: init_padding
            right: init_padding
            top: init_padding
            bottom: init_padding
        }
        
        if @opts.simple and @renderPlots?
            @renderPlots()
        else
            @renderFull()
        
        if @plots
            @everything ?= @r.set()
            @everything.push(plot.set) for plot in @plots
        
        return this
    
    renderFull: () ->
        @plot ?= new Sai.Plot(@r)
        @plot.render()
        return this

    
    showError: (error) ->
        err = this.r.text(@x + @padding.left + ((@pw ? @w)/2), @y - @padding.bottom - ((@ph ? @h)/2), error)
    
    # map from series name to color
    setColors: (colors) ->
        @colors ?= {}
        for series of colors
            seriesName = @renames[series]
            if seriesName of @data
                @colors[seriesName] = colors[series]
        return this
    
    setColor: (series, color) ->
        @colors ?= {}
        @colors[@renames[series]] = color
        return this

    normalizedHeight: (h, group) ->
        return unless @ndata[group]?['__YVALS__']?
        
        ymin = @ndata[group]['__YVALS__'][0]
        ymax = @ndata[group]['__YVALS__'][@ndata[group]['__YVALS__'].length - 1]
        
        if h < ymin then h = ymin else if h > ymax then h = ymax
        
        nh = (h - ymin) / (ymax - ymin)
    
    drawGuideline: (h, group='all') ->
        return unless @ndata[group]?['__YVALS__']?
        
        nh = @normalizedHeight(h, group)
        
        @guidelines ?= @r.set()
        
        guideline = new Sai.LinePlot(
            @r,
            @px, @py, @pw, @ph,
            {'guideline': [[0, nh], [1, nh]]}
        )
        
        guideline.render({'guideline': '#ccc'})
        
        @guidelines.push(guideline.set)
        
        @everything ?= @r.set()
        @everything.push(@guidelines)
    
    drawLegend: (colors) ->
        colors ?= @colors
        if colors
            _colors = {}
            _highlightColors = {}
            for l of colors when l isnt @__LABELS__
                _colors[l] = colors[l]
                _highlightColors[l] = 'black'
                if @opts.groups?.right?
                    if l in @opts.groups.right
                        _highlightColors[l] = if @ndata.left? then @colors.__RIGHTAXIS__ ? 'blue' else 'black'
            @legend = @r.sai.prim.legend(@x, @y - @padding.bottom, @w, _colors, _highlightColors)
            bbox = @legend.getBBox()
            if @legend.length > 0 then @padding.bottom += bbox.height + 15
            @legend.translate((@w - bbox.width) / 2, 0)
        
        @everything ?= @r.set()
        @everything.push(@legend)
    
    drawTitle: () ->
        if @opts.title?
            @title = @r.text(@x + (@w / 2), @y - @h, @opts.title).attr({'font-size': 20})
            @title.translate(0, @title.getBBox().height / 2)
            @padding.top += @title.getBBox().height + 5
        
        @everything ?= @r.set()
        @everything.push(@title)
    
    # this reserves room for the info thing
    setupInfoSpace: () ->
        @info_y = @y - @h + @padding.top
        @info_x = @x + @padding.left
        @info_w = @w - @padding.left - @padding.right
        @padding.top += 30
    
    drawInfo: (info, clear=true) =>    
        info ?= @default_info?() ? {}
        
        # clear out anything that already exists
        if clear
            @info_data = {}
        
        if @info
            @info.remove()
        
        for label of info
            unless label.match("^__")
                @info_data[label] = info[label] ? '(no data)'
        
        @info = @r.sai.prim.info(@info_x, @info_y, @info_w, @info_data)
    
    getIndex: (evt) ->
        tx = Sai.util.transformCoords(evt, @r.canvas).x
        return Math.round((@data[@__LABELS__].length - 1) * (tx - @px) / @pw)
    
    drawHistogramLegend: (seriesNames, colors, labels) ->
        colors ?= @colors
        
        @histogramLegend = @r.set()
        extrapadding = 20
        height = Math.max(0.1 * (@h - @padding.bottom - @padding.top), 50)
        width = Math.min(150, (@w - @padding.left - @padding.right - extrapadding) / seriesNames.length)
        
        for i in [0...seriesNames.length]
            series = seriesNames[i]
            data = (@ndata[series][series][j][1] for j in [0...@ndata[series][series].length] when @ndata[series][series][j]?)
            
            if @opts.ignoreZeroes
                data = (d for d in data when d != 0)
            
            if @bounds?[series]?
                [min, max] = @bounds[series]
            else
                dataWithoutNulls = (x for x in @data[series] when x? and (not @opts.ignoreZeroes or x != 0))
                [min, max] = [Math.min.apply(Math, dataWithoutNulls), Math.max.apply(Math, dataWithoutNulls)]
            
            yvals = @getYAxisVals(min, max, true)
            minLabel = yvals[0]
            maxLabel = yvals[yvals.length - 1]
            color = colors[series]
            @histogramLegend.push(
                histogram = @r.sai.prim.histogram(
                    @x + (i * width),
                    @y - @padding.bottom,
                    width * 0.8, height,
                    data,
                    minLabel,
                    maxLabel,
                    labels?[i] ? series,
                    if typeof color is 'object' then [color.__LOW__, color.__HIGH__] else [color],
                    'white',
                    @opts.fromBlack
                )
            )
            
            if @opts.interactive then @setupHistogramInteraction(histogram, series)
        
        @histogramLegend.translate((@w - @padding.left - @padding.right - @histogramLegend.getBBox().width) / 2, 0)
        @padding.bottom += height + 5

    setupHistogramInteraction: (histogram, series) ->
        null
