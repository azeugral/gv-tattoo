# GV Tattoo · Ornamental em Lisboa

Prévia de site feita pelo LRGZ para a GV ([@_gvtattoo](https://instagram.com/_gvtattoo)), tatuadora brasileira de ornamental e projetos personalizados que atende no Artfakt Tattoo ([@artfakt.tattoo](https://instagram.com/artfakt.tattoo)), em Lisboa.

Endereço da prévia: https://azeugral.github.io/gv-tattoo/ (com `noindex` e `robots.txt` bloqueando tudo até ela aprovar). Texto em português de Portugal, tratando por "tu".

## Como está montado

- **Identidade:** tirada das fotos dela, sempre tatuagem preta sobre cetim branco. Cetim `#eeece8`, tinta `#121110` e um vermelho `#8e1c1c` só em detalhes (os pontinhos vermelhos dos ornamentais dela). Títulos em Rozha One, texto em Schibsted Grotesk. A estrela ✦ é a mesma da bio.
- **Hero:** foto do ornamental na mão (post de 22/09/2026) em tela cheia, com nanquim a diluir por cima em shader (`assets/js/tinta.js`). No desktop roda ao vivo (DPR até 2, baixa sozinho se ficar lento, pausa fora da tela). No celular e no tablet entra `assets/video/tinta.mp4` com `multiply`. Com movimento reduzido fica só a foto. O tempo do shader anda em círculo, então o vídeo fecha o laço sem corte nem fade.
- **Seções:** trabalhos (36 peças em grade 4:5 com filtro e foto ampliada), como nasce um projeto (desenho, decalque, sessões), a GV, estúdio e pedido de orçamento.
- **Pedido:** o formulário monta a mensagem, copia para a área de transferência e abre o link do WhatsApp da bio (`wa.me/message/CWVF7GXPBZ7ZL1`). Esse tipo de link não aceita texto pronto, por isso a mensagem é copiada para ela colar. Com o número em mãos, dá para trocar por `wa.me/<número>?text=` e a mensagem já entra escrita.

## Ferramentas (`tools/`)

| Arquivo | Faz |
|---|---|
| `processar.py` | Recorta as fotos do Instagram (`../_ref/ig`) para `assets/img` (`--folha` gera a folha de conferência) |
| `gerar_video.py` | Renderiza o MP4 do hero no Edge headless (`--teste` só grava quadros em `../_ref/hero`) |
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
8. **Guests e viagens:** o site cita só o guest em Leiria (Barão Tattoo Studio, agosto de 2025). Os destaques Portugal, Trindade, Marbella e RIO não foram lidos (a API devolveu erro 500).
9. **Cuidados e sinal:** não há política de sinal, cancelamento nem cuidados escritos no perfil. Se ela tiver, entram no pedido.
10. **Domínio:** a definir. Ao trocar, ajustar `og:image`/`og:url` no `index.html` e tirar o `noindex` e o `robots.txt`.
11. **Cache:** CSS e JS usam `?v=1`. Ao mudar, subir o número no `index.html`.

---

Site por L R G Z
