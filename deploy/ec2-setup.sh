#!/bin/bash

# AWS EC2 Setup Script for Draw App
# Run this script on a fresh EC2 instance (Ubuntu/Debian)

set -e

echo "🚀 Starting EC2 setup for Draw App..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm globally
echo "📦 Installing pnpm..."
sudo npm install -g pnpm@9.0.0

# Install PostgreSQL (if not using external database)
echo "📦 Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Install nginx
echo "📦 Installing nginx..."
sudo apt-get install -y nginx

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install build essentials
echo "📦 Installing build tools..."
sudo apt-get install -y build-essential

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/draw-app
sudo chown -R $USER:$USER /opt/draw-app

# Setup PostgreSQL (if using local database)
echo "🗄️  Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE drawapp;" || echo "Database might already exist"
sudo -u postgres psql -c "CREATE USER drawapp_user WITH PASSWORD 'change_this_password';" || echo "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE drawapp TO drawapp_user;" || echo "Privileges might already be set"

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/draw-app"
echo "2. Create .env file with your configuration"
echo "3. Run: cd /opt/draw-app && pnpm install"
echo "4. Run: pnpm build"
echo "5. Run: ./deploy/deploy.sh"


