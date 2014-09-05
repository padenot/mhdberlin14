var connection = new WebSocket('ws://127.0.0.1:3333', 'sharks');

connection.onopen = function () {
    // connection is opened and ready to use
   console.log("open");
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
      channels.kick.inst.trigger(-1, payload.duration * 9000, 0);
      break;
    case 1:
      channels.snare.inst.trigger(-1, payload.duration * 9000, 0);
      break;
    case 2:
      channels.pad.inst.trigger(-1, payload.duration * 9000, 0);
      break;
    }
  }
  else { // NANOKEY OH YEAH
    channels.bell.inst.trigger(72 + payload.height * 23, payload.duration * 50);
  }
};
