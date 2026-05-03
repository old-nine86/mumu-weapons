from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "promotion" / "video-assets" / "day2-frames"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
FPS = 24
DURATION = 25
TOTAL = FPS * DURATION

ASSETS = ROOT / "promotion" / "ai-video-assets"
QR = ROOT / "promotion" / "video-assets" / "day1-qr-ending.jpg"

images = [
    Image.open(ASSETS / "ai-brick-weapon-01.png").convert("RGB"),
    Image.open(ASSETS / "ai-brick-weapon-02.png").convert("RGB"),
    Image.open(ASSETS / "ai-brick-collection.png").convert("RGB"),
]
qr = Image.open(QR).convert("RGB")

def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size, index=1 if bold else 0)
        except Exception:
            pass
    return ImageFont.load_default()

F_TITLE = font(72, True)
F_H1 = font(58, True)
F_BODY = font(38, False)
F_SMALL = font(30, False)
F_BADGE = font(34, True)
F_NUM = font(62, True)

def cover(img, w, h, zoom=1.0):
    iw, ih = img.size
    scale = max(w / iw, h / ih) * zoom
    nw, nh = int(iw * scale), int(ih * scale)
    resized = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return resized.crop((left, top, left + w, top + h))

def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def wrap_text(draw, text, fnt, max_width):
    lines = []
    current = ""
    for ch in text:
        trial = current + ch
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = ch
    if current:
        lines.append(current)
    return lines

def text_center(draw, y, text, fnt, fill=(28, 30, 36), max_width=920, line_gap=10):
    lines = wrap_text(draw, text, fnt, max_width)
    total_h = sum(draw.textbbox((0, 0), line, font=fnt)[3] for line in lines) + line_gap * (len(lines) - 1)
    yy = y - total_h // 2
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=fnt)
        x = (W - (bbox[2] - bbox[0])) // 2
        draw.text((x, yy), line, font=fnt, fill=fill)
        yy += bbox[3] - bbox[1] + line_gap

def card(draw, x, y, w, h, fill=(255, 255, 255), shadow=True):
    if shadow:
        s = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(s)
        sd.rounded_rectangle((x, y + 14, x + w, y + h + 14), radius=42, fill=(50, 45, 40, 30))
        return s.filter(ImageFilter.GaussianBlur(22))
    draw.rounded_rectangle((x, y, x + w, y + h), radius=42, fill=fill)

def paste_card(base, x, y, w, h, fill=(255, 255, 255, 238)):
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x, y + 18, x + w, y + h + 18), radius=42, fill=(80, 70, 60, 32))
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(20)))
    d = ImageDraw.Draw(base)
    d.rounded_rectangle((x, y, x + w, y + h), radius=42, fill=fill)
    return d

def pill(draw, x, y, text, fill, fg=(24, 28, 34)):
    bbox = draw.textbbox((0, 0), text, font=F_BADGE)
    w = bbox[2] - bbox[0] + 42
    draw.rounded_rectangle((x, y, x + w, y + 58), radius=29, fill=fill)
    draw.text((x + 21, y + 11), text, font=F_BADGE, fill=fg)
    return w

def progress(draw, x, y, label, value, color):
    draw.text((x, y), label, font=F_SMALL, fill=(79, 84, 96))
    draw.rounded_rectangle((x + 150, y + 10, x + 510, y + 30), radius=10, fill=(235, 238, 243))
    draw.rounded_rectangle((x + 150, y + 10, x + 150 + int(360 * value / 100), y + 30), radius=10, fill=color)
    draw.text((x + 530, y - 4), str(value), font=F_SMALL, fill=(44, 48, 56))

