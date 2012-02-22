(function() {
  var N3State, N3Vis;

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
    var consts, states;

    N3Vis.lookup = {};

    states = {};

    consts = {};

    function N3Vis(visId) {
      this.visId = visId;
    }

    N3Vis.prototype.stage = function(sel, w, h) {
      if (arguments != null) {
        this.stageSelector = sel;
        this.stageWidth = w;
        this.stageHeight = h;
        return this;
      } else {
        return d3.select(this.stageSelector);
      }
    };

    N3Vis.prototype.width = function(width) {
      if (arguments != null) {
        this.stageWidth = width;
        return this;
      } else {
        return this.stageWidth;
      }
    };

    N3Vis.prototype.height = function(height) {
      if (arguments != null) {
        this.stageHeight = height;
        return this;
      } else {
        return this.stageHeight;
      }
    };

    N3Vis.prototype.data = function(data) {
      if (arguments != null) {
        this.data = data;
        return this;
      } else {
        return this.data;
      }
    };

    N3Vis.prototype.state = function(stateId, validValues) {
      var _ref;
      if (arguments != null) {
        states.stateId = new N3State(stateId, validValues, this.visId);
        return this;
      } else {
        return (_ref = states.stateId) != null ? _ref.get() : void 0;
      }
    };

    N3Vis.prototype["const"] = function(constId, value) {
      if (arguments != null) {
        if (!(constId in consts)) consts.constId = value;
        return this;
      } else {
        return consts.constId;
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
    return (_base = N3Vis.lookup)[visId] || (_base[visId] = new NsVis(visId));
  };

}).call(this);
