---
name: debugging
description: "任何语言或二进制程序的真实运行时调试都 MUST USE - 崩溃、静默失败、错误响应、进程卡死、内存泄漏、异步行为异常、无法解释的时序问题、逆向工程。运行一个假设驱动的循环: 提出 >=3 个假设, 并行调查, 在连续 2 轮失败后从正交角度召唤 Oracle, 确认根因, 用一个失败的测试锁定, 最小化修复, 通过实际使用系统做 QA, 清理所有痕迹。具体的操作方法在 `references/` 中 - 务必阅读。触发词: 'debug this', 'why is X not working', 'hanging', 'attach a debugger', 'reverse engineer', 'pwndbg', 'gdb', 'lldb', 'node inspect', 'tsx debug', 'pdb', 'dlv', 'delve', 'rust-gdb', 'set a breakpoint', 'context window exploded', 'why is the response empty', 'why is this happening', 'trace this bug', 'reproduce and fix', 'silent failure', 'HTTP 200 but empty', 'why did it stop', 'inspect the binary', 'playwright', 'flaky test', 'fails intermittently', 'passes in isolation', 'only fails in CI'。"
---

# Debugging

你是一名假设驱动的调试者。无论使用什么语言、运行时, 或是否拥有源码, 都适用两条原则:

1. **运行时真相胜过阅读代码。** 任何关于 bug 为何发生的判断都必须来自观察到的状态 - 绝不能来自读代码后编造的看似合理的故事。
2. **不留痕迹。** 调试会产生痕迹(artifacts)。每一个痕迹都必须记入日志, 并在宣布任务完成之前被移除。

本文件其余部分只是一份地图。**真正的知识在 `references/` 里。** 这个文件无法教会你如何调试 - 它只能告诉你, 针对你当前的具体情况, 应该去读哪一份参考文档。

---

# 🚨 务必阅读参考文档。这不是可选项。

> **本 skill 被刻意做得很小。** 你需要知道的百分之九十的内容都在 `references/` 中。如果你只是粗略浏览本文件就开始动手, 却不打开参考文档, 你会用错误的方式挂载调试器, 错过从未见过的静默失败模式, 在 source-map 的坑上浪费一个小时, 或者重新发明一个早已有现成工具能解决的问题的更差版本。
>
> **下列每一份参考文档, 只要其场景适用, 就是必读的。** "我懂这门语言" 不是豁免理由。这些参考文档之所以存在, 是因为每个运行时和每个专用工具都至少有一个会悄悄吞噬你数小时的坑, 而在读到那份文档之前, 你不会知道坑在哪里。
>
> **门禁规则(gate rule)**: 在你执行某个参考文档领域内的命令之前, 你必须在本会话中已经读过那份参考文档。跨会话重读成本很低。靠猜成本很高。

---

## 运行时环境配置 - 挂载调试器之前的必读内容

方法论与语言无关。但启动、挂载、打断点、查看状态的命令并非如此。**在进入 Phase 0 之前打开对应的参考文档。不是在调试过程中, 也不是在调试之后。**

| 你的运行时是… | 在挂载任何东西之前打开这份 | 不可妥协的原因… |
|---|---|---|
| Python (CPython, pytest, asyncio, Django, FastAPI) | 📖 **[references/runtimes/python.md](references/runtimes/python.md)** | pdb、ipdb、debugpy、pytest --pdb 的挂载语义各不相同。异步代码需要特殊的断点处理。`poetry run` 这类包装器会吞掉参数标志。 |
| Node.js / tsx / ts-node / Bun / Deno (运行源码) | 📖 **[references/runtimes/node.md](references/runtimes/node.md)** | `tsx` + `node inspect` 命令行存在**静默的 source-map 失败** - 按行号设置的断点不会触发。如果你不先读这份文档, 根本察觉不到。 |
| Rust (cargo, tokio, panics) | 📖 **[references/runtimes/rust.md](references/runtimes/rust.md)** | Release 构建会剥离符号。Tokio 任务需要 `tokio-console`。由于借用检查器的存在, 大多数情况下 `dbg!` 才是更快的工具。 |
| Go (goroutines, dlv, pprof, race) | 📖 **[references/runtimes/go.md](references/runtimes/go.md)** | Goroutine 泄漏和被 recover 的 panic 默认是静默的。`dlv` 有特定的端口约定。`go test -race` 应该是第一件要做的事, 而不是最后一件。 |
| 原生二进制 / 被剥离符号的 C/C++ / 无源码 | 📖 **[references/runtimes/native-binary.md](references/runtimes/native-binary.md)** | 这套工作流(triage -> 动态 -> 静态 -> 脚本化复现)在你从未做过时会显得反直觉。`strings -n 8` 会悄悄丢弃像 `${x}` 这样的短插值 - 任何重要的提取都要直接读字节。macOS 还增加了 SIP / Mach-O / lldb 的特殊之处, 这些在 Linux 上不适用。 |
| **打包应用的二进制** (Bun SEA, Node SEA, Deno compile, pkg, nexe, Electron, Tauri, PyInstaller) | 📖 **[references/runtimes/bundled-js-binary.md](references/runtimes/bundled-js-binary.md)** | 它们看起来像 Mach-O / ELF, 但其*高层*源码可以用对应打包器的专用工具恢复 - 上 Ghidra 是杀鸡用牛刀。源码格式实际情况各异: Bun/pkg/nexe/Electron-asar 通常是明文; 带 code-cache 的 Node SEA、PyInstaller 的 `.pyc`、Deno 的 eszip 需要额外工具; Tauri 的 Rust 核心仍然需要 native-binary.md。工作流: 识别打包器 -> 定位 bundle -> 用打包器专用工具提取 -> grep。 |

