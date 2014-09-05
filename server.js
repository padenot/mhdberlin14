var midi = require('midi');
 var osc = require('node-osc');

var input = new midi.input();
var count = input.getPortCount();
for (var i = 0; i < count; i++) {
  console.log(input.getPortName(i));
}
// input.openPort(0);
input.openPort(1);

input.on('message', function(deltaTime, message) {
  console.log('m:' + message + ' d:' + deltaTime);
});
input.ignoreTypes(false, false, false);

var oscServer = new osc.Server(3333, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
  console.log("TUIO message:"); console.log(msg);
});

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

