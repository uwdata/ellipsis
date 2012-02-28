(function() {
  var N3Annotation, N3Scene, N3State, N3Vis,
    __slice = Array.prototype.slice;

  window.n3 = {
    version: '0.9.0'
  };

  n3.util = {};

  n3.util.getSelector = function(selector, attrs) {
    if ((attrs != null ? attrs.id : void 0) != null) {
      return selector + '#' + attrs['id'];
    } else if ((attrs != null ? attrs["class"] : void 0) != null) {
      return selector + '.' + attrs['class'].split(' ').join('.');
    } else {
      return selector;
    }
  };

  n3.util.clone = function(obj) {
    var copy, elem, key, val;
    if (!((obj != null) && typeof obj === 'object')) return obj;
    if (obj instanceof Array) {
      return copy = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = obj.length; _i < _len; _i++) {
          elem = obj[_i];
          _results.push(n3.util.clone(elem));
        }
        return _results;
      })();
    } else if (obj instanceof Object) {
      copy = {};
      for (key in obj) {
        val = obj[key];
        copy[key] = n3.util.clone(val);
      }
      return copy;
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

    N3Vis.prototype.state = function(stateId, arg2) {
      var _ref, _ref2;
      if (arguments.length === 2) {
        if (arg2 instanceof Array) {
          this.states[stateId] = new N3State(stateId, arg2, this.visId);
        } else {
          if ((_ref = this.states[stateId]) != null) _ref.set(arg2);
        }
        return this;
      } else {
        return (_ref2 = this.states[stateId]) != null ? _ref2.get() : void 0;
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
      circle: {
        adderFn: function(r, _arg) {
          var c, cx, cy, selector, stage;
          cx = _arg[0], cy = _arg[1];
          selector = n3.util.getSelector('circle', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          c = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
          c.enter().append('svg:circle').attr('r', r).attr('cx', cx).attr('cy', cy);
          c.transition().attr('r', r).attr('cx', cx).attr('cy', cy);
          this.applyAttrs(c);
          this.applyStyles(c);
          return true;
        },
        removerFn: function(r, _arg) {
          var cx, cy, selector, stage;
          cx = _arg[0], cy = _arg[1];
          selector = n3.util.getSelector('circle', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          stage.selectAll(selector).remove();
          return true;
        }
      },
      ellipse: {
        adderFn: function(_arg, _arg2) {
          var cx, cy, e, rx, ry, selector, stage;
          rx = _arg[0], ry = _arg[1];
          cx = _arg2[0], cy = _arg2[1];
          selector = n3.util.getSelector('ellipse', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          e = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
          e.enter().append('svg:ellipse').attr('rx', rx).attr('ry', ry).attr('cx', cx).attr('cy', cy);
          e.transition().attr('rx', rx).attr('ry', ry).attr('cx', cx).attr('cy', cy);
          this.applyAttrs(e);
          this.applyStyles(e);
          return true;
        },
        removerFn: function(_arg, _arg2) {
          var cx, cy, rx, ry, selector, stage;
          rx = _arg[0], ry = _arg[1];
          cx = _arg2[0], cy = _arg2[1];
          selector = n3.util.getSelector('ellipse', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          stage.selectAll(selector).remove();
          return true;
        }
      },
      line: {
        adderFn: function(_arg, arrow1, _arg2, arrow2) {
          var l, selector, stage, x1, x2, y1, y2;
          x1 = _arg[0], y1 = _arg[1];
          x2 = _arg2[0], y2 = _arg2[1];
          selector = n3.util.getSelector('line', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          l = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
          l.enter().append('svg:line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
          l.transition().attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
          this.applyAttrs(l);
          this.applyStyles(l);
          return true;
        },
        removerFn: function(_arg, arrow1, _arg2, arrow2) {
          var selector, stage, x1, x2, y1, y2;
          x1 = _arg[0], y1 = _arg[1];
          x2 = _arg2[0], y2 = _arg2[1];
          selector = n3.util.getSelector('line', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          stage.selectAll(selector).remove();
          return true;
        }
      },
      rectangle: {
        adderFn: function(_arg, _arg2) {
          var h, r, selector, stage, w, x, y;
          w = _arg[0], h = _arg[1];
          x = _arg2[0], y = _arg2[1];
          selector = n3.util.getSelector('rect', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          r = stage.selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
          r.enter().append('svg:rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
          r.transition().attr('x', x).attr('y', y).attr('width', w).attr('height', h);
          this.applyAttrs(r);
          this.applyStyles(r);
          return true;
        },
        removerFn: function(_arg, _arg2) {
          var h, selector, stage, w, x, y;
          w = _arg[0], h = _arg[1];
          x = _arg2[0], y = _arg2[1];
          selector = n3.util.getSelector('rect', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          stage.selectAll(selector).remove();
          return true;
        }
      },
      label: {
        adderFn: function(text, html, _arg) {
          var d, selector, stage, x, y;
          x = _arg[0], y = _arg[1];
          selector = n3.util.getSelector('div', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          this.styles['position'] = 'absolute';
          this.styles['left'] = x + 'px';
          this.styles['top'] = y + 'px';
          d = d3.select('body').selectAll(selector).data(this.dataObj != null ? this.dataObj : [0]);
          d.enter().append('div').text(text).html(html);
          this.applyAttrs(d);
          this.applyStyles(d);
          return true;
        },
        removerFn: function(text, html, _arg) {
          var selector, stage, x, y;
          x = _arg[0], y = _arg[1];
          selector = n3.util.getSelector('div', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          d3.selectAll(selector).remove();
          return true;
        }
      }
    };

    function N3Annotation(type) {
      var _ref, _ref2;
      this.type = type;
      this.adderFn = (_ref = N3Annotation.types[this.type]) != null ? _ref.adderFn : void 0;
      this.removerFn = (_ref2 = N3Annotation.types[this.type]) != null ? _ref2.removerFn : void 0;
      this.autoRemoveFlag = true;
      this.arguments = [];
      this.attrs = {};
      this.styles = {};
      return this;
    }

    N3Annotation.prototype.adder = function(adderFn) {
      var _base, _name;
      this.adderFn = adderFn;
      (_base = N3Annotation.types)[_name = this.type] || (_base[_name] = {});
      N3Annotation.types[this.type].adderFn = adderFn;
      return this;
    };

    N3Annotation.prototype.remover = function(removerFn) {
      var _base, _name;
      this.removerFn = removerFn;
      (_base = N3Annotation.types)[_name = this.type] || (_base[_name] = {});
      N3Annotation.types[this.type].removerFn = removerFn;
      return this;
    };

    N3Annotation.prototype.autoRemove = function(autoRemoveFlag) {
      this.autoRemoveFlag = autoRemoveFlag;
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
        if (typeof vis === 'object') vis = vis.visId;
        this.visId = vis;
        return this;
      } else {
        return N3Vis.lookup[this.visId];
      }
    };

    N3Annotation.prototype.add = function() {
      return this.adderFn.apply(this, this.arguments);
    };

    N3Annotation.prototype.remove = function() {
      return this.removerFn.apply(this, this.arguments);
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

    N3Annotation.prototype.applyAttrs = function(selection) {
      var key, value, _ref;
      if (selection == null) true;
      _ref = this.attrs;
      for (key in _ref) {
        value = _ref[key];
        selection.attr(key, value);
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

    N3Annotation.prototype.applyStyles = function(selection) {
      var key, value, _ref;
      if (selection == null) true;
      _ref = this.styles;
      for (key in _ref) {
        value = _ref[key];
        selection.style(key, value);
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

  N3Scene = (function() {

    N3Scene.scenes = {};

    function N3Scene(sceneId) {
      this.sceneId = sceneId;
      this.members = [];
      this.subScenes = {
        order: ''
      };
      return this;
    }

    N3Scene.prototype.set = function(vis, stateId, val, triggerObj) {
      var member;
      if (typeof vis === 'object') vis = vis.visId;
      member = {
        visId: vis,
        state: {
          id: stateId,
          value: val
        },
        trigger: triggerObj
      };
      this.members.push(member);
      return this;
    };

    N3Scene.prototype.add = function(vis, memberObj, triggerObj) {
      var member;
      if (typeof vis === 'object') vis = vis.visId;
      member = {
        visId: vis,
        member: memberObj,
        trigger: triggerObj
      };
      this.members.push(member);
      return this;
    };

    N3Scene.prototype.clone = function(sceneID) {
      var newScene;
      newScene = n3.scene(sceneID);
      newScene.members = n3.util.clone(this.members);
      newScene.subScenes = n3.util.clone(this.subScenes);
      return newScene;
    };

    N3Scene.prototype.subScene = function(subSceneId) {
      var subScene;
      if (this.subScenes[subSceneId] != null) {
        return this.subScenes;
      } else {
        subScene = new N3Scene(subSceneId);
        subScene.parent = this;
        this.subScenes[subSceneId] = subScene;
        return subScene;
      }
    };

    return N3Scene;

  })();

  n3.scene = function(sceneId) {
    var _base;
    return (_base = N3Scene.scenes)[sceneId] || (_base[sceneId] = new N3Scene(sceneId));
  };

}).call(this);
