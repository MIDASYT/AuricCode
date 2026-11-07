const views = {
  preview: ['assets/preview.png', 'Godot ejecutando un juego de prueba dentro de Preview', 'Godot real en ejecución. Proyecto y agente de prueba; captura real de AuricCode.'],
  activity: ['assets/workspace.png', 'Vista de la actividad de un agente en AuricCode', 'Proyecto de demostración con un proveedor simulado. Captura real de la aplicación.'],
  models: ['assets/models.png', 'Selector de modelos con barras de calidad y velocidad', 'Catálogo de prueba para mostrar la interfaz. Las puntuaciones de esta captura son datos simulados.'],
  question: ['assets/question.png', 'Pregunta pendiente en el chat con dos opciones de respuesta', 'La tarea espera la elección del usuario. Captura de un proyecto de demostración.']
};
const tabs = [...document.querySelectorAll('[data-view]')];
function selectTab(button) {
  for (const tab of tabs) { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; }
  const [src, alt, caption] = views[button.dataset.view]; const img = document.querySelector('#product-shot'); img.src = src; img.alt = alt;
  document.querySelector('#product-caption').textContent = caption; document.querySelector('#product-view').setAttribute('aria-labelledby', button.id);
}
for (const button of tabs) {
  button.addEventListener('click', () => selectTab(button));
  button.addEventListener('keydown', e => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return; e.preventDefault(); const current = tabs.indexOf(button), next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (current + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; selectTab(tabs[next]); tabs[next].focus(); });
}
let publishedHash = '';
fetch('./release.json', {cache:'no-cache'}).then(response => {if(!response.ok)throw Error('manifest');return response.json();}).then(release => {
  const version = String(release.version || ''), hash = String(release.sha256 || ''), url = new URL(release.installerUrl || '', location.href);
  if (!/^\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{64}$/i.test(hash) || url.protocol !== 'https:' || (url.origin !== location.origin && url.origin !== 'https://auric-code.dressygrass3.chatgpt.site') || !url.pathname.endsWith('.exe')) throw Error('manifest');
  document.querySelectorAll('[data-version]').forEach(el => el.textContent = version); document.querySelectorAll('[data-download]').forEach(link => link.href = url.href);
  publishedHash = hash; document.querySelector('#download-hash').textContent = hash; document.querySelector('#copy-hash').disabled = false;
}).catch(() => { document.querySelector('#download-hash').textContent = 'La huella no se pudo cargar. Vuelve a intentarlo o consulta el archivo SHA-256 junto al instalador.'; });
document.querySelector('#copy-hash').onclick = async () => { const feedback = document.querySelector('#hash-feedback');try { await navigator.clipboard.writeText(publishedHash); feedback.textContent = 'Huella copiada.'; } catch { feedback.textContent = 'Selecciona la huella para copiarla.'; } };
