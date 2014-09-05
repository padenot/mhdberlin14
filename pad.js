pad.prototype = extend(Instrument);

function pad(ctx) {
  Instrument.call(this, ctx);

  this.osc = ac.createOscillator();
  this.osc.type = "triangle";
  this.osc2 = ac.createOscillator();
  this.osc2.type = "triangle";

  this.lfo = ac.createOscillator();
  this.lfogain = ac.createGain();
  this.lfo.type = "sine";

  this.lp = ac.createBiquadFilter();
  this.lp.type = "lowpass";

  this.lfo.connect(this.lfogain);
  this.lfogain.connect(this.lp.frequency);

  this.lfoDetune = ac.createOscillator();
  this.lfoDetuneGain = ac.createGain();
  this.lfoDetune.connect(this.lfoDetuneGain);
  this.lfoDetuneGain.connect(this.osc2.detune);

  this.gain = ac.createGain();
  this.osc.connect(this.gain);
  this.osc2.connect(this.gain);
  this.gain.connect(this.lp);

  this.delay = ac.createDelay();
  this.delayGain = ac.createGain();
  this.lp.connect(this.delayGain);
  this.delayGain.connect(this.delay);
  this.delay.connect(this.delayGain);

  this.gain.gain.setValueAtTime(0.0, ac.currentTime);

  this.osc.start(0);
  this.osc2.start(0);
  this.lfo.start();
  this.lfoDetune.start();

  this.register_param2(this.osc2.detune, "osc-detune", 10, 0, 100, 1);
  this.register_param2(this.lfogain.gain, "lfo-gain", 100, 0, 10000, 10);
  this.register_param2(this.lfo.frequency, "lfo-speed-hz", 1, 0, 32, 1);
  this.register_param2(this.lfoDetuneGain.gain, "lfo-detune-gain", 10, 0, 50, 1);
  this.register_param2(this.lfoDetune.frequency, "lfo-detune-speed-hz", 1, 0, 32, 1);
  // this.register_param2([this.osc.frequency, this.osc2.frequency], "osc-freq-hz", 400, 0, 20000, 1);
  this.register_param2(this.lp.frequency, "lp-freq-hz", 3000, 0, 20000, 1);
  this.register_param2(this.lp.gain, "lp-gain", 30, -10, 100, 1);
  this.register_param2(this.lp.Q, "lp-q", 10, 0, 100, 1);
  this.register_param2(this.delay.delayTime, "delay-time", 0.3, 0.0001, 1, 0.001);
  this.register_param2(this.delayGain.gain, "delay-feedback", 0.3, 0.0, 1.1, 0.1);
  // need to redo the buffer, etc.
  // this.register_param(reverb., "reverb-length", 2, 0, 10, 0.1);
  // this.register_param(, "reverb-decay", 5, 0, 10, 0.1);
  this.register_param("attack", 10, 0, 30, 0.1);
  this.register_param("sustain", 10, 0, 30, 0.1);
  this.register_param("lowfreq", 75, 1, 20000, 1);
  this.register_param("highfreq", 8000, 1, 20000, 1);
}

pad.prototype.trigger = function(note, velocity, time) {
  this.osc.frequency.value = this.osc2.frequency.value = n2f(note);
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);
  this.gain.gain.linearRampToValueAtTime(velocity2gain(velocity), ac.currentTime + this.p("attack"));
  this.gain.gain.setTargetAtTime(0.0, ac.currentTime + this.p("attack") + this.p("sustain"), 1.0);
  // this.lp.frequency.setValueAtTime(this.p("lowfreq"), ac.currentTime);
  // this.lp.frequency.linearRampToValueAtTime(this.p("highfreq"), ac.currentTime + this.p("attack"));
  // this.lp.frequency.linearRampToValueAtTime(this.p("lowfreq"), ac.currentTime + this.p("attack") + this.p("sustain") + 2.0);
}

pad.prototype.name = function() {
  return "pad";
}

pad.prototype.connect = function(node) {
  this.delayGain.connect(node);
}
