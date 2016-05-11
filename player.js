'use strict';

var reader = require('./reader');
var lame = require('lame');
var Speaker = require('speaker');
var request = require('request')

var listeners = [];
var clientId = 'bc29a65541a777d6d9f0f517a9cbb7e6';

var audioOptions = {channels: 2, bitDepth: 16, sampleRate: 44100};
var songs;

var stream;
var decoer;
var speaker;
var done;

function findType(type) {
  return function(obj) {
    return type === obj.type;
  }
}

function callListener(data) {
  return function(obj) {
    return obj.cb(data)
  }
}

// My Playlist
function importSongs(s) {
  songs = s
}

function load(serial, type) {
  return (songs && songs[serial]) ? songs[serial][type] : undefined;
}

function loadSongs(type, id) {
  return new Promise(function(resolve, reject) {
    request.get(`http://api.soundcloud.com/${type}/${id}?client_id=${clientId}`, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var info = JSON.parse(body);
        var streams = type ==='tracks' ? [info.stream_url] : info.tracks.map((track) => track.stream_url)
        resolve(streams, info);
      }
    })
  })
}

function stopSong() {
  if (stream) {
    stream.end();
    done = true;
    console.log('stoping track');
  }

}

function playSong(songs, obj) {
  var tracks = songs;
  function next() {
    var track = tracks.shift();
    if (!track || done) return;
    console.log(`playing track: ${track}`)
    stream = request(`${track}?client_id=${clientId}`)
    .on('error', function (err) {
      console.error(err.stack || err);
      next();
    })
    .pipe(new lame.Decoder())
    .pipe(new Speaker(audioOptions))
    .on('finish', next);
  }

  next()
}

function start(serial) {
  var type = load(serial, 'type');
  var id = load(serial, 'id');
  loadSongs(type, id).then(playSong)
}

reader.on('stop', stopSong)
reader.on('start', function(serial) {
  done = false;
  start(serial)
})
// Start with the first song.
module.exports = {
  load: importSongs,
  on: function(type, cb) {
    listeners.push({
      type: type,
      cb: cb
    })
  },
  off: function(type, cb) {
    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i].cb === cb) {
          listeners.splice(1, i)
          break;
      }
    }
  }
};
