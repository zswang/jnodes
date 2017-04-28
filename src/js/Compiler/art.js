"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*<function name="compiler_art">*/
/**
 * art 处理
 *
 * @param node
 * @param bindObjectName
 * @example compiler_art:base1
  ```html
  <div>
    <script type="text/art">
    <input type="text" @keyup.enter="books.push({id: 4, title: this.value})" value="new">
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
  <script type="text/art" id="book">
  <a :href="id"><%= title %></a>
  </script>
  ```
  ```js
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
  var binder = jnodes.binder = new jnodes.Binder();
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  binder.registerCompiler('art', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, {
      bindObjectName: bindObjectName,
      out: (art.compile.Compiler && art.compile.Compiler.CONSTS.OUT) || '$out',
    }, compiler_art);
    var imports = binder._import || {};
    imports.jnodes = jnodes;
    imports.Math = Math;
    imports.$escape = escape;
    return art.compile(code, { imports: imports });
  });
  var bookRender = binder.templateCompiler('art', document.querySelector('#book').innerHTML);
  binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = binder.templateCompiler('art', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = binder.$$scope;
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
  console.log(binder.scope(div) === rootScope);
  // > true
  console.log(binder.scope(div.querySelector('ul li a')).model.id === 1);
  // > true
  books.shift();
  console.log(binder.scope(div.querySelector('ul li a')).model.id === 2);
  // > true
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
  console.log(document.querySelector('li:last-child').innerHTML.trim());
  // > <a href="4">new</a>
  ```
 * @example compiler_art:base2
  ```html
  <div>
    <script type="text/art">
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
  jnodes.binder = new jnodes.Binder();
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
    var code = jnodes.Parser.build(node, {
      bindObjectName: bindObjectName,
      out: (art.compile.Compiler && art.compile.Compiler.CONSTS.OUT) || '$out',
    }, compiler_art);
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
 * @example compiler_art:base3
  ```js
  var node = {
    tag: ':template'
  };
  compiler_art(node, { bindObjectName: 'jnodes', out: '$out' });
  console.log(JSON.stringify(node));
  // > {"tag":":template"}
  ```
 * @example compiler_art:base4
  ```js
  var node = {
    tag: ':template',
    attrs: [{
      name: 'class',
      value: 'book'
    }]
  };
  compiler_art(node, { bindObjectName: 'jnodes', out: '$out' });
  console.log(JSON.stringify(node));
  // > {"tag":":template","attrs":[{"name":"class","value":"book"}]}
  ```
 * @example compiler_art:base5
  ```js
  var node = {
    tag: 'span',
    attrs: [{
      name: 'class',
      value: 'book',
    }]
  };
  compiler_art(node, { bindObjectName: 'jnodes', out: '$out' });
  console.log(JSON.stringify(node));
  // > {"tag":"span","attrs":[{"name":"class","value":"book"}]}
  ```
 * @example compiler_art:base depend
  ```html
  <div>
    <script type="text/art">
    <div :bind="books">
      <h4><%= books.filter(function (book) { return book.star; }).length %></h4>
      <ul>
      <% books.forEach(function (book) { %>
        <li :depend="book">#{book.title}</li>
      <% }); %>
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
  jnodes.binder.registerCompiler('art', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, {
      bindObjectName: bindObjectName,
      out: (art.compile.Compiler && art.compile.Compiler.CONSTS.OUT) || '$out',
    }, compiler_art);
    var imports = jnodes.binder._import || {};
    imports.jnodes = jnodes;
    imports.Math = Math;
    imports.$escape = escape;
    return art.compile(code, { imports: imports });
  });
  div.innerHTML = jnodes.binder.templateCompiler('art', div.querySelector('script').innerHTML)(data);
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;
  data.books[0].star = true;
  console.log(div.querySelector('h4').innerHTML);
  // > 1
  data.books[1].star = true;
  console.log(div.querySelector('h4').innerHTML);
  // > 2
  ```
   */
function compiler_art(node, options) {
    var indent = node.indent || '';
    var bindObjectName = options.bindObjectName;
    if (node.type === 'root') {
        node.beforebegin = "<%" + indent + "/***/ var _rootScope_ = " + bindObjectName + ".bind($data, { root: true }, null, function (_output_, _scope_) { var " + options.out + " = ''; %>";
        node.afterend = "<%" + indent + "/***/ _output_.push(" + options.out + "); }); var _output_ = []; _rootScope_.innerRender(_output_); " + options.out + " += _output_.join(''); " + bindObjectName + ".$$scope = _rootScope_; %>";
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
                node.overwriteNode = "<% " + options.out + " += " + bindObjectName + ".templateRender(" + JSON.stringify(attr.value) + ", _scope_, " + bindObjectName + ".bind); %>";
                return true;
            }
        });
        return;
    }
    var varintAttrs = "<%" + indent + "/***/ var _attrs_ = [\n";
    var hasOverwriteAttr;
    node.attrs.forEach(function (attr) {
        var value;
        if (attr.name[0] === ':') {
            if (attr.name === ':bind') {
                node.beforebegin += "<%" + indent + "/***/ _output_.push(" + options.out + "); " + options.out + "=''; " + bindObjectName + ".bind(" + attr.value + ", _scope_, function (_output_, _scope_, holdInner) { var " + options.out + " = ''; %>";
                node.beforeend = "<%" + indent + "/***/ _scope_.innerRender = function(_output_) { var " + options.out + " = '';%>";
                node.afterbegin = "<%" + indent + "/***/ _output_.push(" + options.out + "); }; if (holdInner) { _output_.push(" + options.out + "); " + options.out + " = ''; _scope_.innerRender(_output_); } %>";
                node.afterend = "<%" + indent + "/***/ _output_.push(" + options.out + "); }).outerRender(_output_, true); %>";
            }
            else if (attr.name === ':depend') {
                node.beforebegin = "<%" + indent + "/***/ " + bindObjectName + ".depend(" + attr.value + ", _scope_); %>";
            }
            hasOverwriteAttr = true;
            value = attr.value;
        }
        else if (attr.name[0] === '@') {
            var arr = attr.name.split('.');
            var trigger = arr[1];
            if (trigger) {
                value = "function (event) { if (" + bindObjectName + ".eventChecker(event, " + JSON.stringify(trigger) + ")) { " + attr.value + " }}";
            }
            else {
                value = "function (event) { " + attr.value + " }";
            }
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
    node.beforebegin = node.beforebegin || "";
    varintAttrs += indent + "/***/ ];%>";
    node.beforebegin += varintAttrs;
    node.overwriteAttrs = "<%- " + bindObjectName + "._attrsRender(_scope_, _attrs_) %>";
} /*</function>*/
exports.compiler_art = compiler_art;
