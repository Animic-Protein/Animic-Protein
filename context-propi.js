(() => {
  'use strict';

  const main = document.querySelector('main');
  if (!main || document.getElementById('context-propi')) return;

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
    </div>
    <div class="inscription" style="margin-top:1rem">
      <blockquote>“No importa què ets. Importa què pot esdevenir la relació.”</blockquote>
      <p>La pregunta no és «com integrem aquesta persona en Anímic Protein?», sinó «en què es converteix Anímic Protein després que aquesta persona hi entri?»</p>
    </div>
  `;

  const anchor = document.getElementById('cicle') || document.getElementById('cambres') || main.lastElementChild;
  if (anchor?.parentNode === main) main.insertBefore(section, anchor);
  else main.appendChild(section);
})();
