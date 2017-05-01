
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.adapter_jhtmls = require('../lib/Adapter/jhtmls').adapter_jhtmls;
global.adapter_ejs = require('../lib/Adapter/ejs').adapter_ejs;
      

describe("src/ts/Observer.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("observer():trigger is undefined", function () {
    examplejs_printLines = [];
  var data = { a: 1 };
  jnodes.observer(data);
  });
          
  it("observer():trigger", function () {
    examplejs_printLines = [];
  var data = { a: 1 };
  jnodes.observer(data, function () {
    examplejs_print(data.a);
  });
  data.a = 2;
  assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
  });
          
  it("observer():filter", function () {
    examplejs_printLines = [];
  var data = { a: 1, b: 1 };
  var count = 0;
  jnodes.observer(data, function () {
    count++;
  }, function (key) {
    return key === 'a';
  });
  data.a = 2;
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  data.a = 2;
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  data.b = 2;
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];
  });
          
  it("observer():configurable is false", function () {
    examplejs_printLines = [];
  var data = { a: 1 };
  Object.defineProperty(data, 'a', {
    enumerable: true,
    configurable: false,
  });
  var i = 0;
  jnodes.observer(data, function () {
    i = 1;
  });
  data.a = 2;
  examplejs_print(i);
  assert.equal(examplejs_printLines.join("\n"), "0"); examplejs_printLines = [];
  });
          
  it("observer():getter/setter", function () {
    examplejs_printLines = [];
  var data = { a: 1 };
  var _x = 0;
  Object.defineProperty(data, 'x', {
    enumerable: true,
    configurable: true,
    get: function () {
      return _x;
    },
    set: function (value) {
      _x = value;
    }
  });
  jnodes.observer(data, function () {});
  data.x = 123;
  examplejs_print(data.x);
  assert.equal(examplejs_printLines.join("\n"), "123"); examplejs_printLines = [];
  });
          
  it("observer():array", function () {
    examplejs_printLines = [];
  var data = [1, 2, 3];
  var count = 0;
  jnodes.observer(data, function () {
    count++;
  });
  data.push(4);
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  data.sort();
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
  });
          
});
         