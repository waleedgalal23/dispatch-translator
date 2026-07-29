// التطبيق الرئيسي - مترجم الديسباتش
console.log('✅ تم تشغيل التطبيق بنجاح');

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 الصفحة جاهزة');
    
    // عناصر الواجهة
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const originalText = document.getElementById('originalText');
    const translatedText = document.getElementById('translatedText');
    const suggestions = document.getElementById('suggestions');
    const callHistory = document.getElementById('callHistory');
    const languageSelect = document.getElementById('languageSelect');
    const apiToken = document.getElementById('apiToken');
    const saveTokenBtn = document.getElementById('saveTokenBtn');
    const apiStatus = document.getElementById('apiStatus');
    
    // حالة التطبيق
    let isRecording = false;
    
    // تحميل التوكن المحفوظ
    const savedToken = localStorage.getItem('hf_api_token');
    if (savedToken) {
        apiStatus.textContent = '✅ التوكن محفوظ';
        apiStatus.style.color = '#059669';
    }
    
    // زر بدء المكالمة
    startBtn.addEventListener('click', function() {
        isRecording = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        originalText.textContent = ' جاري الاستماع... تحدث الآن';
        translatedText.textContent = '⏳ في انتظار النص...';
        console.log(' بدأت المكالمة');
    });
    
    // زر إيقاف المكالمة
    stopBtn.addEventListener('click', function() {
        isRecording = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        originalText.textContent = '⏸️ تم إيقاف المكالمة';
        console.log('⏹️ تم إيقاف المكالمة');
    });
    
    // زر حفظ التوكن
    saveTokenBtn.addEventListener('click', function() {
        const token = apiToken.value.trim();
        if (token && token.startsWith('hf_')) {
            localStorage.setItem('hf_api_token', token);
            apiStatus.textContent = '✅ تم حفظ التوكن بنجاح';
            apiStatus.style.color = '#059669';
            apiToken.value = '';
        } else {
            apiStatus.textContent = '❌ التوكن غير صالح';
            apiStatus.style.color = '#dc2626';
        }
    });
});
