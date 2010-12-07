(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Sai.Plot = function() {
    function Plot(r, x, y, w, h, data, rawdata, opts) {
      var _ref;
      this.r = r;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.data = data;
      this.rawdata = rawdata;
      this.opts = opts;
      (_ref = this.opts) != null ? _ref : this.opts = {};
      this.setDenormalizedData();
      this.set = this.r.set();
    }
    Plot.prototype.setDenormalizedData = function() {
      var dnPoint, series, _i, _j, _len, _len2, _ref, _ref2, _ref3, _results, _results2, _results3;
      if (this.data instanceof Array) {
        return this.dndata = (function() {
          _ref = this.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            dnPoint = _ref[_i];
            _results.push(this.denormalize(dnPoint));
          }
          return _results;
        }.call(this));
      } else {
        (_ref2 = this.dndata) != null ? _ref2 : this.dndata = {};
        _results2 = [];
        for (series in this.data) {
          _results2.push(function() {
            _ref3 = this.data[series];
            _results3 = [];
            for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
              dnPoint = _ref3[_j];
              _results3.push(this.dndata[series] = this.denormalize(dnPoint));
            }
            return _results3;
          }.call(this));
        }
        return _results2;
      }
    };
    Plot.prototype.denormalize = function(point) {
      if (point instanceof Array) {
        return [this.x + (this.w * point[0]), this.y - (this.h * point[1])];
      }
    };
    Plot.prototype.render = function() {
      this.set.push(this.r.rect(20, 20, 20, 20).attr('fill', 'red'), this.r.circle(40, 40, 10).attr('fill', 'blue'));
      return this;
    };
    return Plot;
  }();
  Sai.LinePlot = function() {
    function LinePlot() {
      LinePlot.__super__.constructor.apply(this, arguments);
    }
    __extends(LinePlot, Sai.Plot);
    LinePlot.prototype.setDenormalizedData = function() {
      var series, _ref, _ref2, _results;
      LinePlot.__super__.setDenormalizedData.apply(this, arguments);
      _results = [];
      for (series in this.dndata) {
        _results.push(this.dndata[series].length === 1 && ((_ref = this.dndata[series]) != null ? (_ref2 = _ref[0]) != null ? _ref2[0] : void 0 : void 0) === this.x ? this.dndata[series].push([this.x + this.w, this.dndata[series][0][1]]) : void 0);
      }
      return _results;
    };
    LinePlot.prototype.render = function(colors, width) {
      var series;
      this.set.remove();
      for (series in this.dndata) {
        if (!series.match('^__')) {
          this.set.push(this.r.sai.prim.line(this.dndata[series], (colors != null ? colors[series] : void 0) || 'black', width || 1));
        }
      }
      return this;
    };
    return LinePlot;
  }();
  Sai.AreaPlot = function() {
    function AreaPlot() {
      AreaPlot.__super__.constructor.apply(this, arguments);
    }
    __extends(AreaPlot, Sai.LinePlot);
    AreaPlot.prototype.render = function(colors, width, stacked, baseline) {
      var dnbl, first, i, last, p, series, _baseline, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
      this.set.remove();
      dnbl = (function() {
        _results = [];
        for (_i = 0, _len = baseline.length; _i < _len; _i++) {
          p = baseline[_i];
          _results.push(this.denormalize(p));
        }
        return _results;
      }.call(this));
      for (series in this.dndata) {
        if (!series.match('^__')) {
          for (i = 0, _ref = this.dndata[series].length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
            first = this.dndata[series][i];
            if (first != null) {
              break;
            }
          }
          for (i = _ref2 = this.dndata[series].length - 1; (_ref2 <= 0 ? i <= 0 : i >= 0); (_ref2 <= 0 ? i += 1 : i -= 1)) {
            last = this.dndata[series][i];
            if (last != null) {
              break;
            }
          }
          _baseline = (function() {
            _results2 = [];
            for (_j = 0, _len2 = dnbl.length; _j < _len2; _j++) {
              p = dnbl[_j];
              _results2.push([Math.max(Math.min(last[0], p[0]), first[0]), p[1]]);
            }
            return _results2;
          }());
          this.set.push(this.r.sai.prim.area(this.dndata[series], (colors != null ? colors[series] : void 0) || 'black', width || 1, _baseline));
          if (stacked) {
            dnbl = this.dndata[series];
          }
        }
      }
      return this;
    };
    return AreaPlot;
  }();
  Sai.CandlestickPlot = function() {
    function CandlestickPlot() {
      CandlestickPlot.__super__.constructor.apply(this, arguments);
    }
    __extends(CandlestickPlot, Sai.Plot);
    CandlestickPlot.prototype.render = function(colors, body_width, shouldInteract, fSetInfo) {
      var cdown, cup, i, info, p, upDay, _ref;
      this.set.remove();
      cup = (colors != null ? colors['up'] : void 0) || 'black';
      cdown = (colors != null ? colors['down'] : void 0) || 'red';
      body_width != null ? body_width : body_width = 5;
      for (i = 0, _ref = this.dndata['open'].length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        if (this.dndata['close'][i] == null) {
          continue;
        }
        upDay = this.dndata['close'][i][1] < this.dndata['open'][i][1];
        info = {};
        for (p in this.rawdata) {
          info[p] = this.rawdata[p][i];
        }
        this.set.push(this.r.sai.prim.candlestick(this.dndata['open'][i][0], upDay && this.dndata['close'][i][1] || this.dndata['open'][i][1], upDay && this.dndata['open'][i][1] || this.dndata['close'][i][1], this.dndata['high'][i][1], this.dndata['low'][i][1], body_width || 5, i && (this.dndata['close'][i - 1] != null) && (this.dndata['close'][i - 1][1] < this.dndata['close'][i][1]) ? cdown : cup, !upDay, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
      }
      return this;
    };
    return CandlestickPlot;
  }();
  Sai.BarPlot = function() {
    function BarPlot() {
      BarPlot.__super__.constructor.apply(this, arguments);
    }
    __extends(BarPlot, Sai.Plot);
    BarPlot.prototype.render = function(stacked, baseline, colors, shouldInteract, fSetInfo, __LABELS__) {
      var bardata, barfunc, colorArray, i, info, len, magnitude, net, p, series;
      this.set.remove();
      baseline = this.denormalize([0, baseline])[1];
      len = 0;
      colorArray = [];
      barfunc = stacked ? this.r.sai.prim.stackedBar : this.r.sai.prim.groupedBar;
      for (series in this.dndata) {
        len = Math.max(len, this.dndata[series].length);
        colorArray.push((colors != null ? colors[series] : void 0) || 'black');
      }
      for (i = 0; (0 <= len ? i < len : i > len); (0 <= len ? i += 1 : i -= 1)) {
        bardata = [];
        for (series in this.dndata) {
          bardata.push(this.dndata[series][i]);
        }
        info = {};
        for (p in this.rawdata) {
          info[p] = this.rawdata[p][i];
        }
        if (stacked) {
          magnitude = 0;
          net = 0;
          for (series in this.rawdata) {
            if (series !== __LABELS__) {
              if (!isNaN(this.rawdata[series][i])) {
                magnitude += Math.abs(this.rawdata[series][i]);
                net += this.rawdata[series][i];
              }
            }
          }
          info['(magnitude)'] = magnitude;
        }
        this.set.push(barfunc(bardata, colorArray, this.w / len, baseline, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
      }
      return this;
    };
    return BarPlot;
  }();
  Sai.GeoPlot = function() {
    function GeoPlot() {
      GeoPlot.__super__.constructor.apply(this, arguments);
    }
    __extends(GeoPlot, Sai.Plot);
    GeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
      var _ref;
      return Sai.util.multiplyColor(colors[mainSeries], ((_ref = this.data[mainSeries][ridx]) != null ? _ref[1] : void 0) || 0, this.opts.fromWhite, this.opts.fromWhite ? 0.2 : 0).str;
    };
    GeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
      var _ref;
      if (((_ref = this.data[mainSeries][ridx]) != null ? _ref[1] : void 0) != null) {
        return 1;
      } else {
        if (this.opts.fromWhite) {
          return .15;
        } else {
          return 0.25;
        }
      }
    };
    GeoPlot.prototype.render = function(colors, map, regionSeries, mainSeries, bgcolor, shouldInteract, fSetInfo) {
      var bbox, color, hoverShape, i, info, infoSetters, name, opacity, region, regions, ri, ridx, series, _fn, _i, _len, _ref, _ref2, _results;
      this.set.remove();
      regions = (function() {
        _ref = this.rawdata[regionSeries];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          region = _ref[_i];
          _results.push(region.toUpperCase());
        }
        return _results;
      }.call(this));
      ri = {};
      for (i = 0, _ref2 = regions.length; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
        ri[regions[i]] = i;
      }
      _fn = function(region) {
        ridx = ri[region];
        name = map.name[region];
        info = {
          region: name != null ? name : region
        };
        for (series in this.rawdata) {
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
        }, (shouldInteract ? [
          function(target) {
            if (!(navigator.userAgent.toLowerCase().indexOf('msie') !== -1 || navigator.userAgent.toLowerCase().indexOf('opera') !== -1)) {
              target.toFront();
            }
            return infoSetters[0]();
          }, infoSetters[1]
        ] : null), shouldInteract ? [
          {
            'fill-opacity': .75,
            'stroke-width': (this.opts.fromWhite ? 1.5 : 0.5)
          }, {
            'fill-opacity': 1,
            'stroke-width': 0.5
          }
        ] : null));
      };
      for (region in map.paths) {
        _fn.call(this, region);
      }
      bbox = this.set.getBBox();
      this.set.translate((this.w - bbox.width) / 2, (this.h - bbox.height) / 2);
      return this;
    };
    return GeoPlot;
  }();
  Sai.ChromaticGeoPlot = function() {
    function ChromaticGeoPlot() {
      ChromaticGeoPlot.__super__.constructor.apply(this, arguments);
    }
    __extends(ChromaticGeoPlot, Sai.GeoPlot);
    ChromaticGeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
      var b, g, r, rgb, series, _ref;
      r = g = b = 0;
      for (series in this.data) {
        rgb = Sai.util.multiplyColor(colors[series], ((_ref = this.data[series][ridx]) != null ? _ref[1] : void 0) || 0, this.opts.fromWhite);
        r += rgb.r;
        g += rgb.g;
        b += rgb.b;
      }
      return "rgb(" + r + ", " + g + ", " + b + ")";
    };
    ChromaticGeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
      var series, _ref;
      for (series in this.data) {
        if (((_ref = this.data[series][ridx]) != null ? _ref[1] : void 0) != null) {
          return 1;
        }
      }
      return 0.25;
    };
    return ChromaticGeoPlot;
  }();
  Sai.ScatterPlot = function() {
    function ScatterPlot() {
      ScatterPlot.__super__.constructor.apply(this, arguments);
    }
    __extends(ScatterPlot, Sai.Plot);
    ScatterPlot.prototype.render = function(mappings, colors, radii, stroke_opacities, stroke_colors, shouldInteract, fSetInfo) {
      var circle, color, i, info, infoSetters, lerp, num_points, radius, series, stroke_color, stroke_opacity, x, y, y2x, _fn, _ref, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      this.set.remove();
      for (series in this.dndata) {
        num_points = this.dndata[series].length;
        break;
      }
      lerp = function(a, b, alpha) {
        return (b * alpha) + (a * (1 - alpha));
      };
      y2x = __bind(function(y) {
        return this.x + (this.w * ((y - this.y) / -this.h));
      }, this);
      _fn = function(i) {
        x = y2x((_ref = this.dndata[mappings.x]) != null ? _ref[i][1] : void 0);
        y = (_ref2 = this.dndata[mappings.y]) != null ? _ref2[i][1] : void 0;
        if (colors instanceof Array && (mappings.color != null)) {
          color = Sai.util.colerp(colors[0], colors[1], (_ref3 = (_ref4 = this.data[mappings.color]) != null ? (_ref5 = _ref4[i]) != null ? _ref5[1] : void 0 : void 0) != null ? _ref3 : 0);
        } else if (colors instanceof Object && (mappings.color != null)) {
          color = colors[this.rawdata[mappings.color][i]];
        } else {
          color = 'black';
        }
        if (stroke_colors instanceof Array && (mappings.stroke_color != null)) {
          stroke_color = Sai.util.colerp(stroke_colors[0], stroke_colors[1], (_ref6 = (_ref7 = this.data[mappings.stroke_color]) != null ? (_ref8 = _ref7[i]) != null ? _ref8[1] : void 0 : void 0) != null ? _ref6 : 0);
        } else if (colors instanceof Object && (mappings.color != null)) {
          stroke_color = stroke_colors[this.rawdata[mappings.stroke_color][i]];
        } else {
          stroke_color = 'black';
        }
        if (radii instanceof Array && (mappings.radius != null)) {
          radius = lerp(radii[0], radii[1], (_ref9 = (_ref10 = this.data[mappings.radius]) != null ? (_ref11 = _ref10[i]) != null ? _ref11[1] : void 0 : void 0) != null ? _ref9 : 0);
        } else if (radii instanceof Object && (mappings.radius != null)) {
          radius = radii[this.rawdata[mappings.radius][i]];
        } else {
          radius = 5.0;
        }
        if (stroke_opacities instanceof Array && (mappings.stroke_opacity != null)) {
          stroke_opacity = lerp(stroke_opacities[0], stroke_opacities[1], (_ref12 = (_ref13 = this.data[mappings.stroke_opacity]) != null ? (_ref14 = _ref13[i]) != null ? _ref14[1] : void 0 : void 0) != null ? _ref12 : 0);
        } else if (stroke_opacities instanceof Object && (mappings.stroke_opacity != null)) {
          stroke_opacity = stroke_opacities[this.rawdata[mappings.stroke_opacity][i]];
        } else {
          stroke_opacity = 1.0;
        }
        if (shouldInteract) {
          info = {};
          for (series in this.rawdata) {
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
        }) : void 0);
      };
      for (i = 0; (0 <= num_points ? i < num_points : i > num_points); (0 <= num_points ? i += 1 : i -= 1)) {
        _fn.call(this, i);
      }
      return this;
    };
    return ScatterPlot;
  }();
}).call(this);
