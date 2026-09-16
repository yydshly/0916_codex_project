[CmdletBinding()]
param([int]$Port = 3100, [switch]$DownloadOnly)
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$runtime = Join-Path $repoRoot 'upstream/openpencil-runtime/v0.8.4'
$releaseBase = 'https://github.com/ZSeven-W/openpencil/releases/download/v0.8.4'
$packages = @(
    @{ Remote='openpencil-desktop-windows-x86_64.zip'; Local='desktop.zip'; Dir='desktop'; Hash='469730D56EA2E8678438818434402849CC431E578ACBEC193440FE867FA012DE' },
    @{ Remote='op-cli-windows-x86_64.zip'; Local='cli.zip'; Dir='cli'; Hash='E97111FBD440881978D98E720160DE9583CE39CF5544E510DD2B124F6F0F3D27' }
)
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
foreach ($package in $packages) {
    $archive = Join-Path $runtime $package.Local
    if (-not (Test-Path -LiteralPath $archive)) {
        Invoke-WebRequest "$releaseBase/$($package.Remote)" -OutFile $archive
    }
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $package.Hash) {
        throw "SHA-256 mismatch: $archive"
    }
    $destination = Join-Path $runtime $package.Dir
    $binaryName = if ($package.Dir -eq 'desktop') { 'openpencil-desktop.exe' } else { 'op.exe' }
    if (-not (Test-Path -LiteralPath (Join-Path $destination $binaryName))) {
        Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
    }
    Write-Host "Verified: $($package.Remote)"
}
if ($DownloadOnly) { return }
if (Get-Process -Name 'openpencil-desktop' -ErrorAction SilentlyContinue) {
    Write-Host 'OpenPencil is already running. Close it before running this script to reopen the sample.'
    return
}
$document = Join-Path $repoRoot 'projects/012-openpencil/examples/openpencil-demo.op'
$desktop = Join-Path $runtime 'desktop/openpencil-desktop.exe'
Start-Process -FilePath $desktop -ArgumentList @('--live-mcp', "$Port", ('"' + $document + '"')) -WorkingDirectory $runtime -WindowStyle Hidden | Out-Null
Write-Host "Started OpenPencil with $document (local MCP port: $Port)"
