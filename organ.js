organ.prototype = extend(Instrument);

function organ(ctx) {
  Instrument.call(this, ctx);

  this.register_param("decay", 0.2, 0.01, 0.5, 0.01);
  this.register_param("freq0", 440, 220, 880, 1);
  this.register_param("ATK", 1, 0.05, 5, 0.1);
  this.register_param("Gain0", 0.5, 0, 1, 0.125);
  this.register_param("Gain1", 0.5, 0, 1, 0.125);
  this.register_param("Gain2", 0.5, 0, 1, 0.125);
  this.register_param("Gain3", 0.5, 0, 1, 0.125);
  this.register_param("Gain4", 0.5, 0, 1, 0.125);
  this.register_param("Gain5", 0.5, 0, 1, 0.125);
  this.register_param("Gain6", 0.5, 0, 1, 0.125);
  this.register_param("Gain7", 0.5, 0, 1, 0.125);
  this.register_param("Gain8", 0.5, 0, 1, 0.125);
  

  this.organ0 = ctx.createOscillator();
  this.organ0.type = "sine";
  this.organ0.frequency.value = this.p("freq0")*0.5;
  this.organ0.start(0);
  
  this.organ1 = ctx.createOscillator();
  this.organ1.type = "sine";
  this.organ1.frequency.value = this.p("freq0");
  this.organ1.start(0);
  
  this.organ2 = ctx.createOscillator();
  this.organ2.type = "sine";
  this.organ2.frequency.value = this.p("freq0")*Math.pow(2,7/12);
  this.organ2.start(0);

  this.organ3 = ctx.createOscillator();
  this.organ3.type = "sine";
  this.organ3.frequency.value = this.p("freq0")*2;
  this.organ3.start(0);
   
  this.organ4 = ctx.createOscillator();
  this.organ4.type = "sine";
  this.organ4.frequency.value = this.p("freq0")*Math.pow(2,19/12);
  this.organ4.start(0);
     
  this.organ5 = ctx.createOscillator();
  this.organ5.type = "sine";
  this.organ5.frequency.value = this.p("freq0")*4;
  this.organ5.start(0);
      
  this.organ6 = ctx.createOscillator();
  this.organ6.type = "sine";
  this.organ6.frequency.value = this.p("freq0")*Math.pow(2,28/12);
  this.organ6.start(0);
  
  this.organ7 = ctx.createOscillator();
  this.organ7.type = "sine";
  this.organ7.frequency.value = this.p("freq0")*Math.pow(2,31/12);
  this.organ7.start(0);
       
  this.organ8 = ctx.createOscillator();
  this.organ8.type = "sine";
  this.organ8.frequency.value = this.p("freq0")*8;
  this.organ8.start(0);
 
  this.organGain0 = ctx.createGain();
  this.organGain0.gain.setValueAtTime(0,0);
  
  this.organGain1 = ctx.createGain();
  this.organGain1.gain.setValueAtTime(0,0); 

  this.organGain2 = ctx.createGain();
  this.organGain2.gain.setValueAtTime(0,0); 
  
  this.organGain3 = ctx.createGain();
  this.organGain3.gain.setValueAtTime(0,0); 
  
  this.organGain4 = ctx.createGain();
  this.organGain4.gain.setValueAtTime(0,0); 

  this.organGain5 = ctx.createGain();
  this.organGain5.gain.setValueAtTime(0,0); 
  
  this.organGain6 = ctx.createGain();
  this.organGain6.gain.setValueAtTime(0,0); 
  
  this.organGain7 = ctx.createGain();
  this.organGain7.gain.setValueAtTime(0,0); 
  
  this.organGain8 = ctx.createGain();
  this.organGain8.gain.setValueAtTime(0,0); 
  
  this.organGain = ctx.createGain();
  this.organGain.gain.setValueAtTime(0,0);
  
  this.organ0.connect(this.organGain0);
  this.organ1.connect(this.organGain1);
  this.organ2.connect(this.organGain2);
  this.organ3.connect(this.organGain3);
  this.organ4.connect(this.organGain4);
  this.organ5.connect(this.organGain5);
  this.organ6.connect(this.organGain6);
  this.organ7.connect(this.organGain7);
  this.organ8.connect(this.organGain8);

  this.organGain0.connect(this.organGain);
  this.organGain1.connect(this.organGain);
  this.organGain2.connect(this.organGain);
  this.organGain3.connect(this.organGain);
  this.organGain4.connect(this.organGain);
  this.organGain5.connect(this.organGain);
  this.organGain6.connect(this.organGain);
  this.organGain7.connect(this.organGain);
  this.organGain8.connect(this.organGain);

}

organ.prototype.connect = function(node) {
  this.organGain.connect(node);
}

organ.prototype.trigger = function(velocity, time) {
  var t = time || ac.currentTime;
  var v = velocity2gain(velocity);

  this.organ0.frequency.value = this.p("freq0")*0.5;
  this.organGain0.gain.cancelScheduledValues(t);
  this.organGain0.gain.setValueAtTime(this.p("Gain0"), t);

  this.organ1.frequency.value = this.p("freq0");
  this.organGain1.gain.cancelScheduledValues(t);
  this.organGain1.gain.setValueAtTime(this.p("Gain1"), t);  
 
  this.organ2.frequency.value = this.p("freq0")*Math.pow(2,7/12);
  this.organGain2.gain.cancelScheduledValues(t);
  this.organGain2.gain.setValueAtTime(this.p("Gain2"), t); 

  this.organ3.frequency.value = this.p("freq0")*2;
  this.organGain3.gain.cancelScheduledValues(t);
  this.organGain3.gain.setValueAtTime(this.p("Gain3"), t); 

  this.organ4.frequency.value = this.p("freq0")*Math.pow(2,19/12);
  this.organGain4.gain.cancelScheduledValues(t);
  this.organGain4.gain.setValueAtTime(this.p("Gain4"), t); 

  this.organ5.frequency.value = this.p("freq0")*4;
  this.organGain5.gain.cancelScheduledValues(t);
  this.organGain5.gain.setValueAtTime(this.p("Gain5"), t); 
  
  this.organ6.frequency.value = this.p("freq0")*Math.pow(2,28/12);
  this.organGain6.gain.cancelScheduledValues(t);
  this.organGain6.gain.setValueAtTime(this.p("Gain6"), t); 
  
  this.organ7.frequency.value = this.p("freq0")*Math.pow(2,31/12);
  this.organGain7.gain.cancelScheduledValues(t);
  this.organGain7.gain.setValueAtTime(this.p("Gain7"), t); 
  
  this.organ8.frequency.value = this.p("freq0")*8;
  this.organGain8.gain.cancelScheduledValues(t);
  this.organGain8.gain.setValueAtTime(this.p("Gain8"), t);
  
  this.organGain.gain.cancelScheduledValues(t);
  this.organGain.gain.setValueAtTime(0, t);
  this.organGain.gain.linearRampToValueAtTime(v * this.p("ATK"), t + 0.01);
  this.organGain.gain.setTargetAtTime(0, t + 0.01, this.p("decay"));
}

organ.prototype.name = function() {
  return "organ";
}
