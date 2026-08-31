(() => {
  'use strict';

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='radices-brodsky.css';
  document.head.appendChild(css);

  const TARGETS=new Set(['brodsky-creativitat','creativitum-nunc-pacevem']);
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

  const render=()=>{
    const box=ensurePanel();
    if(!box)return;
    const activeId=document.querySelector('#living-map [data-node].is-active')?.dataset?.node||'';
    box.replaceChildren();
    box.hidden=!TARGETS.has(activeId);
    if(box.hidden)return;
    if(activeId==='brodsky-creativitat')renderBrodsky(box);
    else renderFormula(box);
  };

  window.addEventListener('animic:node-activated',()=>window.setTimeout(render,0));
  window.addEventListener('resize',()=>window.setTimeout(render,0));
  render();
})();