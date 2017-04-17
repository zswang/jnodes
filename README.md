jnodes
--------

# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url]

Front end template data binding.


## 使用方法

### 绑定数据 bind

```js
var data = { a: 1, b: 2};

var binder = new jnodes.Binder();
binder.bind(data, function (data, output) {
	output.push(ejs.render(data));
});
```

## License

MIT © [zswang](http://weibo.com/zswang)

[npm-url]: https://npmjs.org/package/jnodes
[npm-image]: https://badge.fury.io/js/jnodes.svg
[travis-url]: https://travis-ci.org/zswang/jnodes
[travis-image]: https://travis-ci.org/zswang/jnodes.svg?branch=master
[coverage-url]: https://coveralls.io/github/zswang/jnodes?branch=master
[coverage-image]: https://coveralls.io/repos/zswang/jnodes/badge.svg?branch=master&service=github