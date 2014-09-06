organ.prototype = extend(Instrument);

var Kfreq = [
  0.5, 1,
  Math.pow(2,7/12),
  2,
  Math.pow(2,19/12),
  4,
  Math.pow(2,18/12),
  Math.pow(2,31/12),8
];

function organ(ctx) {
  Instrument.call(this, ctx);
  this.Gain = new Array(8);

  this.register_param("decay", 0.2, 0.01, 0.5, 0.01);
  this.register_param("freq0", 440, 220, 880, 1);
  this.register_param("ATK", 1, 0.05, 5, 0.1);
  for (var i=0; i<8; i++){
	this.register_param(this.Gain[i], 1, 0, 1, 1/8);
  }

  this.tGain = ctx.createGain();
  this.tGain.gain.setValueAtTime(0,0);


  this.organ = [];
  this.organGain = [];
  for (i=0; i<8; i++) {
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.start(0);
	  this.organ.push(osc);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.connect(this.tGain);
    this.organGain.push(gain);
	}
}

organ.prototype.connect = function(node) {
  this.tGain.connect(node);
};

organ.prototype.trigger = function(velocity, time) {
  var t = time || ac.currentTime;
  var v = velocity2gain(velocity);

  for (var i=0; i<8; i++) {
    this.organ[i].frequency.value = this.p("freq0")*Kfreq[i];
    this.organGain[i].gain.cancelScheduledValues(t);
    this.organGain[i].gain.setValueAtTime(this.p(this.Gain[i]), t);
    this.organGain[i].gain.cancelScheduledValues(t);
    this.organGain[i].gain.setValueAtTime(0, t);
    this.organGain[i].gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
    this.organGain[i].gain.setTargetAtTime(0, t + 0.01, this.p("decay"));
	}

};

organ.prototype.name = function() {
  return "organ";
};

