class Sai.StockChart extends Sai.Chart
    
    semanticRenamePatterns: {
        'open': /^open$/i
        'close': /^close$/i
        'high': /^high$/i
        'low': /^low$/i
        'volume': /^vol(ume)?$/i
    }
    
    groupsToNullPad: () ->
        return ['prices', 'volume', '__META__']
    
    dataGroups: (data) ->
        groups = {
            '__META__': [@__LABELS__]
        }
        volume_name = @semanticRenames['volume'] ? 'volume'
        if volume_name of @data then groups['volume'] = [volume_name]
        for seriesName of data when @caresAbout(seriesName) and seriesName not in [@__LABELS__, volume_name]
            groups.prices ?= []
            groups.prices.push(seriesName)
        return groups
    
    nonNegativeGroups: () ->
        ['volume']
    
    renderPlots: () ->
        @setPlotCoords() unless @px?
        
        open_name = @semanticRenames['open'] ? 'open'
        close_name = @semanticRenames['close'] ? 'close'
        high_name = @semanticRenames['high'] ? 'high'
        low_name = @semanticRenames['low'] ? 'low'
        volume_name = @semanticRenames['volume'] ? 'volume'
        
        @colors ?= {}
        @colors['__UP__'] ?= 'black'
        @colors['__DOWN__'] ?= 'red'
        @colors['__VOL_UP__'] ?= '#666666'
        @colors['__VOL_DOWN__'] ?= '#cc6666'
        
        # @drawLegend({up: @colors.up, down: @colors.down})
        
        @drawLogo()
        @drawBG()
        
        unless @ndata.prices? and open_name of @ndata.prices and close_name of @ndata.prices and high_name of @ndata.prices and low_name of @ndata.prices 
            @showError("This chart requires data series named\nopen, close, high, and low.\n \nOnce you add series with these names, the chart will display.")
            return
        
        if @ndata.prices['__YVALS__'][0] < 0
            @drawGuideline(0, 'prices')
        
        vol = {
            'up': []
            'down': []
        }
        
        rawdata = {}
        for p of @ndata['prices']
            unless p.match('^__') or p is @__LABELS__
                rawdata[p] = @data[p]
        if @data[volume_name]? then rawdata['vol'] = @data[volume_name]
        
        if 'volume' of @ndata
            for i in [0...@ndata['volume'][volume_name].length]
                if @ndata['volume'][volume_name][i] isnt null
                    if i and @ndata['prices'][close_name][i-1] and (@ndata['prices'][close_name][i][1] < @ndata['prices'][close_name][i-1][1])
                        vol.down.push(@ndata['volume'][volume_name][i])
                        vol.up.push([@ndata['volume'][volume_name][i][0], 0])
                    else
                        vol.up.push(@ndata['volume'][volume_name][i])
                        vol.down.push([@ndata['volume'][volume_name][i][0], 0])
                else
                    vol.up.push([0, 0])
                    vol.down.push([0, 0])
            
            @plots.push(
                (new Sai.BarPlot(
                    @r
                    @px,
                    @py,
                    @pw,
                    @ph * 0.2,
                    vol,
                    rawdata)
                )
                .render(true, @normalizedHeight(0, 'volume'), {'up': @colors['__VOL_UP__'], 'down': @colors['__VOL_DOWN__']})
            )
        
        @plots.push(
            (new Sai.CandlestickPlot(
                @r,
                @px,
                @py,
                @pw, @ph,
                {
                 'open': @ndata['prices'][open_name],
                 'close': @ndata['prices'][close_name],
                 'high': @ndata['prices'][high_name],
                 'low': @ndata['prices'][low_name]
                },
                rawdata)
            )
            .render(@colors, Math.min(5, (@pw / @ndata['prices'][open_name].length) - 2))
        )
        
        
        avgNdata = {}
        for series of @ndata['prices']
            unless (series in [open_name, close_name, high_name, low_name]) or series.match("^__") or series is @__LABELS__
                avgNdata[series] = @ndata['prices'][series]
        
        @plots.push(
            (new Sai.LinePlot(
                @r,
                @px, @py, @pw, @ph,
                avgNdata))
            .render(@colors)
        )
    
    renderFull: () ->
        @drawTitle()
        @setupInfoSpace()
        @drawFootnote()
        
        open_name = @semanticRenames['open'] ? 'open'
        close_name = @semanticRenames['close'] ? 'close'
        high_name = @semanticRenames['high'] ? 'high'
        low_name = @semanticRenames['low'] ? 'low'
        volume_name = @semanticRenames['volume'] ? 'volume'
        
        avgColors = {}
        shouldDrawLegend = false
        for series of @ndata['prices'] when series not in [open_name, close_name, high_name, low_name] and not (series.match('^__') or series is @__LABELS__)
            avgColors[series] = @colors?[series] or 'black'
            shouldDrawLegend = true
        if shouldDrawLegend then @drawLegend(avgColors)
        
        @addAxes(['prices'])
        
        @renderPlots()
        
        glow_width = @pw / (@data[@__LABELS__].length - 1)
        glow_color = @colors['__GLOW__'] ? '#DDAA99'
        @glow = @r.rect(@px - (glow_width / 2), @py - @ph, glow_width, @ph)
                    .attr({fill: "0-#{@opts.bgcolor}-#{glow_color}-#{@opts.bgcolor}", 'stroke-width': 0, 'stroke-opacity': 0})
                    .toBack()
                    .hide()
        @bg.toBack()
        
        if @opts.interactive
            everything = @r.set().push(@bg, @plotSets(), @logo, @glow, @guidelines).mousemove(
                moveGlow = (event) =>
                    
                    idx = @getIndex(event)
                    
                    info = {}
                    
                    if @data[@__LABELS__][idx]? then info[@__LABELS__] = @data[@__LABELS__][idx]
                    
                    notNull = false
                    for series of @ndata['prices'] when not (series.match('^__') or series is @__LABELS__)
                        if @data[series]?[idx]?
                            info[series] = @data[series][idx]
                            notNull = true
                    if @data[volume_name]?[idx]?
                        info[volume_name] = @data[volume_name][idx]
                        notNull = true
                    @drawInfo(info)
                    if notNull
                        @glow.attr({x: @px + (glow_width * (idx - 0.5))}).show()
                    
            ).mouseout(
                (event) =>
                    @drawInfo({}, true)
                    @glow.hide()
            )
        
        return this
