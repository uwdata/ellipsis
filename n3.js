(function() {
  var N3Annotation, N3State, N3Vis,
    __slice = Array.prototype.slice;

  window.n3 = {
    version: '0.9.0'
  };

  n3.util = {};

  n3.util.getSelector = function(selector, attrs) {
    if (attrs['id'] != null) {
      return selector + '#' + this.attrs['id'];
    } else if (attrs['class'] != null) {
      return selector + '.' + this.attrs['class'].split(' ').join('.');
    } else {
      return selector;
    }
  };

  N3State = (function() {

    function N3State(stateId, validValues, visId) {
      this.stateId = stateId;
      this.validValues = validValues;
      this.visId = visId;
    }

    N3State.prototype.get = function() {
      return this.val;
    };

    N3State.prototype.set = function(val) {
      this.prevVal = this.val;
      this.val = val;
      return this.notify();
    };

    N3State.prototype.notify = function() {
      var _ref;
      return (_ref = N3Vis.lookup[this.visId]) != null ? _ref.renderFn() : void 0;
    };

    return N3State;

  })();

  N3Vis = (function() {

    N3Vis.lookup = {};

    function N3Vis(visId) {
      this.visId = visId;
      this.states = {};
      this.consts = {};
      return this;
    }

    N3Vis.prototype.stage = function(sel, w, h) {
      if (arguments.length === 3) {
        this.stageSelector = sel;
        this.stageWidth = w;
        this.stageHeight = h;
        return this;
      } else {
        return d3.select(this.stageSelector);
      }
    };

    N3Vis.prototype.width = function(width) {
      if (arguments.length === 1) {
        this.stageWidth = width;
        return this;
      } else {
        return this.stageWidth;
      }
    };

    N3Vis.prototype.height = function(height) {
      if (arguments.length === 1) {
        this.stageHeight = height;
        return this;
      } else {
        return this.stageHeight;
      }
    };

    N3Vis.prototype.data = function(data) {
      if (arguments.length === 1) {
        this.dataObj = data;
        return this;
      } else {
        return this.dataObj;
      }
    };

    N3Vis.prototype.state = function(stateId, validValues) {
      var _ref;
      if (arguments.length === 2) {
        this.states[stateId] = new N3State(stateId, validValues, this.visId);
        return this;
      } else {
        return (_ref = this.states[stateId]) != null ? _ref.get() : void 0;
      }
    };

    N3Vis.prototype["const"] = function(constId, value) {
      if (arguments.length === 2) {
        if (!(constId in this.consts)) this.consts[constId] = value;
        return this;
      } else {
        return this.consts[constId];
      }
    };

    N3Vis.prototype.render = function(renderFn) {
      this.renderFn = renderFn;
      return this;
    };

    return N3Vis;

  })();

  n3.vis = function(visId) {
    var _base;
    return (_base = N3Vis.lookup)[visId] || (_base[visId] = new N3Vis(visId));
  };

  N3Annotation = (function() {

    N3Annotation.types = {
      circle: function(r, _arg) {
        var cx, cy;
        cx = _arg[0], cy = _arg[1];
        return N3Annotation.types.ellipse([r, r], [cx, cy]);
      },
      ellipse: function(_arg, _arg2) {
        var cx, cy, e, ea, et, rx, ry, selector, stage;
        rx = _arg[0], ry = _arg[1];
        cx = _arg2[0], cy = _arg2[1];
        selector = n3.util.getSelector('ellipse', this.attrs);
        stage = this.visObj != null ? this.visObj.stage() : d3;
        e = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
        ea = e.enter().append('svg:ellipse').attr('rx', rx).attr('ry', ry).attr('cx', cx).attr('cy', cy);
        this.applyAttrs(ea);
        this.applyStyles(ea);
        et = e.transition().attr('rx', rx).attr('ry', ry).attr('cx', cx).attr('cy', cy);
        this.applyAttrs(et);
        this.applyStyles(et);
        return e.exit().remove();
      },
      line: function(_arg, arrow1, _arg2, arrow2) {
        var l, la, lt, selector, stage, x1, x2, y1, y2;
        x1 = _arg[0], y1 = _arg[1];
        x2 = _arg2[0], y2 = _arg2[1];
        selector = n3.util.getSelector('line', this.attrs);
        stage = this.visObj != null ? this.visObj.stage() : d3;
        l = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
        la = l.enter().append('svg:line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
        this.applyAttrs(la);
        this.applyStyles(la);
        lt = l.transition().attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
        this.applyAttrs(lt);
        this.applyStyles(lt);
        return l.exit().remove();
      },
      rectangle: function(_arg, _arg2) {
        var h, r, ra, rt, selector, stage, w, x, y;
        w = _arg[0], h = _arg[1];
        x = _arg2[0], y = _arg2[1];
        selector = n3.util.getSelector('rect', this.attrs);
        stage = this.visObj != null ? this.visObj.stage() : d3;
        r = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
        ra = r.enter().append('svg:rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
        this.applyAttrs(ra);
        this.applyStyles(ra);
        rt = r.transition().attr('x', x).attr('y', y).attr('width', w).attr('height', h);
        this.applyAttrs(rt);
        this.applyStyles(rt);
        return r.exit().remove();
      },
      label: function(text, html, _arg) {
        var d, da, dt, selector, stage, x, y;
        x = _arg[0], y = _arg[1];
        selector = n3.util.getSelector('div', this.attrs);
        stage = this.visObj != null ? this.visObj.stage() : d3;
        this.styles['position'] = 'absolute';
        this.styles['x'] = x;
        this.styles['top'] = y;
        d = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
        da = r.enter().append('div').text(text).html(html);
        this.applyAttrs(da);
        this.applyStyles(da);
        dt = d.transition().text(text).html(html);
        this.applyAttrs(dt);
        this.applyStyles(dt);
        return d.exit().remove();
      }
    };

    function N3Annotation(type) {
      this.type = type;
      this.templateFn = N3Annotation.types[this.type];
      this.arguments = [];
      return this;
    }

    N3Annotation.prototype.template = function(templateFn) {
      this.templateFn = templateFn;
      N3Annotation.types[this.type] = this.templateFn;
      return this;
    };

    N3Annotation.prototype.data = function(data) {
      if (arguments.length === 1) {
        this.dataObj = data;
        return this;
      } else {
        return this.dataObj;
      }
    };

    N3Annotation.prototype.vis = function(vis) {
      if (arguments.length === 1) {
        this.visObj = vis;
        return this;
      } else {
        return this.visObj;
      }
    };

    N3Annotation.prototype.draw = function() {
      return this.templateFn.apply(this, this.arguments);
    };

    N3Annotation.prototype.args = function() {
      var _arguments;
      _arguments = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.arguments = _arguments;
      return this;
    };

    N3Annotation.prototype.attr = function(key, value) {
      if (arguments.length === 2) {
        this.attrs[key] = value;
        return this;
      } else {
        return this.attrs[key];
      }
    };

    N3Annotation.prototype.applyAttrs = function(obj) {
      var key, value, _ref;
      _ref = this.attrs;
      for (key in _ref) {
        value = _ref[key];
        obj.attr(key, value);
      }
      return true;
    };

    N3Annotation.prototype.style = function(key, value) {
      if (arguments.length === 2) {
        this.styles[key] = value;
        return this;
      } else {
        return this.styles[key];
      }
    };

    N3Annotation.prototype.applyStyles = function(obj) {
      var key, value, _ref;
      _ref = this.styles;
      for (key in _ref) {
        value = _ref[key];
        obj.style(key, value);
      }
      return true;
    };

    N3Annotation.prototype.radius = function(r) {
      if (!(this.type === 'circle' || this.type === 'ellipse')) {
        throw 'not an ellipse/circle';
      }
      this.arguments[0] = r;
      return this;
    };

    N3Annotation.prototype.center = function(_arg) {
      var cx, cy;
      cx = _arg[0], cy = _arg[1];
      if (!(this.type === 'circle' || this.type === 'ellipse')) {
        throw 'not an ellipse/circle';
      }
      this.arguments[1] = [cx, cy];
      return this;
    };

    N3Annotation.prototype.start = function(_arg, arrow) {
      var x, y;
      x = _arg[0], y = _arg[1];
      if (this.type !== 'line') throw 'not a line';
      this.arguments[0] = [x, y];
      this.arguments[1] = arrow;
      return this;
    };

    N3Annotation.prototype.end = function(_arg, arrow) {
      var x, y;
      x = _arg[0], y = _arg[1];
      if (this.type !== 'line') throw 'not a line';
      this.arguments[2] = [x, y];
      this.arguments[3] = arrow;
      return this;
    };

    N3Annotation.prototype.size = function(_arg) {
      var x, y;
      x = _arg[0], y = _arg[1];
      if (this.type !== 'rectangle') throw 'not a rectangle';
      this.arguments[0] = [x, y];
      return this;
    };

    N3Annotation.prototype.pos = function(_arg) {
      var x, y;
      x = _arg[0], y = _arg[1];
      if (!(this.type === 'rectangle' || this.type === 'label')) {
        throw 'not a label/rectangle';
      }
      this.arguments[this.type === 'rectangle' ? 1 : 2] = [x, y];
      return this;
    };

    N3Annotation.prototype.text = function(str) {
      if (this.type !== 'label') throw 'not a label';
      this.arguments[0] = str;
      return this;
    };

    N3Annotation.prototype.html = function(html) {
      if (this.type !== 'label') throw 'not a label';
      this.arguments[1] = html;
      return this;
    };

    return N3Annotation;

  })();

  n3.annotation = function(typeId) {
    return new N3Annotation(typeId);
  };

}).call(this);
