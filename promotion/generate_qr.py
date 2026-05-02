from PIL import Image

URL = "https://old-nine86.github.io/mumu-weapons/"
OUT = "promotion/site-qr.png"


def gf_tables():
    exp = [0] * 512
    log = [0] * 256
    x = 1
    for i in range(255):
        exp[i] = x
        log[x] = i
        x <<= 1
        if x & 0x100:
            x ^= 0x11D
    for i in range(255, 512):
        exp[i] = exp[i - 255]
    return exp, log


EXP, LOG = gf_tables()


def gf_mul(a, b):
    if a == 0 or b == 0:
        return 0
    return EXP[LOG[a] + LOG[b]]


def poly_mul(p, q):
    out = [0] * (len(p) + len(q) - 1)
    for i, a in enumerate(p):
        for j, b in enumerate(q):
            out[i + j] ^= gf_mul(a, b)
    return out


def rs_generator(degree):
    g = [1]
    for i in range(degree):
        g = poly_mul(g, [1, EXP[i]])
    return g


def rs_ec(data, degree):
    gen = rs_generator(degree)
    msg = data[:] + [0] * degree
    for i in range(len(data)):
        coef = msg[i]
        if coef:
            for j, g in enumerate(gen):
                msg[i + j] ^= gf_mul(coef, g)
    return msg[-degree:]


def bits_from_value(value, count):
    return [(value >> i) & 1 for i in range(count - 1, -1, -1)]


