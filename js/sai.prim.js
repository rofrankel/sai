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
      if (typeof path !== "undefined" && path !== null) {
        path += ("L" + coord[0] + " " + coord[1]);
      } else {
        path = ("M" + coord[0] + " " + coord[1]);
      }
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
    var _a, _b, _c, _d, axisClip, bar, height, hoverfuncs, i, prev, stack, totalHeight;
    if (shouldInteract && (typeof (_a = coords[coords.length - 1]) !== "undefined" && _a !== null)) {
      totalHeight = baseline - coords[coords.length - 1][1];
    }
    width *= .67;
    stack = this.set();
    prev = baseline;
    _c = coords.length;
    for (_b = 0; (0 <= _c ? _b < _c : _b > _c); (0 <= _c ? _b += 1 : _b -= 1)) {
      var i = _b;
      if (!((typeof (_d = coords[i]) !== "undefined" && _d !== null) && coords[i][1] !== baseline)) {
        continue;
      }
      height = prev - coords[i][1];
      axisClip = i === 0 ? 1 : 0;
      stack.push(bar = this.rect(coords[i][0] - (width / 2.0), coords[i][1], width, height - axisClip).attr('fill', ((typeof colors === "undefined" || colors === null) ? undefined : colors[i]) || '#000000').attr('stroke', ((typeof colors === "undefined" || colors === null) ? undefined : colors[i]) || '#000000'));
      if (shouldInteract) {
        hoverfuncs = getHoverfuncs(bar, {
          'fill-opacity': '0.75'
        }, {
          'fill-opacity': '1.0'
        }, [
          (function(_percent) {
            return function() {
              if (extras[0]) {
                extras[0]();
              }
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
    var _a, _b, axisClip, barwidth, base, group, h, hoverfuncs, i, offset;
    group = this.set();
    barwidth = width / (coords.length + 1);
    offset = ((width - barwidth) / 2);
    axisClip = 0.5;
    _a = coords.length;
    for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
      if (typeof (_b = coords[i] == null ? undefined : coords[i][0]) !== "undefined" && _b !== null) {
        base = Math.min(coords[i][1], baseline);
        h = Math.max(coords[i][1], baseline) - base - axisClip;
        group.push(this.rect(coords[i][0] - offset + (i * barwidth), base, barwidth - 1, h).attr('fill', ((typeof colors === "undefined" || colors === null) ? undefined : colors[i]) || '#000000').attr('stroke', ((typeof colors === "undefined" || colors === null) ? undefined : colors[i]) || '#000000'));
      }
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
    var _a, _b, _c, _d, bbox, bbw, dx, i, interval, label, labels, line, max_label_width, max_labels, padding, result, rotate, ticklen, ticks, val, xmax, xpos;
    ticklens = (typeof ticklens !== "undefined" && ticklens !== null) ? ticklens : [5, 2];
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    color = (typeof color !== "undefined" && color !== null) ? color : 'black';
    line = this.path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color);
    ticks = this.set();
    labels = this.set();
    max_labels = len / 20;
    interval = max_labels < vals.length ? Math.ceil(vals.length / max_labels) : 1;
    dx = len / (vals.length - 1) * interval;
    xpos = x;
    xmax = -1;
    rotate = false;
    padding = 2;
    max_label_width = 0;
    _a = vals.length;
    for (i = 0; (0 <= _a ? i < _a : i > _a); i += interval) {
      val = vals[i];
      if (typeof val !== "undefined" && val !== null) {
        ticklen = ticklens[String(val) ? 0 : 1];
        ticks.push(this.path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color));
        if (val !== '') {
          label = this.text(xpos, y + ticklen + padding, Sai.util.prettystr(val));
          bbox = label.getBBox();
          label.attr('y', label.attr('y') + (bbox.height / 2.0));
          labels.push(label);
          bbw = bbox.width;
          max_label_width = Math.max(bbw, max_label_width);
          if (bbox.x <= xmax) {
            rotate = true;
          }
          if (bbox.x + bbw > xmax) {
            xmax = bbox.x + bbw;
          }
        }
      }
      xpos += dx;
    }
    result = this.set().push(line, ticks, labels);
    if (rotate) {
      _c = labels.items;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        label = _c[_b];
        label.rotate(-90);
        label.translate(0, label.getBBox().width / 2 - padding);
      }
      result.push(this.rect(x, y, 1, width + max_label_width + ticklens[0]).attr('opacity', '0'));
    }
    return result;
  };
  Raphael.fn.sai.prim.vaxis = function(vals, x, y, len, width, right, color, ticklens) {
    var _a, _b, _c, dy, label, labels, line, ticklen, ticks, val, ypos;
    ticklens = (typeof ticklens !== "undefined" && ticklens !== null) ? ticklens : [5, 2];
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    right = (typeof right !== "undefined" && right !== null) ? right : false;
    line = this.path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color);
    ticks = this.set();
    labels = this.set();
    dy = len / (vals.length - 1);
    ypos = y;
    _b = vals;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      val = _b[_a];
      if (val !== null) {
        ticklen = ticklens[String(val) ? 0 : 1];
        ticks.push(this.path("M" + x + " " + ypos + "l" + (right ? ticklen : -ticklen) + " 0").attr('stroke', color));
        label = this.text(x + ((right ? 1 : -1) * (ticklen + 2)), ypos, Sai.util.prettystr(val));
        label.attr({
          'x': label.attr('x') + ((right ? 1 : -1) * label.getBBox().width / 2.0),
          'fill': color
        });
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
        'fill': 'white',
        'font-weight': 'bold'
      });
      t.translate(t.getBBox().width / 2, 0);
      max_width = Math.max(max_width, t.getBBox().width);
      py += TEXT_LINE_HEIGHT;
      text_set.push(t);
    }
    bg_width = max_width + 10;
    rect = this.rect(x, y, bg_width, py - y, 5).attr({
      'fill': 'black',
      'fill-opacity': '.85',
      'stroke': 'black'
    });
    (typeof head_text === "undefined" || head_text === null) ? undefined : head_text.translate(bg_width / 2);
    return text_set.toFront();
  };
  Raphael.fn.sai.prim.legend = function(x, y, max_width, colors, highlightColors) {
    var _a, _b, _c, _d, _e, key, line_height, px, py, r, set, spacing, t, text;
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
      t = this.text(px + 14, py, text).attr({
        fill: (typeof (_c = ((typeof highlightColors === "undefined" || highlightColors === null) ? undefined : highlightColors[text])) !== "undefined" && _c !== null) ? _c : 'black'
      });
      t.translate(t.getBBox().width / 2, t.getBBox().height / 2);
      r = this.rect(px, py, 9, 9).attr({
        'fill': (typeof (_d = colors[text]) !== "undefined" && _d !== null) ? _d : 'black',
        'stroke': (typeof (_e = ((typeof highlightColors === "undefined" || highlightColors === null) ? undefined : highlightColors[text])) !== "undefined" && _e !== null) ? _e : 'black'
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
    var _a, _b, _c, label, line_height, px, py, set, spacing, t, tbbox, text;
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
      text = label + (label === '' ? '' : ': ');
      if (typeof info[label] === 'string') {
        text += info[label];
      } else {
        text += (typeof (_c = Sai.util.prettynum(info[label])) !== "undefined" && _c !== null) ? _c : Sai.util.prettystr(info[label]);
      }
      t = this.text(px, py, text);
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
    bgcolor = (typeof bgcolor !== "undefined" && bgcolor !== null) ? bgcolor : 'white';
    color = (typeof color !== "undefined" && color !== null) ? color : 'black';
    numBuckets = (typeof numBuckets !== "undefined" && numBuckets !== null) ? numBuckets : 10;
    set = this.set();
    set.push(bg = this.rect(x, y - h, w, h).attr({
      'stroke-width': 0,
      'stroke-opacity': 0,
      'fill': bgcolor
    }));
    bartop = y - (h - 12);
    y -= 5;
    low = (typeof low !== "undefined" && low !== null) ? low : 0;
    high = (typeof high !== "undefined" && high !== null) ? high : 1;
    set.push(lowLabel = this.text(x, y, Sai.util.prettystr(low)));
    lowLabel.translate(lowLabel.getBBox().width / 2, 0);
    set.push(highLabel = this.text(x + w, y, Sai.util.prettystr(high)));
    highLabel.translate(-highLabel.getBBox().width / 2, 0);
    y -= 7;
    buckets = {};
    maxBucket = 0;
    _b = data;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      datum = _b[_a];
      idx = Math.min(numBuckets - 1, Math.floor(numBuckets * datum / 1));
      if (idx in buckets) {
        buckets[idx] += 1;
      } else {
        buckets[idx] = 1;
      }
      maxBucket = Math.max(maxBucket, buckets[idx]);
    }
    set.push(hrule = this.path("M" + (x) + "," + (y) + " l" + (w) + ", 0").attr('stroke', color));
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
    set.push(lbl = this.text(x + w / 2, bartop - 6, Sai.util.prettystr(label)));
    return set;
  };
})();
