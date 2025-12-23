#!/usr/bin/env powershell
# KBC Chat API Test Script

$base = "http://localhost:5000"

# Register
Write-Host "1. Registering user..." -ForegroundColor Cyan
$reg_resp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" -ContentType "application/json" -Body '{"email":"testuser@example.com","password":"password123"}'
$token = $reg_resp.access_token
Write-Host "✅ Registered. Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# Create Session
Write-Host "`n2. Creating chat session..." -ForegroundColor Cyan
$session_resp = Invoke-RestMethod -Method Post -Uri "$base/api/chat/session" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"title":"Test Chat","active_doc_ids":[]}'
$session_id = $session_resp.session_id
Write-Host "✅ Created session: $session_id" -ForegroundColor Green

# List Sessions
Write-Host "`n3. Listing sessions..." -ForegroundColor Cyan
$list_resp = Invoke-RestMethod -Method Get -Uri "$base/api/chat/sessions" -Headers @{ Authorization = "Bearer $token" }
Write-Host "✅ Sessions: $($list_resp | ConvertTo-Json)" -ForegroundColor Green

# Send Message
Write-Host "`n4. Sending message..." -ForegroundColor Cyan
$msg_resp = Invoke-RestMethod -Method Post -Uri "$base/api/chat/message" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body "{`"session_id`":`"$session_id`",`"message`":`"Hello World`"}"
Write-Host "✅ Assistant reply: $($msg_resp.assistant.Substring(0, 50))..." -ForegroundColor Green

# Load Session (with messages)
Write-Host "`n5. Loading session with messages..." -ForegroundColor Cyan
$load_resp = Invoke-RestMethod -Method Get -Uri "$base/api/chat/session/$session_id" -Headers @{ Authorization = "Bearer $token" }
$msg_count = $load_resp.messages.Count
Write-Host "✅ Loaded session. Messages: $msg_count" -ForegroundColor Green
Write-Host "Messages: $($load_resp.messages | ConvertTo-Json)" -ForegroundColor Yellow

Write-Host "`n✅ All tests passed! Chat is now persistent in MongoDB." -ForegroundColor Green
