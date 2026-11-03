"""Transforma a mandala do destaque Art's da GV ("Primeira mandalinha geométrica feita à mão", caderno de 2023)
em pontos para o hero (assets/js/pontos.js, o mesmo motor do site da Ana Dias).

Passos: recorte -> elipse da perspectiva do caderno vira círculo -> mapa de tinta contínuo (o desenho já é pontilhado)
-> simetria rotacional (média das N rotações, limpa sombra e papel torto) -> pontilhismo por Lloyd ponderado
(Secord 2002) -> ordem de aparição em espiral, anel por anel.
A segunda "mandala" do laço é a mesma girada meia pétala: os pontos rodam e assentam de novo no desenho dela.

Saída: assets/pontos.bin (Int16: 2 x N x [x, y, tom, ordem]; x, y, ordem em /32767) + _ref/hero/*.png de conferência.
Uso: python tools/mandalas.py"""
import os
import numpy as np, cv2
from scipy.spatial import cKDTree

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
REF = os.path.join(SITE, '..', '_ref'); CONF = os.path.join(REF, 'hero'); os.makedirs(CONF, exist_ok=True)
ARQ = os.path.join(REF, 'hl', 'arts', 'arts_05.jpg')
RECORTE = (100, 390, 610, 880)
N = 26000
PETALAS = 8        # 8 pétalas escuras + 8 claras entre elas (a busca automática errava pela perspectiva)
S = 900

