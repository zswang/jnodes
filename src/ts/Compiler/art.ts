import { H5Node } from "../Types"

/*<function name="compiler_art">*/
function compiler_art(node: H5Node, bindObjectName: string) {
  let indent = node.indent || ''
  if (node.type === 'root') {
    node.beforebegin = `<%${indent}/***/ var _rootScope_ = ${bindObjectName}.bind($data, { root: true }, null, function (_output_, _scope_) { var $out = ''; %>`
    node.afterend = `<%${indent}/***/ _output_.push($out); }); var _output_ = []; _rootScope_.innerRender(_output_); $out += _output_.join(''); ${bindObjectName}.bind.$$scope = _rootScope_; %>`
    return
  }

  if (!node.tag) {
    return
  }

  if (node.tag === ':template') {
    node.attrs.some((attr) => {
      if (attr.name === 'name') {
        node.overwriteNode = `<% $out += ${bindObjectName}.templateRender(${JSON.stringify(attr.value)}, _scope_, ${bindObjectName}.bind); %>`
        return true
      }
    })
    return
  }

  if (!node.attrs || !node.attrs.length) {
    return
  }
  let varintAttrs = `<%${indent}/***/ var _attrs_ = [\n`
  let hasOverwriteAttr
  let bindDataValue
  node.attrs.forEach((attr) => {
    let value
    if (attr.name[0] === ':') {
      if (attr.name === ':bind') {
        bindDataValue = attr.value
      }
      hasOverwriteAttr = true
      value = attr.value
    } else if (attr.name[0] === '@') {
      value = `function (event) { with (_scope_.import || {}) { ${attr.value} }}`
    } else {
      value = JSON.stringify(attr.value)
    }
    varintAttrs += `${indent}/***/ { name: ${JSON.stringify(attr.name)}, value: ${value}, quoted: ${JSON.stringify(attr.quoted)}},\n`
  })
  if (!hasOverwriteAttr) {
    return
  }

  node.beforebegin = ``
  if (bindDataValue) {
    node.beforebegin += `<%${indent}/***/ _output_.push($out); $out=''; ${bindObjectName}.bind(${bindDataValue}, _scope_, function (_output_, _scope_, holdInner) { var $out = ''; %>`
    node.beforeend = `<%${indent}/***/ _scope_.innerRender = function(_output_) { var $out = '';%>`
    node.afterbegin = `<%${indent}/***/ _output_.push($out); }; if (holdInner) { _output_.push($out); $out = ''; _scope_.innerRender(_output_); } %>`
    node.afterend = `<%${indent}/***/ _output_.push($out); }).outerRender(_output_, true); %>`
  }

  varintAttrs += `${indent}/***/ ];%>`
  node.beforebegin += varintAttrs
  node.overwriteAttrs = '<%- _scope_.attrsRender(_scope_, _attrs_) %>'
} /*</function>*/

export {
  compiler_art
}