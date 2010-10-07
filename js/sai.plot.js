(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  }, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  Sai.Plot = function(_arg, _arg2, _arg3, _arg4, _arg5, _arg6, _arg7, _arg8) {
    this.opts = _arg8;
    this.rawdata = _arg7;
    this.data = _arg6;
    this.h = _arg5;
    this.w = _arg4;
    this.y = _arg3;
    this.x = _arg2;
    this.r = _arg;
    this.opts = (typeof this.opts !== "undefined" && this.opts !== null) ? this.opts : {};
    this.setDenormalizedData();
    this.set = this.r.set();
    return this;
  };
  Sai.Plot.prototype.setDenormalizedData = function() {
    var _i, _j, _len, _ref, _ref2, _result, _result2, dnPoint, series;
    if (this.data instanceof Array) {
      return (this.dndata = (function() {
        _result = []; _ref = this.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dnPoint = _ref[_i];
          _result.push(this.denormalize(dnPoint));
        }
        return _result;
      }).call(this));
    } else {
      this.dndata = (typeof this.dndata !== "undefined" && this.dndata !== null) ? this.dndata : {};
      _result = []; _ref = this.data;
      for (series in _ref) {
        if (!__hasProp.call(_ref, series)) continue;
        _i = _ref[series];
        _result.push(this.dndata[series] = (function() {
          _result2 = []; _ref2 = this.data[series];
          for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
            dnPoint = _ref2[_j];
            _result2.push(this.denormalize(dnPoint));
          }
          return _result2;
        }).call(this));
      }
      return _result;
    }
  };
  Sai.Plot.prototype.denormalize = function(point) {
    if (point instanceof Array) {
      return [this.x + (this.w * point[0]), this.y - (this.h * point[1])];
    }
  };
  Sai.Plot.prototype.render = function() {
    this.set.push(this.r.rect(20, 20, 20, 20).attr('fill', 'red'), this.r.circle(40, 40, 10).attr('fill', 'blue'));
    return this;
  };
  Sai.LinePlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.LinePlot, Sai.Plot);
  Sai.LinePlot.prototype.setDenormalizedData = function() {
    var _i, _ref, _result, series;
    Sai.LinePlot.__super__.setDenormalizedData.apply(this, arguments);
    _result = []; _ref = this.dndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      _result.push(this.dndata[series].length === 1 && (this.dndata[series] == null ? undefined : this.dndata[series][0] == null ? undefined : this.dndata[series][0][0]) === this.x ? this.dndata[series].push([this.x + this.w, this.dndata[series][0][1]]) : null);
    }
    return _result;
  };
  Sai.LinePlot.prototype.render = function(colors, width) {
    var _i, _ref, series;
    this.set.remove();
    _ref = this.dndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (!series.match('^__')) {
        this.set.push(this.r.sai.prim.line(this.dndata[series], ((typeof colors === "undefined" || colors === null) ? undefined : colors[series]) || 'black', width || 1));
      }
    }
    return this;
  };
  Sai.AreaPlot = function() {
    return Sai.LinePlot.apply(this, arguments);
  };
  __extends(Sai.AreaPlot, Sai.LinePlot);
  Sai.AreaPlot.prototype.render = function(colors, width, stacked, zeroline) {
    var _i, _j, _len, _ref, _ref2, _result, baseline, d, denzel, first, i, last, series;
    this.set.remove();
    denzel = [this.denormalize([0, zeroline]), this.denormalize([1, zeroline])];
    _ref = this.dndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (!series.match('^__')) {
        _ref2 = this.dndata[series].length;
        for (i = 0; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
          first = this.dndata[series][i];
          if (typeof first !== "undefined" && first !== null) {
            break;
          }
        }
        for (i = this.dndata[series].length - 1; (this.dndata[series].length - 1 <= 0 ? i <= 0 : i >= 0); (this.dndata[series].length - 1 <= 0 ? i += 1 : i -= 1)) {
          last = this.dndata[series][i];
          if (typeof last !== "undefined" && last !== null) {
            break;
          }
        }
        if (!((typeof baseline !== "undefined" && baseline !== null) && stacked)) {
          baseline = [[first[0], denzel[0][1]], [last[0], denzel[1][1]]];
        }
        this.set.push(this.r.sai.prim.area(this.dndata[series], ((typeof colors === "undefined" || colors === null) ? undefined : colors[series]) || 'black', width || 1, baseline));
        if (stacked) {
          baseline = (function() {
            _result = []; _ref2 = this.dndata[series];
            for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
              d = _ref2[_j];
              _result.push([d[0], d[1] - width / 2]);
            }
            return _result;
          }).call(this);
        }
      }
    }
    return this;
  };
  Sai.CandlestickPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.CandlestickPlot, Sai.Plot);
  Sai.CandlestickPlot.prototype.render = function(colors, body_width, shouldInteract, fSetInfo) {
    var _i, _ref, _ref2, cdown, cup, i, info, p, upDay;
    this.set.remove();
    cup = ((typeof colors === "undefined" || colors === null) ? undefined : colors['up']) || 'black';
    cdown = ((typeof colors === "undefined" || colors === null) ? undefined : colors['down']) || 'red';
    body_width = (typeof body_width !== "undefined" && body_width !== null) ? body_width : 5;
    _ref = this.dndata['open'].length;
    for (i = 0; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      if (!(typeof (_ref2 = this.dndata['close'][i]) !== "undefined" && _ref2 !== null)) {
        continue;
      }
      upDay = this.dndata['close'][i][1] < this.dndata['open'][i][1];
      info = {};
      _ref2 = this.rawdata;
      for (p in _ref2) {
        if (!__hasProp.call(_ref2, p)) continue;
        _i = _ref2[p];
        info[p] = this.rawdata[p][i];
      }
      this.set.push(this.r.sai.prim.candlestick(this.dndata['open'][i][0], upDay && this.dndata['close'][i][1] || this.dndata['open'][i][1], upDay && this.dndata['open'][i][1] || this.dndata['close'][i][1], this.dndata['high'][i][1], this.dndata['low'][i][1], body_width || 5, (i && (typeof (_ref2 = this.dndata['close'][i - 1]) !== "undefined" && _ref2 !== null) && (this.dndata['close'][i - 1][1] < this.dndata['close'][i][1])) ? cdown : cup, !upDay, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
    }
    return this;
  };
  Sai.BarPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.BarPlot, Sai.Plot);
  Sai.BarPlot.prototype.render = function(stacked, baseline, colors, shouldInteract, fSetInfo, __LABELS__) {
    var _i, _ref, bardata, barfunc, colorArray, i, info, len, magnitude, net, p, series;
    this.set.remove();
    baseline = this.denormalize([0, baseline])[1];
    len = 0;
    colorArray = [];
    barfunc = stacked ? this.r.sai.prim.stackedBar : this.r.sai.prim.groupedBar;
    _ref = this.dndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      len = Math.max(len, this.dndata[series].length);
      colorArray.push(((typeof colors === "undefined" || colors === null) ? undefined : colors[series]) || 'black');
    }
    for (i = 0; (0 <= len ? i < len : i > len); (0 <= len ? i += 1 : i -= 1)) {
      bardata = [];
      _ref = this.dndata;
      for (series in _ref) {
        if (!__hasProp.call(_ref, series)) continue;
        _i = _ref[series];
        bardata.push(this.dndata[series][i]);
      }
      info = {};
      _ref = this.rawdata;
      for (p in _ref) {
        if (!__hasProp.call(_ref, p)) continue;
        _i = _ref[p];
        info[p] = this.rawdata[p][i];
      }
      if (stacked) {
        magnitude = 0;
        net = 0;
        _ref = this.rawdata;
        for (series in _ref) {
          if (!__hasProp.call(_ref, series)) continue;
          _i = _ref[series];
          if (series !== __LABELS__) {
            if (!(isNaN(this.rawdata[series][i]))) {
              magnitude += Math.abs(this.rawdata[series][i]);
              net += this.rawdata[series][i];
            }
          }
        }
        info['(magnitude)'] = magnitude;
        info['(net)'] = net;
      }
      this.set.push(barfunc(bardata, colorArray, this.w / len, baseline, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
    }
    return this;
  };
  Sai.GeoPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.GeoPlot, Sai.Plot);
  Sai.GeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
    return Sai.util.multiplyColor(colors[mainSeries], (this.data[mainSeries][ridx] == null ? undefined : this.data[mainSeries][ridx][1]) || 0, this.opts.fromWhite, this.opts.fromWhite ? 0.2 : 0).str;
  };
  Sai.GeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
    var _ref;
    return (typeof (_ref = this.data[mainSeries][ridx] == null ? undefined : this.data[mainSeries][ridx][1]) !== "undefined" && _ref !== null) ? 1 : (this.opts.fromWhite ? .15 : 0.25);
  };
  Sai.GeoPlot.prototype.render = function(colors, map, regionSeries, mainSeries, bgcolor, shouldInteract, fSetInfo) {
    var _i, _j, _len, _ref, _result, bbox, i, region, regions, ri;
    this.set.remove();
    regions = (function() {
      _result = []; _ref = this.rawdata[regionSeries];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        region = _ref[_i];
        _result.push(region.toUpperCase());
      }
      return _result;
    }).call(this);
    ri = {};
    _ref = regions.length;
    for (i = 0; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      ri[regions[i]] = i;
    }
    _ref = map.paths;
    for (_j in _ref) {
      if (!__hasProp.call(_ref, _j)) continue;
      (function() {
        var _k, _ref2, color, hoverShape, info, infoSetters, name, opacity, ridx, series;
        var region = _j;
        var _i = _ref[_j];
        ridx = ri[region];
        name = map.name[region];
        info = {
          region: (typeof name !== "undefined" && name !== null) ? name : region
        };
        _ref2 = this.rawdata;
        for (series in _ref2) {
          if (!__hasProp.call(_ref2, series)) continue;
          _k = _ref2[series];
          if (series !== regionSeries) {
            info[series] = this.rawdata[series][ridx];
          }
        }
        color = this.getRegionColor(colors, ridx, mainSeries);
        opacity = this.getRegionOpacity(ridx, mainSeries);
        infoSetters = Sai.util.infoSetters(fSetInfo, info);
        return this.set.push(hoverShape = this.r.sai.prim.hoverShape((function(path, scale, x, y) {
          return function(r) {
            return r.path(path).translate(x, y).scale(scale, scale, x, y);
          };
        })(map.paths[region], Math.min(this.w / map.width, this.h / map.height), this.x, this.y - this.h), {
          'fill': color,
          'stroke': this.opts.fromWhite ? 'black' : bgcolor,
          'stroke-width': 0.5,
          'opacity': opacity
        }, shouldInteract ? [
          function(target) {
            if (!(navigator.userAgent.toLowerCase().indexOf('msie') !== -1 || navigator.userAgent.toLowerCase().indexOf('opera') !== -1)) {
              target.toFront();
            }
            return infoSetters[0]();
          }, infoSetters[1]
        ] : null, shouldInteract ? [
          {
            'fill-opacity': .75,
            'stroke-width': (this.opts.fromWhite ? 1.5 : 0.5)
          }, {
            'fill-opacity': 1,
            'stroke-width': 0.5
          }
        ] : null));
      }).call(this);
    }
    bbox = this.set.getBBox();
    this.set.translate((this.w - bbox.width) / 2, (this.h - bbox.height) / 2);
    return this;
  };
  Sai.ChromaticGeoPlot = function() {
    return Sai.GeoPlot.apply(this, arguments);
  };
  __extends(Sai.ChromaticGeoPlot, Sai.GeoPlot);
  Sai.ChromaticGeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
    var _i, _ref, b, g, r, rgb, series;
    r = (g = (b = 0));
    _ref = this.data;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      rgb = Sai.util.multiplyColor(colors[series], (this.data[series][ridx] == null ? undefined : this.data[series][ridx][1]) || 0, this.opts.fromWhite);
      r += rgb.r;
      g += rgb.g;
      b += rgb.b;
    }
    return ("rgb(" + (r) + ", " + (g) + ", " + (b) + ")");
  };
  Sai.ChromaticGeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
    var _i, _ref, _ref2, series;
    _ref = this.data;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (typeof (_ref2 = this.data[series][ridx] == null ? undefined : this.data[series][ridx][1]) !== "undefined" && _ref2 !== null) {
        return 1;
      }
    }
    return 0.25;
  };
  Sai.ScatterPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.ScatterPlot, Sai.Plot);
  Sai.ScatterPlot.prototype.render = function(mappings, colors, radii, stroke_opacities, stroke_colors, shouldInteract, fSetInfo) {
    var _i, _ref, i, lerp, num_points, series, y2x;
    this.set.remove();
    _ref = this.dndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      num_points = this.dndata[series].length;
      break;
    }
    lerp = function(a, b, alpha) {
      return (b * alpha) + (a * (1 - alpha));
    };
    y2x = __bind(function(y) {
      return this.x + (this.w * ((y - this.y) / -this.h));
    }, this);
    for (_i = 0; (0 <= num_points ? _i < num_points : _i > num_points); (0 <= num_points ? _i += 1 : _i -= 1)) {
      (function() {
        var _j, _ref2, circle, color, info, infoSetters, radius, series, stroke_color, stroke_opacity, x, y;
        var i = _i;
        x = y2x(this.dndata[mappings.x] == null ? undefined : this.dndata[mappings.x][i][1]);
        y = this.dndata[mappings.y] == null ? undefined : this.dndata[mappings.y][i][1];
        if (colors instanceof Array && (typeof (_ref2 = mappings.color) !== "undefined" && _ref2 !== null)) {
          color = Sai.util.colerp(colors[0], colors[1], (typeof (_ref2 = (this.data[mappings.color] == null ? undefined : this.data[mappings.color][i] == null ? undefined : this.data[mappings.color][i][1])) !== "undefined" && _ref2 !== null) ? _ref2 : 0);
        } else if (colors instanceof Object && (typeof (_ref2 = mappings.color) !== "undefined" && _ref2 !== null)) {
          color = colors[this.rawdata[mappings.color][i]];
        } else {
          color = 'black';
        }
        if (stroke_colors instanceof Array && (typeof (_ref2 = mappings.stroke_color) !== "undefined" && _ref2 !== null)) {
          stroke_color = Sai.util.colerp(stroke_colors[0], stroke_colors[1], (typeof (_ref2 = (this.data[mappings.stroke_color] == null ? undefined : this.data[mappings.stroke_color][i] == null ? undefined : this.data[mappings.stroke_color][i][1])) !== "undefined" && _ref2 !== null) ? _ref2 : 0);
        } else if (colors instanceof Object && (typeof (_ref2 = mappings.color) !== "undefined" && _ref2 !== null)) {
          stroke_color = stroke_colors[this.rawdata[mappings.stroke_color][i]];
        } else {
          stroke_color = 'black';
        }
        if (radii instanceof Array && (typeof (_ref2 = mappings.radius) !== "undefined" && _ref2 !== null)) {
          radius = lerp(radii[0], radii[1], (typeof (_ref2 = (this.data[mappings.radius] == null ? undefined : this.data[mappings.radius][i] == null ? undefined : this.data[mappings.radius][i][1])) !== "undefined" && _ref2 !== null) ? _ref2 : 0);
        } else if (radii instanceof Object && (typeof (_ref2 = mappings.radius) !== "undefined" && _ref2 !== null)) {
          radius = radii[this.rawdata[mappings.radius][i]];
        } else {
          radius = 5.0;
        }
        if (stroke_opacities instanceof Array && (typeof (_ref2 = mappings.stroke_opacity) !== "undefined" && _ref2 !== null)) {
          stroke_opacity = lerp(stroke_opacities[0], stroke_opacities[1], (typeof (_ref2 = (this.data[mappings.stroke_opacity] == null ? undefined : this.data[mappings.stroke_opacity][i] == null ? undefined : this.data[mappings.stroke_opacity][i][1])) !== "undefined" && _ref2 !== null) ? _ref2 : 0);
        } else if (stroke_opacities instanceof Object && (typeof (_ref2 = mappings.stroke_opacity) !== "undefined" && _ref2 !== null)) {
          stroke_opacity = stroke_opacities[this.rawdata[mappings.stroke_opacity][i]];
        } else {
          stroke_opacity = 1.0;
        }
        if (shouldInteract) {
          info = {};
          _ref2 = this.rawdata;
          for (series in _ref2) {
            if (!__hasProp.call(_ref2, series)) continue;
            _j = _ref2[series];
            if (!series.match('^__')) {
              info[series] = this.rawdata[series][i];
            }
          }
          infoSetters = Sai.util.infoSetters(fSetInfo, info);
        }
        return this.set.push(circle = this.r.circle(x, y, radius).attr({
          'fill': color,
          'stroke-opacity': stroke_opacity,
          'stroke': stroke_color,
          'fill-opacity': 0.8,
          'stroke-width': 2
        }), shouldInteract ? circle.hover(function() {
          infoSetters[0]();
          return this.attr('fill-opacity', 0.5);
        }, function() {
          infoSetters[1]();
          return this.attr('fill-opacity', 0.8);
        }) : null);
      }).call(this);
    }
    return this;
  };
}).call(this);
