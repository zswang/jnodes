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

module.exports = jnodes_render_ejs;