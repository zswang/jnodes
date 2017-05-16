
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.adapter_jhtmls = require('../lib/Adapter/jhtmls').adapter_jhtmls;
global.adapter_ejs = require('../lib/Adapter/ejs').adapter_ejs;
      

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
  jnodes.binder.bind([data], rootScope, function (output) {
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
  examplejs_print(JSON.stringify(jnodes.binder.templateAdapter('none')));
  assert.equal(examplejs_printLines.join("\n"), "undefined"); examplejs_printLines = [];
  examplejs_print(JSON.stringify(jnodes.binder._attrsRender(rootScope)));
  assert.equal(examplejs_printLines.join("\n"), "\"\""); examplejs_printLines = [];
  var scope = {
    children: [{
      models: [{
        $$binds: function () {
          return [];
        }
      }]
    }]
  };
  jnodes.binder.cleanChildren(scope);
  var scope = {
    children: [{
      models: [{}]
    },{
    }]
  };
  jnodes.binder.cleanChildren(scope);
  jnodes.binder.update();

  var scope = {
    type: 'depend',
    binder: jnodes.binder,
    parent: {
      type: 'bind',
      binder: jnodes.binder,
      models: [{}]
    }
  };
  var data = { x: 1 };
  jnodes.binder.observer(data, scope);
  data.x = 2;

  var scope = {
    type: 'depend',
    binder: jnodes.binder,
    parent: {
      type: 'depend',
      binder: jnodes.binder,
      models: [{
        $$binds: function () {
          return [{
            id: 0,
            type: 'bind',
            binder: jnodes.binder,
            models: [{}],
          }, {
            id: 0,
            type: 'depend',
            binder: jnodes.binder,
            models: [{}],
            parent: {
              binder: jnodes.binder,
            }
          }, {
            id: 0,
            type: 'depend',
            binder: jnodes.binder,
            models: [{}],
            parent: {
              binder: jnodes.binder,
              models: [{}],
            }
          }]
        },
      }],
    },
  };
  var data = { x: 1 };
  jnodes.binder.observer(data, scope);
  data.x = 2;

  var $$scope = {
    id: 0,
    type: 'bind',
    binder: jnodes.binder,
    models: [{}],
  };
  var $$binds = function() {
    return [$$scope]
  };
  var parent = {
    id: 0,
    type: 'depend',
    binder: jnodes.binder,
    models: [{}],
    parent: {
      id: 0,
      type: 'bind',
      binder: jnodes.binder,
      models: [{
        $$binds: $$binds
      }],
    }
  };
  var scope = {
    type: 'depend',
    binder: jnodes.binder,
    parent: {
      type: 'depend',
      binder: jnodes.binder,
      models: [{
        $$binds: function () {
          return [{
            id: 0,
            type: 'bind',
            binder: jnodes.binder,
            models: [{}],
          }, parent, parent]
        }
      }],
    },
  };
  var data = { x: 1 };
  jnodes.binder.observer(data, scope);
  data.x = 2;
  });
          
  it("jsdom@bind():bind jhtmls", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <h1 :class=\"{book: Math.random() > 0.5}\">Books</h1>\n    <ul :bind=\"books\" @create=\"books.loaded = 'done'\">\n    books.forEach(function (book) {\n      <li :bind=\"book\">\n        <a href=\"#{book.id}\">#{book.title}</a>\n      </li>\n    });\n    </ul>\n    </script>\n  </div>", {
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
  jnodes.binder.registerAdapter('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, adapter_jhtmls);
    return jhtmls.render(code);
  });
  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateAdapter('jhtmls', div.querySelector('script').innerHTML)({
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
  jnodes.binder.registerAdapter('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, adapter_jhtmls);
    return jhtmls.render(code);
  });

  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateAdapter('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;

  examplejs_print(books.loaded);
  assert.equal(examplejs_printLines.join("\n"), "done"); examplejs_printLines = [];

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
  var scope = binder.bind([data], null, null);
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  examplejs_print(JSON.stringify(element));
  assert.equal(examplejs_printLines.join("\n"), "{}"); examplejs_printLines = [];

  var scope = binder.bind([data], null, null, function (output) {
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
          
  it("jsdom@bind():attr is null", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <input type=\"checkbox\" :checked=\"checked\">\n    </script>\n  </div>", {
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
          
  it("bind():attr is null", function () {
    examplejs_printLines = [];
  var binder = new jnodes.Binder();
  var data = { checked: false };
  var div = document.querySelector('div');
  jnodes.binder.registerAdapter('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, adapter_jhtmls);
    return jhtmls.render(code);
  });
  div.innerHTML = jnodes.binder.templateAdapter('jhtmls', div.querySelector('script').innerHTML)(data);
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;

  examplejs_print(div.innerHTML.trim());
  assert.equal(examplejs_printLines.join("\n"), "<input type=\"checkbox\">"); examplejs_printLines = [];

  data.checked = true;
  examplejs_print(div.innerHTML.trim());
  assert.equal(examplejs_printLines.join("\n"), "<input checked=\"\" type=\"checkbox\">"); examplejs_printLines = [];
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

    var scope = binder.bind([{ x: 1 }], null, function (output) {
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
         