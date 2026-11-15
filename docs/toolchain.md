# 工具链记录

官方资料于 2026-11-15 阅读，版本以本次实际安装和运行结果为准，非对未来最新版本的承诺。

| 工具               | 本次版本                                     | 实际验证                                                                  |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| 项目 Node          | 26.13.1，macOS arm64                         | 官方 tarball 校验后解压，REA 与 Codex 本地调用                            |
| 本机 Node          | 26.8.2                                       | 当前练习项目的安装、测试、Vite 开发与构建                                 |
| REA                | 6.9.0                                        | stdio MCP；浏览器目标、DOM/可访问文本、正常加载脚本、截图；本地计数器交互 |
| Craft Anything CLI | 0.6.1，官方 universal 发布包                 | MCP 108 工具；本地页面 Clean Room 捕获；Codex 实际生成与验收              |
| Codex CLI          | 0.169.0，项目隔离安装                        | 模型实际调用 REA MCP；Craft 实际生成任务                                  |
| MCP SDK            | 1.32.2                                       | 实际连接 stdio 服务并调用工具                                             |
| 当前前端           | Vite 8.3.8、lucide 1.73.0、Playwright 1.65.1 | 锁定于根目录 package-lock.json                                            |

## 官方文档

- [REA 项目与安装](https://github.com/morluto/rea)
- [Craft Anything 官方项目](https://github.com/storytold/craft-anything)
- [Craft 官方发布](https://github.com/storytold/craft-anything/releases/tag/v0.6.1)
- [Codex 官方项目](https://github.com/openai/codex)
- [Node 官方下载校验清单](https://nodejs.org/dist/v26.13.1/SHASUMS256.txt)

## 完整性

Node 官方 `node-v26.13.1-darwin-arm64.tar.gz` 的 SHA-256：

```text
aec2514ea1ceb2ba52455e9ec65986f6749a06dd759e5db2a72e6889668c9735
```

Craft 官方 `craft-anything-cli-0.6.1-macos-universal.zip`，27,891,145 字节，SHA-256：

```text
ddbae05f52a5526e149f656b0b44cf73a60ad9ec0a33d718f330bf231b988c2f
```

Craft `codesign` 校验通过，Developer ID 为 Learning Machines LLC，Team ID `DJ6XS33FX8`。裸 CLI 的 `spctl` 返回「code is valid but does not seem to be an app」，没有将此描述为已独立验证公证。npm 包完整性由 lockfile 的 integrity 锁定；前序工具链 npm 签名检查未发现无效签名。

## 隔离方式

前序工具验证目录独立保存 `.tools/`、`.craft-home/` 和 wrapper。没有把二进制、模型密钥、用户 Codex 配置、认证文件或完整会话日志搬进这个公开仓库，没有向全局 Codex 注册 MCP，也未覆盖全局 Node/Codex。

REA 通过项目 Node 启动 `rea-agents/scripts/rea.mjs mcp`，环境限定 `REA_MCP_TOOL_FAMILIES=browser,session`。Chrome 使用新会话与回环 CDP 端口。Craft 使用项目 `CRAFT_ANYTHING_CONFIG_DIR`，以 `--clean-room --allow-run mcp --all-tools` 启动 stdio；Clean Room 不保留原站代码。公开前端脚本的只读分析由 REA 负责。

用户授权沿用已有 Codex API 配置并承担可能的模型费用。仅让 Codex 自己读取原有凭据；源码仓库没有该供应商配置或密钥。

## 已完成的完整流程

1. 启动 REA、Craft，并由 MCP 客户端完成真实工具调用；不以 `--help` 或 doctor 作为端到端证据。
2. 本地无害计数器：REA 检查、截图、点击；计数实际增加。
3. Codex 实际调用 REA 的 `binary_session` MCP 工具成功。
4. Craft 对本地计数器运行 Study / Build / Check，选择 Codex backend，实际使用 `build_file_write`、`core_targets_list` 和 `project_build_finish`。
5. 独立 Playwright 验收生成物：三种宽度，点击三次，展开详情。生成不依赖原站、付费素材或用户账户。
6. 本轮 REA 实际检查 qquce.cn 首页正常加载的脚本和公开页面，发现公开 `/quiz`、`/mbti`。
7. 本轮 Craft 实际通过 MCP 捕获本项目题库界面，1440 / 768 / 390 三宽，成功关闭浏览器。捕获不是原站后端还原或算法验证。

前序完整生成是本地计数器样例；当前测评引擎与应用由本轮 Codex 独立编写。未把样例生成的视觉分数写成 qquce.cn 的复刻准确率。

## 剩余问题

Craft 仍为 alpha；doctor 会因未全局注册而提示整体不健康，但隔离 MCP 和真实生成已成功。REA 可选原生分析依赖在前序安装中存在 3 项 moderate 传递依赖告警，未启用该原生分析功能。当前公开网页项目不依赖 REA，根目录安装审计为 0 漏洞。

不建议为了启动网页重新配置工具链。需要重新运行 REA/Craft 时按官方文档使用独立目录，逐项授权所需工具；不要将用户凭据放入公开配置。
