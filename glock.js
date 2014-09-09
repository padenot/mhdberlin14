glock.prototype = extend(Instrument);

function glock(ctx) {
  Instrument.call(this, ctx);

  this.register_param("decay", 0.2, 0.01, 0.5, 0.01);
  this.register_param("ATK", 0.2, 0.05, 5, 0.1);
  this.register_param("H1", 0.5, 0, 1);

  this.glock0 = ctx.createOscillator();
  this.glock0.type = "triangle";
  this.glock0.start(0);

  this.glock1 = ctx.createOscillator();
  this.glock1.type = "triangle";
  this.glock1.start(0);

  this.delayGain = ctx.createGain();

  this.glock1.connect(this.delayGain);

  this.glockGain = ctx.createGain();
  this.glockGain.gain.setValueAtTime(0,0);

  this.glock0.connect(this.glockGain);
  this.delayGain.connect(this.glockGain);
}

glock.prototype.connect = function(node) {
  this.glockGain.connect(node);
};

glock.prototype.trigger = function(note, velocity, time) {
  var t = time || this.ctx.currentTime;
  var v = velocity2gain(velocity);

  var F = n2f(note);
  this.glock0.frequency.value = F;
  this.glock1.frequency.value = F * 2;

  this.delayGain.gain.setValueAtTime(0,t);
  this.delayGain.gain.linearRampToValueAtTime(this.p("ATK"),10);

  this.delayGain.gain.setValueAtTime(this.p("H1"),t);  

  this.glockGain.gain.cancelScheduledValues(t);
  this.glockGain.gain.setValueAtTime(0, t);
  this.glockGain.gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
  this.glockGain.gain.setTargetAtTime(0, t + 0.01, this.p("decay"));
};

glock.prototype.name = function() {
  return "glock";
};
