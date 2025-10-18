// Switch AI Provider (Legacy function - now handled by ApiKeyManager)
function switchAiProvider() {
    if (apiKeyManager) {
        const providerSelect = document.getElementById('aiProviderSelect');
        if (providerSelect) {
            apiKeyManager.switchProvider(providerSelect.value);
        }
    }
}

// Switch Gemini Model
function switchGeminiModel() {
    const modelSelect = document.getElementById('geminiModelSelect');
    if (!modelSelect) return;
    
    const model = modelSelect.value;
    appState.geminiModel = model;
    
    localStorage.setItem('aiIncubatorGeminiModel', model);
    
    const statusDiv = document.getElementById('apiStatus');
    if (statusDiv) {
        statusDiv.innerHTML = `✅ Модель изменена на: ${modelSelect.options[modelSelect.selectedIndex].text}`;
        statusDiv.style.color = 'var(--success-500)';
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    }
}

// Save Gemini API key
function saveGeminiApiKey() {
    const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
    const newApiKey = geminiApiKeyInput.value.trim();
    
    if (!newApiKey) {
        alert('❌ Введите Gemini API ключ!');
        return;
    }
    
    appState.geminiApiKey = newApiKey;
    localStorage.setItem('aiIncubatorGeminiApiKey', newApiKey);
    
    geminiApiKeyInput.style.borderColor = '#12B76A';
    geminiApiKeyInput.style.backgroundColor = '#F0FDF4';
    
    alert('✅ Gemini API key saved! Теперь вы можете общаться с ИИ Агент Ментор.');
    
    setTimeout(() => {
        geminiApiKeyInput.style.borderColor = '';
        geminiApiKeyInput.style.backgroundColor = '';
    }, 2000);
}

// Test Gemini API key
async function testGeminiApiKey() {
    const testBtn = document.getElementById('testGeminiApiBtn');
    const statusDiv = document.getElementById('apiStatus');
    
    if (!appState.geminiApiKey) {
        statusDiv.innerHTML = '❌ Сначала введите и сохраните Gemini API ключ';
        statusDiv.style.color = 'var(--error-500)';
        return;
    }
    
    testBtn.textContent = '⏳';
    testBtn.disabled = true;
    statusDiv.innerHTML = '🔄 Проверяем соединение с Gemini...';
    statusDiv.style.color = 'var(--muted)';
    
    try {
        // Сначала проверяем доступность API
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${appState.geminiApiKey}`, {
            method: 'GET'
        });
        
        if (!modelsResponse.ok) {
            let errorMessage = '❌ ';
            if (modelsResponse.status === 400) {
                errorMessage += 'Invalid format API ключа';
            } else if (modelsResponse.status === 403) {
                errorMessage += 'Неверный Gemini API ключ';
            } else if (modelsResponse.status === 429) {
                errorMessage += 'Превышен лимит запросов';
            } else {
                errorMessage += `Error: ${modelsResponse.status}`;
            }
            statusDiv.innerHTML = errorMessage;
            statusDiv.style.color = 'var(--error-500)';
            return;
        }
        
        // Теперь тестируем выбранную модель
        const model = appState.geminiModel || 'gemini-2.0-flash-exp';
        const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${appState.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Привет! Это тестовое сообщение.'
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 10
                }
            })
        });
        
        if (testResponse.ok) {
            statusDiv.innerHTML = `✅ Gemini API key works корректно (модель: ${model})`;
            statusDiv.style.color = 'var(--success-500)';
        } else {
            let errorMessage = '❌ ';
            if (testResponse.status === 400) {
                errorMessage += 'Модель недоступна или неверный запрос';
            } else if (testResponse.status === 403) {
                errorMessage += 'Доступ к модели запрещен';
            } else if (testResponse.status === 429) {
                errorMessage += 'Превышен лимит запросов для этой модели';
            } else {
                errorMessage += `Error модели: ${testResponse.status}`;
            }
            statusDiv.innerHTML = errorMessage;
            statusDiv.style.color = 'var(--error-500)';
        }
    } catch (error) {
        statusDiv.innerHTML = '❌ Error соединения с Gemini API';
        statusDiv.style.color = 'var(--error-500)';
    } finally {
        testBtn.textContent = 'Тест';
        testBtn.disabled = false;
    }
}

// Call Gemini API directly (without module context)
async function callGeminiDirect(prompt) {
    try {
        const model = appState.geminiModel || 'gemini-2.0-flash-exp';
        const apiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : appState.geminiApiKey;
        
        if (!apiKey) {
            throw new Error('API key not found. Пожалуйста, настройте API ключ в настройках.');
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 800
                }
            })
        });

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Invalid format запроса к Gemini API');
            } else if (response.status === 403) {
                throw new Error('Неверный API ключ Gemini или превышен лимит');
            } else if (response.status === 429) {
                // Попробуем переключиться на другую модель
                const fallbackModels = ['gemini-2.0-flash-exp', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
                const currentModelIndex = fallbackModels.indexOf(model);
                
                if (currentModelIndex >= 0 && currentModelIndex < fallbackModels.length - 1) {
                    const nextModel = fallbackModels[currentModelIndex + 1];
                    appState.geminiModel = nextModel;
                    localStorage.setItem('aiIncubatorGeminiModel', nextModel);
                    
                    // Обновляем селект
                    const modelSelect = document.getElementById('geminiModelSelect');
                    if (modelSelect) {
                        modelSelect.value = nextModel;
                    }
                    
                    throw new Error(`Превышен лимит для модели ${model}. Автоматически переключились на ${nextModel}. Попробуйте еще раз.`);
                } else {
                    throw new Error('Превышен лимит запросов для всех доступных моделей Gemini');
                }
            } else {
                throw new Error(`Error Gemini API: ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        // Проверяем структуру ответа более детально
        if (!data.candidates) {
            throw new Error('Ответ от Gemini не содержит candidates');
        }
        
        if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
            throw new Error('Ответ от Gemini содержит пустой массив candidates');
        }
        
        if (!data.candidates[0].content) {
            throw new Error('Ответ от Gemini не содержит content в первом candidate');
        }
        
        if (!data.candidates[0].content.parts || !Array.isArray(data.candidates[0].content.parts) || data.candidates[0].content.parts.length === 0) {
            throw new Error('Ответ от Gemini не содержит parts в content');
        }
        
        if (!data.candidates[0].content.parts[0].text) {
            throw new Error('Ответ от Gemini не содержит text в parts');
        }
        
        let responseText = data.candidates[0].content.parts[0].text;
        
        // Ограничиваем ответ до 2000 символов
        if (responseText.length > 2000) {
            responseText = responseText.substring(0, 1997) + '...';
        }
        
        return responseText;
    } catch (error) {
        throw error;
    }
}

