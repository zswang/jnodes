/*<jdists encoding="fndep"
    import="./Observer.js" depend="observer" trigger="release">*/
import { observer } from "./Observer" /*</jdists>*/

/**
 * 内部渲染函数类型
 *
 * @param output 输出列表
 * @param scope 绑定作用域
 */
interface InnerRenderFunction {
  (output: string[]): boolean | void
}
interface InnerRenderBindFunction {
  (output: string[], scope: Scope): boolean | void
}

/**
 * 外部部渲染函数类型
 *
 * @param output 输出列表
 * @param scope 绑定作用域
 * @param holdInner 是否渲染内部
 */
interface OuterRenderFunction {
  (output: string[], holdInner: boolean): boolean | void
}
interface OuterRenderBindFunction {
  (output: string[], scope: Scope, holdInner: boolean): boolean | void
}

/**
 * 渲染元素属性的方法
 *
 * @param scope 做有用
 * @param attrs 属性列表
 */
interface AttrsRenderFunction {
  (scope: Scope, attrs: Attr[]): string
}

interface Attr {
  name: string,
  value: any,
  quoted: string,
}

/**
 * 绑定作用域
 */
interface Scope {
  /**
   * ID
   */
  id?: number | string
  /**
   * 被绑定到数据
   */
  model: any
  /**
   * 父作用域
   */
  parent: Scope
  /**
   * 外层的元素
   */
  _element?: Element
  /**
   * 子作用域集合
   */
  children?: Scope[]

  /**
   * 内层渲染函数
   */
  innerRender?: InnerRenderFunction
  /**
   * 外层渲染函数
   */
  outerRender?: OuterRenderFunction
  /**
   * 属性渲染函数
   */
  attrsRender?: AttrsRenderFunction
  /**
   * 属性集合
   */
  attrs?: Attr[]
  /**
   * 方法集合
   */
  methods?: { [key: string]: [Function] }
  /**
   * 外壳内容
   */
  shell?: string
  /**
   * 是否关心生命周期
   */
  lifecycle?: boolean
}

interface FindElementFunction {
  (scope: Scope): Element
}

interface UpdateElementFunction {
  (element: Element, scope: Scope): void
}

interface TemplateRenderFunction {
  (scope: Scope): string
}

interface TemplateCompilerFunction {
  (templateCode: string, bindObjectName: string)
}

interface TemplateRenderBindFunction {
  (templateName: string, scope: Scope): string
}

interface ScopeCreateFunction {
  (scope: Scope)
}
interface ScopeDestroyFunction {
  (scope: Scope)
}


interface BinderOptions {
  findElement?: FindElementFunction
  updateElement?: UpdateElementFunction
  attrsRender?: AttrsRenderFunction
  bindAttributeName?: string
  scopeAttributeName?: string
  bindObjectName?: string
  eventAttributePrefix?: string
  onScopeCreate?: ScopeCreateFunction
  onScopeDestroy?: ScopeDestroyFunction
  imports?: object
}

