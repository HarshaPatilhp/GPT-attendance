#!/bin/bash

# BMSIT Attendance - Setup Helper Script for Mac/Linux
# Usage: chmod +x setup.sh && ./setup.sh

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║   BMSIT Attendance - Setup Helper for Mac/Linux   ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "🔍 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
echo ""
echo "🔍 Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
else
    echo "❌ npm not found."
    exit 1
fi

# Create .env file
echo ""
echo "📝 Creating .env file..."
if [ -f ".env" ]; then
    echo "ℹ️  .env already exists"
else
    cp .env.example .env
    echo "✅ .env created from .env.example"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Show next steps
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║          Setup Complete! Next Steps:               ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "1. Configure .env file:"
echo "   • Open .env in your editor"
echo "   • Add your MongoDB Atlas connection string"
echo "   • Set JWT_SECRET to a random string"
echo ""

echo "2. Start development server:"
echo "   npm run dev"
echo ""

echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""

echo "4. Read documentation:"
echo "   • QUICKSTART.md (5-minute setup)"
echo "   • SETUP.md (detailed guide)"
echo "   • README.md (full documentation)"
echo ""

echo "For help, see SETUP.md"
echo ""
echo "✨ Happy coding!"
echo ""
