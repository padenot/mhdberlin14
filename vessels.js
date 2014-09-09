vessels.prototype = extend(Instrument);

DistCurve = function(k) {
var c = new Float32Array(ac.sampleRate);
var deg = Math.PI / 180;
for (var i = 0; i < c.length; i++) {
var x = i * 2 / c.length - 1;
c[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
}
return c;
}

function vessels(ctx) {
  Instrument.call(this, ctx);

  this.osc = ac.createOscillator();

  this.gain = ac.createGain(); 
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);

  this.register_param("attack", 0.01, 0.0, 0.1, 0.01);
  this.register_param("decay", 0.7, 0.0, 4.0, 0.1);
  this.register_param("sustain", 0.3, 0.0, 1.0, 0.1);

  this.ws = ac.createWaveShaper();
  /// this.mix = ac.createGain();
  this.ws.curve = DistCurve(100);
  // this.mix.gain.value = 0.5;

  this.osc.connect(this.gain);
  this.gain.connect(this.ws)

  this.osc.start();
}

vessels.prototype.trigger = function(note, velocity, time) {
  this.osc.frequency.setValueAtTime(n2f(note), ac.currentTime);
  this.gain.gain.cancelScheduledValues(ac.currentTime);
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);
  this.gain.gain.linearRampToValueAtTime(velocity2gain(velocity) * 0.1, ac.currentTime + this.p("attack"));
  this.gain.gain.setTargetAtTime(this.p("sustain") / 2, ac.currentTime + this.p("attack"), this.p("decay") * .9);
  this.gain.gain.setTargetAtTime(0.0, ac.currentTime + this.p("attack") + this.p("decay"), 0.09);
}

vessels.prototype.name = function() {
  return "vessels";
}

vessels.prototype.connect = function(node) {
  this.ws.connect(node);
}
