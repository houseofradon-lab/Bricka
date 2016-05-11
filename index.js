var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var player = require('./player');
var config = require('./config');
var socket;

io.on('connection', function (socket) {
  function whatSong(type) {
    return function(serial) {
      socket.emit(type, config.songs[serial])
    }
  }

  player.on('start', whatSong('start'));
  player.on('stop', whatSong('stop'));

});


player.load(config.songs);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
