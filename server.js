// YOUPI LE HTTP
var http = require('./httpserveryoupi.js');
// WEBSOCKET SERVEUR SISI
var WS = require('./websockettachatte.js')(http);

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// MONOME
require('monode')().on('connect', function(device) {
  console.log('monome status: ONLINE');

  device.on('key', function(x, y, i) {
    if (i === 0) {
      return;
    }

    var duration = x / 15;
    WS.sendPlay(y, -1, duration);
  });

  function updateInstrumentsLeds() {
    var i;
    for (i = 0; i < instruments.length; ++i) {
      device.led(i/8, i % 8, instruments[i]);
    }
  }
});

// NANOKEY
var midi = require('midi');
var input = new midi.input();

var count = input.getPortCount();
console.log('ONLINE midi controllers:');
for (var i = 0; i < count; i++) {
  console.log('\t' + input.getPortName(i));
}
if (count > 1) {
  input.openPort(1);
}

input.on('message', function(deltaTime, message) {
  console.log('midi message', message);
  var octave = Math.floor(message[1]/24);
  WS.sendPlay(100 + octave, (message[1] - octave * 24) / 23, message[2] / 127);
});
input.ignoreTypes(false, false, false);
