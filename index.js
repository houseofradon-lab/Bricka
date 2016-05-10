var express = require('express');
var player = require('./player');
var config = require('./config');

var app = express();

function whatSong(song) {
  console.log('what song');
  console.log(song);
  io.sockets.emit('')
}

function onSongStart(serial) {
  var obj = config.songs[serial];
  io.sockets.emit('start', obj);
}

function onSongStop(serial) {
  io.sockets.emit('stop');
}

player.load(config.songs)
player.on('start', onSongStart)
player.on('stop', onSongStop)

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var io = require('socket.io')(server);
