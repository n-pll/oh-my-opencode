---
name: agent-browser
description: 自动化浏览器交互，用于 Web 测试、表单填写、截图和数据提取。当用户需要导航网站、与网页交互、填写表单、截图、测试 Web 应用或从网页提取信息时使用。
---

# 使用 agent-browser 进行浏览器自动化

## 快速开始

```bash
agent-browser open <url>        # 导航到页面
agent-browser snapshot -i       # 获取可交互元素及其引用
agent-browser click @e1         # 通过引用点击元素
agent-browser fill @e2 "text"   # 通过引用填充输入框
agent-browser close             # 关闭浏览器
```

## 核心工作流

1. 导航：`agent-browser open <url>`
2. 快照：`agent-browser snapshot -i`（返回带有 `@e1`、`@e2` 等引用的元素）
3. 使用快照中的引用进行交互
4. 导航或重大 DOM 变更后重新快照

## 命令

### 导航
```bash
agent-browser open <url>      # 导航到 URL（别名：goto、navigate）
agent-browser back            # 后退
agent-browser forward         # 前进
agent-browser reload          # 重新加载页面
agent-browser close           # 关闭浏览器（别名：quit、exit）
```

### 快照（页面分析）
```bash
agent-browser snapshot            # 完整无障碍树
agent-browser snapshot -i         # 仅可交互元素（推荐）
agent-browser snapshot -i -C      # 包含光标可交互元素（带 onclick 的 div 等）
agent-browser snapshot -c         # 紧凑模式（移除空的结构性元素）
agent-browser snapshot -d 3       # 限制深度为 3
agent-browser snapshot -s "#main" # 限定到 CSS 选择器范围
agent-browser snapshot -i -c -d 5 # 组合选项
```

`-C` 标志适用于使用自定义可点击元素（div、span）而非标准按钮/链接的现代 Web 应用。

### 交互（使用快照中的 @引用）
```bash
agent-browser click @e1           # 点击（--new-tab 在新标签页打开）
agent-browser dblclick @e1        # 双击
agent-browser focus @e1           # 聚焦元素
agent-browser fill @e2 "text"     # 清空并输入
agent-browser type @e2 "text"     # 不清空直接输入
agent-browser keyboard type "text"     # 用真实按键输入（无选择器，当前焦点）
agent-browser keyboard inserttext "text"  # 插入文本但不触发按键事件（无选择器）
agent-browser press Enter         # 按键
agent-browser press Control+a     # 组合键
agent-browser keydown Shift       # 按住键
agent-browser keyup Shift         # 释放键
agent-browser hover @e1           # 悬停
agent-browser check @e1           # 勾选复选框
agent-browser uncheck @e1         # 取消勾选复选框
agent-browser select @e1 "value"  # 选择下拉项
agent-browser scroll down 500     # 滚动页面（--selector <sel> 指定容器）
agent-browser scrollintoview @e1  # 将元素滚动到可视区（别名：scrollinto）
agent-browser drag @e1 @e2        # 拖放
agent-browser upload @e1 file.pdf # 上传文件
```

### 获取信息
```bash
agent-browser get text @e1        # 获取元素文本
agent-browser get html @e1        # 获取 innerHTML
agent-browser get value @e1       # 获取输入值
agent-browser get attr @e1 href   # 获取属性
agent-browser get title           # 获取页面标题
agent-browser get url             # 获取当前 URL
agent-browser get count ".item"   # 计数匹配元素
agent-browser get box @e1         # 获取边界框
agent-browser get styles @e1      # 获取计算样式
```

### 检查状态
```bash
agent-browser is visible @e1      # 检查是否可见
agent-browser is enabled @e1      # 检查是否启用
agent-browser is checked @e1      # 检查是否勾选
```

### 截图与 PDF
```bash
agent-browser screenshot          # 截图（无路径则保存到临时目录）
agent-browser screenshot path.png # 保存到文件
agent-browser screenshot --full   # 全页截图
agent-browser screenshot --annotate   # 带编号元素标签的标注截图
agent-browser pdf output.pdf      # 保存为 PDF
```

标注截图在可交互元素上叠加编号标签 `[N]`。每个标签对应引用 `@eN`，因此引用既适用于视觉工作流也适用于文本工作流：
```bash
agent-browser screenshot --annotate ./page.png
# 输出：[1] @e1 button "Submit", [2] @e2 link "Home", [3] @e3 textbox "Email"
agent-browser click @e2     # 点击标记为 [2] 的 "Home" 链接
```

