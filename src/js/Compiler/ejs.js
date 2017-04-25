"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*<function name="compiler_ejs">*/
/**
 * EJS 处理
 *
 * @param node
 * @param bindObjectName
 * @example compiler_ejs:base1
  ```html
  <div>
    <script type="text/ejs">
    <h1 :class="{book: Math.random() > 0.5}">Books</h1>
    <ul :bind="books" @create="books.loaded = 'done'">
    <% books.forEach(function (book) { %>
      <li :bind="book">
        <:template name="book"/>
      </li>
    <% }); %>
    </ul>
    </script>
  </div>
  <script type="text/ejs" id="book">
  <a :href="id"><%= title %></a>
  </script>
  ```
  ```js
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
  console.log(rootScope.element === div);
  // > true
  console.log(div.querySelector('ul li a').innerHTML);
  // > book1
  books[0].title = 'Star Wars';
  console.log(div.querySelector('ul li a').innerHTML);
  // > Star Wars
  books[0].title = 'Jane Eyre';
  console.log(div.querySelector('ul li a').innerHTML);
  // > Jane Eyre
  console.log(jnodes.binder.scope(div) === rootScope);
  // > true
  console.log(jnodes.binder.scope(div.querySelector('ul li a')).model.id === 1);
  // > true
  books.shift();
  console.log(jnodes.binder.scope(div.querySelector('ul li a')).model.id === 2);
  // > true
  ```
 * @example compiler_ejs:base2
  ```html
  <div>
    <script type="text/ejs">
    <ul :bind="books" :data-length="books.length" @create="books.loaded = 'done'" class="books">
    <% books.forEach(function (book) { %>
      <li :bind="book" @click="book.star = !book.star" class="" :class="{star: book.star}">
        <a :href="'/' + book.id" :bind="book.title"><%= book.title %></a>
        <span :bind="book.id" :data-star="book.star"><%= book.id %></span>
      </li>
    <% }); %>
    </ul>
    </script>
  </div>
  ```
  ```js
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
  console.log(books.loaded);
  // > done
  console.log(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li a')).model));
  // > "book1"
  console.log(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li span')).model));
  // > 1
  books.shift();
  console.log(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li a')).model));
  // > "book2"
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
  console.log(li.className);
  // > star
  ```
 * @example compiler_ejs:base3
  ```js
  var node = {
    tag: ':template'
  };
  compiler_ejs(node);
  console.log(JSON.stringify(node));
  // > {"tag":":template"}
  ```
 * @example compiler_ejs:base4
  ```js
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  compiler_ejs(node);
  console.log(JSON.stringify(node));
  // > {"tag":":template","attrs":[{"name":"class","value":"book"}]}
  ```
 * @example compiler_ejs:base5
  ```js
  var node = {
    tag: 'span',
    attrs: [{
      name: 'class',
      value: 'book',
    }]
  };
  compiler_ejs(node);
  console.log(JSON.stringify(node));
  // > {"tag":"span","attrs":[{"name":"class","value":"book"}]}
  ```
   */
function compiler_ejs(node, bindObjectName) {
    var indent = node.indent || '';
    if (node.type === 'root') {
        node.beforebegin = "<%" + indent + "/***/ var _rootScope_ = " + bindObjectName + ".bind(locals, { root: true }, null, function (__output, _scope_) { var __append = __output.push.bind(__output); %>";
        node.afterend = "<%" + indent + "/***/ }); _rootScope_.innerRender(__output); " + bindObjectName + ".$$scope = _rootScope_;%>";
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
                node.overwriteNode = "<%" + indent + "/***/ __append(" + bindObjectName + ".templateRender(" + JSON.stringify(attr.value) + ", _scope_, " + bindObjectName + ".bind)); %>";
                return true;
            }
        });
        return;
    }
    var varintAttrs = "<%" + indent + "/***/ var _attrs_ = [\n";
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
            value = "function (event) { with (" + bindObjectName + "._imports || {}) { " + attr.value + " }}";
            hasOverwriteAttr = true;
        }
        else {
            value = JSON.stringify(attr.value);
        }
        varintAttrs += indent + "/***/ { name: " + JSON.stringify(attr.name) + ", value: " + value + ", quoted: " + JSON.stringify(attr.quoted) + "},\n";
    });
    if (!hasOverwriteAttr) {
        return;
    }
    node.beforebegin = "";
    if (bindDataValue) {
        node.beforebegin += "<%" + indent + "/***/ " + bindObjectName + ".bind(" + bindDataValue + ", _scope_, function (__output, _scope_, holdInner) { var __append = __output.push.bind(__output); %>";
        node.beforeend = "<%" + indent + "/***/ _scope_.innerRender = function(__output) { var __append = __output.push.bind(__output); %>";
        node.afterbegin = "<%" + indent + "/***/ }; if (holdInner) { _scope_.innerRender(__output); }%>";
        node.afterend = "<%" + indent + "/***/ }).outerRender(__output, true); %>";
    }
    varintAttrs += indent + "/***/ ];%>";
    node.beforebegin += varintAttrs;
    node.overwriteAttrs = "<%- " + bindObjectName + "._attrsRender(_scope_, _attrs_) %>";
} /*</function>*/
exports.compiler_ejs = compiler_ejs;
