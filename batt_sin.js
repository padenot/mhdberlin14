batt_sin.prototype = extend(Instrument);

function batt_sin(ctx) {
  Instrument.call(this, ctx);

  this.register_param("decay", 0.2, 0.01, 0.5, 0.01);
  this.register_param("decay_low", 0.5, 0.3, 1, 0.01);
  this.register_param("ATK", 0.2, 0.05, 5, 0.1);
  this.register_param("mix",0.5,0,1,0.01);

  this.sin2 = ctx.createOscillator();
  this.sin2.type = "sine";
  this.sin2.start(0);

  this.sin1 = ctx.createOscillator();
  this.sin1.type = "sine";
  this.sin1.start(0);

  this.sin3 = ctx.createOscillator();
  this.sin3.type = "sine";
  this.sin3.start(0);
  
  this.sin2l = ctx.createOscillator();
  this.sin2l.type = "square";
  this.sin2l.start(0); 
  
  this.sin1l = ctx.createOscillator();
  this.sin1l.type = "square";
  this.sin1l.start(0); 

  this.sin3l = ctx.createOscillator();
  this.sin3l.type = "square";
  this.sin3l.start(0);  
  
  this.mix_low = ctx.createGain();
  
  this.mix_high = ctx.createGain();
  
  this.mix = ctx.createGain();
  this.mix.gain.setValueAtTime(0,0);
  
  this.sin1l.connect(this.mix_low);
  this.sin2l.connect(this.mix_low);
  this.sin3l.connect(this.mix_low);

  this.sin1.connect(this.mix_high);
  this.sin2.connect(this.mix_high);
  this.sin3.connect(this.mix_high);
  
  this.mix_low.connect(this.mix);
  this.mix_high.connect(this.mix);
  }

batt_sin.prototype.connect = function(node) {
  this.mix.connect(node);
};

batt_sin.prototype.trigger = function(note, velocity, time) {
  var t = time || this.ctx.currentTime;
  var v = velocity2gain(velocity);

  this.mix_high.gain.setValueAtTime(1-this.p("mix"),t);


  var F = n2f(note);

  this.mix.gain.cancelScheduledValues(t);
  this.mix.gain.setValueAtTime(0, t);
  this.mix.gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
  this.mix.gain.setTargetAtTime(0, t + 0.01, this.p("decay"));
  this.sin2.frequency.value = F;
  this.sin3.frequency.value = F*1.02;
  this.sin1.frequency.value = F*0.98;

  this.mix_low.gain.setValueAtTime(this.p("mix"),t);

  this.mix.gain.cancelScheduledValues(t);
  this.mix.gain.setValueAtTime(0, t);
  this.mix.gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
  this.mix.gain.setTargetAtTime(0, t + 0.01, this.p("decay")+this.p("decay_low"));
  this.sin2l.frequency.value = F/2;
  this.sin3l.frequency.value = F/2*1.02;
  this.sin1l.frequency.value = F/2*0.98;

  this.mix.gain.cancelScheduledValues(t);
  this.mix.gain.setValueAtTime(0, t);
  this.mix.gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
  this.mix.gain.setTargetAtTime(0, t + 0.01, this.p("decay"));
};

batt_sin.prototype.name = function() {
  return "batt_sin";
};
