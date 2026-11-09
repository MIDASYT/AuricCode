'use strict';
(async function auricCodeRelease(){
  const link=document.querySelector('a[data-platform="windows"]');
  const status=document.getElementById('downloadStatus');
  const hash=document.getElementById('download-hash');
  function unavailable(message){if(link){link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.textContent='Descarga no disponible';}if(status)status.textContent=message;}
  unavailable('Comprobando versión disponible…');
  try{
    const response=await fetch('./release.json',{cache:'no-store'});
    if(!response.ok)throw Error('Manifiesto inaccesible');
    const release=await response.json();
    if(release.publicDownloads!==true || !/^\d+\.\d+\.\d+$/.test(release.version||''))throw Error('Versión no publicada');
    const file='Auric-Code-Setup-'+release.version+'.exe';
    const expected='https://github.com/MIDASYT/AuricCode-Web/releases/download/v'+release.version+'/'+file;
    if(release.installerUrl!==expected || release.publicDownloadUrl!==expected || !/^[a-f0-9]{64}$/i.test(release.sha256||'') || !Number.isSafeInteger(release.bytes) || release.bytes<100000)throw Error('Publicación inválida');
    link.href=expected;
    link.removeAttribute('aria-disabled');
    link.textContent='Descargar EXE · '+release.version+' ↓';
    document.querySelectorAll('[data-version]').forEach(el=>el.textContent=release.version);
    if(hash)hash.textContent='SHA-256: '+release.sha256;
    if(status)status.textContent='Descarga oficial de AuricCode '+release.version+' disponible. Las versiones posteriores en desarrollo todavía no son publicaciones estables.';
  }catch(error){unavailable('No se pudo comprobar la descarga oficial.');}
})();