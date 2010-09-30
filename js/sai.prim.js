(function() {
  var getHoverfuncs;
  var __hasProp = Object.prototype.hasOwnProperty;
  Raphael.fn.sai.prim = (typeof Raphael.fn.sai.prim !== "undefined" && Raphael.fn.sai.prim !== null) ? Raphael.fn.sai.prim : {};
  getHoverfuncs = function(target, attrOn, attrOff, extras) {
    return [
      function() {
        var _ref;
        target.attr(attrOn);
        return (typeof (_ref = (typeof extras === "undefined" || extras === null) ? undefined : extras[0]) === "function" ? _ref(target) : undefined);
      }, function() {
        var _ref;
        target.attr(attrOff);
        return (typeof (_ref = (typeof extras === "undefined" || extras === null) ? undefined : extras[1]) === "function" ? _ref(target) : undefined);
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
    var _i, _len, _ref, coord, path;
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    _ref = coords;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      coord = _ref[_i];
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
    var _i, _len, _ref, area, areaPath, coord, i, stroke, strokePath;
    if (coords.length < 2) {
      return this.set();
    }
    color = (typeof color !== "undefined" && color !== null) ? color : '#000000';
    width = (typeof width !== "undefined" && width !== null) ? width : 1;
    _ref = coords;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      coord = _ref[_i];
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
    var _i, _len, _ref, _ref2, axisClip, bar, c, height, hoverfuncs, i, is_positive, max, min, offset, pi, prev, segment_baseline, stack, totalHeight;
    if (shouldInteract) {
      max = (min = null);
      _ref = coords;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (!(typeof max !== "undefined" && max !== null) || max < c[1]) {
          max = c[1];
        }
        if (!(typeof min !== "undefined" && min !== null) || min > c[1]) {
          min = c[1];
        }
      }
      totalHeight = (max - min) || 1;
    }
    width *= .67;
    stack = this.set();
    prev = [baseline, baseline];
    offset = [0, 0];
    pi = function(val) {
      return (val < baseline ? 1 : 0);
    };
    _ref = coords.length;
    for (_i = 0; (0 <= _ref ? _i < _ref : _i > _ref); (0 <= _ref ? _i += 1 : _i -= 1)) {
      var i = _i;
      if (!((typeof (_ref2 = coords[i]) !== "undefined" && _ref2 !== null) && coords[i][1] !== baseline)) {
        continue;
      }
      is_positive = pi(coords[i][1]);
      height = Math.abs(prev[is_positive] - coords[i][1]);
      axisClip = prev[is_positive] === baseline ? 1 : 0;
      segment_baseline = coords[i][1] - (is_positive ? 0 : height - axisClip);
      stack.push(bar = this.rect(coords[i][0] - (width / 2.0), segment_baseline, width, height - axisClip).attr('fill', ((typeof colors === "undefined" || colors === null) ? undefined : colors[i]) || '#000000').attr('stroke', ((typeof colors === "undefined" || colors === null) ? undefined : colors[i]) || '#000000'));
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
      prev[is_positive] = coords[i][1];
    }
    return stack;
  };
  Raphael.fn.sai.prim.groupedBar = function(coords, colors, width, baseline, shouldInteract, fSetInfo, extras) {
    var _ref, _ref2, axisClip, barwidth, base, group, h, hoverfuncs, i, offset;
    group = this.set();
    barwidth = width / (coords.length + 1);
    offset = ((width - barwidth) / 2);
    axisClip = 0.5;
    _ref = coords.length;
    for (i = 0; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      if (typeof (_ref2 = coords[i] == null ? undefined : coords[i][0]) !== "undefined" && _ref2 !== null) {
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
  Raphael.fn.sai.prim.haxis = function(vals, x, y, len, opts) {
    var _i, _len, _ref, bbox, bbw, color, dx, i, interval, label, labels, line, ly, max_label_width, max_labels, padding, result, rotate, ticklen, ticklens, ticks, title, val, width, xmax, xpos, ymin;
    ticklens = (typeof (_ref = opts.ticklens) !== "undefined" && _ref !== null) ? _ref : [5, 2];
    width = (typeof (_ref = opts.width) !== "undefined" && _ref !== null) ? _ref : 1;
    color = (typeof (_ref = opts.color) !== "undefined" && _ref !== null) ? _ref : 'black';
    line = this.path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color);
    ticks = this.set();
    labels = this.set();
    max_labels = len / 25;
    interval = max_labels < vals.length ? Math.ceil(vals.length / max_labels) : 1;
    dx = len / (vals.length - 1) * interval;
    xpos = x;
    xmax = -1;
    rotate = false;
    padding = 2;
    max_label_width = 0;
    ymin = null;
    _ref = vals.length;
    for (i = 0; (0 <= _ref ? i < _ref : i > _ref); i += interval) {
      val = vals[i];
      if (typeof val !== "undefined" && val !== null) {
        ticklen = ticklens[String(val) ? 0 : 1];
        ticks.push(this.path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color));
        if (val !== '') {
          label = this.text(xpos, y + ticklen + padding, Sai.util.prettystr(val).substring(0, 12));
          bbox = label.getBBox();
          ly = label.attr('y') + 5;
          label.attr('y', ly);
          if (!(typeof ymin !== "undefined" && ymin !== null) || ly < ymin) {
            ymin = ly;
          }
          labels.push(label);
          bbw = bbox.width;
          max_label_width = Math.max(bbw, max_label_width);
          if (bbox.x <= xmax + 3) {
            rotate = true;
          }
          if (bbox.x + bbw > xmax) {
            xmax = bbox.x + bbw;
          }
        }
      }
      xpos += dx;
    }
    if (typeof (_ref = opts.title) !== "undefined" && _ref !== null) {
      title = this.text(x + len / 2, ymin + 14, opts.title).attr({
        'font-size': '12px',
        'font-weight': 'bold'
      });
    }
    result = this.set().push(line, ticks, labels, title);
    if (rotate) {
      _ref = labels.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        label = _ref[_i];
        label.rotate(-90);
        label.translate(0, label.getBBox().width / 2 - padding);
      }
      result.push(this.rect(x, y, 1, width + max_label_width + ticklens[0]).attr('opacity', '0'));
    }
    return result;
  };
  Raphael.fn.sai.prim.vaxis = function(vals, x, y, len, opts) {
    var _i, _j, _len, _len2, _ref, _result, bbox, color, dummy, dy, label, label_strs, labels, labels_unique, line, lx, pos, right, str, ticklen, ticklens, ticks, title, val, width, xmin, ypos;
    ticklens = (typeof (_ref = opts.ticklens) !== "undefined" && _ref !== null) ? _ref : [5, 2];
    width = (typeof (_ref = opts.width) !== "undefined" && _ref !== null) ? _ref : 1;
    color = (typeof (_ref = opts.color) !== "undefined" && _ref !== null) ? _ref : 'black';
    right = (typeof (_ref = opts.right) !== "undefined" && _ref !== null) ? _ref : false;
    line = this.path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color);
    ticks = this.set();
    labels = this.set();
    dy = len / (vals.length - 1);
    ypos = y;
    xmin = null;
    label_strs = [];
    labels_unique = true;
    _ref = vals;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      val = _ref[_i];
      if (val !== null) {
        str = Sai.util.prettystr(val);
        if ((function(){ for (var _j=0, _len2=label_strs.length; _j<_len2; _j++) { if (label_strs[_j] === str) return true; } return false; }).call(this)) {
          labels_unique = false;
          break;
        }
        label_strs.push(str);
      }
    }
    if (!(labels_unique)) {
      label_strs = (function() {
        _result = []; _ref = vals;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          val = _ref[_i];
          _result.push(Sai.util.prettystr(val, 2));
        }
        return _result;
      })();
    }
    pos = 0;
    _ref = vals;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      val = _ref[_i];
      if (val !== null) {
        ticklen = ticklens[String(val) ? 0 : 1];
        ticks.push(this.path("M" + x + " " + ypos + "l" + (right ? ticklen : -ticklen) + " 0").attr('stroke', color));
        lx = x + ((right ? 1 : -1) * (ticklen + 3));
        label = this.text(lx, ypos, label_strs[pos++]);
        label.attr({
          'text-anchor': right ? 'start' : 'end',
          'fill': color
        });
        lx += (right ? 1 : -1) * (label.getBBox().width + 8);
        if (!(typeof xmin !== "undefined" && xmin !== null) || lx < xmin) {
          xmin = lx;
        }
        labels.push(label);
      }
      ypos -= dy;
    }
    if (typeof (_ref = opts.title) !== "undefined" && _ref !== null) {
      title = this.text(xmin, y - len / 2, opts.title).attr({
        'font-size': '12px',
        'font-weight': 'bold'
      });
      bbox = title.getBBox();
      title.rotate(-90);
      dummy = this.rect(bbox.x + (bbox.width - bbox.height) / 2, y, bbox.height, 1).attr({
        opacity: 0
      });
    }
    dummy = (typeof dummy !== "undefined" && dummy !== null) ? dummy : null;
    return this.set().push(this.set().push(line, ticks, labels, dummy), title);
  };
  Raphael.fn.sai.prim.popup = function(x, y, texts, opts) {
    var TEXT_LINE_HEIGHT, _i, _ref, bg_width, head_text, max_width, py, rect, set, t, text, text_set;
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
    _ref = texts;
    for (text in _ref) {
      if (!__hasProp.call(_ref, text)) continue;
      _i = _ref[text];
      if (text === '__HEAD__') {
        continue;
      }
      t = this.text(x + 5, py, text + " = " + texts[text]).attr({
        'fill': 'white',
        'font-weight': 'bold',
        'text-anchor': 'start'
      });
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
  Raphael.fn.sai.prim.legend = function(x, y, max_width, legend_colors, highlightColors) {
    var _i, _ref, _ref2, key, key_width, line_height, px, py, r, set, spacing, t, text;
    spacing = 15;
    line_height = 14;
    y -= line_height;
    set = this.set();
    px = x;
    py = y;
    _ref = legend_colors;
    for (text in _ref) {
      if (!__hasProp.call(_ref, text)) continue;
      _i = _ref[text];
      t = this.text(px + 14, py + 5, text).attr({
        fill: (typeof (_ref2 = ((typeof highlightColors === "undefined" || highlightColors === null) ? undefined : highlightColors[text])) !== "undefined" && _ref2 !== null) ? _ref2 : 'black',
        'text-anchor': 'start'
      });
      r = this.rect(px, py, 9, 9).attr({
        'fill': (typeof (_ref2 = legend_colors[text]) !== "undefined" && _ref2 !== null) ? _ref2 : 'black',
        'stroke': (typeof (_ref2 = ((typeof highlightColors === "undefined" || highlightColors === null) ? undefined : highlightColors[text])) !== "undefined" && _ref2 !== null) ? _ref2 : 'black'
      });
      key = this.set().push(t, r);
      key_width = key.getBBox().width;
      if ((px - x) + spacing + key_width > max_width) {
        set.translate(0, -line_height);
        key.translate(x - px, y - py);
        px = x;
        py = y;
      }
      px += key_width + spacing;
      set.push(key);
    }
    return set;
  };
  Raphael.fn.sai.prim.wrappedText = function(x, y, w, text, delimiter, max_lines) {
    var chars_per_line, end, idx, lines, pixels_per_char, potential_end, potential_line, spacer, spacing;
    delimiter = (typeof delimiter !== "undefined" && delimiter !== null) ? delimiter : ' ';
    spacing = (typeof spacing !== "undefined" && spacing !== null) ? spacing : 1;
    text = (typeof text !== "undefined" && text !== null) ? text : '';
    spacer = '';
    if (text.match(/^\s*$/)) {
      return null;
    }
    pixels_per_char = 6;
    chars_per_line = w / pixels_per_char;
    /*
    tokens = text.split(delimiter)
    lines = []
    line = ''
    for token in tokens
      if line.length + token.length > chars_per_line
        lines.push(line)
        line = ''
        break if lines.length is max_lines
      line += token + spacer

    if line isnt '' then lines.push(line)
    */
    lines = [];
    idx = 0;
    while (idx < text.length - 1) {
      potential_end = idx + chars_per_line;
      potential_line = text.substring(idx, potential_end + 1);
      end = potential_end >= text.length ? potential_end : potential_line.lastIndexOf(delimiter);
      lines.push(potential_line.substring(0, end));
      idx += end + 1;
    }
    text = lines.join('\n');
    return this.text(x, y + (5 * lines.length), text).attr({
      'font-family': 'Lucida Console',
      'text-anchor': 'start'
    });
  };
  Raphael.fn.sai.prim.info = function(x, y, max_width, info) {
    var _i, _ref, _ref2, char_width, label, line_height, px, py, set, spacing, t, text, twidth;
    spacing = 15;
    line_height = 14;
    set = this.set();
    px = x;
    py = y;
    char_width = 6;
    _ref = info;
    for (label in _ref) {
      if (!__hasProp.call(_ref, label)) continue;
      _i = _ref[label];
      if (info[label] === null) {
        continue;
      }
      text = label + (label === '' ? '' : ': ');
      if (typeof info[label] === 'string') {
        text += info[label];
      } else {
        text += (typeof (_ref2 = Sai.util.prettynum(info[label])) !== "undefined" && _ref2 !== null) ? _ref2 : Sai.util.prettystr(info[label]);
      }
      twidth = char_width * text.length;
      if ((px - x) + twidth > max_width) {
        px = x;
        py += line_height;
      }
      t = this.text(px, py, text).attr({
        'font-family': 'Lucida Console',
        'text-anchor': 'start'
      });
      px += twidth + spacing;
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
  Raphael.fn.sai.prim.histogram = function(x, y, w, h, data, low, high, label, colors, bgcolor, fromWhite, numBuckets) {
    var _i, _len, _ref, bartop, bg, bh, bucket, buckets, bw, datum, fill, highLabel, hrule, idx, lbl, lowLabel, maxBucket, set;
    bgcolor = (typeof bgcolor !== "undefined" && bgcolor !== null) ? bgcolor : 'white';
    colors = (typeof colors !== "undefined" && colors !== null) ? colors : ['black', 'white'];
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
    set.push(lowLabel = this.text(x, y, Sai.util.prettystr(low)).attr({
      'text-anchor': 'start'
    }));
    set.push(highLabel = this.text(x + w, y, Sai.util.prettystr(high)).attr({
      'text-anchor': 'end'
    }));
    y -= 7;
    buckets = {};
    maxBucket = 0;
    _ref = data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      datum = _ref[_i];
      idx = Math.min(numBuckets - 1, Math.floor(numBuckets * datum / 1));
      if (idx in buckets) {
        buckets[idx] += 1;
      } else {
        buckets[idx] = 1;
      }
      maxBucket = Math.max(maxBucket, buckets[idx]);
    }
    set.push(hrule = this.rect(x, y, w, 1).attr({
      'fill': ("0-" + (colors[0]) + "-" + ((typeof (_ref = colors[1]) !== "undefined" && _ref !== null) ? _ref : colors[0])),
      'stroke-width': 0,
      'stroke-opacity': 0
    }));
    y -= 1;
    bw = w / numBuckets;
    _ref = buckets;
    for (bucket in _ref) {
      if (!__hasProp.call(_ref, bucket)) continue;
      _i = _ref[bucket];
      bh = (y - bartop) * (buckets[bucket] / maxBucket);
      set.push(colors.length === 1 ? (fill = Sai.util.multiplyColor(colors[0], (parseInt(bucket) + 0.5) / numBuckets, fromWhite, 0.2).str) : (fill = Sai.util.colerp(colors[0], colors[1], (parseInt(bucket) + 0.5) / numBuckets)), this.rect(x + ((parseInt(bucket) + 0.2) * bw), y - bh, bw * .6, bh).attr({
        'fill': fill,
        'stroke-width': fromWhite ? .35 : 0,
        'stroke-opacity': fromWhite ? 1 : 0,
        'stroke': '#000000'
      }));
    }
    set.push(lbl = this.text(x + w / 2, bartop - 6, Sai.util.prettystr(label)));
    return set;
  };
}).call(this);
