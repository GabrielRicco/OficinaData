# Sobe o OficinaData para apresentacao: PostgreSQL + backend (Spring Boot) + frontend (Vite).
# Uso: dê duplo-clique em iniciar.bat (ou rode este .ps1).

$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot

function Passo($txt) { Write-Host "`n>>> $txt" -ForegroundColor Cyan }
function OK($txt)    { Write-Host "    OK: $txt" -ForegroundColor Green }
function Falha($txt) { Write-Host "    ERRO: $txt" -ForegroundColor Red }

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  OficinaData - inicializacao para apresentacao"   -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Localizar um JDK 17+ (o Java padrao da maquina pode ser o 8, que NAO roda o projeto)
Passo "Procurando JDK 17+"
$jdk = $null
$bases = @("C:\Program Files\Eclipse Adoptium","C:\Program Files\Java",
           "C:\Program Files\Microsoft\jdk","C:\Program Files\Amazon Corretto","C:\Program Files\Zulu")
foreach ($base in $bases) {
  if (-not (Test-Path $base)) { continue }
  foreach ($dir in Get-ChildItem $base -Directory) {
    $release = Join-Path $dir.FullName "release"
    if ((Test-Path "$($dir.FullName)\bin\java.exe") -and (Test-Path $release)) {
      $m = Select-String -Path $release -Pattern 'JAVA_VERSION="(\d+)' | Select-Object -First 1
      if ($m -and [int]$m.Matches.Groups[1].Value -ge 17) { $jdk = $dir.FullName; break }
    }
  }
  if ($jdk) { break }
}
if (-not $jdk) { Falha "Nenhum JDK 17+ encontrado. Instale o JDK 21 (Eclipse Adoptium)."; Read-Host "Enter para sair"; exit 1 }
OK "JDK: $jdk"

# 2. PostgreSQL: localizar binarios e garantir que o servico esta rodando
Passo "Verificando PostgreSQL"
$psql = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $psql) { Falha "PostgreSQL nao encontrado em C:\Program Files\PostgreSQL."; Read-Host "Enter para sair"; exit 1 }
$pgBin = $psql.DirectoryName
$env:Path = "$pgBin;$env:Path"
$env:PGPASSWORD = "postgres"
$svc = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc -and $svc.Status -ne 'Running') { Start-Service $svc.Name; Start-Sleep 3; OK "Servico iniciado: $($svc.Name)" }
else { OK "Servico ativo: $($svc.Name)" }

# 3. Banco: criar e popular se ainda nao existir
Passo "Verificando banco oficina_db"
$existe = & psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='oficina_db';"
if ("$existe".Trim() -ne "1") { & createdb -U postgres oficina_db; OK "Banco criado" }
$tabelas = & psql -U postgres -d oficina_db -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='oficina';"
if ([int]("$tabelas".Trim()) -lt 10) {
  Write-Host "    Carregando schema e dados (~1 min)..." -ForegroundColor Yellow
  & psql -U postgres -d oficina_db -f "$raiz\db\02_ddl.sql"   | Out-Null
  & psql -U postgres -d oficina_db -f "$raiz\db\03_dados.sql" | Out-Null
  & psql -U postgres -d oficina_db -f "$raiz\db\05_indices.sql" | Out-Null
  & psql -U postgres -d oficina_db -c "ANALYZE;" | Out-Null
  OK "Banco populado"
} else { OK "Banco ja populado ($tabelas tabelas)" }

# 4. Garantir dependencias do frontend
Passo "Verificando dependencias do frontend"
if (-not (Test-Path "$raiz\frontend\node_modules")) {
  Write-Host "    Instalando (npm install)..." -ForegroundColor Yellow
  Push-Location "$raiz\frontend"; npm install; Pop-Location
}
OK "Frontend pronto"

# 5. Subir o backend em uma nova janela
Passo "Subindo backend (porta 8080) em nova janela"
$cmdBackend = "`$env:JAVA_HOME='$jdk'; `$env:Path='$jdk\bin;' + `$env:Path; " +
  "`$env:SPRING_PROFILES_ACTIVE='dev'; " +
  "`$env:DB_URL='jdbc:postgresql://localhost:5432/oficina_db?currentSchema=oficina'; " +
  "`$env:DB_USERNAME='postgres'; `$env:DB_PASSWORD='postgres'; " +
  "`$env:JWT_SECRET='chave-de-desenvolvimento-com-mais-de-32-caracteres'; " +
  "Set-Location '$raiz\backend'; .\mvnw.cmd spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit","-Command",$cmdBackend
Write-Host "    Aguardando o backend responder (pode levar ~30s)..." -ForegroundColor Yellow
$subiu = $false
for ($i=0; $i -lt 90; $i++) {
  try { if ((Invoke-WebRequest "http://localhost:8080/v3/api-docs" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { $subiu=$true; break } }
  catch { Start-Sleep 2 }
}
if ($subiu) { OK "Backend no ar: http://localhost:8080/swagger-ui.html" }
else { Falha "Backend demorou a responder - veja a janela do backend." }

# 6. Subir o frontend em uma nova janela
Passo "Subindo frontend (porta 5173) em nova janela"
Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$raiz\frontend'; npm run dev"
Start-Sleep 4
OK "Frontend subindo"

# 7. Abrir o navegador
Start-Process "http://localhost:5173"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  Tudo no ar!  ->  http://localhost:5173"            -ForegroundColor Green
Write-Host "  Login gerente:    gerente@oficina.local / 123456"  -ForegroundColor Green
Write-Host "  Login atendente:  atendente1@oficina.local / 123456" -ForegroundColor Green
Write-Host "  Para encerrar, feche as 2 janelas ou rode parar.bat" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Read-Host "`nEnter para fechar esta janela (backend e frontend continuam rodando)"
