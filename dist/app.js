'use strict';
(async()=>{const link=document.querySelector('[data-platform="windows"]'),status=document.getElementById('downloadStatus'),hash=document.getElementById('download-hash');
 function disabled(msg){if(link){link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.textContent='Descarga no publicada';}if(status)status.textContent=msg;}
 disabled('El instalador aún no dispone de una descarga pública verificada.');
 try{const response=await fetch('release.json',{cache:'no-store'});if(!response.ok)throw Error('sin release');const r=await response.json();
 if(!/^\d+\.\d+\.\d+$/.test(r.version||''))throw Error('versión inválida');document.querySelectorAll('[data-version]').forEach(x=>x.textContent=r.version);
 // El repositorio de trabajo es privado; nunca activar sus Releases como enlace público.
 if(r.publicDownloads!==true || typeof r.publicDownloadUrl!=='string')return;
 const u=new URL(r.publicDownloadUrl);const valid=u.protocol==='https:' && u.pathname.endsWith('.exe') &&
 ((u.hostname==='github.com'&&/^\/MIDASYT\/[^/]+\/releases\/download\//.test(u.pathname)&&!/^\/MIDASYT\/(AuricCode|AuricCode-Web|AuricAI|AuricAI-Web)\//.test(u.pathname))||(u.hostname==='storage.googleapis.com'&&u.pathname.startsWith('/auric-')));
 if(!valid||!/^[a-f0-9]{64}$/i.test(r.sha256||''))throw Error('enlace no verificado');
 link.href=u.href;link.removeAttribute('aria-disabled');link.textContent='Descargar para Windows ↓';
 if(hash)hash.textContent='SHA-256: '+r.sha256;
 if(status)status.textContent='Comprueba la integridad del instalador antes de abrirlo.';
 }catch(e){disabled('No se pudo verificar una descarga pública de AuricCode.');}
})();