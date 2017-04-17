"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.observer = observer;
