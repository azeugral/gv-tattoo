# GV Tattoo · Ornamental em Lisboa

Prévia de site feita pelo LRGZ para a GV ([@_gvtattoo](https://instagram.com/_gvtattoo)), tatuadora brasileira de ornamental e projetos personalizados que atende no Artfakt Tattoo ([@artfakt.tattoo](https://instagram.com/artfakt.tattoo)), em Lisboa.

Endereço da prévia: https://azeugral.github.io/gv-tattoo/ (com `noindex` e `robots.txt` bloqueando tudo até ela aprovar). Texto em português de Portugal, tratando por "tu".

## Como está montado

- **Identidade:** tirada das fotos dela, sempre tatuagem preta sobre cetim branco. Cetim `#eeece8`, tinta `#121110` e um vermelho `#8e1c1c` só em detalhes (os pontinhos vermelhos dos ornamentais dela). Títulos em Rozha One, texto em Schibsted Grotesk. A estrela ✦ é a mesma da bio.
- **Hero:** a "primeira mandalinha geométrica feita à mão" do destaque Art's dela (caderno de 2023, `../_ref/hl/arts/arts_05.jpg`) refeita em 26 000 pontos que se formam em espiral, anel por anel, e depois giram meia pétala e assentam de novo (mesmo motor do site da Ana Dias, `assets/js/pontos.js`). **Ao entrar no site** a mandala forma-se no próprio hero em 4,2 s, com o contador a correr, e segue em laço. No desktop tudo roda ao vivo em WebGL; no celular a formação é `assets/video/abertura.mp4` (0,24 MB), que emenda no laço. No celular e no tablet entra `assets/video/mandala.mp4` (laço sem emenda). Com movimento reduzido fica o pôster `assets/img/mandala-a.webp`.
- **Seções:** trabalhos (36 peças em grade 4:5 com filtro e foto ampliada), como nasce um projeto (desenho, decalque, sessões), a GV, estúdio e pedido de orçamento.
- **Pedido:** o formulário monta a mensagem, copia para a área de transferência e abre o link do WhatsApp da bio (`wa.me/message/CWVF7GXPBZ7ZL1`). Esse tipo de link não aceita texto pronto, por isso a mensagem é copiada para ela colar. Com o número em mãos, dá para trocar por `wa.me/<número>?text=` e a mensagem já entra escrita.

## Ferramentas (`tools/`)

| Arquivo | Faz |
|---|---|
| `processar.py` | Recorta as fotos do Instagram (`../_ref/ig`) para `assets/img` (`--folha` gera a folha de conferência) |
| `mandalas.py` | Transforma a foto da mandala em `assets/pontos.bin` (retifica a perspectiva do caderno, centra pela simetria e pontilha por Lloyd ponderado) |
| `gerar_video.py` | Renderiza `mandala.mp4`, `abertura.mp4` e os pôsteres `mandala-a/b.webp` no Edge headless (`--teste` só grava quadros em `../_ref/hero`) |
| `og.py` | `og.jpg` e `apple-touch-icon.png` |

O material bruto (205 posts, 578 fotos, `dados.json` com legendas, folhas de contato) fica fora do repo, em `../_ref/`.

## CONFIRMAR antes de publicar de verdade

1. **Nome:** o site usa só "GV". Confirmar o nome completo e se ela quer que apareça.
2. **WhatsApp:** o link da bio não mostra o número. Pedir o número (+351?) para a mensagem entrar já escrita.
3. **Estúdio:** o Artfakt aparece como @artfakt.tattoo, @artfakt.studios e @artfakt.lisbon. A localização de um post diz Alcântara. Confirmar morada, nome oficial e se pode mostrar no mapa.
4. **Datas:** "a tatuar desde 2021" (em março de 2023 ela escreveu "2 anos de tattoo") e "Lisboa desde fevereiro de 2026" (post de 18/03/2026: "1 mês da maior mudança").
5. **Números:** 285 sessões em 2024 (post de 19/12/2024) e fechamento de braço em 12 sessões (post de 02/10/2024).
6. **Fotos de clientes:** todas saíram do feed dela. Confirmar se pode usar todas no site.
7. **Prémio:** em 2021 ela trouxe um troféu de convenção e há um selo "GV Tattoo revelação" num post de 2025. Falta saber qual convenção e ano para pôr no site.
8. **Guests e viagens:** o site cita só o guest em Leiria (Barão Tattoo Studio, agosto de 2025). Os destaques Portugal, Trindade, Marbella e RIO não foram lidos. O destaque Art's foi aberto (de lá veio a mandala do hero), então a visualização de @lrgz.sites aparece para ela.
9. **Cuidados e sinal:** não há política de sinal, cancelamento nem cuidados escritos no perfil. Se ela tiver, entram no pedido.
10. **Domínio:** a definir. Ao trocar, ajustar `og:image`/`og:url` no `index.html` e tirar o `noindex` e o `robots.txt`.
11. **Cache:** CSS usa `?v=5`, `site.js` `?v=4`, `pontos.js` `?v=2` e og `?v=2`. Ao mudar, subir o número no `index.html`.

---

Site por L R G Z