// Call OpenAI API directly (without module context)
async function callOpenAIDirect(prompt) {
    try {
        const apiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : appState.apiKey;
        
        if (!apiKey) {
            throw new Error('API key not found. Пожалуйста, настройте API ключ в настройках.');
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты эксперт по анализу бизнес-идей. ВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Неверный API ключ. Проверьте правильность ключа.');
            } else if (response.status === 429) {
                throw new Error('Превышен лимит запросов. Попробуйте позже.');
            } else if (response.status === 403) {
                throw new Error('Доступ запрещен. Проверьте настройки аккаунта OpenAI.');
            } else {
                throw new Error(`Error API: ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Неожиданный формат ответа от OpenAI');
        }
        
        let responseText = data.choices[0].message.content;
        
        // Ограничиваем ответ до 2000 символов
        if (responseText.length > 2000) {
            responseText = responseText.substring(0, 1997) + '...';
        }
        
        return responseText;
    } catch (error) {
        throw error;
    }
}

// Call Gemini API
async function callGemini(userMessage) {
    const currentModule = appState.modules[appState.currentModule];
    
    try {
        const model = appState.geminiModel || 'gemini-2.0-flash-exp';
        const apiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : appState.geminiApiKey;
        
        if (!apiKey) {
            throw new Error('API key not found. Пожалуйста, настройте API ключ в настройках.');
        }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const requestData = {
            contents: [{
                parts: [{
                    text: `${currentModule.systemPrompt}\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nКонтекст проекта: ${appState.userIdeaText}\n\nВопрос пользователя: ${userMessage}`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 800
            }
        };
        
        // Log the request
        const requestId = window.apiLogger ? window.apiLogger.logRequest(url, requestData, 'POST') : null;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            // Log error response
            if (window.apiLogger && requestId) {
                window.apiLogger.logResponse(requestId, null, false, `HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (response.status === 400) {
                throw new Error('Invalid format запроса к Gemini API');
            } else if (response.status === 403) {
                throw new Error('Неверный API ключ Gemini или превышен лимит');
            } else if (response.status === 429) {
                // Попробуем переключиться на другую модель
                const fallbackModels = ['gemini-2.0-flash-exp', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
                const currentModelIndex = fallbackModels.indexOf(model);
                
                if (currentModelIndex >= 0 && currentModelIndex < fallbackModels.length - 1) {
                    const nextModel = fallbackModels[currentModelIndex + 1];
                    appState.geminiModel = nextModel;
                    localStorage.setItem('aiIncubatorGeminiModel', nextModel);
                    
                    // Обновляем селект
                    const modelSelect = document.getElementById('geminiModelSelect');
                    if (modelSelect) {
                        modelSelect.value = nextModel;
                    }
                    
                    throw new Error(`Превышен лимит для модели ${model}. Автоматически переключились на ${nextModel}. Попробуйте еще раз.`);
                } else {
                    throw new Error('Превышен лимит запросов для всех доступных моделей Gemini');
                }
            } else {
                throw new Error(`Error Gemini API: ${response.status}`);
            }
        }

        const data = await response.json();
        
        // Log successful response
        if (window.apiLogger && requestId) {
            window.apiLogger.logResponse(requestId, data, true);
        }
        
        // Логируем ответ для отладки (только в режиме разработки)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Gemini API Response:', data);
        }
        
        if (data.error) {
            // Log error in response data
            if (window.apiLogger && requestId) {
                window.apiLogger.logResponse(requestId, data, false, data.error.message);
            }
            throw new Error(data.error.message);
        }
        
        // Проверяем структуру ответа более детально
        if (!data.candidates) {
            throw new Error('Ответ от Gemini не содержит candidates');
        }
        
        if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
            throw new Error('Ответ от Gemini содержит пустой массив candidates');
        }
        
        if (!data.candidates[0].content) {
            throw new Error('Ответ от Gemini не содержит content в первом candidate');
        }
        
        if (!data.candidates[0].content.parts || !Array.isArray(data.candidates[0].content.parts) || data.candidates[0].content.parts.length === 0) {
            throw new Error('Ответ от Gemini не содержит parts в content');
        }
        
        if (!data.candidates[0].content.parts[0].text) {
            throw new Error('Ответ от Gemini не содержит text в parts');
        }
        
        let responseText = data.candidates[0].content.parts[0].text;
        
        // Ограничиваем ответ до 2000 символов
        if (responseText.length > 2000) {
            responseText = responseText.substring(0, 1997) + '...';
        }
        
        return responseText;
    } catch (error) {
        throw error;
    }
}

