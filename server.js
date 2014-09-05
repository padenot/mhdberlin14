// YOUPI LE HTTP
var http = require('./httpserveryoupi.js');
// WEBSOCKET SERVEUR SISI
var WS = require('./websockettachatte.js')(http);

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

var instrumentsColCount = 2;
var instruments = [];
for(var i = 0; i < instrumentsColCount * 7; ++i) {
  instruments.push(false);
}

function playInstruments(instrumentsArray, height, duration) {
  var i;

  for (i = 0; i < instrumentsArray.length; ++i) {
    if (instrumentsArray[i]) {
      WS.sendPlay(i, clamp(height, 0, 1), clamp(duration, 0, 1));
    }
  }
}

// MONOME
require('monode')().on('connect', function(device) {
  console.log('monome status: ONLINE');

  device.on('key', function(x, y, i) {
    if (i === 0) {
      return;
    }

    // instrument selection
    if (x < instrumentsColCount) {
      console.log('set instrument', y + (x * 8));
      instruments[y + (x * 8)] = !instruments[y + (x * 8)];
      updateInstrumentsLeds();
    }
    else if (x >= instrumentsColCount) {
      // map height on the X axis and duration on Y axis.
      var height = (x - instrumentsColCount) / (15 - instrumentsColCount);
      var duration = (y / 7);
      playInstruments(instruments, height, duration);
    }
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
  WS.sendPlay(100 + Math.floor(message[1]/12), message[1] / 120, message[2] / 127);
});
input.ignoreTypes(false, false, false);
