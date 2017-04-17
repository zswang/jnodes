/**
 * 触发函数
 *
 * @param model 绑定的数据
 */
interface TriggerFunction {
  (model: any)
}

/**
 * 过滤函数
 *
 * @param key 键值名
 */
interface FilterFunction {
  (key: string): boolean
}

/*<function name="observer">*/
/**
 * 监听数据改版
 *
 * @param model 数据
 * @param trigger 触发函数
 */
const observer = function (model: any, trigger: TriggerFunction, filter?: FilterFunction) {
  if (!trigger) {
    return;
  }

  function define(key: string, value: any) {
    // 过滤处理
    if (filter && !filter(key)) {
      return
    }
    var property = Object.getOwnPropertyDescriptor(model, key);
    if (property && property.configurable === false) {
      return;
    }

    // cater for pre-defined getter/setters
    let getter = property && property.get;
    let setter = property && property.set;

    Object.defineProperty(model, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        return getter ? getter.call(model) : value;
      },
      set: function (newVal: any) {
        var val = getter ? getter.call(model) : value;
        if (newVal === val) {
          return;
        }
        if (setter) {
          setter.call(model, newVal);
        } else {
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
      .forEach(function (method: string) {
        // cache original method
        let original = model[method];

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
  } else {
    Object.keys(model).forEach(function (key: string) {
      define(key, model[key]);
    });
  }
}/*</function>*/

export {
  observer
}
