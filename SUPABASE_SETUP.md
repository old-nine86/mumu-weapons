# 沐沐积木武器库后端设置

这个网站仍然可以作为 GitHub Pages 静态网站运行。配置 Supabase 后，玩家上传的武器会先进入待审核列表。你审核通过后，别的设备刷新页面才能看到。论坛也会同步到云端，别人发的帖子和回复会出现在所有设备上。

## 1. 创建 Supabase 项目

1. 打开 Supabase，创建一个新项目。
2. 进入项目后，复制 `Project URL` 和 `anon public key`，新版 Supabase 也可以使用 `sb_publishable_...` 开头的 publishable key。
3. 注意：只使用 `anon` / `publishable` key，不要把 `service_role`、`sb_secret_...` 或数据库密码放进网页。

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
  anonKey: "你的 anon public key 或 sb_publishable key",
  weaponsTable: "weapons",
  imageBucket: "mumu-weapon-images"
};
```

改完后提交并推送到 GitHub Pages。

## 5. 测试

1. 打开网站，上传一件积木武器。
2. 用另一台设备打开同一个网址。
3. 打开 Supabase 的 `weapons` 表，找到刚上传的记录。
4. 把 `status` 从 `pending` 改成 `approved`。
5. 用另一台设备打开同一个网址。如果能看到刚上传的武器，云端同步和审核流程就成功了。
6. 在网站论坛发一条帖子，再用另一台设备刷新。如果能看到帖子，云端论坛也成功了。

## 6. 审核方式

推荐使用网站审核台：

1. 打开 `https://old-nine86.github.io/mumu-weapons/admin.html`。
2. 输入 Supabase 里设置的审核口令。
3. 如果要用 AI 精修，在顶部填 OpenAI API Key 并保存。这个 key 只保存在当前浏览器，不写进 GitHub。
4. 在待审核武器里点击“只生成描述属性”或“一键 AI 全流程”。
5. 一键 AI 全流程会自动生成透明主体图、卡片背景、角色手持展示图，并保存到 Supabase Storage。
6. 检查 AI 填好的名字、创建者、描述、属性和展示图，确认后点击“通过”或“拒绝”。

重要：第一次使用 AI 全流程前，需要运行最新版 `supabase-schema.sql`，里面包含 `admin_update_weapon_ai_assets` 函数。

备用方式是 Supabase 后台：

1. 进入 Table Editor。
2. 打开 `weapons` 表。
3. 查看 `name`、`creator`、`description`、`image_url`、`share_proof`。
4. 合格内容把 `status` 改成 `approved`。
5. 不合格内容把 `status` 改成 `rejected`，可以在 `review_note` 写原因。

公开网站只会读取 `status = approved` 的武器，所以待审核和拒绝的内容不会展示给其他用户。

## 7. 上传额度和推广奖励

目标规则已经写入数据库设计：

- 每个 IP 免费上传 2 件。
- 推广/分享网站、抖音或快手视频，审核通过后增加 10 个上传名额。
- 用户上传时可以在“推广证明”里填写分享链接或说明。
- 推广证明可以单独进入 `promotion_submissions` 表，也可以跟武器一起写在 `weapons.share_proof`。

重要：严格按 IP 限制不能只靠 GitHub Pages 前端完成。需要下一步加 Supabase Edge Function，因为只有后端函数才能可靠读取请求 IP、计算剩余额度、审核推广奖励并防止绕过。

## 现在的限制

- 当前网页端仍保留浏览器本地限制，用来防止普通误传。
- 论坛现在是公开发布、公开读取；如果以后要做“论坛也必须先审核再展示”，可以继续加论坛审核台。
- 严格“每 IP 免费 2 件、推广后 +10 件”需要再加 Supabase Edge Function 或自己的后端接口。
- 扣背景是浏览器里的浅色背景识别，适合地板、桌面、白色纸张这类背景；复杂背景需要以后接 AI 图像分割服务。
