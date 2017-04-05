
global.jnodes = require('../src/jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
      

describe("src/jnodes.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  var jsdom = require('jsdom');
  

  it("bind():model", function () {
    examplejs_printLines = [];
    var model = { a: 1, b: 2 };
    var render = function () {};
    var scope = jnodes.bind(model, render);
    examplejs_print(scope.model === model);
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
          
  it("bind():render", function () {
    examplejs_printLines = [];
    var model = { a: 1, b: 2 };
    var render = function (_model) {
      examplejs_print(_model === model);
    };
    var scope = jnodes.bind(model, render);
    scope.render();
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
          
  it("bind():root", function () {
    examplejs_printLines = [];
    var model = { a: 1, b: 2 };
    var render = function (_model) { };
    var scope = jnodes.bind(model, render, true);
    examplejs_print(scope.root);
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
          
  it("bind():object trigger", function () {
    examplejs_printLines = [];
    var model = { a: 1, b: 2 };
    var render = function (_model) {
      examplejs_print(_model.a);
    };
    var scope = jnodes.bind(model, render, true);
    model.a = 3;
    assert.equal(examplejs_printLines.join("\n"), "3"); examplejs_printLines = [];

    var render2 = function (_model) {
      examplejs_print(model.b);
    }
    var scope = jnodes.bind(model, render2, true);
    model.b = 4;
    assert.equal(examplejs_printLines.join("\n"), "3\n4"); examplejs_printLines = [];
    model.b = 4;
    model.b = 5;
    assert.equal(examplejs_printLines.join("\n"), "3\n5"); examplejs_printLines = [];
  });
          
  it("bind():array trigger", function () {
    examplejs_printLines = [];
    var model = [1, 2, 3, 4];
    var count = 0;
    var render = function (_model) {
      count++;
    };
    var scope = jnodes.bind(model, render, true);
    model.push(1);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

    model.pop();
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];

    model.shift();
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "3"); examplejs_printLines = [];

    model.shift();
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "4"); examplejs_printLines = [];

    model.unshift(9);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "5"); examplejs_printLines = [];

    model.splice(0, 1);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "6"); examplejs_printLines = [];

    model.sort();
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "7"); examplejs_printLines = [];

    model.reverse();
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "8"); examplejs_printLines = [];
  });
          
  it("jsdom@bind():dom", function (done) {
    jsdom.env("    <ul></ul>", {
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
          
  it("bind():dom", function () {
    examplejs_printLines = [];
    var model = [1, 2, 3, 4];
    var count = 0;
    var render = function (_model, _output, _scope) {
      _output.push('<ul bind="' + _scope.id + '" class="box">');
      _model.forEach(function (item) {
        _output.push('<li>' + item + '</li>');
      });
      _output.push('</ul>');
    };
    var scope = jnodes.bind(model, render);
    var ul = document.querySelector('ul');
    ul.setAttribute('bind', scope.id);
    model.push(5);
    var ul = document.querySelector('ul');

    examplejs_print(ul.innerHTML);
    assert.equal(examplejs_printLines.join("\n"), "<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>"); examplejs_printLines = [];

    examplejs_print(ul.className);
    assert.equal(examplejs_printLines.join("\n"), "box"); examplejs_printLines = [];
  });
          
  it("observer():configurable is false", function () {
    examplejs_printLines = [];
    var data = { a: 1 };
    Object.defineProperty(data, 'a', {
      enumerable: true,
      configurable: false,
    });
    jnodes.observer(data);
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
    jnodes.observer(data);
    data.x = 123;
    examplejs_print(data.x);
    assert.equal(examplejs_printLines.join("\n"), "123"); examplejs_printLines = [];
  });
          
  it("jsdom@update():base", function (done) {
    jsdom.env("    <ul></ul>", {
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
          
  it("update():base", function () {
    examplejs_printLines = [];
    var model = [1, 2];
    var count = 0;
    var render = function (_model, _output, _scope) {
      _output.push('<ul></ul>');
      count++;
    };
    var scope = jnodes.bind(model, render);
    var ul = document.querySelector('ul');
    ul.setAttribute('bind', scope.id);
    model.push(3);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

    model.push(4);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

    jnodes.update('none');
  });
          
  it("jsdom@update():base", function (done) {
    jsdom.env("    <ul></ul>", {
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
          
  it("update():base", function () {
    examplejs_printLines = [];
    var model = [1, 2];
    var count = 0;
    var render = function (_model, _output, _scope) {
      count++;
      _output.push('<ul></ul>')
      return true;
    };
    var scope = jnodes.bind(model, render);
    var ul = document.querySelector('ul');
    ul.setAttribute('bind', scope.id);
    model.push(3);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

    model.push(4);
    examplejs_print(count);
    assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
  });
          
  it("jsdom@data():base", function (done) {
    jsdom.env("    <ul>\n      <li><button>click</button></li>\n    </ul>", {
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
          
  it("data():base", function () {
    examplejs_printLines = [];
    var model = { a: 1, b: 2 };
    var render = function (_model, _output, _scope) {
      _output.push('<li bind="' + _scope.id + '"><button>click</button></li>');
    };
    var scope = jnodes.bind(model, render);
    var li = document.querySelector('li');
    li.setAttribute('bind', scope.id);
    var button = document.querySelector('li button');
    var data = jnodes.data(button);
    examplejs_print(data.a);
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];
    var data2 = jnodes.data('none');
    examplejs_print(data2);
    assert.equal(examplejs_printLines.join("\n"), "undefined"); examplejs_printLines = [];
  });
          
  it("ejs", function () {
    examplejs_printLines = [];
    var render = jnodes.get('ejs');
    var text = render('<div bind="movie"><%= movie.title %> -- <%= movie.time %></div>', { movie: { title: 'Logan', time: '2017'} });

    examplejs_print(text.replace(/"\d+"/g, '"x"').trim());
    assert.equal(examplejs_printLines.join("\n"), "<div bind=\"x\">Logan -- 2017</div>"); examplejs_printLines = [];

    var text = render('<div bind="movie"><%= movie.title %> -- <%= movie.time %></div>', { movie: { title: 'Hacksaw Ridge', time: '2016'} });
    examplejs_print(text.replace(/"\d+"/g, '"x"').trim());
    assert.equal(examplejs_printLines.join("\n"), "<div bind=\"x\">Hacksaw Ridge -- 2016</div>"); examplejs_printLines = [];
  });
          
  it("jhtmls", function () {
    examplejs_printLines = [];
    var render = jnodes.get('jhtmls');
    var text = render('<div bind="movie">#{movie.title} -- #{movie.time}</div>', { movie: { title: 'Logan', time: '2017'} });

    examplejs_print(text.replace(/"\d+"/g, '"x"').trim());
    assert.equal(examplejs_printLines.join("\n"), "<div bind=\"x\">Logan -- 2017</div>"); examplejs_printLines = [];
  });
          
});
         