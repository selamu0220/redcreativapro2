$blogPath = "app\blog"
$fixed = 0
$errors = @()

# Pattern to match duplicate H1 blocks
$pattern = '(?ms)(\s*<h1 className="text-4xl font-bold mb-4 text-gray-900">.*?</h1>\s*)(\s*</h1>\s*</header>)'

Get-ChildItem -Path $blogPath -Recurse -Filter "page.tsx" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    # Check if file has the duplicate H1 pattern
    if ($content -match '<h1 className="text-4xl font-bold mb-4 text-gray-900">.*?<h1 className="text-4xl font-bold mb-4 text-gray-900">') {
        try {
            Write-Host "Fixing: $($_.Directory.Name)/page.tsx"
            
            # Replace the pattern: remove the duplicate H1 block but keep </header>
            $newContent = $content -replace $pattern, '${2}'
            
            # Write back to file
            Set-Content -Path $file -Value $newContent -NoNewline
            $fixed++
        }
        catch {
            $errors += "Error in $file : $_"
        }
    }
}

Write-Host "`nFixed $fixed files"
if ($errors.Count -gt 0) {
    Write-Host "`nErrors:"
    $errors | ForEach-Object { Write-Host $_ }
}
