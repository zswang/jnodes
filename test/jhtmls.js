
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.art = require('art-template/lib/template-web');
global.compiler_jhtmls = require('../src/js/Compiler/jhtmls').compiler_jhtmls;
global.compiler_ejs = require('../src/js/Compiler/ejs').compiler_ejs;
global.compiler_art = require('../src/js/Compiler/art').compiler_art;
      

describe("src/ts/Compiler/jhtmls.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("compiler_jhtmls:base", function () {
    examplejs_printLines = [];
  var node = {
    tag: ':template'
  };
  compiler_jhtmls(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\":template\"}"); examplejs_printLines = [];
  });
          
  it("compiler_jhtmls:base2", function () {
    examplejs_printLines = [];
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  compiler_jhtmls(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\":template\",\"attrs\":[{\"name\":\"class\",\"value\":\"book\"}]}"); examplejs_printLines = [];
  });
          
});
         