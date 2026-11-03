/* Nanquim a diluir na água: nuvem de tinta com fios finos, por ruído torcido.
   O tempo anda em círculo (PERIODO s), então o vídeo do celular fecha o laço sem emenda.
   modo 1 = desktop (tinta na costura entre o texto e a foto); modo 0 = retrato (faixa por baixo da foto).
   fundo: null = transparente (canvas por cima da página); [r,g,b] = pinta o fundo (vídeo). */
(function () {
  var PERIODO = 28;
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uT;uniform float uModo;uniform vec4 uFundo;',
    'vec2 h(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);',
    ' return mix(mix(dot(h(i),f),dot(h(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h(i+vec2(0,1)),f-vec2(0,1)),dot(h(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float a=.5,s=0.;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){s+=a*n(p);p=m*p;a*=.5;}return s;}',
    'float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;',
    ' vec2 p=vec2(uv.x*asp,uv.y)*(uModo>.5?1.35:1.9);',
    ' float a=6.2831853*uT/' + PERIODO.toFixed(1) + ';vec2 c=vec2(cos(a),sin(a));',
    ' vec2 q=vec2(fbm(p+.55*c),fbm(p+vec2(5.2,1.3)-.45*c.yx));',
    ' vec2 r=vec2(fbm(p+3.2*q+vec2(1.7,9.2)+.35*c),fbm(p+3.2*q+vec2(8.3,2.8)-.3*c.yx));',
    ' float f=fbm(p+2.8*r);',
    ' float corpo=smoothstep(.16,.34,f+.2*length(q));float miolo=smoothstep(.3,.55,f+.2*length(q));',
    ' float fio=1.-smoothstep(0.,.028,abs(fbm(p*1.25+1.8*r+.2*c)));',
    ' float veu=smoothstep(-.05,.3,f)*.1;',
    ' float d=max(corpo*(.62+.38*miolo),fio*.7*smoothstep(-.05,.2,f))+veu*(1.-corpo);',
    ' float m;',
    ' if(uModo>.5){',
    '  float costura=exp(-pow((uv.x-.5)/.13,2.));',
    '  float base=smoothstep(.42,0.,uv.y)*smoothstep(.15,.5,uv.x)*.8;',
    '  float topo=smoothstep(.7,1.,uv.y)*smoothstep(.55,.95,uv.x)*.55;',
    '  m=max(max(costura*.95,base),topo)*(1.-smoothstep(.36,.06,uv.x)*.85);',
    ' }else{',
    '  float faixa=exp(-pow((uv.y-.43)/.12,2.));',
    '  m=max(faixa,smoothstep(.62,1.,uv.y)*.35)*(.75+.25*smoothstep(0.,.5,abs(uv.x-.5)));',
    ' }',
    ' float al=clamp(d*m,0.,1.)*.86;',
    ' al=clamp(al+(ign(gl_FragCoord.xy)-.5)/255.,0.,1.);',
    ' vec3 tinta=mix(vec3(.16,.15,.14),vec3(.045,.04,.04),smoothstep(.2,.8,al));',
    ' if(uFundo.a>.5) gl_FragColor=vec4(mix(uFundo.rgb,tinta,al),1.);',
    ' else gl_FragColor=vec4(tinta*al,al);',
    '}'
  ].join('\n');

  function tintaGL(cv, o) {
    o = o || {};
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: !!o.preserveDrawingBuffer });
    if (!gl) return null;
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(x); return x; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uRes', 'uT', 'uModo', 'uFundo'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    var fundo = o.fundo ? o.fundo.concat([1]) : [0, 0, 0, 0];
    return {
      ciclo: PERIODO,
      desenhar: function (t, modo) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uT, t); gl.uniform1f(U.uModo, modo);
        gl.uniform4f(U.uFundo, fundo[0], fundo[1], fundo[2], fundo[3]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  }
  window.tintaGL = tintaGL;

  /* Liga o canvas do hero: DPR até 2, baixa a resolução se o quadro passar de 22 ms, pausa fora da tela. */
  window.tintaHero = function (cv, aoFalhar) {
    var T = tintaGL(cv); if (!T) { aoFalhar(); return; }
    var esc = Math.min(window.devicePixelRatio || 1, 2), vis = true, t0 = performance.now(), lento = 0, ult = 0;
    function medir() { var r = cv.getBoundingClientRect(); cv.width = Math.round(r.width * esc); cv.height = Math.round(r.height * esc); T.desenhar((performance.now() - t0) / 1000, 1); }
    medir(); window.addEventListener('resize', medir);
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); vis = false; aoFalhar(); });
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) requestAnimationFrame(q); }).observe(cv);
    function q(now) {
      if (!vis) return;
      if (ult && now - ult > 22 && ++lento > 40 && esc > .75) { esc = Math.max(.75, esc - .35); lento = 0; medir(); }
      ult = now; T.desenhar((now - t0) / 1000, 1); requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  };
})();
