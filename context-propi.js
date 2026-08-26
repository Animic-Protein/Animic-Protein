(() => {
  'use strict';

  const main = document.querySelector('main');
  if (!main || document.getElementById('context-propi')) return;

  const METAB_KEY='animic-protein-metabolism-v1';
  const readMetabolism=()=>{try{const v=JSON.parse(localStorage.getItem(METAB_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};

  const section = document.createElement('section');
  section.className = 'panel';
  section.id = 'context-propi';
  section.innerHTML = `
    <div>
      <p class="kicker">Context propi · Relacions transformadores</p>
      <h2>No busquem perfils. Busquem diferències capaces de relacionar-se.</h2>
    </div>
    <div class="cards">
      <article>
        <h3>Principi d’Entrada Oberta</h3>
        <p>Anímic Protein no selecciona per professió, estatus, disciplina o categoria. Pot entrar qualsevol persona capaç de crear, observar, qüestionar o transformar.</p>
      </article>
      <article>
        <h3>Principi de Relació Transformadora</h3>
        <p>Una relació només és viva si cap de les parts en surt exactament igual. La trobada no encaixa algú dins una estructura prèvia: permet que la trobada alteri l’estructura mateixa.</p>
      </article>
      <article>
        <h3>Condició</h3>
        <p>No cal ser músic. Cal voler esdevenir-se sense exigir que l’altre deixi de ser. Arquitecte, rellotger, mestre xocolater, pagès, politòleg, cineasta, pime, persona rica o pobra, persona amb discapacitat o fins i tot una alteritat radical: el valor és la diferència capaç d’entrar en relació.</p>
      </article>
      <article>
        <h3>Cadena viva</h3>
        <p><strong>AMO: VOLO UT SIS → INTER NOS → MUTATIO → CONTINUUM.</strong></p>
        <p>No t’incorporis a l’organisme. Modifica’l.</p>
      </article>
      <article>
        <h3>Llei de Metabolització</h3>
        <p>El Còdex no incorpora res sense transformar-ho ni permet que una transformació desaparegui sense deixar rastre. Cada entrada produeix conseqüències sobre l’organisme, i aquestes conseqüències poden modificar al seu torn les regles amb què el Còdex continuarà transformant-se.</p>
      </article>
      <article>
        <h3>Algoritme constitucional viu</h3>
        <p><strong>ENTRADA → RELACIÓ → MUTACIÓ → CONSEQÜÈNCIA → MEMÒRIA → METABOLITZACIÓ → NOVA LLEI POSSIBLE.</strong></p>
        <p>Les lleis governen el Còdex, però l’experiència del Còdex pot obligar les seves pròpies lleis a evolucionar. La memòria, la traçabilitat i la reversibilitat eviten que MUTATIO es converteixi en amnèsia.</p>
      </article>
      <article>
        <h3>Llei de No-neutralitat</h3>
        <p>Cap entrada és innocent: tota relació modifica alguna proporció de l’organisme, encara que el resultat sigui una negativa, una pausa o un retorn al compost. Si no hi ha cap diferència perceptible, encara no hi ha hagut metabolització.</p>
      </article>
      <article>
        <h3>Llei de Conseqüència</h3>
        <p>Tota mutació ha de poder respondre tres preguntes: què ha canviat, què ha fet possible i què ha impedit. Una idea no es considera viva només perquè sigui nova, sinó perquè produeix conseqüències llegibles.</p>
      </article>
      <article>
        <h3>Homeòstasi / MUTATIO</h3>
        <p>El Còdex necessita conservar prou estructura per continuar sent recognoscible i prou inestabilitat per no convertir-se en monument. L’homeòstasi protegeix la identitat; MUTATIO protegeix la vida.</p>
      </article>
      <article>
        <h3>Dret al Compost</h3>
        <p>No tota idea ha de sobreviure com a forma activa. Una idea pot retirar-se sense ser esborrada: el compost conserva la seva energia, el seu rastre i la possibilitat d’una futura reaparició transformada.</p>
      </article>
      <article>
        <h3>Mutació de segon ordre</h3>
        <p>Quan una experiència no només modifica una peça sinó també la regla que decideix com modifiquem les peces, el Còdex ha produït una mutació de segon ordre. Aquesta és la seva forma més profunda d’aprenentatge.</p>
      </article>
      <article>
        <h3>Criteri de nova llei</h3>
        <p>Una nova llei només mereix existir si explica millor una conseqüència real, redueix una contradicció o obre una possibilitat que abans era impossible sense destruir la memòria del sistema.</p>
      </article>
    </div>
    <div class="inscription" style="margin-top:1rem">
      <blockquote>“No importa què ets. Importa què pot esdevenir la relació.”</blockquote>
      <p>La pregunta no és «com integrem aquesta persona en Anímic Protein?», sinó «en què es converteix Anímic Protein després que aquesta persona hi entri?»</p>
    </div>
    <div class="inscription metabolic-pulse" style="margin-top:1rem">
      <p class="kicker">Puls metabòlic</p>
      <blockquote class="metabolic-count">El Còdex encara no ha registrat cap metabolització local en aquest dispositiu.</blockquote>
      <p>El comptador no mesura valor: només confirma que l’organisme ha deixat rastre d’una transformació.</p>
    </div>
  `;

  const renderPulse=()=>{
    const target=section.querySelector('.metabolic-count');
    if(!target)return;
    const history=readMetabolism();
    const n=history.length;
    target.textContent=n===0
      ? 'El Còdex encara no ha registrat cap metabolització local en aquest dispositiu.'
      : `Metabolitzacions registrades localment: ${n}. L’organisme ja conserva rastre de les seves transformacions.`;
  };

  window.addEventListener('animic:metabolized',renderPulse);
  window.addEventListener('storage',renderPulse);
  renderPulse();

  const anchor = document.getElementById('cicle') || document.getElementById('cambres') || main.lastElementChild;
  if (anchor?.parentNode === main) main.insertBefore(section, anchor);
  else main.appendChild(section);
})();
