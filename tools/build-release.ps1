param([string]$Tag = '')

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root 'module.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$repo = 'https://github.com/GrimGutz/cain-ru'
if (!$Tag) { $Tag = "v$($manifest.version)" }
if ($manifest.id -ne 'cain-ru' -or $manifest.version -notmatch '^\d+\.\d+\.\d+$') {
    throw 'Invalid module id or release version.'
}
if ($Tag -cne "v$($manifest.version)") { throw 'Tag must match module.json version.' }
if ($manifest.url -cne $repo -or
    $manifest.manifest -cne "$repo/releases/latest/download/module.json" -or
    $manifest.download -cne "$repo/releases/download/$Tag/cain-ru.zip") {
    throw 'Manifest release URLs do not match this repository and version.'
}

$payload = @('module.json', 'README.md', 'scripts', 'lang', 'data', 'compendium')
$paths = @($payload | ForEach-Object { Join-Path $root $_ })
$files = @($paths | ForEach-Object {
    if (!(Test-Path -LiteralPath $_)) { throw "Missing release path: $_" }
    Get-ChildItem -LiteralPath $_ -Recurse -File
})
foreach ($file in $files) {
    if ($file.Extension -eq '.json') {
        & node -e "JSON.parse(require('node:fs').readFileSync(process.argv[1], 'utf8'))" $file.FullName
        if ($LASTEXITCODE -ne 0) { throw "Invalid JSON: $($file.Name)" }
    }
    if ($file.Extension -eq '.mjs') {
        & node --check $file.FullName
        if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax error: $($file.Name)" }
    }
}
foreach ($relative in @($manifest.esmodules) + @($manifest.languages | ForEach-Object { $_.path }) + @('data/originals.json')) {
    if (!(Test-Path -LiteralPath (Join-Path $root $relative) -PathType Leaf)) {
        throw "Missing runtime file: $relative"
    }
}

$dist = Join-Path $root 'dist'
$null = New-Item -ItemType Directory -Path $dist -Force
Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $dist 'module.json') -Force
$zipPath = Join-Path $dist 'cain-ru.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$stream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
try {
    $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $relative = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
            $null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    } finally { $archive.Dispose() }
} finally { $stream.Dispose() }

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $entries = @($zip.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName })
    $expected = @($files | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') })
    if (@(Compare-Object $expected $entries).Count -ne 0) {
        throw 'ZIP contents differ from the module payload; module.json must be at the root.'
    }
    $reader = [System.IO.StreamReader]::new($zip.GetEntry('module.json').Open())
    try { $archivedManifest = $reader.ReadToEnd() } finally { $reader.Dispose() }
    if ($archivedManifest -cne (Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8)) {
        throw 'ZIP manifest differs from the standalone manifest.'
    }
} finally { $zip.Dispose() }
Write-Output "Validated $Tag release: $($entries.Count) files, $((Get-Item -LiteralPath $zipPath).Length) bytes."