### 视频录制
```bash
agent-browser record start ./demo.webm    # 开始录制（使用当前 URL + 状态）
agent-browser click @e1                   # 执行操作
agent-browser record stop                 # 停止并保存视频
agent-browser record restart ./take2.webm # 停止当前录制 + 开始新录制
```
录制会创建全新的上下文，但保留你当前会话的 cookie/存储。

### 等待
```bash
agent-browser wait @e1                     # 等待元素
agent-browser wait 2000                    # 等待毫秒数
agent-browser wait --text "Success"        # 等待文本出现
agent-browser wait --url "**/dashboard"    # 等待 URL 模式
agent-browser wait --load networkidle      # 等待网络空闲
agent-browser wait --fn "window.ready"     # 等待 JS 条件
```

加载状态：`load`、`domcontentloaded`、`networkidle`

### 鼠标控制
```bash
agent-browser mouse move 100 200      # 移动鼠标
agent-browser mouse down left         # 按下按钮（left/right/middle）
agent-browser mouse up left           # 释放按钮
agent-browser mouse wheel 100         # 滚动滚轮
```

### 语义定位器（引用的替代方案）
```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
agent-browser find placeholder "Search..." fill "query"
agent-browser find alt "Logo" click
agent-browser find title "Close" click
agent-browser find testid "submit-btn" click
agent-browser find first ".item" click
agent-browser find last ".item" click
agent-browser find nth 2 "a" text
```

操作：`click`、`fill`、`type`、`hover`、`focus`、`check`、`uncheck`、`text`
选项：`--name <name>`（按无障碍名称过滤 role）、`--exact`（要求精确文本匹配）

### 浏览器设置
```bash
agent-browser set viewport 1920 1080      # 设置视口大小
agent-browser set device "iPhone 14"      # 模拟设备
agent-browser set geo 37.7749 -122.4194   # 设置地理位置
agent-browser set offline on              # 切换离线模式
agent-browser set headers '{"X-Key":"v"}' # 额外 HTTP 头
agent-browser set credentials user pass   # HTTP 基本认证
agent-browser set media dark              # 模拟配色方案
```

### Cookie 与存储
```bash
agent-browser cookies                     # 获取所有 cookie
agent-browser cookies set name value      # 设置 cookie
agent-browser cookies clear               # 清除 cookie

agent-browser storage local               # 获取所有 localStorage
agent-browser storage local key           # 获取特定键
agent-browser storage local set k v       # 设置值
agent-browser storage local clear         # 清除全部

agent-browser storage session             # sessionStorage 同上
```

### 网络
```bash
agent-browser network route <url>              # 拦截请求
agent-browser network route <url> --abort      # 阻止请求
agent-browser network route <url> --body '{}'  # 模拟响应
agent-browser network unroute [url]            # 移除路由
agent-browser network requests                 # 查看跟踪的请求
agent-browser network requests --filter api    # 过滤请求
```

### 标签页与窗口
```bash
agent-browser tab                 # 列出标签页
agent-browser tab new [url]       # 新标签页
agent-browser tab 2               # 切换到标签页
agent-browser tab close           # 关闭标签页
agent-browser window new          # 新窗口
```

### 框架
```bash
agent-browser frame "#iframe"     # 切换到 iframe
agent-browser frame main          # 回到主框架
```

### 对话框
```bash
agent-browser dialog accept [text]  # 接受对话框（可选 prompt 文本）
agent-browser dialog dismiss        # 关闭对话框
```

### Diff（比较快照、截图、URL）
```bash
agent-browser diff snapshot                              # 比较当前与上次快照
agent-browser diff snapshot --baseline before.txt        # 比较当前与已保存的快照文件
agent-browser diff snapshot --selector "#main" --compact # 限定范围的快照 diff
agent-browser diff screenshot --baseline before.png      # 针对基线的视觉像素 diff
agent-browser diff screenshot --baseline b.png -o d.png  # 将 diff 图片保存到自定义路径
agent-browser diff screenshot --baseline b.png -t 0.2    # 调整颜色阈值（0-1）
agent-browser diff url https://v1.com https://v2.com     # 比较两个 URL（快照 diff）
agent-browser diff url https://v1.com https://v2.com --screenshot  # 同时做视觉 diff
agent-browser diff url https://v1.com https://v2.com --selector "#main"  # 限定到元素
```

