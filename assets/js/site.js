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

  /* hero: canvas no desktop, vídeo no toque, pôster parado com movimento reduzido */
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches;
  var cv = document.getElementById('tinta'), vd = document.getElementById('tinta-video');
  function video() {
    cv.remove(); vd.src = 'assets/video/tinta.mp4'; vd.load();
    var p = vd.play(); if (p && p.catch) p.catch(function () {});
    vd.addEventListener('playing', function () { vd.classList.add('tocando'); }, { once: true });
  }
  if (reduz) { cv.remove(); vd.remove(); }
  else if (fino && window.tintaHero) { vd.remove(); tintaHero(cv, function () { cv.remove(); }); requestAnimationFrame(function () { cv.classList.add('tocando'); }); }
  else video();
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
