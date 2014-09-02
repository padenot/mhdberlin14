pad.prototype = extend(Instrument);

function pad(ctx) {
  Instrument.call(this, ctx);

  this.osc = ac.createOscillator();
  this.osc.type = "sawtooth";
  this.osc2 = ac.createOscillator();
  this.osc2.type = "sawtooth";

  this.lfo = ac.createOscillator();
  this.lfogain = ac.createGain();
  this.lfo.type = "sine";

  this.lp = ac.createBiquadFilter();
  this.lp.type = "lowpass";

  var len = 2 * ac.sampleRate;
  var decay = 5;
  var buffer = ac.createBuffer(2, len, ac.sampleRate)
  var iL = buffer.getChannelData(0)
  var iR = buffer.getChannelData(1)
  var decay = 10.0;
  for(i=0,l=buffer.length;i<l;i++) {
    iL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    iR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }

  this.reverb = ac.createConvolver();
  this.reverb.buffer = buffer;

  this.lfo.connect(this.lfogain);
  this.lfogain.connect(this.lp.frequency);
  this.lfo.start();

  this.gain = ac.createGain();
  this.osc.connect(this.gain);
  this.osc2.connect(this.gain);
  this.gain.connect(this.lp);
  this.lp.connect(this.reverb);

  this.gain.gain.setValueAtTime(0.0, ac.currentTime);

  this.osc.start(0);
  this.osc2.start(0);

  this.register_param2(this.osc2.detune, "osc-detune", 10, 0, 100, 1);
  this.register_param2(this.lfogain.gain, "lfo-gain", 100, 0, 10000, 10);
  this.register_param2(this.lfo.frequency, "lfo-speed-hz", 1, 0, 32, 1);
  this.register_param2([this.osc.frequency, this.osc2.frequency], "osc-freq-hz", 400, 0, 20000, 1);
  this.register_param2(this.lp.frequency, "lp-freq-hz", 1000, 0, 20000, 1);
  this.register_param2(this.lp.gain, "lp-gain", 30, 0, 100, 1);
  this.register_param2(this.lp.Q, "lp-q", 10, 0, 100, 1);
  // need to redo the buffer, etc.
  // this.register_param(reverb., "reverb-length", 2, 0, 10, 0.1);
  // this.register_param(, "reverb-decay", 5, 0, 10, 0.1);
  this.register_param("attack", 2, 0, 10, 0.1);
  this.register_param("sustain", 0, 0, 10, 0.1);
  this.register_param("lowfreq", 75, 1, 20000, 1);
  this.register_param("highfreq", 3000, 1, 20000, 1);

}

pad.prototype.trigger = function(velocity, time) {
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);
  this.gain.gain.linearRampToValueAtTime(1.0, ac.currentTime + this.p("attack"));
  this.gain.gain.setTargetAtTime(0.0, ac.currentTime + this.p("attack") + this.p("sustain"), 1.0);
  this.lp.frequency.setValueAtTime(this.p("lowfreq"), ac.currentTime);
  this.lp.frequency.linearRampToValueAtTime(this.p("highfreq"), ac.currentTime + this.p("attack"));
  this.lp.frequency.linearRampToValueAtTime(this.p("lowfreq"), ac.currentTime + this.p("attack") + this.p("sustain") + 2.0);
}

pad.prototype.name = function() {
  return "pad";
}

pad.prototype.connect = function(node) {
  this.reverb.connect(node);
}
