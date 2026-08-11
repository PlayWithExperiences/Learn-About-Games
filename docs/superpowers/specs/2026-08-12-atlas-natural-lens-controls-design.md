# Atlas 自然透镜控件设计

- 日期：2026-08-12
- 状态：已获发起人批准，可直接实施
- 范围：Innovation Atlas 的 Genre Family 目录、证据透镜与全屏地图模式

## 实际问题

当前界面把两种不同实体混在同一排控件里：Genre Family 是宽泛、非排他的导航分组；Evidence Lens 才是会改变网络强调状态的可操作对象。Family 使用横向 `<details>`，展开体却绝对定位为带内部滚动的浮层。结果是导航像标签，展开后却像弹窗，并挤压全屏地图。

跨 Family 的谱系被渲染为跳到主要 Family 的引用链接。例如角色扮演下的 Roguelike 只跳回动作 Family，不能直接激活 Roguelike。这在视觉上像一个可操作项，行为上却不是同一种控件。只有 5 条已核查谱系的情况下，10 个 Family 还使用相同权重，空 Family 看起来像功能失效。

## 核心语义

- Genre Family：非排他的浏览目录，只回答“这个宽泛品类目前有哪些已核查谱系”。
- Evidence Lens：实际筛选/强调控件，只回答“在不隐藏、不移动全局网络的前提下强调哪组节点与关系”。
- 全部网络：清除 Evidence Lens，恢复全局强调。
- 待研究：Family 当前没有达到证据门槛的谱系，不产生空面板或虚假按钮。

## 页面模式

普通 Atlas 页面保留 Family 目录，但改为纵向、行内 disclosure。每行显示 Family 名称、已核查谱系数量和状态。打开后只在文档流内显示简短说明与可直接激活的 Evidence Lens 按钮。跨 Family 谱系同样是按钮，不再跳转到“主要 Family”。同一 Evidence Lens 可以在多个 Family 下出现；所有同 ID 控件共享一个选中状态。

Family 没有谱系时显示“0 条已核查谱系，待研究”，打开后只显示一句边界说明，不生成空列表。

## 全屏地图模式

全屏模式不再显示 Family 目录。顶部只保留一条紧凑的 Evidence Lens 工具栏：全部网络、早期电子游戏、Roguelike、Metroidvania、平台与跳跃、解析器冒险到图形冒险。所有按钮是真实可操作对象，不出现内部滚动区或覆盖地图的浮层。

透镜按钮采用单选语义：选择一个透镜不会退出地图模式，也不会改变缩放、平移、搜索、节点顺序或关系几何。再次激活当前透镜或选择“全部网络”都恢复全局强调。按钮同时用填充、边框和 `aria-pressed` 表达状态。

## 可访问性与无 JavaScript

- Family 使用原生 disclosure，Enter 与 Space 切换。
- Evidence Lens 使用按钮和 `aria-pressed`，不冒充 tab panel。
- 同一 Evidence Lens 的多个按钮同步 `aria-pressed`。
- 无 JavaScript 时 Family 目录完整可读，按钮禁用并说明；完整网络和 Evidence 仍可访问。
- 全屏模式的焦点约束、Esc 退出、背景 inert 与 Evidence 返回语义保持现有合同。

## 验收条件

1. 角色扮演下的 Roguelike 可以直接激活 Roguelike 透镜。
2. 普通页面的 Family 展开体不绝对定位、不覆盖相邻 Family 或地图控件。
3. 全屏模式恰好显示全部网络与所有现有 Evidence Lens，不显示 10 个 Family disclosure。
4. 空 Family 明确显示 0 条已核查谱系，且没有伪可操作内容。
5. 切换透镜前后 scale、scroll、search、48 节点、36 关系与几何保持不变。
6. Light、Dark、1151px、1200px、1440px 和无 JavaScript 都没有页面横向溢出或控件遮挡。

