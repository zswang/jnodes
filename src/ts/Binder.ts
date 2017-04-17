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
   * 作用域属性名
   */
  scopeAttributeName: string
  /**
   * 绑定数据属性名
   */
  bindAttributeName: string
  /**
   * 绑定数据对象名
   */
  bindObjectName: string
  /**
   * 模版渲染函数
   */
  templateRender: TemplateRenderBindFunction
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

interface BinderOptions {
  findElement?: FindElementFunction
  updateElement?: UpdateElementFunction
  attrsRender?: AttrsRenderFunction
  bindAttributeName?: string
  scopeAttributeName?: string
  bindObjectName?: string
}

/*<function name="Binder" depend="observer">*/
let guid: number = 0
class Binder {
  _binds: object
  _bindAttributeName: string
  _scopeAttributeName: string
  _bindObjectName: string
  _findElement: FindElementFunction
  _updateElement: UpdateElementFunction
  _attrsRender: AttrsRenderFunction
  _templates: { [key: string]: TemplateRenderFunction }
  _compiler: { [key: string]: TemplateCompilerFunction }

  constructor(options?: BinderOptions) {
    options = options || {}
    this._binds = {}
    this._templates = {}

    this._bindAttributeName = options.bindAttributeName || 'bind'
    this._scopeAttributeName = options.scopeAttributeName || 'data-jnodes-scope'
    this._bindObjectName = options.bindObjectName || 'jnodes'
    this._templates = {}
    this._compiler = {}

    this._findElement = options.findElement || function (scope: Scope): Element {
      return document.querySelector(`[${scope.scopeAttributeName}="${scope.id}"]`)
    }
    this._updateElement = options.updateElement || function (element: Element, scope: Scope) {
      if (!element || (!scope.outerRender && !scope.innerRender)) {
        return
      }
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
      /* TODO : 触发 update 事件 */
    }
    this._attrsRender = options.attrsRender || function (scope: Scope, attrs: Attr[]): string {
      if (!attrs) {
        return ''
      }
      let dictValues = {}
      let dictQuoteds = {}
      attrs.filter((attr) => {
        if (':' !== attr.name[0]) {
          return true
        }
        let name = attr.name.slice(1)
        let values = []
        if (name === scope.bindAttributeName) {
          name = scope.scopeAttributeName
          values.push(scope.id)
        }
        dictValues[name] = values
        dictQuoteds[name] = attr.quoted
        if (name === scope.scopeAttributeName) {
          return
        }

        if (attr.value === '' || attr.value === null || attr.value === undefined ||
          attr.value === false) {
          return
        }

        switch (typeof attr.value) {
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
    }
  }

  templateRender(templateName: string, scope: Scope): string {
    let render = this._templates[templateName]
    let result = render(scope)

    return result
  }

  registrTemplate(templateName: string, render: TemplateRenderFunction) {
    this._templates[templateName] = render
  }

  registrCompiler(templateType: string, compiler: TemplateCompilerFunction) {
    this._compiler[templateType] = compiler
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
      bindAttributeName: this._bindAttributeName,
      scopeAttributeName: this._scopeAttributeName,
      bindObjectName: this._bindObjectName,
      templateRender: this.templateRender,
      attrsRender: this._attrsRender,
    }

    Object.defineProperty(scope, 'element', {
      enumerable: true,
      configurable: true,
      get: function () {
        return scope._element
      },
      set: function (value) {
        scope._element = value
        if (value) {
          value.setAttribute(scope.scopeAttributeName, scope.id)
        }
      }
    })

    let cleanChilder = (scope: Scope) => {
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
          delete this._binds[item.id]

          cleanChilder(item)
        })
      }
    }
    if (outerBindRender) {
      scope.outerRender = (output, holdInner) => {
        cleanChilder(scope)
        return outerBindRender(output, scope, holdInner)
      }
    }
    if (innerBindRender) {
      scope.innerRender = (output) => {
        cleanChilder(scope)
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
   * update
   */
  public update(scope: Scope) {
    delete scope.methods
    delete scope.attrs

    this._updateElement(scope._element || this._findElement(scope), scope)
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

}/*</function>*/

export { Binder }