bell.prototype = extend(Instrument);

function bell(ctx) {
  Instrument.call(this, ctx);
  this.partials = [
    { f: 0.56, g:0.25},
    { f: 0.92, g:0.50},
    { f: 1.19, g:0.5/2},
    { f: 1.71, g:0.5/4},
    { f: 2.00, g:0.5/8},
    { f: 2.74, g:0.5/16},
    { f: 3.00, g:0.5/32},
    { f: 3.76, g:0.5/64},
    { f: 4.00, g:0.5/128}
  ];

  this.osc = [];
  this.gain = [];
  this.mastergain = ac.createGain();

  for (var i = 0; i < this.partials.length; i++) {
    this.osc[i] = ac.createOscillator();
    this.gain[i] = ac.createGain();
    this.osc[i].connect(this.gain[i]);
    this.gain[i].gain.value = this.partials[i].g;
    this.osc[i].start(0);
    this.gain[i].connect(this.mastergain);
  }

  this.mastergain.gain.setValueAtTime(0.0, ac.currentTime);

  this.register_param("attack", 0.0, 0.0, 0.1, 0.01);
  this.register_param("decay", 1.0, 0.0, 4.0, 0.1);
}

bell.prototype.trigger = function(note, velocity, time) {
  for (var i = 0; i < this.partials.length; i++) {
    this.osc[i].frequency.value = n2f(note) * this.partials[i].f;
  }
  this.mastergain.gain.setValueAtTime(0.0, ac.currentTime);
  this.mastergain.gain.linearRampToValueAtTime(velocity2gain(velocity), ac.currentTime + this.p("attack"));
  this.mastergain.gain.setTargetAtTime(0.0, ac.currentTime + this.p("attack"), this.p("decay") / 8);
  // this.lp.frequency.setValueAtTime(this.p("lowfreq"), ac.currentTime);
  // this.lp.frequency.linearRampToValueAtTime(this.p("highfreq"), ac.currentTime + this.p("attack"));
  // this.lp.frequency.linearRampToValueAtTime(this.p("lowfreq"), ac.currentTime + this.p("attack") + this.p("sustain") + 2.0);
}

bell.prototype.name = function() {
  return "bell";
}

bell.prototype.connect = function(node) {
  this.mastergain.connect(node);
}
