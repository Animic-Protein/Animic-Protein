(() => {
  'use strict';

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='radices-brodsky.css';
  document.head.appendChild(css);

  const TARGETS=new Set(['brodsky-creativitat','brodsky-avorriment','creativitum-nunc-pacevem','temps-nu']);
  const fertile=[
    'Des de dins, crear és sostenir incertesa i inseguretat.',
    'La perícia prepara l’encontre, però no garanteix l’esdeveniment.',
    'Dir «faig» evita proclamar abans d’hora què mereixerà ser reconegut com a creació.',
    'L’atzar pot ser una causalitat que el nostre sistema encara no sap llegir.',
    'La matèria, la llengua i el temps també actuen i desvien la intenció.',
    'La forma fèrtil pot conduir l’autor a un lloc que no havia previst.'
  ];

  const ensurePanel=()=>{
    const panel=document.getElementById('node-panel');
    if(!panel)return null;
    let box=panel.querySelector('.brodsky-radix-panel');
    if(!box){box=document.createElement('section');box.className='brodsky-radix-panel';panel.appendChild(box)}
    return box;
  };

  const el=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text)node.textContent=text;
    return node;
  };

  const sourceLink=()=>{
    const link=el('a','brodsky-source-link','Obrir la fitxa de procedència');
    link.href='./arrels/joseph-brodsky-creativitat.md';
    link.target='_blank';
    link.rel='noopener';
    return link;
  };

  const boredomSourceLink=()=>{
    const link=el('a','brodsky-source-link','Obrir la fitxa de procedència');
    link.href='./arrels/joseph-brodsky-elogi-avorriment.md';
    link.target='_blank';
    link.rel='noopener';
    return link;
  };

  const renderBrodsky=box=>{
    box.append(
      el('p','memory-title','Arrel documentada · Pensament'),
      el('h4','brodsky-radix-title','Brodsky · La creativitat no obeeix')
    );
    const source=el('p','brodsky-source','Síntesi interpretativa d’«El maullido de un gato», dins Del dolor y la razón, pp. 292–302. No és una reproducció del text.');
    box.append(source,sourceLink(),el('p','brodsky-subtitle','Allò fèrtil'));
    const list=el('ul','brodsky-fertile');
    fertile.forEach(item=>list.appendChild(el('li','',item)));
    box.appendChild(list);
    const consequence=el('div','brodsky-consequence');
    consequence.append(
      el('strong','','Conseqüència per al Còdex'),
      el('p','','El cicle creatiu no és una recepta industrial. Pot preparar condicions, però no ordenar que l’esdeveniment comparegui.')
    );
    box.appendChild(consequence);
  };

  const renderFormula=box=>{
    box.append(
      el('p','memory-title','Fórmula apòcrifa · Anímic Protein'),
      el('h4','brodsky-formula-title','Creativitum nunc Pacevem')
    );
    const warning=el('p','brodsky-source','No és una cita de Brodsky ni llatí normatiu: és una transformació poètica del Còdex.');
    const formula=el('blockquote','brodsky-formula','La creativitat entra en una pau activa amb el límit: prepara, fa, escolta i no força l’arribada.');
    box.append(warning,formula,el('p','brodsky-subtitle','Operació'));
    const steps=el('ol','brodsky-steps');
    [
      'Prepara sense predeterminar.',
      'Fes abans de proclamar.',
      'Escolta què retorna el material.',
      'Accepta la desviació que produeixi diferència.',
      'Traça la mutació i atura’t quan només quedi domini.'
    ].forEach(item=>steps.appendChild(el('li','',item)));
    box.append(steps,sourceLink());
  };

  const renderBoredom=box=>{
    box.append(
      el('p','memory-title','Arrel documentada · Contrapunt'),
      el('h4','brodsky-radix-title','Brodsky · Travessar la repetició')
    );
    box.append(
      el('p','brodsky-source','Síntesi interpretativa d’«In Praise of Boredom», discurs pronunciat a Dartmouth el 1989 i publicat després a On Grief and Reason. No és una reproducció del text.'),
      boredomSourceLink(),
      el('p','brodsky-subtitle','Allò fèrtil')
    );
    const list=el('ul','brodsky-fertile');
    [
      'La vida té la repetició com un dels seus medis principals.',
      'La novetat compulsiva no venç el temps: només ajorna la trobada.',
      'Travessar l’avorriment revela finitud, proporció i durada.',
      'La precisió sobre la pròpia mesura pot produir humilitat i compassió.',
      'La sensibilitat és la resposta finita davant un temps que ens excedeix.',
      'La passió és valuosa quan neix de l’atenció, no del pànic a repetir.'
    ].forEach(item=>list.appendChild(el('li','',item)));
    box.appendChild(list);
    const consequence=el('div','brodsky-consequence');
    consequence.append(
      el('strong','','Contrapunt amb «El maullido de un gato»'),
      el('p','','Una arrel ensenya a no forçar l’arribada; l’altra, a no fugir abans que arribi. El Còdex prepara i roman: receptivitat dins del temps.')
    );
    box.appendChild(consequence);
  };

  const renderBareTime=box=>{
    box.append(
      el('p','memory-title','CONT·I · Instrument temporal'),
      el('h4','brodsky-formula-title','Cambra nua del temps · protocol 7—1—1')
    );
    box.append(
      el('p','brodsky-source','Transformació operativa d’Anímic Protein. No és una instrucció de Brodsky.'),
      el('blockquote','brodsky-formula','La repetició no exigeix novetat: exigeix prou escolta perquè una diferència mínima pugui esdevenir necessària.'),
      el('p','brodsky-subtitle','Partitura verbal')
    );
    const steps=el('ol','brodsky-steps');
    [
      'Tria una cèl·lula de 5–15 segons.',
      'Repeteix-la 7 vegades sense embellir-la.',
      'Observa quan apareix l’impuls de fugir o variar.',
      'A la 8a volta, canvia una sola dimensió: timbre, accent, altura o silenci.',
      'A la 9a, retorna exactament a l’origen.',
      'Conserva la variació només si ha modificat l’escolta del retorn.'
    ].forEach(item=>steps.appendChild(el('li','',item)));
    box.append(steps,boredomSourceLink());
  };

  const render=()=>{
    const box=ensurePanel();
    if(!box)return;
    const activeId=document.querySelector('#living-map [data-node].is-active')?.dataset?.node||'';
    box.replaceChildren();
    box.hidden=!TARGETS.has(activeId);
    if(box.hidden)return;
    if(activeId==='brodsky-creativitat')renderBrodsky(box);
    else if(activeId==='brodsky-avorriment')renderBoredom(box);
    else if(activeId==='temps-nu')renderBareTime(box);
    else renderFormula(box);
  };

  window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  render();
})();
