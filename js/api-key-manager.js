// API Key Manager
class ApiKeyManager {
    constructor() {
        this.readyKeys = null;
        this.currentKeyMode = 'ready'; // 'ready' или 'custom'
        this.currentProvider = 'gemini'; // 'gemini' или 'openai'
        this.currentReadyKey = null;
    }

    // Загрузка готовых ключей
    async loadReadyKeys() {
        try {
            console.log('Loading ready keys...');
            const response = await fetch('api-keys.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.readyKeys = await response.json();
            console.log('Ready keys loaded from file:', this.readyKeys);
            
            // Принудительно обновляем UI после загрузки ключей
            setTimeout(() => {
                this.updateReadyKeysUI();
            }, 100);
            
        } catch (error) {
            console.error('Loading error готовых ключей из файла:', error);
            console.log('Используем встроенные ключи как fallback');
            
            // Fallback - используем встроенные ключи
            this.readyKeys = {
                "providers": {
                    "openai": {
                        "name": "OpenAI",
                        "description": "GPT-4 и другие модели OpenAI",
                        "keys": [
                            {
                                "id": "openai-1",
                                "name": "OpenAI Key 1",
                                "key": "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                                "status": "active",
                                "usage": "low"
                            },
                            {
                                "id": "openai-2", 
                                "name": "OpenAI Key 2",
                                "key": "sk-proj-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
                                "status": "active",
                                "usage": "medium"
                            }
                        ]
                    },
                    "gemini": {
                        "name": "Google Gemini",
                        "description": "Gemini Pro и другие модели Google",
                        "keys": [
                            {
                                "id": "gemini-1",
                                "name": "Gemini Key 1", 
                                "key": "AIzaSyDoIz5LeODU_yBAV8tDPlD6khQJ82jTTIQ",
                                "status": "active",
                                "usage": "low"
                            },
                            {
                                "id": "gemini-2",
                                "name": "Gemini Key 2",
                                "key": "AIzaSyAF627YrxFAH6cEJjg4osbSWtVKcjSD7mo",
                                "status": "active", 
                                "usage": "medium"
                            }
                        ]
                    }
                },
                "settings": {
                    "autoRotate": true,
                    "maxUsagePerKey": 1000,
                    "fallbackToCustom": true
                }
            };
            
            console.log('Fallback keys loaded:', this.readyKeys);
            
            // Принудительно обновляем UI после загрузки fallback ключей
            setTimeout(() => {
                this.updateReadyKeysUI();
            }, 100);
        }
    }

    // Получение доступного ключа для провайдера
    getAvailableKey(provider) {
        console.log('getAvailableKey called for provider:', provider);
        console.log('this.readyKeys exists:', !!this.readyKeys);
        
        if (!this.readyKeys) {
            console.log('No ready keys loaded');
            return null;
        }
        
        console.log('Available providers:', Object.keys(this.readyKeys.providers || {}));
        
        if (!this.readyKeys.providers[provider]) {
            console.log('No ready keys for provider:', provider);
            return null;
        }

        const keys = this.readyKeys.providers[provider].keys;
        console.log('Keys for provider:', provider, keys);
        
        const availableKey = keys.find(key => {
            console.log(`Checking key ${key.id}: status=${key.status}, usage=${key.usage}`);
            return key.status === 'active' && key.usage !== 'high';
        });

        console.log('Selected available key:', availableKey);
        return availableKey || null;
    }

    // Переключение режима ключей
    switchKeyMode(mode) {
        console.log('switchKeyMode called with:', mode);
        this.currentKeyMode = mode;
        localStorage.setItem('aiIncubatorKeyMode', mode);
        this.updateUI();
    }

    // Переключение провайдера
    switchProvider(provider) {
        console.log('Switching provider to:', provider);
        this.currentProvider = provider;
        localStorage.setItem('aiIncubatorProvider', provider);
        
        // Сбрасываем выбранный готовый ключ при смене провайдера
        this.currentReadyKey = null;
        localStorage.removeItem(`aiIncubatorReadyKey_${provider}`);
        
        this.updateUI();
    }

    // Выбор готового ключа
    selectReadyKey(keyId) {
        console.log('selectReadyKey called with:', keyId);
        
        if (!this.readyKeys) {
            console.log('No ready keys available');
            return;
        }

        const provider = this.currentProvider;
        const key = this.readyKeys.providers[provider].keys.find(k => k.id === keyId);
        
        if (key) {
            this.currentReadyKey = key;
            localStorage.setItem(`aiIncubatorReadyKey_${provider}`, keyId);
            console.log('Selected key:', key.name);
            this.updateReadyKeysUI(); // Обновляем только UI ключей
        } else {
            console.log('Key not found:', keyId);
        }
    }

    // Получение текущего активного ключа
    getCurrentKey() {
        console.log('getCurrentKey called, mode:', this.currentKeyMode, 'provider:', this.currentProvider);
        
        if (this.currentKeyMode === 'ready') {
            console.log('Mode is ready, currentReadyKey:', this.currentReadyKey);
            if (this.currentReadyKey) {
                console.log('Using selected ready key:', this.currentReadyKey.name, 'key:', this.currentReadyKey.key?.substring(0, 10) + '...');
                return this.currentReadyKey.key;
            }
            // Если нет выбранного ключа, берем первый доступный
            console.log('No currentReadyKey, looking for available key for provider:', this.currentProvider);
            const availableKey = this.getAvailableKey(this.currentProvider);
            if (availableKey) {
                this.currentReadyKey = availableKey;
                console.log('Using auto-selected ready key:', availableKey.name, 'key:', availableKey.key?.substring(0, 10) + '...');
                return availableKey.key;
            }
            console.log('No available ready keys for provider:', this.currentProvider);
        }
        
        // Возвращаем пользовательский ключ
        if (this.currentProvider === 'gemini') {
            const key = localStorage.getItem('aiIncubatorGeminiApiKey') || '';
            console.log('Using custom Gemini key:', key ? 'found' : 'not found');
            return key;
        } else {
            const key = localStorage.getItem('aiIncubatorApiKey') || '';
            console.log('Using custom OpenAI key:', key ? 'found' : 'not found');
            return key;
        }
    }

    // Обновление UI
    updateUI() {
        console.log('updateUI called');
        this.updateKeyModeUI();
        this.updateProviderUI();
        this.updateReadyKeysUI();
    }

    // Обновление UI режима ключей
    updateKeyModeUI() {
        console.log('updateKeyModeUI called, mode:', this.currentKeyMode);
        
        const readyModeBtn = document.getElementById('readyKeyModeBtn');
        const customModeBtn = document.getElementById('customKeyModeBtn');
        const readySection = document.getElementById('readyKeysSection');
        const customSection = document.getElementById('customKeysSection');

        console.log('Elements found:', {
            readyModeBtn: !!readyModeBtn,
            customModeBtn: !!customModeBtn,
            readySection: !!readySection,
            customSection: !!customSection
        });

        if (readyModeBtn && customModeBtn) {
            if (this.currentKeyMode === 'ready') {
                readyModeBtn.classList.add('active');
                customModeBtn.classList.remove('active');
                if (readySection) readySection.style.display = 'block';
                if (customSection) customSection.style.display = 'none';
                console.log('Switched to ready mode');
            } else {
                readyModeBtn.classList.remove('active');
                customModeBtn.classList.add('active');
                if (readySection) readySection.style.display = 'none';
                if (customSection) customSection.style.display = 'block';
                console.log('Switched to custom mode');
            }
        }
    }

    // Обновление UI провайдера
    updateProviderUI() {
        console.log('updateProviderUI called, provider:', this.currentProvider);
        
        const geminiSection = document.getElementById('geminiApiSection');
        const openaiSection = document.getElementById('openaiApiSection');
        const geminiModelSection = document.getElementById('geminiModelSection');
        const aiProviderSelect = document.getElementById('aiProviderSelect');

        console.log('Elements found:', {
            geminiSection: !!geminiSection,
            openaiSection: !!openaiSection,
            geminiModelSection: !!geminiModelSection,
            aiProviderSelect: !!aiProviderSelect
        });

        // Обновляем селект провайдера
        if (aiProviderSelect) {
            aiProviderSelect.value = this.currentProvider;
        }

        if (geminiSection && openaiSection && geminiModelSection) {
            if (this.currentProvider === 'gemini') {
                geminiSection.style.display = 'block';
                geminiModelSection.style.display = 'block';
                openaiSection.style.display = 'none';
                console.log('Switched to Gemini');
            } else {
                geminiSection.style.display = 'none';
                geminiModelSection.style.display = 'none';
                openaiSection.style.display = 'block';
                console.log('Switched to OpenAI');
            }
        }
    }

    // Обновление UI готовых ключей
    updateReadyKeysUI() {
        console.log('updateReadyKeysUI called');
        console.log('readyKeys:', this.readyKeys);
        
        const container = document.getElementById('readyKeysContainer');
        console.log('Container found:', !!container);

        if (!container) {
            console.log('Container not found, retrying in 100ms...');
            setTimeout(() => this.updateReadyKeysUI(), 100);
            return;
        }

        if (!this.readyKeys) {
            console.log('No ready keys available - keeping static buttons');
            // Не очищаем контейнер, если ключи не загружены - оставляем статические кнопки
            return;
        }

        const provider = this.currentProvider;
        console.log('Current provider:', provider);
        
        const keys = this.readyKeys.providers[provider]?.keys || [];
        console.log('Keys for provider:', keys);

        if (keys.length === 0) {
            console.log('No keys for provider - keeping static buttons');
            return;
        }

        // Очищаем контейнер только если есть загруженные ключи
        container.innerHTML = '';

        keys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'ready-key-item';
            keyElement.innerHTML = `
                <div class="ready-key-info">
                    <div class="ready-key-name">${key.name}</div>
                    <div class="ready-key-status ${key.status}">${this.getStatusText(key.status)}</div>
                    <div class="ready-key-usage ${key.usage}">${this.getUsageText(key.usage)}</div>
                </div>
                <button class="btn secondary btn-sm" onclick="window.apiKeyManager.selectReadyKey('${key.id}')" 
                        ${this.currentReadyKey?.id === key.id ? 'disabled' : ''}>
                    ${this.currentReadyKey?.id === key.id ? 'Выбран' : 'Select'}
                </button>
            `;
            container.appendChild(keyElement);
        });
        
