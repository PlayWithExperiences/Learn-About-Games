# 公共界面接入PWE基线：本地候选

2026-11-10｜实现与核对：Codex / Brand Owner。依据现行PWE全项目视觉规则与Director `brand-site-remediation`授权；这是当前active项目的一项局部维护，没有重做资料、地图、作品表达或Logo。

原界面公共变量仍使用独立蓝色和系统sans。现在从PWE-Branding `cdc1054` 的 `tokens/pwe.css` 取原始快照（sha256 `fba9cb36b585c758317708759511131d39604a30e82fa231f206489c850590ce`），将现有界面变量映射到其底色、面、文字、极光青、焦点和状态色。正文改用基线文楷栈与1.7行高，加载规范已有的1.7.0公共字体源；导航署名/外观说明下限12px。现有System/Light/Dark存储、页面结构、链接、来源、数据与本人文字保持。

同步修正原DESIGN.md的颜色/字体来源，避免未来又按旧蓝色和系统栈实施；没有另建规范。知识图分类色、职业层级填色与图谱外壳仍按原有语义保留为后续局部单位，已明确临时偏离及原因。本候选不代表整站品牌验收通过。

验证：Astro check 113文件0错误/警告/提示；静态构建160页成功。首页、资源、能力图在320/375/1440与深浅两种主题的18组本地检查无横向溢出/脚本错误，正文对比度最低14.86。最后12px标签调整由既有主题测试覆盖：13通过、1项按设计仅桌面执行而跳过，含主题持久化、反向系统偏好、坏存储、320px与无JS布局。生产静态预览另留375px夜/1440px晨两张终稿图与真实字体读回。未扩大到全站测试或重复13项资产审计。

证据在`ProjectInfo/evidence/2026-1110-pwe-ui/`。最易比较的是`before-home-375-dark.png`与`after-home-375-dark.png`；前者为真实修改前dev截图，后者为本次静态构建预览，dev工具条不属于产品内容。预览在本机`http://127.0.0.1:4387/Learn-About-Games/`，停止服务后需从本分支重新运行Astro preview。

精确线上目标：`https://playwithexperiences.github.io/Learn-About-Games/`。本次仅匿名读取该首页及同源主CSS各一次，均200；主CSS仍含旧蓝色/系统栈，没有PWE变量。本地改动尚未发布，线上品牌状态仍为needs_changes。`.github/workflows/deploy.yml`会在push main或workflow_dispatch时构建并部署GitHub Pages；本工作段没有push、dispatch或部署。发布必须针对这份具体候选另获本人授权，不能当作常规Git备份。

下一步由Director接本地候选核对与集成；Brand Owner继续处理本项目图谱的分类/职业语义色与可读性，不把这项局部成果清空其他品牌差异，不唤醒GameTok，也不访问任何账号后台。
