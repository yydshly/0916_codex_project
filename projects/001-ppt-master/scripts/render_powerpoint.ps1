param([string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
$sampleRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$pptApplication = New-Object -ComObject PowerPoint.Application
$renderResults = @()
try {
    foreach ($variant in @('editable-shapes', 'native-data')) {
        $inputFile = Join-Path $sampleRoot "app/downloads/$variant.pptx"
        $outputDirectory = Join-Path $sampleRoot "app/previews/$variant"
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
        $deck = $pptApplication.Presentations.Open($inputFile, -1, 0, 0)
        try {
            foreach ($slide in $deck.Slides) {
                $outputFile = Join-Path $outputDirectory ("slide-{0}.png" -f $slide.SlideIndex)
                $slide.Export($outputFile, 'PNG', 1600, 900)
            }
            $renderResults += [ordered]@{
                variant = $variant
                slides = $deck.Slides.Count
                renderer = 'Microsoft PowerPoint'
                version = $pptApplication.Version
                width = 1600
                height = 900
                input_sha256 = (Get-FileHash -LiteralPath $inputFile -Algorithm SHA256).Hash.ToLower()
            }
        } finally { $deck.Close() }
    }
} finally {
    # Quit only the automation instance when no other presentation is open.
    if ($pptApplication.Presentations.Count -eq 0) { $pptApplication.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($pptApplication)
}
$renderResults | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $sampleRoot 'app/render-evidence.json') -Encoding utf8
Write-Output 'Rendered both PPTX variants with Microsoft PowerPoint.'
