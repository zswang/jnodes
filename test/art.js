
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.art = require('art-template/lib/template-web');
global.compiler_jhtmls = require('../src/js/Compiler/jhtmls').compiler_jhtmls;
global.compiler_ejs = require('../src/js/Compiler/ejs').compiler_ejs;
global.compiler_art = require('../src/js/Compiler/art').compiler_art;
      

describe("src/ts/Compiler/art.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  var jsdom = require('jsdom');
  

  it("jsdom@compiler_art:base1", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/art\">\n    <h1 :class=\"{book: Math.random() > 0.5}\">Books</h1>\n    <ul :bind=\"books\" @create=\"books.loaded = 'done'\">\n    <% books.forEach(function (book) { %>\n      <li :bind=\"book\">\n        <:template name=\"book\"/>\n      </li>\n    <% }); %>\n    </ul>\n    </script>\n  </div>\n  <script type=\"text/art\" id=\"book\">\n  <a :href=\"id\"><%= title %></a>\n  </script>", {
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
          
  it("compiler_art:base1", function () {
    examplejs_printLines = [];
  var escape = function escape(content) {

      var escapeReg = /&(?![\w#]+;)|[<>"']/g;
      var escapeMap = {
          "<": "&#60;",
          ">": "&#62;",
          '"': "&#34;",
          "'": "&#39;",
          "&": "&#38;"
      };

      var toString = function toString(value) {
          if (typeof value !== 'string') {
              if (typeof value === 'function') {
                  value = toString(value.call(value));
              } else if (value === null) {
                  value = '';
              } else {
                  // number | array | object | undefined
                  value = JSON.stringify(value) || '';
              }
          }

          return value;
      };

      return toString(content).replace(escapeReg, function (s) {
          return escapeMap[s];
      });
  };

  jnodes.binder = new jnodes.Binder();
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  jnodes.binder.registerCompiler('art', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_art);
    var imports = jnodes.binder._import || {};
    imports.jnodes = jnodes;
    imports.Math = Math;
    imports.$escape = escape;
    return art.compile(code, { imports: imports });
  });
  var bookRender = jnodes.binder.templateCompiler('art', document.querySelector('#book').innerHTML);
  jnodes.binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('art', div.querySelector('script').innerHTML)({
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
          
  it("jsdom@compiler_art:base2", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/art\">\n    <ul :bind=\"books\" :data-length=\"books.length\" @create=\"books.loaded = 'done'\" class=\"books\">\n    <% books.forEach(function (book) { %>\n      <li :bind=\"book\" @click=\"book.star = !book.star\" class=\"\" :class=\"{star: book.star}\">\n        <a :href=\"'/' + book.id\" :bind=\"book.title\"><%= book.title %></a>\n        <span :bind=\"book.id\" :data-star=\"book.star\"><%= book.id %></span>\n      </li>\n    <% }); %>\n    </ul>\n    </script>\n  </div>", {
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
          
  it("compiler_art:base2", function () {
    examplejs_printLines = [];
  function lifecycle(type) {
    return function (scope) {
      if (!scope.lifecycle) {
        return;
      }
      var element = jnodes.binder.element(scope);
      if (element) {
        var elements;
        if (element.getAttribute(jnodes.binder.eventAttributePrefix + type)) {
          elements = [element];
        } else {
          elements = [];
        }
        [].push.apply(elements, element.querySelectorAll('[' + jnodes.binder.eventAttributePrefix + type + ']'));
        elements.forEach(function(item) {
          var e = { type: type };
          triggerScopeEvent(e, item);
          item.removeAttribute(jnodes.binder.eventAttributePrefix + type);
        });
      }
    }
  }
  jnodes.binder = new jnodes.Binder({
    onScopeCreate: lifecycle('create'),
    onScopeDestroy: lifecycle('destroy'),
  });

  var escape = function escape(content) {

      var escapeReg = /&(?![\w#]+;)|[<>"']/g;
      var escapeMap = {
          "<": "&#60;",
          ">": "&#62;",
          '"': "&#34;",
          "'": "&#39;",
          "&": "&#38;"
      };

      var toString = function toString(value) {
          if (typeof value !== 'string') {
              if (typeof value === 'function') {
                  value = toString(value.call(value));
              } else if (value === null) {
                  value = '';
              } else {
                  // number | array | object | undefined
                  value = JSON.stringify(value) || '';
              }
          }

          return value;
      };

      return toString(content).replace(escapeReg, function (s) {
          return escapeMap[s];
      });
  };

  var books = [{id: 1, title: 'book1', star: false}, {id: 2, title: 'book2', star: false}, {id: 3, title: 'book3', star: false}];
  jnodes.binder.registerCompiler('art', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_art);
    var imports = jnodes.binder._import || {};
    imports.jnodes = jnodes;
    imports.Math = Math;
    imports.$escape = escape;
    return art.compile(code, { imports: imports });
  });

  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('art', div.querySelector('script').innerHTML)({
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

  function triggerScopeEvent(event, target) {
    target = target || event.target;
    var cmd = target.getAttribute('data-jnodes-event-' + event.type);

    if (cmd && cmd[0] === '@') {
      var scope = jnodes.binder.scope(target);
      var method = (scope.methods || {})[cmd]
      if (method) {
        method.call(target, event);
      }
    }
  }

  ['click'].forEach(function (eventName) {
    document.addEventListener(eventName, function (e) {
      var target = findEventTarget(document, e.target, '[data-jnodes-event-' + eventName + ']');
      if (!target) {
        return;
      }
      triggerScopeEvent(e, target);
    })
  });

  var li = div.querySelector('ul li');
  li.click();

  var li = div.querySelector('ul li');
  examplejs_print(li.className);
  assert.equal(examplejs_printLines.join("\n"), "star"); examplejs_printLines = [];
  });
          
  it("compiler_art:base3", function () {
    examplejs_printLines = [];
  var node = {
    tag: ':template'
  };
  compiler_art(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\":template\"}"); examplejs_printLines = [];
  });
          
  it("compiler_art:base4", function () {
    examplejs_printLines = [];
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  compiler_art(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\":template\",\"attrs\":[{\"name\":\"class\",\"value\":\"book\"}]}"); examplejs_printLines = [];
  });
          
  it("compiler_art:base5", function () {
    examplejs_printLines = [];
  var node = {
    tag: 'span',
    attrs: [{
      name: 'class',
      value: 'book',
    }]
  };
  compiler_art(node);
  examplejs_print(JSON.stringify(node));
  assert.equal(examplejs_printLines.join("\n"), "{\"tag\":\"span\",\"attrs\":[{\"name\":\"class\",\"value\":\"book\"}]}"); examplejs_printLines = [];
  });
          
});
         