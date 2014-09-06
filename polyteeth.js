polyteeth.prototype = extend(Instrument);

function polyteeth(ctx) {
  Instrument.call(this, ctx);

  this.register_param("decay", 0.2, 0.01, 0.5, 0.01);
  this.register_param("ATK", 0.2, 0.05, 5, 0.1);
  this.register_param("subteeth", 0.2, 0, 1, 0.01);

  this.polyteeth2 = ctx.createOscillator();
  this.polyteeth2.type = "sawtooth";
  this.polyteeth2.start(0);

  this.polyteeth1 = ctx.createOscillator();
  this.polyteeth1.type = "sawtooth";
  this.polyteeth1.start(0);

  this.polyteeth3 = ctx.createOscillator();
  this.polyteeth3.type = "sawtooth";
  this.polyteeth3.start(0);

  this.subteeth = ctx.createGain();
  this.subteeth.gain.value = 0.5;

  this.polyteethGain = ctx.createGain();
  this.polyteethGain.gain.setValueAtTime(0,0);

  this.polyteeth1.connect(this.subteeth);
  this.polyteeth3.connect(this.subteeth);
  this.subteeth.connect(this.polyteethGain);
  this.polyteeth2.connect(this.polyteethGain);
}

polyteeth.prototype.connect = function(node) {
  this.polyteethGain.connect(node);
};

polyteeth.prototype.trigger = function(note, velocity, time) {
  var t = time || this.ctx.currentTime;
  var v = velocity2gain(velocity);

  var F = n2f(note);
  this.polyteeth2.frequency.value = F;
  this.polyteeth3.frequency.value = F * Math.pow(2,0.25);
  this.polyteeth1.frequency.value = F / Math.pow(2,0.25);

  this.subteeth.gain.setValueAtTime(this.p("subteeth"), t);

  this.polyteethGain.gain.cancelScheduledValues(t);
  this.polyteethGain.gain.setValueAtTime(0, t);
  this.polyteethGain.gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
  this.polyteethGain.gain.setTargetAtTime(0, t + 0.01, this.p("decay"));
};

polyteeth.prototype.name = function() {
  return "polyteeth";
};
