"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*<function name="parser_void_elements">*/
var parser_void_elements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'
]; /*</function>*/
/*<function name="parser_tokenizer" depend="parser_void_elements">*/
function parser_tokenizer(code) {
    var resultNodes = [];
    /**
     * 当前扫描起始位置
     */
    var scanpos = 0;
    function pushToken(type, pos, endpos) {
        if (endpos <= pos) {
            return;
        }
        var node = {
            type: type,
            pos: pos,
            endpos: endpos,
        };
        if (type === 'text' || type === 'comment') {
            node.value = code.slice(pos, endpos);
        }
        scanpos = endpos;
        resultNodes.push(node);
        return node;
    }
    while (scanpos < code.length) {
        var match = code.slice(scanpos).match(/([^\S\n]*)(?:<(!--)|<\/(:?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*>|<(:?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*)/);
        if (!match) {
            break;
        }
        pushToken('text', scanpos, scanpos + match.index); // 记录 text
        var offset = match[0].length;
        var indent = match[1];
        if (match[2]) {
            match = code.slice(scanpos + offset).match(/-->/);
            if (!match) {
                var node_1 = pushToken('comment', scanpos, code.length);
                node_1.indent = indent;
                break;
            }
            offset += match.index + match[0].length;
            var node_2 = pushToken('comment', scanpos, scanpos + offset);
            node_2.indent = indent;
            continue;
        }
        var tag = match[3];
        if (tag) {
            var node_3 = pushToken('right', scanpos, scanpos + offset);
            node_3.tag = tag;
            node_3.indent = indent;
            continue;
        }
        // "<tag"
        tag = match[4];
        var attrs = [];
        // find attrs
        while (true) {
            // find attrName
            match = code.slice(scanpos + offset).match(/^\s*([:@]?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*/);
            if (!match) {
                break;
            }
            offset += match[0].length;
            var attrName = match[1];
            var attrValue = '';
            var quoted = '';
            // find attrValue
            match = code.slice(scanpos + offset).match(/^\s*=\s*((')([^']*)'|(")([^"]*)"|([^'"\s\/>]+))\s*/);
            if (match) {
                offset += match[0].length;
                attrValue = match[1];
                quoted = match[2] || match[4] || '';
            }
            switch (quoted) {
                case '"':
                case "'":
                    attrValue = attrValue.slice(1, -1);
                    break;
            }
            attrs.push({
                name: attrName,
                value: attrValue,
                quoted: quoted,
            });
        }
        match = code.slice(scanpos + offset).match(/^\s*(\/?)>/);
        if (!match) {
            break;
        }
        offset += match[0].length;
        var single = match[1] || parser_void_elements.indexOf(tag) >= 0;
        var node = pushToken(single ? 'single' : 'left', scanpos, scanpos + offset);
        node.tag = tag;
        node.attrs = attrs;
        node.indent = indent;
        node.selfClosing = parser_void_elements.indexOf(tag) >= 0;
    }
    pushToken('text', scanpos, code.length); // 记录 text
    return resultNodes;
} /*</function>*/
/*<function name="parser_parse" depend="parser_tokenizer">*/
/**
 * 解析 HTML 代码
 *
 * @param code
 * @return 返回根节点
 * @example parser_parse:base
  ```js
  var node = jnodes.Parser.parse(`<!--test--><div class="box"></div>`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":34,"children":[{"type":"comment","pos":0,"endpos":11,"value":"<!--test-->","indent":""},{"type":"block","pos":11,"endpos":34,"tag":"div","attrs":[{"name":"class","value":"box","quoted":"\""}],"indent":"","selfClosing":false,"children":[]}]}
  ```
 * @example parser_parse:text
  ```js
  var node = jnodes.Parser.parse(`hello`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":5,"children":[{"type":"text","pos":0,"endpos":5,"value":"hello"}]}
  ```
 * @example parser_parse:comment not closed.
  ```js
  var node = jnodes.Parser.parse(`<!--hello`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":9,"children":[{"type":"comment","pos":0,"endpos":9,"value":"<!--hello","indent":""}]}
  ```
 * @example parser_parse:attribute is emtpy
  ```js
  var node = jnodes.Parser.parse(`<div><input type=text readonly></div>`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":37,"children":[{"type":"block","pos":0,"endpos":37,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[{"type":"single","pos":5,"endpos":31,"tag":"input","attrs":[{"name":"type","value":"text","quoted":""},{"name":"readonly","value":"","quoted":""}],"indent":"","selfClosing":true}]}]}
  ```
 * @example parser_parse:tag not closed
  ```js
  var node = jnodes.Parser.parse(`<input type=text readonly`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":25,"children":[{"type":"text","pos":0,"endpos":25,"value":"<input type=text readonly"}]}
  ```
 * @example parser_parse:tag asymmetric
  ```js
  var node = jnodes.Parser.parse(`<div><span></div></span>`);
  console.log(JSON.stringify(node));
  // * throw
  ```
 * @example parser_parse:tag asymmetric
  ```js
  var node = jnodes.Parser.parse(`<section><div></div>\n</span>`);
  console.log(JSON.stringify(node));
  // * throw
  ```
 * @example parser_parse:tag nesting
  ```js
  var node = jnodes.Parser.parse(`<div><div><div></div><div></div></div></div>`);
  console.log(JSON.stringify(node));
  // > {"type":"root","pos":0,"endpos":44,"children":[{"type":"block","pos":0,"endpos":44,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[{"type":"block","pos":5,"endpos":38,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[{"type":"block","pos":10,"endpos":21,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[]},{"type":"block","pos":21,"endpos":32,"tag":"div","attrs":[],"indent":"","selfClosing":false,"children":[]}]}]}]}
  ```
 */
function parser_parse(code) {
    var root = {
        type: 'root',
        pos: 0,
        endpos: code.length,
        children: []
    };
    var current = root;
    var tokens = parser_tokenizer(code);
    /*<debug>
    console.log(JSON.stringify(tokens, null, '  '))
    //</debug>*/
    var lefts = []; // 左边标签集合，用于寻找配对的右边标签
    tokens.forEach(function (token) {
        switch (token.type) {
            case 'comment':
            case 'single':
            case 'text':
                current.children.push(token);
                current.endpos = token.endpos;
                break;
            case 'left':
                token.children = [];
                lefts.push(token);
                current.children.push(token);
                current = token;
                break;
            case 'right':
                var buffer = void 0;
                var line = void 0;
                var col = void 0;
                var error = void 0;
                if (lefts.length <= 0) {
                    buffer = code.slice(0, token.endpos).split('\n');
                    line = buffer.length;
                    col = buffer[buffer.length - 1].length + 1;
                    /*<debug>*/
                    lightcode(buffer, 5);
                    /*</debug>*/
                    error = 'No start tag. (line:' + token.line + ' col:' + token.col + ')';
                    console.error(error);
                    throw error;
                }
                for (var i = lefts.length - 1; i >= 0; i--) {
                    var curr = lefts[i];
                    var prev = lefts[i - 1];
                    if (curr.tag === token.tag) {
                        curr.type = 'block';
                        curr.endpos = token.endpos;
                        if (prev) {
                            current = prev;
                        }
                        else {
                            current = root;
                        }
                        current.endpos = curr.endpos;
                        lefts = lefts.slice(0, i);
                        break;
                    }
                    else {
                        if (!prev) {
                            buffer = code.slice(0, token.endpos).split('\n');
                            line = buffer.length;
                            col = buffer[buffer.length - 1].length + 1;
                            /*<debug>*/
                            lightcode(buffer, 5);
                            /*</debug>*/
                            error = 'No start tag. (line:' + token.line + ' col:' + token.col + ')';
                            console.error(error);
                            throw error;
                        }
                        curr.type = 'text';
                        delete curr.children; // 移除子节点
                        delete curr.tag;
                        delete curr.attrs;
                    }
                }
                break;
        }
    });
    /*<debug>
    console.log(JSON.stringify(root, null, '  '))
    //</debug>*/
    return root;
}
/*<debug>*/
function lightcode(buffer, count) {
    var len = buffer.length.toString().length;
    var lines = buffer.slice(-count);
    for (var i = lines.length - 1; i >= 0; i--) {
        var l = (buffer.length + i - lines.length + 1).toString();
        l = (new Array(len - l.length + 1)).join(' ') + l; // 前面补空格
        lines[i] = l + (i === lines.length - 1 ? ' > ' : '   ') + '| ' + lines[i];
    }
    console.log(lines.join('\n'));
} /*</debug>*/ /*</function>*/
/*<function name="parser_build">*/
/**
 * @preview
  ```html
  <!-- beforebegin -->
  <p>
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
  </p>
  <!-- afterend -->
  ```
 * @param node
 * @param hook
 * @return 返回构建后的 HTML 字符串
 * @example parser_build:base
  ```js
  var node = jnodes.Parser.parse(`<input type=text readonly>`)
  console.log(jnodes.Parser.build(node));
  // > <input type=text readonly>
  console.log(JSON.stringify(jnodes.Parser.build()));
  // > ""
  ```
 * @example parser_build:hook
  ```js
  var node = jnodes.Parser.parse(`<div>text</div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag) {
      node.beforebegin = `[beforebegin]`;
      node.beforeend = `[beforeend]`;
      node.afterbegin = `[afterbegin]`;
      node.afterend = `[afterend]`;
    }
  }));
  // > [beforebegin]<div>[beforeend]text[afterbegin]</div>[afterend]
  ```
 * @example parser_build:hook overwriteNode
  ```js
  var node = jnodes.Parser.parse(`<div><tnt/></div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'tnt') {
      node.overwriteNode = `<img src="tnt.png">`;
    }
  }));
  // > <div><img src="tnt.png"></div>
  ```
 * @example parser_build:hook overwriteAttrs
  ```js
  var node = jnodes.Parser.parse(`<div><bigimg alt="none"/></div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'bigimg') {
      node.overwriteAttrs = `src="tnt.png" alt="tnt"`;
    }
  }));
  // > <div><bigimg src="tnt.png" alt="tnt"/></div>
  var node = jnodes.Parser.parse(`<div><bigimg alt="none"/></div>`)
  console.log(jnodes.Parser.build(node, null, function (node, options) {
    if (node.tag === 'bigimg') {
      node.overwriteAttrs = ``;
    }
  }));
  // > <div><bigimg/></div>
  ```
 * @example parser_build:indent
  ```js
  var node = jnodes.Parser.parse(`<div>\n  <span>hello</span>\n</div>`)
  console.log(JSON.stringify(jnodes.Parser.build(node)));
  // > "<div>\n  <span>hello</span>\n</div>"
  ```
 */
function parser_build(node, options, hook) {
    if (!node) {
        return '';
    }
    var indent = node.indent || '';
    if (hook) {
        hook(node, options);
    }
    if (node.overwriteNode) {
        return node.overwriteNode;
    }
    var result = '';
    if (node.beforebegin) {
        result += node.beforebegin;
    }
    if (node.type === 'text' || node.type === 'comment') {
        result += node.value;
    }
    else if (node.tag) {
        if (!result || result[result.length - 1] === '\n') {
            result += indent;
        }
        result += '<' + node.tag;
        if (typeof node.overwriteAttrs === 'string') {
            if (node.overwriteAttrs) {
                result += ' ' + node.overwriteAttrs;
            }
        }
        else {
            node.attrs.forEach(function (attr) {
                result += ' ' + attr.name;
                if (attr.value) {
                    result += '=' + attr.quoted + attr.value + attr.quoted;
                }
            });
        }
        if (node.type === 'single') {
            if (!node.selfClosing) {
                result += '/';
            }
            result += '>';
        }
        else {
            result += '>';
        }
    }
    if (!node.selfClosing && node.type !== 'single') {
        if (node.beforeend) {
            result += node.beforeend;
        }
        if (node.children) {
            node.children.forEach(function (item) {
                item.parent = node;
                result += parser_build(item, options, hook);
            });
        }
        if (node.afterbegin) {
            result += node.afterbegin;
        }
        if (node.tag) {
            if (result[result.length - 1] === '\n') {
                result += indent;
            }
            result += '</' + node.tag + '>';
        }
    }
    if (node.afterend) {
        result += node.afterend;
    }
    return result;
} /*</function>*/
/*<function name="Parser" depend="parser_parse,parser_build">*/
var Parser = {
    parse: parser_parse,
    build: parser_build,
}; /*</function>*/
exports.Parser = Parser;
