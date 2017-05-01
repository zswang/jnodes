
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.adapter_jhtmls = require('../lib/Adapter/jhtmls').adapter_jhtmls;
global.adapter_ejs = require('../lib/Adapter/ejs').adapter_ejs;
      

describe("src/ts/Parser.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("parser_parse:base", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<!-- ts --><div class="box"></div>`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":34,\"children\":[{\"type\":\"comment\",\"pos\":0,\"endpos\":11,\"value\":\"<!-- ts -->\",\"indent\":\"\"},{\"type\":\"block\",\"pos\":11,\"endpos\":34,\"tag\":\"div\",\"attrs\":[{\"name\":\"class\",\"value\":\"box\",\"quoted\":\"\\\"\"}],\"indent\":\"\",\"selfClosing\":false,\"children\":[]}]}"); examplejs_printLines = [];
  });
          
  it("parser_parse:text", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`hello`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":5,\"children\":[{\"type\":\"text\",\"pos\":0,\"endpos\":5,\"value\":\"hello\"}]}"); examplejs_printLines = [];
  });
          
  it("parser_parse:comment not closed.", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<!-- okay`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":9,\"children\":[{\"type\":\"comment\",\"pos\":0,\"endpos\":9,\"value\":\"<!-- okay\",\"indent\":\"\"}]}"); examplejs_printLines = [];
  });
          
  it("parser_parse:attribute is emtpy", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<div><input type=text readonly></div>`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":37,\"children\":[{\"type\":\"block\",\"pos\":0,\"endpos\":37,\"tag\":\"div\",\"attrs\":[],\"indent\":\"\",\"selfClosing\":false,\"children\":[{\"type\":\"single\",\"pos\":5,\"endpos\":31,\"tag\":\"input\",\"attrs\":[{\"name\":\"type\",\"value\":\"text\",\"quoted\":\"\"},{\"name\":\"readonly\",\"value\":\"\",\"quoted\":\"\"}],\"indent\":\"\",\"selfClosing\":true}]}]}"); examplejs_printLines = [];
  });
          
  it("parser_parse:tag not closed", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<input type=text readonly`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":25,\"children\":[{\"type\":\"text\",\"pos\":0,\"endpos\":25,\"value\":\"<input type=text readonly\"}]}"); examplejs_printLines = [];
  });
          
  it("parser_parse:tag asymmetric", function () {
    examplejs_printLines = [];

  (function() {
  var node = jnodes.Parser.parse(`<div><span></div></span>`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  // * throw
  }).should.throw();
  });
          
  it("parser_parse:tag asymmetric", function () {
    examplejs_printLines = [];

  (function() {
  var node = jnodes.Parser.parse(`<section><div></div>\n</span>`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  // * throw
  }).should.throw();
  });
          
  it("parser_parse:tag nesting", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<div><div><div></div><div></div></div></div>`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":44,\"children\":[{\"type\":\"block\",\"pos\":0,\"endpos\":44,\"tag\":\"div\",\"attrs\":[],\"indent\":\"\",\"selfClosing\":false,\"children\":[{\"type\":\"block\",\"pos\":5,\"endpos\":38,\"tag\":\"div\",\"attrs\":[],\"indent\":\"\",\"selfClosing\":false,\"children\":[{\"type\":\"block\",\"pos\":10,\"endpos\":21,\"tag\":\"div\",\"attrs\":[],\"indent\":\"\",\"selfClosing\":false,\"children\":[]},{\"type\":\"block\",\"pos\":21,\"endpos\":32,\"tag\":\"div\",\"attrs\":[],\"indent\":\"\",\"selfClosing\":false,\"children\":[]}]}]}]}"); examplejs_printLines = [];
  });
          
  it("parser_parse:attribute spance", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<input type="text" placeholder="What needs to be done?"/>`);
  examplejs_print(JSON.stringify(node).replace(/"id":"\w+",/g, ''));
  assert.equal(examplejs_printLines.join("\n"), "{\"type\":\"root\",\"pos\":0,\"endpos\":57,\"children\":[{\"type\":\"single\",\"pos\":0,\"endpos\":57,\"tag\":\"input\",\"attrs\":[{\"name\":\"type\",\"value\":\"text\",\"quoted\":\"\\\"\"},{\"name\":\"placeholder\",\"value\":\"What needs to be done?\",\"quoted\":\"\\\"\"}],\"indent\":\"\",\"selfClosing\":true}]}"); examplejs_printLines = [];
  });
          
  it("parser_build:base", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<input type=text readonly>`)
  examplejs_print(jnodes.Parser.build(node));
  assert.equal(examplejs_printLines.join("\n"), "<input type=text readonly>"); examplejs_printLines = [];
  examplejs_print(JSON.stringify(jnodes.Parser.build()));
  assert.equal(examplejs_printLines.join("\n"), "\"\""); examplejs_printLines = [];
  });
          
  it("parser_build:hook", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<div>text</div>`)
  examplejs_print(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag) {
      node.beforebegin = `[beforebegin]`;
      node.beforeend = `[beforeend]`;
      node.afterbegin = `[afterbegin]`;
      node.afterend = `[afterend]`;
    }
  }));
  assert.equal(examplejs_printLines.join("\n"), "[beforebegin]<div>[beforeend]text[afterbegin]</div>[afterend]"); examplejs_printLines = [];
  });
          
  it("parser_build:hook overwriteNode", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<div><tnt/></div>`)
  examplejs_print(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'tnt') {
      node.overwriteNode = `<img src="tnt.png">`;
    }
  }));
  assert.equal(examplejs_printLines.join("\n"), "<div><img src=\"tnt.png\"></div>"); examplejs_printLines = [];
  });
          
  it("parser_build:hook overwriteAttrs", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<div><bigimg alt="none"/></div>`)
  examplejs_print(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'bigimg') {
      node.overwriteAttrs = `src="tnt.png" alt="tnt"`;
    }
  }));
  assert.equal(examplejs_printLines.join("\n"), "<div><bigimg src=\"tnt.png\" alt=\"tnt\"/></div>"); examplejs_printLines = [];

  var node = jnodes.Parser.parse(`<div><bigimg alt="none"/></div>`)
  examplejs_print(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'bigimg') {
      node.overwriteAttrs = ``;
    }
  }));
  assert.equal(examplejs_printLines.join("\n"), "<div><bigimg/></div>"); examplejs_printLines = [];
  });
          
  it("parser_build:indent", function () {
    examplejs_printLines = [];
  var node = jnodes.Parser.parse(`<div>\n  <span>hello</span>\n</div>`)
  examplejs_print(JSON.stringify(jnodes.Parser.build(node)));
  assert.equal(examplejs_printLines.join("\n"), "\"<div>\\n  <span>hello</span>\\n</div>\""); examplejs_printLines = [];
  });
          
});
         