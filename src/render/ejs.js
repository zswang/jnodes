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

module.exports = jnodes_render_ejs;