/*<function name="Binder" depend="observer">*/
let guid: number = 0
/**
 * @example bind():base
  ```js
  jnodes.binder = new jnodes.Binder();
  var data = {x: 1, y: 2};
  var rootScope = {};
  var count = 0;
  jnodes.binder.bind(data, rootScope, function (output) {
    output.push('<div></div>');
    count++;
  });
  console.log(rootScope.children.length);
  // > 1

  var element = {};
  global.document = { querySelector: function(selector) {
    console.log(selector);
    // > [data-jnodes-scope="0"]
    return element;
  } };
  console.log(count);
  // > 0

  data.x = 2;
  console.log(count);
  // > 1

  console.log(JSON.stringify(element));
  // > {"outerHTML":"<div></div>"}

  console.log(JSON.stringify(jnodes.binder.scope('none')));
  // > undefined
  console.log(JSON.stringify(jnodes.binder.templateCompiler('none')));
  // > undefined
  console.log(JSON.stringify(jnodes.binder.templateRender('none')));
  // > undefined
  console.log(JSON.stringify(jnodes.binder._attrsRender(rootScope)));
  // > ""
  var scope = {
    children: [{
      model: {
        $$binds: []
      }
    }]
  };
  jnodes.binder.cleanChildren(scope);
  var scope = {
    children: [{
      model: {}
    }]
  };
  jnodes.binder.cleanChildren(scope);
  ```
 * @example bind():bind jhtmls
  ```html
  <div>
    <script type="text/jhtmls">
    <h1 :class="{book: Math.random() > 0.5}">Books</h1>
    <ul :bind="books" @create="books.loaded = 'done'">
    books.forEach(function (book) {
      <li :bind="book">
        <:template name="book"/>
      </li>
    });
    </ul>
    </script>
  </div>
  <script type="text/jhtmls" id="book">
  <a href="#{id}">#{title}</a>
  </script>
  ```
  ```js
  jnodes.binder = new jnodes.Binder();
  var books = [{id: 1, title: 'book1'}, {id: 2, title: 'book2'}, {id: 3, title: 'book3'}];
  jnodes.binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });
  var bookRender = jnodes.binder.templateCompiler('jhtmls', document.querySelector('#book').innerHTML);
  jnodes.binder.registerTemplate('book', function (scope) {
    return bookRender(scope.model);
  });
  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = null;
  rootScope.element = div;

  console.log(rootScope.element === div);
  // > true

  console.log(div.querySelector('ul li a').innerHTML);
  // > book1

  books[0].title = 'Star Wars';
  console.log(div.querySelector('ul li a').innerHTML);
  // > Star Wars

  books[0].title = 'Jane Eyre';
  console.log(div.querySelector('ul li a').innerHTML);
  // > Jane Eyre

  console.log(jnodes.binder.scope(div) === rootScope);
  // > true

  console.log(jnodes.binder.scope(div.querySelector('ul li a')).model.id === 1);
  // > true

  books.shift();
  console.log(jnodes.binder.scope(div.querySelector('ul li a')).model.id === 2);
  // > true
  ```
 * @example bind():bind jhtmls 2
  ```html
  <div>
    <script type="text/jhtmls">
    <ul :bind="books" :data-length="books.length" @create="books.loaded = 'done'" class="books">
    books.forEach(function (book) {
      <li :bind="book" @click="book.star = !book.star" class="" :class="{star: book.star}">
        <a :href="'/' + book.id" :bind="book.title">#{book.title}</a>
        <span :bind="book.id" :data-star="book.star">#{book.id}</span>
      </li>
    });
    </ul>
    </script>
  </div>
  ```
  ```js
  function lifecycle(type) {
    return function (scope) {
      if (!scope.lifecycle) {
        return;
      }
      var element = jnodes.binder.element(scope);
      if (element) {
        var elements;
        if (element.getAttribute(jnodes.binder.eventAttributePrefix + type)) {
          elements = [element];
        } else {
          elements = [];
        }
        [].push.apply(elements, element.querySelectorAll('[' + jnodes.binder.eventAttributePrefix + type + ']'));
        elements.forEach(function(item) {
          var e = { type: type };
          triggerScopeEvent(e, item);
          item.removeAttribute(jnodes.binder.eventAttributePrefix + type);
        });
      }
    }
  }
  jnodes.binder = new jnodes.Binder({
    onScopeCreate: lifecycle('create'),
    onScopeDestroy: lifecycle('destroy'),
  });

  var books = [{id: 1, title: 'book1', star: false}, {id: 2, title: 'book2', star: false}, {id: 3, title: 'book3', star: false}];
  jnodes.binder.registerCompiler('jhtmls', function (templateCode, bindObjectName) {
    var node = jnodes.Parser.parse(templateCode);
    var code = jnodes.Parser.build(node, bindObjectName, compiler_jhtmls);
    return jhtmls.render(code);
  });

  var div = document.querySelector('div');
  div.innerHTML = jnodes.binder.templateCompiler('jhtmls', div.querySelector('script').innerHTML)({
    books: books
  });
  var rootScope = jnodes.binder.$$scope;
  rootScope.element = div;

  console.log(books.loaded);
  // > done

  console.log(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li a')).model));
  // > "book1"

  console.log(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li span')).model));
  // > 1

  books.shift();
  console.log(JSON.stringify(jnodes.binder.scope(div.querySelector('ul li a')).model));
  // > "book2"

  function findEventTarget(parent, target, selector) {
    var elements = [].slice.call(parent.querySelectorAll(selector));
    while (target && elements.indexOf(target) < 0) {
      target = target.parentNode;
    }
    return target;
  }

  function triggerScopeEvent(event, target) {
    target = target || event.target;
    var cmd = target.getAttribute('data-jnodes-event-' + event.type);
    if (cmd && cmd[0] === '@') {
      var scope = jnodes.binder.scope(target);
      var method = (scope.methods || {})[cmd]
      if (method) {
        method.call(target, event);
      }
    }
  }

  ['click'].forEach(function (eventName) {
    document.addEventListener(eventName, function (e) {
      if (e.target.getAttribute('data-jnodes-event-input')) {
        if (eventName === 'focusin') {
          e.target.addEventListener('input', triggerScopeEvent)
        } else if (eventName === 'focusout') {
          e.target.removeEventListener('input', triggerScopeEvent)
        }
      }

      var target = findEventTarget(document, e.target, '[data-jnodes-event-' + eventName + ']');
      if (!target) {
        return;
      }
      triggerScopeEvent(e, target);
    })
  });

  var li = div.querySelector('ul li');
  li.click();

  var li = div.querySelector('ul li');
  console.log(li.className);
  // > star
  ```
 * @example bind():base
  ```js
  var data = {x: 1, y: 2};
  var binder = new jnodes.Binder();
  var scope = binder.bind(data, null, null);
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  console.log(JSON.stringify(element));
  // > {}

  var scope = binder.bind(data, null, null, function (output) {
    output.push('<div></div>');
  });
  var element = {};
  global.document = { querySelector: function(selector) {
    return element;
  } };
  binder.update(scope);
  console.log(JSON.stringify(element));
  // > {"innerHTML":"<div></div>"}
  ```
   */
