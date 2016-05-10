var reader = require('./reader');
var lame = require('lame');
var Speaker = require('speaker');
var request = require('request')

var listeners = [];

var audioOptions = {channels: 2, bitDepth: 16, sampleRate: 44100};
// Create Decoder and Speaker
var decoder;
var speaker;

var inputStream;
var currentSerial;

function findType(type) {
  return function(obj) {
    return type === obj.type;
  }
}

function callListener(data) {
  return function(obj) {
    console.log(obj);
    console.log(data);
    return obj.cb(data)
  }
}


// My Playlist
function importSongs(s) {
  songs = s
}

function loadSong(serial) {
  return (songs && songs[serial]) ? songs[serial].song : undefined;
}

function stopSong() {
  var lastPlayed = currentSerial
  currentSerial = '';
  if (!speaker || !decoder) return
  speaker.end();
  decoder.unpipe();
  console.log('stop playing');
  listeners.filter(findType('stop')).forEach(callListener(lastPlayed))
}

function checkSerial(serial) {

}

// Recursive function that plays song with index 'i'.
function playSong(serial) {
  currentSerial = serial;
  var song = loadSong(serial);

  if (!song) return
  // Read the first file
   var stream = request(song)
  // Lame decoder & speaker objects
  decoder = new lame.Decoder();
  speaker = new Speaker(audioOptions)

  // pipe() returns destination stream
  var spkr = decoder.pipe(speaker);
  listeners.filter(findType('start')).forEach(callListener(currentSerial))
  // Pipe the read data into the decoder and then out to the speakers
  stream.on('error', function(err) {
    console.log(err)
  })
  stream.on('data', function (chunk) {
      decoder.write(chunk);
  });

}
reader.on('stop', stopSong)
reader.on('start', playSong)
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
