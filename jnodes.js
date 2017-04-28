(function (exportName) {
/*<function name="observer">*/
/**
 * 监听数据改版
 *
 * @param model 数据
 * @param trigger 触发函数
 * @example observer():trigger is undefined
  ```js
  var data = { a: 1 };
  jnodes.observer(data);
  ```
 * @example observer():trigger
  ```js
  var data = { a: 1 };
  jnodes.observer(data, function () {
    console.log(data.a);
  });
  data.a = 2;
  // > 2
  ```
 * @example observer():filter
  ```js
  var data = { a: 1, b: 1 };
  var count = 0;
  jnodes.observer(data, function () {
    count++;
  }, function (key) {
    return key === 'a';
  });
  data.a = 2;
  console.log(count);
  // > 1
  data.a = 2;
  console.log(count);
  // > 1
  data.b = 2;
  console.log(count);
  // > 1
  ```
 * @example observer():configurable is false
  ```js
  var data = { a: 1 };
  Object.defineProperty(data, 'a', {
    enumerable: true,
    configurable: false,
  });
  var i = 0;
  jnodes.observer(data, function () {
    i = 1;
  });
  data.a = 2;
  console.log(i);
  // > 0
  ```
 * @example observer():getter/setter
  ```js
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
  jnodes.observer(data, function () {});
  data.x = 123;
  console.log(data.x);
  // > 123
  ```
 * @example observer():array
  ```js
  var data = [1, 2, 3];
  var count = 0;
  jnodes.observer(data, function () {
    count++;
  });
  data.push(4);
  console.log(count);
  // > 1
  data.sort();
  console.log(count);
  // > 2
  ```
 */
function observer(model, trigger, filter) {
    if (!trigger) {
        return;
    }
    function define(key, value) {
        // 过滤处理
        if (filter && !filter(key)) {
            return;
        }
        var property = Object.getOwnPropertyDescriptor(model, key);
        if (property && property.configurable === false) {
            return;
        }
        // cater for pre-defined getter/setters
        var getter = property && property.get;
        var setter = property && property.set;
        Object.defineProperty(model, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                return getter ? getter.call(model) : value;
            },
            set: function (newVal) {
                var val = getter ? getter.call(model) : value;
                if (newVal === val) {
                    return;
                }
                if (setter) {
                    setter.call(model, newVal);
                }
                else {
                    value = newVal;
                }
                trigger(model);
            }
        });
    }
    if (Array.isArray(model)) {
        [
            'push',
            'pop',
            'shift',
            'unshift',
            'splice',
            'sort',
            'reverse',
        ]
            .forEach(function (method) {
            // cache original method
            var original = model[method];
            Object.defineProperty(model, method, {
                value: function () {
                    var result = original.apply(this, arguments);
                    trigger(model);
                    return result;
                },
                enumerable: false,
                writable: true,
                configurable: true,
            });
        });
    }
    else {
        Object.keys(model).forEach(function (key) {
            define(key, model[key]);
        });
    }
} /*</function>*/
/*<function name="Binder" depend="observer">*/
var jnodes_guid = 0;
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
        $$binds: function () {
          return [];
        }
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
  jnodes.binder.update();
  var scope = {
    type: 'depend',
    binder: jnodes.binder,
    parent: {
      type: 'bind',
      binder: jnodes.binder,
      model: {}
    }
  };
  var data = { x: 1 };
  jnodes.binder.observer(data, scope);
  data.x = 2;
  var scope = {
    type: 'depend',
    binder: jnodes.binder,
    parent: {
      type: 'depend',
      binder: jnodes.binder,
      model: {
        $$binds: function () {
          return [{
            id: 0,
            type: 'bind',
            binder: jnodes.binder,
            model: {},
          }, {
            id: 0,
            type: 'depend',
            binder: jnodes.binder,
            model: {},
            parent: {
              binder: jnodes.binder,
              model: {},
            }
          }]
        },
      },
    },
  };
  var data = { x: 1 };
  jnodes.binder.observer(data, scope);
  data.x = 2;
  var $$binds = function() {
    return [{
      id: 0,
      type: 'bind',
      binder: jnodes.binder,
      model: {},
    }]
  };
  var parent = {
    id: 0,
    type: 'depend',
    binder: jnodes.binder,
    model: {},
    parent: {
      id: 0,
      type: 'bind',
      binder: jnodes.binder,
      model: {
        $$binds: $$binds
      },
    }
  };
  var scope = {
    type: 'depend',
    binder: jnodes.binder,
    parent: {
      type: 'depend',
      binder: jnodes.binder,
      model: {
        $$binds: function () {
          return [{
            id: 0,
            type: 'bind',
            binder: jnodes.binder,
            model: {},
          }, parent, parent]
        }
      },
    },
  };
  var data = { x: 1 };
  jnodes.binder.observer(data, scope);
  data.x = 2;
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
                        var methodId = "@" + (jnodes_guid++).toString(36);
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
                var binds = item.model && item.model.$$binds && item.model.$$binds();
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
            type: 'bind',
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
        scope.id = (jnodes_guid++).toString(36);
        this._binds[scope.id] = scope;
        this.observer(model, scope);
        return scope;
    };
    Binder.prototype.observer = function (model, scope) {
        var parent = scope.parent;
        if (parent) {
            parent.children = parent.children || [];
            parent.children.push(scope);
        }
        function pushParents(parents, scope) {
            var parent = scope.parent;
            if (parent.model.$$binds) {
                parent.model.$$binds().forEach(function (bind) {
                    if (bind.type !== 'depend') {
                        if (parents.indexOf(bind) < 0) {
                            parents.push(bind);
                        }
                    }
                    else {
                        pushParents(parents, bind);
                    }
                });
            }
        }
        // 只绑定对象类型
        if (model && typeof model === 'object') {
            // 对象已经绑定过
            if (!model.$$binds) {
                var binds_1 = [scope];
                model.$$binds = function () {
                    return binds_1;
                };
                observer(model, function () {
                    var parents = [];
                    model.$$binds().forEach(function (scope) {
                        if (scope.type !== 'depend') {
                            scope.binder.update(scope);
                        }
                        else {
                            pushParents(parents, scope);
                        }
                    });
                    parents.forEach(function (parent) {
                        parent.binder.update(parent);
                    });
                }, function (key) {
                    return key && key.slice(2) !== '$$';
                });
            }
            else {
                model.$$binds().push(scope);
            }
        }
    };
    /**
     * 声明依赖关系
     *
     * @param model 数据
     * @param scope 被依赖的作用域
     */
    Binder.prototype.depend = function (model, parent) {
        var scope = {
            type: 'depend',
            model: model,
            parent: parent,
            binder: this,
        };
        this.observer(model, scope);
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
        if (!scope) {
            return;
        }
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
/*<function name="parser_void_elements">*/
var parser_void_elements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'
]; /*</function>*/
/*<function name="parser_tokenizer" depend="parser_void_elements">*/
function parser_tokenizer(code) {
    var resultNodes = [];
    /**
     * 当前扫描起始位置
     */
    var scanpos = 0;
    function pushToken(type, pos, endpos) {
        if (endpos <= pos) {
            return;
        }
        var node = {
            type: type,
            pos: pos,
            endpos: endpos,
        };
        if (type === 'text' || type === 'comment') {
            node.value = code.slice(pos, endpos);
        }
        scanpos = endpos;
        resultNodes.push(node);
        return node;
    }
    while (scanpos < code.length) {
        var match = code.slice(scanpos).match(/([^\S\n]*)(?:<(!--)|<\/(:?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*>|<(:?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*)/);
        if (!match) {
            break;
        }
        pushToken('text', scanpos, scanpos + match.index); // 记录 text
        var offset = match[0].length;
        var indent = match[1];
        if (match[2]) {
            match = code.slice(scanpos + offset).match(/-->/);
            if (!match) {
                var node_1 = pushToken('comment', scanpos, code.length);
                node_1.indent = indent;
                break;
            }
            offset += match.index + match[0].length;
            var node_2 = pushToken('comment', scanpos, scanpos + offset);
            node_2.indent = indent;
            continue;
        }
        var tag = match[3];
        if (tag) {
            var node_3 = pushToken('right', scanpos, scanpos + offset);
            node_3.tag = tag;
            node_3.indent = indent;
            continue;
        }
        // "<tag"
        tag = match[4];
        var attrs = [];
        // find attrs
        while (true) {
            // find attrName
            match = code.slice(scanpos + offset).match(/^\s*([:@]?[\w_]+[\w_\-.]*[\w_]|[\w_]+)\s*/);
            if (!match) {
                break;
            }
            offset += match[0].length;
            var attrName = match[1];
            var attrValue = '';
            var quoted = '';
            // find attrValue
            match = code.slice(scanpos + offset).match(/^\s*=\s*((')([^']*)'|(")([^"]*)"|([^'"\s\/>]+))\s*/);
            if (match) {
                offset += match[0].length;
                attrValue = match[1];
                quoted = match[2] || match[4] || '';
            }
            switch (quoted) {
                case '"':
                case "'":
                    attrValue = attrValue.slice(1, -1);
                    break;
            }
            attrs.push({
                name: attrName,
                value: attrValue,
                quoted: quoted,
            });
        }
        match = code.slice(scanpos + offset).match(/^\s*(\/?)>/);
        if (!match) {
            break;
        }
        offset += match[0].length;
        var single = match[1] || parser_void_elements.indexOf(tag) >= 0;
        var node = pushToken(single ? 'single' : 'left', scanpos, scanpos + offset);
        node.tag = tag;
        node.attrs = attrs;
        node.indent = indent;
        node.selfClosing = parser_void_elements.indexOf(tag) >= 0;
    }
    pushToken('text', scanpos, code.length); // 记录 text
    return resultNodes;
} /*</function>*/
/*<function name="parser_parse" depend="parser_tokenizer">*/
/**
 * 解析 HTML 代码
 *
 * @param code
 * @return 返回根节点
 * @example parser_parse:base
  ```js
  var node = jnodes.Parser.parse(`<!--test--><div class="box"></div>`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":34,"children":[{"type":"comment","pos":0,"endpos":11,"value":"<!--test-->","indent":""},{"type":"block","pos":11,"endpos":34,"tag":"div","attrs":[{"name":"class","value":"box","quoted":"\""}],"indent":"","selfClosing":false,"children":[]}]}
  ```
 * @example parser_parse:text
  ```js
  var node = jnodes.Parser.parse(`hello`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":5,"children":[{"type":"text","pos":0,"endpos":5,"value":"hello"}]}
  ```
 * @example parser_parse:comment not closed.
  ```js
  var node = jnodes.Parser.parse(`<!--hello`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":9,"children":[{"type":"comment","pos":0,"endpos":9,"value":"<!--hello","indent":""}]}
  ```
 * @example parser_parse:attribute is emtpy
  ```js
  var node = jnodes.Parser.parse(`<div><input type=text readonly></div>`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":37,"children":[{"type":"block","pos":0,"endpos":37,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[{"type":"single","pos":5,"endpos":31,"tag":"input","attrs":[{"name":"type","value":"text","quoted":""},{"name":"readonly","value":"","quoted":""}],"indent":"","selfClosing":true}]}]}
  ```
 * @example parser_parse:tag not closed
  ```js
  var node = jnodes.Parser.parse(`<input type=text readonly`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":25,"children":[{"type":"text","pos":0,"endpos":25,"value":"<input type=text readonly"}]}
  ```
 * @example parser_parse:tag asymmetric
  ```js
  var node = jnodes.Parser.parse(`<div><span></div></span>`);
  console.log(JSON.stringify(node));
  // * throw
  ```
 * @example parser_parse:tag asymmetric
  ```js
  var node = jnodes.Parser.parse(`<section><div></div>\n</span>`);
  console.log(JSON.stringify(node));
  // * throw
  ```
 * @example parser_parse:tag nesting
  ```js
  var node = jnodes.Parser.parse(`<div><div><div></div><div></div></div></div>`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":44,"children":[{"type":"block","pos":0,"endpos":44,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[{"type":"block","pos":5,"endpos":38,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[{"type":"block","pos":10,"endpos":21,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[]},{"type":"block","pos":21,"endpos":32,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[]}]}]}]}
  ```
 */
function parser_parse(code) {
    var root = {
        type: 'root',
        pos: 0,
        endpos: code.length,
        children: []
    };
    var current = root;
    var tokens = parser_tokenizer(code);
    /*<debug>
    console.log(JSON.stringify(tokens, null, '  '))
    //</debug>*/
    var lefts = []; // 左边标签集合，用于寻找配对的右边标签
    tokens.forEach(function (token) {
        switch (token.type) {
            case 'comment':
            case 'single':
            case 'text':
                current.children.push(token);
                current.endpos = token.endpos;
                break;
            case 'left':
                token.children = [];
                lefts.push(token);
                current.children.push(token);
                current = token;
                break;
            case 'right':
                var buffer = void 0;
                var line = void 0;
                var col = void 0;
                var error = void 0;
                if (lefts.length <= 0) {
                    buffer = code.slice(0, token.endpos).split('\n');
                    line = buffer.length;
                    col = buffer[buffer.length - 1].length + 1;
                    /*<debug>*/
                    lightcode(buffer, 5);
                    /*</debug>*/
                    error = 'No start tag. (line:' + token.line + ' col:' + token.col + ')';
                    console.error(error);
                    throw error;
                }
                for (var i = lefts.length - 1; i >= 0; i--) {
                    var curr = lefts[i];
                    var prev = lefts[i - 1];
                    if (curr.tag === token.tag) {
                        curr.type = 'block';
                        curr.endpos = token.endpos;
                        if (prev) {
                            current = prev;
                        }
                        else {
                            current = root;
                        }
                        current.endpos = curr.endpos;
                        lefts = lefts.slice(0, i);
                        break;
                    }
                    else {
                        if (!prev) {
                            buffer = code.slice(0, token.endpos).split('\n');
                            line = buffer.length;
                            col = buffer[buffer.length - 1].length + 1;
                            /*<debug>*/
                            lightcode(buffer, 5);
                            /*</debug>*/
                            error = 'No start tag. (line:' + token.line + ' col:' + token.col + ')';
                            console.error(error);
                            throw error;
                        }
                        curr.type = 'text';
                        delete curr.children; // 移除子节点
                        delete curr.tag;
                        delete curr.attrs;
                    }
                }
                break;
        }
    });
    /*<debug>
    console.log(JSON.stringify(root, null, '  '))
    //</debug>*/
    return root;
}
/*<debug>*/
function lightcode(buffer, count) {
    var len = buffer.length.toString().length;
    var lines = buffer.slice(-count);
    for (var i = lines.length - 1; i >= 0; i--) {
        var l = (buffer.length + i - lines.length + 1).toString();
        l = (new Array(len - l.length + 1)).join(' ') + l; // 前面补空格
        lines[i] = l + (i === lines.length - 1 ? ' > ' : '   ') + '| ' + lines[i];
    }
    console.log(lines.join('\n'));
} /*</debug>*/ /*</function>*/
/*<function name="parser_build">*/
/**
 * @preview
  ```html
  <!-- beforebegin -->
  <p>
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
  </p>
  <!-- afterend -->
  ```
 * @param node
 * @param hook
 * @return 返回构建后的 HTML 字符串
 * @example parser_build:base
  ```js
  var node = jnodes.Parser.parse(`<input type=text readonly>`)
  console.log(jnodes.Parser.build(node));
  // > <input type=text readonly>
  console.log(JSON.stringify(jnodes.Parser.build()));
  // > ""
  ```
 * @example parser_build:hook
  ```js
  var node = jnodes.Parser.parse(`<div>text</div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag) {
      node.beforebegin = `[beforebegin]`;
      node.beforeend = `[beforeend]`;
      node.afterbegin = `[afterbegin]`;
      node.afterend = `[afterend]`;
    }
  }));
  // > [beforebegin]<div>[beforeend]text[afterbegin]</div>[afterend]
  ```
 * @example parser_build:hook overwriteNode
  ```js
  var node = jnodes.Parser.parse(`<div><tnt/></div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'tnt') {
      node.overwriteNode = `<img src="tnt.png">`;
    }
  }));
  // > <div><img src="tnt.png"></div>
  ```
 * @example parser_build:hook overwriteAttrs
  ```js
  var node = jnodes.Parser.parse(`<div><bigimg alt="none"/></div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'bigimg') {
      node.overwriteAttrs = `src="tnt.png" alt="tnt"`;
    }
  }));
  // > <div><bigimg src="tnt.png" alt="tnt"/></div>
  var node = jnodes.Parser.parse(`<div><bigimg alt="none"/></div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'bigimg') {
      node.overwriteAttrs = ``;
    }
  }));
  // > <div><bigimg/></div>
  ```
 * @example parser_build:indent
  ```js
  var node = jnodes.Parser.parse(`<div>\n  <span>hello</span>\n</div>`)
  console.log(JSON.stringify(jnodes.Parser.build(node)));
  // > "<div>\n  <span>hello</span>\n</div>"
  ```
 */
function parser_build(node, options, hook) {
    if (!node) {
        return '';
    }
    var indent = node.indent || '';
    if (hook) {
        hook(node, options);
    }
    if (node.overwriteNode) {
        return node.overwriteNode;
    }
    var result = '';
    if (node.beforebegin) {
        result += node.beforebegin;
    }
    if (node.type === 'text' || node.type === 'comment') {
        result += node.value;
    }
    else if (node.tag) {
        if (!result || result[result.length - 1] === '\n') {
            result += indent;
        }
        result += '<' + node.tag;
        if (typeof node.overwriteAttrs === 'string') {
            if (node.overwriteAttrs) {
                result += ' ' + node.overwriteAttrs;
            }
        }
        else {
            node.attrs.forEach(function (attr) {
                result += ' ' + attr.name;
                if (attr.value) {
                    result += '=' + attr.quoted + attr.value + attr.quoted;
                }
            });
        }
        if (node.type === 'single') {
            if (!node.selfClosing) {
                result += '/';
            }
            result += '>';
        }
        else {
            result += '>';
        }
    }
    if (!node.selfClosing && node.type !== 'single') {
        if (node.beforeend) {
            result += node.beforeend;
        }
        if (node.children) {
            node.children.forEach(function (item) {
                item.parent = node;
                result += parser_build(item, options, hook);
            });
        }
        if (node.afterbegin) {
            result += node.afterbegin;
        }
        if (node.tag) {
            if (result[result.length - 1] === '\n') {
                result += indent;
            }
            result += '</' + node.tag + '>';
        }
    }
    if (node.afterend) {
        result += node.afterend;
    }
    return result;
} /*</function>*/
/*<function name="Parser" depend="parser_parse,parser_build">*/
var Parser = {
    parse: parser_parse,
    build: parser_build,
}; /*</function>*/
  var exports = {
      Binder: Binder,
      observer: observer,
      Parser: Parser,
  };
  /* istanbul ignore next */
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function() {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }
})('jnodes');