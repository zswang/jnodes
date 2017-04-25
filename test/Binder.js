
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.art = require('art-template/lib/template-web');
global.compiler_jhtmls = require('../src/js/Compiler/jhtmls').compiler_jhtmls;
global.compiler_ejs = require('../src/js/Compiler/ejs').compiler_ejs;
global.compiler_art = require('../src/js/Compiler/art').compiler_art;
      

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
  jnodes.binder = new jnodes.Binder();
  var data = {x: 1, y: 2};
  var rootScope = {};
  var count = 0;
  jnodes.binder.bind(data, rootScope, function (output) {
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

  examplejs_print(JSON.stringify(jnodes.binder.scope('none')));
  assert.equal(examplejs_printLines.join("\n"), "undefined"); examplejs_printLines = [];
  examplejs_print(JSON.stringify(jnodes.binder.templateCompiler('none')));
  assert.equal(examplejs_printLines.join("\n"), "undefined"); examplejs_printLines = [];
  examplejs_print(JSON.stringify(jnodes.binder.templateRender('none')));
  assert.equal(examplejs_printLines.join("\n"), "undefined"); examplejs_printLines = [];
  examplejs_print(JSON.stringify(jnodes.binder._attrsRender(rootScope)));
  assert.equal(examplejs_printLines.join("\n"), "\"\""); examplejs_printLines = [];
  var scope = {
    children: [{
      model: {
        $$binds: []
      }
    }]
  };
  jnodes.binder.cleanChildren(scope);
  var scope = {
    children: [{
      model: {}
    }]
  };
  jnodes.binder.cleanChildren(scope);
  });
          
  it("jsdom@bind():bind jhtmls", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <h1 :class=\"{book: Math.random() > 0.5}\">Books</h1>\n    <ul :bind=\"books\" @create=\"books.loaded = 'done'\">\n    books.forEach(function (book) {\n      <li :bind=\"book\">\n        <:template name=\"book\"/>\n      </li>\n    });\n    </ul>\n    </script>\n  </div>\n  <script type=\"text/jhtmls\" id=\"book\">\n  <a href=\"#{id}\">#{title}</a>\n  </script>", {
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
  jnodes.binder = new jnodes.Binder();
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  jnodes.binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });
  var bookRender = jnodes.binder.templateCompiler('jhtmls', document.querySelector('#book').innerHTML);
  jnodes.binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
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
          
  it("jsdom@bind():bind jhtmls 2", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <ul :bind=\"books\" :data-length=\"books.length\" @create=\"books.loaded = 'done'\" class=\"books\">\n    books.forEach(function (book) {\n      <li :bind=\"book\" @click=\"book.star = !book.star\" class=\"\" :class=\"{star: book.star}\">\n        <a :href=\"'/' + book.id\" :bind=\"book.title\" @destroy=\"console.info('destroy')\">#{book.title}</a>\n        <span :bind=\"book.id\" :data-star=\"book.star\">#{book.id}</span>\n      </li>\n    });\n    </ul>\n    </script>\n  </div>", {
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
  jnodes.binder = new jnodes.Binder({});

  var books = [{id: 1, title: 'book1', star: false}, {id: 2, title: 'book2', star: false}, {id: 3, title: 'book3', star: false}];
  jnodes.binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });

  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
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
          
  it("bind():update", function () {
    examplejs_printLines = [];
  var data = {x: 1, y: 2};
  var binder = new jnodes.Binder();
  var scope = binder.bind(data, null, null);
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  examplejs_print(JSON.stringify(element));
  assert.equal(examplejs_printLines.join("\n"), "{}"); examplejs_printLines = [];

  var scope = binder.bind(data, null, null, function (output) {
    output.push('<div></div>');
  });
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  examplejs_print(JSON.stringify(element));
  assert.equal(examplejs_printLines.join("\n"), "{\"innerHTML\":\"<div></div>\"}"); examplejs_printLines = [];
  });
          
  it("triggerScopeEvent:coverage 1", function () {
    examplejs_printLines = [];
    var binder = new jnodes.Binder();
    var element = {
      getAttribute: function () {
        return null;
      }
    };
    binder.triggerScopeEvent({ target: element });
  });
          
  it("triggerScopeEvent:coverage 2", function () {
    examplejs_printLines = [];
    var binder = new jnodes.Binder();

    var scope = binder.bind({ x: 1 }, null, function (output) {
      output.push('<div></div>');
    });
    var element = {
      getAttribute: function (attrName) {
        switch (attrName) {
          case 'data-jnodes-event-click':
            return '@1';
          case 'data-jnodes-scope':
            return scope.id;
        }
      }
    };
    binder.triggerScopeEvent({ type: 'click', target: element });
    binder.triggerScopeEvent({ type: 'click', target: null });
    var element2 = {
      getAttribute: function (attrName) {
        switch (attrName) {
          case 'data-jnodes-event-click':
            return '@1';
        }
      }
    };
    binder.triggerScopeEvent({ type: 'click', target: element2 });
  });
          
});
         