(function (exportName) {
  var exports = exports || {};
  /**
   * @file jnodes
   *
   * Front end template data binding.
   * @author
   *   zswang (http://weibo.com/zswang)
   * @version 0.0.1
   * @date 2017-04-05
   */
  /*<function name="jnodes_guid">*/
  var jnodes_guid = 0;
  /*</function>*/
  /*<function name="jnodes_binds">*/
  var jnodes_binds = {};
  /*</function>*/
  /*<function name="jnodes_models">*/
  var jnodes_models = [];
  /*</function>*/
  /*<function name="jnodes_options">*/
  var jnodes_options = {};
  /*</function>*/
  /*<function name="camelCase">*/
  /**
   * 将目标字符串进行驼峰化处理
   *
   * @see https://github.com/BaiduFE/Tangram2/blob/master/src/baidu/string/toCamelCase.js
   * @param {string} text 传入字符串
   * @return {string} 驼峰化处理后的字符串
   '''<example>'''
   * @example camelCase():base
    ```js
    console.log(jsets.camelCase('do-ready'));
    // > doReady
    console.log(jsets.camelCase('on-status-change'));
    // > onStatusChange
    console.log(jsets.camelCase('on-statusChange'));
    // > onStatusChange
    ```
    '''</example>'''
   */
  var camelCache = {}; // 缓存
  function camelCase(text) {
    if (!text || typeof text !== 'string') { // 非字符串直接返回
      return text;
    }
    var result = camelCache[text];
    if (result) {
      return result;
    }
    if (text.indexOf('-') < 0 && text.indexOf('_') < 0) {
      result = text;
    }
    else {
      result = text.replace(/[-_]+([a-z])/ig, function (all, letter) {
        return letter.toUpperCase();
      });
    }
    camelCache[text] = result;
    return result;
  }
  /*</function>*/
  /*<function name="createSetter" depend="camelCase">*/
  /**
   * 创建设置键值的方法
   *
   * @param {Object} target 目标对象
   * @param {Function} setter 设置一个键值函数
   *  setter -> function(name, value)
   * @param {boolean} camel 键值是否需要驼峰化
   '''<example>'''
   * @example createSetter():base
    ```js
    var dict = {};
    var food = {};
    food.set = jsets.createSetter(food, function(name, value) {
      dict[name] = value;
    });
    food.set('a', 1);
    console.log(JSON.stringify(dict));
    // > {"a":1}
    food.set({
      b: 2,
      c: 3
    });
    console.log(JSON.stringify(dict));
    // > {"a":1,"b":2,"c":3}
    ```
    '''</example>'''
   */
  function createSetter(target, setter, camel) {
    return function (name, value) {
      if (typeof name === 'string' || typeof name === 'number') {
        setter(camel ? camelCase(name) : name, value);
      }
      else if (typeof name === 'object') {
        if (name instanceof Array) {
          name.forEach(function (n, i) {
            setter(i, n);
          });
        }
        else {
          for (var key in name) {
            setter(camel ? camelCase(key) : key, name[key]);
          }
        }
      }
      return target;
    };
  }
  /*</function>*/
  /*<function name="createGetter" depend="camelCase">*/
  /**
   * 创建读取键值的方法
   *
   * @param {Object} target 目标对象
   * @param {Function} getter 读取一个键值函数
   *  getter -> function(name, fn)
   '''<example>'''
   * @example createGetter():base
    ```js
    var dict = { a: 1, b: 2, c: 3 };
    var food = {};
    food.get = jsets.createGetter(food, function(name) {
        return dict[name];
    });
    console.log(JSON.stringify(food.get('a')));
    // > 1
    food.get('a', function(a) {
      console.log(JSON.stringify(a));
      // > 1
    });
    food.get(function(c, b, a) {
      console.log(JSON.stringify([a, b, c]));
      // > [1,2,3]
    });
    food.get(['a', 'b'], function(a, b) {
        console.log(JSON.stringify(a));
        // > 1
        console.log(JSON.stringify(b));
        // > 2
    });
    console.log(JSON.stringify(food.get(['a', 'b'])));
    // > {"a":1,"b":2}
    ```
    '''</example>'''
   */
  function createGetter(target, getter, camel) {
    var method = function (name, fn) {
      var result;
      var keys;
      if (typeof name === 'function') {
        keys = name['-jsets-params'];
        if (!keys) { // 优先从缓存中获取
          keys = [];
          String(name).replace(/\(\s*([^()]+?)\s*\)/,
            function (all, names) {
              keys = names.split(/\s*,\s*/);
            }
          );
          name['-jsets-params'] = keys;
        }
        return method(keys, name);
      }
      if (typeof name === 'string' || typeof name === 'number') {
        name = camel ? camelCase(name) : name;
        if (typeof fn === 'function') {
          fn.call(target, getter(name));
          return target;
        }
        return getter(name);
      }
      if (typeof name === 'object') {
        if (name instanceof Array) {
          if (typeof fn === 'function') {
            result = [];
            name.forEach(function (n) {
              result.push(getter(camel ? camelCase(n) : n));
            });
            fn.apply(target, result);
            return target;
          }
          result = {};
          name.forEach(function (n) {
            result[n] = getter(camel ? camelCase(n) : n);
          });
          return result;
        }
        var key;
        if (typeof fn === 'function') {
          result = [];
          for (key in name) {
            result.push(getter(camel ? camelCase(key) : key) || name[key]);
          }
          return target;
        }
        result = {};
        for (key in name) {
          result[key] = getter(camel ? camelCase(key) : key) || name[key];
        }
        return result;
      }
    };
    return method;
  }
  /*</function>*/
  /*<function name="jnodes_set" depend="createSetter,jnodes_options">*/
  var jnodes_set = createSetter(jnodes_options, function (name, value) {
    jnodes_options[name] = value;
  });
  /*</function>*/
  exports.set = jnodes_set;
  /*<function name="jnodes_get" depend="createGetter,jnodes_options">*/
  var jnodes_get = createGetter(jnodes_options, function (name) {
    return jnodes_options[name];
  });
  /*</function>*/
  exports.get = jnodes_get;
  /*<function name="jnodes_bind" depend="jnodes_guid,jnodes_binds,jnodes_observer">*/
  /**
   * 绑定对象
   *
   * @param {Object} model 对象
   * @param {Function} render 渲染函数
   * @param {Boolean=} root 是否根节点，默认: false
   * @return {Object} 返回绑定后的结果
   */
  function jnodes_bind(model, render, root) {
    var $scope = {
      id: jnodes_guid++,
      model: model,
      root: root,
      render: function (_output_) {
        return render(model, _output_, $scope)
      }
    };
    jnodes_binds[$scope.id] = $scope;
    jnodes_observer(model);
    return $scope;
  }
  /*</function>*/
  exports.bind = jnodes_bind;
  /*<function name="jnodes_observer" depend="jnodes_models,jnodes_trigger">*/
  /**
   * 监听对象的改变
   *
   * @param {Object} model 对象
   */
  function jnodes_observer(model) {
    function define(key, value) {
      var property = Object.getOwnPropertyDescriptor(model, key);
      if (property && property.configurable === false) {
        return
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
            setter.call(model, newVal)
          }
          else {
            value = newVal
          }
          jnodes_trigger(model);
        }
      });
    }
    if (jnodes_models.indexOf(model) >= 0) {
      return;
    }
    jnodes_models.push(model);
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
            jnodes_trigger(model);
            return result
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
  }
  /*</function>*/
  /*<function name="jnodes_update" depend="jnodes_binds">*/
  /**
   * 更新 DOM
   *
   * @param {string} id 元素 ID
   */
  function jnodes_update(id) {
    var bind = jnodes_binds[id];
    if (!bind) {
      return;
    }
    var element = document.querySelector('[bind="' + id + '"]');
    if (!element) {
      delete jnodes_binds[id];
      return;
    }
    var output = [];
    // 自己渲染
    if (bind.render(output) === true) {
      return;
    }
    if (jnodes_options['updateElement']) {
      jnodes_options['updateElement'](element, output.join(''));
    }
    else {
      element.outerHTML = output.join('');
    }
  }
  /*</function>*/
  exports.update = jnodes_update;
  /*<function name="jnodes_data" depend="jnodes_binds">*/
  /**
   * 查询元素绑定的数据
   *
   * @param {string|element} element 元素或者是 ID
   */
  function jnodes_data(element) {
    var bind;
    if (typeof element === 'string') {
      bind = jnodes_binds[element];
      if (bind) {
        return bind.model;
      }
    } else {
      while (element) {
        var result = jnodes_data(element.getAttribute('bind'));
        if (result) {
            return result;
        }
        element = element.parentNode;
      }
    }
  }
  /*</function>*/
  exports.data = jnodes_data;
  /*<function name="jnodes_trigger" depend="jnodes_binds,jnodes_update">*/
  /**
   * 触发相应节点更新
   *
   * @param {Object} model 目标
   */
  function jnodes_trigger(model) {
    Object.keys(jnodes_binds).forEach(function (id) {
      var bind = jnodes_binds[id];
      if (bind && bind.model === model) {
        if (bind.root) {
          bind.render();
        } else {
          jnodes_update(id);
        }
      }
    });
  }
  /*</function>*/
  exports.trigger = jnodes_trigger;
  /*<function name="jnodes_render_ejs">*/
