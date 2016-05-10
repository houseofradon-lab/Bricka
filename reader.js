#!/usr/bin/env node

var serialport = require("serialport")
var parsers = serialport.parsers;
var baud = 9600;
var prev;

var listeners = [];

function callListener(data) {
  return function(obj) {
    return obj.cb(data)
  }
}

var findPort = function (cb) {

  serialport.list(function (err, result) {

    var ports = result.filter(function (val) {
      return (/usb|acm|com/i).test(val.comName);
    }).map(function (val) {
      return val.comName;
    });

    if (!ports.length) {
      console.error("Board", "No USB devices detected");
      process.exit(3);
      return;
    }

    // Continue with connection routine attempts
    console.info(
      "Serial",
      "Found port", ports[2]
    );
    cb(null, ports[2]);
  });

};

openPort = function (err, port_name) {

  var openOptions = {
    baudRate: baud,
    parser: parsers.readline('\r\n')

  };

  var timeout;
  var port = new serialport.SerialPort(port_name, openOptions);
  port.on("data", function (data) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
        prev = undefined;
        listeners.filter(function(d) {return 'stop' === d.type}).forEach(callListener(undefined))
    }, 1000);
    if (data === prev) return;
    prev = data;
    listeners.filter(function(d) {return 'start' === d.type}).forEach(callListener(data))
  });
};

findPort(openPort);

module.exports = {
  on: function(type, cb) {
    listeners.push({
      type: type,
      cb: cb
    })
  }
};
