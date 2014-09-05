sub.prototype = extend(Instrument);

function sub(ctx) {
  Instrument.call(this, ctx);

  this.osc = ac.createOscillator();

  this.gain = ac.createGain(); 
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);

  this.register_param("attack", 0.01, 0.0, 0.1, 0.01);
  this.register_param("decay", 2.0, 0.0, 4.0, 0.1);
  this.register_param("sustain", 0.6, 0.0, 1.0, 0.1);

  this.osc.connect(this.gain);

  this.osc.start();
}

sub.prototype.trigger = function(note, velocity, time) {
  this.osc.frequency.setValueAtTime(n2f(note), ac.currentTime);
  this.gain.gain.cancelScheduledValues(ac.currentTime);
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);
  this.gain.gain.linearRampToValueAtTime(velocity2gain(velocity) * 0.8, ac.currentTime + this.p("attack"));
  this.gain.gain.setTargetAtTime(this.p("sustain") / 2, ac.currentTime + this.p("attack"), this.p("decay"));
  this.gain.gain.setTargetAtTime(0.0, ac.currentTime + this.p("attack") + this.p("decay"), 0.3);
}

sub.prototype.name = function() {
  return "sub";
}

sub.prototype.connect = function(node) {
  this.gain.connect(node);
}