def make_codewords(text):
    data = text.encode("utf-8")
    bits = []
    bits += [0, 1, 0, 0]
    bits += bits_from_value(len(data), 8)
    for b in data:
        bits += bits_from_value(b, 8)
    bits += [0] * min(4, 55 * 8 - len(bits))
    while len(bits) % 8:
        bits.append(0)
    words = [int("".join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
    pads = [0xEC, 0x11]
    k = 0
    while len(words) < 55:
        words.append(pads[k % 2])
        k += 1
    return words + rs_ec(words, 15)


def set_module(mat, reserved, r, c, val, reserve=True):
    if 0 <= r < len(mat) and 0 <= c < len(mat):
        mat[r][c] = val
        if reserve:
            reserved[r][c] = True


def finder(mat, reserved, r, c):
    for y in range(-1, 8):
        for x in range(-1, 8):
            rr, cc = r + y, c + x
            if 0 <= rr < len(mat) and 0 <= cc < len(mat):
                reserved[rr][cc] = True
                if 0 <= y <= 6 and 0 <= x <= 6:
                    mat[rr][cc] = y in (0, 6) or x in (0, 6) or (2 <= y <= 4 and 2 <= x <= 4)
                else:
                    mat[rr][cc] = False


def alignment(mat, reserved, center):
    r, c = center
    for y in range(-2, 3):
        for x in range(-2, 3):
            rr, cc = r + y, c + x
            val = max(abs(y), abs(x)) in (0, 2)
            set_module(mat, reserved, rr, cc, val)


def build_base():
    size = 29
    mat = [[False] * size for _ in range(size)]
    reserved = [[False] * size for _ in range(size)]
    finder(mat, reserved, 0, 0)
    finder(mat, reserved, 0, size - 7)
    finder(mat, reserved, size - 7, 0)
    alignment(mat, reserved, (22, 22))
    for i in range(8, size - 8):
        set_module(mat, reserved, 6, i, i % 2 == 0)
        set_module(mat, reserved, i, 6, i % 2 == 0)
    set_module(mat, reserved, 4 * 3 + 9, 8, True)
    for i in range(9):
        if i != 6:
            reserved[8][i] = True
            reserved[i][8] = True
            reserved[8][size - 1 - i] = True
            reserved[size - 1 - i][8] = True
    return mat, reserved


def place_data(mat, reserved, codewords):
    bits = []
    for w in codewords:
        bits += bits_from_value(w, 8)
    size = len(mat)
    i = 0
    upward = True
    c = size - 1
    while c > 0:
        if c == 6:
            c -= 1
        rows = range(size - 1, -1, -1) if upward else range(size)
        for r in rows:
            for dc in (0, 1):
                cc = c - dc
                if not reserved[r][cc]:
                    mat[r][cc] = bits[i] == 1 if i < len(bits) else False
                    i += 1
        upward = not upward
        c -= 2


def mask_bit(mask, r, c):
    return [
        (r + c) % 2 == 0,
        r % 2 == 0,
        c % 3 == 0,
        (r + c) % 3 == 0,
        (r // 2 + c // 3) % 2 == 0,
        (r * c) % 2 + (r * c) % 3 == 0,
        ((r * c) % 2 + (r * c) % 3) % 2 == 0,
        ((r + c) % 2 + (r * c) % 3) % 2 == 0,
    ][mask]


def apply_mask(mat, reserved, mask):
    out = [row[:] for row in mat]
    for r in range(len(out)):
        for c in range(len(out)):
            if not reserved[r][c] and mask_bit(mask, r, c):
                out[r][c] = not out[r][c]
    return out


def penalty(mat):
    size = len(mat)
    score = 0
    for rows in (mat, [[mat[r][c] for r in range(size)] for c in range(size)]):
        for row in rows:
            run = 1
            for i in range(1, size):
                if row[i] == row[i - 1]:
                    run += 1
                else:
                    if run >= 5:
                        score += 3 + run - 5
                    run = 1
            if run >= 5:
                score += 3 + run - 5
    for r in range(size - 1):
        for c in range(size - 1):
            if mat[r][c] == mat[r + 1][c] == mat[r][c + 1] == mat[r + 1][c + 1]:
                score += 3
    dark = sum(sum(row) for row in mat)
    score += abs(dark * 100 // (size * size) - 50) // 5 * 10
    return score


def format_bits(mask):
    data = (1 << 3) | mask
    v = data << 10
    gen = 0x537
    for i in range(14, 9, -1):
        if (v >> i) & 1:
            v ^= gen << (i - 10)
    return ((data << 10) | v) ^ 0x5412


def add_format(mat, mask):
    size = len(mat)
    bits = bits_from_value(format_bits(mask), 15)
    coords1 = [(8, 0), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 7), (8, 8), (7, 8), (5, 8), (4, 8), (3, 8), (2, 8), (1, 8), (0, 8)]
    coords2 = [(size - 1, 8), (size - 2, 8), (size - 3, 8), (size - 4, 8), (size - 5, 8), (size - 6, 8), (size - 7, 8), (8, size - 8), (8, size - 7), (8, size - 6), (8, size - 5), (8, size - 4), (8, size - 3), (8, size - 2), (8, size - 1)]
    for bit, (r, c) in zip(bits, coords1):
        mat[r][c] = bit == 1
    for bit, (r, c) in zip(bits, coords2):
        mat[r][c] = bit == 1


def render(mat):
    scale = 18
    quiet = 4
    size = len(mat)
    img = Image.new("RGB", ((size + quiet * 2) * scale, (size + quiet * 2) * scale), "#fffdf8")
    px = img.load()
    dark = (32, 33, 36)
    for r, row in enumerate(mat):
        for c, val in enumerate(row):
            if val:
                for y in range((r + quiet) * scale, (r + quiet + 1) * scale):
                    for x in range((c + quiet) * scale, (c + quiet + 1) * scale):
                        px[x, y] = dark
    img.save(OUT)


base, reserved = build_base()
place_data(base, reserved, make_codewords(URL))
candidates = [(penalty(apply_mask(base, reserved, m)), m, apply_mask(base, reserved, m)) for m in range(8)]
_, best_mask, best = min(candidates, key=lambda x: x[0])
add_format(best, best_mask)
render(best)
print(f"wrote {OUT}")
