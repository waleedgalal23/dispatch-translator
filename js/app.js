console.log('✅ تم تشغيل التطبيق بنجاح');

document.addEventListener('DOMContentLoaded', function() {
    var welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = 'background: #10b981; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px auto; max-width: 600px; font-size: 1.3em;';
    welcomeDiv.innerHTML = ' مرحباً بك في مترجم الديسباتش! JavaScript يعمل بنجاح!';
    
    var h1 = document.querySelector('h1');
    h1.parentNode.insertBefore(welcomeDiv, h1.nextSibling);
});
