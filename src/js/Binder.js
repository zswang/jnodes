"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*<jdists encoding="fndep"
    import="./Observer.js" depend="observer" trigger="release">*/
var Observer_1 = require("./Observer"); /*</jdists>*/
/*<function name="Binder" depend="observer">*/
var guid = 0;
/**
 * @example bind():base
  ```js
  jnodes.binder = new jnodes.Binder();
  var data = {x: 1, y: 2};
  var rootScope = {};
  var count = 0;
  jnodes.binder.bind(data, rootScope, function (output) {
    output.push('<div></div>');
    count++;
  });
  console.log(rootScope.children.length);
  // > 1
  var element = {};
  global.document = { querySelector: function(selector) {
    console.log(selector);
    // > [data-jnodes-scope="0"]
    return element;
  } };
  console.log(count);
  // > 0
  data.x = 2;
  console.log(count);
  // > 1
  console.log(JSON.stringify(element));
  // > {"outerHTML":"<div></div>"}
  console.log(JSON.stringify(jnodes.binder.scope('none')));
  // > undefined
  console.log(JSON.stringify(jnodes.binder.templateCompiler('none')));
  // > undefined
  console.log(JSON.stringify(jnodes.binder.templateRender('none')));
  // > undefined
  console.log(JSON.stringify(jnodes.binder._attrsRender(rootScope)));
  // > ""
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
  ```
 * @example bind():bind jhtmls
  ```html
  <div>
    <script type="text/jhtmls">
    <h1 :class="{book: Math.random() > 0.5}">Books</h1>
    <ul :bind="books" @create="books.loaded = 'done'">
    books.forEach(function (book) {
      <li :bind="book">
        <:template name="book"/>
      </li>
    });
    </ul>
    </script>
  </div>
  <script type="text/jhtmls" id="book">
  <a href="#{id}">#{title}</a>
  </script>
  ```
  ```js
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
 * @example bind():bind jhtmls 2
  ```html
  <div>
    <script type="text/jhtmls">
    <ul :bind="books" :data-length="books.length" @create="books.loaded = 'done'" class="books">
    books.forEach(function (book) {
      <li :bind="book" @click="book.star = !book.star" class="" :class="{star: book.star}">
        <a :href="'/' + book.id" :bind="book.title" @destroy="console.info('destroy')">#{book.title}</a>
        <span :bind="book.id" :data-star="book.star">#{book.id}</span>
      </li>
    });
    </ul>
    </script>
  </div>
  ```
  ```js
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
 * @example bind():update
  ```js
  var data = {x: 1, y: 2};
  var binder = new jnodes.Binder();
  var scope = binder.bind(data, null, null);
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  console.log(JSON.stringify(element));
  // > {}
  var scope = binder.bind(data, null, null, function (output) {
    output.push('<div></div>');
  });
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  console.log(JSON.stringify(element));
  // > {"innerHTML":"<div></div>"}
  ```
 * @example bind():attr is null
  ```html
  <div>
    <script type="text/jhtmls">
    <input type="checkbox" :checked="checked">
    </script>
  </div>
  ```
  ```js
  var binder = new jnodes.Binder();
  var data = { checked: false };
  var div = document.querySelector('div');
  jnodes.binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });
  div.innerHTML = jnodes.binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)(data);
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;
  console.log(div.innerHTML.trim());
  // > <input type="checkbox">
  data.checked = true;
  console.log(div.innerHTML.trim());
  // > <input checked="" type="checkbox">
  ```
   */
