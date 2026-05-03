# 沐沐积木武器库后端设置

这个网站仍然可以作为 GitHub Pages 静态网站运行。配置 Supabase 后，玩家上传的武器会进入云端武器库，别的设备刷新页面也能看到。

## 1. 创建 Supabase 项目

1. 打开 Supabase，创建一个新项目。
2. 进入项目后，复制 `Project URL` 和 `anon public key`。
3. 注意：只使用 `anon` / `publishable` key，不要把 `service_role` 或 secret key 放进网页。

## 2. 建表

1. 打开 Supabase 的 SQL Editor。
2. 复制并运行 `supabase-schema.sql` 里的全部 SQL。

## 3. 创建图片桶

1. 打开 Supabase Storage。
2. 新建 bucket，名字必须是 `mumu-weapon-images`。
3. 设置为 Public bucket。

## 4. 打开网站云端开关

编辑 `supabase-config.js`：

```js
window.MUMU_SUPABASE = {
  enabled: true,
  url: "你的 Supabase Project URL",
  anonKey: "你的 anon public key",
  weaponsTable: "weapons",
  imageBucket: "mumu-weapon-images"
};
```

改完后提交并推送到 GitHub Pages。

## 5. 测试

1. 打开网站，上传一件积木武器。
2. 用另一台设备打开同一个网址。
3. 如果能看到刚上传的武器，云端同步就成功了。

## 现在的限制

- 当前版本是“每个浏览器限传 1 件”，不是严格的每个 IP 限传 1 件。
- 真正按 IP 限传需要再加 Supabase Edge Function 或自己的后端接口，不能只靠 GitHub Pages 前端安全实现。
- 扣背景是浏览器里的浅色背景识别，适合地板、桌面、白色纸张这类背景；复杂背景需要以后接 AI 图像分割服务。
