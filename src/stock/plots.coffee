class Sai.CandlestickPlot extends Sai.Plot

    render: (colors, body_width=5, shouldInteract, fSetInfo) ->
        
        @set.remove()
        
        cup = colors?['up'] or 'black'
        cdown = colors?['down'] or 'red'
        
        for i in [0...@dndata['open'].length]
            
            continue unless @dndata['close'][i]?
            
            # Y coords are inverted, which makes a lot of stuff seem backwards...
            upDay = @dndata['close'][i][1] < @dndata['open'][i][1]
            
            info = {}
            for p of @rawdata
                info[p] = @rawdata[p][i]
            
            @set.push(
                @r.sai.prim.candlestick(
                    @dndata['open'][i][0],
                    upDay and @dndata['close'][i][1] or @dndata['open'][i][1]
                    upDay and @dndata['open'][i][1] or @dndata['close'][i][1]
                    @dndata['high'][i][1],
                    @dndata['low'][i][1],
                    body_width or 5,
                    if (i and @dndata['close'][i-1]? and (@dndata['close'][i-1][1] < @dndata['close'][i][1])) then cdown else cup,
                    not upDay,
                    shouldInteract,
                    fSetInfo,
                    Sai.util.infoSetters(fSetInfo, info)
                )
            )
        
        return this
