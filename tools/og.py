"""og.jpg (1200x630, prévia do link) e apple-touch-icon.png. Fonte Rozha One em ../_ref.
Uso: python tools/og.py"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
FONTE = os.path.join(SITE, '..', '_ref', 'RozhaOne-Regular.ttf')
CETIM, TINTA, GRAF, SANGUE = (238, 236, 232), (18, 17, 16), (74, 71, 67), (142, 28, 28)

def estrela(d, cx, cy, r, cor):
    pts = []
    import math
    for i in range(64):
        a = i / 64 * 2 * math.pi; k = abs(math.cos(a)) ** 3 + abs(math.sin(a)) ** 3
        rr = r * (1 - .82 * (1 - max(abs(math.cos(a)), abs(math.sin(a))) ** 6))
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=cor)

def main():
    og = Image.new('RGB', (1200, 630), CETIM)
    foto = ImageOps.fit(Image.open(os.path.join(SITE, 'assets', 'img', 'hero.webp')).convert('RGB'), (640, 630), centering=(.5, .45))
    m = Image.linear_gradient('L').rotate(90).resize((640, 630))   # transparente à esquerda
    m = m.point(lambda v: min(255, v * 3))
    og.paste(foto, (560, 0), m)
    d = ImageDraw.Draw(og)
    f1 = ImageFont.truetype(FONTE, 78); f2 = ImageFont.truetype('arialbd.ttf', 22); f3 = ImageFont.truetype('arial.ttf', 26)
    d.text((80, 120), 'TATUADORA EM LISBOA', font=f2, fill=GRAF)
    estrela(d, 58, 132, 7, SANGUE)
    y = 170
    for l in ('Ornamental', 'desenhado para', 'o teu corpo.'):
        d.text((66, y), l, font=f1, fill=TINTA); y += 92
    d.text((70, 480), 'GV Tattoo  ·  Artfakt Tattoo, Lisboa', font=f3, fill=GRAF)
    og.save(os.path.join(SITE, 'og.jpg'), quality=86)
    ic = Image.new('RGB', (180, 180), TINTA); estrela(ImageDraw.Draw(ic), 90, 90, 62, CETIM)
    ic.save(os.path.join(SITE, 'apple-touch-icon.png'))

if __name__ == '__main__':
    main()
