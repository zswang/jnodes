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
            if (match) {
                offset += match.index + match[0].length;
                var node_1 = pushToken('comment', scanpos, scanpos + offset);
                node_1.indent = indent;
            }
            continue;
        }
        var tag = match[3];
        if (tag) {
            var node_2 = pushToken('right', scanpos, scanpos + offset);
            node_2.tag = tag;
            node_2.indent = indent;
            continue;
        }
        // "<tag"
        tag = match[4];
        var attrs = [];
        // find attrs
        while (true) {
            // find attrName
            match = code.slice(scanpos + offset).match(/^\s*(:?[\w_]+[\w_-]*[\w_]|[\w_]+)\s*/);
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
        var node_3 = pushToken(single ? 'single' : 'left', scanpos, scanpos + offset);
        node_3.tag = tag;
        node_3.attrs = attrs;
        node_3.indent = indent;
        node_3.selfClosing = parser_void_elements.indexOf(tag) >= 0;
    }
    pushToken('text', scanpos, code.length); // 记录 text
    return resultNodes;
} /*</function>*/
/*<function name="parser_parse" depend="parser_tokenizer">*/
function parser_parse(code) {
    var root = {
        type: 'root',
        pos: 0,
        endpos: code.length,
        children: []
    };
    var current = root;
    var tokens = parser_tokenizer(code);
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
                    lightcode(buffer, 5);
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
                            lightcode(buffer, 5);
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
    return root;
}
function lightcode(buffer, count) {
    var len = buffer.length.toString().length;
    var lines = buffer.slice(-count);
    for (var i = lines.length - 1; i >= 0; i--) {
        var l = (buffer.length + i - lines.length + 1).toString();
        l = (new Array(len - l.length + 1)).join(' ') + l; // 前面补空格
        lines[i] = l + (i === lines.length - 1 ? ' > ' : '   ') + '| ' + lines[i];
    }
    console.log(lines.join('\n'));
} /*</function>*/
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
/*<debug trigger="release">*/
var node = parser_parse("\n<div :bind=\"book\" class=\"book\">\n  <img src=\"img/jp.png\" data-lang-src=\"<!--{en}img/en.png-->\">\n  <span><em>#{book.title}</em></span>\n</div>\n");
var text = parser_build(node, '', function (node) {
    node.beforebegin = '[beforebegin]';
    node.beforeend = '[beforeend]';
    node.afterbegin = '[afterbegin]';
    node.afterend = '[afterend]';
    node.overwriteAttrs = '[overwriteAttrs]';
});
console.info(text);
/*</debug>*/ 
