# AuricCode — web pública

Página de descarga de AuricCode. Conserva la familia visual de Auric Turrets: Inter, Libre Baskerville, azul profundo y acento dorado.

`dist/` contiene únicamente la web, capturas de demostración, avisos de fuentes e instaladores. El proyecto fuente de la aplicación se conserva en el repositorio privado AuricCodePrivado.

El repositorio público es [MIDASYT/AuricCode](https://github.com/MIDASYT/AuricCode), por elección del usuario. La web se publica en [midasyt.github.io/AuricCode](https://midasyt.github.io/AuricCode/) con `.github/workflows/pages.yml`. Para activarla una sola vez, selecciona **Settings → Pages → Source → GitHub Actions**. Las siguientes actualizaciones de `main` publican la carpeta `dist/` automáticamente.

También existe una publicación en [Sites](https://auric-code.dressygrass3.chatgpt.site), configurada en `.openai/hosting.json`. Es el canal verificado que consulta la app para las actualizaciones; ambas páginas ofrecen el mismo instalador. `dist/release.json` identifica versión y SHA-256. Una actualización de escritorio cambia ese manifiesto; el Worker no necesita una nueva versión por cada publicación.

Las capturas usan un proyecto y un proveedor de prueba. No representan evaluaciones reales de los modelos que aparecen en ellas.
