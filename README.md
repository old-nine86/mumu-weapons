# 沐沐积木武器库

这是“沐沐积木武器库”的正式项目文件夹。以后继续制作、交给其他 agent、查看计划或发布网站，都以这个文件夹为准。

## 项目入口

- 中文网站：`index.html`
- 英文网站：`en/index.html`
- 后台管理：`admin.html`
- 项目总计划：`PROJECT.md`
- 开发日志：`DEVELOPMENT_LOG.md`
- Supabase 设置说明：`SUPABASE_SETUP.md`

## 线上地址

- 中文站：https://old-nine86.github.io/mumu-weapons/
- 英文站：https://old-nine86.github.io/mumu-weapons/en/
- 后台：https://old-nine86.github.io/mumu-weapons/admin.html

## 主要目录

- `assets/`：网站图片、角色图、漫画、武器展示图等素材
- `promotion/`：推广用素材、短视频素材、二维码和脚本
- `scripts/`：本地工具脚本，例如抠图工具
- `en/`：英文网站

## 继续开发时先看

1. 先读 `PROJECT.md`，了解总计划和长期方向。
2. 再读 `DEVELOPMENT_LOG.md` 顶部，了解最近做了什么。
3. 修改完成后更新 `DEVELOPMENT_LOG.md`。
4. 运行 `node scripts/preflight-check.mjs` 做发布前自检。
5. 测试通过后提交并推送到 GitHub `main` 分支。

## 当前产品方向

这是一个可爱高级积木玩具网站，核心包括：

- 积木武器库
- 玩家上传武器
- 后台审核
- MBTI 积木角色
- 角色战斗系统
- 角色漫画故事
- 论坛讨论
- 中英文双站
- 未来 AR 现实积木对战

## 工作规则

- 不要删除已有素材和历史记录。
- 新素材放到对应目录，不要散落在项目外。
- 重要更新必须写进 `DEVELOPMENT_LOG.md`。
- 长期方向变化写进 `PROJECT.md`。
- 数据库密码、私钥、后台密钥不要写进公开文件。
