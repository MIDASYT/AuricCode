# Auric Code 0.17.0 - instalador por PowerShell (alternativa sin .exe descargado: no activa SmartScreen)
# Uso (una sola linea, en PowerShell):
#   powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object Net.WebClient;$w.Encoding=[Text.Encoding]::UTF8;iex $w.DownloadString('https://auric-hub.web.app/install.ps1')"
# Instala en %LOCALAPPDATA%\Programs\Auric Code (sin permisos de administrador). Tus datos (chats, ajustes) NO se tocan.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'

$Version     = '0.17.0'
$PayloadUrl  = 'https://auric-code.dressygrass3.chatgpt.site/downloads/auric-code-0.17.0-payload.zip'
$PayloadSha  = 'f5f6ec8b329b2bcdbfc9cfae8325881c174af9ae66727104de7d39428bcaccfb'
$ElectronUrls = @(
  'https://github.com/electron/electron/releases/download/v44.4.1/electron-v44.4.1-win32-x64.zip',
  'https://npmmirror.com/mirrors/electron/44.4.1/electron-v44.4.1-win32-x64.zip',
  'https://mirrors.huaweicloud.com/electron/44.4.1/electron-v44.4.1-win32-x64.zip'
)
$ElectronSha = '34bc07977d6c43b6514b956a5f2e3292255daa3838a49e6110f3fe19ffafb83f'

$InstallDir = Join-Path $env:LOCALAPPDATA 'Programs\Auric Code'
$Work       = Join-Path $env:TEMP ('auric-install-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $Work | Out-Null

function Say($m) { Write-Host ('[Auric] ' + $m) }
function Get-Verified($urls, $dest, $sha) {
  $last = $null
  foreach ($u in $urls) {
    try {
      Say ('Descargando ' + $u)
      Invoke-WebRequest -UseBasicParsing -Uri $u -OutFile $dest
      $h = (Get-FileHash -Algorithm SHA256 -Path $dest).Hash.ToLowerInvariant()
      if ($h -eq $sha.ToLowerInvariant()) { return }
      $last = 'SHA-256 inesperado (' + $h + ')'
      Remove-Item $dest -Force -ErrorAction SilentlyContinue
    } catch { $last = $_.Exception.Message }
  }
  throw ('No se pudo descargar un archivo verificado: ' + $last)
}

try {
  Say ('Instalando Auric Code ' + $Version)
  # Cerrar una instancia en ejecucion que use esta carpeta.
  Get-Process -Name 'Auric Code', 'electron' -ErrorAction SilentlyContinue | ForEach-Object {
    try { if ($_.Path -and $_.Path.StartsWith($InstallDir, [StringComparison]::OrdinalIgnoreCase)) { $_ | Stop-Process -Force } } catch {}
  }
  Start-Sleep -Milliseconds 600

  $payloadZip  = Join-Path $Work 'payload.zip'
  $electronZip = Join-Path $Work 'electron.zip'
  Get-Verified @($PayloadUrl) $payloadZip $PayloadSha
  Get-Verified $ElectronUrls $electronZip $ElectronSha

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $InstallDir) | Out-Null
  # La carpeta de preparacion vive junto al destino (mismo disco) para que el reemplazo sea un simple renombrado.
  $stage = $InstallDir + '.new'
  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $stage | Out-Null
  Say 'Extrayendo la aplicacion...'
  Expand-Archive -Path $payloadZip -DestinationPath $stage -Force
  Say 'Extrayendo el runtime (Electron)...'
  Expand-Archive -Path $electronZip -DestinationPath (Join-Path $stage 'runtime') -Force
  if (-not (Test-Path (Join-Path $stage 'runtime\electron.exe'))) { throw 'El runtime no contiene electron.exe' }
  if (-not (Test-Path (Join-Path $stage 'Auric Code.exe'))) { throw 'El paquete no contiene Auric Code.exe' }

  # Reemplazo: la carpeta anterior se conserva hasta que la nueva esta en su sitio.
  $old = $InstallDir + '.old'
  if (Test-Path $old) { Remove-Item $old -Recurse -Force -ErrorAction SilentlyContinue }
  if (Test-Path $InstallDir) { Move-Item -Path $InstallDir -Destination $old -Force }
  try { Move-Item -Path $stage -Destination $InstallDir -Force }
  catch { if (Test-Path $old) { Move-Item -Path $old -Destination $InstallDir -Force }; throw }
  if (Test-Path $old) { Remove-Item $old -Recurse -Force -ErrorAction SilentlyContinue }

  # Desinstalador (PowerShell) + entrada en "Aplicaciones instaladas".
  $uninst = @'
$ErrorActionPreference = 'SilentlyContinue'
$d = Join-Path $env:LOCALAPPDATA 'Programs\Auric Code'
Get-Process -Name 'Auric Code', 'electron' | ForEach-Object { try { if ($_.Path -and $_.Path.StartsWith($d, [StringComparison]::OrdinalIgnoreCase)) { $_ | Stop-Process -Force } } catch {} }
Start-Sleep -Milliseconds 500
Remove-Item (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Auric Code.lnk') -Force
Remove-Item (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Auric Code.lnk') -Force
Remove-Item 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AuricCode' -Recurse -Force
Remove-Item $d -Recurse -Force
if (Test-Path $d) { Start-Process -FilePath 'cmd.exe' -ArgumentList ('/c ping 127.0.0.1 -n 3 >nul & rmdir /s /q "' + $d + '"') -WindowStyle Hidden }
Write-Host 'Auric Code desinstalado. Tus chats y ajustes siguen en %APPDATA% (borralos a mano si quieres).'
'@
  Set-Content -Path (Join-Path $InstallDir 'Uninstall.ps1') -Value $uninst -Encoding UTF8

  $exe = Join-Path $InstallDir 'Auric Code.exe'
  $sh = New-Object -ComObject WScript.Shell
  foreach ($lnk in @(
      (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Auric Code.lnk'),
      (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Auric Code.lnk'))) {
    $s = $sh.CreateShortcut($lnk)
    $s.TargetPath = $exe
    $s.WorkingDirectory = $InstallDir
    $s.IconLocation = $exe
    $s.Description = 'Auric Code'
    $s.Save()
  }
  $key = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AuricCode'
  New-Item -Path $key -Force | Out-Null
  $vals = @{
    DisplayName = 'Auric Code'; DisplayVersion = $Version; Publisher = 'Auric'; InstallLocation = $InstallDir
    DisplayIcon = $exe; URLInfoAbout = 'https://auric-hub.web.app/'
    UninstallString = ('powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $InstallDir 'Uninstall.ps1') + '"')
  }
  foreach ($k in $vals.Keys) { New-ItemProperty -Path $key -Name $k -Value $vals[$k] -PropertyType String -Force | Out-Null }
  New-ItemProperty -Path $key -Name NoModify -Value 1 -PropertyType DWord -Force | Out-Null

  Say 'Listo. Abriendo Auric Code...'
  Start-Process -FilePath $exe -WorkingDirectory $InstallDir
}
catch {
  Write-Host ('[Auric] ERROR: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Si el problema persiste, usa Auric-Code-Setup-0.17.0.exe (clic en "Mas informacion" > "Ejecutar de todas formas").'
}
finally {
  Remove-Item $Work -Recurse -Force -ErrorAction SilentlyContinue
}
