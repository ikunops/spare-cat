# 闲猫 · 手慢无 部署说明

## 组成

- 应用目录：`/opt/xianmao`
- 数据库：`/opt/xianmao/data/xianmao.sqlite`（挂载在容器 `/app/data`）
- 容器：`xianmao`，Node 24，监听 `0.0.0.0:4173`
- 启动方式：`docker compose -f /opt/xianmao/compose.yaml up -d`

CentOS 7 的 glibc 2.17 无法运行 Node 18，且项目依赖 `node:sqlite`（Node 22.5+），
因此固定使用 `node:24-bookworm-slim` 容器。

## Nginx 反代（子路径部署）

应用需要一个子路径反代，示例：

```nginx
location = /xianmao {
    return 301 /xianmao/;
}

location ^~ /xianmao/ {
    proxy_pass http://127.0.0.1:4173/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Prefix /xianmao;
    client_max_body_size 12m;
}
```

应用会依据 `X-Forwarded-Prefix` 注入前端 `BASE_PATH`，API 请求统一落到 `/xianmao/api/`。
若不使用子路径，直接把 `location /` 反代到 `127.0.0.1:4173` 即可。

## 更新流程

1. 修改源码并重新构建前端（`node work/build-web.js` 合并 `parts-web/` → `web.js`）。
2. 上传到 `/opt/xianmao`。
3. 若只改前端静态文件，无需重启；若改 `server/*.js`，执行 `docker restart xianmao`。
4. 用 `/xianmao/api/health` 做健康检查。

## 健康检查

```bash
curl http://127.0.0.1:4173/api/health
# {"ok":true,"database":".../xianmao.sqlite","cats":9}
```
