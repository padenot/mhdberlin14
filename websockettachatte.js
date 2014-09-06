var WebSocketServer = require('websocket').server;

var maxParam = 0;

// create the server
function createServerTaChatte(httpserver) {
  var conn;
  wsServer = new WebSocketServer({
      httpServer: httpserver
  });

  // WebSocket server
  wsServer.on('request', function(request) {
      conn = request.accept('sharks', request.origin);
      console.log("connected");

      conn.on('message', function(message) {
        console.log('got message', message);
        maxParam = parseInt(message.utf8Data, 10);
        if (AMSTERDAMConnection) {
          AMSTERDAMConnection.send(maxParam);
        }
      });

      conn.on('close', function(connection) {
        conn = undefined;
        console.log("close");
      });
  });

  wsServer.sendPlay = function(instID, height, duration) {
    console.log('send play message', instID, height, duration);

    if (!conn) {
      console.log('but no-one is listening :(');
      return;
    }

    conn.sendUTF(JSON.stringify({
      instrument: instID,
      height: height,
      duration: duration}));
  };

  var WebSocketClient = require('websocket').client;
  var AMSTERDAMConnection;
  var client = new WebSocketClient();
  client.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
      AMSTERDAMConnection = connection;
      console.log('WebSocket client connected');
      connection.on('error', function(error) {
          console.log("Connection Error: " + error.toString());
      });
      connection.on('close', function() {
          console.log('Connection Closed');
      });
      connection.on('message', function(message) {
        if (conn) {
          console.log(message);
          conn.send(message.utf8Data);
        }
      });
  });

  client.connect('ws://mhd.paul.cx:81/', 'sharks');

  return wsServer;
}


module.exports = createServerTaChatte;

console.log('http server running on 3333');
