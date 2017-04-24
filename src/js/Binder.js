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
        <a :href="'/' + book.id" :bind="book.title">#{book.title}</a>
        <span :bind="book.id" :data-star="book.star">#{book.id}</span>
      </li>
    });
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
          jnodes.binder.triggerScopeEvent(e, item);
          item.removeAttribute(jnodes.binder.eventAttributePrefix + type);
        });
      }
    }
  }
  jnodes.binder = new jnodes.Binder({
    onScopeCreate: lifecycle('create'),
    onScopeDestroy: lifecycle('destroy'),
  });
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
        this._onScopeCreate = options.onScopeCreate;
        this._onScopeDestroy = options.onScopeDestroy;
        this._imports = options.imports;
        this._templates = {};
        this._compiler = {};
        this._newScopes = [];
        this._findElement = options.findElement || (function (scope) {
            return document.querySelector("[" + _this._scopeAttributeName + "=\"" + scope.id + "\"]");
        });
        this._updateElement = options.updateElement || (function (element, scope) {
            if (!element || (!scope.outerRender && !scope.innerRender)) {
                return;
            }
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
            if (_this._onScopeCreate) {
                _this._newScopes.forEach(function (scope) {
                    _this._onScopeCreate(scope);
                });
            }
            _this._newScopes = [];
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
                var values = [];
                if (name === _this._bindAttributeName) {
                    name = _this._scopeAttributeName;
                    values.push(scope.id);
                }
                else if (_this._eventAttributePrefix && '@' === attr.name[0]) {
                    if (name === 'create' || name === 'destroy') {
                        scope.lifecycle = true;
                    }
                    name = _this._eventAttributePrefix + name;
                }
                dictValues[name] = values;
                dictQuoteds[name] = attr.quoted;
                if (name === _this._scopeAttributeName) {
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
                    return name;
                }
                var quoted = dictQuoteds[name] || '';
                return name + "=" + quoted + values.join(' ') + quoted;
            }).join(' ');
        });
    }
    Object.defineProperty(Binder.prototype, "attrsRender", {
        get: function () { return this._attrsRender; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binder.prototype, "eventAttributePrefix", {
        get: function () { return this._eventAttributePrefix; },
        enumerable: true,
        configurable: true
    });
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
                if (_this._onScopeDestroy) {
                    _this._onScopeDestroy(item);
                }
                delete _this._binds[item.id];
                _this.cleanChildren(item);
                scope.children = [];
            });
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
        };
        this._newScopes.push(scope);
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
                    if (_this._onScopeCreate) {
                        _this._newScopes.forEach(function (scope) {
                            _this._onScopeCreate(scope);
                        });
                    }
                    _this._newScopes = [];
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
        // 只绑定对象类型
        if (model && typeof model === 'object') {
            scope.id = (guid++).toString(36);
            this._binds[scope.id] = scope;
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(scope);
            }
            // 对象已经绑定过
            if (!model.$$binds) {
                model.$$binds = [scope];
                Observer_1.observer(model, function () {
                    model.$$binds.forEach(function (scope) {
                        _this.update(scope);
                    });
                }, function (key) {
                    return key && key.slice(2) !== '$$';
                });
            }
            else {
                model.$$binds.push(scope);
            }
        }
        else {
            scope.id = (guid++).toString(36);
            this._binds[scope.id] = scope;
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
        delete scope.methods;
        delete scope.attrs;
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
            var scope = this.scope(target);
            if (!scope) {
                return;
            }
            var method = (scope.methods || {})[cmd];
            if (method) {
                method.call(target, event);
            }
        }
    };
    return Binder;
}()); /*</function>*/
exports.Binder = Binder;
