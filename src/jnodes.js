(function (exportName) {
  /*<remove>*/
  'use strict';
  /*</remove>*/

  var exports = exports || {};

  /*<jdists encoding="ejs" data="../package.json">*/
  /**
   * @file <%- name %>
   *
   * <%- description %>
   * @author
       <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
   *   <%- item.name %> (<%- item.url %>)
       <% }); %>
   * @version <%- version %>
       <% var now = new Date() %>
   * @date <%- [
        now.getFullYear(),
        now.getMonth() + 101,
        now.getDate() + 100
      ].join('-').replace(/-1/g, '-') %>
   */
  /*</jdists>*/

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

  /*<jdists encoding="fndep" import="../node_modules/jsets/jsets.js" depend="createSetter,createGetter">*/
  var createSetter = require('jsets').createSetter;
  var createGetter = require('jsets').createGetter;
  /*</jdists>*/

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

  /*<jdists encoding="fndep" import="./render/ejs.js" depend="jnodes_render_ejs">*/
  var jnodes_render_ejs = require('./render/ejs');
  /*</jdists>*/
  jnodes_set('ejs', function (template, data) {
    return ejs.render(jnodes_render_ejs(template), data);
  });

  /*<jdists encoding="fndep" import="./render/jhtmls.js" depend="jnodes_render_jhtmls">*/
  var jnodes_render_jhtmls = require('./render/jhtmls');
  /*</jdists>*/
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