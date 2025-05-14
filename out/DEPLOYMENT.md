# Static Site Deployment Guide

This guide explains how to properly deploy the Next.js static export (`/out` directory) to various web servers.

## What's Included

After running `npm run build`, the `/out` directory contains:

- HTML files for all pages
- Static assets in `/_next`
- Images and other media files
- `.htaccess` files for Apache
- `web.config` for IIS

## Deploying to Apache Server

1. **Upload Contents**: Upload the entire contents of the `/out` directory to your web server's document root or subdirectory.

2. **Set Permissions**:
   - Directories: `755` (rwxr-xr-x)
   - Files: `644` (rw-r--r--)

   ```bash
   chmod -R 755 /path/to/website
   find /path/to/website -type f -exec chmod 644 {} \;
   ```

3. **Configure Apache**:
   
   Ensure your Apache server has:
   - `mod_rewrite` enabled
   - AllowOverride set to All in your VirtualHost/Directory config

   ```apache
   <Directory /path/to/website>
       Options -Indexes +FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```

4. **Test Your Site**: Visit your domain and ensure all routes work correctly.

## Deploying to IIS Server

1. **Upload Contents**: Upload the entire contents of the `/out` directory to your IIS web application directory.

2. **Install URL Rewrite Module**: Ensure the [URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite) is installed.

3. **Configure IIS**:
   - In IIS Manager, select your site
   - Make sure the `web.config` file is present in your site's root directory
   - Enable "Static File Serving" in IIS features

4. **MIME Types**: Ensure these MIME types are correctly configured:
   - `.js` files as `application/javascript`
   - `.json` files as `application/json`
   - `.svg` files as `image/svg+xml`
   - `.woff2` files as `font/woff2`

5. **Test Your Site**: Visit your domain and ensure all routes work correctly.

## Troubleshooting

### 500 Internal Server Errors

If you see 500 errors for static files:

1. **Check File Permissions**: Ensure all files have correct permissions.
2. **Check MIME Types**: Make sure your server has proper MIME type configuration.
3. **Check .htaccess Files**: Ensure they're being read (AllowOverride All).
4. **Check Server Logs**: Look at your error logs for specific issues.

### 404 Not Found Errors

If you see 404 errors for pages or routes:

1. **Check Rewrite Rules**: Ensure your rewrite rules are working correctly.
2. **Verify File Existence**: Make sure the requested files actually exist.
3. **Test Direct Access**: Try accessing files directly to bypass routing.

### CSS/JS Not Loading Correctly

If styles or JavaScript don't load:

1. **Check Network Tab**: Look for load errors in the browser's dev tools.
2. **Check MIME Types**: Ensure files are served with correct Content-Type headers.
3. **Verify Paths**: Make sure paths in HTML are correct (relative vs. absolute).

## Contact & Support

If you encounter any issues not covered in this guide, please contact your web administrator or refer to the official documentation for your web server.

---

Good luck with your deployment! 