class Binder {
  _binds: object
  _bindAttributeName: string
  _scopeAttributeName: string
  _eventAttributePrefix: string
  _bindObjectName: string
  _findElement: FindElementFunction
  _updateElement: UpdateElementFunction
  _attrsRender: AttrsRenderFunction
  _templates: { [key: string]: TemplateRenderFunction }
  _compiler: { [key: string]: TemplateCompilerFunction }
  _onScopeCreate: ScopeCreateFunction
  _onScopeDestroy: ScopeDestroyFunction
  _newScopes: Scope[]
  _imports: object

  get attrsRender() { return this._attrsRender }
  get eventAttributePrefix() { return this._eventAttributePrefix }

  constructor(options?: BinderOptions) {
    options = options || {}
    this._binds = {}
    this._templates = {}

    this._bindObjectName = options.bindObjectName || 'jnodes.binder'
    this._bindAttributeName = options.bindAttributeName || 'bind'
    this._scopeAttributeName = options.scopeAttributeName || `data-jnodes-scope`
    this._eventAttributePrefix = options.eventAttributePrefix || `data-jnodes-event-`
    this._onScopeCreate = options.onScopeCreate
    this._onScopeDestroy = options.onScopeDestroy
    this._imports = options.imports

    this._templates = {}
    this._compiler = {}
    this._newScopes = []

    this._findElement = options.findElement || ((scope: Scope): Element => {
      return document.querySelector(`[${this._scopeAttributeName}="${scope.id}"]`)
    })
    this._updateElement = options.updateElement || ((element: Element, scope: Scope) => {
      if (!element || (!scope.outerRender && !scope.innerRender)) {
        return
      }
      this.cleanChildren(scope)
      let output = []
      if (!scope.innerRender) { // 没有内部渲染函数
        scope.outerRender(output, true)
        element.outerHTML = output.join('')
      } else if (!scope.outerRender) { // 没有外部渲染函数
        scope.innerRender(output)
        element.innerHTML = output.join('')
      } else {
        scope.outerRender(output, false)
        let shell = output.join('')
        output = []
        if (scope.shell === shell) {
          scope.innerRender(output)
          element.innerHTML = output.join('')
        } else {
          scope.shell = shell
          scope.outerRender(output, true)
          element.outerHTML = output.join('')
        }
      }
      if (this._onScopeCreate) {
        this._newScopes.forEach((scope) => {
          this._onScopeCreate(scope)
        })
      }
      this._newScopes = []
    })
    this._attrsRender = options.attrsRender || ((scope: Scope, attrs: Attr[]): string => {
      if (!attrs) {
        return ''
      }
      let dictValues = {}
      let dictQuoteds = {}
      attrs.filter((attr) => {
        if (':' !== attr.name[0] && '@' !== attr.name[0]) {
          return true
        }

        let name = attr.name.slice(1)
        let values = []
        if (name === this._bindAttributeName) {
          name = this._scopeAttributeName
          values.push(scope.id)
        } else if (this._eventAttributePrefix && '@' === attr.name[0]) {
          if (name === 'create' || name === 'destroy') {
            scope.lifecycle = true
          }
          name = this._eventAttributePrefix + name
        }
        dictValues[name] = values
        dictQuoteds[name] = attr.quoted
        if (name === this._scopeAttributeName) {
          return
        }

        if (attr.value === '' || attr.value === null || attr.value === undefined ||
          attr.value === false) {
          return
        }

        switch (typeof attr.value) {
          case 'boolean':
          case 'number':
          case 'string':
            values.push(attr.value)
            break
          case 'object':
            Object.keys(attr.value).forEach((key) => {
              if (attr.value[key]) {
                values.push(key)
              }
            })
            break
          case 'function':
            let methodId = `@${(guid++).toString(36)}`
            scope.methods = scope.methods || {}
            scope.methods[methodId] = attr.value
            values.push(methodId)
            break
        }
      }).forEach((attr) => {
        let values = dictValues[attr.name] = dictValues[attr.name] || []
        if (attr.value === '' || values.indexOf(attr.value) >= 0) {
          return
        }
        values.push(attr.value)
      })

      return Object.keys(dictValues).map((name) => {
        let values = dictValues[name]
        if (values.length <= 0) {
          return name
        }
        let quoted = dictQuoteds[name] || ''
        return `${name}=${quoted}${values.join(' ')}${quoted}`
      }).join(' ')
    })
  }

