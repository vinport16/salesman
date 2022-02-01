var express = require('express')
var app = express();
var http = require('http').createServer(app);

var port = process.env.PORT || 8080;
http.listen(port);

console.log("listening on port "+port);

app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + 'public/index.html');
});
