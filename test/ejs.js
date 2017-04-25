
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.art = require('art-template/lib/template-web');
global.compiler_jhtmls = require('../src/js/Compiler/jhtmls').compiler_jhtmls;
global.compiler_ejs = require('../src/js/Compiler/ejs').compiler_ejs;
global.compiler_art = require('../src/js/Compiler/art').compiler_art;
      

describe("src/ts/Compiler/ejs.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  var jsdom = require('jsdom');
  

  it("jsdom@compiler_ejs:base1", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/ejs\">\n    <h1 :class=\"{book: Math.random() > 0.5}\">Books</h1>\n    <ul :bind=\"books\" @create=\"books.loaded = 'done'\">\n    <% books.forEach(function (book) { %>\n      <li :bind=\"book\">\n        <:template name=\"book\"/>\n      </li>\n    <% }); %>\n    </ul>\n    </script>\n  </div>\n  <script type=\"text/ejs\" id=\"book\">\n  <a :href=\"id\"><%= title %></a>\n  </script>", {
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
          
  it("compiler_ejs:base1", function () {
    examplejs_printLines = [];
  jnodes.binder = new jnodes.Binder();
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  jnodes.binder.registerCompiler('ejs', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_ejs);
    return ejs.compile(code);
  });
  var bookRender = jnodes.binder.templateCompiler('ejs', document.querySelector('#book').innerHTML);
  jnodes.binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('ejs', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = null;
  rootScope.element = div;

  examplejs_print(rootScope.element === div);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

  examplejs_print(div.querySelector('ul li a').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "book1"); examplejs_printLines = [];

  books[0].title = 'Star Wars';
  examplejs_print(div.querySelector('ul li a').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "Star Wars"); examplejs_printLines = [];

  books[0].title = 'Jane Eyre';
  examplejs_print(div.querySelector('ul li a').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "Jane Eyre"); examplejs_printLines = [];

  examplejs_print(jnodes.binder.scope(div) === rootScope);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

  examplejs_print(jnodes.binder.scope(div.querySelector('ul li a')).model.id === 1);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

  books.shift();
  examplejs_print(jnodes.binder.scope(div.querySelector('ul li a')).model.id === 2);
  assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
          
  it("jsdom@compiler_ejs:base2", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/ejs\">\n    <ul :bind=\"books\" :data-length=\"books.length\" @create=\"books.loaded = 'done'\" class=\"books\">\n    <% books.forEach(function (book) { %>\n      <li :bind=\"book\" @click=\"book.star = !book.star\" class=\"\" :class=\"{star: book.star}\">\n        <a :href=\"'/' + book.id\" :bind=\"book.title\"><%= book.title %></a>\n        <span :bind=\"book.id\" :data-star=\"book.star\"><%= book.id %></span>\n      </li>\n    <% }); %>\n    </ul>\n    </script>\n  </div>", {
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
          
  it("compiler_ejs:base2", function () {
    examplejs_printLines = [];
  jnodes.binder = new jnodes.Binder({});

  var books = [{id: 1, title: 'book1', star: false}, {id: 2, title: 'book2', star: false}, {id: 3, title: 'book3', star: false}];
  jnodes.binder.registerCompiler('ejs', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_ejs);
    return ejs.compile(code);
  });

  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('ejs', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;

  examplejs_print(books.loaded);
  assert.equal(examplejs_printLines.join("\n"), "done"); examplejs_printLines = [];

  examplejs_print(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li a')).model));
  assert.equal(examplejs_printLines.join("\n"), "\"book1\""); examplejs_printLines = [];

  examplejs_print(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li span')).model));
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  books.shift();
  examplejs_print(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li a')).model));
  assert.equal(examplejs_printLines.join("\n"), "\"book2\""); examplejs_printLines = [];

  function findEventTarget(parent, target, selector) {
    var elements = [].slice.call(parent.querySelectorAll(selector));
    while (target && elements.indexOf(target) < 0) {
      target = target.parentNode;
    }
    return target;
  }

  ['click'].forEach(function (eventName) {
    document.addEventListener(eventName, function (e) {
      if (e.target.getAttribute('data-jnodes-event-input')) {
        if (eventName === 'focusin') {
          e.target.addEventListener('input', triggerScopeEvent)
        } else if (eventName === 'focusout') {
          e.target.removeEventListener('input', triggerScopeEvent)
        }
      }

      var target = findEventTarget(document, e.target, '[data-jnodes-event-' + eventName + ']');
      if (!target) {
        return;
      }
      jnodes.binder.triggerScopeEvent(e, target);
    })
  });

  var li = div.querySelector('ul li');
  li.click();

  var li = div.querySelector('ul li');
  examplejs_print(li.className);
  assert.equal(examplejs_printLines.join("\n"), "star"); examplejs_printLines = [];
  });
          
  it("compiler_ejs:base3", function () {
    examplejs_printLines = [];
  var node = {
    tag: ':template'
  };
  compiler_ejs(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\":template\"}"); examplejs_printLines = [];
  });
          
  it("compiler_ejs:base4", function () {
    examplejs_printLines = [];
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  compiler_ejs(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\":template\",\"attrs\":[{\"name\":\"class\",\"value\":\"book\"}]}"); examplejs_printLines = [];
  });
          
  it("compiler_ejs:base5", function () {
    examplejs_printLines = [];
  var node = {
    tag: 'span',
    attrs: [{
      name: 'class',
      value: 'book',
    }]
  };
  compiler_ejs(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\"span\",\"attrs\":[{\"name\":\"class\",\"value\":\"book\"}]}"); examplejs_printLines = [];
  });
          
});
         