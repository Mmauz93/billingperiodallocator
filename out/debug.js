/**
 * BillSplitter Debug Helper
 * This script can be used to diagnose issues with the site
 */

(function() {
    // Only run in console
    if (typeof window === 'undefined' || !window.console) return;
    
    console.log('%c BillSplitter Debug Helper', 'color: #0284C7; font-size: 16px; font-weight: bold;');
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('Document Mode:', document.compatMode);
    
    // Check for DOCTYPE (Quirks Mode detection)
    if (document.compatMode === 'BackCompat') {
        console.warn('⚠️ Document is in Quirks Mode! This can cause rendering issues.');
        console.warn('Ensure the HTML has a proper <!DOCTYPE html> declaration at the top.');
    } else {
        console.log('✓ Document is in Standards Mode');
    }
    
    // Check if CSS files are loaded
    function checkResourceLoaded(type, pattern) {
        let resources;
        if (type === 'css') {
            resources = Array.from(document.styleSheets).map(sheet => sheet.href);
        } else if (type === 'js') {
            resources = Array.from(document.scripts).map(script => script.src);
        } else {
            return;
        }
        
        const loaded = resources.some(url => url && url.includes(pattern));
        console.log(`${loaded ? '✓' : '✗'} ${type.toUpperCase()} (${pattern}): ${loaded ? 'Loaded' : 'Not loaded'}`);
        return loaded;
    }
    
    console.log('--- Resource Loading Check ---');
    checkResourceLoaded('css', 'static/css');
    checkResourceLoaded('js', 'webpack');
    checkResourceLoaded('js', 'chunks/main');
    
    // Check for common paths/routes
    console.log('--- Route Accessibility Check ---');
    function checkRoute(path, description) {
        const img = new Image();
        const timestamp = new Date().getTime();
        img.onload = function() { 
            console.log(`✓ ${description} (${path}): Accessible`);
        };
        img.onerror = function() {
            console.warn(`✗ ${description} (${path}): Not accessible`);
        };
        img.src = `${path}?check=${timestamp}`;
    }
    
    checkRoute('/images/logo.svg', 'Logo image');
    checkRoute('/images/icon.svg', 'Icon image');
    checkRoute('/_next/static/chunks/webpack-66da1223a3cd04a2.js', 'Webpack bundle');
    
    console.log('--- Environment Info ---');
    console.log('Window width:', window.innerWidth);
    console.log('Window height:', window.innerHeight);
    console.log('Device pixel ratio:', window.devicePixelRatio);
    console.log('Theme mode:', 
        document.documentElement.classList.contains('dark') ? 'Dark' : 
        document.documentElement.classList.contains('light') ? 'Light' : 'System (default)');
})(); 
