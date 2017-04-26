"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*<function name="compiler_jhtmls">*/
/**
 * 编译 jhtmls
 *
 * @param node 节点
 * @param bindObjectName 全局对象名
 * @example compiler_jhtmls:base1
  ```js
  var node = {
    tag: ':template'
  };
  compiler_jhtmls(node);
  console.log(JSON.stringify(node));
  // > {"tag":":template"}
  ```
 * @example compiler_jhtmls:base2
  ```js
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  compiler_jhtmls(node);
  console.log(JSON.stringify(node));
  // > {"tag":":template","attrs":[{"name":"class","value":"book"}]}
  ```
 * @example compiler_jhtmls:base keyup.enter
  ```html
  <div>
    <script type="text/jhtmls">
    <input type="text" @keyup.enter="pos.x = parseInt(this.value)" value="-1">
    <div><button :bind="pos" @click="pos.x++" @update.none="console.info('none')">plus #{pos.x}</button></div>
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
  console.log(document.querySelector('button').innerHTML.trim());
  // > plus -1
  ```
 */
function compiler_jhtmls(node, bindObjectName) {
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
    var bindDataValue;
    node.attrs.forEach(function (attr) {
        var value;
        if (attr.name[0] === ':') {
            if (attr.name === ':bind') {
                bindDataValue = attr.value;
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
    node.beforebegin = '';
    if (bindDataValue) {
        node.beforebegin += "\n" + indent + inserFlag + bindObjectName + ".bind(" + bindDataValue + ", _scope_, function (_output_, _scope_, holdInner) {\n";
        node.beforeend = "\n" + indent + inserFlag + "_scope_.innerRender = function(_output_) {\n";
        node.afterbegin = "\n" + indent + inserFlag + "}; if (holdInner) { _scope_.innerRender(_output_); }\n";
        node.afterend = "\n" + indent + inserFlag + "}).outerRender(_output_, true);\n";
    }
    varintAttrs += "" + indent + inserFlag + "];\n";
    node.beforebegin += varintAttrs;
    node.overwriteAttrs = "!#{" + bindObjectName + "._attrsRender(_scope_, _attrs_)}";
} /*</function>*/
exports.compiler_jhtmls = compiler_jhtmls;
