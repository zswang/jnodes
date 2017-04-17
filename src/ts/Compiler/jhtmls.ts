import { H5Node } from "../Types"

/*<function name="compiler_jhtmls">*/
function compiler_jhtmls(node: H5Node, bindObjectName: string) {
  var indent = node.indent || ''
  var inserFlag = `/***/ `
  if (node.type === 'root') {
    node.beforebegin = `${indent}${inserFlag}var _rootScope_ = ${bindObjectName}.bind(this, { root: true }, null, function (_output_, _scope_) {`
    node.afterend = `\n${indent}${inserFlag}}); _rootScope_.innerRender(_output_); ${bindObjectName}.bind.$$scope = _rootScope_;`
    return
  }

  if (!node.tag) {
    return
  }

  if (node.tag === ':template') {
    node.attrs.some(function (attr) {
      if (attr.name === 'name') {
        node.overwriteNode = `\n${indent}${inserFlag}_output_.push(${bindObjectName}.templateRender(${JSON.stringify(attr.value)}, _scope_, ${bindObjectName}.bind));`
        return true
      }
    })
    return
  }

  if (!node.attrs || !node.attrs.length) {
    return
  }
  var varintAttrs = `${indent}${inserFlag}var _attrs_ = [\n`
  var hasOverwriteAttr
  var bindDataValue
  node.attrs.forEach(function (attr) {
    var value;
    if (attr.name[0] === ':') {
      if (attr.name === ':bind') {
        bindDataValue = attr.value
      }
      hasOverwriteAttr = true
      value = attr.value
    } else {
      value = JSON.stringify(attr.value)
    }
    varintAttrs += `${indent}${inserFlag}{ name: ${JSON.stringify(attr.name)}, value: ${value}, quoted: ${JSON.stringify(attr.quoted)}},\n`
  })
  if (!hasOverwriteAttr) {
    return
  }

  node.beforebegin = ''
  if (bindDataValue) {
    node.beforebegin += `\n${indent}${inserFlag}${bindObjectName}.bind(${bindDataValue}, _scope_, function (_output_, _scope_, holdInner) {\n`
    node.beforeend = `\n${indent}${inserFlag}_scope_.innerRender = function(_output_) {\n`
    node.afterbegin = `\n${indent}${inserFlag}}; if (holdInner) { _scope_.innerRender(_output_); }\n`
    node.afterend = `\n${indent}${inserFlag}}).outerRender(_output_, true);\n`
  }

  varintAttrs += `${indent}${inserFlag}];\n`
  node.beforebegin += varintAttrs
  node.overwriteAttrs = '!#{_scope_.attrsRender(_scope_, _attrs_)}'
} /*</function>*/

export {
  compiler_jhtmls
}