var Binder = (function () {
    function Binder(options) {
        var _this = this;
        options = options || {};
        this._binds = {};
        this._templates = {};
        this._bindObjectName = options.bindObjectName || 'jnodes.binder';
        this._bindAttributeName = options.bindAttributeName || 'bind';
        this._scopeAttributeName = options.scopeAttributeName || "data-jnodes-scope";
        this._eventAttributePrefix = options.eventAttributePrefix || "data-jnodes-event-";
        this._imports = options.imports;
        this._templates = {};
        this._compiler = {};
        this._checkers = {};
        this._findElement = options.findElement || (function (scope) {
            return document.querySelector("[" + _this._scopeAttributeName + "=\"" + scope.id + "\"]");
        });
        this._updateElement = options.updateElement || (function (element, scope) {
            if (!element || (!scope.outerRender && !scope.innerRender)) {
                return;
            }
            _this.lifecycleEvent(scope, 'destroy');
            _this.cleanChildren(scope);
            var output = [];
            if (!scope.innerRender) {
                scope.outerRender(output, true);
                element.outerHTML = output.join('');
            }
            else if (!scope.outerRender) {
                scope.innerRender(output);
                element.innerHTML = output.join('');
            }
            else {
                scope.outerRender(output, false);
                var shell = output.join('');
                output = [];
                if (scope.shell === shell) {
                    scope.innerRender(output);
                    element.innerHTML = output.join('');
                }
                else {
                    scope.shell = shell;
                    scope.outerRender(output, true);
                    element.outerHTML = output.join('');
                }
            }
            _this.lifecycleEvent(scope, 'create');
            _this.lifecycleEvent(scope, 'update');
        });
        this._attrsRender = options.attrsRender || (function (scope, attrs) {
            if (!attrs) {
                return '';
            }
            var dictValues = {};
            var dictQuoteds = {};
            attrs.filter(function (attr) {
                if (':' !== attr.name[0] && '@' !== attr.name[0]) {
                    return true;
                }
                var name = attr.name.slice(1);
                if (name === _this._bindAttributeName) {
                    name = _this._scopeAttributeName;
                }
                else if ('@' === attr.name[0]) {
                    var arr = name.split('.');
                    name = arr[0];
                    if (name === 'create') {
                        scope.lifecycleCreate = true;
                    }
                    else if (name === 'destroy') {
                        scope.lifecycleDestroy = true;
                    }
                    else if (name === 'update') {
                        scope.lifecycleUpdate = true;
                    }
                    name = _this._eventAttributePrefix + name;
                }
                var values = dictValues[name] = dictValues[name] || [];
                dictQuoteds[name] = attr.quoted;
                if (name === _this._scopeAttributeName) {
                    values.push(scope.id);
                    return;
                }
                if (attr.value === '' || attr.value === null || attr.value === undefined ||
                    attr.value === false) {
                    return;
                }
                switch (typeof attr.value) {
                    case 'boolean':
                    case 'number':
                    case 'string':
                        values.push(attr.value);
                        break;
                    case 'object':
                        Object.keys(attr.value).forEach(function (key) {
                            if (attr.value[key]) {
                                values.push(key);
                            }
                        });
                        break;
                    case 'function':
                        var methodId = "@" + (guid++).toString(36);
                        scope.methods = scope.methods || {};
                        scope.methods[methodId] = attr.value;
                        values.push(methodId);
                        break;
                }
            }).forEach(function (attr) {
                var values = dictValues[attr.name] = dictValues[attr.name] || [];
                if (attr.value === '' || values.indexOf(attr.value) >= 0) {
                    return;
                }
                values.push(attr.value);
            });
            return Object.keys(dictValues).map(function (name) {
                var values = dictValues[name];
                if (values.length <= 0) {
                    return null;
                }
                var quoted = dictQuoteds[name] || '';
                if (values.length === 1 && values[0] === true) {
                    return "" + name;
                }
                return name + "=" + quoted + values.join(' ') + quoted;
            }).join(' ');
        });
    }
    Binder.prototype.registerTemplate = function (templateName, render) {
        this._templates[templateName] = render;
    };
    Binder.prototype.templateRender = function (templateName, scope) {
        var render = this._templates[templateName];
        if (!render) {
            return;
        }
        return render(scope);
    };
    Binder.prototype.registerChecker = function (eventType, checker) {
        this._checkers[eventType] = checker;
    };
    Binder.prototype.eventChecker = function (event, trigger) {
        var checker = this._checkers[event.type];
        if (!checker) {
            return;
        }
        return checker(event, trigger);
    };
    Binder.prototype.templateCompiler = function (templateType, templateCode) {
        var compiler = this._compiler[templateType];
        if (!compiler) {
            return;
        }
        return compiler(templateCode, this._bindObjectName);
    };
    Binder.prototype.registerCompiler = function (templateType, compiler) {
        this._compiler[templateType] = compiler;
    };
    Binder.prototype.cleanChildren = function (scope) {
        var _this = this;
        if (scope.children) {
            scope.children.forEach(function (item) {
                var binds = item.model && item.model.$$binds;
                if (binds) {
                    // remove scope
                    var index = binds.indexOf(item);
                    if (index >= 0) {
                        binds.splice(index, 1);
                    }
                }
                delete _this._binds[item.id];
                _this.cleanChildren(item);
                scope.children = [];
                delete scope.methods;
                delete scope.attrs;
            });
        }
    };
    /**
     * 触发元素生命周期改变的事件
     *
     * @param scope 作用域
     * @param parent 容器
     * @param type 类型
     */
    Binder.prototype.lifecycleEvent = function (scope, type) {
        var _this = this;
        function hasLifecycle(scope) {
            if (type === 'update') {
                if (scope.lifecycleUpdate) {
                    return true;
                }
                return;
            }
            if ((type === 'create' && scope.lifecycleCreate) || (type === 'destroy' && scope.lifecycleDestroy)) {
                return true;
            }
            if (scope.children) {
                return scope.children.some(hasLifecycle);
            }
        }
        if (hasLifecycle(scope)) {
            var parent_1 = this.element(scope);
            if (type === 'update') {
                this.triggerScopeEvent({ type: type, target: parent_1 });
            }
            else {
                var elements = [].slice.apply(parent_1.querySelectorAll("[" + this._eventAttributePrefix + type + "]"));
                elements.forEach(function (item) {
                    _this.triggerScopeEvent({ type: type, target: item });
                    item.removeAttribute("" + _this._eventAttributePrefix + type);
                });
            }
        }
    };
    /**
     * 数据绑定
     *
     * @param model 绑定数据
     * @param parent 父级作用域
     * @param outerRender 外渲染函数
     */
    Binder.prototype.bind = function (model, parent, outerBindRender, innerBindRender) {
        var _this = this;
        var scope = {
            model: model,
            parent: parent,
            binder: this,
        };
        Object.defineProperty(scope, 'element', {
            enumerable: true,
            configurable: true,
            get: function () {
                return scope._element;
            },
            set: function (value) {
                scope._element = value;
                if (value) {
                    value.setAttribute(_this._scopeAttributeName, scope.id);
                    _this.lifecycleEvent(scope, 'create');
                }
            }
        });
        if (outerBindRender) {
            scope.outerRender = function (output, holdInner) {
                return outerBindRender(output, scope, holdInner);
            };
        }
        if (innerBindRender) {
            scope.innerRender = function (output) {
                return innerBindRender(output, scope);
            };
        }
        scope.id = (guid++).toString(36);
        this._binds[scope.id] = scope;
        if (parent) {
            parent.children = parent.children || [];
            parent.children.push(scope);
        }
        // 只绑定对象类型
        if (model && typeof model === 'object') {
            // 对象已经绑定过
            if (!model.$$binds) {
                model.$$binds = [scope];
                Observer_1.observer(model, function () {
                    model.$$binds.forEach(function (scope) {
                        scope.binder.update(scope);
                    });
                }, function (key) {
                    return key && key.slice(2) !== '$$';
                });
            }
            else {
                model.$$binds.push(scope);
            }
        }
        return scope;
    };
    /**
     * 通过作用域查找元素
     * @param scope
     */
    Binder.prototype.element = function (scope) {
        return scope._element || this._findElement(scope);
    };
    /**
     * 更新数据对应的元素
     *
     * @param scope 作用域
     */
    Binder.prototype.update = function (scope) {
        this._updateElement(this.element(scope), scope);
    };
    Binder.prototype.scope = function (id) {
        var scope;
        if (typeof id === 'string') {
            scope = this._binds[id];
            if (scope) {
                return scope;
            }
        }
        else {
            var element = id;
            while (element && element.getAttribute) {
                var result = this.scope(element.getAttribute(this._scopeAttributeName));
                if (result) {
                    return result;
                }
                element = element.parentNode;
            }
        }
    };
    /**
     * 触发作用域事件
     *
     * @param event 事件对象
     * @param target 元素
     * @example triggerScopeEvent:coverage 1
      ```js
      var binder = new jnodes.Binder();
      var element = {
        getAttribute: function () {
          return null;
        }
      };
      binder.triggerScopeEvent({ target: element });
      ```
     * @example triggerScopeEvent:coverage 2
      ```js
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
      ```
     */
    Binder.prototype.triggerScopeEvent = function (event, target) {
        target = target || event.target;
        if (!target) {
            return;
        }
        var cmd = target.getAttribute(this._eventAttributePrefix + event.type);
        if (cmd && cmd[0] === '@') {
            var scope_1 = this.scope(target);
            if (!scope_1) {
                return;
            }
            // forEach @1 @2 ...
            cmd.replace(/@\w+/g, function (all) {
                var method = (scope_1.methods || {})[all];
                if (method) {
                    method.call(target, event);
                }
                return '';
            });
        }
    };
    return Binder;
}()); /*</function>*/
exports.Binder = Binder;
