var instrumentsColCount = 2;
var instruments = [];
for(var i = 0; i < instrumentsColCount * 7; ++i) {
  instruments.push(false);
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
      console.log('play!');
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
  // send websocket message
});
input.ignoreTypes(false, false, false);
