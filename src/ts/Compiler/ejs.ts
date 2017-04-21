import { H5Node } from "../Types"

/*<function name="compiler_ejs">*/
function compiler_ejs(node: H5Node, bindObjectName: string) {
  let indent = node.indent || ''
  if (node.type === 'root') {
    node.beforebegin = `<%${indent}/***/ var _rootScope_ = ${bindObjectName}.bind(locals, { root: true }, null, function (__output, _scope_) { var __append = __output.push.bind(__output); %>`
    node.afterend = `<%${indent}/***/ }); _rootScope_.innerRender(__output); ${bindObjectName}.bind.$$scope = _rootScope_;%>`
    return
  }

  if (!node.tag) {
    return
  }

  if (node.tag === ':template') {
    node.attrs.some((attr) => {
      if (attr.name === 'name') {
        node.overwriteNode = `<%${indent}/***/ $out += ${bindObjectName}.templateRender(${JSON.stringify(attr.value)}, _scope_, ${bindObjectName}.bind); %>`
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
    node.beforebegin += `<%${indent}/***/ ${bindObjectName}(${bindDataValue}, _scope_, function (__output, _scope_, holdInner) { var __append = __output.push.bind(__output); %>`
    node.beforeend = `<%${indent}/***/ _scope_.innerRender = function(__output) { var __append = __output.push.bind(__output); %>`
    node.afterbegin = `<%${indent}/***/ }; if (holdInner) { _scope_.innerRender(__output); }%>`
    node.afterend = `<%${indent}/***/ }).outerRender(__output, true); %>`
  }

  varintAttrs += `${indent}/***/ ];%>`
  node.beforebegin += varintAttrs
  node.overwriteAttrs = `<%- _scope_.attrsRender(_scope_, _attrs_) %>`
} /*</function>*/

export {
  compiler_ejs
}