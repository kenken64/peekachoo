$baseUrl = "https://your-app-url.up.railway.app" # Replace with your actual URL
$token = "YOUR_ADMIN_TOKEN" # You need an auth token since the route is protected

# Get total count first (optional, or just guess)
$total = 1350
$batchSize = 50

for ($offset = 0; $offset -lt $total; $offset += $batchSize) {
    Write-Host "Syncing batch starting at $offset..."
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/pokemon/sync" `
            -Method Post `
            -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
            -Body (@{ limit = $batchSize; offset = $offset } | ConvertTo-Json) `
            -TimeoutSec 300
            
        Write-Host "Success: $($response.message)"
    }
    catch {
        Write-Host "Error syncing batch at $offset : $_"
        # Optional: break or continue
    }
    
    Start-Sleep -Seconds 2
}
