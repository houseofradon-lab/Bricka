#!/usr/bin/env node

var serialport = require('serialport')
var parsers = serialport.parsers;
var baud = 2400;

var listeners = [];
function callListener(data) {
  return function(obj) {
    return obj.cb(data)
  }
}

function handleType(type) {
  return function(d) {
    return type === d.type
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
      // process.exit(3);
      return;
    }
    cb(null, ports[1]);
  });

};

var timeout;
var prev;
function handleData(data) {
  if (!data || data.length <= 0) {
    return;
  };
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(function () {
      prev = undefined;
      listeners.filter(handleType('stop')).forEach(callListener(undefined))
  }, 2000);
  if (data === prev) {
    return;
  };
  prev = data;
  listeners.filter(handleType('start')).forEach(callListener(data.trim()))
}

openPort = function (err, port_name) {

  var openOptions = {
    baudRate: baud,
    parser: parsers.readline()

  };

  var port = new serialport.SerialPort(port_name, openOptions)
  .on("data", handleData);
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
