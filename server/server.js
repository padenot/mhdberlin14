var fs = require('fs');

var i = 0,
    MAX_PARAM = 7;
var clients = 0;
var http = require('http');
var htmlHTTP = http.createServer(function (req, res) {
  fs.readFile(process.cwd() + '/index.html', "utf-8", function(error, data) {
    if (error) {
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(error + "\n");
        res.end();
        return;
    }

    data = data.replace('%%i%%', i);
    data = data.replace('%%i%%', i);
    i = (i+1) % MAX_PARAM;

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": Buffer.byteLength(data, 'utf8')
    });
    res.write(data, "utf-8");
    res.end();
  });

}).listen(80, '0.0.0.0');

var websocketserver = require('websocket').server;
var wsServer = new websocketserver({
  httpServer: htmlHTTP
});

wsServer.on('request', function(request) {
  var connection = request.accept('sharks', request.origin);
	console.log('got connection', ++clients);

  connection.on('message', function(message) {
    if (berlinConnection) {
      berlinConnection.send(message.utf8Data);
    }
  });
  connection.on('close', function(message) {
    console.log('lost client', --clients);
  });
});

console.log('Server runing at http://178.62.142.62/');

// liaison vers Berlin
var berlinConnection;
var berlinHTTP = http.createServer(function(req, res) {
}).listen(81, '0.0.0.0');

var berlinWS = new websocketserver({
  httpServer: berlinHTTP
});

berlinWS.on('request', function(request) {
  berlinConnection = request.accept('sharks', request.origin);
  berlinConnection.on('message', function(message) {
    console.log(message);
    MAX_PARAM = parseInt(message.utf8Data, 10);
  });
  console.log('ICH BIN EIN BERLINER');
});

