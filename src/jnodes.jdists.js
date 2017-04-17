(function (exportName) {
/*<jdists encoding="fndep,regex" import="./js/Binder.js" depend="Binder"
    pattern="/Observer_\d+\./g" replacement=""/>*/

/*<jdists encoding="fndep" import="./js/Parser.js" depend="Parser"/>*/
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