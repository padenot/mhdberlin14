var connection = new WebSocket('ws://127.0.0.1:3333', 'sharks');

connection.onopen = function () {
    // connection is opened and ready to use
   console.log("open");
   connection.send("2");
};

connection.onerror = function (error) {
  connection.close();
};

window.onbeforeunload = function() {
  console.log("onbeforeunload");
  connection.onclose = function () {}; // disable onclose handler first
  connection.close();
};

connection.onmessage = function(message) {
  var payload = JSON.parse(message.data);
  console.log(payload);

  if (payload.instrument < 100) { // MONOME OUI OUI
    switch(payload.instrument) {
      case 0:
        channels.kick.inst.trigger(-1, payload.duration * 127, 0); break;
      case 1:
        channels.snare.inst.trigger(50 + payload.duration * 23, 180, 0); break;
      case 2: // vessels
        channels.vessels.inst.trigger(20 + payload.duration * 23, 90, 90); break;
      case 3: // pad
        channels.pad.inst.trigger(20 + payload.duration * 23, 90, 90); break;
      case 4: // wind
        channels.wind.inst.set_param('lp-freq-hz', payload.duration * 5000); break;
    }
  }
  else { // NANOKEY OH YEAH
    channels.bell.inst.trigger(72 + payload.height * 23, payload.duration * 50);
  }
};
