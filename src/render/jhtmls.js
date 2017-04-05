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

module.exports = jnodes_render_jhtmls;