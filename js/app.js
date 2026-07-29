// ============================================
// مترجم الديسباتش الفوري - التطبيق الرئيسي
// ============================================

console.log('✅ تم تشغيل التطبيق بنجاح');

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 الصفحة جاهزة');
    
    // ===== تعريف عناصر الواجهة =====
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
    
    // ===== حالة التطبيق =====
    let isRecording = false;
    let recognition = null;
    let callLog = [];
    
    // ===== تحميل التوكن المحفوظ =====
    const savedToken = localStorage.getItem('hf_api_token');
    if (savedToken) {
        apiStatus.textContent = '✅ التوكن محفوظ في المتصفح';
        apiStatus.style.color = '#059669';
    }
    
    // ===== تحميل سجل المكالمات =====
    loadCallHistory();
    
    // ===== إعداد التعرف على الصوت =====
    function setupSpeechRecognition() {
        // التحقق من دعم المتصفح
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            originalText.textContent = '️ متصفحك لا يدعم التعرف على الصوت. استخدم Chrome.';
            return null;
        }
        
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'ar-SA'; // اللغة العربية
        
        rec.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            originalText.textContent = transcript;
            
            // ترجمة تلقائية
            if (transcript.length > 5) {
                translateText(transcript);
            }
        };
        
        rec.onerror = function(event) {
            console.error('خطأ في التعرف على الصوت:', event.error);
            originalText.textContent = '⚠️ خطأ: ' + event.error;
        };
        
        rec.onend = function() {
            if (isRecording) {
                rec.start(); // إعادة التشغيل إذا كان لا يزال يسجل
            }
        };
        
        return rec;
    }
    
    // ===== دالة الترجمة =====
    async function translateText(text) {
        const direction = languageSelect.value;
        const token = localStorage.getItem('hf_api_token');
        
        if (!token) {
            translatedText.textContent = '⚠️ الرجاء إدخال Hugging Face API Token أولاً';
            return;
        }
        
        translatedText.textContent = '⏳ جاري الترجمة...';
        
        try {
            // استخدام Hugging Face Inference API
            const modelId = direction === 'ar-en' 
                ? 'Helsinki-NLP/opus-mt-ar-en' 
                : 'Helsinki-NLP/opus-mt-en-ar';
            
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${modelId}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inputs: text })
                }
            );
            
            if (!response.ok) {
                throw new Error('فشل في الترجمة');
            }
            
            const result = await response.json();
            const translated = result[0]?.translation_text || 'لم يتم العثور على ترجمة';
            
            translatedText.textContent = translated;
            
            // تحديث الاقتراحات
            updateSuggestions(translated);
            
            // إضافة للسجل
            addToCallLog(text, translated);
            
        } catch (error) {
            console.error('خطأ في الترجمة:', error);
            translatedText.textContent = '❌ خطأ في الترجمة. تأكد من صحة التوكن.';
        }
    }
    
    // ===== تحديث اقتراحات الردود =====
    function updateSuggestions(translatedText) {
        const suggestionsList = getSuggestions(translatedText);
        
        if (suggestionsList.length === 0) {
            suggestions.innerHTML = '<p class="empty-message">لا توجد اقتراحات حالياً</p>';
            return;
        }
        
        suggestions.innerHTML = suggestionsList.map(s => 
            `<div class="suggestion-item">${s}</div>`
        ).join('');
        
        // إضافة حدث النقر على الاقتراحات
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                originalText.textContent = this.textContent;
                translateText(this.textContent);
            });
        });
    }
    
    // ===== اقتراحات مخصصة للديسباتش =====
    function getSuggestions(text) {
        const lowerText = text.toLowerCase();
        const suggestions = [];
        
        if (lowerText.includes('شاحنة') || lowerText.includes('truck')) {
            suggestions.push('ما هو رقم الشاحنة؟');
            suggestions.push('أين موقعك الحالي؟');
            suggestions.push('متى ستتصل مرة أخرى؟');
        }
        
        if (lowerText.includes('تأخير') || lowerText.includes('delay')) {
            suggestions.push('كم دقيقة التأخير؟');
            suggestions.push('ما سبب التأخير؟');
            suggestions.push('هل تحتاج مساعدة؟');
        }
        
        if (lowerText.includes('طريق') || lowerText.includes('road')) {
            suggestions.push('هل الطريق واضح؟');
            suggestions.push('هل هناك ازدحام مروري؟');
            suggestions.push('ما البديل المقترح؟');
        }
        
        if (lowerText.includes('مستودع') || lowerText.includes('warehouse')) {
            suggestions.push('هل المستودع مفتوح؟');
            suggestions.push('ما رقم بوابة التحميل؟');
            suggestions.push('من هو المسؤول عن الاستلام؟');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('هل فهمت الرسالة؟');
            suggestions.push('هل تحتاج توضيحاً؟');
            suggestions.push('سأتصل بك لاحقاً');
        }
        
        return suggestions;
    }
    
    // ===== إضافة للسجل =====
    function addToCallLog(original, translated) {
        const now = new Date();
        const time = now.toLocaleTimeString('ar-SA');
        
        callLog.unshift({
            time: time,
            original: original,
            translated: translated,
            direction: languageSelect.value
        });
        
        // الاحتفاظ بآخر 10 مكالمات فقط
        if (callLog.length > 10) {
            callLog.pop();
        }
        
        saveCallHistory();
        renderCallHistory();
    }
    
    // ===== عرض سجل المكالمات =====
    function renderCallHistory() {
        if (callLog.length === 0) {
            callHistory.innerHTML = '<p class="empty-message">لا توجد مكالمات سابقة</p>';
            return;
        }
        
        callHistory.innerHTML = callLog.map(call => `
            <div class="history-item">
                <strong>⏰ ${call.time}</strong><br>
                <strong> الأصلي:</strong> ${call.original}<br>
                <strong>🌐 الترجمة:</strong> ${call.translated}
            </div>
        `).join('');
    }
    
    // ===== حفظ سجل المكالمات =====
    function saveCallHistory() {
        localStorage.setItem('call_history', JSON.stringify(callLog));
    }
    
    // ===== تحميل سجل المكالمات =====
    function loadCallHistory() {
        const saved = localStorage.getItem('call_history');
        if (saved) {
            callLog = JSON.parse(saved);
            renderCallHistory();
        }
    }
    
    // ===== زر بدء المكالمة =====
    startBtn.addEventListener('click', function() {
        isRecording = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        originalText.textContent = '🎤 جاري الاستماع... تحدث الآن';
        translatedText.textContent = '⏳ في انتظار النص...';
        
        recognition = setupSpeechRecognition();
        if (recognition) {
            recognition.start();
            console.log('🎤 بدأت المكالمة');
        }
    });
    
    // ===== زر إيقاف المكالمة =====
    stopBtn.addEventListener('click', function() {
        isRecording = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        if (recognition) {
            recognition.stop();
        }
        
        originalText.textContent = '⏸️ تم إيقاف المكالمة';
        console.log('⏹️ تم إيقاف المكالمة');
    });
    
    // ===== زر حفظ التوكن =====
    saveTokenBtn.addEventListener('click', function() {
        const token = apiToken.value.trim();
        if (token && token.startsWith('hf_')) {
            localStorage.setItem('hf_api_token', token);
            apiStatus.textContent = '✅ تم حفظ التوكن بنجاح';
            apiStatus.style.color = '#059669';
            apiToken.value = '';
        } else {
            apiStatus.textContent = '❌ التوكن غير صالح (يجب أن يبدأ بـ hf_)';
            apiStatus.style.color = '#dc2626';
        }
    });
    
    // ===== تغيير اتجاه الترجمة =====
    languageSelect.addEventListener('change', function() {
        console.log('تم تغيير اتجاه الترجمة إلى:', this.value);
    });
});
