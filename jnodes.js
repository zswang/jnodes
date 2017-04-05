(function(exportName) {
  var exports = {};
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
  var replacementsCache = {};
  var jnodes_options = {
    bindAttributeName: 'bind',
    findElement: function(id) {
      return document.querySelector('[' + jnodes_options.bindAttributeName + '="' + id + '"]');
    },
    updateElement: function(element, html) {
      element.outerHTML = html;
    },
    getReplacements: function() {
      if (replacementsCache.attributeName !== jnodes_options.bindAttributeName) {
        var prefix = '^([^\\S\\n]*)<([\\w-]+)((?:(?:\'[^\']*\'|"[^"]*"|[^\'"\\/>]+)*)\\s)(' + jnodes_options.bindAttributeName +
          ')=("|\')([$\\w]+)(\\5(?:(?:\'[^\']*\'|"[^"]*"|[^\'"\\/>]+)*)';
        replacementsCache.value = [
          /**
           * @preview 单个
            ```html
            <img bind="item" src="<%- item.src %>" />
            ```
           */
          new RegExp(prefix + '\\/>[^\\S\\n]*)$', 'mg'),
          /**
           * @preview 单行
            ```html
            <span bind="items" title="length > 2"><%= length %></span>
            ```
           */
          new RegExp(prefix + '>.*<\\/\\2>[^\\S\\n]*)', 'mg'),
          /**
           * @preview 多行
            ```
            <ul bind="items">
              ...
            </ul>
            ```
           */
          new RegExp(prefix + '>[^\\S\\n]*$[^]*?^\\1<\\/\\2>[^\\S\\n]*)$', 'mg'),
        ];
        replacementsCache.attributeName = jnodes_options.bindAttributeName;
      }
      return replacementsCache.value;
    }
  };
  /*</function>*/
  /*<function name="jnodes_set" depend="jnodes_options">*/
  var jnodes_set = function(name, value) {
    jnodes_options[name] = value;
  };
  /*</function>*/
  exports.set = jnodes_set;
  /*<function name="jnodes_get" depend="jnodes_options">*/
  var jnodes_get = function(name) {
    return jnodes_options[name];
  };
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
   * @example bind():model
    ```js
    var model = { a: 1, b: 2 };
    var render = function () {};
    var scope = jnodes.bind(model, render);
    console.log(scope.model === model);
    // > true
    ```
   * @example bind():render
    ```js
    var model = { a: 1, b: 2 };
    var render = function (_model) {
      console.log(_model === model);
    };
    var scope = jnodes.bind(model, render);
    scope.render();
    // > true
    ```
   * @example bind():root
    ```js
    var model = { a: 1, b: 2 };
    var render = function (_model) { };
    var scope = jnodes.bind(model, render, true);
    console.log(scope.root);
    // > true
    ```
   * @example bind():object trigger
    ```js
    var model = { a: 1, b: 2 };
    var render = function (_model) {
      console.log(_model.a);
    };
    var scope = jnodes.bind(model, render, true);
    model.a = 3;
    // > 3
    var render2 = function (_model) {
      console.log(model.b);
    }
    var scope = jnodes.bind(model, render2, true);
    model.b = 4;
    // > 3
    // > 4
    model.b = 4;
    model.b = 5;
    // > 3
    // > 5
    ```
   * @example bind():array trigger
    ```js
    var model = [1, 2, 3, 4];
    var count = 0;
    var render = function (_model) {
      count++;
    };
    var scope = jnodes.bind(model, render, true);
    model.push(1);
    console.log(count);
    // > 1
    model.pop();
    console.log(count);
    // > 2
    model.shift();
    console.log(count);
    // > 3
    model.shift();
    console.log(count);
    // > 4
    model.unshift(9);
    console.log(count);
    // > 5
    model.splice(0, 1);
    console.log(count);
    // > 6
    model.sort();
    console.log(count);
    // > 7
    model.reverse();
    console.log(count);
    // > 8
    ```
   * @example bind():dom
    ```html
    <ul></ul>
    ```
    ```js
    var model = [1, 2, 3, 4];
    var count = 0;
    var render = function (_model, _output, _scope) {
      _output.push('<ul bind="' + _scope.id + '" class="box">');
      _model.forEach(function (item) {
        _output.push('<li>' + item + '</li>');
      });
      _output.push('</ul>');
    };
    var scope = jnodes.bind(model, render);
    var ul = document.querySelector('ul');
    ul.setAttribute('bind', scope.id);
    model.push(5);
    var ul = document.querySelector('ul');
    console.log(ul.innerHTML);
    // > <li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>
    console.log(ul.className);
    // > box
    ```
   */
  function jnodes_bind(model, render, root) {
    var $scope = {
      id: jnodes_guid++,
      model: model,
      root: root,
      render: function(_output_) {
        return render(model, _output_, $scope);
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
   * @example observer():configurable is false
    ```js
    var data = { a: 1 };
    Object.defineProperty(data, 'a', {
      enumerable: true,
      configurable: false,
    });
    jnodes.observer(data);
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
    jnodes.observer(data);
    data.x = 123;
    console.log(data.x);
    // > 123
    ```
   */
  function jnodes_observer(model) {
    function define(key, value) {
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
        get: function() {
          return getter ? getter.call(model) : value;
        },
        set: function(newVal) {
          var val = getter ? getter.call(model) : value;
          if (newVal === val) {
            return;
          }
          if (setter) {
            setter.call(model, newVal);
          } else {
            value = newVal;
          }
          jnodes_trigger(model);
        }
      });
    }
    // 该数据已经绑定
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
      .forEach(function(method) {
        // cache original method
        var original = model[method];
        Object.defineProperty(model, method, {
          value: function() {
            var result = original.apply(this, arguments);
            jnodes_trigger(model);
            return result;
          },
          enumerable: false,
          writable: true,
          configurable: true,
        });
      });
    } else {
      Object.keys(model).forEach(function(key) {
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
   * @example update():base
    ```html
    <ul></ul>
    ```
    ```js
    var model = [1, 2];
    var count = 0;
    var render = function (_model, _output, _scope) {
      _output.push('<ul></ul>');
      count++;
    };
    var scope = jnodes.bind(model, render);
    var ul = document.querySelector('ul');
    ul.setAttribute('bind', scope.id);
    model.push(3);
    console.log(count);
    // > 1
    model.push(4);
    console.log(count);
    // > 1
    jnodes.update('none');
    ```
   * @example update():base
    ```html
    <ul></ul>
    ```
    ```js
    var model = [1, 2];
    var count = 0;
    var render = function (_model, _output, _scope) {
      count++;
      _output.push('<ul></ul>')
      return true;
    };
    var scope = jnodes.bind(model, render);
    var ul = document.querySelector('ul');
    ul.setAttribute('bind', scope.id);
    model.push(3);
    console.log(count);
    // > 1
    model.push(4);
    console.log(count);
    // > 2
    ```
   */
  function jnodes_update(id) {
    var bind = jnodes_binds[id];
    if (!bind) {
      return;
    }
    var element = jnodes_options.findElement(id);
    if (!element) {
      delete jnodes_binds[id];
      return;
    }
    var output = [];
    // 自己渲染
    if (bind.render(output) === true) {
      return;
    }
    jnodes_options.updateElement(element, output.join(''));
  }
  /*</function>*/
  /*<function name="jnodes_data" depend="jnodes_binds">*/
  /**
   * 查询元素绑定的数据
   *
   * @param {string|element} element 元素或者是 ID
   * @example data():base
    ```html
    <ul>
      <li><button>click</button></li>
    </ul>
    ```
    ```js
    var model = { a: 1, b: 2 };
    var render = function (_model, _output, _scope) {
      _output.push('<li bind="' + _scope.id + '"><button>click</button></li>');
    };
    var scope = jnodes.bind(model, render);
    var li = document.querySelector('li');
    li.setAttribute('bind', scope.id);
    var button = document.querySelector('li button');
    var data = jnodes.data(button);
    console.log(data.a);
    // > 1
    var data2 = jnodes.data('none');
    console.log(data2);
    // > undefined
    ```
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
    Object.keys(jnodes_binds).forEach(function(id) {
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
function jnodes_render_ejs(code, replacements) {
  /**
   * @preview
    ```html
    <% jnodes.bind(item, function(item, __output, _scope_) { var __append = __output.push.bind(__output); %>
    <li bind="<%= _scope_.id %>" style="<%- /\d/.test(item.title) ? 'color: red;' : '' %>">1---<%= item.title %></li>
    <% }).render(__output); %>
    ```
   */
  if (code) {
    replacements.forEach(function(regex) {
      code = String(code).replace(regex, function(all, space, tag, attrs, bindAttr, quot, bindName, end) {
        var result = '\n';
        result += [space, '<% jnodes.bind(', bindName, ', function(', bindName, ', __output, _scope_) { var __append = __output.push.bind(__output); %>', '\n'].join('');
        result += [space, '<', tag, attrs, bindAttr, '=', quot, '<%= _scope_.id %>', end, '\n'].join('');
        result += [space, '<% }).render(__output); %>', '\n'].join('');
        return result;
      });
    });
  }
  return code;
}
/*</function>*/
  /**
   * @example ejs
    ```js
    var render = jnodes.get('ejs');
    var text = render('<div bind="movie"><%= movie.title %> -- <%= movie.time %></div>', { movie: { title: 'Logan', time: '2017'} });
    console.log(text.replace(/"\d+"/g, '"x"').trim());
    // > <div bind="x">Logan -- 2017</div>
    var text = render('<div bind="movie"><%= movie.title %> -- <%= movie.time %></div>', { movie: { title: 'Hacksaw Ridge', time: '2016'} });
    console.log(text.replace(/"\d+"/g, '"x"').trim());
    // > <div bind="x">Hacksaw Ridge -- 2016</div>
    ```
   */
  jnodes_set('ejs', function(template, data) {
    return ejs.render(jnodes_render_ejs(template, jnodes_options.getReplacements()), data);
  });
  /*<function name="jnodes_render_jhtmls">*/
function jnodes_render_jhtmls(code, replacements) {
  /**
   * @preview
    ```js
    jnodes.bind(item, function(item, _output_, _scope_) {
      <li bind="#{_scope_.id}" style="!#{/\d/.test(item.title) ? 'color: red;' : ''}">1---#{item.title}</li>
    }).render(_output_);
    ```
   */
  if (code) {
    replacements.forEach(function(regex) {
      code = String(code).replace(regex, function(all, space, tag, attrs, bindAttr, quot, bindName, end) {
        var result = '\n';
        result += [space, 'jnodes.bind(', bindName, ', function(', bindName, ', _output_, _scope_) {', '\n'].join('');
        result += [space, '<', tag, attrs, bindAttr, '=', quot, '#{_scope_.id}', end, '\n'].join('');
        result += [space, '}).render(_output_);', '\n'].join('');
        return result;
      });
    });
  }
  return code;
}
/*</function>*/
  /**
   * @example jhtmls
    ```js
    var render = jnodes.get('jhtmls');
    var text = render('<div bind="movie">#{movie.title} -- #{movie.time}</div>', { movie: { title: 'Logan', time: '2017'} });
    console.log(text.replace(/"\d+"/g, '"x"').trim());
    // > <div bind="x">Logan -- 2017</div>
    ```
   */
  jnodes_set('jhtmls', function(template, data) {
    return jhtmls.render(jnodes_render_jhtmls(template, jnodes_options.getReplacements()), data);
  });
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