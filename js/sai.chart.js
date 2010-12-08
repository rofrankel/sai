(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Sai.Chart = function() {
    function Chart(r, x, y, w, h, data, __LABELS__, opts) {
      var init_padding, _base, _ref, _ref2;
      this.r = r;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.__LABELS__ = __LABELS__;
      this.opts = opts;
      this.drawInfo = __bind(this.drawInfo, this);;
      (_ref = this.opts) != null ? _ref : this.opts = {};
      (_ref2 = (_base = this.opts).bgcolor) != null ? _ref2 : _base.bgcolor = 'white';
      this.setData(data);
      init_padding = this.opts.simple ? 0 : 5;
      this.padding = {
        left: init_padding,
        right: init_padding,
        top: init_padding,
        bottom: init_padding
      };
    }
    Chart.prototype.groupsToNullPad = function() {
      return [];
    };
    Chart.prototype.nonNegativeGroups = function() {
      return [];
    };
    Chart.prototype.nextSeriesSuffix = function() {
      var _ref;
      this.suffixCtr = ((_ref = this.suffixCtr) != null ? _ref : 0) + 1;
      return "[" + this.suffixCtr + "]";
    };
    Chart.prototype.fixSeriesName = function(seriesName) {
      return seriesName + (seriesName.match(/^\s+$/) ? this.nextSeriesSuffix() : '');
    };
    Chart.prototype.setSemanticRename = function(seriesName) {
      var rename, _ref, _results;
      if (this.semanticRenamePatterns == null) {
        return;
      }
      (_ref = this.semanticRenames) != null ? _ref : this.semanticRenames = {};
      _results = [];
      for (rename in this.semanticRenamePatterns) {
        _results.push(seriesName.match(this.semanticRenamePatterns[rename]) ? this.semanticRenames[rename] = seriesName : void 0);
      }
      return _results;
    };
    Chart.prototype.getBaseline = function(group) {
      var nh0;
      nh0 = this.normalizedHeight(0, group != null ? group : 'all');
      return [[0, nh0], [1, nh0]];
    };
    Chart.prototype.setData = function(data) {
      var d, empty, group, groups, i, nngroups, pd, series, seriesName, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results, _results2;
      this.data = {};
      this.renames = {};
      empty = function(obj) {
        var e;
        for (e in obj) {
          if (obj.hasOwnProperty(e)) {
            return false;
          }
        }
        return true;
      };
      if (empty(data)) {
        this.render = function() {
          return this.showError("(no data -> empty chart)");
        };
        return;
      }
      for (series in data) {
        while (true) {
          seriesName = this.fixSeriesName(series);
          this.setSemanticRename(seriesName);
          if (seriesName === series || !(seriesName in data)) {
            break;
          }
        }
        this.renames[series] = seriesName;
        if (data[series] instanceof Array) {
          if (this.__LABELS__ === series) {
            this.__LABELS__ = seriesName;
            this.data[seriesName] = (function() {
              _ref = data[series];
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                d = _ref[_i];
                _results.push(String(d));
              }
              return _results;
            }());
          } else {
            this.data[seriesName] = (function() {
              _ref2 = data[series];
              _results2 = [];
              for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                d = _ref2[_j];
                _results2.push((typeof d === 'string' && d.match(/^( +)?[+-]?[\d,]+(\.\d+)?( +)?$/) && !isNaN(pd = parseFloat(d.replace(/,/g, ''))) ? pd : d));
              }
              return _results2;
            }());
          }
        } else {
          this.data[seriesName] = data[series];
        }
      }
      groups = this.dataGroups(this.data);
      nngroups = this.nonNegativeGroups();
      for (group in groups) {
        if (groups[group].length > 0) {
          if (__indexOf.call(nngroups, group) >= 0) {
            _ref3 = groups[group];
            for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
              series = _ref3[_k];
              if (this.data[series] != null) {
                for (i = 0, _ref4 = this.data[series].length; (0 <= _ref4 ? i < _ref4 : i > _ref4); (0 <= _ref4 ? i += 1 : i -= 1)) {
                  if (this.data[series][i] < 0) {
                    this.data[series][i] *= -1;
                  }
                }
              }
            }
          }
        }
      }
      _ref5 = this.groupsToNullPad();
      for (_l = 0, _len4 = _ref5.length; _l < _len4; _l++) {
        group = _ref5[_l];
        if (group in groups) {
          _ref6 = groups[group];
          for (_m = 0, _len5 = _ref6.length; _m < _len5; _m++) {
            series = _ref6[_m];
            this.nullPad(series);
          }
        }
      }
      return this.normalize(this.data);
    };
    Chart.prototype.nullPad = function(seriesName) {
      if (seriesName in this.data) {
        return this.data[seriesName] = [null].concat(this.data[seriesName].concat([null]));
      }
    };
    Chart.prototype.caresAbout = function(seriesName) {
      return !(seriesName.match("^__") || seriesName === this.__LABELS__);
    };
    Chart.prototype.dataGroups = function(data) {
      var seriesName, _results, _results2;
      return {
        'all': (function() {
          _results = [];
          for (seriesName in data) {
            if (this.caresAbout(seriesName)) {
              _results.push(seriesName);
            }
          }
          return _results;
        }.call(this)),
        '__META__': (function() {
          _results2 = [];
          for (seriesName in data) {
            if (seriesName.match("^__") || seriesName === this.__LABELS__) {
              _results2.push(seriesName);
            }
          }
          return _results2;
        }.call(this))
      };
    };
    Chart.prototype.getYAxisVals = function(min, max, nopad) {
      var bottom, factor, i, mag, rawmag, step, top, vals;
      if (!(typeof min === "number" && typeof max === "number")) {
        return [min, max];
      }
      if (min === max) {
        return [0, max, max * 2];
      }
      nopad != null ? nopad : nopad = false;
      factor = 1;
      while (((max - min) * factor) < 10) {
        factor *= 10;
      }
      min *= factor;
      max *= factor;
      mag = Math.floor(rawmag = (Math.log(max - min) / Math.LN10) - 0.4);
      step = Math.pow(10, mag);
      if (rawmag % 1 > 0.7 && !nopad) {
        step *= 4;
      } else if (rawmag % 1 > 0.35 && !nopad) {
        step *= 2;
      }
      bottom = Sai.util.round(min - (nopad ? step / 2.1 : step / 1.75), step);
      if ((bottom < 0 && 0 <= min)) {
        bottom = 0;
      }
      top = Sai.util.round(max + (nopad ? step / 2.1 : step / 1.75), step);
      bottom /= factor;
      top /= factor;
      step /= factor;
      i = bottom;
      vals = [i];
      while (i < top) {
        i = Sai.util.round(i + step, step);
        vals.push(i);
      }
      return vals;
    };
    Chart.prototype.getMax = function(data, group) {
      var d, series, _i, _j, _len, _len2, _ref, _results, _results2;
      return Math.max.apply(Math, function() {
        _results = [];
        for (_i = 0, _len = group.length; _i < _len; _i++) {
          series = group[_i];
          if (data[series] != null) {
            _results.push(Math.max.apply(Math, function() {
              _ref = data[series];
              _results2 = [];
              for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                d = _ref[_j];
                if ((d != null) && typeof d === "number") {
                  _results2.push(d);
                }
              }
              return _results2;
            }()));
          }
        }
        return _results;
      }());
    };
    Chart.prototype.getMin = function(data, group) {
      var d, series, _i, _j, _len, _len2, _ref, _results, _results2;
      return Math.min.apply(Math, function() {
        _results = [];
        for (_i = 0, _len = group.length; _i < _len; _i++) {
          series = group[_i];
          if (data[series] != null) {
            _results.push(Math.min.apply(Math, function() {
              _ref = data[series];
              _results2 = [];
              for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                d = _ref[_j];
                if ((d != null) && typeof d === "number") {
                  _results2.push(d);
                }
              }
              return _results2;
            }()));
          }
        }
        return _results;
      }());
    };
    Chart.prototype.getStackedMax = function(data, group) {
      var i, series, _i, _len, _ref, _ref2, _ref3, _results, _results2;
      (_ref = this.stackedMax) != null ? _ref : this.stackedMax = {};
      this.stackedMax[group] = (_ref2 = this.stackedMax[group]) != null ? _ref2 : Math.max.apply(Math, function() {
        _results = [];
        for (i = 0, _ref3 = data[this.__LABELS__].length; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
          _results.push(Sai.util.sumArray(function() {
            _results2 = [];
            for (_i = 0, _len = group.length; _i < _len; _i++) {
              series = group[_i];
              if (series !== this.__LABELS__ && data[series][i] >= 0) {
                _results2.push(data[series][i]);
              }
            }
            return _results2;
          }.call(this)));
        }
        return _results;
      }.call(this));
      return this.stackedMax[group];
    };
    Chart.prototype.getStackedMin = function(data, group) {
      var i, series, _i, _len, _ref, _ref2, _ref3, _results, _results2;
      (_ref = this.stackedMin) != null ? _ref : this.stackedMin = {};
      this.stackedMin[group] = (_ref2 = this.stackedMin[group]) != null ? _ref2 : Math.min.apply(Math, function() {
        _results = [];
        for (i = 0, _ref3 = data[this.__LABELS__].length; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
          _results.push(Sai.util.sumArray(function() {
            _results2 = [];
            for (_i = 0, _len = group.length; _i < _len; _i++) {
              series = group[_i];
              if (series !== this.__LABELS__ && data[series][i] < 0) {
                _results2.push(data[series][i]);
              }
            }
            return _results2;
          }.call(this)));
        }
        return _results;
      }.call(this));
      return this.stackedMin[group];
    };
    Chart.prototype.normalize = function(data) {
      var all, baseline, baselines, bli, empty, group, groups, i, max, maxf, min, minf, norm, norm0, nval, series, stackedPoint, yvals, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results, _results2, _results3, _results4, _results5, _results6;
      groups = this.dataGroups(data);
      this.ndata = {};
      if (this.opts.stacked != null) {
        this.stackedNdata = {};
      }
      norm = function(val, min, max) {
        if (typeof val === "number") {
          if (min === max) {
            return 1;
          } else {
            return (val - min) / (max - min);
          }
        }
        return null;
      };
      all = function(f, a) {
        var e, _i, _len;
        for (_i = 0, _len = a.length; _i < _len; _i++) {
          e = a[_i];
          if (!f(e)) {
            return false;
          }
        }
        return true;
      };
      empty = function(a) {
        var e, _i, _len;
        for (_i = 0, _len = a.length; _i < _len; _i++) {
          e = a[_i];
          if (typeof e === 'number') {
            return false;
          }
        }
        return true;
      };
      _results = [];
      for (group in groups) {
        if (group.match('^__') || Sai.util.sumArray(function() {
          _ref = groups[group];
          _results2 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            series = _ref[_i];
            _results2.push(this.data[series].length);
          }
          return _results2;
        }.call(this)) === 0 || all(empty, function() {
          _ref2 = groups[group];
          _results3 = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            series = _ref2[_j];
            _results3.push(this.data[series]);
          }
          return _results3;
        }.call(this))) {
          continue;
        }
        this.ndata[group] = {};
        if (this.opts.stacked != null) {
          this.stackedNdata[group] = {};
          baselines = {};
        }
        minf = this.opts.stacked ? __bind(function(d, g) {
          return this.getStackedMin(d, g);
        }, this) : this.getMin;
        maxf = this.opts.stacked ? __bind(function(d, g) {
          return this.getStackedMax(d, g);
        }, this) : this.getMax;
        min = minf(data, groups[group]);
        max = maxf(data, groups[group]);
        yvals = this.getYAxisVals(min, max);
        min = yvals[0];
        max = yvals[yvals.length - 1];
        this.ndata[group]['__YVALS__'] = yvals;
        _results.push(function() {
          _ref3 = groups[group];
          _results4 = [];
          for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
            series = _ref3[_k];
            if (data[series] == null) {
              continue;
            }
            this.ndata[group][series] = (function() {
              _results5 = [];
              for (i = 0, _ref4 = data[series].length; (0 <= _ref4 ? i < _ref4 : i > _ref4); (0 <= _ref4 ? i += 1 : i -= 1)) {
                _results5.push(((data[series][i] != null) && (nval = norm(data[series][i], min, max)) !== null ? [i / (data[series].length - 1 || 1), nval] : null));
              }
              return _results5;
            }());
            _results4.push(function() {
              if (this.opts.stacked != null) {
                norm0 = norm(0, min, max);
                this.stackedNdata[group][series] = [];
                _results6 = [];
                for (i = 0, _ref5 = data[series].length; (0 <= _ref5 ? i < _ref5 : i > _ref5); (0 <= _ref5 ? i += 1 : i -= 1)) {
                  bli = (data[series][i] != null) && data[series][i] < 0 ? 0 : 1;
                  (_ref6 = baselines[i]) != null ? _ref6 : baselines[i] = [norm0, norm0];
                  baseline = baselines[i][bli];
                  stackedPoint = [i / (data[series].length - 1 || 1), (((_ref7 = norm(data[series][i], min, max)) != null ? _ref7 : norm0) - norm0) + baseline];
                  this.stackedNdata[group][series].push(stackedPoint);
                  _results6.push(stackedPoint !== null ? baselines[i][bli] = stackedPoint[1] : void 0);
                }
                return _results6;
              }
            }.call(this));
          }
          return _results4;
        }.call(this));
      }
      return _results;
    };
    Chart.prototype.addAxes = function(groups, titles) {
      var LINE_HEIGHT, doLeftAxis, doRightAxis, haxis_height, hbb, hlen, i, tmptext, vaxis2_width, vaxis_width, vbbw, vlen, vrbbw, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _vaxis;
      LINE_HEIGHT = 10;
      this.axisWidth = 1.5;
      this.padding.top += 5;
      for (i = _ref = this.data[this.__LABELS__].length - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
        if (this.data[this.__LABELS__][i] != null) {
          tmptext = this.r.text(0, 0, Sai.util.prettystr(this.data[this.__LABELS__][i]));
          this.padding.right += tmptext.getBBox().width / 2;
          tmptext.remove();
          break;
        }
      }
      vlen = this.h - (this.padding.bottom + this.padding.top);
      doLeftAxis = (this.ndata[groups[0]] != null) || !(this.ndata[groups[1]] != null);
      doRightAxis = this.ndata[groups[1]] != null;
      if (doLeftAxis) {
        _vaxis = this.r.sai.prim.vaxis((_ref2 = (_ref3 = this.ndata[groups[0]]) != null ? _ref3['__YVALS__'] : void 0) != null ? _ref2 : [0, '?'], this.x + this.padding.left, this.y - this.padding.bottom, vlen, {
          width: this.axisWidth,
          title: titles != null ? titles.left : void 0
        });
        vaxis_width = _vaxis.items[0].getBBox().width;
        _vaxis.remove();
      } else {
        vaxis_width = 0;
      }
      if (doRightAxis) {
        _vaxis = this.r.sai.prim.vaxis((_ref4 = (_ref5 = this.ndata[groups[1]]) != null ? _ref5['__YVALS__'] : void 0) != null ? _ref4 : [0, '?'], this.x + this.padding.left, this.y - this.padding.bottom, vlen, {
          width: this.axisWidth,
          title: titles != null ? titles.right : void 0
        });
        vaxis2_width = _vaxis.getBBox().width;
        _vaxis.remove();
      } else {
        vaxis2_width = 0;
      }
      hlen = this.w - this.padding.left - this.padding.right - vaxis_width - vaxis2_width;
      this.haxis = this.r.sai.prim.haxis(this.data[this.__LABELS__], this.x + this.padding.left + vaxis_width, this.y - this.padding.bottom, hlen, {
        width: this.axisWidth,
        title: titles != null ? titles.bottom : void 0
      });
      hbb = this.haxis.getBBox();
      haxis_height = hbb.height;
      if (isNaN(haxis_height)) {
        haxis_height = 1;
      }
      this.haxis.translate(0, -haxis_height);
      this.padding.bottom += haxis_height;
      vlen = this.h - (this.padding.bottom + this.padding.top);
      if (doLeftAxis) {
        this.vaxis = this.r.sai.prim.vaxis((_ref6 = (_ref7 = this.ndata[groups[0]]) != null ? _ref7['__YVALS__'] : void 0) != null ? _ref6 : [0, '?'], this.x + this.padding.left, this.y - this.padding.bottom, vlen, {
          width: this.axisWidth,
          title: titles != null ? titles.left : void 0
        });
        vbbw = this.vaxis.items[0].getBBox().width;
        this.vaxis.translate(vbbw, 0);
        this.padding.left += vbbw;
      }
      if (doRightAxis) {
        this.vaxis_right = this.r.sai.prim.vaxis((_ref8 = (_ref9 = this.ndata[groups[1]]) != null ? _ref9['__YVALS__'] : void 0) != null ? _ref8 : [0, '?'], this.w - this.padding.right, this.y - this.padding.bottom, vlen, {
          width: this.axisWidth,
          right: true,
          title: titles != null ? titles.right : void 0,
          color: this.ndata[groups[0]] != null ? (_ref10 = this.colors.__RIGHTAXIS__) != null ? _ref10 : 'blue' : 'black'
        });
        vrbbw = this.vaxis_right.items[0].getBBox().width;
        this.vaxis_right.translate(-vrbbw, 0);
        this.padding.right += vrbbw;
      }
      this.setPlotCoords();
      return this.r.set().push(this.haxis).push(this.vaxis);
    };
    Chart.prototype.setPlotCoords = function() {
      var hlbb, lbb, _ref, _ref2, _ref3, _ref4;
      this.px = this.x + this.padding.left;
      this.py = this.y - this.padding.bottom;
      this.pw = this.w - this.padding.left - this.padding.right;
      this.ph = this.h - this.padding.bottom - this.padding.top;
      lbb = (_ref = this.legend) != null ? _ref.getBBox() : void 0;
      if ((_ref2 = this.legend) != null) {
        _ref2.translate(this.px + this.pw / 2 - (lbb.x + lbb.width / 2), 0);
      }
      hlbb = (_ref3 = this.histogramLegend) != null ? _ref3.getBBox() : void 0;
      return (_ref4 = this.histogramLegend) != null ? _ref4.translate(this.px + this.pw / 2 - (hlbb.x + hlbb.width / 2), 0) : void 0;
    };
    Chart.prototype.drawBG = function() {
      return this.bg = this.r.rect((this.px != null) && this.px || this.x, (this.py != null) && (this.py - this.ph) || (this.y - this.h), (this.pw != null) && this.pw || this.w, (this.ph != null) && this.ph || this.h).attr({
        fill: this.opts.bgcolor,
        'stroke-width': 0,
        'stroke-opacity': 0
      }).toBack();
    };
    Chart.prototype.logoPos = function() {
      var h, w, x, y;
      w = 150;
      h = 28;
      x = (this.px != null) && (this.pw != null) ? this.px + this.pw - w - 5 : this.w + this.x - w - this.padding.right;
      y = (this.py != null) && (this.ph != null) ? this.py - this.ph + 5 : this.y - this.h + this.padding.top;
      return [x, y, w, h];
    };
    Chart.prototype.drawLogo = function() {
      var h, logo_path, path_height, path_start_offset, path_width, scale, w, x, y, _ref, _ref2;
      if (this.opts.simple) {
        return;
      }
      _ref = this.logoPos(), x = _ref[0], y = _ref[1], w = _ref[2], h = _ref[3];
      path_width = 344;
      path_height = 65;
      path_start_offset = [328.3, 53.06];
      scale = [w / path_width, h / path_height];
      x += path_start_offset[0] * scale[0];
      y += path_start_offset[1] * scale[1];
      logo_path = "M" + x + "," + y + "h1.9v1.6c0.5-0.5,0.9-0.9,1.3-1.2,0.6-0.4,1.4-0.7,2.2-0.7,0.9,0,1.6,0.3,2.2,0.7,0.3,0.3,0.6,0.7,0.9,1.2,0.4-0.7,0.9-1.1,1.5-1.4,0.6-0.3,1.2-0.5,2-0.5,1.5,0,2.6,0.6,3.1,1.7,0.3,0.6,0.5,1.4,0.5,2.5v7.7h-2v-8.1c0-0.7-0.2-1.3-0.6-1.6-0.4-0.2-0.9-0.4-1.4-0.4-0.8,0-1.4,0.3-2,0.8-0.5,0.5-0.8,1.3-0.8,2.5v6.8h-2v-7.6c0-0.8-0.1-1.3-0.3-1.7-0.3-0.5-0.8-0.8-1.6-0.8-0.8,0-1.4,0.3-2,0.8-0.6,0.6-0.9,1.6-0.9,3.1v6.2h-2v-11.6zm-3.9,1.1c1,1,1.5,2.5,1.5,4.4,0,1.9-0.4,3.4-1.3,4.7-0.9,1.2-2.3,1.8-4.2,1.8-1.6,0-2.9-0.6-3.8-1.6-0.9-1.1-1.4-2.6-1.4-4.4,0-1.9,0.5-3.5,1.5-4.6,1-1.2,2.3-1.7,3.9-1.7,1.5,0,2.8,0.5,3.8,1.4zm-1.2,7.7c0.5-0.9,0.7-2,0.7-3.2,0-1.1-0.2-2-0.5-2.6-0.6-1.1-1.5-1.6-2.8-1.6-1.2,0-2,0.4-2.6,1.3-0.5,0.9-0.8,2-0.8,3.3,0,1.2,0.3,2.2,0.8,3.1,0.6,0.8,1.4,1.2,2.6,1.2,1.2,0,2.1-0.5,2.6-1.5zm-10.6-8.2c0.8,0.6,1.3,1.7,1.5,3.3h-1.9c-0.1-0.7-0.4-1.3-0.8-1.8-0.4-0.5-1.1-0.7-2-0.7-1.2,0-2.1,0.6-2.6,1.8-0.4,0.8-0.6,1.8-0.6,2.9,0,1.2,0.3,2.1,0.8,2.9,0.5,0.8,1.2,1.2,2.3,1.2,0.8,0,1.4-0.2,1.9-0.7,0.5-0.5,0.8-1.2,1-2h1.9c-0.2,1.5-0.8,2.6-1.7,3.3-0.8,0.7-1.9,1.1-3.3,1.1-1.5,0-2.7-0.6-3.6-1.7-0.9-1.1-1.3-2.4-1.3-4.1,0-2,0.5-3.6,1.4-4.7,1-1.2,2.3-1.7,3.8-1.7,1.3,0,2.4,0.3,3.2,0.9zm-13.3,8.6h2.2v2.4h-2.2v-2.4zm-181-15.8-6,12.9h-7.6c-0.9-0.4-4.5-6-5.3-7.2-3.3-4.5-6.8-8.9-10.1-13.5-1.2-1.7-2.8-3.2-4-5.1h-8.9v-2.8h17.7c3.4,0,7.2,0.3,9.6-0.8,2.2-0.9,3.9-2.5,5.2-4.3,1.1-1.7,2.8-4.6,2.1-8-1.2-4.9-4-7.791-8.5-9.251-2.6-0.81-9.8-0.61-9.8-0.61h-21v56.361h4.7v-26h6.5c6.4,8.6,12.9,17.3,19.3,26h12.9l6.5-13.1h34.5l6.4,13.1h5.4l-8.6-17.7h-41zm-41.9-34.10h17.7c4.5,0,7.8-0.1,10,2.1,1.1,1.1,2.8,3.2,2.1,5.9-0.5,2.2-1.9,4-3.9,4.8-2,0.9-5.8,0.7-8.4,0.7h-17.5v-13.50zm61.1-4.751-17.4,36.051h37.5l-17.4-36.051h-2.7zm-9.9,31.251,11-22.9,11.4,22.9h-22.4zm-127.60-26.500h25.800v51.8h4.7v-56.361h-30.500v4.561zm276.70-12.341-35.6,29.741v-29.741h-4.8v39.441l48-39.441h-7.6zm19.4,0h-7.4l-32.3,26.941,32.3,37.2h6.2l-31.6-36.400,32.8-27.741zm-163.3,0-25.1,50.841-5.9-7.8-3.4-4.5v-0.4c9.7,0,16-4.9,18.8-11.6,4.8-11.3-2.7-21.961-10.4-25.211-3.4-1.44-8-1.33-12.9-1.33h-20.3h-73.600v4.74h64.100v2.97l-30.7,0.1v56.331h4.7v-51.8h26v51.8h4.7v-59.401h22.8c4,0,8.8-0.46,12,0.57,3.4,1.12,5.9,3.35,7.7,6.031,1.7,2.6,3.5,7.2,2.1,11.6-0.7,2.3-1.9,4.2-3.2,5.9-1.3,1.7-4.4,3.4-6.6,4.2-1,0.3-3.1,0.5-3.1,0.5h-11.5c5.6,7.7,11.3,15.3,17,23h4.4c0.6-0.4,25-50.151,25.4-51.801h6.1l29.2,59.401h5.1l-31.3-64.141h-12.1zm103.5,43.641v20.5h4.8v-18.2l12.5-10.5,25,28.7h6.3l-30.6-35.1-18,14.6zm-7.7-28.3c-6.1-9.141-17.1-15.251-29.6-15.251-19.2,0-34.8,14.351-34.8,32.151,0,17.7,15.6,32.1,34.8,32.1,10.5,0,22.4-4.1,29.7-10.8v10.6h4.8v-19c-1.7,0.8-3.3,1.8-4.9,2.8v0.1c-10.9,7.1-19.4,11.2-29.9,11.3-16.4,0-29.6-12.2-29.6-27.2,0-15.1,13.2-27.311,29.6-27.311,11.5,0,21.5,6.011,26.4,14.811,0,0,2.2-1.4,3.5-2.2v20.8c-1.3,0.9-4.5,3.3-4.6,3.4-8.2,5.4-17.9,10.3-25.5,10.4-12,0-21.7-9-21.7-19.9,0-11,9.7-19.9,21.7-19.9,8.4,0,15.7,4.4,19.3,10.8l0.1,0.1c0.2,0.2,0.5,0.2,0.7,0.1,0,0,0.1-0.1,0.1-0.1,0.1-0.1,0.9-0.6,1.7-1,0.4-0.3,0.8-0.5,1.1-0.7,0.1,0,0.2-0.1,0.3-0.2h0.1l0.1-0.1c0.2-0.1,0.3-0.5,0.1-0.7-4.5-7.8-13.3-12.971-23.4-12.971-14.8,0-26.7,11.071-26.7,24.771,0,13.7,11.9,24.7,26.7,24.7,9.6,0,25.4-8.1,29.9-12.2,1.6-1.1,3.1-2.4,4.9-3.2v-41.561h-4.9v15.361z";
      return this.logo = this.r.path(logo_path).hide().attr({
        fill: (_ref2 = this.opts.logoColor) != null ? _ref2 : '#AA5128',
        'stroke-width': 0,
        'stroke-opacity': 0,
        opacity: 0.25,
        cx: x + w / 2,
        cy: y - h / 2
      }).scale(scale[0], scale[1], x, y).show();
    };
    Chart.prototype.drawFootnote = function(text) {
      var h, _ref;
      text != null ? text : text = (_ref = this.opts.footnote) != null ? _ref : '';
      if (text.match(/^\s*$/)) {
        return;
      }
      this.footnote = this.r.sai.prim.wrappedText(this.x + this.padding.left, this.y - this.padding.bottom, this.w, text, ' ');
      h = this.footnote.getBBox().height;
      this.padding.bottom += h + 10;
      return this.footnote.translate(0, -h);
    };
    Chart.prototype.render = function() {
      if (this.opts.simple && (this.renderPlots != null)) {
        this.renderPlots();
      } else {
        this.renderFull();
      }
      return this;
    };
    Chart.prototype.renderFull = function() {
      var _ref;
      (_ref = this.plot) != null ? _ref : this.plot = new Sai.Plot(this.r);
      this.plot.render();
      return this;
    };
    Chart.prototype.showError = function(error) {
      var err, _ref, _ref2;
      return err = this.r.text(this.x + this.padding.left + (((_ref = this.pw) != null ? _ref : this.w) / 2), this.y - this.padding.bottom - (((_ref2 = this.ph) != null ? _ref2 : this.h) / 2), error);
    };
    Chart.prototype.setColors = function(colors) {
      var series, seriesName, _ref;
      (_ref = this.colors) != null ? _ref : this.colors = {};
      for (series in colors) {
        seriesName = this.renames[series];
        if (seriesName in this.data) {
          this.colors[seriesName] = colors[series];
        }
      }
      return this;
    };
    Chart.prototype.setColor = function(series, color) {
      var _ref;
      (_ref = this.colors) != null ? _ref : this.colors = {};
      this.colors[this.renames[series]] = color;
      return this;
    };
    Chart.prototype.normalizedHeight = function(h, group) {
      var nh, ymax, ymin, _ref;
      if (((_ref = this.ndata[group]) != null ? _ref['__YVALS__'] : void 0) == null) {
        return;
      }
      ymin = this.ndata[group]['__YVALS__'][0];
      ymax = this.ndata[group]['__YVALS__'][this.ndata[group]['__YVALS__'].length - 1];
      if (h < ymin) {
        h = ymin;
      } else if (h > ymax) {
        h = ymax;
      }
      return nh = (h - ymin) / (ymax - ymin);
    };
    Chart.prototype.drawGuideline = function(h, group) {
      var guideline, nh, _ref, _ref2;
      group != null ? group : group = 'all';
      if (((_ref = this.ndata[group]) != null ? _ref['__YVALS__'] : void 0) == null) {
        return;
      }
      nh = this.normalizedHeight(h, group);
      (_ref2 = this.guidelines) != null ? _ref2 : this.guidelines = this.r.set();
      guideline = new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, {
        'guideline': [[0, nh], [1, nh]]
      });
      guideline.render({
        'guideline': '#ccc'
      });
      return this.guidelines.push(guideline.set);
    };
    Chart.prototype.drawLegend = function(colors) {
      var bbox, l, _colors, _highlightColors, _ref, _ref2;
      colors != null ? colors : colors = this.colors;
      if (colors) {
        _colors = {};
        _highlightColors = {};
        for (l in colors) {
          if (l !== this.__LABELS__) {
            _colors[l] = colors[l];
            _highlightColors[l] = 'black';
            if (((_ref = this.opts.groups) != null ? _ref.right : void 0) != null) {
              if (__indexOf.call(this.opts.groups.right, l) >= 0) {
                _highlightColors[l] = this.ndata.left != null ? (_ref2 = this.colors.__RIGHTAXIS__) != null ? _ref2 : 'blue' : 'black';
              }
            }
          }
        }
        this.legend = this.r.sai.prim.legend(this.x, this.y - this.padding.bottom, this.w, _colors, _highlightColors);
        bbox = this.legend.getBBox();
        if (this.legend.length > 0) {
          this.padding.bottom += bbox.height + 15;
        }
        return this.legend.translate((this.w - bbox.width) / 2, 0);
      }
    };
    Chart.prototype.drawTitle = function() {
      if (this.opts.title != null) {
        this.title = this.r.text(this.x + (this.w / 2), this.y - this.h, this.opts.title).attr({
          'font-size': 20
        });
        this.title.translate(0, this.title.getBBox().height / 2);
        return this.padding.top += this.title.getBBox().height + 5;
      }
    };
    Chart.prototype.setupInfoSpace = function() {
      this.info_y = this.y - this.h + this.padding.top;
      this.info_x = this.x + this.padding.left;
      this.info_w = this.w - this.padding.left - this.padding.right;
      return this.padding.top += 30;
    };
    Chart.prototype.drawInfo = function(info, clear) {
      var label, _ref;
      clear != null ? clear : clear = true;
      info != null ? info : info = this.default_info != null ? this.default_info() : {};
      if (clear) {
        this.info_data = {};
      }
      if (this.info) {
        this.info.remove();
      }
      for (label in info) {
        if (!label.match("^__")) {
          this.info_data[label] = (_ref = info[label]) != null ? _ref : '(no data)';
        }
      }
      return this.info = this.r.sai.prim.info(this.info_x, this.info_y, this.info_w, this.info_data);
    };
    Chart.prototype.getIndex = function(evt) {
      var tx;
      tx = Sai.util.transformCoords(evt, this.r.canvas).x;
      return Math.round((this.data[this.__LABELS__].length - 1) * (tx - this.px) / this.pw);
    };
    Chart.prototype.drawHistogramLegend = function(seriesNames, colors) {
      var color, data, dataWithoutNulls, extrapadding, height, histogram, i, j, max, maxLabel, min, minLabel, series, width, x, yvals, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results, _results2;
      colors != null ? colors : colors = this.colors;
      this.histogramLegend = this.r.set();
      extrapadding = 20;
      height = Math.max(0.1 * (this.h - this.padding.bottom - this.padding.top), 50);
      width = Math.min(150, (this.w - this.padding.left - this.padding.right - extrapadding) / seriesNames.length);
      for (i = 0, _ref = seriesNames.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        series = seriesNames[i];
        data = (function() {
          _results = [];
          for (j = 0, _ref2 = this.ndata[series][series].length; (0 <= _ref2 ? j < _ref2 : j > _ref2); (0 <= _ref2 ? j += 1 : j -= 1)) {
            if (this.ndata[series][series][j] != null) {
              _results.push(this.ndata[series][series][j][1]);
            }
          }
          return _results;
        }.call(this));
        if (((_ref3 = this.bounds) != null ? _ref3[series] : void 0) != null) {
          _ref4 = this.bounds[series], min = _ref4[0], max = _ref4[1];
        } else {
          dataWithoutNulls = (function() {
            _ref5 = this.data[series];
            _results2 = [];
            for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
              x = _ref5[_i];
              if (x != null) {
                _results2.push(x);
              }
            }
            return _results2;
          }.call(this));
          _ref6 = [Math.min.apply(Math, dataWithoutNulls), Math.max.apply(Math, dataWithoutNulls)], min = _ref6[0], max = _ref6[1];
        }
        yvals = this.getYAxisVals(min, max, true);
        minLabel = yvals[0];
        maxLabel = yvals[yvals.length - 1];
        color = colors[series];
        this.histogramLegend.push(histogram = this.r.sai.prim.histogram(this.x + (i * width), this.y - this.padding.bottom, width * 0.8, height, data, minLabel, maxLabel, series, typeof color === 'object' ? [color.__LOW__, color.__HIGH__] : [color], 'white', this.opts.fromWhite));
        if (this.opts.interactive) {
          this.setupHistogramInteraction(histogram, series);
        }
      }
      this.histogramLegend.translate((this.w - this.padding.left - this.padding.right - this.histogramLegend.getBBox().width) / 2, 0);
      return this.padding.bottom += height + 5;
    };
    Chart.prototype.setupHistogramInteraction = function(histogram, series) {
      return null;
    };
    return Chart;
  }();
  Sai.LineChart = function() {
    function LineChart() {
      LineChart.__super__.constructor.apply(this, arguments);
    }
    __extends(LineChart, Sai.Chart);
    LineChart.prototype.nonNegativeGroups = function() {
      if (this.opts.stacked) {
        return ['all', 'left', 'right'];
      } else {
        return [];
      }
    };
    LineChart.prototype.dataGroups = function(data) {
      var groups, x, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _results, _results2;
      groups = LineChart.__super__.dataGroups.apply(this, arguments);
      if ((((_ref = this.opts.groups) != null ? _ref.left : void 0) != null) && (((_ref2 = this.opts.groups) != null ? _ref2.right : void 0) != null)) {
        groups.left = (function() {
          _ref3 = this.opts.groups.left;
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            x = _ref3[_i];
            if (this.caresAbout(x) && x in this.data) {
              _results.push(x);
            }
          }
          return _results;
        }.call(this));
        groups.right = (function() {
          _ref4 = this.opts.groups.right;
          _results2 = [];
          for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
            x = _ref4[_j];
            if (this.caresAbout(x) && x in this.data) {
              _results2.push(x);
            }
          }
          return _results2;
        }.call(this));
      }
      return groups;
    };
    LineChart.prototype.renderPlots = function() {
      var ndata, plotType, saxis, _ref, _ref2, _ref3, _ref4, _ref5;
      if (this.px == null) {
        this.setPlotCoords();
      }
      this.drawBG();
      this.drawLogo();
      saxis = 'right' in this.ndata;
      ndata = this.opts.stacked != null ? this.stackedNdata : this.ndata;
      plotType = this.opts.area ? Sai.AreaPlot : Sai.LinePlot;
      if (saxis) {
        if (((_ref = this.ndata.left) != null ? _ref['__YVALS__'][0] : void 0) < 0) {
          this.drawGuideline(0, 'left');
        }
        if (((_ref2 = this.ndata.right) != null ? _ref2['__YVALS__'][0] : void 0) < 0) {
          this.drawGuideline(0, 'right');
        }
      } else {
        if (this.ndata.all['__YVALS__'][0] < 0) {
          this.drawGuideline(0, 'all');
        }
      }
      this.plots = [];
      if (saxis) {
        if (ndata.left != null) {
          this.plots.push((new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['left'])).render(this.colors, (_ref3 = this.opts.lineWidth) != null ? _ref3 : 2, this.opts.stacked, this.getBaseline('left')));
        }
        if (ndata.right != null) {
          return this.plots.push((new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['right'])).render(this.colors, (_ref4 = this.opts.lineWidth) != null ? _ref4 : 2, this.opts.stacked, this.getBaseline('right')));
        }
      } else {
        return this.plots.push((new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['all'])).render(this.colors, (_ref5 = this.opts.lineWidth) != null ? _ref5 : 2, this.opts.stacked, this.getBaseline('all')));
      }
    };
    LineChart.prototype.renderFull = function() {
      var everything, moveDots, plot, saxis, series, _i, _len, _ref, _ref2, _ref3;
      this.drawTitle();
      this.setupInfoSpace();
      this.drawFootnote();
      this.drawLegend();
      saxis = 'right' in this.ndata;
      if (saxis) {
        this.addAxes(['left', 'right']);
      } else {
        this.addAxes(['all']);
      }
      this.renderPlots();
      this.plotSets = this.r.set();
      _ref = this.plots;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plot = _ref[_i];
        this.plotSets.push(plot.set);
      }
      this.dots = this.r.set();
      for (series in this.ndata['all']) {
        if (series !== '__YVALS__') {
          this.dots.push(this.r.circle(0, 0, 4).attr({
            'fill': (_ref2 = (_ref3 = this.colors) != null ? _ref3[series] : void 0) != null ? _ref2 : 'black'
          }).hide());
        }
      }
      everything = this.r.set().push(this.bg, this.plotSets, this.dots, this.logo, this.guidelines).mousemove(moveDots = __bind(function(event) {
        var i, idx, info, plot, pos, series, _i, _len, _ref, _ref2, _results, _results2;
        idx = this.getIndex(event);
        info = {};
        if (((_ref = this.data[this.__LABELS__]) != null ? _ref.length : void 0) > idx && idx >= 0) {
          info[this.__LABELS__] = this.data[this.__LABELS__][idx];
          for (series in this.ndata['all']) {
            if (this.data[series] != null) {
              info[series] = this.data[series][idx];
            }
          }
        }
        this.drawInfo(info);
        i = 0;
        _results = [];
        for (series in this.ndata['all']) {
          if (series !== '__YVALS__') {
            _results.push(function() {
              _ref2 = this.plots;
              _results2 = [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                plot = _ref2[_i];
                if (series in plot.dndata) {
                  pos = plot.dndata[series][idx];
                  if (pos != null) {
                    this.dots[i].attr({
                      cx: pos[0],
                      cy: pos[1]
                    }).show().toFront();
                  } else {
                    this.dots[i].hide();
                  }
                  _results2.push(i++);
                }
              }
              return _results2;
            }.call(this));
          }
        }
        return _results;
      }, this)).mouseout(__bind(function(event) {
        this.drawInfo({}, true);
        return this.dots.hide();
      }, this));
      if (this.opts.href) {
        everything.attr({
          href: this.opts.href,
          target: '_blank'
        });
      }
      return this;
    };
    return LineChart;
  }();
  Sai.StreamChart = function() {
    __extends(StreamChart, Sai.LineChart);
    function StreamChart(r, x, y, w, h, data, __LABELS__, opts) {
      this.r = r;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.__LABELS__ = __LABELS__;
      this.opts = opts;
      this.opts.stacked = true;
      StreamChart.__super__.constructor.apply(this, arguments);
    }
    StreamChart.prototype.getStackedMax = function(data, group) {
      var naive;
      naive = StreamChart.__super__.getStackedMax.apply(this, arguments);
      return naive / 2.0;
    };
    StreamChart.prototype.getStackedMin = function(data, group) {
      var naive, stackedMax;
      naive = StreamChart.__super__.getStackedMin.apply(this, arguments);
      stackedMax = this.getStackedMax(data, group);
      return naive - stackedMax;
    };
    StreamChart.prototype.normalize = function(data) {
      var group, groups, i, nh0, offset, point, series, stackedMin, topSeries, v, _i, _len, _ref, _ref2, _ref3, _results, _results2, _results3;
      StreamChart.__super__.normalize.apply(this, arguments);
      groups = this.dataGroups(this.data);
      (_ref = this.baselines) != null ? _ref : this.baselines = {};
      _results = [];
      for (group in this.stackedNdata) {
        nh0 = this.normalizedHeight(0, group != null ? group : 'all');
        stackedMin = this.normalizedHeight(this.getStackedMin(data, groups[group]), group);
        this.baselines[group] = [];
        this.ndata[group]['__YVALS__'] = (function() {
          _ref2 = this.ndata[group]['__YVALS__'];
          _results2 = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            v = _ref2[_i];
            _results2.push(Math.abs(v));
          }
          return _results2;
        }.call(this));
        /*
        # Real stream graph, but doesn't match the yvals...
        n = 0
        for series of @stackedNdata[group]
          topSeries = series
          n++

        for i in [0...@stackedNdata[group][series].length]
          #offset = (@stackedNdata[group][topSeries][i][1] - nh0) / 2
          offset = 0
          j = 0
          for series of @stackedNdata[group]
            j++
            offset += (n - j + 1) * (@stackedNdata[group][series][i][1] - nh0)
          offset /= n + 1
          for series of @stackedNdata[group]
            point = @stackedNdata[group][series][i]
            continue unless point?
            point[1] -= offset
          @baselines[group].push([point[0], nh0 - offset])
        */
        for (series in this.stackedNdata[group]) {
          topSeries = series;
        }
        _results.push(function() {
          _results3 = [];
          for (i = 0, _ref3 = this.stackedNdata[group][series].length; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
            offset = (this.stackedNdata[group][topSeries][i][1] - nh0) / 2;
            for (series in this.stackedNdata[group]) {
              point = this.stackedNdata[group][series][i];
              if (point == null) {
                continue;
              }
              point[1] -= offset;
            }
            _results3.push(this.baselines[group].push([point[0], nh0 - offset]));
          }
          return _results3;
        }.call(this));
      }
      return _results;
    };
    StreamChart.prototype.addAxes = function(groups, titles) {
      titles != null ? titles : titles = {};
      if (!('left' in titles)) {
        titles['left'] = 'magnitude';
      }
      return StreamChart.__super__.addAxes.call(this, groups, titles);
    };
    StreamChart.prototype.getBaseline = function(group) {
      return this.baselines[group];
    };
    return StreamChart;
  }();
  Sai.Sparkline = function() {
    function Sparkline() {
      Sparkline.__super__.constructor.apply(this, arguments);
    }
    __extends(Sparkline, Sai.Chart);
    Sparkline.prototype.dataGroups = function(data) {
      return {
        'data': ['data']
      };
    };
    Sparkline.prototype.renderFull = function() {
      this.drawBG();
      this.plots = this.r.set();
      this.plots.push((new Sai.LinePlot(this.r, this.x, this.y, this.w, this.h, this.ndata['data'])).render({
        data: this.colors && this.colors[series] || 'black'
      }, 1).set);
      return this;
    };
    return Sparkline;
  }();
  Sai.BarChart = function() {
    function BarChart() {
      BarChart.__super__.constructor.apply(this, arguments);
    }
    __extends(BarChart, Sai.Chart);
    BarChart.prototype.getMin = function(data, group) {
      return Math.min(BarChart.__super__.getMin.apply(this, arguments), 0);
    };
    BarChart.prototype.groupsToNullPad = function() {
      var group, _results;
      _results = [];
      for (group in this.dataGroups()) {
        _results.push(group);
      }
      return _results;
    };
    BarChart.prototype.tooMuchData = function() {
      var barsToDraw, maxBars, series;
      maxBars = this.w / 3;
      barsToDraw = 0;
      for (series in this.data) {
        if (series !== this.__LABELS__) {
          barsToDraw += this.data[series].length;
          if (this.opts.stacked) {
            break;
          }
        }
      }
      return barsToDraw > maxBars;
    };
    BarChart.prototype.renderPlots = function() {
      var data, ndata, rawdata, series, yval, _i, _len, _ref;
      if (this.px == null) {
        this.setPlotCoords();
      }
      this.drawLogo();
      this.drawBG();
      if (this.tooMuchData()) {
        this.showError('Sorry, the chart isn\'t wide enough to plot this much data.\n \nPossible solutions include downsampling your data\n (e.g. weekly instead of daily) or using a line chart');
        return this;
      }
      if ('all' in this.ndata) {
        this.guidelines = this.r.set();
        _ref = this.ndata['all']['__YVALS__'].slice(1, this.ndata['all']['__YVALS__'].length - 1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          yval = _ref[_i];
          this.drawGuideline(yval);
        }
      }
      this.plots = this.r.set();
      data = {};
      rawdata = {};
      rawdata[this.__LABELS__] = this.data[this.__LABELS__];
      ndata = this.opts.stacked != null ? this.stackedNdata : this.ndata;
      for (series in ndata['all']) {
        if (!(series.match('^__') || series === this.__LABELS__)) {
          data[series] = ndata['all'][series];
          rawdata[series] = this.data[series];
        }
      }
      return this.plots.push((new Sai.BarPlot(this.r, this.px, this.py, this.pw, this.ph, data, rawdata)).render(this.opts.stacked != null, this.normalizedHeight(0, 'all'), this.colors, this.opts.interactive && !this.opts.simple, this.drawInfo, this.__LABELS__).set);
    };
    BarChart.prototype.renderFull = function() {
      var everything;
      this.drawTitle();
      this.setupInfoSpace();
      this.drawFootnote();
      this.drawLegend();
      this.addAxes(['all']);
      this.renderPlots();
      everything = this.r.set().push(this.plots, this.bg, this.logo, this.guidelines);
      if (this.opts.href) {
        everything.attr({
          href: this.opts.href,
          target: '_blank'
        });
      }
      return this;
    };
    return BarChart;
  }();
  Sai.StockChart = function() {
    function StockChart() {
      StockChart.__super__.constructor.apply(this, arguments);
    }
    __extends(StockChart, Sai.Chart);
    StockChart.prototype.semanticRenamePatterns = {
      'open': /^open$/i,
      'close': /^close$/i,
      'high': /^high$/i,
      'low': /^low$/i,
      'volume': /^vol(ume)?$/i
    };
    StockChart.prototype.groupsToNullPad = function() {
      return ['prices', 'volume', '__META__'];
    };
    StockChart.prototype.dataGroups = function(data) {
      var groups, seriesName, volume_name, _ref, _ref2;
      groups = {
        '__META__': [this.__LABELS__]
      };
      volume_name = (_ref = this.semanticRenames['volume']) != null ? _ref : 'volume';
      if (volume_name in this.data) {
        groups['volume'] = [volume_name];
      }
      for (seriesName in data) {
        if (this.caresAbout(seriesName) && (seriesName !== this.__LABELS__ && seriesName !== volume_name)) {
          (_ref2 = groups.prices) != null ? _ref2 : groups.prices = [];
          groups.prices.push(seriesName);
        }
      }
      return groups;
    };
    StockChart.prototype.nonNegativeGroups = function() {
      return ['volume'];
    };
    StockChart.prototype.renderPlots = function() {
      var avgNdata, close_name, high_name, i, low_name, open_name, p, rawdata, series, vol, volume_name, _base, _base2, _base3, _base4, _ref, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.px == null) {
        this.setPlotCoords();
      }
      open_name = (_ref = this.semanticRenames['open']) != null ? _ref : 'open';
      close_name = (_ref2 = this.semanticRenames['close']) != null ? _ref2 : 'close';
      high_name = (_ref3 = this.semanticRenames['high']) != null ? _ref3 : 'high';
      low_name = (_ref4 = this.semanticRenames['low']) != null ? _ref4 : 'low';
      volume_name = (_ref5 = this.semanticRenames['volume']) != null ? _ref5 : 'volume';
      (_ref6 = this.colors) != null ? _ref6 : this.colors = {};
      (_ref7 = (_base = this.colors)['up']) != null ? _ref7 : _base['up'] = 'black';
      (_ref8 = (_base2 = this.colors)['down']) != null ? _ref8 : _base2['down'] = 'red';
      (_ref9 = (_base3 = this.colors)['vol_up']) != null ? _ref9 : _base3['vol_up'] = '#666666';
      (_ref10 = (_base4 = this.colors)['vol_down']) != null ? _ref10 : _base4['vol_down'] = '#cc6666';
      this.drawLogo();
      this.drawBG();
      if (!((this.ndata.prices != null) && open_name in this.ndata.prices && close_name in this.ndata.prices && high_name in this.ndata.prices && low_name in this.ndata.prices)) {
        this.showError("This chart requires data series named\nopen, close, high, and low.\n \nOnce you add series with these names, the chart will display.");
        return;
      }
      if (this.ndata.prices['__YVALS__'][0] < 0) {
        this.drawGuideline(0, 'prices');
      }
      this.plots = this.r.set();
      vol = {
        'up': [],
        'down': []
      };
      rawdata = {};
      for (p in this.ndata['prices']) {
        if (!(p.match('^__') || p === this.__LABELS__)) {
          rawdata[p] = this.data[p];
        }
      }
      if (this.data[volume_name] != null) {
        rawdata['vol'] = this.data[volume_name];
      }
      if ('volume' in this.ndata) {
        for (i = 0, _ref11 = this.ndata['volume'][volume_name].length; (0 <= _ref11 ? i < _ref11 : i > _ref11); (0 <= _ref11 ? i += 1 : i -= 1)) {
          if (this.ndata['volume'][volume_name][i] !== null) {
            if (i && this.ndata['prices'][close_name][i - 1] && (this.ndata['prices'][close_name][i][1] < this.ndata['prices'][close_name][i - 1][1])) {
              vol.down.push(this.ndata['volume'][volume_name][i]);
              vol.up.push([this.ndata['volume'][volume_name][i][0], 0]);
            } else {
              vol.up.push(this.ndata['volume'][volume_name][i]);
              vol.down.push([this.ndata['volume'][volume_name][i][0], 0]);
            }
          } else {
            vol.up.push([0, 0]);
            vol.down.push([0, 0]);
          }
        }
        this.plots.push((new Sai.BarPlot(this.r, this.px, this.py, this.pw, this.ph * 0.2, vol, rawdata)).render(true, this.normalizedHeight(0, volume_name), {
          'up': this.colors['vol_up'],
          'down': this.colors['vol_down']
        }).set);
      }
      this.plots.push((new Sai.CandlestickPlot(this.r, this.px, this.py, this.pw, this.ph, {
        'open': this.ndata['prices'][open_name],
        'close': this.ndata['prices'][close_name],
        'high': this.ndata['prices'][high_name],
        'low': this.ndata['prices'][low_name]
      }, rawdata)).render(this.colors, Math.min(5, (this.pw / this.ndata['prices'][open_name].length) - 2)).set);
      avgNdata = {};
      for (series in this.ndata['prices']) {
        if (!((series === open_name || series === close_name || series === high_name || series === low_name) || series.match("^__") || series === this.__LABELS__)) {
          avgNdata[series] = this.ndata['prices'][series];
        }
      }
      return this.plots.push((new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, avgNdata)).render(this.colors).set);
    };
    StockChart.prototype.renderFull = function() {
      var avgColors, close_name, everything, glow_width, high_name, low_name, moveGlow, open_name, series, shouldDrawLegend, volume_name, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.drawTitle();
      this.setupInfoSpace();
      this.drawFootnote();
      open_name = (_ref = this.semanticRenames['open']) != null ? _ref : 'open';
      close_name = (_ref2 = this.semanticRenames['close']) != null ? _ref2 : 'close';
      high_name = (_ref3 = this.semanticRenames['high']) != null ? _ref3 : 'high';
      low_name = (_ref4 = this.semanticRenames['low']) != null ? _ref4 : 'low';
      volume_name = (_ref5 = this.semanticRenames['volume']) != null ? _ref5 : 'volume';
      avgColors = {};
      shouldDrawLegend = false;
      for (series in this.ndata['prices']) {
        if ((series !== open_name && series !== close_name && series !== high_name && series !== low_name) && !(series.match('^__') || series === this.__LABELS__)) {
          avgColors[series] = ((_ref6 = this.colors) != null ? _ref6[series] : void 0) || 'black';
          shouldDrawLegend = true;
        }
      }
      if (shouldDrawLegend) {
        this.drawLegend(avgColors);
      }
      this.addAxes(['prices']);
      this.renderPlots();
      glow_width = this.pw / (this.data[this.__LABELS__].length - 1);
      this.glow = this.r.rect(this.px - (glow_width / 2), this.py - this.ph, glow_width, this.ph).attr({
        fill: "0-" + this.opts.bgcolor + "-#DDAA99-" + this.opts.bgcolor,
        'stroke-width': 0,
        'stroke-opacity': 0
      }).toBack().hide();
      this.bg.toBack();
      everything = this.r.set().push(this.bg, this.plots, this.logo, this.glow, this.guidelines).mousemove(moveGlow = __bind(function(event) {
        var idx, info, notNull, series, _ref, _ref2;
        idx = this.getIndex(event);
        info = {};
        if (this.data[this.__LABELS__][idx] != null) {
          info[this.__LABELS__] = this.data[this.__LABELS__][idx];
        }
        notNull = false;
        for (series in this.ndata['prices']) {
          if (!(series.match('^__') || series === this.__LABELS__)) {
            if (((_ref = this.data[series]) != null ? _ref[idx] : void 0) != null) {
              info[series] = this.data[series][idx];
              notNull = true;
            }
          }
        }
        if (((_ref2 = this.data[volume_name]) != null ? _ref2[idx] : void 0) != null) {
          info[volume_name] = this.data[volume_name][idx];
          notNull = true;
        }
        this.drawInfo(info);
        if (notNull) {
          return this.glow.attr({
            x: this.px + (glow_width * (idx - 0.5))
          }).show();
        }
      }, this)).mouseout(__bind(function(event) {
        this.drawInfo({}, true);
        return this.glow.hide();
      }, this));
      return this;
    };
    return StockChart;
  }();
  Sai.GeoChart = function() {
    function GeoChart() {
      this.renderPlots = __bind(this.renderPlots, this);;      GeoChart.__super__.constructor.apply(this, arguments);
    }
    __extends(GeoChart, Sai.Chart);
    GeoChart.prototype.plotType = Sai.GeoPlot;
    GeoChart.prototype.interactiveHistogram = true;
    GeoChart.prototype.getMax = function(data, series) {
      return Math.max.apply(Math, data);
    };
    GeoChart.prototype.getMin = function(data, series) {
      return Math.min.apply(Math, data);
    };
    GeoChart.prototype.normalize = function(data) {
      var d, dataWithoutNulls, i, max, maxes, min, mins, overallMax, overallMin, series, _i, _len, _ref, _ref2, _results, _results2;
      this.ndata = {};
      this.bounds = {};
      maxes = {};
      mins = {};
      for (series in data) {
        if (series.match('^__') || series === this.__LABELS__) {
          continue;
        }
        if (data[series] == null) {
          continue;
        }
        _ref = data[series];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          d = _ref[_i];
          if (d != null) {
            dataWithoutNulls = d;
          }
        }
        maxes[series] = this.getMax(dataWithoutNulls, series);
        if (!(typeof overallMax != "undefined" && overallMax !== null) || maxes[series] > overallMax) {
          overallMax = maxes[series];
        }
        mins[series] = this.getMin(dataWithoutNulls, series);
        if (!(typeof overallMin != "undefined" && overallMin !== null) || mins[series] < overallMin) {
          overallMin = mins[series];
        }
      }
      _results = [];
      for (series in data) {
        if (series.match('^__') || series === this.__LABELS__) {
          continue;
        }
        if (data[series] == null) {
          continue;
        }
        if (this.opts.groupedNormalization) {
          max = overallMax;
          min = overallMin;
        } else {
          max = maxes[series];
          min = mins[series];
        }
        this.bounds[series] = [min, max];
        this.ndata[series] = {};
        _results.push(this.ndata[series][series] = (function() {
          _results2 = [];
          for (i = 0, _ref2 = data[series].length; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
            _results2.push((data[series][i] != null ? [i / (data[series].length - 1), (data[series][i] - min) / (max - min)] : null));
          }
          return _results2;
        }()));
      }
      return _results;
    };
    GeoChart.prototype.dataGroups = function(data) {
      var groups, seriesName, _results;
      groups = {
        '__META__': function() {
          _results = [];
          for (seriesName in data) {
            if (seriesName.match("^__") || seriesName === this.__LABELS__) {
              _results.push(seriesName);
            }
          }
          return _results;
        }.call(this)
      };
      for (seriesName in data) {
        if (!(seriesName.match("^__") || seriesName === this.__LABELS__)) {
          groups[seriesName] = [seriesName];
        }
      }
      return groups;
    };
    GeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
      return histogram.click(__bind(function() {
        return this.renderPlots(series);
      }, this)).hover((__bind(function(set) {
        return __bind(function() {
          set.attr({
            'fill-opacity': 0.75
          });
          return this.drawInfo({
            'Click to display on map': series
          });
        }, this);
      }, this))(histogram), (__bind(function(set) {
        return __bind(function() {
          set.attr({
            'fill-opacity': 1.0
          });
          return this.drawInfo();
        }, this);
      }, this))(histogram));
    };
    GeoChart.prototype.renderPlots = function(mainSeries) {
      var ndata, series, _ref, _ref2, _ref3;
      if (this.px == null) {
        this.setPlotCoords();
      }
      if ((_ref = this.bg) != null) {
        _ref.remove();
      }
      if ((_ref2 = this.logo) != null) {
        _ref2.remove();
      }
      if ((_ref3 = this.geoPlot) != null) {
        _ref3.set.remove();
      }
      this.drawBG();
      this.drawLogo();
      ndata = {};
      for (series in this.ndata) {
        ndata[series] = this.ndata[series][series];
      }
      this.geoPlot = (new this.plotType(this.r, this.px, this.py, this.pw, this.ph, ndata, this.data, {
        fromWhite: this.opts.fromWhite
      })).render(this.colors || {}, this.data['__MAP__'], this.__LABELS__, mainSeries != null ? mainSeries : this.data['__DEFAULT__'], this.opts.bgcolor, this.opts.interactive && !this.opts.simple, this.drawInfo);
      return this;
    };
    GeoChart.prototype.default_info = function() {
      return {
        '': this.opts.interactive ? 'Click histogram below to change map display' : ''
      };
    };
    GeoChart.prototype.renderFull = function() {
      var everything, series, _results;
      this.drawTitle();
      this.setupInfoSpace();
      this.drawFootnote();
      this.drawHistogramLegend(function() {
        _results = [];
        for (series in this.data) {
          if (!(series.match('^__') || series === this.__LABELS__)) {
            _results.push(series);
          }
        }
        return _results;
      }.call(this));
      this.setPlotCoords();
      this.drawInfo();
      this.renderPlots();
      everything = this.r.set().push(this.geoPlot.set, this.bg, this.logo, this.info, this.footnote);
      if (this.opts.href) {
        everything.attr({
          href: this.opts.href,
          target: '_blank'
        });
      }
      return this;
    };
    return GeoChart;
  }();
  Sai.ChromaticGeoChart = function() {
    function ChromaticGeoChart() {
      ChromaticGeoChart.__super__.constructor.apply(this, arguments);
    }
    __extends(ChromaticGeoChart, Sai.GeoChart);
    ChromaticGeoChart.prototype.plotType = Sai.ChromaticGeoPlot;
    ChromaticGeoChart.prototype.interactiveHistogram = false;
    ChromaticGeoChart.prototype.default_info = function() {
      return {};
    };
    ChromaticGeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
      return false;
    };
    return ChromaticGeoChart;
  }();
  Sai.ScatterChart = function() {
    function ScatterChart() {
      ScatterChart.__super__.constructor.apply(this, arguments);
    }
    __extends(ScatterChart, Sai.Chart);
    ScatterChart.prototype.dataGroups = function(data) {
      var groups, seriesName, _results;
      groups = {
        '__META__': function() {
          _results = [];
          for (seriesName in data) {
            if (seriesName.match("^__") || seriesName === this.__LABELS__) {
              _results.push(seriesName);
            }
          }
          return _results;
        }.call(this)
      };
      for (seriesName in data) {
        if (!(seriesName.match("^__") || seriesName === this.__LABELS__)) {
          groups[seriesName] = [seriesName];
        }
      }
      return groups;
    };
    ScatterChart.prototype.renderPlots = function() {
      var colors, ndata, radii, series, stroke_colors, stroke_opacity, _ref, _ref2, _ref3, _ref4, _ref5;
      if (this.px == null) {
        this.setPlotCoords();
      }
      colors = (_ref = (_ref2 = this.opts.colors) != null ? _ref2 : this.colors) != null ? _ref : ['black', 'white'];
      stroke_opacity = (_ref3 = this.opts.stroke_opacity) != null ? _ref3 : [0, 1];
      stroke_colors = (_ref4 = this.opts.stroke_colors) != null ? _ref4 : ['black', 'black'];
      radii = (_ref5 = this.opts.radius) != null ? _ref5 : [4, 12];
      this.drawLogo();
      this.drawBG();
      ndata = {};
      for (series in this.ndata) {
        ndata[series] = this.ndata[series][series];
      }
      this.plots = this.r.set();
      this.plots.push((new Sai.ScatterPlot(this.r, this.px, this.py, this.pw, this.ph, ndata, this.data)).render(this.opts.mappings, colors, radii, stroke_opacity, stroke_colors, this.opts.interactive && !this.opts.simple, this.drawInfo).set);
      return this;
    };
    ScatterChart.prototype.renderFull = function() {
      var c, colors, draw_legend, everything, histogramColors, histogramSeries, radii, stroke_colors, stroke_opacity, _ref, _ref2, _ref3, _ref4, _ref5;
      this.drawTitle();
      this.setupInfoSpace();
      this.drawFootnote();
      colors = (_ref = (_ref2 = this.opts.colors) != null ? _ref2 : this.colors) != null ? _ref : ['black', 'white'];
      stroke_opacity = (_ref3 = this.opts.stroke_opacity) != null ? _ref3 : [0, 1];
      stroke_colors = (_ref4 = this.opts.stroke_colors) != null ? _ref4 : ['black', 'black'];
      radii = (_ref5 = this.opts.radius) != null ? _ref5 : [4, 12];
      histogramSeries = [];
      histogramColors = {};
      if (colors instanceof Array) {
        histogramSeries.push(this.opts.mappings.color);
        histogramColors[this.opts.mappings.color] = {
          __LOW__: colors[0],
          __HIGH__: colors[1]
        };
      } else {
        typeof legend_colors != "undefined" && legend_colors !== null ? legend_colors : legend_colors = {};
        draw_legend = true;
        for (c in colors) {
          legend_colors[c] = colors[c];
        }
      }
      if (stroke_colors instanceof Array) {
        0;
      } else {
        typeof legend_colors != "undefined" && legend_colors !== null ? legend_colors : legend_colors = {};
        draw_legend = true;
        for (c in colors) {
          legend_colors[c] = stroke_colors[c];
        }
      }
      /*
      if @opts.mappings.stroke_opacity
        histogramSeries.push(@opts.mappings.stroke_opacity)
        so_colors = [
          Sai.util.colerp(stroke_colors[0], stroke_colors[1], stroke_opacity[0]),
          Sai.util.colerp(stroke_colors[0], stroke_colors[1], stroke_opacity[1]),
        ]
        histogramColors[@opts.mappings.stroke_opacity] = {__LOW__: so_colors[0], __HIGH__: so_colors[1]}
      */
      if (histogramSeries.length) {
        this.drawHistogramLegend(histogramSeries, histogramColors);
      }
      if (draw_legend) {
        this.drawLegend(colors);
      }
      this.__LABELS__ = '__XVALS__';
      this.data.__XVALS__ = this.ndata[this.opts.mappings.x]['__YVALS__'];
      this.addAxes([this.opts.mappings.y], {
        left: this.opts.mappings.y,
        bottom: this.opts.mappings.x
      });
      this.renderPlots();
      everything = this.r.set().push(this.plots, this.bg, this.logo, this.info, this.footnote, this.histogramLegend, this.legend);
      if (this.opts.href) {
        everything.attr({
          href: this.opts.href,
          target: '_blank'
        });
      }
      return this;
    };
    return ScatterChart;
  }();
}).call(this);
