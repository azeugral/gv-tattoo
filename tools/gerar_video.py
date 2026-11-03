"""Renderiza a tinta do hero (assets/js/tinta.js) num Edge headless:
- assets/video/tinta.mp4: laço sem emenda do modo retrato (720x1280, fundo branco; no CSS entra com multiply);
- --teste: só grava quadros em _ref/hero/ (desktop 1440x900 sobre o cetim e retrato 720x1280).
Uso: python tools/gerar_video.py [--teste]"""
import os, subprocess, sys
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
VID = os.path.join(SITE, 'assets', 'video'); CONF = os.path.join(SITE, '..', '_ref', 'hero')
FPS = 30

def pagina(p, w, h, fundo):
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': w, 'height': h})
    pg.set_content(f'<body style="margin:0;background:#eeece8"><canvas id="c" width="{w}" height="{h}" style="display:block"></canvas></body>')
    pg.add_script_tag(path=os.path.join(SITE, 'assets', 'js', 'tinta.js'))
    pg.evaluate(f"window.T = tintaGL(document.getElementById('c'), {{preserveDrawingBuffer: true, fundo: {fundo}}})")
    return b, pg

def main():
    os.makedirs(VID, exist_ok=True); os.makedirs(CONF, exist_ok=True)
    with sync_playwright() as p:
        if '--teste' in sys.argv:
            b, pg = pagina(p, 1440, 900, 'null')
            for t in (0, 9, 18):
                pg.evaluate(f'T.desenhar({t}, 1)'); pg.screenshot(path=os.path.join(CONF, f'desk-{t}.png'))
            b.close()
            b, pg = pagina(p, 720, 1280, '[1,1,1]')
            for t in (0, 14):
                pg.evaluate(f'T.desenhar({t}, 0)'); pg.screenshot(path=os.path.join(CONF, f'cel-{t}.png'))
            b.close(); return
        b, pg = pagina(p, 720, 1280, '[1,1,1]')
        ciclo = pg.evaluate('T.ciclo'); mp4 = os.path.join(VID, 'tinta.mp4')
        enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
        q = round(ciclo * FPS)
        for i in range(q):
            pg.evaluate(f'T.desenhar({i / FPS}, 0)'); enc.stdin.write(pg.screenshot(type='png'))
        enc.stdin.close(); enc.wait(); b.close()
        print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB', q, 'quadros')

if __name__ == '__main__':
    main()
