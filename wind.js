wind.prototype = extend(Instrument);

function wind(ctx) {
  Instrument.call(this, ctx);

  this.osc = ac.createOscillator();
  this.osc.type = "sawtooth";

  this.lp = ac.createBiquadFilter();
  this.lp.type = "lowpass";

  this.hp = ac.createBiquadFilter();
  this.hp.type = "highpass";

  this.gain = ac.createGain();
  this.osc.connect(this.gain);
  this.gain.connect(this.lp);
  this.lp.connect(this.hp);

  this.gain.gain.setValueAtTime(0.0, ac.currentTime);

  this.osc.start(0);

  this.register_param2(this.osc.frequency, "osc-freq-hz", 2000, 0, 20000, 1);
  this.register_param2(this.lp.frequency, "lp-freq-hz", 2000, 0, 20000, 1);
  this.register_param2(this.lp.gain, "lp-gain", 30, 0, 100, 1);
  this.register_param2(this.lp.Q, "lp-q", 10, 0, 100, 1);
  this.register_param2(this.hp.frequency, "hp-freq-hz", 300, 0, 20000, 1);
  this.register_param2(this.hp.gain, "hp-gain", 30, 0, 100, 1);
  this.register_param2(this.hp.Q, "hp-q", 10, 0, 100, 1);
  this.register_param("attack", 2, 0, 10, 0.1);
  this.register_param("sustain", 0, 0, 10, 0.1);
  this.register_param("lowfreq", 75, 1, 20000, 1);
  this.register_param("highfreq", 3000, 1, 20000, 1);

}

wind.prototype.trigger = function(velocity, time) {
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);
  this.gain.gain.linearRampToValueAtTime(1.0, ac.currentTime + this.p("attack"));
  this.gain.gain.setTargetAtTime(0.0, ac.currentTime + this.p("attack") + this.p("sustain"), 1.0);
  this.lp.frequency.setValueAtTime(this.p("lowfreq"), ac.currentTime);
}

wind.prototype.name = function() {
  return "wind";
}

wind.prototype.connect = function(node) {
  this.hp.connect(node);
}
