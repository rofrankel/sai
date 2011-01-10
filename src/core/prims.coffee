Raphael.fn.sai.prim ?= {}

Raphael.fn.sai.prim.haxis = (vals, x, y, len, opts) ->
    ticklens = opts.ticklens ? [5, 2]
    width = opts.width ? 1
    color = opts.color ? 'black'
    
    line = @path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color)
    ticks = @set()
    labels = @set()
    
    max_labels = len / 25
    interval = if max_labels < vals.length then Math.ceil(vals.length / max_labels) else 1
    
    dx = len / (vals.length - 1) * interval
    xpos = x
    xmax = -1
    rotate = false
    padding = 2
    max_label_width = 0
    ymin = null
    
    for i in [0...vals.length] by interval
        val = vals[i]
        if val?
            ticklen = ticklens[if String(val) then 0 else 1]
            ticks.push(@path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color))
            unless val is ''
                label = @text(xpos, y + ticklen + padding, Sai.util.num_abbrev(val).substring(0, 12))
                bbox = label.getBBox()
                ly = label.attr('y') + 5
                label.attr('y', ly)
                if not ymin? or ly < ymin then ymin = ly
                labels.push(label)
                
                # handle collision detection for rotation
                bbw = bbox.width
                max_label_width = Math.max(bbw, max_label_width)
                if bbox.x <= xmax + 3 then rotate = true
                if bbox.x + bbw > xmax then xmax = bbox.x + bbw
        xpos += dx
    
    if opts.title?
        title = @text(x + len/2, ymin + 14, opts.title).attr({'font-size': '12px', 'font-weight': 'bold'})
    
    result = @set().push(line, ticks, labels, title)
    
    if rotate
        for label in labels.items
            label.rotate(-90)
            label.translate(0, label.getBBox().width/2 - padding)
        # this is a hack because getBBox() doesn't work for rotated text
        result.push(@rect(x, y, 1, width + max_label_width + ticklens[0]).attr('opacity', '0'))
    
    return result

Raphael.fn.sai.prim.vaxis = (vals, x, y, len, opts) ->
    ticklens = opts.ticklens ? [5, 2]
    width = opts.width ? 1
    color = opts.color ? 'black'
    right = opts.right ? false
    
    line = @path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color)
    ticks = @set()
    labels = @set()
    
    dy = len / (vals.length - 1)
    ypos = y
    xmin = null
    
    label_strs = []
    labels_unique = true
    for val in vals when val isnt null
        str = Sai.util.num_abbrev(val)
        if str in label_strs
            labels_unique = false
            break
        label_strs.push(str)
    
    unless labels_unique
        label_strs = (Sai.util.num_abbrev(val, 2, 2) for val in vals)
    
    pos = 0
    for val in vals
        unless val is null
            ticklen = ticklens[if String(val) then 0 else 1]
            ticks.push(@path("M" + x + " " + ypos + "l" + (if right then ticklen else -ticklen) + " 0").attr('stroke', color))
            lx = x + ((if right then 1 else -1) * (ticklen + 3))
            label = @text(lx, ypos, label_strs[pos++])
            label.attr({
                'text-anchor': if right then 'start' else 'end'
                'fill': color
            })
            lx += (if right then 1 else -1) * (label.getBBox().width + 8)
            if not xmin? or lx < xmin then xmin = lx
            labels.push(label)
        ypos -= dy
    
    if opts.title?
        title = @text(xmin, y - len/2, opts.title).attr({'font-size': '12px', 'font-weight': 'bold'})
        bbox = title.getBBox()
        title.rotate(-90)
        # stupid broken svg implementations not updating the bounding box of rotated text...
        dummy = @rect(bbox.x + (bbox.width - bbox.height)/2, y, bbox.height, 1).attr({opacity: 0})
    
    dummy ?= null
    
    return @set().push(@set().push(line, ticks, labels, dummy), title)


# texts is a map that is displayed "key = value"
# the __TITLE__ key is shown alone and centered at the top.
# opts used to specify colors
# width and height are inferred
# text is 9px high, so leave 10 px each
Raphael.fn.sai.prim.popup = (x, y, texts, opts) ->
    TEXT_LINE_HEIGHT = 10
    
    set = @set()
    text_set = @set()
    max_width = 0
    py = y + 5 + (TEXT_LINE_HEIGHT / 2)
    
    if '__HEAD__' of texts
        head_text = @text(x, py, texts['__HEAD__']).attr({'fill': '#cfc', 'font-size': '12', 'font-weight': 'bold'})
        max_width = Math.max(max_width, head_text.getBBox().width)
        text_set.push(head_text)
        py += (TEXT_LINE_HEIGHT + 2) + 5
    
    # create text and find total height
    for text of texts
        continue if text is '__HEAD__'
        t = @text(x + 5, py, text + " = " + texts[text]).attr({'fill': 'white', 'font-weight': 'bold', 'text-anchor': 'start'})
        max_width = Math.max(max_width, t.getBBox().width)
        py += TEXT_LINE_HEIGHT
        text_set.push(t)
    
    bg_width = max_width + 10
    rect = @rect(x, y, bg_width, (py - y), 5).attr({'fill': 'black', 'fill-opacity': '.85', 'stroke': 'black'})
    
    head_text?.translate(bg_width / 2)
    text_set.toFront()
    

