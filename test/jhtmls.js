
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.adapter_jhtmls = require('../lib/Adapter/jhtmls').adapter_jhtmls;
global.adapter_ejs = require('../lib/Adapter/ejs').adapter_ejs;
      

describe("src/ts/Adapter/jhtmls.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  var jsdom = require('jsdom');
  

  it("jsdom@adapter_jhtmls:base keyup.enter", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <input type=text @keyup.enter=\"pos.x = parseInt(this.value)\" value=\"-1\">\n    <div>\n      <button :bind=\"pos\" @click=\"pos.x++\" @update.none=\"console.info('none')\">plus #{pos.x}</button>\n    </div>\n    <h1 :bind=\"pos\"><button @click=\"pos.x++\">plus #{pos.x}</button></h1>\n    </script>\n  </div>", {
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
          
  it("adapter_jhtmls:base keyup.enter", function () {
    examplejs_printLines = [];
  var data = {
    tag: 'x',
    pos: {
      x: 1,
    }
  };
  var div = document.querySelector('div');
  var binder = jnodes.binder = new jnodes.Binder();

  jnodes.binder.registerAdapter('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, adapter_jhtmls);
    return jhtmls.render(code);
  });

  div.innerHTML = jnodes.binder.templateAdapter('jhtmls', div.querySelector('script').innerHTML)(data);
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;

  function keyChecker(event, trigger) {
    switch (trigger) {
      case 'enter':
        return event.keyCode === 13;
      case 'esc':
        return event.keyCode === 27;
    }
  }

  binder.registerChecker('keyup', keyChecker);

  function findEventTarget(parent, target, selector) {
    var elements = [].slice.call(parent.querySelectorAll(selector));
    while (target && elements.indexOf(target) < 0) {
      target = target.parentNode;
    }
    return target;
  }

  ['keydown', 'keyup'].forEach(function (eventName) {
    div.addEventListener(eventName, function (e) {
      var target = findEventTarget(div, e.target, '[' + binder._eventAttributePrefix + eventName + ']');
      if (!target) {
        return;
      }
      binder.triggerScopeEvent(e, target);
    })
  })

  var e = document.createEvent('HTMLEvents');
  e.initEvent('keyup', true, false);
  e.keyCode = 13;
  document.querySelector('input').dispatchEvent(e);
  examplejs_print(document.querySelector('button').innerHTML.trim());
  assert.equal(examplejs_printLines.join("\n"), "plus -1"); examplejs_printLines = [];
  });
          
  it("jsdom@adapter_jhtmls:base depend", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <div :bind=\"books\" class=\"list box\">\n      <h4>#{books.filter(function (book) { return book.star; }).length}</h4>\n      <ul>\n      books.forEach(function (book) {\n        <li :depend=\"book\">#{book.title}</li>\n      })\n      </ul>\n    </script>\n  </div>", {
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
          
  it("adapter_jhtmls:base depend", function () {
    examplejs_printLines = [];
  var data = {
    books: [{
      title: 'a',
      star: false,
    },{
      title: 'b',
      star: false,
    }]
  };
  var div = document.querySelector('div');
  var binder = jnodes.binder = new jnodes.Binder();

  jnodes.binder.registerAdapter('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, adapter_jhtmls);
    return jhtmls.render(code);
  });

  div.innerHTML = jnodes.binder.templateAdapter('jhtmls', div.querySelector('script').innerHTML)(data);
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;
  data.books[0].star = true;
  examplejs_print(div.querySelector('h4').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

  data.books[1].star = true;
  examplejs_print(div.querySelector('h4').innerHTML);
  assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];

  examplejs_print(div.querySelector('div').className);
  assert.equal(examplejs_printLines.join("\n"), "list box"); examplejs_printLines = [];
  });
          
});
         