### JavaScript
```bash
agent-browser eval "document.title"   # 运行 JavaScript
agent-browser eval -b "base64code"    # 运行 base64 编码的 JS
agent-browser eval --stdin            # 从 stdin 读取 JS
```

### 调试与性能分析
```bash
agent-browser console                 # 查看控制台消息
agent-browser console --clear         # 清除控制台
agent-browser errors                  # 查看页面错误
agent-browser errors --clear          # 清除错误
agent-browser highlight @e1           # 高亮元素
agent-browser trace start             # 开始录制 trace
agent-browser trace stop trace.zip    # 停止并保存 trace
agent-browser profiler start          # 开始 Chrome DevTools 性能分析
agent-browser profiler stop profile.json  # 停止并保存 profile
```

### 状态管理
```bash
agent-browser state save auth.json    # 保存认证状态
agent-browser state load auth.json    # 加载认证状态
agent-browser state list              # 列出已保存的状态文件
agent-browser state show <file>       # 显示状态摘要
agent-browser state rename <old> <new>  # 重命名状态文件
agent-browser state clear [name]      # 清除会话状态
agent-browser state clear --all       # 清除所有已保存状态
agent-browser state clean --older-than <days>  # 删除旧状态
```

### 安装
```bash
agent-browser install                 # 下载 Chromium 浏览器
agent-browser install --with-deps     # 同时安装系统依赖（Linux）
```

## 全局选项

| 选项 | 说明 |
|--------|-------------|
| `--session <name>` | 隔离的浏览器会话（`AGENT_BROWSER_SESSION` 环境变量） |
| `--session-name <name>` | 自动保存/恢复会话状态（`AGENT_BROWSER_SESSION_NAME` 环境变量） |
| `--profile <path>` | 持久化浏览器配置（`AGENT_BROWSER_PROFILE` 环境变量） |
| `--state <path>` | 从 JSON 文件加载存储状态（`AGENT_BROWSER_STATE` 环境变量） |
| `--headers <json>` | 限定到 URL 源的 HTTP 头 |
| `--executable-path <path>` | 自定义浏览器二进制路径（`AGENT_BROWSER_EXECUTABLE_PATH` 环境变量） |
| `--extension <path>` | 加载浏览器扩展（可重复；`AGENT_BROWSER_EXTENSIONS` 环境变量） |
| `--args <args>` | 浏览器启动参数（`AGENT_BROWSER_ARGS` 环境变量） |
| `--user-agent <ua>` | 自定义 User-Agent（`AGENT_BROWSER_USER_AGENT` 环境变量） |
| `--proxy <url>` | 代理服务器（`AGENT_BROWSER_PROXY` 环境变量） |
| `--proxy-bypass <hosts>` | 绕过代理的主机（`AGENT_BROWSER_PROXY_BYPASS` 环境变量） |
| `--ignore-https-errors` | 忽略 HTTPS 证书错误 |
| `--allow-file-access` | 允许 file:// URL 访问本地文件 |
| `-p, --provider <name>` | 云浏览器提供商（`AGENT_BROWSER_PROVIDER` 环境变量） |
| `--device <name>` | iOS 设备名称（`AGENT_BROWSER_IOS_DEVICE` 环境变量） |
| `--json` | 机器可读的 JSON 输出 |
| `--full, -f` | 全页截图 |
| `--annotate` | 带编号标签的标注截图（`AGENT_BROWSER_ANNOTATE` 环境变量） |
| `--headed` | 显示浏览器窗口（`AGENT_BROWSER_HEADED` 环境变量） |
| `--cdp <port\|wss://url>` | 通过 Chrome DevTools Protocol 连接 |
| `--auto-connect` | 自动发现运行中的 Chrome（`AGENT_BROWSER_AUTO_CONNECT` 环境变量） |
| `--color-scheme <scheme>` | 配色方案：dark、light、no-preference（`AGENT_BROWSER_COLOR_SCHEME` 环境变量） |
| `--download-path <path>` | 默认下载目录（`AGENT_BROWSER_DOWNLOAD_PATH` 环境变量） |
| `--native` | [实验性] 使用原生 Rust 守护进程（`AGENT_BROWSER_NATIVE` 环境变量） |
| `--config <path>` | 自定义配置文件（`AGENT_BROWSER_CONFIG` 环境变量） |
| `--debug` | 调试输出 |

