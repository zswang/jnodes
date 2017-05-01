"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*<function name="adapter_jhtmls">*/
/**
 * 编译 jhtmls
 *
 * @param node 节点
 * @param bindObjectName 全局对象名
 * @example adapter_jhtmls:base1
  ```js
  var node = {
    tag: ':template'
  };
  adapter_jhtmls(node);
  console.log(JSON.stringify(node));
  // > {"tag":":template"}
  ```
 * @example adapter_jhtmls:base2
  ```js
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  adapter_jhtmls(node);
  console.log(JSON.stringify(node));
  // > {"tag":":template","attrs":[{"name":"class","value":"book"}]}
  ```
 * @example adapter_jhtmls:base keyup.enter
  ```html
  <div>
    <script type="text/jhtmls">
    <input type=text @keyup.enter="pos.x = parseInt(this.value)" value="-1">
    <div>
      <button :bind="pos" @click="pos.x++" @update.none="console.info('none')">plus #{pos.x}</button>
    </div>
    <h1 :bind="pos"><button @click="pos.x++">plus #{pos.x}</button></h1>
    </script>
  </div>
  ```
  ```js
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
  console.log(document.querySelector('button').innerHTML.trim());
  // > plus -1
  ```
 * @example adapter_jhtmls:base depend
  ```html
  <div>
    <script type="text/jhtmls">
    <div :bind="books" class="list box">
      <h4>#{books.filter(function (book) { return book.star; }).length}</h4>
      <ul>
      books.forEach(function (book) {
        <li :depend="book">#{book.title}</li>
      })
      </ul>
    </script>
  </div>
  ```
  ```js
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
  console.log(div.querySelector('h4').innerHTML);
  // > 1
  data.books[1].star = true;
  console.log(div.querySelector('h4').innerHTML);
  // > 2
  console.log(div.querySelector('div').className);
  // > list box
  ```
   */
function adapter_jhtmls(node, bindObjectName) {
    var indent = node.indent || '';
    var inserFlag = "/***/ ";
    if (node.type === 'root') {
        node.beforebegin = "" + indent + inserFlag + "var _rootScope_ = " + bindObjectName + ".bind(this, { root: true }, null, function (_output_, _scope_) {";
        node.afterend = "\n" + indent + inserFlag + "}); _rootScope_.innerRender(_output_); " + bindObjectName + ".$$scope = _rootScope_;";
        return;
    }
    if (!node.tag) {
        return;
    }
    if (!node.attrs || !node.attrs.length) {
        return;
    }
    if (node.tag === ':template') {
        node.attrs.some(function (attr) {
            if (attr.name === 'name') {
                node.overwriteNode = "\n" + indent + inserFlag + "_output_.push(" + bindObjectName + ".templateRender(" + JSON.stringify(attr.value) + ", _scope_, " + bindObjectName + ".bind));";
                return true;
            }
        });
        return;
    }
    var varintAttrs = "\n" + indent + inserFlag + "var _attrs_ = [\n";
    var hasOverwriteAttr;
    node.attrs.forEach(function (attr) {
        var value;
        if (attr.name[0] === ':') {
            if (attr.name === ':bind') {
                node.beforebegin = "\n" + indent + inserFlag + bindObjectName + ".bind(" + attr.value + ", _scope_, function (_output_, _scope_, holdInner) {\n";
                node.beforeend = "\n" + indent + inserFlag + "_scope_.innerRender = function(_output_) {\n";
                node.afterbegin = "\n" + indent + inserFlag + "}; if (holdInner) { _scope_.innerRender(_output_); }\n";
                node.afterend = "\n" + indent + inserFlag + "}).outerRender(_output_, true);\n";
            }
            else if (attr.name === ':depend') {
                node.beforebegin = "\n" + indent + inserFlag + bindObjectName + ".depend(" + attr.value + ", _scope_, function (_output_, _scope_) {\n";
                node.afterend = "\n" + indent + inserFlag + "}).outerRender(_output_);\n";
            }
            hasOverwriteAttr = true;
            value = attr.value;
        }
        else if (attr.name[0] === '@') {
            var arr = attr.name.split('.');
            var trigger = arr[1];
            if (trigger) {
                value = "function (event) { if (" + bindObjectName + ".eventChecker(event, " + JSON.stringify(trigger) + ")) { with (" + bindObjectName + "._imports || {}) { " + attr.value + " }}}";
            }
            else {
                value = "function (event) { with (" + bindObjectName + "._imports || {}) { " + attr.value + " }}";
            }
            hasOverwriteAttr = true;
        }
        else {
            value = JSON.stringify(attr.value);
        }
        varintAttrs += "" + indent + inserFlag + "{ name: " + JSON.stringify(attr.name) + ", value: " + value + ", quoted: " + JSON.stringify(attr.quoted) + "},\n";
    });
    if (!hasOverwriteAttr) {
        return;
    }
    node.beforebegin = node.beforebegin || '';
    varintAttrs += "" + indent + inserFlag + "];\n";
    node.beforebegin += varintAttrs;
    node.overwriteAttrs = "!#{" + bindObjectName + "._attrsRender(_scope_, _attrs_, { tag: " + JSON.stringify(node.tag) + ", id: " + JSON.stringify(node.id) + " })}";
} /*</function>*/
exports.adapter_jhtmls = adapter_jhtmls;