// Call OpenAI API
async function callOpenAI(userMessage) {
    const currentModule = appState.modules[appState.currentModule];
    
    try {
        const apiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : appState.apiKey;
        
        if (!apiKey) {
            throw new Error('API key not found. Пожалуйста, настройте API ключ в настройках.');
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `${currentModule.systemPrompt}\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nКонтекст проекта пользователя: ${appState.userIdeaText}`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Неверный API ключ. Проверьте правильность ключа.');
            } else if (response.status === 429) {
                throw new Error('Превышен лимит запросов. Попробуйте позже.');
            } else if (response.status === 403) {
                throw new Error('Доступ запрещен. Проверьте настройки аккаунта OpenAI.');
            } else {
                throw new Error(`Error API: ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Неожиданный формат ответа от OpenAI');
        }
        
        let responseText = data.choices[0].message.content;
        
        // Ограничиваем ответ до 2000 символов
        if (responseText.length > 2000) {
            responseText = responseText.substring(0, 1997) + '...';
        }
        
        return responseText;
    } catch (error) {
        throw error;
    }
}

// Test OpenAI API key
async function testApiKey() {
    const testBtn = document.getElementById('testApiBtn');
    const statusDiv = document.getElementById('apiStatus');
    
    if (!appState.apiKey) {
        statusDiv.innerHTML = '❌ Сначала введите и сохраните API ключ';
        statusDiv.style.color = 'var(--error-500)';
        return;
    }
    
    testBtn.textContent = '⏳';
    testBtn.disabled = true;
    statusDiv.innerHTML = '🔄 Проверяем соединение...';
    statusDiv.style.color = 'var(--muted)';
    
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${appState.apiKey}`
            }
        });
        
        if (response.ok) {
            statusDiv.innerHTML = '✅ API key works корректно';
            statusDiv.style.color = 'var(--success-500)';
        } else {
            let errorMessage = '❌ ';
            if (response.status === 401) {
                errorMessage += 'Неверный API ключ';
            } else if (response.status === 429) {
                errorMessage += 'Превышен лимит запросов';
            } else if (response.status === 403) {
                errorMessage += 'No доступа к API';
            } else {
                errorMessage += `Error: ${response.status}`;
            }
            statusDiv.innerHTML = errorMessage;
            statusDiv.style.color = 'var(--error-500)';
        }
    } catch (error) {
        statusDiv.innerHTML = '❌ Error соединения с OpenAI';
        statusDiv.style.color = 'var(--error-500)';
    } finally {
        testBtn.textContent = 'Тест';
        testBtn.disabled = false;
    }
}

// Save OpenAI API key
function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const newApiKey = apiKeyInput.value.trim();
    
    if (!newApiKey) {
        alert('❌ Введите API ключ!');
        return;
    }
    
    if (!newApiKey.startsWith('sk-')) {
        alert('❌ API ключ должен начинаться с "sk-". Проверьте правильность ключа.');
        return;
    }
    
    appState.apiKey = newApiKey;
    localStorage.setItem('aiIncubatorApiKey', newApiKey);
    
    apiKeyInput.style.borderColor = '#12B76A';
    apiKeyInput.style.backgroundColor = '#F0FDF4';
    
    alert('✅ API key saved! Теперь вы можете общаться с ИИ Агент Ментор.');
    
    setTimeout(() => {
        apiKeyInput.style.borderColor = '';
        apiKeyInput.style.backgroundColor = '';
    }, 2000);
}