### 安全选项
| 选项 | 说明 |
|--------|-------------|
| `--content-boundaries` | 用边界标记包裹页面输出（`AGENT_BROWSER_CONTENT_BOUNDARIES` 环境变量） |
| `--max-output <chars>` | 将页面输出截断为 N 个字符（`AGENT_BROWSER_MAX_OUTPUT` 环境变量） |
| `--allowed-domains <list>` | 逗号分隔的允许域名模式（`AGENT_BROWSER_ALLOWED_DOMAINS` 环境变量） |
| `--action-policy <path>` | 操作策略 JSON 文件路径（`AGENT_BROWSER_ACTION_POLICY` 环境变量） |
| `--confirm-actions <list>` | 需要确认的操作类别（`AGENT_BROWSER_CONFIRM_ACTIONS` 环境变量） |

## 配置文件

创建 `agent-browser.json` 用于持久化默认值（无需重复传标志）：

**位置（优先级从低到高）：**
1. `~/.agent-browser/config.json` — 用户级默认值
2. `./agent-browser.json` — 项目级覆盖
3. `AGENT_BROWSER_*` 环境变量
4. CLI 标志覆盖一切

```json
{
  "headed": true,
  "proxy": "http://localhost:8080",
  "profile": "./browser-data",
  "native": true
}
```

## 示例：表单提交

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# 输出显示：textbox "Email" [ref=e1]、textbox "Password" [ref=e2]、button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # 检查结果
```

## 示例：使用保存的状态进行认证

```bash
# 登录一次
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# 后续会话：加载已保存的状态
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

### 基于 Header 的认证（跳过登录流程）
```bash
# Header 仅限于 api.example.com
agent-browser open api.example.com --headers '{"Authorization": "Bearer <token>"}'
# 导航到另一个域名 - 不发送 header（安全）
agent-browser open other-site.com
# 全局 header（所有域名）
agent-browser set headers '{"X-Custom-Header": "value"}'
```

### 认证保险库
```bash
# 本地存储凭据（加密）。LLM 永远看不到密码。
echo "pass" | agent-browser auth save github --url https://github.com/login --username user --password-stdin
agent-browser auth login github
```

## 会话与持久化配置

### 会话（并行浏览器）
```bash
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com
agent-browser session list
```

### 会话持久化（自动保存/恢复）
```bash
agent-browser --session-name twitter open twitter.com
# 登录一次，状态在重启后自动持久化
# 状态文件存储在 ~/.agent-browser/sessions/
```

### 持久化配置
在浏览器重启后持久化 cookie、localStorage、IndexedDB、service worker、缓存、登录会话。
```bash
agent-browser --profile ~/.myapp-profile open myapp.com
# 或通过环境变量
AGENT_BROWSER_PROFILE=~/.myapp-profile agent-browser open myapp.com
```

## JSON 输出（用于解析）

添加 `--json` 获取机器可读的输出：
```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

## 本地文件

```bash
agent-browser --allow-file-access open file:///path/to/document.pdf
agent-browser --allow-file-access open file:///path/to/page.html
```

## CDP 模式

```bash
agent-browser connect 9222                                          # 本地 CDP 端口
agent-browser --cdp 9222 snapshot                                   # 每条命令直连 CDP
agent-browser --cdp "wss://browser-service.com/cdp?token=..." snapshot  # 通过 WebSocket 远程连接
agent-browser --auto-connect snapshot                               # 自动发现运行中的 Chrome
```

## 云提供商

```bash
# Browserbase
BROWSERBASE_API_KEY="key" BROWSERBASE_PROJECT_ID="id" agent-browser -p browserbase open example.com

# Browser Use
BROWSER_USE_API_KEY="key" agent-browser -p browseruse open example.com

# Kernel
KERNEL_API_KEY="key" agent-browser -p kernel open example.com
```

## iOS 模拟器

```bash
agent-browser device list                                        # 列出可用模拟器
agent-browser -p ios --device "iPhone 16 Pro" open example.com   # 启动 Safari
agent-browser -p ios snapshot -i                                 # 与桌面相同的命令
agent-browser -p ios tap @e1                                     # 点击
agent-browser -p ios swipe up                                    # 移动端特有
agent-browser -p ios close                                       # 关闭会话
```

## 原生模式（实验性）

使用直接 CDP 的纯 Rust 守护进程 — 无需 Node.js/Playwright：
```bash
agent-browser --native open example.com
# 或：export AGENT_BROWSER_NATIVE=1
# 或：在 agent-browser.json 中设置 {"native": true}
```

---
安装：`bun add -g agent-browser && agent-browser install`。运行 `agent-browser --help` 查看所有命令。仓库：https://github.com/vercel-labs/agent-browser
