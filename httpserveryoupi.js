var http = require('http');
var url = require("url"),
    path = require("path"),
    fs = require("fs"),
    portsalut = 3333;

module.exports = http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), uri);
  console.log(" : " + uri);
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(portsalut, 10));
 