        console.log('Updated ready keys UI with', keys.length, 'keys');
    }

    // Получение текста статуса
    getStatusText(status) {
        const statusMap = {
            'active': '✅ Активен',
            'inactive': '❌ Неактивен',
            'error': '⚠️ Error'
        };
        return statusMap[status] || status;
    }

    // Получение текста использования
    getUsageText(usage) {
        const usageMap = {
            'low': '🟢 Низкая нагрузка',
            'medium': '🟡 Средняя нагрузка',
            'high': '🔴 Высокая нагрузка'
        };
        return usageMap[usage] || usage;
    }

    // Тестирование ключа
    async testKey() {
        console.log('testKey called');
        console.log('Current state:', {
            currentKeyMode: this.currentKeyMode,
            currentProvider: this.currentProvider,
            currentReadyKey: this.currentReadyKey,
            readyKeysLoaded: !!this.readyKeys
        });
        
        const key = this.getCurrentKey();
        
        if (!key) {
            console.log('No key available');
            console.log('Debug info:', {
                mode: this.currentKeyMode,
                provider: this.currentProvider,
                readyKey: this.currentReadyKey,
                readyKeysExist: !!this.readyKeys
            });
            this.showStatus('❌ No доступного ключа', 'error');
            return;
        }

        console.log('Testing key for provider:', this.currentProvider);
        this.showStatus('🔄 Тестируем ключ...', 'loading');

        try {
            if (this.currentProvider === 'gemini') {
                await this.testGeminiKey(key);
            } else {
                await this.testOpenAIKey(key);
            }
        } catch (error) {
            console.error('Test failed:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }

    // Тестирование Gemini ключа
    async testGeminiKey(key) {
        console.log('Testing Gemini key with model:', appState.geminiModel || 'gemini-2.0-flash-exp');
        const model = appState.geminiModel || 'gemini-2.0-flash-exp';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const requestData = {
            contents: [{ parts: [{ text: 'Тест' }] }],
            generationConfig: { maxOutputTokens: 10 }
        };
        
        // Log the request (for testing module)
        const requestId = window.apiLogger ? window.apiLogger.logRequest(url, requestData, 'POST') : null;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        console.log('Gemini test response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            // Log successful response
            if (window.apiLogger && requestId) {
                window.apiLogger.logResponse(requestId, data, true);
            }
            this.showStatus('✅ Ключ работает корректно', 'success');
        } else {
            const errorText = await response.text();
            // Log error response
            if (window.apiLogger && requestId) {
                window.apiLogger.logResponse(requestId, null, false, `API error: ${response.status} - ${errorText}`);
            }
            console.error('Gemini test error:', errorText);
            throw new Error(`Error API: ${response.status}`);
        }
    }

    // Тестирование OpenAI ключа
    async testOpenAIKey(key) {
        console.log('Testing OpenAI key');
        const url = 'https://api.openai.com/v1/models';
        
        // Log the request (for testing module)
        const requestId = window.apiLogger ? window.apiLogger.logRequest(url, { test: 'OpenAI key test' }, 'GET') : null;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${key}` }
        });

        console.log('OpenAI test response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            // Log successful response
            if (window.apiLogger && requestId) {
                window.apiLogger.logResponse(requestId, data, true);
            }
            this.showStatus('✅ Ключ работает корректно', 'success');
        } else {
            const errorText = await response.text();
            // Log error response
            if (window.apiLogger && requestId) {
                window.apiLogger.logResponse(requestId, null, false, `API error: ${response.status} - ${errorText}`);
            }
            console.error('OpenAI test error:', errorText);
            throw new Error(`Error API: ${response.status}`);
        }
    }

    // Show статус
    showStatus(message, type = 'info') {
        console.log('showStatus:', message, type);
        const statusDiv = document.getElementById('apiStatus');
        if (statusDiv) {
            statusDiv.innerHTML = message;
            statusDiv.className = `api-status ${type}`;
            
            if (type === 'success') {
                setTimeout(() => {
                    statusDiv.innerHTML = '';
                    statusDiv.className = 'api-status';
                }, 3000);
            }
        } else {
            console.log('Status div not found');
        }
    }

    // Инициализация
    async init() {
        // Ждем загрузки готовых ключей
        if (!this.readyKeys) {
            await this.loadReadyKeys();
        }
        
        // Загружаем сохраненные настройки
        const savedMode = localStorage.getItem('aiIncubatorKeyMode');
        if (savedMode) this.currentKeyMode = savedMode;

        const savedProvider = localStorage.getItem('aiIncubatorProvider');
        if (savedProvider) this.currentProvider = savedProvider;

        const savedReadyKey = localStorage.getItem(`aiIncubatorReadyKey_${this.currentProvider}`);
        if (savedReadyKey && this.readyKeys) {
            this.currentReadyKey = this.readyKeys.providers[this.currentProvider]?.keys.find(k => k.id === savedReadyKey);
        }

        this.updateUI();
    }
}

// Глобальный экземпляр менеджера
let apiKeyManager;

// Функции для вызова из HTML
function switchKeyMode(mode) {
    if (apiKeyManager) {
        apiKeyManager.switchKeyMode(mode);
    }
}

function switchProvider(provider) {
    if (apiKeyManager) {
        apiKeyManager.switchProvider(provider);
    }
}

function testCurrentKey() {
    if (apiKeyManager) {
        apiKeyManager.testKey();
    }
}

// Функция для отладки в консоли
window.debugApiKeys = function() {
    console.log('=== API Keys Debug ===');
    console.log('apiKeyManager exists:', !!window.apiKeyManager);
    if (window.apiKeyManager) {
        console.log('readyKeys loaded:', !!window.apiKeyManager.readyKeys);
        console.log('currentProvider:', window.apiKeyManager.currentProvider);
        console.log('currentKeyMode:', window.apiKeyManager.currentKeyMode);
        console.log('currentReadyKey:', window.apiKeyManager.currentReadyKey);
        console.log('readyKeys data:', window.apiKeyManager.readyKeys);
        
        // Принудительно обновляем UI
        window.apiKeyManager.updateReadyKeysUI();
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - initializing API Key Manager');
    apiKeyManager = new ApiKeyManager();
    window.apiKeyManager = apiKeyManager; // Делаем глобальным
    await apiKeyManager.init();
    console.log('API Key Manager initialized successfully');
    
    // Дополнительная попытка обновить UI через secунду
    setTimeout(() => {
        console.log('Force updating UI after 1 second');
        if (apiKeyManager) {
            apiKeyManager.updateReadyKeysUI();
        }
    }, 1000);
    
    console.log('You can run debugApiKeys() in console to debug');
});
