#!/usr/bin/env pwsh
# BMSIT Attendance - Setup Helper Script for Windows PowerShell
# Usage: .\setup.ps1

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    BMSIT Attendance - Setup Helper for Windows    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Yellow
$nodeCheck = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js found: $nodeCheck" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "`n🔍 Checking npm installation..." -ForegroundColor Yellow
$npmCheck = npm --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm found: $npmCheck" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found." -ForegroundColor Red
    exit 1
}

# Create .env file
Write-Host "`n📝 Creating .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "ℹ️  .env already exists" -ForegroundColor Blue
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env created from .env.example" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Show next steps
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          Setup Complete! Next Steps:               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n1. Configure .env file:" -ForegroundColor Yellow
Write-Host "   • Open .env in your editor"
Write-Host "   • Add your MongoDB Atlas connection string"
Write-Host "   • Set JWT_SECRET to a random string`n"

Write-Host "2. Start development server:" -ForegroundColor Yellow
Write-Host "   npm run dev`n"

Write-Host "3. Open browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000`n"

Write-Host "4. Read documentation:" -ForegroundColor Yellow
Write-Host "   • QUICKSTART.md (5-minute setup)"
Write-Host "   • SETUP.md (detailed guide)"
Write-Host "   • README.md (full documentation)`n"

Write-Host "For help, see SETUP.md" -ForegroundColor Cyan
Write-Host "`n✨ Happy coding!`n" -ForegroundColor Cyan
