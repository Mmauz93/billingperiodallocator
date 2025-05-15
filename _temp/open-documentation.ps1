# Get the absolute path to the HTML file
$htmlPath = Join-Path -Path (Get-Location) -ChildPath "_temp\ui-ux-docs\ui-ux-documentation.html"

# Open the HTML file with the default browser
Start-Process $htmlPath

Write-Host "Please use your browser's print feature (Ctrl+P) to save the documentation as PDF." -ForegroundColor Green
Write-Host "Recommended settings:" -ForegroundColor Yellow
Write-Host "- Print background colors and images" -ForegroundColor Yellow
Write-Host "- Paper size: A4 or Letter" -ForegroundColor Yellow
Write-Host "- Margins: Minimal" -ForegroundColor Yellow

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
