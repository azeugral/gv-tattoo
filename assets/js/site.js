(function () {
  var WHATS = 'https://wa.me/message/CWVF7GXPBZ7ZL1';
  // [categoria, legenda] na ordem de tools/processar.py (assets/img/obras/NN.webp)
  var OBRAS = [
    ['ornamental', 'Ornamental no pé'], ['mandala', 'Mandala no antebraço'], ['ornamental', 'Peito, ornamental com floral'],
    ['floral', 'Peónia no ombro'], ['dark', 'Dark ornament no pescoço'], ['mandala', 'Mandala no cotovelo'],
    ['ornamental', 'Mão, ornamental e rosa'], ['floral', 'Olho e flores no antebraço'], ['ornamental', 'Ornamento de costas, já cicatrizado'],
    ['mandala', 'Ombro, mandala e peónia'], ['dark', 'Peito em duas sessões'], ['floral', 'Lírios a subir pelo braço'],
    ['ornamental', 'Par nos cotovelos'], ['mandala', 'Mandala no joelho'], ['dark', 'Ornamento com flor de lótus'],
    ['floral', 'Borboleta e flores'], ['ornamental', 'Costas inteiras'], ['mandala', 'Mandala atrás da orelha'],
    ['dark', 'Pescoço, quase seis horas'], ['floral', 'Lírio no joelho'], ['ornamental', 'Mão, ressignificar uma tattoo antiga'],
    ['mandala', 'Mandala geométrica no peito'], ['dark', 'Lettering dark no braço'], ['floral', 'Peónia'],
    ['ornamental', 'Ornamental no antebraço'], ['mandala', 'Dois joelhos'], ['dark', 'Dark ornament no braço'],
    ['floral', 'Sol e lua'], ['ornamental', 'Antebraço ornamental'], ['mandala', 'Mão, início de fechamento geométrico'],
    ['dark', 'Pescoço'], ['floral', 'Floral no antebraço'], ['floral', 'Buda e lótus'],
    ['mandala', 'Perna, quatro sessões'], ['floral', 'Carpa e lótus, oito horas'], ['floral', 'Orquídeas']
  ];
  var POR_VEZ = 12;

  /* menu do celular */
  var mb = document.getElementById('menu-botao'), menu = document.getElementById('menu');
  mb.addEventListener('click', function () { var a = document.body.classList.toggle('menu-aberto'); mb.setAttribute('aria-expanded', a); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { document.body.classList.remove('menu-aberto'); mb.setAttribute('aria-expanded', false); } });
  var topo = document.getElementById('topo');
  function rolou() { topo.classList.toggle('solido', window.scrollY > 40); }
  window.addEventListener('scroll', rolou, { passive: true }); rolou();

  /* hero: mandala da GV em pontos (WebGL no desktop, MP4 no toque, pôster parado com movimento reduzido) */
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toque = matchMedia('(hover: none), (pointer: coarse)').matches || innerWidth < 1001;
  var palco = document.getElementById('palco'), canvas = document.getElementById('mandala-canvas'), video = document.getElementById('mandala-video'), conta = document.getElementById('conta');
  var CORES = { tinta: '#121110', cinza: '#6f6a64', verm: '#8e1c1c' };
  function fmt(n) { return Math.round(n).toLocaleString('pt-PT'); }
  function usarVideo() {
    if (reduz) return;
    video.src = 'assets/video/mandala.mp4';
    video.addEventListener('playing', function () { palco.classList.add('em-video'); }, { once: true });
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) video.play().catch(function () {}); else video.pause(); }); }).observe(palco);
  }
  function usarWebGL(bin) {
    var T;
    try { T = pontosGL(canvas, bin, CORES); } catch (e) { T = null; }
    if (!T) return usarVideo();
    var visivel = true, t0 = null, tPausa = 0, rodando = false, raf;
    function medir() {
      var r = palco.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), w = Math.round(r.width * d);
      if (canvas.width !== w) { canvas.width = w; canvas.height = w; }
    }
    function quadro(agora) {
      if (t0 === null) t0 = agora - tPausa * 1000;
      var t = (agora - t0) / 1000, s = T.desenhar(t, 1, true);
      conta.textContent = fmt(Math.min(s.rev, 1) * T.n);
      if (visivel) raf = requestAnimationFrame(quadro); else { rodando = false; tPausa = t; t0 = null; }
    }
    function iniciar() { if (!rodando) { rodando = true; raf = requestAnimationFrame(quadro); } }
    medir();
    addEventListener('resize', function () { medir(); if (!rodando) T.desenhar(tPausa, 1, true); });
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); cancelAnimationFrame(raf); palco.classList.remove('ao-vivo'); conta.textContent = fmt(T.n); });
    new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) iniciar(); }).observe(palco);
    conta.textContent = '0'; palco.classList.add('ao-vivo'); iniciar();
  }
  if (reduz) { /* pôster parado */ }
  else if (toque) { addEventListener('load', usarVideo); }
  else {
    fetch('assets/pontos.bin').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(usarWebGL).catch(usarVideo);
  }
  requestAnimationFrame(function () { document.body.classList.add('pronto'); });

  /* trabalhos */
  var grade = document.getElementById('grade'), vm = document.getElementById('ver-mais'), filtro = 'todos', mostrando = POR_VEZ, lista = [];
  function montar() {
    lista = OBRAS.map(function (o, i) { return { i: i, cat: o[0], leg: o[1] }; }).filter(function (o) { return filtro === 'todos' || o.cat === filtro; });
    grade.innerHTML = lista.slice(0, mostrando).map(function (o, k) {
      var n = String(o.i + 1).padStart(2, '0');
      return '<li><button class="obra" data-k="' + k + '"><img src="assets/img/obras/' + n + '.webp" alt="' + o.leg + '" width="720" height="900" loading="lazy" draggable="false"></button><p>' + o.leg + '</p></li>';
    }).join('');
    vm.parentNode.hidden = mostrando >= lista.length;
  }
  document.querySelector('.filtros').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('ativo', x === b); });
    filtro = b.dataset.f; mostrando = POR_VEZ; montar();
  });
  vm.addEventListener('click', function () { mostrando += POR_VEZ; montar(); });
  montar();

  /* foto ampliada */
  var cx = document.getElementById('caixa'), ci = document.getElementById('caixa-img'), cl = document.getElementById('caixa-leg'), atual = 0;
  function abrir(k) {
    atual = (k + lista.length) % lista.length; var o = lista[atual];
    ci.src = 'assets/img/obras/' + String(o.i + 1).padStart(2, '0') + '.webp'; ci.alt = o.leg; cl.textContent = o.leg;
    if (cx.hidden) { cx.hidden = false; document.body.classList.add('travado'); document.getElementById('caixa-fechar').focus(); }
  }
  function fechar() { cx.hidden = true; document.body.classList.remove('travado'); }
  grade.addEventListener('click', function (e) { var b = e.target.closest('.obra'); if (b) abrir(+b.dataset.k); });
  document.getElementById('caixa-fechar').addEventListener('click', fechar);
  document.getElementById('caixa-ant').addEventListener('click', function () { abrir(atual - 1); });
  document.getElementById('caixa-seg').addEventListener('click', function () { abrir(atual + 1); });
  cx.addEventListener('click', function (e) { if (e.target === cx) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (cx.hidden) return;
    if (e.key === 'Escape') fechar(); else if (e.key === 'ArrowLeft') abrir(atual - 1); else if (e.key === 'ArrowRight') abrir(atual + 1);
  });
  var x0 = null;
  cx.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  cx.addEventListener('touchend', function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) abrir(atual + (d < 0 ? 1 : -1)); x0 = null; });

  /* entrada das secções */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.revela').forEach(function (el) { io.observe(el); });

  /* pedido: monta a mensagem, copia e abre o WhatsApp */
  var f = document.getElementById('pedido'), pv = document.getElementById('previa'), av = document.getElementById('aviso');
  function texto() {
    var d = new FormData(f), l = ['Olá GV! Vim pelo teu site e queria pedir um orçamento.', ''];
    function p(rot, v) { v = (v || '').trim(); if (v) l.push(rot + ': ' + v); }
    p('Nome', d.get('nome')); p('Zona do corpo', d.get('zona')); p('Tatuagens na zona', d.get('pele'));
    p('Tamanho', d.get('tamanho')); p('Ideia', d.get('ideia')); p('Disponibilidade', d.get('datas'));
    l.push('', 'Envio a seguir as fotos do local.');
    return l.join('\n');
  }
  function atualizar() { pv.textContent = texto(); }
  f.addEventListener('input', atualizar); f.addEventListener('change', atualizar); atualizar();
  function copiar(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove();
    return Promise.resolve();
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var janela = window.open(WHATS, '_blank');
    if (janela) janela.opener = null;
    copiar(texto()).then(function () { av.hidden = false; }, function () { av.textContent = 'Não consegui copiar: seleciona a mensagem acima e copia à mão.'; av.hidden = false; });
    if (!janela) location.href = WHATS;
  });
})();
