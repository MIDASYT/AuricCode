(async()=>{
const status=document.getElementById('downloads-status');
try{
  const response=await fetch('./release.json',{cache:'no-store'});
  if(!response.ok)throw Error('No hay manifiesto publicado');
  const manifest=await response.json();
  const files=[];
  for(const platform of ['windows','android']){
    const file=manifest[platform];
    const ext=platform==='windows'?'exe':'apk';
    if(!file||!new RegExp('^[A-Za-z0-9._-]+\\.'+ext+'$','i').test(String(file.file))||!/^[a-f0-9]{64}$/i.test(String(file.sha256||'')))throw Error('Manifiesto de instaladores no válido');
    const link=document.querySelector('[data-download="'+platform+'"]');
    if(!link)throw Error('Falta enlace');
    const url=new URL('./downloads/'+encodeURIComponent(file.file),location.href);
    if(url.origin!==location.origin||!url.pathname.startsWith(new URL('./downloads/',location.href).pathname))throw Error('URL no autorizada');
    link.href=url.href;
    document.querySelector('[data-hash="'+platform+'"]').textContent=file.sha256;
    files.push(url.href);
  }
  const checks=await Promise.all(files.map(u=>fetch(u,{method:'HEAD',cache:'no-store'}).then(r=>r.ok).catch(()=>false)));
  if(checks.some(x=>!x))throw Error('Un instalador todavía no está publicado');
  const ready=manifest.firebaseConfigured===true&&manifest.gatewayConfigured===true;
  if(ready){
    document.getElementById('release-heading').textContent='Chat conectado. En Windows y Android.';
    document.getElementById('release-detail').textContent='Esta compilación incorpora los parámetros de Firebase y del gateway autenticado de AuricAI. El funcionamiento real depende de que ambos servicios estén operativos.';
  }
  status.textContent=ready?'Archivos disponibles y comprobados. Puedes verificar las huellas SHA-256.':'Archivos de prueba disponibles y comprobados. Firebase y Cloudflare todavía necesitan activación.';
}catch(err){
  for(const link of document.querySelectorAll('[data-download]')){link.removeAttribute('href');link.setAttribute('aria-disabled','true');}
  status.textContent='La publicación de los instaladores no se pudo verificar. Consulta GitHub Actions o inténtalo más tarde.';
  status.style.color='#eac16c';
}
})();