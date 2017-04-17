(function (exportName) {
/*<function name="observer">*/
/**
 * 监听数据改版
 *
 * @param model 数据
 * @param trigger 触发函数
 */
var observer = function (model, trigger, filter) {
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
}; /*</function>*/
/*<function name="Binder" depend="observer">*/
var guid = 0;
var Binder = (function () {
    function Binder(options) {
        options = options || {};
        this._binds = {};
        this._templates = {};
        this._bindAttributeName = options.bindAttributeName || 'bind';
        this._scopeAttributeName = options.scopeAttributeName || 'data-jnodes-scope';
        this._bindObjectName = options.bindObjectName || 'jnodes';
        this._templates = {};
        this._compiler = {};
        this._findElement = options.findElement || function (scope) {
            return document.querySelector("[" + scope.scopeAttributeName + "=\"" + scope.id + "\"]");
        };
        this._updateElement = options.updateElement || function (element, scope) {
            if (!element || (!scope.outerRender && !scope.innerRender)) {
                return;
            }
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
            /* TODO : 触发 update 事件 */
        };
        this._attrsRender = options.attrsRender || function (scope, attrs) {
            if (!attrs) {
                return '';
            }
            var dictValues = {};
            var dictQuoteds = {};
            attrs.filter(function (attr) {
                if (':' !== attr.name[0]) {
                    return true;
                }
                var name = attr.name.slice(1);
                var values = [];
                if (name === scope.bindAttributeName) {
                    name = scope.scopeAttributeName;
                    values.push(scope.id);
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
        };
    }
    Binder.prototype.templateRender = function (templateName, scope) {
        var render = this._templates[templateName];
        var result = render(scope);
        return result;
    };
    Binder.prototype.registrTemplate = function (templateName, render) {
        this._templates[templateName] = render;
    };
    Binder.prototype.registrCompiler = function (templateType, compiler) {
        this._compiler[templateType] = compiler;
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
                    value.setAttribute(scope.scopeAttributeName, scope.id);
                }
            }
        });
        var cleanChilder = function (scope) {
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
                    cleanChilder(item);
                });
            }
        };
        if (outerBindRender) {
            scope.outerRender = function (output, holdInner) {
                cleanChilder(scope);
                return outerBindRender(output, scope, holdInner);
            };
        }
        if (innerBindRender) {
            scope.innerRender = function (output) {
                cleanChilder(scope);
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
                observer(model, function () {
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
     * update
     */
    Binder.prototype.update = function (scope) {
        delete scope.methods;
        delete scope.attrs;
        this._updateElement(scope._element || this._findElement(scope), scope);
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
            if (match) {
                offset += match.index + match[0].length;
                var node_1 = pushToken('comment', scanpos, scanpos + offset);
                node_1.indent = indent;
            }
            continue;
        }
        var tag = match[3];
        if (tag) {
            var node_2 = pushToken('right', scanpos, scanpos + offset);
            node_2.tag = tag;
            node_2.indent = indent;
            continue;
        }
        // "<tag"
        tag = match[4];
        var attrs = [];
        // find attrs
        while (true) {
            // find attrName
            match = code.slice(scanpos + offset).match(/^\s*(:?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*/);
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
        var node_3 = pushToken(single ? 'single' : 'left', scanpos, scanpos + offset);
        node_3.tag = tag;
        node_3.attrs = attrs;
        node_3.indent = indent;
        node_3.selfClosing = parser_void_elements.indexOf(tag) >= 0;
    }
    pushToken('text', scanpos, code.length); // 记录 text
    return resultNodes;
} /*</function>*/
/*<function name="parser_parse" depend="parser_tokenizer">*/
function parser_parse(code) {
    var root = {
        type: 'root',
        pos: 0,
        endpos: code.length,
        children: []
    };
    var current = root;
    var tokens = parser_tokenizer(code);
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
                    lightcode(buffer, 5);
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
                            lightcode(buffer, 5);
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
    return root;
}
function lightcode(buffer, count) {
    var len = buffer.length.toString().length;
    var lines = buffer.slice(-count);
    for (var i = lines.length - 1; i >= 0; i--) {
        var l = (buffer.length + i - lines.length + 1).toString();
        l = (new Array(len - l.length + 1)).join(' ') + l; // 前面补空格
        lines[i] = l + (i === lines.length - 1 ? ' > ' : '   ') + '| ' + lines[i];
    }
    console.log(lines.join('\n'));
} /*</function>*/
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