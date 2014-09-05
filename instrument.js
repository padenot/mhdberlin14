function Instrument(ctx) {
  this.params = {};
  this.ctx = ctx;
}

Instrument.prototype.init = function(ctx) {
  this.params = {};
  this.ctx = ctx;
};

Instrument.prototype.get_params = function() {
  return this.params;
};

Instrument.prototype.register_param = function(name, initial, min, max, step) {
  this.params[name] = {};
  this.params[name].value = initial;
  this.params[name].min = min;
  this.params[name].max = max;
  this.params[name].step = step;
};

Instrument.prototype.register_param2 = function(audioparam, name, initial, min, max, step) {
  this.register_param(name, initial, min, max, step);
  this.params[name].audio_param = audioparam;
  if (this.params[name].audio_param instanceof Array) {
    this.params[name].audio_param.forEach(function(e) {
      e.setValueAtTime(initial, ac.currentTime);
    });
  } else {
    this.params[name].audio_param.setValueAtTime(initial, ac.currentTime);
  }
};

Instrument.prototype.set_param = function(key, val) {
  var p = this.params[key];
  p.value = clamp(val, p.min, p.max);
  if (p.audio_param) {
    if (p.audio_param instanceof Array) {
      p.audio_param.forEach(function(e) {
          e.setValueAtTime(p.value, ac.currentTime);
          });
    } else {
      p.audio_param.setValueAtTime(p.value, ac.currentTime);
    }
  }
};

Instrument.prototype.copy_params = function(other) {
  this.params = other.get_params();
};

Instrument.prototype.get_param = function(name) {
  return this.params[name];
};

Instrument.prototype.p = function(name) {
  return this.params[name].value;
};

