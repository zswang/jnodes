(function (exportName) {
  /*<jdists encoding="ejs" data="../package.json">*/
  /**
   * @file <%- name %>
   <% if (typeof repository != 'undefined') { %>
   * @url <%- repository.url %>
   <% } %>
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
  * @license <%- license %>
  */
  /*</jdists>*/

  /*<jdists encoding="fndep,regex" import="./js/Binder.js" depend="Binder"
    pattern="/Observer_\d+\./g" replacement=""/>*/
  /*<jdists encoding="fndep" import="./js/Observer.js" depend="Observer"/>*/
  /*<jdists encoding="fndep" import="./js/Parser.js" depend="Parser"/>*/
  var exports = {
      Binder: Binder,
      observer: observer,
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