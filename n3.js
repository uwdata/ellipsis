(function() {
  var N3Annotation, N3State, N3Vis,
    __slice = Array.prototype.slice;

  window.n3 = {
    version: '0.9.0'
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
        var cx, cy, r1, r2;
        r1 = _arg[0], r2 = _arg[1];
        cx = _arg2[0], cy = _arg2[1];
      },
      line: function(_arg, sArrow, _arg2, eArrow) {
        var ex, ey, sx, sy;
        sx = _arg[0], sy = _arg[1];
        ex = _arg2[0], ey = _arg2[1];
      },
      rectangle: function(_arg, corner, _arg2) {
        var w, x, y;
        w = _arg[0], y = _arg[1];
        x = _arg2[0], y = _arg2[1];
      },
      label: function(text, html, _arg) {
        var x, y;
        x = _arg[0], y = _arg[1];
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
      N3Annotation.types[type] = this.templateFn;
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

    N3Annotation.prototype.radius = function(r) {
      if (this.type !== 'circle') throw 'not a circle';
      this.arguments[0] = r;
      return this;
    };

    N3Annotation.prototype.radius = function(_arg) {
      var r1, r2;
      r1 = _arg[0], r2 = _arg[1];
      if (this.type !== 'ellipse') throw 'not an ellipse';
      this.arguments[0] = [r1, r2];
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

    N3Annotation.prototype.pos = function(arg1, arg2) {
      if (!(this.type === 'rectangle' || this.type === 'line')) {
        throw 'not a line/rectangle';
      }
      if (arguments.length === 1) {
        this.arguments[0] = arg1;
      } else {

      }
      if (arguments.length === 2) {
        this.arguments[1] = arg1;
        this.arguments[2] = arg2;
      }
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

}).call(this);
