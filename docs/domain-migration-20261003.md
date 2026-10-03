# 正式域名迁移记录

- 正式站名：law100的首页。
- 正式地址：https://home.law100.xyz。
- https://blog.law100.xyz 的网页使用 301，保留完整请求路径和查询参数。
- 旧 Savio API 路径使用 308，避免 301 将 POST 请求改成 GET；旧客户端仍应更新正式服务地址并验证其重定向支持。
- WordPress 的 WP_HOME、WP_SITEURL 常量及数据库 home、siteurl、blogname 已同步。
- 数据库地址替换通过 WP-CLI，支持序列化数据；不修改文章 GUID。
- Savio 网页来源校验切换到新域名，不扩大为通配来源。Cookie 仍为 host-only、Secure、HttpOnly、SameSite=Lax。
- 旧登录 Cookie、显示偏好和评论草稿不会跨域继承；迁移后可能需要重新登录或设置偏好。
- 新旧域名分别保留 HTTPS 证书；新证书续期加入现有 systemd 续期任务。
- run、test、Fast Note Sync 的配置及数据不修改。

## 验证范围

已检查首页、手写题字、文章与评论入口、Savio 登录弹层、匿名会话接口、来源校验、Studio 登录跳转、Drive 页面、证书及路径/查询参数跳转。未使用真实用户凭据完成登录，未注册账户或发布测试评论。

## 回滚

生产服务器在 `/root/backups/home-domain-20261003` 保存迁移前站点、Nginx、Savio 配置及 WordPress SQL；本地忽略目录 artifacts 中保留副本，SHA-256 校验一致。

回滚应恢复相关域名配置、WordPress 正式地址和站名、Savio 来源设置，并停用新增的 home 虚拟主机和续期项。仅在必要时恢复数据库备份，避免覆盖迁移后新增的内容。不要恢复或发布含数据库凭据的备份到公开仓库。

Nginx 检查通过，但已有 law100.xyz、www、test 重复 server_name 警告；不是本次引入，未扩展修改这些独立站点的配置。
