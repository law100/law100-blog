# law100 Blog

以 WordPress 为内容底座的个人博客：阅读前台、独立内容工作台，以及可选的 Savio 评论身份桥接。

**在线站点：[blog.law100.xyz](https://blog.law100.xyz)** · **许可证：GPL-2.0-or-later**

这是从个人站点整理出的源码快照，不是数据库备份、整机镜像或完整站点导出。线上文章、账户、上传文件、密钥和历史部署资料均不包含在内。

## 包含什么

| 目录 | 内容 |
| --- | --- |
| `themes/liquid-a` | WordPress 主题：首页、日间/夜间切换、单栏阅读、目录、搜索、评论和手机布局 |
| `plugins/law100-studio` | React + TypeScript 独立后台：工作台、轻量区块编辑器、文章/页面、评论、媒体和分类 |
| `plugins/law100-savio-comments` | 可选的 Savio 评论桥接，游客留言仍由 WordPress 原生处理 |

不包含 Savio App/账户服务、Drive 插件及云盘数据、旧后台美化插件、WordPress 核心、数据库、生产 Nginx 配置或 test 子域名的时光记项目。

## 环境

- WordPress 6.5 或更新版本（请在自己的测试站点验收，不承诺所有插件组合兼容）
- PHP 8.1+、HTTPS、WordPress REST API 与固定链接
- 本地构建使用 Node.js 24、npm；服务器使用编译产物，不需要 Node.js

## 安装

1. 准备自己的 WordPress、管理员账户和 HTTPS，不要把生产凭据放进仓库。
2. 将 `themes/liquid-a` 复制到 `wp-content/themes/liquid-a`，在“外观”中启用。
3. 在“外观 → 自定义”设置背景、简介、社交链接和邮箱。开源版用山形 SVG 替代线上摄影背景，默认使用系统字体；站点已有 `assets/fonts/pingfang-shangshangqian.ttf` 时，首页题字会加载独立的 `hero-font.css`，保留站点自备的原始字体。字体文件不随仓库分发。
4. 构建 Studio：

   ```bash
   cd plugins/law100-studio
   npm ci
   npm test
   npm run build
   ```

5. 将 `law100-studio.php`、`templates/` 和完整 `dist/`（**包含隐藏的 `.vite/manifest.json`**）部署到 `wp-content/plugins/law100-studio/`，启用插件。
6. 打开 `/studio/login/`，使用 WordPress 管理员账户登录。`/studio/` 是内容工作台，不是独立账户系统。

路由若出现 404，保存一次固定链接设置，并确认 Web 服务器将非静态请求交给 WordPress。不要将仓库目录作为公开网站根目录。

## 原生后台与兼容性

Studio 初次启用不强制重定向原生后台。验证通过后，可将 WordPress option `law100_studio_redirect_native` 设为 `1`。

应急入口 `/wp-admin/?law100-native=1` **仍需有效管理员身份**；停用插件可恢复原生后台。隐藏入口不是安全边界。

Studio 不是 Gutenberg 的完整替代，未知区块保留原始内容。请在测试站点验证自己的区块、修订和编辑器兼容性。

## 可选 Savio 评论

主题和 Studio 不依赖 Savio，没有自建兼容账户服务时，无需启用评论插件，游客评论可独立使用。

本仓库不提供 Savio 账户后台、邮件服务或公共认证 API。接入前自行实现同源 `/api/savio/v1/web` 服务，详见 [接口约定](docs/savio-bridge.md)。桥接密钥通过私有 WordPress 配置提供，不要写进插件或前端。未配置时插件不显示 Savio 登录入口。

## 个性化与边界

- 首页题字、关于页、项目介绍、友链及历史日志仍有 law100 个人化文案。复用时请修改 `template-parts/`、`page.php`、`page-changelog.php`，不要将原作者的介绍当作自己的身份。
- `/articles/`、`/about/`、`/changelog/` 等页面需自行创建。Drive 不在本仓库，相关入口请自行调整或移除。
- 未提供生产一键部署脚本；不要直接覆盖已有主题与数据。
- 线上字体和摄影素材没有再分发；商标和名称不代表对衍生项目的背书。

## 测试

```bash
node --test themes/liquid-a/tests/*.test.cjs
node --test plugins/law100-savio-comments/tests/*.test.cjs
cd plugins/law100-studio && npm ci && npm test && npm run build
```

PHP 可用 `php -l` 检查。阅读集成测试需要独立的 WordPress 测试环境，调用方式见 `themes/liquid-a/tests/reading-smoke.php`。不要使用生产账户或 Cookie 制作测试夹具。

## 许可与安全

第一方代码使用 **GNU GPL v2 或更高版本**，见 [LICENSE](LICENSE)。第三方依赖保留原许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。本软件不提供保证，尚未经过独立安全审计。

安全问题请通过 GitHub 私密漏洞报告提出，不要在公开 Issue 中提交凭据或个人资料，见 [SECURITY.md](SECURITY.md)。
