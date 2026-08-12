export const DEV_BROWSER_TEMPLATE_ZH = `# Dev Browser 技能

跨脚本执行保持页面状态的浏览器自动化。编写小而聚焦的脚本来逐步完成任务。当你已经验证了工作流的某个部分且有重复工作时，可以编写一个脚本在一次执行中完成重复工作。

## 选择你的方法

- **本地/有源码的站点**：先阅读源代码以直接编写选择器
- **未知页面布局**：使用 \`getAISnapshot()\` 发现元素，使用 \`selectSnapshotRef()\` 与之交互
- **视觉反馈**：截图查看用户看到的内容

## 安装

**重要**：使用此技能前，确保服务器正在运行。参见 [references/installation.md](references/installation.md) 获取平台特定的安装说明（macOS、Linux、Windows）。

有两种模式可用。如果不确定用哪种，请询问用户。

### 独立模式（默认）

为全新的自动化会话启动新的 Chromium 浏览器。

**macOS/Linux:**
\`\`\`bash
./skills/dev-browser/server.sh &
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "skills/dev-browser/server.js"
\`\`\`

如果用户要求，添加 \`--headless\` 标志。**等待 \`Ready\` 消息后再运行脚本。**

### 扩展模式

连接到用户现有的 Chrome 浏览器。在以下情况使用：

- 用户已经登录了站点，想让你在非本地开发的已认证体验后操作
- 用户要求你使用扩展

**重要**：核心流程仍然相同。你在他们的浏览器内创建命名页面。

**启动中继服务器：**

**macOS/Linux:**
\`\`\`bash
cd skills/dev-browser && npm i && npm run start-extension &
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
cd skills/dev-browser; npm i; Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start-extension"
\`\`\`

在控制台中等待 \`Waiting for extension to connect...\` 后跟 \`Extension connected\`。

如果扩展尚未连接，告诉用户启动并激活它。下载链接：https://github.com/SawyerHood/dev-browser/releases

## 编写脚本

> **所有脚本都从 \`skills/dev-browser/\` 目录运行。** \`@/\` 导入别名需要此目录的配置。

使用 heredoc 内联执行脚本：

**macOS/Linux:**
\`\`\`bash
cd skills/dev-browser && npx tsx <<'EOF'
import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("example", { viewport: { width: 1920, height: 1080 } });

await page.goto("https://example.com");
await waitForPageLoad(page);

console.log({ title: await page.title(), url: page.url() });
await client.disconnect();
EOF
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
cd skills/dev-browser
@"
import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("example", { viewport: { width: 1920, height: 1080 } });

await page.goto("https://example.com");
await waitForPageLoad(page);

console.log({ title: await page.title(), url: page.url() });
await client.disconnect();
"@ | npx tsx --input-type=module
\`\`\`

### 关键原则

1. **小脚本**：每个脚本只做一件事（导航、点击、填充、检查）
2. **评估状态**：在结尾记录/返回状态以决定下一步
3. **描述性页面名称**：使用 \`"checkout"\`、\`"login"\`，而非 \`"main"\`
4. **断开以退出**：\`await client.disconnect()\` - 页面在服务器上持久化
5. **evaluate 中用纯 JS**：\`page.evaluate()\` 在浏览器中运行 - 无 TypeScript 语法

## 工作流循环

1. **编写脚本**执行一个操作
2. **运行它**并观察输出
3. **评估** - 成功了吗？当前状态是什么？
4. **决策** - 任务完成还是需要另一个脚本？
5. **重复**直到任务完成

### 浏览器上下文中不要用 TypeScript

传递给 \`page.evaluate()\` 的代码在浏览器中运行，浏览器不理解 TypeScript：

\`\`\`typescript
// 正确：纯 JavaScript
const text = await page.evaluate(() => {
  return document.body.innerText;
});

// 错误：TypeScript 语法会在运行时失败
const text = await page.evaluate(() => {
  const el: HTMLElement = document.body; // 类型注解在浏览器中会出错！
  return el.innerText;
});
\`\`\`

## 抓取数据

对于抓取大型数据集，拦截并重放网络请求而非滚动 DOM。参见 [references/scraping.md](references/scraping.md) 获取完整指南。

## Client API

\`\`\`typescript
const client = await connect();

// 获取或创建命名页面
const page = await client.page("name");
const pageWithSize = await client.page("name", { viewport: { width: 1920, height: 1080 } });

const pages = await client.list(); // 列出所有页面名称
await client.close("name"); // 关闭页面
await client.disconnect(); // 断开连接（页面持久化）

// ARIA Snapshot 方法
const snapshot = await client.getAISnapshot("name"); // 获取无障碍树
const element = await client.selectSnapshotRef("name", "e5"); // 通过引用获取元素
\`\`\`

## 等待

\`\`\`typescript
import { waitForPageLoad } from "@/client.js";

await waitForPageLoad(page); // 导航后
await page.waitForSelector(".results"); // 等待特定元素
await page.waitForURL("**/success"); // 等待特定 URL
\`\`\`

## 截图

\`\`\`typescript
await page.screenshot({ path: "tmp/screenshot.png" });
await page.screenshot({ path: "tmp/full.png", fullPage: true });
\`\`\`

## ARIA Snapshot（元素发现）

使用 \`getAISnapshot()\` 发现页面元素。返回 YAML 格式的无障碍树：

\`\`\`yaml
- banner:
  - link "Hacker News" [ref=e1]
  - navigation:
    - link "new" [ref=e2]
- main:
  - list:
    - listitem:
      - link "Article Title" [ref=e8]
\`\`\`

**与引用交互：**

\`\`\`typescript
const snapshot = await client.getAISnapshot("hackernews");
console.log(snapshot); // 找到你需要的引用

const element = await client.selectSnapshotRef("hackernews", "e2");
await element.click();
\`\`\`

## 错误恢复

页面状态在失败后持久化。用以下方式调试：

\`\`\`bash
cd skills/dev-browser && npx tsx <<'EOF'
import { connect } from "@/client.js";

const client = await connect();
const page = await client.page("hackernews");

await page.screenshot({ path: "tmp/debug.png" });
console.log({
  url: page.url(),
  title: await page.title(),
  bodyText: await page.textContent("body").then((t) => t?.slice(0, 200)),
});

await client.disconnect();
EOF
\`\`\``