def frame(t):
    sec = t / FPS
    scene = 0 if sec < 3.5 else 1 if sec < 8.5 else 2 if sec < 14.5 else 3 if sec < 20.5 else 4
    if scene == 0:
        bg = cover(images[1], W, H, zoom=1.06)
    elif scene == 1:
        bg = cover(images[0], W, H, zoom=1.08)
    elif scene == 2:
        bg = cover(images[2], W, H, zoom=1.08)
    elif scene == 3:
        bg = cover(images[0], W, H, zoom=1.02)
    else:
        bg = cover(qr, W, H, zoom=1.0)

    bg = bg.filter(ImageFilter.GaussianBlur(1.2 if scene != 4 else 0))
    base = bg.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (255, 248, 238, 72 if scene != 4 else 16))
    base.alpha_composite(overlay)
    draw = ImageDraw.Draw(base)

    if scene == 0:
        paste_card(base, 78, 106, 924, 190)
        text_center(draw, 178, "你的积木武器，也能进网站", F_H1)
        draw.rounded_rectangle((120, 1518, 960, 1658), radius=42, fill=(28, 30, 36, 238))
        text_center(draw, 1588, "第 2 条：上传武器挑战", F_H1, fill=(255, 255, 255), max_width=820)
    elif scene == 1:
        paste_card(base, 92, 126, 896, 210)
        text_center(draw, 200, "上传一张照片", F_TITLE)
        text_center(draw, 276, "网站会自动识别武器类型", F_BODY, fill=(84, 89, 103))
        paste_card(base, 150, 510, 780, 640, fill=(255, 255, 255, 245))
        draw.rounded_rectangle((210, 575, 870, 935), radius=32, fill=(244, 249, 255))
        thumb = cover(images[1], 610, 330, zoom=1.0)
        base.paste(thumb, (235, 590))
        draw.rounded_rectangle((258, 970, 822, 1042), radius=36, fill=(255, 90, 137))
        text_center(draw, 1005, "上传你的积木武器", F_BODY, fill=(255, 255, 255), max_width=520)
    elif scene == 2:
        paste_card(base, 92, 112, 896, 250)
        text_center(draw, 190, "识别完成", F_TITLE)
        text_center(draw, 278, "类型：长柄 · 稀有度：彩虹", F_BODY, fill=(84, 89, 103))
        paste_card(base, 112, 500, 856, 700, fill=(255, 255, 255, 245))
        pill(draw, 170, 560, "长柄", (201, 235, 255))
        pill(draw, 310, 560, "彩虹稀有", (255, 228, 132))
        pill(draw, 535, 560, "玩家作品", (228, 216, 255))
        progress(draw, 170, 690, "攻击", 88, (255, 96, 132))
        progress(draw, 170, 780, "防御", 62, (103, 166, 255))
        progress(draw, 170, 870, "速度", 76, (97, 210, 159))
        progress(draw, 170, 960, "积木数", 142, (255, 188, 75))
        draw.text((170, 1080), "创建者：你", font=F_BODY, fill=(38, 42, 50))
    elif scene == 3:
        paste_card(base, 64, 96, 952, 210)
        text_center(draw, 174, "新武器加入武器库", F_TITLE)
        text_center(draw, 252, "还能显示创建者名字", F_BODY, fill=(84, 89, 103))
        paste_card(base, 118, 450, 844, 850, fill=(255, 255, 255, 245))
        thumb = cover(images[1], 680, 420, zoom=1.0)
        base.paste(thumb, (200, 520))
        draw.rounded_rectangle((172, 990, 908, 1194), radius=36, fill=(248, 250, 253))
        draw.text((218, 1036), "彩虹长柄", font=F_H1, fill=(31, 34, 42))
        draw.text((218, 1116), "创建者：你  ·  战力 88", font=F_BODY, fill=(88, 94, 108))
    else:
        draw.rounded_rectangle((90, 128, 990, 256), radius=44, fill=(255, 255, 255, 238))
        text_center(draw, 192, "想把你的武器放进来吗？", F_H1)
        draw.rounded_rectangle((150, 1518, 930, 1638), radius=40, fill=(28, 30, 36, 235))
        text_center(draw, 1578, "扫码或搜：沐沐积木武器库", F_BODY, fill=(255, 255, 255), max_width=760)

    return base.convert("RGB")

for i in range(TOTAL):
    frame(i).save(OUT / f"frame_{i:04d}.jpg", quality=92)

print(f"wrote {TOTAL} frames to {OUT}")
