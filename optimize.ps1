$images = Get-ChildItem "images/*.png"
$results = @{}
Add-Type -AssemblyName System.Drawing

# Also minify CSS
Write-Host "Minifying CSS..."
cmd /c "npx -y clean-css-cli -o style.min.css style.css"

foreach ($img in $images) {
    Write-Host "Processing $($img.Name)..."
    
    # Get Dimensions first
    $image = [System.Drawing.Image]::FromFile($img.FullName)
    $w = $image.Width
    $h = $image.Height
    $image.Dispose() 

    # Convert to WebP
    $webp = $img.FullName -replace '\.png$','.webp'
    $webpName = $img.Name -replace '\.png$','.webp'
    
    # Use npx sharp-cli 
    cmd /c "npx -y sharp-cli -i `"$($img.FullName)`" -o `"$webp`" -f webp"

    $results[$img.Name] = @{
        webp = $webpName
        width = $w
        height = $h
    }
}

$results | ConvertTo-Json | Set-Content "image-data.json"
Write-Host "Done."
