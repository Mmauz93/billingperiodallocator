#!/bin/bash

# Script to copy .htaccess files to /out directory after build

echo "Copying .htaccess files to /out directory..."

# Ensure out directory exists
if [ ! -d "out" ]; then
  echo "Error: 'out' directory not found. Run 'npm run build' first."
  exit 1
fi

# Copy root .htaccess and web.config
cp public/.htaccess out/
cp public/web.config out/

# Create all necessary directories if they don't exist
mkdir -p out/_next
mkdir -p out/_next/static
mkdir -p out/_next/static/chunks
mkdir -p out/_next/static/css
mkdir -p out/_next/static/media
mkdir -p out/images
mkdir -p out/de
mkdir -p out/en

# Create .htaccess files in all important directories
echo "Creating .htaccess files in all directories..."

# Root _next directory
cat > out/_next/.htaccess << EOF
# Properly serve Next.js static assets
<IfModule mod_rewrite.c>
  RewriteEngine Off
</IfModule>

# Set proper MIME types for Next.js assets
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/json .json
  AddType text/css .css
  AddType font/woff2 .woff2
  AddType image/svg+xml .svg
</IfModule>

# Allow all access
<IfModule mod_authz_core.c>
  Require all granted
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/* "access plus 1 year"
</IfModule>
EOF

# Copy the same .htaccess to static directory
cp out/_next/.htaccess out/_next/static/

# Specific .htaccess for JavaScript chunks
cat > out/_next/static/chunks/.htaccess << EOF
# Ensure JavaScript files are served with the correct MIME type
<IfModule mod_rewrite.c>
  RewriteEngine Off
</IfModule>

# Force JavaScript MIME type
<IfModule mod_mime.c>
  ForceType application/javascript
</IfModule>

# Allow all access
<IfModule mod_authz_core.c>
  Require all granted
</IfModule>

# Set specific headers for JavaScript files
<IfModule mod_headers.c>
  <FilesMatch "\.js$">
    Header set Content-Type "application/javascript"
  </FilesMatch>
</IfModule>
EOF

# Images directory
cat > out/images/.htaccess << EOF
# Allow direct access to image files
<IfModule mod_rewrite.c>
  RewriteEngine Off
</IfModule>

# Set proper MIME types for images
<IfModule mod_mime.c>
  AddType image/svg+xml .svg
  AddType image/png .png
  AddType image/jpeg .jpg .jpeg
  AddType image/gif .gif
  AddType image/webp .webp
  AddType image/x-icon .ico
</IfModule>

# Allow all access
<IfModule mod_authz_core.c>
  Require all granted
</IfModule>
EOF

# Language directories
for lang in de en; do
  cat > out/$lang/.htaccess << EOF
# Simple configuration for language directory
DirectoryIndex index.html

# Handle app route
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /$lang/
  
  # Redirect app path to app.html
  RewriteRule ^app/?$ app.html [L]
  
  # Don't rewrite existing files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Pass through all other paths to avoid interfering with static assets
  RewriteRule ^ - [L]
</IfModule>

# Fallback for servers without mod_rewrite
<IfModule !mod_rewrite.c>
  ErrorDocument 404 /404.html
</IfModule>
EOF
done

echo "All .htaccess files created successfully!"

# Make sure permissions are correct
chmod -R 755 out/
find out/ -type f -exec chmod 644 {} \;

echo "Listing all .htaccess files for verification:"
find out -name ".htaccess" | sort

# Copy deployment guide to out directory for reference
cp DEPLOYMENT.md out/

echo "File permissions set."
echo "Deployment guide copied to out directory."
echo ""
echo "Ready for deployment! Upload the entire 'out' directory to your web server." 