function jnodes_render_ejs(code) {
  /*
    <% jnodes.bind(item, function(item, __output, _scope_) { var __append = __output.push.bind(__output); %>
    <li bind="<%= _scope_.id %>" style="<%- /\d/.test(item.title) ? 'color: red;' : '' %>">1---<%= item.title %></li>
    <% }).render(__output); %>
  */
  if (code) {
    [
      /*
      <img bind="item" src="#{item.src}" />
      */
      /^([^\S\n]*)<([\w-]+)((?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\s)bind=("|')([$\w]+)(\4(?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\/>[^\S\n]*)$/mg,
      /*
      <span bind="items" title="length > 2" >#{length}</span>
      */
      /^([^\S\n]*)<([\w-]+)((?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\s)bind=("|')([$\w]+)(\4(?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)>.*<\/\2>[^\S\n]*)$/mg,
      /*
        <ul bind="items">
           ...
        </ul>
         */
      /^([^\S\n]*)<([\w-]+)((?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\s)bind=("|')([$\w]+)(\4(?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)>[^\S\n]*$[^]*?^\1<\/\2>[^\S\n]*)$/mg,
    ].forEach(function(regex) {
      code = String(code).replace(regex, function(all, space, tag, attrs, quot, bindName, end) {
        var result = '\n';
        result += [space, '<% jnodes.bind(', bindName, ', function(', bindName, ', __output, _scope_) { var __append = __output.push.bind(__output); %>', '\n'].join('');
        result += [space, '<', tag, attrs, 'bind', '=', quot, '<%= _scope_.id %>', end, '\n'].join('');
        result += [space, '<% }).render(__output); %>', '\n'].join('');
        return result;
      });
    });
  }
  return code;
}
/*</function>*/
  jnodes_set('ejs', function (template, data) {
    return ejs.render(jnodes_render_ejs(template), data);
  });
  /*<function name="jnodes_render_jhtmls">*/
function jnodes_render_jhtmls(code) {
  /*
      jnodes.bind(item, function(item, _output_, _scope_) {
      <li bind="#{_scope_.id}" style="!#{/\d/.test(item.title) ? 'color: red;' : ''}">1---#{item.title}</li>
      }).render(_output_);
  */
  if (code) {
    [
      /*
      <img bind="item" src="#{item.src}" />
      */
      /^([^\S\n]*)<([\w-]+)((?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\s)bind=("|')([$\w]+)(\4(?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\/>[^\S\n]*)$/mg,
      /*
      <span bind="items" title="length > 2" >#{length}</span>
      */
      /^([^\S\n]*)<([\w-]+)((?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\s)bind=("|')([$\w]+)(\4(?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)>.*<\/\2>[^\S\n]*)$/mg,
      /*
        <ul bind="items">
           ...
        </ul>
         */
      /^([^\S\n]*)<([\w-]+)((?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)\s)bind=("|')([$\w]+)(\4(?:(?:'[^']*'|"[^"]*"|[^'"\/>]+)*)>[^\S\n]*$[^]*?^\1<\/\2>[^\S\n]*)$/mg,
    ].forEach(function(regex) {
      code = String(code).replace(regex, function(all, space, tag, attrs, quot, bindName, end) {
        var result = '\n';
        result += [space, 'jnodes.bind(', bindName, ', function(', bindName, ', _output_, _scope_) {', '\n'].join('');
        result += [space, '<', tag, attrs, 'bind=', quot, '#{_scope_.id}', end, '\n'].join('');
        result += [space, '}).render(_output_);', '\n'].join('');
        return result;
      });
    });
  }
  return code;
}
/*</function>*/
  jnodes_set('jhtmls', function (template, data) {
    return jhtmls.render(jnodes_render_jhtmls(template), data);
  });
  /* istanbul ignore next */
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function () {
        return exports;
      });
    }
  }
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  }
  else {
    window[exportName] = exports;
  }
})('jnodes');