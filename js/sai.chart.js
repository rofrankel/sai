(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Sai.Chart = function(_arg, _arg2, _arg3, _arg4, _arg5, data, _arg6, _arg7) {
    var _this, init_padding;
    this.opts = _arg7;
    this.__LABELS__ = _arg6;
    this.h = _arg5;
    this.w = _arg4;
    this.y = _arg3;
    this.x = _arg2;
    this.r = _arg;
    _this = this;
    this.drawInfo = function(){ return Sai.Chart.prototype.drawInfo.apply(_this, arguments); };
    this.opts = (typeof this.opts !== "undefined" && this.opts !== null) ? this.opts : {};
    this.opts.bgcolor = (typeof this.opts.bgcolor !== "undefined" && this.opts.bgcolor !== null) ? this.opts.bgcolor : 'white';
    this.setData(data);
    init_padding = this.opts.simple ? 0 : 5;
    this.padding = {
      left: init_padding,
      right: init_padding,
      top: init_padding,
      bottom: init_padding
    };
    return this;
  };
  Sai.Chart.prototype.groupsToNullPad = function() {
    return [];
  };
  Sai.Chart.prototype.nonNegativeGroups = function() {
    return [];
  };
  Sai.Chart.prototype.nextSeriesSuffix = function() {
    var _ref;
    this.suffixCtr = ((typeof (_ref = this.suffixCtr) !== "undefined" && _ref !== null) ? _ref : 0) + 1;
    return ("[" + (this.suffixCtr) + "]");
  };
  Sai.Chart.prototype.fixSeriesName = function(seriesName) {
    return seriesName + (seriesName.match(/^\s+$/) ? this.nextSeriesSuffix() : '');
  };
  Sai.Chart.prototype.setSemanticRename = function(seriesName) {
    var _i, _ref, _result, rename;
    if (!(typeof (_ref = this.semanticRenamePatterns) !== "undefined" && _ref !== null)) {
      return null;
    }
    this.semanticRenames = (typeof this.semanticRenames !== "undefined" && this.semanticRenames !== null) ? this.semanticRenames : {};
    _result = []; _ref = this.semanticRenamePatterns;
    for (rename in _ref) {
      if (!__hasProp.call(_ref, rename)) continue;
      _i = _ref[rename];
      _result.push(seriesName.match(this.semanticRenamePatterns[rename]) ? (this.semanticRenames[rename] = seriesName) : null);
    }
    return _result;
  };
  Sai.Chart.prototype.getBaseline = function(group) {
    var nh0;
    nh0 = this.normalizedHeight(0, (typeof group !== "undefined" && group !== null) ? group : 'all');
    return [[0, nh0], [1, nh0]];
  };
  Sai.Chart.prototype.setData = function(data) {
    var _i, _j, _len, _len2, _ref, _ref2, _ref3, _result, d, empty, group, groups, i, nngroups, pd, series, seriesName;
    this.data = {};
    this.renames = {};
    empty = function(obj) {
      var _i, _ref, e;
      _ref = obj;
      for (e in _ref) {
        if (!__hasProp.call(_ref, e)) continue;
        _i = _ref[e];
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
      return null;
    }
    _ref = data;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
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
            _result = []; _ref2 = data[series];
            for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
              d = _ref2[_j];
              _result.push(String(d));
            }
            return _result;
          })();
        } else {
          this.data[seriesName] = (function() {
            _result = []; _ref2 = data[series];
            for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
              d = _ref2[_j];
              _result.push(typeof d === 'string' && d.match(/^( +)?[+-]?[\d,]+(\.\d+)?( +)?$/) && !isNaN(pd = parseFloat(d.replace(/,/g, ''))) ? pd : d);
            }
            return _result;
          })();
        }
      } else {
        this.data[seriesName] = data[series];
      }
    }
    groups = this.dataGroups(this.data);
    nngroups = this.nonNegativeGroups();
    _ref = groups;
    for (group in _ref) {
      if (!__hasProp.call(_ref, group)) continue;
      _i = _ref[group];
      if (groups[group].length > 0) {
        if ((function(){ for (var _j=0, _len=nngroups.length; _j<_len; _j++) { if (nngroups[_j] === group) return true; } return false; }).call(this)) {
          _ref2 = groups[group];
          for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
            series = _ref2[_j];
            if (typeof (_ref3 = this.data[series]) !== "undefined" && _ref3 !== null) {
              _ref3 = this.data[series].length;
              for (i = 0; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
                if (this.data[series][i] < 0) {
                  this.data[series][i] *= -1;
                }
              }
            }
          }
        }
      }
    }
    _ref = this.groupsToNullPad();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      if (group in groups) {
        _ref2 = groups[group];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          series = _ref2[_j];
          this.nullPad(series);
        }
      }
    }
    return this.normalize(this.data);
  };
  Sai.Chart.prototype.nullPad = function(seriesName) {
    return seriesName in this.data ? (this.data[seriesName] = [null].concat(this.data[seriesName].concat([null]))) : null;
  };
  Sai.Chart.prototype.caresAbout = function(seriesName) {
    return !(seriesName.match("^__") || seriesName === this.__LABELS__);
  };
  Sai.Chart.prototype.dataGroups = function(data) {
    var _i, _ref, _result, seriesName;
    return {
      'all': (function() {
        _result = []; _ref = data;
        for (seriesName in _ref) {
          if (!__hasProp.call(_ref, seriesName)) continue;
          _i = _ref[seriesName];
          if (this.caresAbout(seriesName)) {
            _result.push(seriesName);
          }
        }
        return _result;
      }).call(this),
      '__META__': (function() {
        _result = []; _ref = data;
        for (seriesName in _ref) {
          if (!__hasProp.call(_ref, seriesName)) continue;
          _i = _ref[seriesName];
          if (seriesName.match("^__") || seriesName === this.__LABELS__) {
            _result.push(seriesName);
          }
        }
        return _result;
      }).call(this)
    };
  };
  Sai.Chart.prototype.getYAxisVals = function(min, max, nopad) {
    var bottom, factor, i, mag, rawmag, step, top, vals;
    if (!(typeof min === "number" && typeof max === "number")) {
      return [min, max];
    }
    if (min === max) {
      return [0, max, max * 2];
    }
    nopad = (typeof nopad !== "undefined" && nopad !== null) ? nopad : false;
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
    bottom = Sai.util.round(min - (nopad ? (step / 2.1) : (step / 1.75)), step);
    if ((bottom < 0) && (0 <= min)) {
      bottom = 0;
    }
    top = Sai.util.round(max + (nopad ? (step / 2.1) : (step / 1.75)), step);
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
  Sai.Chart.prototype.getMax = function(data, group) {
    var _i, _j, _len, _len2, _ref, _ref2, _result, _result2, d, series;
    return Math.max.apply(Math, (function() {
      _result = []; _ref = group;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        series = _ref[_i];
        if (typeof (_ref2 = data[series]) !== "undefined" && _ref2 !== null) {
          _result.push(Math.max.apply(Math, (function() {
            _result2 = []; _ref2 = data[series];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              d = _ref2[_j];
              if ((typeof d !== "undefined" && d !== null) && typeof d === "number") {
                _result2.push(d);
              }
            }
            return _result2;
          })()));
        }
      }
      return _result;
    })());
  };
  Sai.Chart.prototype.getMin = function(data, group) {
    var _i, _j, _len, _len2, _ref, _ref2, _result, _result2, d, series;
    return Math.min.apply(Math, (function() {
      _result = []; _ref = group;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        series = _ref[_i];
        if (typeof (_ref2 = data[series]) !== "undefined" && _ref2 !== null) {
          _result.push(Math.min.apply(Math, (function() {
            _result2 = []; _ref2 = data[series];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              d = _ref2[_j];
              if ((typeof d !== "undefined" && d !== null) && typeof d === "number") {
                _result2.push(d);
              }
            }
            return _result2;
          })()));
        }
      }
      return _result;
    })());
  };
  Sai.Chart.prototype.getStackedMax = function(data, group) {
    var _i, _len, _ref, _ref2, _ref3, _result, _result2, i, series;
    this.stackedMax = (typeof this.stackedMax !== "undefined" && this.stackedMax !== null) ? this.stackedMax : {};
    this.stackedMax[group] = (typeof (_ref = this.stackedMax[group]) !== "undefined" && _ref !== null) ? _ref : Math.max.apply(Math, (function() {
      _result = []; _ref2 = data[this.__LABELS__].length;
      for (i = 0; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
        _result.push(Sai.util.sumArray((function() {
          _result2 = []; _ref3 = group;
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            series = _ref3[_i];
            if (series !== this.__LABELS__ && (data[series][i] >= 0)) {
              _result2.push(data[series][i]);
            }
          }
          return _result2;
        }).call(this)));
      }
      return _result;
    }).call(this));
    return this.stackedMax[group];
  };
  Sai.Chart.prototype.getStackedMin = function(data, group) {
    var _i, _len, _ref, _ref2, _ref3, _result, _result2, i, series;
    this.stackedMin = (typeof this.stackedMin !== "undefined" && this.stackedMin !== null) ? this.stackedMin : {};
    this.stackedMin[group] = (typeof (_ref = this.stackedMin[group]) !== "undefined" && _ref !== null) ? _ref : Math.min.apply(Math, (function() {
      _result = []; _ref2 = data[this.__LABELS__].length;
      for (i = 0; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
        _result.push(Sai.util.sumArray((function() {
          _result2 = []; _ref3 = group;
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            series = _ref3[_i];
            if (series !== this.__LABELS__ && data[series][i] < 0) {
              _result2.push(data[series][i]);
            }
          }
          return _result2;
        }).call(this)));
      }
      return _result;
    }).call(this));
    return this.stackedMin[group];
  };
  Sai.Chart.prototype.normalize = function(data) {
    var _i, _j, _k, _len, _ref, _ref2, _ref3, _ref4, _result, _result2, all, baseline, baselines, bli, empty, group, groups, i, max, maxf, min, minf, norm, norm0, nval, series, stackedPoint, yvals;
    groups = this.dataGroups(data);
    this.ndata = {};
    if (typeof (_ref = this.opts.stacked) !== "undefined" && _ref !== null) {
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
      var _i, _len, _ref2, e;
      _ref2 = a;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        e = _ref2[_i];
        if (!f(e)) {
          return false;
        }
      }
      return true;
    };
    empty = function(a) {
      var _i, _len, _ref2, e;
      _ref2 = a;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        e = _ref2[_i];
        if (typeof e === 'number') {
          return false;
        }
      }
      return true;
    };
    _result = []; _ref = groups;
    for (_j in _ref) {
      if (!__hasProp.call(_ref, _j)) continue;
      var group = _j;
      var _i = _ref[_j];
      if (group.match('^__') || Sai.util.sumArray((function() {
        _result2 = []; _ref2 = groups[group];
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          series = _ref2[_k];
          _result2.push(this.data[series].length);
        }
        return _result2;
      }).call(this)) === 0 || all(empty, (function() {
        _result2 = []; _ref2 = groups[group];
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          series = _ref2[_k];
          _result2.push(this.data[series]);
        }
        return _result2;
      }).call(this))) {
        continue;
      }
      this.ndata[group] = {};
      if (typeof (_ref2 = this.opts.stacked) !== "undefined" && _ref2 !== null) {
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
      _ref2 = groups[group];
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        series = _ref2[_k];
        if (!(typeof (_ref3 = data[series]) !== "undefined" && _ref3 !== null)) {
          continue;
        }
        this.ndata[group][series] = (function() {
          _result2 = []; _ref3 = data[series].length;
          for (i = 0; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
            _result2.push((typeof (_ref4 = data[series][i]) !== "undefined" && _ref4 !== null) && (nval = norm(data[series][i], min, max)) !== null ? [i / (data[series].length - 1 || 1), nval] : null);
          }
          return _result2;
        })();
        if (typeof (_ref3 = this.opts.stacked) !== "undefined" && _ref3 !== null) {
          norm0 = norm(0, min, max);
          this.stackedNdata[group][series] = [];
          _ref3 = data[series].length;
          for (i = 0; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
            bli = (typeof (_ref4 = data[series][i]) !== "undefined" && _ref4 !== null) && data[series][i] < 0 ? 0 : 1;
            baselines[i] = (typeof baselines[i] !== "undefined" && baselines[i] !== null) ? baselines[i] : [norm0, norm0];
            baseline = baselines[i][bli];
            stackedPoint = [i / (data[series].length - 1 || 1), (((typeof (_ref4 = norm(data[series][i], min, max)) !== "undefined" && _ref4 !== null) ? _ref4 : norm0) - norm0) + baseline];
            this.stackedNdata[group][series].push(stackedPoint);
            if (stackedPoint !== null) {
              baselines[i][bli] = stackedPoint[1];
            }
          }
        }
      }
    }
    return _result;
  };
  Sai.Chart.prototype.addAxes = function(groups, titles) {
    var LINE_HEIGHT, _ref, _vaxis, doLeftAxis, doRightAxis, haxis_height, hbb, hlen, i, tmptext, vaxis2_width, vaxis_width, vbbw, vlen, vrbbw;
    LINE_HEIGHT = 10;
    this.axisWidth = 1.5;
    this.padding.top += 5;
    for (i = this.data[this.__LABELS__].length - 1; (this.data[this.__LABELS__].length - 1 <= 0 ? i <= 0 : i >= 0); (this.data[this.__LABELS__].length - 1 <= 0 ? i += 1 : i -= 1)) {
      if (typeof (_ref = this.data[this.__LABELS__][i]) !== "undefined" && _ref !== null) {
        tmptext = this.r.text(0, 0, Sai.util.prettystr(this.data[this.__LABELS__][i]));
        this.padding.right += tmptext.getBBox().width / 2;
        tmptext.remove();
        break;
      }
    }
    vlen = this.h - (this.padding.bottom + this.padding.top);
    doLeftAxis = (typeof (_ref = this.ndata[groups[0]]) !== "undefined" && _ref !== null) || !(typeof (_ref = this.ndata[groups[1]]) !== "undefined" && _ref !== null);
    doRightAxis = (typeof (_ref = this.ndata[groups[1]]) !== "undefined" && _ref !== null);
    if (doLeftAxis) {
      _vaxis = this.r.sai.prim.vaxis((typeof (_ref = (this.ndata[groups[0]] == null ? undefined : this.ndata[groups[0]]['__YVALS__'])) !== "undefined" && _ref !== null) ? _ref : [0, '?'], this.x + this.padding.left, this.y - this.padding.bottom, vlen, {
        width: this.axisWidth,
        title: (typeof titles === "undefined" || titles === null) ? undefined : titles.left
      });
      vaxis_width = _vaxis.items[0].getBBox().width;
      _vaxis.remove();
    } else {
      vaxis_width = 0;
    }
    if (doRightAxis) {
      _vaxis = this.r.sai.prim.vaxis((typeof (_ref = (this.ndata[groups[1]] == null ? undefined : this.ndata[groups[1]]['__YVALS__'])) !== "undefined" && _ref !== null) ? _ref : [0, '?'], this.x + this.padding.left, this.y - this.padding.bottom, vlen, {
        width: this.axisWidth,
        title: (typeof titles === "undefined" || titles === null) ? undefined : titles.right
      });
      vaxis2_width = _vaxis.getBBox().width;
      _vaxis.remove();
    } else {
      vaxis2_width = 0;
    }
    hlen = this.w - this.padding.left - this.padding.right - vaxis_width - vaxis2_width;
    this.haxis = this.r.sai.prim.haxis(this.data[this.__LABELS__], this.x + this.padding.left + vaxis_width, this.y - this.padding.bottom, hlen, {
      width: this.axisWidth,
      title: (typeof titles === "undefined" || titles === null) ? undefined : titles.bottom
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
      this.vaxis = this.r.sai.prim.vaxis((typeof (_ref = (this.ndata[groups[0]] == null ? undefined : this.ndata[groups[0]]['__YVALS__'])) !== "undefined" && _ref !== null) ? _ref : [0, '?'], this.x + this.padding.left, this.y - this.padding.bottom, vlen, {
        width: this.axisWidth,
        title: (typeof titles === "undefined" || titles === null) ? undefined : titles.left
      });
      vbbw = this.vaxis.items[0].getBBox().width;
      this.vaxis.translate(vbbw, 0);
      this.padding.left += vbbw;
    }
    if (doRightAxis) {
      this.vaxis_right = this.r.sai.prim.vaxis((typeof (_ref = (this.ndata[groups[1]] == null ? undefined : this.ndata[groups[1]]['__YVALS__'])) !== "undefined" && _ref !== null) ? _ref : [0, '?'], this.w - this.padding.right, this.y - this.padding.bottom, vlen, {
        width: this.axisWidth,
        right: true,
        title: (typeof titles === "undefined" || titles === null) ? undefined : titles.right,
        color: (typeof (_ref = this.ndata[groups[0]]) !== "undefined" && _ref !== null) ? (typeof (_ref = this.colors.__RIGHTAXIS__) !== "undefined" && _ref !== null) ? _ref : 'blue' : 'black'
      });
      vrbbw = this.vaxis_right.items[0].getBBox().width;
      this.vaxis_right.translate(-vrbbw, 0);
      this.padding.right += vrbbw;
    }
    this.setPlotCoords();
    return this.r.set().push(this.haxis).push(this.vaxis);
  };
  Sai.Chart.prototype.setPlotCoords = function() {
    var hlbb, lbb;
    this.px = this.x + this.padding.left;
    this.py = this.y - this.padding.bottom;
    this.pw = this.w - this.padding.left - this.padding.right;
    this.ph = this.h - this.padding.bottom - this.padding.top;
    lbb = this.legend == null ? undefined : this.legend.getBBox();
    this.legend == null ? undefined : this.legend.translate(this.px + this.pw / 2 - (lbb.x + lbb.width / 2), 0);
    hlbb = this.histogramLegend == null ? undefined : this.histogramLegend.getBBox();
    return this.histogramLegend == null ? undefined : this.histogramLegend.translate(this.px + this.pw / 2 - (hlbb.x + hlbb.width / 2), 0);
  };
  Sai.Chart.prototype.drawBG = function() {
    var _ref;
    return (this.bg = this.r.rect((typeof (_ref = this.px) !== "undefined" && _ref !== null) && this.px || this.x, (typeof (_ref = this.py) !== "undefined" && _ref !== null) && (this.py - this.ph) || (this.y - this.h), (typeof (_ref = this.pw) !== "undefined" && _ref !== null) && this.pw || this.w, (typeof (_ref = this.ph) !== "undefined" && _ref !== null) && this.ph || this.h).attr({
      fill: this.opts.bgcolor,
      'stroke-width': 0,
      'stroke-opacity': 0
    }).toBack());
  };
  Sai.Chart.prototype.logoPos = function() {
    var _ref, h, w, x, y;
    w = 150;
    h = 28;
    x = (typeof (_ref = this.px) !== "undefined" && _ref !== null) && (typeof (_ref = this.pw) !== "undefined" && _ref !== null) ? this.px + this.pw - w - 5 : this.w + this.x - w - this.padding.right;
    y = (typeof (_ref = this.py) !== "undefined" && _ref !== null) && (typeof (_ref = this.ph) !== "undefined" && _ref !== null) ? this.py - this.ph + 5 : this.y - this.h + this.padding.top;
    return [x, y, w, h];
  };
  Sai.Chart.prototype.drawLogo = function() {
    var _ref, h, logo_path, path_height, path_start_offset, path_width, scale, w, x, y;
    if (this.opts.simple) {
      return null;
    }
    _ref = this.logoPos();
    x = _ref[0];
    y = _ref[1];
    w = _ref[2];
    h = _ref[3];
    path_width = 344;
    path_height = 65;
    path_start_offset = [328.3, 53.06];
    scale = [w / path_width, h / path_height];
    x += path_start_offset[0] * scale[0];
    y += path_start_offset[1] * scale[1];
    logo_path = ("M" + (x) + "," + (y) + "h1.9v1.6c0.5-0.5,0.9-0.9,1.3-1.2,0.6-0.4,1.4-0.7,2.2-0.7,0.9,0,1.6,0.3,2.2,0.7,0.3,0.3,0.6,0.7,0.9,1.2,0.4-0.7,0.9-1.1,1.5-1.4,0.6-0.3,1.2-0.5,2-0.5,1.5,0,2.6,0.6,3.1,1.7,0.3,0.6,0.5,1.4,0.5,2.5v7.7h-2v-8.1c0-0.7-0.2-1.3-0.6-1.6-0.4-0.2-0.9-0.4-1.4-0.4-0.8,0-1.4,0.3-2,0.8-0.5,0.5-0.8,1.3-0.8,2.5v6.8h-2v-7.6c0-0.8-0.1-1.3-0.3-1.7-0.3-0.5-0.8-0.8-1.6-0.8-0.8,0-1.4,0.3-2,0.8-0.6,0.6-0.9,1.6-0.9,3.1v6.2h-2v-11.6zm-3.9,1.1c1,1,1.5,2.5,1.5,4.4,0,1.9-0.4,3.4-1.3,4.7-0.9,1.2-2.3,1.8-4.2,1.8-1.6,0-2.9-0.6-3.8-1.6-0.9-1.1-1.4-2.6-1.4-4.4,0-1.9,0.5-3.5,1.5-4.6,1-1.2,2.3-1.7,3.9-1.7,1.5,0,2.8,0.5,3.8,1.4zm-1.2,7.7c0.5-0.9,0.7-2,0.7-3.2,0-1.1-0.2-2-0.5-2.6-0.6-1.1-1.5-1.6-2.8-1.6-1.2,0-2,0.4-2.6,1.3-0.5,0.9-0.8,2-0.8,3.3,0,1.2,0.3,2.2,0.8,3.1,0.6,0.8,1.4,1.2,2.6,1.2,1.2,0,2.1-0.5,2.6-1.5zm-10.6-8.2c0.8,0.6,1.3,1.7,1.5,3.3h-1.9c-0.1-0.7-0.4-1.3-0.8-1.8-0.4-0.5-1.1-0.7-2-0.7-1.2,0-2.1,0.6-2.6,1.8-0.4,0.8-0.6,1.8-0.6,2.9,0,1.2,0.3,2.1,0.8,2.9,0.5,0.8,1.2,1.2,2.3,1.2,0.8,0,1.4-0.2,1.9-0.7,0.5-0.5,0.8-1.2,1-2h1.9c-0.2,1.5-0.8,2.6-1.7,3.3-0.8,0.7-1.9,1.1-3.3,1.1-1.5,0-2.7-0.6-3.6-1.7-0.9-1.1-1.3-2.4-1.3-4.1,0-2,0.5-3.6,1.4-4.7,1-1.2,2.3-1.7,3.8-1.7,1.3,0,2.4,0.3,3.2,0.9zm-13.3,8.6h2.2v2.4h-2.2v-2.4zm-181-15.8-6,12.9h-7.6c-0.9-0.4-4.5-6-5.3-7.2-3.3-4.5-6.8-8.9-10.1-13.5-1.2-1.7-2.8-3.2-4-5.1h-8.9v-2.8h17.7c3.4,0,7.2,0.3,9.6-0.8,2.2-0.9,3.9-2.5,5.2-4.3,1.1-1.7,2.8-4.6,2.1-8-1.2-4.9-4-7.791-8.5-9.251-2.6-0.81-9.8-0.61-9.8-0.61h-21v56.361h4.7v-26h6.5c6.4,8.6,12.9,17.3,19.3,26h12.9l6.5-13.1h34.5l6.4,13.1h5.4l-8.6-17.7h-41zm-41.9-34.10h17.7c4.5,0,7.8-0.1,10,2.1,1.1,1.1,2.8,3.2,2.1,5.9-0.5,2.2-1.9,4-3.9,4.8-2,0.9-5.8,0.7-8.4,0.7h-17.5v-13.50zm61.1-4.751-17.4,36.051h37.5l-17.4-36.051h-2.7zm-9.9,31.251,11-22.9,11.4,22.9h-22.4zm-127.60-26.500h25.800v51.8h4.7v-56.361h-30.500v4.561zm276.70-12.341-35.6,29.741v-29.741h-4.8v39.441l48-39.441h-7.6zm19.4,0h-7.4l-32.3,26.941,32.3,37.2h6.2l-31.6-36.400,32.8-27.741zm-163.3,0-25.1,50.841-5.9-7.8-3.4-4.5v-0.4c9.7,0,16-4.9,18.8-11.6,4.8-11.3-2.7-21.961-10.4-25.211-3.4-1.44-8-1.33-12.9-1.33h-20.3h-73.600v4.74h64.100v2.97l-30.7,0.1v56.331h4.7v-51.8h26v51.8h4.7v-59.401h22.8c4,0,8.8-0.46,12,0.57,3.4,1.12,5.9,3.35,7.7,6.031,1.7,2.6,3.5,7.2,2.1,11.6-0.7,2.3-1.9,4.2-3.2,5.9-1.3,1.7-4.4,3.4-6.6,4.2-1,0.3-3.1,0.5-3.1,0.5h-11.5c5.6,7.7,11.3,15.3,17,23h4.4c0.6-0.4,25-50.151,25.4-51.801h6.1l29.2,59.401h5.1l-31.3-64.141h-12.1zm103.5,43.641v20.5h4.8v-18.2l12.5-10.5,25,28.7h6.3l-30.6-35.1-18,14.6zm-7.7-28.3c-6.1-9.141-17.1-15.251-29.6-15.251-19.2,0-34.8,14.351-34.8,32.151,0,17.7,15.6,32.1,34.8,32.1,10.5,0,22.4-4.1,29.7-10.8v10.6h4.8v-19c-1.7,0.8-3.3,1.8-4.9,2.8v0.1c-10.9,7.1-19.4,11.2-29.9,11.3-16.4,0-29.6-12.2-29.6-27.2,0-15.1,13.2-27.311,29.6-27.311,11.5,0,21.5,6.011,26.4,14.811,0,0,2.2-1.4,3.5-2.2v20.8c-1.3,0.9-4.5,3.3-4.6,3.4-8.2,5.4-17.9,10.3-25.5,10.4-12,0-21.7-9-21.7-19.9,0-11,9.7-19.9,21.7-19.9,8.4,0,15.7,4.4,19.3,10.8l0.1,0.1c0.2,0.2,0.5,0.2,0.7,0.1,0,0,0.1-0.1,0.1-0.1,0.1-0.1,0.9-0.6,1.7-1,0.4-0.3,0.8-0.5,1.1-0.7,0.1,0,0.2-0.1,0.3-0.2h0.1l0.1-0.1c0.2-0.1,0.3-0.5,0.1-0.7-4.5-7.8-13.3-12.971-23.4-12.971-14.8,0-26.7,11.071-26.7,24.771,0,13.7,11.9,24.7,26.7,24.7,9.6,0,25.4-8.1,29.9-12.2,1.6-1.1,3.1-2.4,4.9-3.2v-41.561h-4.9v15.361z");
    return (this.logo = this.r.path(logo_path).hide().attr({
      fill: (typeof (_ref = this.opts.logoColor) !== "undefined" && _ref !== null) ? _ref : '#AA5128',
      'stroke-width': 0,
      'stroke-opacity': 0,
      opacity: 0.25,
      cx: x + w / 2,
      cy: y - h / 2
    }).scale(scale[0], scale[1], x, y).show());
  };
  Sai.Chart.prototype.drawFootnote = function(text) {
    var _ref, h;
    text = (typeof text !== "undefined" && text !== null) ? text : ((typeof (_ref = this.opts.footnote) !== "undefined" && _ref !== null) ? _ref : '');
    if (text.match(/^\s*$/)) {
      return null;
    }
    this.footnote = this.r.sai.prim.wrappedText(this.x + this.padding.left, this.y - this.padding.bottom, this.w, text, ' ');
    h = this.footnote.getBBox().height;
    this.padding.bottom += h + 10;
    return this.footnote.translate(0, -h);
  };
  Sai.Chart.prototype.render = function() {
    var _ref;
    if (this.opts.simple && (typeof (_ref = this.renderPlots) !== "undefined" && _ref !== null)) {
      this.renderPlots();
    } else {
      this.renderFull();
    }
    return this;
  };
  Sai.Chart.prototype.renderFull = function() {
    this.plot = (typeof this.plot !== "undefined" && this.plot !== null) ? this.plot : new Sai.Plot(this.r);
    this.plot.render();
    return this;
  };
  Sai.Chart.prototype.showError = function(error) {
    var _ref, err;
    return (err = this.r.text(this.x + this.padding.left + (((typeof (_ref = this.pw) !== "undefined" && _ref !== null) ? _ref : this.w) / 2), this.y - this.padding.bottom - (((typeof (_ref = this.ph) !== "undefined" && _ref !== null) ? _ref : this.h) / 2), error));
  };
  Sai.Chart.prototype.setColors = function(colors) {
    var _i, _ref, series, seriesName;
    this.colors = (typeof this.colors !== "undefined" && this.colors !== null) ? this.colors : {};
    _ref = colors;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      seriesName = this.renames[series];
      if (seriesName in this.data) {
        this.colors[seriesName] = colors[series];
      }
    }
    return this;
  };
  Sai.Chart.prototype.setColor = function(series, color) {
    this.colors = (typeof this.colors !== "undefined" && this.colors !== null) ? this.colors : {};
    this.colors[this.renames[series]] = color;
    return this;
  };
  Sai.Chart.prototype.normalizedHeight = function(h, group) {
    var _ref, nh, ymax, ymin;
    if (!(typeof (_ref = this.ndata[group] == null ? undefined : this.ndata[group]['__YVALS__']) !== "undefined" && _ref !== null)) {
      return null;
    }
    ymin = this.ndata[group]['__YVALS__'][0];
    ymax = this.ndata[group]['__YVALS__'][this.ndata[group]['__YVALS__'].length - 1];
    if (h < ymin) {
      h = ymin;
    } else if (h > ymax) {
      h = ymax;
    }
    return (nh = (h - ymin) / (ymax - ymin));
  };
  Sai.Chart.prototype.drawGuideline = function(h, group) {
    var _ref, guideline, nh;
    group = (typeof group !== "undefined" && group !== null) ? group : 'all';
    if (!(typeof (_ref = this.ndata[group] == null ? undefined : this.ndata[group]['__YVALS__']) !== "undefined" && _ref !== null)) {
      return null;
    }
    nh = this.normalizedHeight(h, group);
    this.guidelines = (typeof this.guidelines !== "undefined" && this.guidelines !== null) ? this.guidelines : this.r.set();
    guideline = new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, {
      'guideline': [[0, nh], [1, nh]]
    });
    guideline.render({
      'guideline': '#ccc'
    });
    return this.guidelines.push(guideline.set);
  };
  Sai.Chart.prototype.drawLegend = function(colors) {
    var _colors, _highlightColors, _i, _j, _len, _ref, _ref2, bbox, l;
    colors = (typeof colors !== "undefined" && colors !== null) ? colors : this.colors;
    if (colors) {
      _colors = {};
      _highlightColors = {};
      _ref = colors;
      for (l in _ref) {
        if (!__hasProp.call(_ref, l)) continue;
        _i = _ref[l];
        if (l !== this.__LABELS__) {
          _colors[l] = colors[l];
          _highlightColors[l] = 'black';
          if (typeof (_ref2 = this.opts.groups == null ? undefined : this.opts.groups.right) !== "undefined" && _ref2 !== null) {
            if ((function(){ for (var _j=0, _len=(_ref2 = this.opts.groups.right).length; _j<_len; _j++) { if (_ref2[_j] === l) return true; } return false; }).call(this)) {
              _highlightColors[l] = (typeof (_ref2 = this.ndata.left) !== "undefined" && _ref2 !== null) ? (typeof (_ref2 = this.colors.__RIGHTAXIS__) !== "undefined" && _ref2 !== null) ? _ref2 : 'blue' : 'black';
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
  Sai.Chart.prototype.drawTitle = function() {
    var _ref;
    if (typeof (_ref = this.opts.title) !== "undefined" && _ref !== null) {
      this.title = this.r.text(this.x + (this.w / 2), this.y - this.h, this.opts.title).attr({
        'font-size': 20
      });
      this.title.translate(0, this.title.getBBox().height / 2);
      return this.padding.top += this.title.getBBox().height + 5;
    }
  };
  Sai.Chart.prototype.setupInfoSpace = function() {
    this.info_y = this.y - this.h + this.padding.top;
    this.info_x = this.x + this.padding.left;
    this.info_w = this.w - this.padding.left - this.padding.right;
    return this.padding.top += 30;
  };
  Sai.Chart.prototype.drawInfo = function(info, clear) {
    var _i, _ref, _ref2, label;
    clear = (typeof clear !== "undefined" && clear !== null) ? clear : true;
    info = (typeof info !== "undefined" && info !== null) ? info : ((typeof (_ref = this.default_info) !== "undefined" && _ref !== null) ? this.default_info() : {});
    if (clear) {
      this.info_data = {};
    }
    if (this.info) {
      this.info.remove();
    }
    _ref = info;
    for (label in _ref) {
      if (!__hasProp.call(_ref, label)) continue;
      _i = _ref[label];
      if (!(label.match("^__"))) {
        this.info_data[label] = (typeof (_ref2 = info[label]) !== "undefined" && _ref2 !== null) ? _ref2 : '(no data)';
      }
    }
    return (this.info = this.r.sai.prim.info(this.info_x, this.info_y, this.info_w, this.info_data));
  };
  Sai.Chart.prototype.getIndex = function(evt) {
    var tx;
    tx = Sai.util.transformCoords(evt, this.r.canvas).x;
    return Math.round((this.data[this.__LABELS__].length - 1) * (tx - this.px) / this.pw);
  };
  Sai.Chart.prototype.drawHistogramLegend = function(seriesNames, colors) {
    var _i, _len, _ref, _ref2, _ref3, _result, color, data, dataWithoutNulls, extrapadding, height, histogram, i, j, max, maxLabel, min, minLabel, series, width, x, yvals;
    colors = (typeof colors !== "undefined" && colors !== null) ? colors : this.colors;
    this.histogramLegend = this.r.set();
    extrapadding = 20;
    height = Math.max(0.1 * (this.h - this.padding.bottom - this.padding.top), 50);
    width = Math.min(150, (this.w - this.padding.left - this.padding.right - extrapadding) / seriesNames.length);
    _ref = seriesNames.length;
    for (i = 0; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      series = seriesNames[i];
      data = (function() {
        _result = []; _ref2 = this.ndata[series][series].length;
        for (j = 0; (0 <= _ref2 ? j < _ref2 : j > _ref2); (0 <= _ref2 ? j += 1 : j -= 1)) {
          if (typeof (_ref3 = this.ndata[series][series][j]) !== "undefined" && _ref3 !== null) {
            _result.push(this.ndata[series][series][j][1]);
          }
        }
        return _result;
      }).call(this);
      if (typeof (_ref2 = this.bounds == null ? undefined : this.bounds[series]) !== "undefined" && _ref2 !== null) {
        _ref2 = this.bounds[series];
        min = _ref2[0];
        max = _ref2[1];
      } else {
        dataWithoutNulls = (function() {
          _result = []; _ref2 = this.data[series];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            x = _ref2[_i];
            if (typeof x !== "undefined" && x !== null) {
              _result.push(x);
            }
          }
          return _result;
        }).call(this);
        _ref2 = [Math.min.apply(Math, dataWithoutNulls), Math.max.apply(Math, dataWithoutNulls)];
        min = _ref2[0];
        max = _ref2[1];
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
  Sai.Chart.prototype.setupHistogramInteraction = function(histogram, series) {
    return null;
  };
  Sai.LineChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.LineChart, Sai.Chart);
  Sai.LineChart.prototype.nonNegativeGroups = function() {
    return this.opts.stacked ? ['all', 'left', 'right'] : [];
  };
  Sai.LineChart.prototype.dataGroups = function(data) {
    var _i, _len, _ref, _result, groups, x;
    groups = Sai.LineChart.__super__.dataGroups.apply(this, arguments);
    if ((typeof (_ref = this.opts.groups == null ? undefined : this.opts.groups.left) !== "undefined" && _ref !== null) && (typeof (_ref = this.opts.groups == null ? undefined : this.opts.groups.right) !== "undefined" && _ref !== null)) {
      groups.left = (function() {
        _result = []; _ref = this.opts.groups.left;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (this.caresAbout(x) && x in this.data) {
            _result.push(x);
          }
        }
        return _result;
      }).call(this);
      groups.right = (function() {
        _result = []; _ref = this.opts.groups.right;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (this.caresAbout(x) && x in this.data) {
            _result.push(x);
          }
        }
        return _result;
      }).call(this);
    }
    return groups;
  };
  Sai.LineChart.prototype.renderPlots = function() {
    var _ref, ndata, plotType, saxis;
    if (!(typeof (_ref = this.px) !== "undefined" && _ref !== null)) {
      this.setPlotCoords();
    }
    this.drawBG();
    this.drawLogo();
    saxis = 'right' in this.ndata;
    ndata = (typeof (_ref = this.opts.stacked) !== "undefined" && _ref !== null) ? this.stackedNdata : this.ndata;
    plotType = this.opts.area ? Sai.AreaPlot : Sai.LinePlot;
    if (saxis) {
      if ((this.ndata.left == null ? undefined : this.ndata.left['__YVALS__'][0]) < 0) {
        this.drawGuideline(0, 'left');
      }
      if ((this.ndata.right == null ? undefined : this.ndata.right['__YVALS__'][0]) < 0) {
        this.drawGuideline(0, 'right');
      }
    } else {
      if (this.ndata.all['__YVALS__'][0] < 0) {
        this.drawGuideline(0, 'all');
      }
    }
    this.plots = [];
    if (saxis) {
      if (typeof (_ref = ndata.left) !== "undefined" && _ref !== null) {
        this.plots.push((new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['left'])).render(this.colors, (typeof (_ref = this.opts.lineWidth) !== "undefined" && _ref !== null) ? _ref : 2, this.opts.stacked, this.getBaseline('left')));
      }
      return (typeof (_ref = ndata.right) !== "undefined" && _ref !== null) ? this.plots.push((new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['right'])).render(this.colors, (typeof (_ref = this.opts.lineWidth) !== "undefined" && _ref !== null) ? _ref : 2, this.opts.stacked, this.getBaseline('right'))) : null;
    } else {
      return this.plots.push((new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['all'])).render(this.colors, (typeof (_ref = this.opts.lineWidth) !== "undefined" && _ref !== null) ? _ref : 2, this.opts.stacked, this.getBaseline('all')));
    }
  };
  Sai.LineChart.prototype.renderFull = function() {
    var _i, _len, _ref, _ref2, everything, moveDots, plot, saxis, series;
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
    _ref = this.ndata['all'];
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (series !== '__YVALS__') {
        this.dots.push(this.r.circle(0, 0, 4).attr({
          'fill': (typeof (_ref2 = (this.colors == null ? undefined : this.colors[series])) !== "undefined" && _ref2 !== null) ? _ref2 : 'black'
        }).hide());
      }
    }
    everything = this.r.set().push(this.bg, this.plotSets, this.dots, this.logo, this.guidelines).mousemove(moveDots = __bind(function(event) {
      var _j, _k, _len2, _ref3, _ref4, _ref5, _result, _result2, i, idx, info, plot, pos, series;
      idx = this.getIndex(event);
      info = {};
      if (((this.data[this.__LABELS__] == null ? undefined : this.data[this.__LABELS__].length) > idx) && (idx >= 0)) {
        info[this.__LABELS__] = this.data[this.__LABELS__][idx];
        _ref3 = this.ndata['all'];
        for (series in _ref3) {
          if (!__hasProp.call(_ref3, series)) continue;
          _j = _ref3[series];
          if (typeof (_ref4 = this.data[series]) !== "undefined" && _ref4 !== null) {
            info[series] = this.data[series][idx];
          }
        }
      }
      this.drawInfo(info);
      i = 0;
      _result = []; _ref3 = this.ndata['all'];
      for (series in _ref3) {
        if (!__hasProp.call(_ref3, series)) continue;
        _j = _ref3[series];
        if (series !== '__YVALS__') {
          _result.push((function() {
            _result2 = []; _ref4 = this.plots;
            for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
              plot = _ref4[_k];
              if (series in plot.dndata) {
                _result2.push((function() {
                  pos = plot.dndata[series][idx];
                  if (typeof (_ref5 = this.data[series][idx]) !== "undefined" && _ref5 !== null) {
                    this.dots[i].attr({
                      cx: pos[0],
                      cy: pos[1]
                    }).show().toFront();
                  } else {
                    this.dots[i].hide();
                  }
                  return i++;
                }).call(this));
              }
            }
            return _result2;
          }).call(this));
        }
      }
      return _result;
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
  Sai.StreamChart = function(_arg, _arg2, _arg3, _arg4, _arg5, data, _arg6, _arg7) {
    this.opts = _arg7;
    this.__LABELS__ = _arg6;
    this.h = _arg5;
    this.w = _arg4;
    this.y = _arg3;
    this.x = _arg2;
    this.r = _arg;
    this.opts.stacked = true;
    Sai.StreamChart.__super__.constructor.apply(this, arguments);
    return this;
  };
  __extends(Sai.StreamChart, Sai.LineChart);
  Sai.StreamChart.prototype.getStackedMax = function(data, group) {
    var naive;
    naive = Sai.StreamChart.__super__.getStackedMax.apply(this, arguments);
    return naive / 2.0;
  };
  Sai.StreamChart.prototype.getStackedMin = function(data, group) {
    var naive, stackedMax;
    naive = Sai.StreamChart.__super__.getStackedMin.apply(this, arguments);
    stackedMax = this.getStackedMax(data, group);
    return naive - stackedMax;
  };
  Sai.StreamChart.prototype.normalize = function(data) {
    var _i, _j, _len, _ref, _ref2, _ref3, _result, _result2, group, groups, i, nh0, offset, point, series, stackedMin, topSeries, v;
    Sai.StreamChart.__super__.normalize.apply(this, arguments);
    groups = this.dataGroups(this.data);
    this.baselines = (typeof this.baselines !== "undefined" && this.baselines !== null) ? this.baselines : {};
    _result = []; _ref = this.stackedNdata;
    for (group in _ref) {
      if (!__hasProp.call(_ref, group)) continue;
      _i = _ref[group];
      nh0 = this.normalizedHeight(0, (typeof group !== "undefined" && group !== null) ? group : 'all');
      stackedMin = this.normalizedHeight(this.getStackedMin(data, groups[group]), group);
      this.baselines[group] = [];
      this.ndata[group]['__YVALS__'] = (function() {
        _result2 = []; _ref2 = this.ndata[group]['__YVALS__'];
        for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
          v = _ref2[_j];
          _result2.push(Math.abs(v));
        }
        return _result2;
      }).call(this);
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
      _ref2 = this.stackedNdata[group];
      for (series in _ref2) {
        if (!__hasProp.call(_ref2, series)) continue;
        _j = _ref2[series];
        topSeries = series;
      }
      _ref2 = this.stackedNdata[group][series].length;
      for (i = 0; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
        offset = (this.stackedNdata[group][topSeries][i][1] - nh0) / 2;
        _ref3 = this.stackedNdata[group];
        for (series in _ref3) {
          if (!__hasProp.call(_ref3, series)) continue;
          _j = _ref3[series];
          point = this.stackedNdata[group][series][i];
          if (!(typeof point !== "undefined" && point !== null)) {
            continue;
          }
          point[1] -= offset;
        }
        this.baselines[group].push([point[0], nh0 - offset]);
      }
    }
    return _result;
  };
  Sai.StreamChart.prototype.addAxes = function(groups, titles) {
    titles = (typeof titles !== "undefined" && titles !== null) ? titles : {};
    if (!('left' in titles)) {
      titles['left'] = 'magnitude';
    }
    return Sai.StreamChart.__super__.addAxes.call(this, groups, titles);
  };
  Sai.StreamChart.prototype.getBaseline = function(group) {
    return this.baselines[group];
  };
  Sai.Sparkline = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.Sparkline, Sai.Chart);
  Sai.Sparkline.prototype.dataGroups = function(data) {
    return {
      'data': ['data']
    };
  };
  Sai.Sparkline.prototype.renderFull = function() {
    this.drawBG();
    this.plots = this.r.set();
    this.plots.push((new Sai.LinePlot(this.r, this.x, this.y, this.w, this.h, this.ndata['data'])).render({
      data: this.colors && this.colors[series] || 'black'
    }, 1).set);
    return this;
  };
  Sai.BarChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.BarChart, Sai.Chart);
  Sai.BarChart.prototype.getMin = function(data, group) {
    return Math.min(Sai.BarChart.__super__.getMin.apply(this, arguments), 0);
  };
  Sai.BarChart.prototype.groupsToNullPad = function() {
    var _i, _ref, _result, group;
    _result = []; _ref = this.dataGroups();
    for (group in _ref) {
      if (!__hasProp.call(_ref, group)) continue;
      _i = _ref[group];
      _result.push(group);
    }
    return _result;
  };
  Sai.BarChart.prototype.tooMuchData = function() {
    var _i, _ref, barsToDraw, maxBars, series;
    maxBars = this.w / 3;
    barsToDraw = 0;
    _ref = this.data;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (series !== this.__LABELS__) {
        barsToDraw += this.data[series].length;
        if (this.opts.stacked) {
          break;
        }
      }
    }
    return barsToDraw > maxBars;
  };
  Sai.BarChart.prototype.renderPlots = function() {
    var _i, _len, _ref, data, ndata, rawdata, series, yval;
    if (!(typeof (_ref = this.px) !== "undefined" && _ref !== null)) {
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
    ndata = (typeof (_ref = this.opts.stacked) !== "undefined" && _ref !== null) ? this.stackedNdata : this.ndata;
    _ref = ndata['all'];
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (!(series.match('^__') || series === this.__LABELS__)) {
        data[series] = ndata['all'][series];
        rawdata[series] = this.data[series];
      }
    }
    return this.plots.push((new Sai.BarPlot(this.r, this.px, this.py, this.pw, this.ph, data, rawdata)).render(typeof (_ref = this.opts.stacked) !== "undefined" && _ref !== null, this.normalizedHeight(0, 'all'), this.colors, this.opts.interactive && !this.opts.simple, this.drawInfo, this.__LABELS__).set);
  };
  Sai.BarChart.prototype.renderFull = function() {
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
  Sai.StockChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.StockChart, Sai.Chart);
  Sai.StockChart.prototype.semanticRenamePatterns = {
    'open': /^open$/i,
    'close': /^close$/i,
    'high': /^high$/i,
    'low': /^low$/i,
    'volume': /^vol(ume)?$/i
  };
  Sai.StockChart.prototype.groupsToNullPad = function() {
    return ['prices', 'volume', '__META__'];
  };
  Sai.StockChart.prototype.dataGroups = function(data) {
    var _i, _ref, groups, seriesName, volume_name;
    groups = {
      '__META__': [this.__LABELS__]
    };
    volume_name = (typeof (_ref = this.semanticRenames['volume']) !== "undefined" && _ref !== null) ? _ref : 'volume';
    if (volume_name in this.data) {
      groups['volume'] = [volume_name];
    }
    _ref = data;
    for (seriesName in _ref) {
      if (!__hasProp.call(_ref, seriesName)) continue;
      _i = _ref[seriesName];
      if (this.caresAbout(seriesName) && !(this.__LABELS__ === seriesName || volume_name === seriesName)) {
        groups.prices = (typeof groups.prices !== "undefined" && groups.prices !== null) ? groups.prices : [];
        groups.prices.push(seriesName);
      }
    }
    return groups;
  };
  Sai.StockChart.prototype.nonNegativeGroups = function() {
    return ['volume'];
  };
  Sai.StockChart.prototype.renderPlots = function() {
    var _i, _ref, avgNdata, close_name, high_name, i, low_name, open_name, p, rawdata, series, vol, volume_name;
    if (!(typeof (_ref = this.px) !== "undefined" && _ref !== null)) {
      this.setPlotCoords();
    }
    open_name = (typeof (_ref = this.semanticRenames['open']) !== "undefined" && _ref !== null) ? _ref : 'open';
    close_name = (typeof (_ref = this.semanticRenames['close']) !== "undefined" && _ref !== null) ? _ref : 'close';
    high_name = (typeof (_ref = this.semanticRenames['high']) !== "undefined" && _ref !== null) ? _ref : 'high';
    low_name = (typeof (_ref = this.semanticRenames['low']) !== "undefined" && _ref !== null) ? _ref : 'low';
    volume_name = (typeof (_ref = this.semanticRenames['volume']) !== "undefined" && _ref !== null) ? _ref : 'volume';
    this.colors = (typeof this.colors !== "undefined" && this.colors !== null) ? this.colors : {};
    this.colors['up'] = (typeof this.colors['up'] !== "undefined" && this.colors['up'] !== null) ? this.colors['up'] : 'black';
    this.colors['down'] = (typeof this.colors['down'] !== "undefined" && this.colors['down'] !== null) ? this.colors['down'] : 'red';
    this.colors['vol_up'] = (typeof this.colors['vol_up'] !== "undefined" && this.colors['vol_up'] !== null) ? this.colors['vol_up'] : '#666666';
    this.colors['vol_down'] = (typeof this.colors['vol_down'] !== "undefined" && this.colors['vol_down'] !== null) ? this.colors['vol_down'] : '#cc6666';
    this.drawLogo();
    this.drawBG();
    if (!((typeof (_ref = this.ndata.prices) !== "undefined" && _ref !== null) && open_name in this.ndata.prices && close_name in this.ndata.prices && high_name in this.ndata.prices && low_name in this.ndata.prices)) {
      this.showError("This chart requires data series named\nopen, close, high, and low.\n \nOnce you add series with these names, the chart will display.");
      return null;
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
    _ref = this.ndata['prices'];
    for (p in _ref) {
      if (!__hasProp.call(_ref, p)) continue;
      _i = _ref[p];
      if (!(p.match('^__') || p === this.__LABELS__)) {
        rawdata[p] = this.data[p];
      }
    }
    if (typeof (_ref = this.data[volume_name]) !== "undefined" && _ref !== null) {
      rawdata['vol'] = this.data[volume_name];
    }
    if ('volume' in this.ndata) {
      _ref = this.ndata['volume'][volume_name].length;
      for (i = 0; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
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
    _ref = this.ndata['prices'];
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (!(((open_name === series || close_name === series || high_name === series || low_name === series)) || series.match("^__") || series === this.__LABELS__)) {
        avgNdata[series] = this.ndata['prices'][series];
      }
    }
    return this.plots.push((new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, avgNdata)).render(this.colors).set);
  };
  Sai.StockChart.prototype.renderFull = function() {
    var _i, _ref, avgColors, close_name, everything, glow_width, high_name, low_name, moveGlow, open_name, series, shouldDrawLegend, volume_name;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawFootnote();
    open_name = (typeof (_ref = this.semanticRenames['open']) !== "undefined" && _ref !== null) ? _ref : 'open';
    close_name = (typeof (_ref = this.semanticRenames['close']) !== "undefined" && _ref !== null) ? _ref : 'close';
    high_name = (typeof (_ref = this.semanticRenames['high']) !== "undefined" && _ref !== null) ? _ref : 'high';
    low_name = (typeof (_ref = this.semanticRenames['low']) !== "undefined" && _ref !== null) ? _ref : 'low';
    volume_name = (typeof (_ref = this.semanticRenames['volume']) !== "undefined" && _ref !== null) ? _ref : 'volume';
    avgColors = {};
    shouldDrawLegend = false;
    _ref = this.ndata['prices'];
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (!(open_name === series || close_name === series || high_name === series || low_name === series) && !(series.match('^__') || series === this.__LABELS__)) {
        avgColors[series] = (this.colors == null ? undefined : this.colors[series]) || 'black';
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
      fill: ("0-" + (this.opts.bgcolor) + "-#DDAA99-" + (this.opts.bgcolor)),
      'stroke-width': 0,
      'stroke-opacity': 0
    }).toBack().hide();
    this.bg.toBack();
    everything = this.r.set().push(this.bg, this.plots, this.logo, this.glow, this.guidelines).mousemove(moveGlow = __bind(function(event) {
      var _j, _ref2, _ref3, idx, info, notNull, series;
      idx = this.getIndex(event);
      info = {};
      if (typeof (_ref2 = this.data[this.__LABELS__][idx]) !== "undefined" && _ref2 !== null) {
        info[this.__LABELS__] = this.data[this.__LABELS__][idx];
      }
      notNull = false;
      _ref2 = this.ndata['prices'];
      for (series in _ref2) {
        if (!__hasProp.call(_ref2, series)) continue;
        _j = _ref2[series];
        if (!(series.match('^__') || series === this.__LABELS__)) {
          if (typeof (_ref3 = this.data[series] == null ? undefined : this.data[series][idx]) !== "undefined" && _ref3 !== null) {
            info[series] = this.data[series][idx];
            notNull = true;
          }
        }
      }
      if (typeof (_ref2 = this.data[volume_name] == null ? undefined : this.data[volume_name][idx]) !== "undefined" && _ref2 !== null) {
        info[volume_name] = this.data[volume_name][idx];
        notNull = true;
      }
      this.drawInfo(info);
      return notNull ? this.glow.attr({
        x: this.px + (glow_width * (idx - 0.5))
      }).show() : null;
    }, this)).mouseout(__bind(function(event) {
      this.drawInfo({}, true);
      return this.glow.hide();
    }, this));
    return this;
  };
  Sai.GeoChart = function() {
    var _this;
    _this = this;
    this.renderPlots = function(){ return Sai.GeoChart.prototype.renderPlots.apply(_this, arguments); };
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.GeoChart, Sai.Chart);
  Sai.GeoChart.prototype.plotType = Sai.GeoPlot;
  Sai.GeoChart.prototype.interactiveHistogram = true;
  Sai.GeoChart.prototype.getMax = function(data, series) {
    return Math.max.apply(Math, data);
  };
  Sai.GeoChart.prototype.getMin = function(data, series) {
    return Math.min.apply(Math, data);
  };
  Sai.GeoChart.prototype.normalize = function(data) {
    var _i, _j, _len, _ref, _ref2, _ref3, _result, _result2, d, dataWithoutNulls, i, max, maxes, min, mins, overallMax, overallMin, series;
    this.ndata = {};
    this.bounds = {};
    maxes = {};
    mins = {};
    _ref = data;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (series.match('^__') || series === this.__LABELS__) {
        continue;
      }
      if (!(typeof (_ref2 = data[series]) !== "undefined" && _ref2 !== null)) {
        continue;
      }
      dataWithoutNulls = (function() {
        _result = []; _ref2 = data[series];
        for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
          d = _ref2[_j];
          if (typeof d !== "undefined" && d !== null) {
            _result.push(d);
          }
        }
        return _result;
      })();
      maxes[series] = this.getMax(dataWithoutNulls, series);
      if (!(typeof overallMax !== "undefined" && overallMax !== null) || maxes[series] > overallMax) {
        overallMax = maxes[series];
      }
      mins[series] = this.getMin(dataWithoutNulls, series);
      if (!(typeof overallMin !== "undefined" && overallMin !== null) || mins[series] < overallMin) {
        overallMin = mins[series];
      }
    }
    _result = []; _ref = data;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      if (series.match('^__') || series === this.__LABELS__) {
        continue;
      }
      if (!(typeof (_ref2 = data[series]) !== "undefined" && _ref2 !== null)) {
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
      this.ndata[series][series] = (function() {
        _result2 = []; _ref2 = data[series].length;
        for (i = 0; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
          _result2.push((typeof (_ref3 = data[series][i]) !== "undefined" && _ref3 !== null) ? [i / (data[series].length - 1), ((data[series][i] - min) / (max - min))] : null);
        }
        return _result2;
      })();
    }
    return _result;
  };
  Sai.GeoChart.prototype.dataGroups = function(data) {
    var _i, _ref, _result, groups, seriesName;
    groups = {
      '__META__': (function() {
        _result = []; _ref = data;
        for (seriesName in _ref) {
          if (!__hasProp.call(_ref, seriesName)) continue;
          _i = _ref[seriesName];
          if (seriesName.match("^__") || seriesName === this.__LABELS__) {
            _result.push(seriesName);
          }
        }
        return _result;
      }).call(this)
    };
    _ref = data;
    for (seriesName in _ref) {
      if (!__hasProp.call(_ref, seriesName)) continue;
      _i = _ref[seriesName];
      if (!(seriesName.match("^__") || seriesName === this.__LABELS__)) {
        groups[seriesName] = [seriesName];
      }
    }
    return groups;
  };
  Sai.GeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
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
  Sai.GeoChart.prototype.renderPlots = function(mainSeries) {
    var _i, _ref, ndata, series;
    if (!(typeof (_ref = this.px) !== "undefined" && _ref !== null)) {
      this.setPlotCoords();
    }
    this.bg == null ? undefined : this.bg.remove();
    this.logo == null ? undefined : this.logo.remove();
    this.geoPlot == null ? undefined : this.geoPlot.set.remove();
    this.drawBG();
    this.drawLogo();
    ndata = {};
    _ref = this.ndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      ndata[series] = this.ndata[series][series];
    }
    this.geoPlot = (new this.plotType(this.r, this.px, this.py, this.pw, this.ph, ndata, this.data, {
      fromWhite: this.opts.fromWhite
    })).render(this.colors || {}, this.data['__MAP__'], this.__LABELS__, (typeof mainSeries !== "undefined" && mainSeries !== null) ? mainSeries : this.data['__DEFAULT__'], this.opts.bgcolor, this.opts.interactive && !this.opts.simple, this.drawInfo);
    return this;
  };
  Sai.GeoChart.prototype.default_info = function() {
    return {
      '': this.opts.interactive ? 'Click histogram below to change map display' : ''
    };
  };
  Sai.GeoChart.prototype.renderFull = function() {
    var _i, _ref, _result, everything, series;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawFootnote();
    this.drawHistogramLegend((function() {
      _result = []; _ref = this.data;
      for (series in _ref) {
        if (!__hasProp.call(_ref, series)) continue;
        _i = _ref[series];
        if (!(series.match('^__') || series === this.__LABELS__)) {
          _result.push(series);
        }
      }
      return _result;
    }).call(this));
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
  Sai.ChromaticGeoChart = function() {
    return Sai.GeoChart.apply(this, arguments);
  };
  __extends(Sai.ChromaticGeoChart, Sai.GeoChart);
  Sai.ChromaticGeoChart.prototype.plotType = Sai.ChromaticGeoPlot;
  Sai.ChromaticGeoChart.prototype.interactiveHistogram = false;
  Sai.ChromaticGeoChart.prototype.default_info = function() {
    return {};
  };
  Sai.ChromaticGeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
    return false;
  };
  Sai.ScatterChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.ScatterChart, Sai.Chart);
  Sai.ScatterChart.prototype.dataGroups = function(data) {
    var _i, _ref, _result, groups, seriesName;
    groups = {
      '__META__': (function() {
        _result = []; _ref = data;
        for (seriesName in _ref) {
          if (!__hasProp.call(_ref, seriesName)) continue;
          _i = _ref[seriesName];
          if (seriesName.match("^__") || seriesName === this.__LABELS__) {
            _result.push(seriesName);
          }
        }
        return _result;
      }).call(this)
    };
    _ref = data;
    for (seriesName in _ref) {
      if (!__hasProp.call(_ref, seriesName)) continue;
      _i = _ref[seriesName];
      if (!(seriesName.match("^__") || seriesName === this.__LABELS__)) {
        groups[seriesName] = [seriesName];
      }
    }
    return groups;
  };
  Sai.ScatterChart.prototype.renderPlots = function() {
    var _i, _ref, _ref2, colors, ndata, radii, series, stroke_colors, stroke_opacity;
    if (!(typeof (_ref = this.px) !== "undefined" && _ref !== null)) {
      this.setPlotCoords();
    }
    colors = (typeof (_ref = this.opts.colors) !== "undefined" && _ref !== null) ? _ref : (typeof (_ref2 = this.colors) !== "undefined" && _ref2 !== null) ? _ref2 : ['black', 'white'];
    stroke_opacity = (typeof (_ref = this.opts.stroke_opacity) !== "undefined" && _ref !== null) ? _ref : [0, 1];
    stroke_colors = (typeof (_ref = this.opts.stroke_colors) !== "undefined" && _ref !== null) ? _ref : ['black', 'black'];
    radii = (typeof (_ref = this.opts.radius) !== "undefined" && _ref !== null) ? _ref : [4, 12];
    this.drawLogo();
    this.drawBG();
    ndata = {};
    _ref = this.ndata;
    for (series in _ref) {
      if (!__hasProp.call(_ref, series)) continue;
      _i = _ref[series];
      ndata[series] = this.ndata[series][series];
    }
    this.plots = this.r.set();
    this.plots.push((new Sai.ScatterPlot(this.r, this.px, this.py, this.pw, this.ph, ndata, this.data)).render(this.opts.mappings, colors, radii, stroke_opacity, stroke_colors, this.opts.interactive && !this.opts.simple, this.drawInfo).set);
    return this;
  };
  Sai.ScatterChart.prototype.renderFull = function() {
    var _i, _ref, _ref2, c, colors, draw_legend, everything, histogramColors, histogramSeries, legend_colors, radii, stroke_colors, stroke_opacity;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawFootnote();
    colors = (typeof (_ref = this.opts.colors) !== "undefined" && _ref !== null) ? _ref : (typeof (_ref2 = this.colors) !== "undefined" && _ref2 !== null) ? _ref2 : ['black', 'white'];
    stroke_opacity = (typeof (_ref = this.opts.stroke_opacity) !== "undefined" && _ref !== null) ? _ref : [0, 1];
    stroke_colors = (typeof (_ref = this.opts.stroke_colors) !== "undefined" && _ref !== null) ? _ref : ['black', 'black'];
    radii = (typeof (_ref = this.opts.radius) !== "undefined" && _ref !== null) ? _ref : [4, 12];
    histogramSeries = [];
    histogramColors = {};
    if (colors instanceof Array) {
      histogramSeries.push(this.opts.mappings.color);
      histogramColors[this.opts.mappings.color] = {
        __LOW__: colors[0],
        __HIGH__: colors[1]
      };
    } else {
      legend_colors = (typeof legend_colors !== "undefined" && legend_colors !== null) ? legend_colors : {};
      draw_legend = true;
      _ref = colors;
      for (c in _ref) {
        if (!__hasProp.call(_ref, c)) continue;
        _i = _ref[c];
        legend_colors[c] = colors[c];
      }
    }
    if (stroke_colors instanceof Array) {
      null;
    } else {
      legend_colors = (typeof legend_colors !== "undefined" && legend_colors !== null) ? legend_colors : {};
      draw_legend = true;
      _ref = colors;
      for (c in _ref) {
        if (!__hasProp.call(_ref, c)) continue;
        _i = _ref[c];
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
}).call(this);
