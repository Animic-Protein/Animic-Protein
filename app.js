const coreScript=document.createElement('script');
coreScript.src='core.js';
coreScript.onload=()=>{
  const germScript=document.createElement('script');
  germScript.src='germinacio.js';
  document.body.appendChild(germScript);
};
document.body.appendChild(coreScript);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
