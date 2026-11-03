"""Gera as imagens do site a partir de _ref/ig (posts do Instagram).
Uso: python tools/processar.py   (--folha só monta _ref/conf-portfolio.jpg para conferir os recortes)"""
import os, sys
from PIL import Image, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
R = os.path.join(SITE, '..', '_ref'); A = os.path.join(SITE, 'assets', 'img')
FS = os.listdir(os.path.join(R, 'ig'))

# (post_foto, categoria, legenda, desvio vertical do recorte 0..1)
OBRAS = [
    ('002_3', 'ornamental', 'Ornamental no pé', .45),
    ('009_4', 'mandala', 'Mandala no antebraço', .45),
    ('067_2', 'ornamental', 'Peito, ornamental com floral', .5),
    ('025_2', 'floral', 'Peónia no ombro', .45),
    ('101_1v', 'dark', 'Dark ornament no pescoço', .4),
    ('031_2', 'mandala', 'Mandala no cotovelo', .5),
    ('063_1', 'ornamental', 'Mão, ornamental e rosa', .5),
    ('029_1', 'floral', 'Olho e flores no antebraço', .4),
    ('095_3', 'ornamental', 'Ornamento de costas, já cicatrizado', .5),
    ('011_1', 'mandala', 'Ombro, mandala e peónia', .45),
    ('059_1', 'dark', 'Peito em duas sessões', .5),
    ('047_1', 'floral', 'Lírios a subir pelo braço', .45),
    ('067_7', 'ornamental', 'Par nos cotovelos', .5),
    ('126_1', 'mandala', 'Mandala no joelho', .45),
    ('054_1', 'dark', 'Ornamento com flor de lótus', .45),
    ('060_1', 'floral', 'Borboleta e flores', .45),
    ('096_1', 'ornamental', 'Costas inteiras', .4),
    ('078_1', 'mandala', 'Mandala atrás da orelha', .5),
    ('114_1v', 'dark', 'Pescoço, quase seis horas', .35),
    ('039_1', 'floral', 'Lírio no joelho', .5),
    ('004_3', 'ornamental', 'Mão, ressignificar uma tattoo antiga', .5),
    ('105_1', 'mandala', 'Mandala geométrica no peito', .45),
    ('108_1', 'dark', 'Lettering dark no braço', .4),
    ('071_2', 'floral', 'Peónia', .45),
    ('066_1v', 'ornamental', 'Ornamental no antebraço', .5),
    ('100_1', 'mandala', 'Dois joelhos', .45),
    ('008_1v', 'dark', 'Dark ornament no braço', .5),
    ('046_1', 'floral', 'Sol e lua', .5),
    ('009_2', 'ornamental', 'Antebraço ornamental', .45),
    ('106_1', 'mandala', 'Mão, início de fechamento geométrico', .5),
    ('049_1v', 'dark', 'Pescoço', .4),
    ('079_1', 'floral', 'Floral no antebraço', .45),
    ('053_1', 'floral', 'Buda e lótus', .45),
    ('033_1', 'mandala', 'Perna, quatro sessões', .45),
    ('045_1', 'floral', 'Carpa e lótus, oito horas', .4),
    ('120_1', 'floral', 'Orquídeas', .5),
]
EXTRA = [  # (post_foto, nome, w, h, desvio)
    ('004_1', 'hero', 1600, 2000, .5),
    ('004_1', 'hero-m', 960, 1200, .5),
    ('027_1', 'sobre-1', 900, 1125, .3),
    ('012_1', 'sobre-2', 720, 900, .35),
    ('020_11', 'proc-desenho', 720, 900, .5),
    ('010_9', 'proc-decalque', 720, 900, .55),
    ('033_2', 'proc-sessao', 720, 900, .5),
]

def foto(k):
    n, s = k.split('_')
    return os.path.join(R, 'ig', next(x for x in FS if x.startswith(n + '_') and x.endswith('_' + s + '.jpg')))

def recortar(k, w, h, dy=.5):
    im = ImageOps.exif_transpose(Image.open(foto(k))).convert('RGB')
    return ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(.5, dy))

def salvar(im, nome, q=80):
    p = os.path.join(A, nome); os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, 'WEBP', quality=q, method=6)

def main():
    if '--folha' in sys.argv:
        ims = [recortar(k, 200, 250, dy) for k, _c, _l, dy in OBRAS]
        f = Image.new('RGB', (200 * 9, 250 * ((len(ims) + 8) // 9)), 'white')
        for i, im in enumerate(ims): f.paste(im, ((i % 9) * 200, (i // 9) * 250))
        f.save(os.path.join(R, 'conf-portfolio.jpg'), quality=85); return
    for i, (k, *_r, dy) in enumerate(OBRAS):
        salvar(recortar(k, 720, 900, dy), f'obras/{i + 1:02d}.webp')
    for k, nome, w, h, dy in EXTRA:
        salvar(recortar(k, w, h, dy), nome + '.webp', 84 if nome.startswith('hero') else 80)
    # og: foto do hero à direita, cetim à esquerda (o texto entra em tools/og.py se precisar)
    print(len(OBRAS), 'obras')

if __name__ == '__main__':
    main()
