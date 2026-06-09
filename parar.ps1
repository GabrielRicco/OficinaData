# Encerra o backend (8080) e o frontend (5173) liberando as portas.
foreach ($porta in 8080, 5173) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction Stop
    foreach ($c in $conns) {
      Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
      Write-Host "Porta $porta encerrada (PID $($c.OwningProcess))." -ForegroundColor Yellow
    }
  } catch {
    Write-Host "Porta $porta ja estava livre." -ForegroundColor DarkGray
  }
}
Write-Host "Pronto. Portas 8080 e 5173 liberadas." -ForegroundColor Green
Start-Sleep 2
