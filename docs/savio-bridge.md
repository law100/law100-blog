# 可选身份桥接

这是接口约定说明，不是账户服务实现。请勿将请求指向原作者的线上账户服务。

前端同源路径是 `/api/savio/v1/web`，应代理到你自己的服务。浏览器会话采用 HttpOnly、Secure Cookie，名称为 `savio_blog_session`。服务端必须实现来源验证、CSRF、防暴力尝试及限流。

前端调用包含 session、登录、注册、邮箱验证、重发、找回密码、重置密码、资料更新和退出。准确方法、路径及响应字段以 `assets/comments.js` 为准，接入前逐项实现并测试。

PHP 桥接请求 `POST /auth/introspect`：

- Header：`X-Savio-Bridge-Key`，值取自私有 `LAW100_SAVIO_BRIDGE_SECRET`。
- JSON：`{"sessionToken":"用户当前会话令牌"}`。
- 响应字段须符合插件 `law100_savio_bridge_identity()` 的检查。只能依据服务端验证过的会话、邮箱与完整资料信任身份，不得接受客户端自报的昵称/邮箱作为身份凭据。

密钥应随机生成、至少 32 字符，在私有 wp-config.php 和账户服务环境配置中保持一致，不能提交进 Git。未配置时开源版隐藏 Savio 界面；伪造 Savio 评论意图仍拒绝，不会退化为游客绕过审核。

游客仍使用原生姓名、邮箱及审核规则；插件不创建影子 WordPress 用户，也不迁移账户。
