
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
  var jsdom = require('jsdom');
  

  it("compiler_jhtmls:base1", function () {
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
          
  it("jsdom@compiler_jhtmls:base keyup.enter", function (done) {
    jsdom.env("  <div>\n    <script type=\"text/jhtmls\">\n    <input type=\"text\" @keyup.enter=\"pos.x = parseInt(this.value)\" value=\"-1\">\n    <div><button :bind=\"pos\" @click=\"pos.x++\" @update.none=\"console.info('none')\">plus #{pos.x}</button></div>\n    </script>\n  </div>", {
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
          
  it("compiler_jhtmls:base keyup.enter", function () {
    examplejs_printLines = [];
  var data = {
    tag: 'x',
    pos: {
      x: 1,
    }
  };
  var div = document.querySelector('div');
  var binder = jnodes.binder = new jnodes.Binder();

  jnodes.binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });

  div.innerHTML = jnodes.binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)(data);
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
          
});
         