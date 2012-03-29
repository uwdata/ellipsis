(function() {
  var N3Annotation, N3Scene, N3State, N3Timeline, N3Trigger, N3Vis,
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

  n3.util.iterate = function() {
    var args, arr, delay, step;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    arr = [];
    step = args[args.length - 2];
    delay = args[args.length - 1];
    if (arguments.length === 3) {
      arr = args[0];
    } else if (arguments.length === 4) {
      arr = d3.range(args[0], args[1], step);
    }
    return function(vis, stateId) {
      var callback, currIndex, interval;
      currIndex = 0;
      callback = function() {
        vis.state(stateId, arr[currIndex++]);
        if (currIndex >= arr.length) return window.clearInterval(interval);
      };
      interval = window.setInterval(callback, delay);
      return false;
    };
  };

  N3State = (function() {

    function N3State(visId, stateId, validValues, continuous) {
      this.visId = visId;
      this.stateId = stateId;
      this.validValues = validValues;
      this.continuous = continuous;
      this.bindings = [];
    }

    N3State.prototype.get = function() {
      return this.val;
    };

    N3State.prototype.set = function(val) {
      var valid;
      this.prevVal = this.val;
      valid = this.continuous ? val >= this.validValues[0] && val <= this.validValues[1] : this.validValues.indexOf(val) !== -1;
      if (!valid) {
        throw "" + val + " not in the list of valid values: " + this.validValues;
      }
      this.val = val;
      return this.notify();
    };

    N3State.prototype.bind = function(funcPtr) {
      return this.bindings.push(funcPtr);
    };

    N3State.prototype.notify = function() {
      var binding, _i, _len, _ref, _ref2, _results;
      if ((_ref = N3Vis.lookup[this.visId]) != null) {
        if (typeof _ref.renderFn === "function") _ref.renderFn();
      }
      N3Trigger.notify(N3Trigger.TYPES.VIS, [this.visId, this.stateId], this.val);
      _ref2 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        binding = _ref2[_i];
        _results.push(binding(this.val));
      }
      return _results;
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
        if (typeof this.dataObj === 'function') {
          return this.dataObj();
        } else {
          return this.dataObj;
        }
      }
    };

    N3Vis.prototype.state = function(stateId, arg2) {
      var _ref, _ref2;
      if (arguments.length >= 2) {
        if (arg2 instanceof Array) {
          this.states[stateId] = new N3State(this.visId, stateId, arg2, arguments[2]);
        } else {
          if (this.states[stateId] == null) {
            throw "no such state '" + stateId + "'";
          }
          if ((_ref = this.states[stateId]) != null) _ref.set(arg2);
        }
        return this;
      } else {
        if (this.states[stateId] == null) throw "no such state '" + stateId + "'";
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

    N3Vis.prototype.bind = function(stateId, funcPtr) {
      var _ref;
      if (this.states[stateId] == null) throw "no such state '" + stateId + "'";
      if ((_ref = this.states[stateId]) != null) _ref.bind(funcPtr);
      return this;
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
        enterFn: function(r, _arg) {
          var c, cx, cy, selector, stage;
          cx = _arg[0], cy = _arg[1];
          selector = n3.util.getSelector('circle', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          c = stage.selectAll(selector).data(this.data() != null ? this.data() : [0]);
          c.enter().append('svg:circle').attr('r', r).attr('cx', cx).attr('cy', cy);
          c.transition().attr('r', r).attr('cx', cx).attr('cy', cy);
          this.applyAttrs(c);
          this.applyStyles(c);
          return true;
        },
        exitFn: function(r, _arg) {
          var cx, cy, selector, stage;
          cx = _arg[0], cy = _arg[1];
          selector = n3.util.getSelector('circle', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          stage.selectAll(selector).remove();
          return true;
        }
      },
      ellipse: {
        enterFn: function(_arg, _arg2) {
          var cx, cy, e, rx, ry, selector, stage;
          rx = _arg[0], ry = _arg[1];
          cx = _arg2[0], cy = _arg2[1];
          selector = n3.util.getSelector('ellipse', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          e = stage.selectAll(selector).data(this.data() != null ? this.data() : [0]);
          e.enter().append('svg:ellipse').attr('rx', rx).attr('ry', ry).attr('cx', cx).attr('cy', cy);
          e.transition().attr('rx', rx).attr('ry', ry).attr('cx', cx).attr('cy', cy);
          this.applyAttrs(e);
          this.applyStyles(e);
          return true;
        },
        exitFn: function(_arg, _arg2) {
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
        enterFn: function(_arg, arrow1, _arg2, arrow2) {
          var l, selector, stage, x1, x2, y1, y2;
          x1 = _arg[0], y1 = _arg[1];
          x2 = _arg2[0], y2 = _arg2[1];
          selector = n3.util.getSelector('line', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          l = stage.selectAll(selector).data(this.data() != null ? this.data() : [0]);
          l.enter().append('svg:line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
          l.transition().attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
          this.applyAttrs(l);
          this.applyStyles(l);
          return true;
        },
        exitFn: function(_arg, arrow1, _arg2, arrow2) {
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
        enterFn: function(_arg, _arg2) {
          var h, r, selector, stage, w, x, y;
          w = _arg[0], h = _arg[1];
          x = _arg2[0], y = _arg2[1];
          selector = n3.util.getSelector('rect', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          r = stage.selectAll(selector).data(this.data() != null ? this.data() : [0]);
          r.enter().append('svg:rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
          r.transition().attr('x', x).attr('y', y).attr('width', w).attr('height', h);
          this.applyAttrs(r);
          this.applyStyles(r);
          return true;
        },
        exitFn: function(_arg, _arg2) {
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
        enterFn: function(text, html, _arg) {
          var d, selector, stage, x, y;
          x = _arg[0], y = _arg[1];
          selector = n3.util.getSelector('div', this.attrs);
          stage = this.vis() != null ? this.vis().stage() : d3;
          this.styles['position'] = 'absolute';
          this.styles['left'] = (stage.property('offsetLeft') + x) + 'px';
          this.styles['top'] = (stage.property('offsetTop') + y) + 'px';
          d = d3.select('body').selectAll(selector).data(this.data() != null ? this.data() : [0]);
          d.enter().append('div').text(text).html(html);
          this.applyAttrs(d);
          this.applyStyles(d);
          return true;
        },
        exitFn: function(text, html, _arg) {
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
      this.enterFn = (_ref = N3Annotation.types[this.type]) != null ? _ref.enterFn : void 0;
      this.exitFn = (_ref2 = N3Annotation.types[this.type]) != null ? _ref2.exitFn : void 0;
      this.annotId = this.type + "" + new Date().getTime();
      this.autoExitFlag = true;
      this.arguments = [];
      this.attrs = {};
      this.styles = {};
      return this;
    }

    N3Annotation.prototype.enter = function(enterFn) {
      var _base, _name;
      this.enterFn = enterFn;
      (_base = N3Annotation.types)[_name = this.type] || (_base[_name] = {});
      N3Annotation.types[this.type].enterFn = enterFn;
      return this;
    };

    N3Annotation.prototype.exit = function(exitFn) {
      var _base, _name;
      this.exitFn = exitFn;
      (_base = N3Annotation.types)[_name = this.type] || (_base[_name] = {});
      N3Annotation.types[this.type].exitFn = exitFn;
      return this;
    };

    N3Annotation.prototype.autoExit = function(autoExitFlag) {
      this.autoExitFlag = autoExitFlag;
      return this;
    };

    N3Annotation.prototype.data = function(data) {
      if (arguments.length === 1) {
        this.dataObj = data;
        return this;
      } else {
        if (typeof this.dataObj === 'function') {
          return this.dataObj();
        } else {
          return this.dataObj;
        }
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
      return this.enterFn.apply(this, this.arguments);
    };

    N3Annotation.prototype.remove = function() {
      return this.exitFn.apply(this, this.arguments);
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

  n3.annotation.def = function(typeId) {
    return new N3Annotation(typeId);
  };

  N3Trigger = (function() {

    N3Trigger.TYPES = {
      VIS: 'vis',
      TIMELINE: 'timeline',
      DELAY: 'delay',
      DOM: 'dom',
      OR: 'or',
      AND: 'and'
    };

    N3Trigger.CONDITIONS = {
      IS: 'is',
      NOT: 'not',
      GT: 'gt',
      LT: 'lt',
      GTE: 'gte',
      LTE: 'lte'
    };

    N3Trigger.WHERE = {
      ELAPSED: 'elapsed',
      DELAY: 'delay_'
    };

    N3Trigger.registered = {};

    N3Trigger.register = function(trigger) {
      var t, _base, _base2, _base3, _base4, _i, _len, _name, _name2, _name3, _name4, _ref,
        _this = this;
      (_base = this.registered)[_name = trigger.type] || (_base[_name] = {});
      (_base2 = this.registered[trigger.type])[_name2 = trigger.test] || (_base2[_name2] = {});
      this.registered[trigger.type][trigger.test][trigger.triggerId] = trigger;
      if (trigger.type === this.TYPES.OR || trigger.type === this.TYPES.AND) {
        if (trigger.triggers != null) {
          _ref = trigger.triggers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            (_base3 = this.registered)[_name3 = trigger.type] || (_base3[_name3] = {});
            (_base4 = this.registered[t.type])[_name4 = t.test] || (_base4[_name4] = {});
            this.registered[t.type][t.test][t.triggerId] = trigger;
          }
        }
      }
      if (trigger.type === this.TYPES.DOM) {
        d3.select(trigger.test).on(trigger.value, function() {
          return n3.trigger.notify(_this.TYPES.DOM, trigger.test, trigger.value);
        });
      }
      return true;
    };

    N3Trigger.deregister = function(trigger) {
      var test, triggerId, type, _ref, _ref2, _ref3;
      _ref = [trigger.type, trigger.test, trigger.triggerId], type = _ref[0], test = _ref[1], triggerId = _ref[2];
      trigger = (_ref2 = this.registered[type][test]) != null ? _ref2[triggerId] : void 0;
      if (type === this.TYPES.DOM) d3.select(trigger.test).on(trigger.value, null);
      if ((_ref3 = this.registered[type][test]) != null) delete _ref3[triggerId];
      return true;
    };

    N3Trigger.notify = function(type, test, value) {
      var trigger, triggerId, _ref, _ref2;
      if (((_ref = this.registered[type]) != null ? _ref[test] : void 0) != null) {
        _ref2 = this.registered[type][test];
        for (triggerId in _ref2) {
          trigger = _ref2[triggerId];
          if (trigger.evaluate(test, value)) N3Timeline.notifyTrigger(trigger);
        }
      }
      return true;
    };

    function N3Trigger() {
      var binding, triggers;
      binding = arguments[0], triggers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (arguments.length === 1) {
        if (typeof binding === 'object') {
          if (binding.visId != null) {
            this.type = N3Trigger.TYPES.VIS;
            this.test || (this.test = [binding.visId, void 0]);
          } else {
            this.type = N3Trigger.TYPES.TIMELINE;
          }
        } else if (typeof binding === 'string') {
          if (N3Vis.lookup[binding] != null) {
            this.type = N3Trigger.TYPES.VIS;
            this.test || (this.test = [binding, void 0]);
          } else {
            this.type = N3Trigger.TYPES.DOM;
            this.test = binding;
          }
        }
      } else {
        this.type = binding;
        this.triggers = triggers;
      }
      this.triggerId = this.type + this.test + '' + Date.now() + (Math.random() * 11);
      return this;
    }

    N3Trigger.prototype.where = function(test) {
      if (this.type === N3Trigger.TYPES.VIS) {
        this.test[1] = test;
      } else {
        this.test = test;
      }
      return this;
    };

    N3Trigger.prototype.is = function(value) {
      this.value = value;
      this.condition = N3Trigger.CONDITIONS.IS;
      return this;
    };

    N3Trigger.prototype.not = function(value) {
      this.value = value;
      this.condition = N3Trigger.CONDITIONS.NOT;
      return this;
    };

    N3Trigger.prototype.gt = function(value) {
      this.value = value;
      this.condition = N3Trigger.CONDITIONS.GT;
      return this;
    };

    N3Trigger.prototype.greaterThan = function(value) {
      this.value = value;
      return this.gt(this.value);
    };

    N3Trigger.prototype.lt = function(value) {
      this.value = value;
      this.condition = N3Trigger.CONDITIONS.LT;
      return this;
    };

    N3Trigger.prototype.lessThan = function(value) {
      this.value = value;
      return this.lt(this.value);
    };

    N3Trigger.prototype.gte = function(value) {
      this.value = value;
      this.condition = N3Trigger.CONDITIONS.GTE;
      return this;
    };

    N3Trigger.prototype.greaterThanOrEqual = function(value) {
      this.value = value;
      return this.gte(this.value);
    };

    N3Trigger.prototype.lte = function(value) {
      this.value = value;
      this.condition = N3Trigger.CONDITIONS.LTE;
      return this;
    };

    N3Trigger.prototype.lessThanOrEqual = function(value) {
      this.value = value;
      return this.lte(this.value);
    };

    N3Trigger.prototype.on = function(value) {
      this.value = value;
      return this;
    };

    N3Trigger.prototype.fireDelay = function() {
      N3Timeline.notifyTrigger(this);
      return true;
    };

    N3Trigger.prototype.evaluate = function(notifiedTest, notifiedVal) {
      var c, result, trigger, _i, _j, _len, _len2, _ref, _ref2, _ref3,
        _this = this;
      if (this.type === N3Trigger.TYPES.DOM) {
        return true;
      } else if (this.type === N3Trigger.TYPES.OR) {
        _ref = this.triggers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          trigger = _ref[_i];
          result = (trigger.test + "") === (notifiedTest + "") ? trigger.evaluate(notifiedTest, notifiedVal) : false;
          if (result === true) return true;
        }
        return false;
      } else if (this.type === N3Trigger.TYPES.AND) {
        _ref2 = this.triggers;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          trigger = _ref2[_j];
          result = (trigger.test + "") === (notifiedTest + "") ? trigger.evaluate(notifiedTest, notifiedVal) : false;
          if (result === false && trigger.type === N3Trigger.TYPES.VIS) {
            result = trigger.evaluate(trigger.test, (_ref3 = N3Vis.lookup[trigger.test[0]]) != null ? _ref3.state(trigger.test[1]) : void 0);
          }
          if (result === false) return false;
        }
        return true;
      } else if (this.type === N3Trigger.TYPES.DELAY) {
        c = function() {
          return _this.fireDelay();
        };
        d3.timer(c, this.value);
        return false;
      } else {
        if ((this.type === N3Trigger.TYPES.DOM) || (this.condition === N3Trigger.CONDITIONS.IS && notifiedVal === this.value) || (this.condition === N3Trigger.CONDITIONS.NOT && notifiedVal !== this.value) || (this.condition === N3Trigger.CONDITIONS.GT && notifiedVal > this.value) || (this.condition === N3Trigger.CONDITIONS.LT && notifiedVal < this.value) || (this.condition === N3Trigger.CONDITIONS.GTE && notifiedVal >= this.value) || (this.condition === N3Trigger.CONDITIONS.LTE && notifiedVal <= this.value)) {
          return true;
        }
      }
      return false;
    };

    return N3Trigger;

  })();

  n3.trigger = function(binding) {
    return new N3Trigger(binding);
  };

  n3.trigger.or = function() {
    var triggers;
    triggers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(N3Trigger, [N3Trigger.TYPES.OR].concat(__slice.call(triggers)), function() {});
  };

  n3.trigger.and = function() {
    var triggers;
    triggers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(N3Trigger, [N3Trigger.TYPES.AND].concat(__slice.call(triggers)), function() {});
  };

  n3.trigger.notify = function(type, test, value) {
    return N3Trigger.notify(type, test, value);
  };

  n3.trigger.afterPrev = function(delay) {
    var t;
    t = new N3Trigger(N3Trigger.TYPES.DELAY, N3Trigger.WHERE.DELAY);
    return t.gte(delay);
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

    N3Scene.prototype.member = function(memberIndex) {
      var _ref;
      return (_ref = this.members[memberIndex + 1]) != null ? _ref.member : void 0;
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
        return this.subScenes[subSceneId];
      } else {
        subScene = new N3Scene(subSceneId);
        subScene.parent = this;
        this.subScenes[subSceneId] = subScene;
        return subScene;
      }
    };

    N3Scene.prototype.evalMember = function(memberIndex) {
      var m, val, vis, _ref;
      m = this.members[memberIndex];
      if (m == null) return true;
      vis = N3Vis.lookup[m.visId];
      if (m.state != null) {
        val = m.state.value;
        if (typeof val === 'function') {
          val = val(vis, m.state.id);
          if (val !== false) if (vis != null) vis.state(m.state.id, val);
        } else {
          if (vis != null) vis.state(m.state.id, m.state.value);
        }
      } else {
        if (typeof m.member === 'function') {
          m.member(vis);
        } else if (((_ref = m.member) != null ? _ref.annotId : void 0) != null) {
          m.member.vis(m.visId);
          m.member.add();
        }
      }
      N3Trigger.notify(N3Trigger.TYPES.DELAY, N3Trigger.WHERE.DELAY + memberIndex, 1);
      return true;
    };

    return N3Scene;

  })();

  n3.scene = function(sceneId) {
    var _base;
    return (_base = N3Scene.scenes)[sceneId] || (_base[sceneId] = new N3Scene(sceneId));
  };

  N3Timeline = (function() {

    function N3Timeline() {}

    N3Timeline.triggers = {};

    N3Timeline.transitions = {};

    N3Timeline.startTime = 0;

    N3Timeline.elapsedTime = 0;

    N3Timeline.paused = false;

    N3Timeline.switchScene = function(sceneId) {
      var currParent, currentScene, evaluateMembers, i, m, prevScene, transFunc, _i, _j, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.prevSceneId = this.currSceneId;
      this.prevParentId = this.currParentId;
      prevScene = this.prevParentId != null ? N3Scene.scenes[this.prevParentId].subScenes[this.prevSceneId] : N3Scene.scenes[this.prevSceneId];
      if (sceneId.indexOf('>') !== -1) {
        this.currParentId = sceneId.split('>')[0].trim();
        currParent = N3Scene.scenes[this.currParentId];
        this.currSceneId = sceneId.split('>')[1].trim();
        currentScene = currParent.subScenes[this.currSceneId];
      } else {
        this.currParentId = void 0;
        currParent = void 0;
        this.currSceneId = sceneId;
        currentScene = N3Scene.scenes[this.currSceneId];
      }
      if (prevScene != null) {
        if (!((prevScene.parent != null) && (currentScene.parent != null) && prevScene.parent.sceneId === currentScene.parent.sceneId)) {
          _ref = prevScene.members;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            m = _ref[_i];
            this.deregisterTrigger(m.trigger);
            if (m.state != null) continue;
            if (((_ref2 = m.member) != null ? _ref2.annotId : void 0) == null) {
              continue;
            }
            m.member.vis(m.visId);
            if (m.member.autoExitFlag) m.member.remove();
          }
        }
      }
      if (((_ref3 = this.transitions[this.prevSceneId]) != null ? _ref3[this.currSceneId] : void 0) != null) {
        _ref4 = this.transitions[this.prevSceneId][this.currSceneId];
        for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
          transFunc = _ref4[_j];
          transFunc(prevScene, currentScene);
        }
      }
      this.start(true);
      evaluateMembers = [];
      if (currentScene != null) {
        _ref5 = currentScene.members;
        for (i = 0, _len3 = _ref5.length; i < _len3; i++) {
          m = _ref5[i];
          evaluateMembers[i] = false;
          if (m.trigger != null) {
            if (m.trigger.type === N3Trigger.TYPES.DELAY) {
              m.trigger.where(N3Trigger.WHERE.DELAY + (i - 1));
            }
            this.registerTrigger(m.trigger, i);
            continue;
          }
          evaluateMembers[i] = true;
        }
        _ref6 = currentScene.members;
        for (i = 0, _len4 = _ref6.length; i < _len4; i++) {
          m = _ref6[i];
          if (evaluateMembers[i]) currentScene.evalMember(i);
        }
      }
      return true;
    };

    N3Timeline.registerTrigger = function(trigger, memberIndex) {
      if (trigger == null) return true;
      this.triggers[trigger.triggerId] = {
        sceneId: this.currSceneId,
        parentId: this.currParentId,
        memberIndex: memberIndex
      };
      N3Trigger.register(trigger);
      return true;
    };

    N3Timeline.deregisterTrigger = function(trigger) {
      if (this.triggers[trigger != null ? trigger.triggerId : void 0] == null) {
        return true;
      }
      delete this.triggers[trigger.triggerId];
      N3Trigger.deregister(trigger);
      return true;
    };

    N3Timeline.notifyTrigger = function(trigger) {
      var scene, t;
      if (this.triggers[trigger.triggerId] != null) {
        t = this.triggers[trigger.triggerId];
        scene = t.parentId != null ? N3Scene.scenes[t.parentId].subScenes[t.sceneId] : N3Scene.scenes[t.sceneId];
        if (t.memberIndex != null) {
          if (scene != null) scene.evalMember(t.memberIndex);
        }
        if (trigger.type === N3Trigger.TYPES.TIMELINE) {
          this.deregisterTrigger(trigger);
        }
      }
      return true;
    };

    N3Timeline.parseTransSyntax = function(transQ) {
      var id, scene, sceneId, scenes, subSceneId;
      if (transQ instanceof Array) return transQ;
      scenes = [];
      if (transQ === '*') {
        for (sceneId in N3Scene.scenes) {
          scenes.push(sceneId);
          scene = N3Scene.scenes[sceneId];
          for (subSceneId in scene.subScenes) {
            scenes.push(subSceneId);
          }
        }
      } else if (transQ.indexOf('>') !== -1) {
        scenes.push(((function() {
          var _i, _len, _ref, _results;
          _ref = transQ.split('>');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            _results.push(id.trim());
          }
          return _results;
        })()).join('>'));
      } else {
        scenes.push(transQ);
      }
      return scenes;
    };

    N3Timeline.transition = function(fromScenes, toScenes, func) {
      var fromScene, fromSceneId, toScene, toSceneId, _base, _base2, _i, _j, _len, _len2;
      fromScenes = this.parseTransSyntax(fromScenes);
      toScenes = this.parseTransSyntax(toScenes);
      for (_i = 0, _len = fromScenes.length; _i < _len; _i++) {
        fromScene = fromScenes[_i];
        fromSceneId = typeof fromScene === 'object' ? fromScene.sceneId : fromScene;
        (_base = this.transitions)[fromSceneId] || (_base[fromSceneId] = {});
        for (_j = 0, _len2 = toScenes.length; _j < _len2; _j++) {
          toScene = toScenes[_j];
          toSceneId = typeof toScene === 'object' ? toScene.sceneId : toScene;
          (_base2 = this.transitions[fromSceneId])[toSceneId] || (_base2[toSceneId] = []);
          this.transitions[fromSceneId][toSceneId].push(func);
        }
      }
      return this;
    };

    N3Timeline.start = function(reset) {
      var _this = this;
      if (reset) {
        this.startTime = Date.now();
        this.elapsedTime = 0;
      }
      this.paused = false;
      return d3.timer(function() {
        return _this.incrementTime();
      });
    };

    N3Timeline.incrementTime = function() {
      this.elapsedTime = Date.now() - this.startTime;
      N3Trigger.notify(N3Trigger.TYPES.TIMELINE, N3Trigger.WHERE.ELAPSED, this.elapsedTime);
      return this.paused;
    };

    N3Timeline.pause = function() {
      return this.paused = true;
    };

    return N3Timeline;

  })();

  n3.timeline || (n3.timeline = {});

  n3.timeline.switchScene = function(sceneId) {
    return N3Timeline.switchScene(sceneId);
  };

  n3.timeline.pause = function() {
    return N3Timeline.pause();
  };

  n3.timeline.resume = function() {
    return N3Timeline.start(false);
  };

  n3.timeline.elapsedTime = function() {
    return N3Timeline.elapsedTime;
  };

  n3.timeline.transition = function(fromScenes, toScenes, func) {
    return N3Timeline.transition(fromScenes, toScenes, func);
  };

}).call(this);
