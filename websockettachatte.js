var WebSocketServer = require('websocket').server;

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
      });

      conn.on('close', function(connection) {
        conn = undefined;
        console.log("close");
      });
  });

  wsServer.sendPlay = function(instID, height, duration) {
    if (!conn) {
      return;
    }

    conn.sendUTF(JSON.stringify({
      instrument: instID,
      height: height,
      duration: duration}));
  };

  return wsServer;
}

module.exports = createServerTaChatte;

console.log('http server running on 3333');
