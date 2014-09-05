wind.prototype = extend(Instrument);

function wind(ctx) {
  Instrument.call(this, ctx);

  var buffer = ac.createBuffer(1, ac.sampleRate * 10, ac.sampleRate);
  var c = buffer.getChannelData(0);
  for (var i = 0; i < c.length; i++) {
    c[i] = Math.random() * 2 - 1;
  }

  this.source = ac.createBufferSource();
  this.source.buffer = buffer;
  this.source.loop = true;

  this.lp = ac.createBiquadFilter();
  this.lp.type = "lowpass";

  this.gain = ac.createGain(); 
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);

  this.register_param("attack", 1.0, 0.0, 0.1, 0.01);
  this.register_param("decay", 2.0, 0.0, 4.0, 0.1);
  this.register_param2(this.lp.frequency, "lp-freq-hz", 1000.0, 0.0, 20000, 1);

  this.source.connect(this.lp);
  this.lp.connect(this.gain);

  this.source.start();
}

wind.prototype.trigger = function(note, velocity, time) {
  this.gain.gain.setValueAtTime(0.0, ac.currentTime);
  this.gain.gain.linearRampToValueAtTime(velocity2gain(velocity), ac.currentTime + this.p("attack"));
}

wind.prototype.name = function() {
  return "wind";
}

wind.prototype.connect = function(node) {
  this.gain.connect(node);
}