  registerTemplate(templateName: string, render: TemplateRenderFunction) {
    this._templates[templateName] = render
  }
  templateRender(templateName: string, scope: Scope): string {
    let render = this._templates[templateName]
    if (!render) {
      return
    }
    return render(scope)
  }

  templateCompiler(templateType: string, templateCode: string) {
    let compiler = this._compiler[templateType]
    if (!compiler) {
      return
    }
    return compiler(templateCode, this._bindObjectName)
  }
  registerCompiler(templateType: string, compiler: TemplateCompilerFunction) {
    this._compiler[templateType] = compiler
  }

  cleanChildren(scope: Scope) {
    if (scope.children) {
      scope.children.forEach((item) => {

        let binds = item.model && item.model.$$binds
        if (binds) {
          // remove scope
          let index = binds.indexOf(item)
          if (index >= 0) {
            binds.splice(index, 1)
          }
        }
        if (this._onScopeDestroy) {
          this._onScopeDestroy(item)
        }
        delete this._binds[item.id]

        this.cleanChildren(item)
        scope.children = []
      })
    }
  }

  /**
   * 数据绑定
   *
   * @param model 绑定数据
   * @param parent 父级作用域
   * @param outerRender 外渲染函数
   */
  public bind(model: any, parent: Scope,
    outerBindRender?: OuterRenderBindFunction,
    innerBindRender?: InnerRenderBindFunction,
  ): Scope {

    let scope: Scope = {
      model: model,
      parent: parent,
    }
    this._newScopes.push(scope)

    Object.defineProperty(scope, 'element', {
      enumerable: true,
      configurable: true,
      get: () => {
        return scope._element
      },
      set: (value) => {
        scope._element = value
        if (value) {
          value.setAttribute(this._scopeAttributeName, scope.id)
          if (this._onScopeCreate) {
            this._newScopes.forEach((scope) => {
              this._onScopeCreate(scope)
            })
          }
          this._newScopes = []
        }
      }
    })

    if (outerBindRender) {
      scope.outerRender = (output, holdInner) => {
        return outerBindRender(output, scope, holdInner)
      }
    }
    if (innerBindRender) {
      scope.innerRender = (output) => {
        return innerBindRender(output, scope)
      }
    }

    // 只绑定对象类型
    if (model && typeof model === 'object') {
      scope.id = (guid++).toString(36)
      this._binds[scope.id] = scope

      if (parent) {
        parent.children = parent.children || []
        parent.children.push(scope)
      }

      // 对象已经绑定过
      if (!model.$$binds) {
        model.$$binds = [scope]
        observer(model, () => {
          model.$$binds.forEach((scope) => {
            this.update(scope)
          })
        }, (key) => {
          return key && key.slice(2) !== '$$'
        })
      } else {
        model.$$binds.push(scope)
      }

    } else {
      if (typeof model === 'string') {
        scope.id = (guid++).toString(36)
        this._binds[scope.id] = scope
      } else {
        scope.id = 'value:' + model
      }
    }

    return scope
  }

  /**
   * 通过作用域查找元素
   * @param scope
   */
  public element(scope: Scope): Element {
    return scope._element || this._findElement(scope)
  }

  /**
   * 更新数据对应的元素
   *
   * @param scope 作用域
   */
  public update(scope: Scope) {
    delete scope.methods
    delete scope.attrs

    this._updateElement(this.element(scope), scope)
  }

  public scope(id: Element | string) {
    let scope
    if (typeof id === 'string') {
      if (id.indexOf('value:') >= 0) {
        return {
          model: JSON.parse(id.slice(6))
        }
      }
      scope = this._binds[id]
      if (scope) {
        return scope
      }
    } else {
      let element = id as Element
      while (element && (element as Element).getAttribute) {
        let result = this.scope((element as Element).getAttribute(this._scopeAttributeName))
        if (result) {
          return result
        }
        element = element.parentNode as Element
      }
    }

  }

  /**
   * 触发作用域事件
   *
   * @param event 事件对象
   * @param target 元素
   */
  triggerScopeEvent(event, target) {
    target = target || event.target;
    let cmd = target.getAttribute(this._eventAttributePrefix + event.type);
    if (cmd && cmd[0] === '@') {
      let scope = this.scope(target);
      let method = (scope.methods || {})[cmd]
      if (method) {
        method.call(target, event);
      }
    }
  }

}/*</function>*/

export { Binder }