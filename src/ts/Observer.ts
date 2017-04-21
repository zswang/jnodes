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
function observer(model: any, trigger: TriggerFunction, filter?: FilterFunction) {
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
      get: () => {
        return getter ? getter.call(model) : value;
      },
      set: (newVal: any) => {
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
      .forEach((method) => {
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
    Object.keys(model).forEach((key: string) => {
      define(key, model[key]);
    });
  }
}/*</function>*/

export {
  observer
}
