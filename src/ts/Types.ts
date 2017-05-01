/**
 * 属性
 */
export interface H5Attr {
  name: string
  value: string
  quoted: string
}

/**
 * 节点
 */
export interface H5Node {
  /**
   * 节点唯一标识
   */
  id: string,
  /**
   * 节点类型
   *  "left": 起始, "<tag ...>"
   *  “right”: 结尾, "</tag>"
   *  "single": 单个, "<tag .../>"
   *  "text": 文本, "..."
   *  "comment": 注释, "<!--...-->"
   */
  type: string | "left" | "right" | "single" | "text" | "comment" | "root" | "block"
  /**
   * 标签
   */
  tag?: string
  /**
   * 代码中起始位置
   */
  pos: number
  /**
   * 代码中结束位置
   */
  endpos: number
  /**
   * 代码中的内容
   */
  value?: string
  /**
   * 递进空白
   */
  indent?: string
  /**
   * 是否自闭合
   */
  selfClosing?: boolean

  /**
   * 属性集合
   */
  attrs?: H5Attr[]
  /**
   * 行号
   */
  line?: number
  /**
   * 列号
   */
  col?: number
  /**
   * 子节点
   */
  children?: H5Node[]

  /**
   * 插入内容
   *
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
   */
  beforebegin?: string
  afterbegin?: string
  beforeend?: string
  afterend?: string

  overwriteAttrs?: string
  overwriteNode?: string

  parent?: H5Node
}