def retificar(img):
    """Acha a elipse da mandala (caderno em perspectiva) e devolve um quadrado SxS com ela redonda e centrada."""
    L = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)[..., 0].astype(float)
    papel = cv2.GaussianBlur(L, (0, 0), 25)
    tinta = ((papel - L) > 18).astype(np.uint8) * 255
    tinta = cv2.morphologyEx(tinta, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    h0, w0 = L.shape
    yy, xx = np.mgrid[:h0, :w0]
    tinta[np.hypot(xx - w0 / 2, yy - h0 / 2) > min(w0, h0) * .5] = 0
    tinta = cv2.morphologyEx(tinta, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    cs, _ = cv2.findContours(tinta, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = np.vstack(sorted(cs, key=cv2.contourArea)[-40:])
    (cx, cy), (w, h), ang = cv2.fitEllipse(cv2.convexHull(c))
    t = np.deg2rad(ang)
    R = np.array([[np.cos(t), np.sin(t)], [-np.sin(t), np.cos(t)]])
    M = R.T @ np.diag([S * .94 / w, S * .94 / h]) @ R
    off = np.array([S / 2, S / 2]) - M @ np.array([cx, cy])
    return cv2.warpAffine(img, np.hstack([M, off[:, None]]), (S, S), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

def tinta(img):
    """Escuro 0..1 relativo ao papel local (tira a sombra do caderno); o pontilhado vira tom pelo desfoque."""
    L = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)[..., 0].astype(float) / 255
    papel = cv2.dilate(cv2.GaussianBlur(L, (0, 0), 6), np.ones((31, 31), np.uint8))
    papel = cv2.GaussianBlur(papel, (0, 0), 20)
    esc = np.clip((papel - L) / .55, 0, 1)
    return cv2.GaussianBlur(esc, (0, 0), 2.2)

def centrar(m, n):
    """Afina centro e achatamento: busca o deslocamento e a escala por eixo que mais deixam a mandala igual
    a si mesma girada 360/n (o affine da elipse não acerta a perspectiva toda)."""
    b = cv2.resize(cv2.GaussianBlur(m, (0, 0), 3), (S // 3, S // 3))
    s3 = S // 3
    def nota(M):
        w = cv2.warpAffine(b, M, (s3, s3))
        R = cv2.getRotationMatrix2D((s3 / 2, s3 / 2), 360 / n, 1)
        return np.corrcoef(w.ravel(), cv2.warpAffine(w, R, (s3, s3)).ravel())[0, 1]
    def afim(dx, dy, sx, ang):
        t = np.deg2rad(ang); Rt = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
        A = Rt @ np.diag([sx, 1 / sx]) @ Rt.T
        c = np.array([s3 / 2, s3 / 2]); off = c - A @ (c + np.array([dx, dy]))
        return np.hstack([A, off[:, None]])
    melhor = (-1, 0, 0, 1, 0)
    for dx in range(-12, 13, 2):
        for dy in range(-12, 13, 2):
            v = nota(afim(dx, dy, 1, 0))
            if v > melhor[0]: melhor = (v, dx, dy, 1, 0)
    _, dx, dy, _, _ = melhor
    for sx in np.linspace(.86, 1.14, 15):
        for ang in range(0, 180, 15):
            for ddx in (-1, 0, 1):
                for ddy in (-1, 0, 1):
                    v = nota(afim(dx + ddx, dy + ddy, sx, ang))
                    if v > melhor[0]: melhor = (v, dx + ddx, dy + ddy, sx, ang)
    v, dx, dy, sx, ang = melhor
    print('centro', dx * 3, dy * 3, 'achatamento', round(sx, 3), ang, 'nota', round(v, 3))
    M = afim(dx * 3, dy * 3, sx, ang); M[:, 2] *= 1  # mesma afim em escala cheia
    t = np.deg2rad(ang); Rt = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
    A = Rt @ np.diag([sx, 1 / sx]) @ Rt.T
    c = np.array([S / 2, S / 2]); off = c - A @ (c + np.array([dx * 3, dy * 3]))
    return cv2.warpAffine(m, np.hstack([A, off[:, None]]), (S, S), flags=cv2.INTER_LINEAR)

def simetrizar(m, n):
    acc = np.zeros_like(m)
    for k in range(n):
        R = cv2.getRotationMatrix2D((S / 2, S / 2), 360 * k / n, 1)
        acc += cv2.warpAffine(m, R, (S, S), flags=cv2.INTER_LINEAR)
    return acc / n

def achar_simetria(m):
    sc = {}
    for n in range(4, 25):
        R = cv2.getRotationMatrix2D((S / 2, S / 2), 360 / n, 1)
        sc[n] = np.corrcoef(m.ravel(), cv2.warpAffine(m, R, (S, S)).ravel())[0, 1]
    top = max(sc.values())
    return max(n for n, v in sc.items() if v > top - .03), sc

def pontilhar(dens, n, iters=36, seed=7):
    rng = np.random.default_rng(seed)
    ys, xs = np.nonzero(dens > .02)
    w = dens[ys, xs]
    idx = rng.choice(len(xs), n, p=w / w.sum())
    pts = np.stack([xs[idx], ys[idx]], 1).astype(float) + rng.random((n, 2)) - .5
    pix = np.stack([xs, ys], 1).astype(float)
    for _ in range(iters):
        _, lab = cKDTree(pts).query(pix, workers=-1)
        sw = np.bincount(lab, w, n)
        sx = np.bincount(lab, w * pix[:, 0], n); sy = np.bincount(lab, w * pix[:, 1], n)
        ok = sw > 0
        pts[ok, 0] = sx[ok] / sw[ok]; pts[ok, 1] = sy[ok] / sw[ok]
    return pts

def empacotar(dx, dy, tom, seed):
    rr = np.hypot(dx, dy); th = (np.arctan2(dy, dx) / (2 * np.pi)) % 1
    chave = np.floor(rr * 14) + th + np.random.default_rng(seed).random(len(dx)) * .35
    ordem = np.argsort(np.argsort(chave)) / (len(dx) - 1)
    o = np.lexsort((th, rr))      # a troca leva cada ponto ao "mesmo anel" na outra
    return np.stack([dx, dy, tom, ordem], 1)[o].astype(np.float32)

def main():
    x0, y0, x1, y1 = RECORTE
    q = retificar(cv2.imread(ARQ)[y0:y1, x0:x1])
    esc = tinta(q)
    n = PETALAS
    esc = centrar(esc, n)
    dens = esc.copy()    # sem média de rotações: o desenho é à mão e a média borrava os traços
    r = np.hypot(*np.meshgrid(np.arange(S) - S / 2, np.arange(S) - S / 2))
    dens[r > S * .485] = 0
    dens = np.clip((dens - .04) / .5, 0, 1) ** 1.1
    pts = pontilhar(dens, N, seed=11)
    xi = np.clip(pts[:, 0].round().astype(int), 0, S - 1); yi = np.clip(pts[:, 1].round().astype(int), 0, S - 1)
    tom = np.where(dens[yi, xi] < .55, 1, 0).astype(float)          # 0 preto, 1 cinza (pétalas claras)
    dx = (pts[:, 0] - S / 2) / (S / 2); dy = (pts[:, 1] - S / 2) / (S / 2)
    a = np.pi / n                                                       # meia pétala
    bx, by = dx * np.cos(a) - dy * np.sin(a), dx * np.sin(a) + dy * np.cos(a)
    A = empacotar(dx, dy, tom, 1); B = empacotar(bx, by, tom, 1)
    cv2.imwrite(os.path.join(CONF, 'retificada.png'), q)
    cv2.imwrite(os.path.join(CONF, 'densidade.png'), (255 - dens * 255).astype(np.uint8))
    prev = np.full((S, S, 3), 236, np.uint8)
    for (x, y), t in zip(pts, tom):
        cv2.circle(prev, (int(x), int(y)), 1, (20, 18, 18) if t == 0 else (110, 110, 112), -1, cv2.LINE_AA)
    cv2.imwrite(os.path.join(CONF, 'pontos.png'), prev)
    print('tons', np.bincount(tom.astype(int), minlength=2))
    out = os.path.join(SITE, 'assets', 'pontos.bin')
    np.round(np.concatenate([A, B]) * np.array([32767, 32767, 1, 32767])).astype('<i2').tofile(out)
    print(out, round(os.path.getsize(out) / 1e6, 2), 'MB')

if __name__ == '__main__':
    main()