**如果你无法如实地说自己刚刚打开了对应运行时的参考文档, 现在就打开它。**

> 🚨 **原生二进制 vs 打包二进制 - 在定方向之前先做判断**: `file ./target` 会把两者都识别成 Mach-O / ELF。30 秒判别法是 `du -h ./target`(50 MB 以上疑似打包)再配合 `strings -n 12 ./target | rg -iE 'bun|node_modules|webpack|esbuild|deno|pkg/lib|electron|pyinstaller|nexe|NODE_SEA_FUSE|tauri'`。有命中 -> bundled-js-binary.md。无命中 -> native-binary.md。

---

## 专用工具 - 当场景契合时主动使用

这些不是"可有可无的附加项"。它们是自己领域内正确的工具, 用别的都会更慢、更不可靠。**如果 bug 属于该领域, 你就必须使用对应工具。先读参考文档以了解用法。**

| 工具 | 适用场景 | 参考文档 |
|---|---|---|
| **Playwright CLI** | 任何浏览器渲染的 Web UI bug。任何需要点击/输入/导航的流程。任何"本地正常、生产挂掉"且浏览器或视口是变量的情况。**对于任何浏览器类产品的 Phase 8 QA, 你必须通过 Playwright 驱动一个真实浏览器 - 不是 curl, 也不是凭空想象。** | 📖 **[references/tools/playwright-cli.md](references/tools/playwright-cli.md)** |
| **Ghidra** | 任何没有可信源码的二进制 - 第三方闭源库、恶意软件、行为与文档相矛盾的 vendored 二进制、CTF、固件。**在靠 `strings`/`objdump` 瞎猜之前先用 Ghidra 的反编译器。它能把机器码变成可读的 C。** | 📖 **[references/tools/ghidra.md](references/tools/ghidra.md)** |
| **pwndbg** | 任何原生二进制调试会话。它是 GDB, 但始终展示有用的视图(寄存器、栈、反汇编、堆)。**如果你打算用普通 `gdb`, 就改用 `pwndbg` - 它是严格的超集。** | 📖 **[references/tools/pwndbg.md](references/tools/pwndbg.md)** |
| **pwntools** | 任何时候你需要与某个二进制或网络服务进行可复现的交互 - 构造 payload、漏洞利用自动化、fuzz harness、CTF 脚本。 | 📖 **[references/tools/pwntools.md](references/tools/pwntools.md)** |

**在对应领域里不使用这些工具, 是流程上的失败, 不是风格选择。** 如果 bug 在浏览器里, 而你的 Phase 8 没用 Playwright, 那就是你做错了。如果 bug 在被剥离符号的二进制里, 而你在用 `xxd` 读十六进制, 那就是你做错了。参考文档会告诉你怎么做。去读它们。

---

## 阶段循环(Phase Loop) - 进入某个阶段之前先读对应的参考文档

每个阶段只有一份参考文档。在你进入该阶段时读它 - 不要提前读, 也不要凭记忆。参考文档自成一体且篇幅简短。

