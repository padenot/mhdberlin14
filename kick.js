kick.prototype = extend(Instrument);

function kick(ctx) {
  this.body = ctx.createOscillator();
  this.body.type = "sine";

  Instrument.call(this, ctx);

  this.register_param("highfreq", 200, 50, 400, 1);
  this.register_param("basefreq", 60, 30, 150, 1);
  this.register_param("endfreq", 30, 15, 100, 1);
  this.register_param("bodyfreqdecay", 0.3, 0.01, 2, 0.01);
  this.register_param("bodydecay", 0.07, 0.01, 2, 0.01);
  this.register_param("bodygain", 1, 0, 2, 0.01);

  this.register_param("popfreqdecay", 0.3, 0.01, 2, 0.01);
  this.register_param("popdecay", 0.02, 0.001, 0.1, 0.001);
  this.register_param("popgain", 0.5, 0, 2, 0.01);
  this.register_param("pophigh", 150, 50, 500, 1);
  this.register_param("poplow", 100, 30, 400, 1);

  this.register_param("clickdecay", 0.0001, 0.001, 0.005, 0.00001);
  this.register_param("clickgain", 0.1, 0, 2, 0.01);
  this.register_param("clickfreq", 40, 20, 10000, 1);

  this.body.frequency.value = this.p("basefreq");
  this.body.start(0);

  this.pop = ctx.createOscillator();
  this.pop.type = "sine";
  this.pop.frequency.value = this.p("pophigh");
  this.pop.start(0);

  this.click = ctx.createOscillator();
  this.click.type = "square";
  this.click.frequency.value = this.p("clickfreq");
  this.click.start(0);

  this.adsrbody = ctx.createGain();
  this.adsrbody.gain.setValueAtTime(0, 0);

  this.adsrpop = ctx.createGain();
  this.adsrpop.gain.setValueAtTime(0, 0);

  this.adsrclick = ctx.createGain();
  this.adsrclick.gain.setValueAtTime(0, 0);

  this.body.connect(this.adsrbody);
  this.pop.connect(this.adsrpop);
  this.click.connect(this.adsrclick);

  // does not process
  this.lowpass = ctx.createBiquadFilter();
  this.lowpass.type = "lowpass";
  this.lowpass.frequency.value = 20000;

  this.mixer = ctx.createGain();
  this.mixer.gain.value = 0.6;
  this.mixer.connect(this.lowpass)

  this.adsrbody.connect(this.mixer);
  this.adsrpop.connect(this.mixer);
  this.adsrclick.connect(this.mixer);
}

kick.prototype.connect = function(node) {
  this.lowpass.connect(node);
}
kick.prototype.trigger = function(velocity, time) {
  var t = time || this.ctx.currentTime;
  var v = velocity2gain(velocity);

  this.body.frequency.value = this.p("basefreq");
  this.pop.frequency.value = this.p("pophigh");
  this.click.frequency.value = this.p("clickfreq");

  this.body.frequency.cancelScheduledValues(t);
  this.body.frequency.setValueAtTime(this.p("highfreq"), t);
  this.body.frequency.linearRampToValueAtTime(this.p("basefreq"), t + 0.001, 0.001);
  this.body.frequency.setTargetAtTime(this.p("endfreq"), t + 0.002, this.p("bodyfreqdecay"))

  this.pop.frequency.cancelScheduledValues(t);
  this.pop.frequency.setValueAtTime(this.p("pophigh"), t);
  this.pop.frequency.setTargetAtTime(this.p("poplow"), t + 0.0001, this.p("popfreqdecay"));

  // adsr
  this.adsrbody.gain.cancelScheduledValues(t);
  this.adsrbody.gain.setValueAtTime(0, t);
  this.adsrbody.gain.linearRampToValueAtTime(v * this.p("bodygain"), t + 0.01);
  this.adsrbody.gain.setTargetAtTime(0, t + 0.02, this.p("bodydecay"));

  // this.adsrpop.gain.cancelScheduledValues(t);
  // this.adsrpop.gain.setValueAtTime(0, t);
  // this.adsrpop.gain.linearRampToValueAtTime(v * this.p("popgain"), t + 01);
  // this.adsrpop.gain.setTargetAtTime(0, t + 0.02, this.p("popdecay"));

  this.adsrclick.gain.cancelScheduledValues(t);
  this.adsrclick.gain.setValueAtTime(0, t);
  this.adsrclick.gain.setValueAtTime(v * this.p("clickgain"), t + 0.0001);
  this.adsrclick.gain.setTargetAtTime(0, t + 0.0002, this.p("clickdecay"));
}

kick.prototype.name = function() {
  return "kick";
}
