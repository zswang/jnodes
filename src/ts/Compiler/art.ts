import { H5Node } from "../Types"

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
  console.log(li.className);
  // > star
  ```
 * @example compiler_art:base3
  ```js
  var node = {
    tag: ':template'
  };
  compiler_art(node);
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
  compiler_art(node);
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
  compiler_art(node);
  console.log(JSON.stringify(node));
  // > {"tag":"span","attrs":[{"name":"class","value":"book"}]}
  ```
   */
function compiler_art(node: H5Node, bindObjectName: string) {
  let indent = node.indent || ''
  if (node.type === 'root') {
    node.beforebegin = `<%${indent}/***/ var _rootScope_ = ${bindObjectName}.bind($data, { root: true }, null, function (_output_, _scope_) { var $out = ''; %>`
    node.afterend = `<%${indent}/***/ _output_.push($out); }); var _output_ = []; _rootScope_.innerRender(_output_); $out += _output_.join(''); ${bindObjectName}.$$scope = _rootScope_; %>`
    return
  }

  if (!node.tag) {
    return
  }

  if (!node.attrs || !node.attrs.length) {
    return
  }

  if (node.tag === ':template') {
    node.attrs.some((attr) => {
      if (attr.name === 'name') {
        node.overwriteNode = `<% $out += ${bindObjectName}.templateRender(${JSON.stringify(attr.value)}, _scope_, ${bindObjectName}.bind); %>`
        return true
      }
    })
    return
  }

  let varintAttrs = `<%${indent}/***/ var _attrs_ = [\n`
  let hasOverwriteAttr
  let bindDataValue
  node.attrs.forEach((attr) => {
    let value
    if (attr.name[0] === ':') {
      if (attr.name === ':bind') {
        bindDataValue = attr.value
      }
      hasOverwriteAttr = true
      value = attr.value
    } else if (attr.name[0] === '@') {
      value = `function (event) { ${attr.value} }`
      hasOverwriteAttr = true
    } else {
      value = JSON.stringify(attr.value)
    }
    varintAttrs += `${indent}/***/ { name: ${JSON.stringify(attr.name)}, value: ${value}, quoted: ${JSON.stringify(attr.quoted)}},\n`
  })
  if (!hasOverwriteAttr) {
    return
  }

  node.beforebegin = ``
  if (bindDataValue) {
    node.beforebegin += `<%${indent}/***/ _output_.push($out); $out=''; ${bindObjectName}.bind(${bindDataValue}, _scope_, function (_output_, _scope_, holdInner) { var $out = ''; %>`
    node.beforeend = `<%${indent}/***/ _scope_.innerRender = function(_output_) { var $out = '';%>`
    node.afterbegin = `<%${indent}/***/ _output_.push($out); }; if (holdInner) { _output_.push($out); $out = ''; _scope_.innerRender(_output_); } %>`
    node.afterend = `<%${indent}/***/ _output_.push($out); }).outerRender(_output_, true); %>`
  }

  varintAttrs += `${indent}/***/ ];%>`
  node.beforebegin += varintAttrs
  node.overwriteAttrs = `<%- ${bindObjectName}.attrsRender(_scope_, _attrs_) %>`
} /*</function>*/

export {
  compiler_art
}