# 盟迹 · 上海民盟历史知识库

一个记录 **66 处上海民盟历史点位**（含 16 处民盟上海市委传统教育基地）的交互式历史地图网站，串联相关人物、事件与完整史料故事，用「一处门牌讲一段盟史」的方式呈现。

## 内容组织

全部内容集中在单一数据文件 `app/data.ts`，分层组织后合并为对外的 `sites`：

| 层 | 变量 | 作用 |
|----|------|------|
| 基础条目 | `baseSites`（`make(...)`） | 66 处点位的名称、类别、区、今址/旧址、年份、导览要点、人物 |
| 事实要点 | `rich[id].facts` | 每处点位的关键事实条目 |
| 章节故事 | `supplementalStories` / `deepResearchStories` | 点位的多章节深度叙述（深度研究层优先，≥6 章时独立成篇） |
| 建筑解读 | `architecture` | 建筑形制与空间属性 |
| 配图 | `baseImages` | 点位配图与替代文本 |

合并逻辑见 `app/data.ts` 末尾 `export const sites`；另导出 `timeline / people / routes / categories` 供页面使用。渲染入口为 `app/page.tsx`，页面交互使用 React，未引入第三方 UI 组件库；样式在 `app/globals.css`。

## 本地开发

```bash
npm ci
npm run dev      # 本地开发（vinext dev）
npm run build    # 构建
npm run start    # 本地预览构建产物
npm test         # 构建后运行 tests/rendered-html.test.mjs，校验渲染页面含 66 处点位等关键内容
npm run lint
```

要求 Node ≥ 22.13。

## 部署

推送到 `main` 后自动双通道部署：

- **GitHub Pages**（`.github/workflows/pages.yml`）：跑 `scripts/build-pages.sh` 生成静态快照，站点服务于子路径 `/mengji-shanghai-history/`。脚本会把资源链接相对化，并为 `404.html` 补上子路径前缀（GitHub Pages 从任意嵌套路径回退时需要）。
- **CloudBase 国内固定域名**（`.github/workflows/deploy-cloudbase.yml`）：同样生成快照后，把面向子路径的绝对链接改写回根路径，再部署到 CloudBase 静态托管。

`scripts/build-pages.sh` 是两条部署链路共用的快照生成脚本。

## 技术栈

Next 16（经 vinext 适配）+ Vite + React 19。对外网站通过静态快照部署到 GitHub Pages 与 CloudBase；仓库保留的 `worker/index.ts`、D1 与图片优化分支属于脚手架扩展能力，当前网站为纯静态内容展示，未启用数据库。
