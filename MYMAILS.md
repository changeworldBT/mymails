# MyMails

基于 [dreamhunter2333/cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email) v1.13.0（MIT）独立维护的临时邮箱服务，不再跟随上游版本。

## 与上游的差异
- 前端：Turnstile 脚本按需懒加载（不阻塞首屏）；vendor 拆包（naive-ui / vue / 编辑器）便于长期缓存；只内置中文/英文语言包；`_headers` 为 `/assets/*` 设置一年 immutable 缓存；默认中文。
- 部署：D1 放在亚太（APAC）并开启 Smart Placement；`worker/wrangler.mymails.toml` 为生产配置，敏感值（JWT_SECRET、ADMIN_PASSWORDS）只用 Worker Secret。

## 部署
```bash
cd worker && pnpm i && npx wrangler deploy -c wrangler.mymails.toml --minify
cd frontend && pnpm i && pnpm build   # 产物 dist/ 上传到 Pages 项目 emails
```
