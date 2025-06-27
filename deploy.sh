#!/bin/bash

# CineMatch VPS Deployment Script

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Clone/upload your project
# cd /var/www/cinematch

# Install dependencies
npm install

# Build the application
npm run build

# Create PostgreSQL database
sudo -u postgres createdb cinematch

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start with PM2
pm2 start npm --name "cinematch" -- start
pm2 save
pm2 startup

# Set up Nginx reverse proxy
sudo apt install nginx -y

# Create Nginx config
sudo tee /etc/nginx/sites-available/cinematch << EOF
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/cinematch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "Deployment complete! Access your app at http://your_domain.com"