# legend_colors is a map from key names to colors
Raphael.fn.sai.prim.legend = (x, y, max_width, legend_colors, highlightColors) ->
    spacing = 15
    line_height = 14
    y -= line_height
    
    set = @set()
    
    px = x
    py = y
    
    for text of legend_colors
        t = @text(px + 14, py + 5, text).attr({
            fill: highlightColors?[text] ? 'black'
            'text-anchor': 'start'
        })
        r = @rect(px, py, 9, 9).attr({
            'fill': legend_colors[text] ? 'black'
            'stroke': highlightColors?[text] ? 'black'
        })
        key = @set().push(t, r)
        key_width = key.getBBox().width
        if (px - x) + spacing + key_width > max_width
            set.translate(0, -line_height)
            key.translate(x - px, y - py)
            px = x
            py = y
        
        px += key_width + spacing
        
        set.push(key)
    
    return set


Raphael.fn.sai.prim.wrappedText = (x, y, w, text='', delimiter=' ', max_lines)    ->
    spacing ?= 1
    spacer = ''
    
    # don't try to draw an empty footnote
    return if text.match(/^\s*$/)
    
    pixels_per_char = 6
    chars_per_line = w / pixels_per_char
    
    lines = []
    idx = 0
    while idx < text.length - 1
        potential_end = idx + chars_per_line
        potential_line = text.substring(idx, potential_end + 1)
        end = if potential_end >= text.length then potential_end    else potential_line.lastIndexOf(delimiter)
        lines.push(potential_line.substring(0, end))
        idx += end + 1
    
    text = lines.join('\n')

    return @text(x, y + (5 * lines.length), text).attr({'font-family': 'Lucida Console', 'text-anchor': 'start'})
    

# info is a map from labels to info, e.g. {'close': 123.45}
Raphael.fn.sai.prim.info = (x, y, max_width, info) ->
    spacing = 15
    line_height = 14
    
    set = @set()
    
    px = x
    py = y
    char_width = 6
    
    for label of info
        continue if info[label] is null
        text = label + (if label is '' then '' else ': ')
        if typeof info[label] is 'string'
            text += info[label]
        else
            text += Sai.util.num_pretty(info[label]) ? Sai.util.num_abbrev(info[label])
        
        twidth = char_width * text.length
        if (px - x) + twidth > max_width
            px = x
            py += line_height
        
        t = @text(px, py, text).attr({'font-family': 'Lucida Console', 'text-anchor': 'start'})
        
        px += twidth + spacing
        
        set.push(t)
    
    return set


Raphael.fn.sai.prim.hoverShape = (draw, attrs, extras, hoverattrs) ->
    shape = draw(this).attr(attrs)
    
    Sai.util.setHover(
        shape,
        hoverattrs[0],
        hoverattrs[1],
        extras
    )
    
    return shape


Raphael.fn.sai.prim.histogram = (x, y, w, h, data, low=0, high=1, label, colors=['black', 'white'], bgcolor='white', fromWhite, numBuckets=10) ->
    set = @set()
    
    set.push(
        bg = @rect(x, y-h, w, h).attr({
            'stroke-width': 0
            'stroke-opacity': 0
            'fill': bgcolor
        })
    )
    
    bartop = y - (h - 12) # leave room for text at top
    y -= 5 # text height / 2
    
    set.push(lowLabel = @text(x, y, Sai.util.num_abbrev(low)).attr({'text-anchor': 'start'}))
    set.push(highLabel = @text(x + w, y, Sai.util.num_abbrev(high)).attr({'text-anchor': 'end'}))
    
    y -= 7 # rest of text, plus padding
    
    buckets = {}
    maxBucket = 0
    
    for datum in data
        idx = Math.min(numBuckets - 1, Math.floor(numBuckets * datum / 1))
        if idx of buckets then buckets[idx] += 1 else buckets[idx] = 1
        maxBucket = Math.max(maxBucket, buckets[idx])
    
    set.push(hrule = @rect(x, y, w, 1).attr({
        'fill': "0-#{colors[0]}-#{(colors[1] ? colors[0])}"
        'stroke-width': 0
        'stroke-opacity': 0
    }))
    y -= 1
    
    bw = w / numBuckets
    for bucket of buckets
        bh = (y - bartop) * (buckets[bucket] / maxBucket)
        
        set.push(
            if colors.length is 1
                fill = Sai.util.multiplyColor(colors[0], (parseInt(bucket) + 0.5) / numBuckets, fromWhite, 0.2).str
            else
                fill = Sai.util.colerp(colors[0], colors[1], (parseInt(bucket) + 0.5) / numBuckets)
            
            @rect(x + ((parseInt(bucket) + 0.2) * bw), y - bh, bw * .6, bh)
            .attr({
                'fill': fill,
                'stroke-width': if fromWhite then .35 else 0,
                'stroke-opacity': if fromWhite then 1 else 0,
                'stroke': '#000000'
            })
        )
    
    set.push(lbl = @text(x + w/2, bartop - 6, Sai.util.num_abbrev(label)))
    
    return set
    