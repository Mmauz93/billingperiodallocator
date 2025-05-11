// This script completely disables Content Security Policy in development environments
(function() {
  // Only disable in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Remove any existing CSP meta tags
    const removeExistingCSP = function() {
      const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      metaTags.forEach(tag => tag.parentNode.removeChild(tag));
    };
    
    // Run immediately
    removeExistingCSP();
    
    // Also run when DOM is ready to catch any that might be added later
    document.addEventListener('DOMContentLoaded', removeExistingCSP);
    
    // Override the function that sets CSP headers
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (name.toLowerCase() === 'http-equiv' && value.toLowerCase() === 'content-security-policy') {
        console.warn('CSP header blocked by disable-csp.js');
        return;
      }
      return originalSetAttribute.call(this, name, value);
    };
    
    console.log("CSP Disabled for development");
  }
})(); 
