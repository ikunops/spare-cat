$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host 'Starting Xianmao with SQLite...'
node server\app.js