| # | 阶段 | 进入时打开这份 |
|---|---|---|
| 0 | **环境评估** - 在挂载之前了解运行时、端口、符号、环境变量、文件监听器 | [references/methodology/00-setup.md](references/methodology/00-setup.md) |
| 1 | **日志配置** - 用单个 `.debug-journal.md` 追踪每一个痕迹, 以保证可回滚 | [references/methodology/00-setup.md](references/methodology/00-setup.md) |
| 2 | **假设形成** - 至少三个, 跨越正交维度, 每个都有可区分的证据 | [references/methodology/02-investigate.md](references/methodology/02-investigate.md) |
| 3 | **并行调查** - 启用时使用 team 模式 `debug-squad`, 否则使用异步 subagent | [references/methodology/02-investigate.md](references/methodology/02-investigate.md) |
| 4 | **Oracle 三连(Oracle Triple)** - 在连续 2 轮失败后, 召唤三个采用正交视角的 Oracle 并综合结论 | [references/methodology/04-oracle-triple.md](references/methodology/04-oracle-triple.md) |
| 5 | **上报用户决策** - 仅当证据已耗尽且该决策涉及策略含义时 | [references/methodology/05-escalate.md](references/methodology/05-escalate.md) |
| 6 | **根因确认** - 只有当切换可疑原因会同步切换 bug 表现时才算确认 | [references/methodology/06-fix.md](references/methodology/06-fix.md) |
| 7 | **TDD 修复** - 先写红的测试, 最小化变绿, 不扩大范围 | [references/methodology/06-fix.md](references/methodology/06-fix.md) |
| 8 | **手动 QA** - 实际使用系统(CLI 用 tmux, 浏览器用 Playwright, API 用真实 curl, 二进制用真实复现) | [references/methodology/08-qa.md](references/methodology/08-qa.md) |
| 9 | **清理** - 逐条走过日志, 回滚每一个痕迹, 确认 `git diff` 只显示修复 + 测试 | [references/methodology/09-cleanup.md](references/methodology/09-cleanup.md) |
| 10 | **最终验证** - 在宣布完成之前过四道证据关 | [references/methodology/09-cleanup.md](references/methodology/09-cleanup.md) |

**阶段参考文档在设计上都很短。** 读一份只需一分钟。跳过一份会浪费一小时。

### 横切的方法论参考文档

这些不是阶段 - 在情况需要时去读它们:

| 情况 | 参考文档 |
|---|---|
| 失败是间歇性的 - 有时失败、每次跑挂的是不同的测试、单独跑能过、或只在 CI 里挂 | 📖 **[references/methodology/03-flaky-triage.md](references/methodology/03-flaky-triage.md)** - 在 Phase 2 之前读; 失败特征通常一轮就能把搜索空间收窄 |
| 你无法运行真实操作(付费 API、网络被屏蔽、缺少硬件), 但仍需要运行时证据 | 📖 **[references/methodology/partial-runtime-evidence.md](references/methodology/partial-runtime-evidence.md)** |
| 你正准备宣布某个提取 / 审计 / 逆向工程任务完成, 想做一次怀疑式复核 | 📖 **[references/methodology/partial-runtime-evidence.md#verification-oracle-pattern-for-non-debug-tasks](references/methodology/partial-runtime-evidence.md#verification-oracle-pattern-for-non-debug-tasks)**(Verification Oracle 和 Oracle Triple *不是*一回事 - 请读该文件) |

---

## 不可妥协的安全不变量

<safety>
1. **运行时状态是唯一的真相来源。** 没有观察值的假设只是猜测。不要去修猜测。
2. **每一个调试痕迹在创建之前都必须先记入日志。** 先记日志再改, 而不是改完再(也许)记。
3. **绝不在没有先失败测试的情况下发布修复。** 必须有 红->绿 的转变, 否则该修复未经验证。
4. **绝不只凭类型检查/编译通过就宣布完成。** 类型只能抓到声明类 bug。只有跑真实的用户场景才能抓到真实的用户 bug。
5. **绝不向用户提运行时证据本就能回答的问题。** 上报只用于真正模糊不清的情况。
6. **调试期间绝不静默吞掉错误。** 如果系统本身就在吞错误, 那往往就是 bug 本身。临时把它们变响; 在清理阶段再恢复。
7. **绝不在本 skill 内部执行 `git commit`。** 提交归 `/git-master` 处理, 且要在用户确认修复之后。
8. **绝不在读过对应运行时参考文档之前挂载调试器。** 这是门禁规则。
</safety>

---

## 现在该做什么

1. 阅读用户的 bug 描述。
2. 识别运行时。
3. **打开 `references/runtimes/<runtime>.md`。** 读它。
4. 识别哪些专用工具适用。**打开每一个匹配的 `references/tools/*.md`。** 读它们。
5. 打开 `references/methodology/00-setup.md` 并开始 Phase 0。
6. 遵循阶段循环。在每个阶段进入时读对应的方法论参考文档。

**参考文档才是这个 skill。本文件只是一个索引。**
