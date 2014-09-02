snare.prototype = extend(Instrument);

function snare(ctx) {
  Instrument.call(this, ctx);

  this.register_param("noisegain", 0.6, 0.0, 2.0, 0.01);
  this.register_param("noisedecay", 0.03, 0.01, 2, 0.01);
  this.register_param("filterfreq", 3000, 100, 20000, 1);
  this.register_param("osc1freq", 111 + 175, 100, 20000, 1);
  this.register_param("osc2freq", 111 + 224, 100, 20000, 1);
  this.register_param("osc3freq", 330, 100, 20000, 1);
  this.register_param("osc4freq", 180, 100, 20000, 1);
  this.register_param("oscgain", 1.0, 0.0, 2.0, 0.01);
  this.register_param("oscdecay", 0.01, 0.01, 2, 0.01);
  this.register_param("trianglegain", 0.1, 0.0, 2.0, 0.01);
  this.register_param("sinegain", 0.2, 0.0, 2.0, 0.01);

  this.mastergain = ctx.createGain();

  this.white_noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  var b = this.white_noise.getChannelData(0);
  for (var i = 0; i < b.length; i++) {
    b[i] = Math.random() * 2 - 1;
  }
  this.filter = ctx.createBiquadFilter()
  this.filter.type = "lowpass";
  this.filter.frequency.value = this.p("filterfreq");
  this.filter.connect(this.mastergain)

  this.adsrnoise = ctx.createGain();
  this.adsrnoise.connect(this.filter);

  this.osc1 = ctx.createOscillator();
  this.osc2 = ctx.createOscillator();
  this.osc1.type = "triangle";
  this.osc2.type = "triangle";
  this.osc1.frequency.value = this.p("osc1freq");
  this.osc2.frequency.value = this.p("osc2freq");

  this.osc1.start(0);
  this.osc2.start(0);

  this.osc3 = ctx.createOscillator();
  this.osc4 = ctx.createOscillator();
  this.osc3.type = "sine";
  this.osc4.type = "sine";
  this.osc3.frequency.value = this.p("osc3freq");
  this.osc4.frequency.value = this.p("osc4freq");

  this.osc3.start(0);
  this.osc4.start(0);

  this.adsrosc = ctx.createGain();
  this.adsrosc.gain.value = 0;


  this.trianglegain = ctx.createGain();
  this.sinegain = ctx.createGain();

  this.trianglegain.gain.value = this.p("trianglegain");
  this.sinegain.gain.value = this.p("sinegain");

  this.osc1.connect(this.trianglegain);
  this.osc2.connect(this.trianglegain);
  this.osc3.connect(this.sinegain);
  this.osc4.connect(this.sinegain);

  this.sinegain.connect(this.adsrosc);
  this.trianglegain.connect(this.adsrosc);

  this.adsrosc.connect(this.mastergain);
}

snare.prototype.trigger = function(velocity, time) {
  var t = time || this.ctx.currentTime;
  var v = velocity2gain(velocity);

  var s = this.ctx.createBufferSource()
  s.connect(this.adsrnoise);
  s.buffer = this.white_noise;

  this.adsrnoise.gain.setValueAtTime(0, t);
  this.adsrnoise.gain.linearRampToValueAtTime(v * this.p("noisegain"), t + 0.01);
  this.adsrnoise.gain.setTargetAtTime(0, t + 0.02, this.p("noisedecay"));

  this.adsrosc.gain.setValueAtTime(0, t);
  this.adsrosc.gain.linearRampToValueAtTime(v * this.p("oscgain"), t + 0.01);
  this.adsrosc.gain.setTargetAtTime(0, t + 0.02, this.p("oscdecay"));

  this.filter.frequency.setValueAtTime(this.p("filterfreq"), t);

  this.sinegain.gain.setValueAtTime(this.p("sinegain"), t);
  this.trianglegain.gain.setValueAtTime(this.p("trianglegain"), t);

  this.osc1.frequency.setValueAtTime(this.p("osc1freq"), t);
  this.osc2.frequency.setValueAtTime(this.p("osc2freq"), t);

  s.start(time);
}

snare.prototype.name = function() {
  return "snare";
}

snare.prototype.connect = function(node) {
  this.mastergain.connect(node);
}


