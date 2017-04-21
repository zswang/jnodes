
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.compiler_jhtmls = require('../src/js/Compiler/jhtmls').compiler_jhtmls;
      

describe("src/ts/Binder.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  var jsdom = require('jsdom');
  

  it("bind():base", function () {
    examplejs_printLines = [];
  var binder = new jnodes.Binder();
  var data = {x: 1, y: 2};
  var rootScope = {};
  var count = 0;
  binder.bind(data, rootScope, function (output) {
    output.push('<div></div>');
    count++;
  });
  examplejs_print(rootScope.children.length);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  var element = {};
  global.document = { querySelector: function(selector) {
    examplejs_print(selector);
    assert.equal(examplejs_printLines.join("\n"), "[data-jnodes-scope=\"0\"]"); examplejs_printLines = [];
    return element;
  } };
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "0"); examplejs_printLines = [];

  data.x = 2;
  examplejs_print(count);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  examplejs_print(JSON.stringify(element));
  assert.equal(examplejs_printLines.join("\n"), "{\"outerHTML\":\"<div></div>\"}"); examplejs_printLines = [];
  });
          
  it("jsdom@bind():bind jhtmls", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <ul :bind=\"books\">\n    books.forEach(function (book) {\n      <li :bind=\"book\">\n        <:template name=\"book\"/>\n      </li>\n    });\n    </ul>\n    </script>\n  </div>\n  <script type=\"text/jhtmls\" id=\"book\">\n  <a href=\"#{id}\">#{title}</a>\n  </script>", {
        features: {
          FetchExternalResources : ["script", "link"],
          ProcessExternalResources: ["script"]
        }
      },
      function (err, window) {
        global.window = window;
        ["document","navigator"].forEach(
          function (key) {
            global[key] = window[key];
          }
        );
        assert.equal(err, null);
        done();
      }
    );
  });
          
  it("bind():bind jhtmls", function () {
    examplejs_printLines = [];
  var binder = new jnodes.Binder({
    onScopeCreate: function () {},
    onScopeDestroy: function () {},
  });
  jnodes.bind = function () {
    return binder.bind.apply(binder, arguments);
  };
  jnodes.templateRender = function () {
    return binder.templateRender.apply(binder, arguments);
  };
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });
  var bookRender = binder.templateCompiler('jhtmls', document.querySelector('#book').innerHTML);
  binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.bind.$$scope;
  rootScope.element = null;
  rootScope.element = div;

  examplejs_print(rootScope.element === div);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

  examplejs_print(div.querySelector('ul li a').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "book1"); examplejs_printLines = [];

  books[0].title = 'Star Wars';
  examplejs_print(div.querySelector('ul li a').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "Star Wars"); examplejs_printLines = [];

  examplejs_print(binder.scope(div) === rootScope);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

  examplejs_print(binder.scope(div.querySelector('ul li a')).model.id === 1);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

  books.shift();
  examplejs_print(binder.scope(div.querySelector('ul li a')).model.id === 2);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
          
  it("jsdom@bind():bind jhtmls 2", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <ul :bind=\"books\">\n    books.forEach(function (book) {\n      <li :bind=\"book\">\n        <a :href=\"'/' + book.id\" :bind=\"book.title\">#{book.title}</a>\n        <span :bind=\"book.id\">#{book.id}</span>\n      </li>\n    });\n    </ul>\n    </script>\n  </div>", {
        features: {
          FetchExternalResources : ["script", "link"],
          ProcessExternalResources: ["script"]
        }
      },
      function (err, window) {
        global.window = window;
        ["document","navigator"].forEach(
          function (key) {
            global[key] = window[key];
          }
        );
        assert.equal(err, null);
        done();
      }
    );
  });
          
  it("bind():bind jhtmls 2", function () {
    examplejs_printLines = [];
  var binder = new jnodes.Binder();
  jnodes.bind = function () {
    return binder.bind.apply(binder, arguments);
  };
  jnodes.templateRender = function () {
    return binder.templateRender.apply(binder, arguments);
  };
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });

  var div = document.querySelector('div');
  div.innerHTML = binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  console.info(div.innerHTML);
  var rootScope = jnodes.bind.$$scope;
  rootScope.element = div;

  examplejs_print(JSON.stringify(binder.scope(div.querySelector('ul li a')).model));
  assert.equal(examplejs_printLines.join("\n"), "\"book1\""); examplejs_printLines = [];

  examplejs_print(JSON.stringify(binder.scope(div.querySelector('ul li span')).model));
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  books.shift();
  examplejs_print(JSON.stringify(binder.scope(div.querySelector('ul li a')).model));
  assert.equal(examplejs_printLines.join("\n"), "\"book2\""); examplejs_printLines = [];
  });
          
});
         