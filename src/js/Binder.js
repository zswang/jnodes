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
  var binder = new jnodes.Binder();
  var data = {x: 1, y: 2};
  var rootScope = {};
  var count = 0;
  binder.bind(data, rootScope, function (output) {
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
  ```
 * @example bind():bind jhtmls
  ```html
  <div>
    <script type="text/jhtmls">
    <ul :bind="books">
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
  var binder = new jnodes.Binder({
    onScopeCreate: function () {},
    onScopeDestroy: function () {},
  });
  jnodes.bind = function () {
    return binder.bind.apply(binder, arguments);
  };
  jnodes.templateRender = function () {
    return binder.templateRender.apply(binder, arguments);
  };
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });
  var bookRender = binder.templateCompiler('jhtmls', document.querySelector('#book').innerHTML);
  binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.bind.$$scope;
  rootScope.element = null;
  rootScope.element = div;
  console.log(rootScope.element === div);
  // > true
  console.log(div.querySelector('ul li a').innerHTML);
  // > book1
  books[0].title = 'Star Wars';
  console.log(div.querySelector('ul li a').innerHTML);
  // > Star Wars
  console.log(binder.scope(div) === rootScope);
  // > true
  console.log(binder.scope(div.querySelector('ul li a')).model.id === 1);
  // > true
  books.shift();
  console.log(binder.scope(div.querySelector('ul li a')).model.id === 2);
  // > true
  ```
 * @example bind():bind jhtmls 2
  ```html
  <div>
    <script type="text/jhtmls">
    <ul :bind="books">
    books.forEach(function (book) {
      <li :bind="book">
        <a :href="'/' + book.id" :bind="book.title">#{book.title}</a>
        <span :bind="book.id">#{book.id}</span>
      </li>
    });
    </ul>
    </script>
  </div>
  ```
  ```js
  var binder = new jnodes.Binder();
  jnodes.bind = function () {
    return binder.bind.apply(binder, arguments);
  };
  jnodes.templateRender = function () {
    return binder.templateRender.apply(binder, arguments);
  };
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });
  var div = document.querySelector('div');
  div.innerHTML = binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  console.info(div.innerHTML);
  var rootScope = jnodes.bind.$$scope;
  rootScope.element = div;
  console.log(JSON.stringify(binder.scope(div.querySelector('ul li a')).model));
  // > "book1"
  console.log(JSON.stringify(binder.scope(div.querySelector('ul li span')).model));
  // > 1
  books.shift();
  console.log(JSON.stringify(binder.scope(div.querySelector('ul li a')).model));
  // > "book2"
  ```
   */
var Binder = (function () {
    function Binder(options) {
        var _this = this;
        options = options || {};
        this._binds = {};
        this._templates = {};
        this._bindObjectName = options.bindObjectName || 'jnodes';
        this._bindAttributeName = options.bindAttributeName || 'bind';
        this._scopeAttributeName = options.scopeAttributeName || "data-" + this._bindObjectName + "-scope";
        this._eventAttributePrefix = options.eventAttributePrefix || "data-" + this._bindObjectName + "-event-";
        this._onScopeCreate = options.onScopeCreate;
        this._onScopeDestroy = options.onScopeDestroy;
        this._templates = {};
        this._compiler = {};
        this._newScopes = [];
        this._findElement = options.findElement || (function (scope) {
            return document.querySelector("[" + scope.scopeAttributeName + "=\"" + scope.id + "\"]");
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
                if (name === scope.bindAttributeName) {
                    name = scope.scopeAttributeName;
                    values.push(scope.id);
                }
                else if (scope.eventAttributePrefix && '@' === attr.name[0]) {
                    if (name === 'create' || name === 'destroy') {
                        scope.lifecycle = true;
                    }
                    name = scope.eventAttributePrefix + name;
                }
                dictValues[name] = values;
                dictQuoteds[name] = attr.quoted;
                if (name === scope.scopeAttributeName) {
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
            bindAttributeName: this._bindAttributeName,
            scopeAttributeName: this._scopeAttributeName,
            bindObjectName: this._bindObjectName,
            templateRender: this.templateRender,
            attrsRender: this._attrsRender,
            eventAttributePrefix: this._eventAttributePrefix,
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
                    value.setAttribute(scope.scopeAttributeName, scope.id);
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
            if (typeof model === 'string') {
                scope.id = (guid++).toString(36);
                this._binds[scope.id] = scope;
            }
            else {
                scope.id = 'value:' + model;
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
     * update
     */
    Binder.prototype.update = function (scope) {
        delete scope.methods;
        delete scope.attrs;
        this._updateElement(this.element(scope), scope);
    };
    Binder.prototype.scope = function (id) {
        var scope;
        if (typeof id === 'string') {
            if (id.indexOf('value:') >= 0) {
                return {
                    model: JSON.parse(id.slice(6))
                };
            }
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
    return Binder;
}()); /*</function>*/
exports.Binder = Binder;
