(function() {
  var getHoverfuncs;
  var __hasProp = Object.prototype.hasOwnProperty;
  Raphael.fn.sai.prim = (typeof Raphael.fn.sai.prim !== "undefined" && Raphael.fn.sai.prim !== null) ? Raphael.fn.sai.prim : {};
  getHoverfuncs = function(target, attrOn, attrOff, extras) {
    return [
      function() {
        target.attr(attrOn);
        return extras ? extras[0](target) : null;
      }, function() {
        target.attr(attrOff);
        return extras ? extras[1](target) : null;
      }
    ];
  };
  Raphael.fn.sai.prim.candlestick = function(x, by0, by1, sy0, sy1, body_width, color, fill, shouldInteract, fSetInfo, extras) {
    var body, bx, candlestick, hoverfuncs, shadow;
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    if (!(body_width % 2)) {
      body_width++;
    }
    bx = x - (body_width / 2.0);
    body = this.rect(bx, by0, body_width, by1 - by0 || 1).attr('stroke', color);
    shadow = this.path("M" + x + " " + sy0 + "L" + x + " " + by0 + "M" + x + " " + by1 + "L" + x + " " + sy1).attr('stroke', color);
    body.attr('fill', fill ? color : '#ffffff');
    candlestick = this.set().push(body, shadow);
    if (shouldInteract) {
      hoverfuncs = getHoverfuncs(candlestick, {
        scale: '1.5,1.5,' + x + ',' + (by0 + (by1 - by0) / 2),
        'fill-opacity': 0.5
      }, {
        scale: '1.0,1.0,' + x + ',' + (by0 + (by1 - by0) / 2),
        'fill-opacity': 1.0
      }, extras);
      candlestick.hover(hoverfuncs[0], hoverfuncs[1]);
    }
    return candlestick;
  };
  Raphael.fn.sai.prim.line = function(coords, color, width) {
    var _a, _b, _c, coord, path;
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    _b = coords;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      coord = _b[_a];
      if (!(typeof coord !== "undefined" && coord !== null)) {
        continue;
      }
      (typeof path !== "undefined" && path !== null) ? path += ("L" + coord[0] + " " + coord[1]) : (path = ("M" + coord[0] + " " + coord[1]));
    }
    return this.path(path).attr({
      'stroke': color,
      'stroke-width': width
    });
  };
  Raphael.fn.sai.prim.area = function(coords, color, width, baseline) {
    var _a, _b, _c, area, areaPath, coord, i, stroke, strokePath;
    if (coords.length < 2) {
      return this.set();
    }
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    _b = coords;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      coord = _b[_a];
      if (!(typeof coord !== "undefined" && coord !== null)) {
        continue;
      }
      if (typeof strokePath !== "undefined" && strokePath !== null) {
        strokePath += ("L" + coord[0] + " " + coord[1]);
        areaPath += ("L" + coord[0] + " " + coord[1]);
      } else {
        strokePath = ("M" + coord[0] + " " + coord[1]);
        areaPath = ("M" + coord[0] + " " + coord[1]);
      }
    }
    for (i = baseline.length - 1; (baseline.length - 1 <= 0 ? i <= 0 : i >= 0); i += -1) {
      areaPath += ("L" + (baseline[i][0]) + "," + (baseline[i][1]));
    }
    area = this.path(areaPath).attr({
      'fill': color,
      'stroke-width': 0,
      'stroke-opacity': 0,
      'fill-opacity': 0.35
    });
    stroke = this.path(strokePath).attr({
      'stroke': color,
      'stroke-width': width
    });
    return this.set().push(area, stroke);
  };
  Raphael.fn.sai.prim.stackedBar = function(coords, colors, width, baseline, shouldInteract, fSetInfo, extras) {
    var _a, _b, _c, axisClip, bar, height, hoverfuncs, prev, stack, totalHeight;
    shouldInteract && (typeof (_a = coords[coords.length - 1]) !== "undefined" && _a !== null) ? (totalHeight = baseline - coords[coords.length - 1][1]) : null;
    width *= .67;
    stack = this.set();
    prev = baseline;
    _b = coords.length;
    for (i = 0; (0 <= _b ? i < _b : i > _b); (0 <= _b ? i += 1 : i -= 1)) {
      if (!((typeof (_c = coords[i]) !== "undefined" && _c !== null) && coords[i][1] !== baseline)) {
        continue;
      }
      height = prev - coords[i][1];
      axisClip = i === 0 ? 1 : 0;
      stack.push((bar = this.rect(coords[i][0] - (width / 2.0), coords[i][1], width, height - axisClip).attr('fill', (colors == undefined ? undefined : colors[i]) || '#000000').attr('stroke', (colors == undefined ? undefined : colors[i]) || '#000000')));
      if (shouldInteract) {
        hoverfuncs = getHoverfuncs(bar, {
          'fill-opacity': '0.75'
        }, {
          'fill-opacity': '1.0'
        }, [
          (function(_percent) {
            return function() {
              extras[0] ? extras[0]() : null;
              return fSetInfo({
                '(selected)': Sai.util.prettystr(_percent) + '%'
              }, false);
            };
          })(100 * height / totalHeight), extras[1]
        ]);
        bar.hover(hoverfuncs[0], hoverfuncs[1]);
      }
      prev = coords[i][1];
    }
    return stack;
  };
  Raphael.fn.sai.prim.groupedBar = function(coords, colors, width, baseline, shouldInteract, fSetInfo, extras) {
    var _a, _b, axisClip, barwidth, group, hoverfuncs, i, offset;
    group = this.set();
    barwidth = width / (coords.length + 1);
    offset = ((width - barwidth) / 2);
    axisClip = 0.5;
    _a = coords.length;
    for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
      (typeof (_b = coords[i] == undefined ? undefined : coords[i][0]) !== "undefined" && _b !== null) ? group.push(this.rect(coords[i][0] - offset + (i * barwidth), coords[i][1], barwidth - 1, baseline - coords[i][1] - axisClip).attr('fill', (colors == undefined ? undefined : colors[i]) || '#000000').attr('stroke', (colors == undefined ? undefined : colors[i]) || '#000000')) : null;
    }
    if (shouldInteract) {
      hoverfuncs = getHoverfuncs(group, {
        'fill-opacity': '0.75'
      }, {
        'fill-opacity': '1.0'
      }, extras);
      group.hover(hoverfuncs[0], hoverfuncs[1]);
    }
    return group;
  };
  Raphael.fn.sai.prim.haxis = function(vals, x, y, len, width, color, ticklens) {
    var _a, _b, _c, dx, label, labels, line, ticklen, ticks, val, xpos;
    ticklens = (typeof ticklens !== "undefined" && ticklens !== null) ? ticklens : [10, 5];
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    line = this.path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color);
    ticks = this.set();
    labels = this.set();
    dx = len / (vals.length - 1);
    xpos = x;
    _b = vals;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      val = _b[_a];
      if (!(val === null)) {
        ticklen = ticklens[String(val) ? 0 : 1];
        ticks.push(this.path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color));
        if (!(val === '')) {
          label = this.text(xpos, y + ticklen + 2, Sai.util.prettystr(val));
          label.attr('y', label.attr('y') + (label.getBBox().height / 2.0));
          labels.push(label);
        }
      }
      xpos += dx;
    }
    return this.set().push(line, ticks, labels);
  };
  Raphael.fn.sai.prim.vaxis = function(vals, x, y, len, width, color, ticklens) {
    var _a, _b, _c, dy, label, labels, line, ticklen, ticks, val, ypos;
    ticklens = (typeof ticklens !== "undefined" && ticklens !== null) ? ticklens : [10, 5];
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    line = this.path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color);
    ticks = this.set();
    labels = this.set();
    dy = len / (vals.length - 1);
    ypos = y;
    _b = vals;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      val = _b[_a];
      if (!(val === null)) {
        ticklen = ticklens[String(val) ? 0 : 1];
        ticks.push(this.path("M" + x + " " + ypos + "l" + (-ticklen) + " 0").attr('stroke', color));
        label = this.text(x - ticklen - 2, ypos, Sai.util.prettystr(val));
        label.attr('x', label.attr('x') - (label.getBBox().width / 2.0));
        labels.push(label);
      }
      ypos -= dy;
    }
    return this.set().push(line, ticks, labels);
  };
  Raphael.fn.sai.prim.popup = function(x, y, texts, opts) {
    var TEXT_LINE_HEIGHT, _a, _b, bg_width, head_text, max_width, py, rect, set, t, text, text_set;
    TEXT_LINE_HEIGHT = 10;
    set = this.set();
    text_set = this.set();
    max_width = 0;
    py = y + 5 + (TEXT_LINE_HEIGHT / 2);
    if ('__HEAD__' in texts) {
      head_text = this.text(x, py, texts['__HEAD__']).attr({
        'fill': '#cfc',
        'font-size': '12',
        'font-weight': 'bold'
      });
      max_width = Math.max(max_width, head_text.getBBox().width);
      text_set.push(head_text);
      py += (TEXT_LINE_HEIGHT + 2) + 5;
    }
    _b = texts;
    for (text in _b) {
      if (!__hasProp.call(_b, text)) continue;
      _a = _b[text];
      if (text === '__HEAD__') {
        continue;
      }
      t = this.text(x + 5, py, text + " = " + texts[text]).attr({
        'fill': '#ffffff',
        'font-weight': 'bold'
      });
      t.translate(t.getBBox().width / 2, 0);
      max_width = Math.max(max_width, t.getBBox().width);
      py += TEXT_LINE_HEIGHT;
      text_set.push(t);
    }
    bg_width = max_width + 10;
    rect = this.rect(x, y, bg_width, (py - y), 5).attr({
      'fill': '#000000',
      'fill-opacity': '.85',
      'stroke': '#000000'
    });
    typeof head_text === "undefined" || head_text == undefined ? undefined : head_text.translate(bg_width / 2);
    return text_set.toFront();
  };
  Raphael.fn.sai.prim.legend = function(x, y, max_width, colors) {
    var _a, _b, _c, key, line_height, px, py, r, set, spacing, t, text;
    spacing = 15;
    line_height = 14;
    y -= line_height;
    set = this.set();
    px = x;
    py = y;
    _b = colors;
    for (text in _b) {
      if (!__hasProp.call(_b, text)) continue;
      _a = _b[text];
      t = this.text(px + 14, py, text);
      t.translate(t.getBBox().width / 2, t.getBBox().height / 2);
      r = this.rect(px, py, 9, 9).attr({
        'fill': (typeof (_c = colors[text]) !== "undefined" && _c !== null) ? colors[text] : '#000000'
      });
      key = this.set().push(t, r);
      if ((px - x) + spacing + key.getBBox().width > max_width) {
        set.translate(0, -line_height);
        key.translate(x - px, y - py);
        px = x;
        py = y;
      }
      px += key.getBBox().width + spacing;
      set.push(key);
    }
    return set;
  };
  Raphael.fn.sai.prim.info = function(x, y, max_width, info) {
    var _a, _b, label, line_height, px, py, set, spacing, t, tbbox;
    spacing = 15;
    line_height = 14;
    set = this.set();
    px = x;
    py = y;
    _b = info;
    for (label in _b) {
      if (!__hasProp.call(_b, label)) continue;
      _a = _b[label];
      if (info[label] === null) {
        continue;
      }
      t = this.text(px, py, label + (label === '' ? '' : ': ') + Sai.util.prettystr(info[label]));
      tbbox = t.getBBox();
      t.translate(tbbox.width / 2, tbbox.height / 2);
      if ((px - x) + spacing + tbbox.width > max_width) {
        t.translate(x - px, line_height);
        px = x;
        py += line_height;
      }
      px += tbbox.width + spacing;
      set.push(t);
    }
    return set;
  };
  Raphael.fn.sai.prim.hoverShape = function(fDraw, attrs, extras, hoverattrs) {
    var hoverfuncs, shape;
    shape = fDraw(this).attr(attrs);
    hoverfuncs = getHoverfuncs(shape, hoverattrs && hoverattrs[0] || {}, hoverattrs && hoverattrs[1] || {}, extras);
    /*
    shape.hover(
      hoverfuncs[0],
      hoverfuncs[1]
    )
    */
    shape.mouseover(hoverfuncs[0]);
    shape.mouseout(hoverfuncs[1]);
    return shape;
  };
  Raphael.fn.sai.prim.histogram = function(x, y, w, h, data, low, high, label, color, bgcolor, fromWhite, numBuckets) {
    var _a, _b, _c, _d, _e, bartop, bg, bh, bucket, buckets, bw, datum, highLabel, hrule, idx, lbl, lowLabel, maxBucket, set;
    bgcolor = (typeof bgcolor !== "undefined" && bgcolor !== null) ? bgcolor : '#ffffff';
    numBuckets = (typeof numBuckets !== "undefined" && numBuckets !== null) ? numBuckets : 10;
    set = this.set();
    set.push((bg = this.rect(x, y - h, w, h).attr({
      'stroke-width': 0,
      'stroke-opacity': 0,
      'fill': bgcolor
    })));
    bartop = y - (h - 12);
    y -= 5;
    low = (typeof low !== "undefined" && low !== null) ? low : 0;
    high = (typeof high !== "undefined" && high !== null) ? high : 1;
    set.push((lowLabel = this.text(x, y, Sai.util.prettystr(low))));
    lowLabel.translate(lowLabel.getBBox().width / 2, 0);
    set.push((highLabel = this.text(x + w, y, Sai.util.prettystr(high))));
    highLabel.translate(-highLabel.getBBox().width / 2, 0);
    y -= 7;
    buckets = {};
    maxBucket = 0;
    _b = data;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      datum = _b[_a];
      idx = Math.min(numBuckets - 1, Math.floor(numBuckets * datum / 1));
      idx in buckets ? buckets[idx] += 1 : (buckets[idx] = 1);
      maxBucket = Math.max(maxBucket, buckets[idx]);
    }
    set.push((hrule = this.path("M" + x + "," + y + " l" + w + ", 0").attr('stroke', color)));
    y -= 1;
    bw = w / numBuckets;
    _e = buckets;
    for (bucket in _e) {
      if (!__hasProp.call(_e, bucket)) continue;
      _d = _e[bucket];
      bh = (y - bartop) * (buckets[bucket] / maxBucket);
      set.push(this.rect(x + ((parseInt(bucket) + 0.2) * bw), y - bh, bw * .6, bh).attr({
        'fill': Sai.util.multiplyColor(color, (parseInt(bucket) + 0.5) / numBuckets, fromWhite, 0.2).str,
        'stroke-width': fromWhite ? .35 : 0,
        'stroke-opacity': fromWhite ? 1 : 0,
        'stroke': '#000000'
      }));
    }
    set.push((lbl = this.text(x + w / 2, bartop - 6, Sai.util.prettystr(label))));
    return set;
  };
})();
