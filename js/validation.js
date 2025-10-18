// Validation Module Logic

// Validation Module Button Configuration
function getValidationButtonConfig() {
    return {
        id: 'validationBtn',
        text: '🎯 Валидировать свою идею',
        onclick: 'validateIdea()',
        prompt: `Вы - ведущий эксперт по валидации стартапов с 15-летним опытом работы в топовых инкубаторах (Y Combinator, Techstars, 500 Startups). 

Ваша задача - провести профессиональную валидацию бизнес-идеи по всем стандартам стартап-индустрии.

КОНТЕКСТ ПРОЕКТА:
${getProjectContext()}

ТВОЯ ЭКСПЕРТИЗА:
- 15+ лет опыта в валидации стартапов
- Работа с топовыми инкубаторами и акселераторами
- Анализ 1000+ стартапов на разных стадиях
- Экспертиза в Lean Startup методологии

ЗАДАЧИ ДЛЯ ВАЛИДАЦИИ:
1. **Problem-Solution Fit** - Анализ проблемы и решения
2. **Market Opportunity** - Оценка рыночных возможностей  
3. **Competitive Landscape** - Конкурентный анализ
4. **Business Viability** - Жизнеспособность бизнес-модели
5. **Execution Risk** - Риски реализации

МЕТОДОЛОГИЯ:
- Применяй фреймворки Problem-Solution Fit и Product-Market Fit
- Используй критерии оценки от ведущих VC фондов
- Ищи подтверждение гипотез данными и фактами
- Выявляй red flags и potential blockers

Проведи детальный анализ и дай профессиональную оценку идеи с конкретными рекомендациями.`
    };
}
let validationState = {
    currentTopicIndex: 0,
    totalScore: 100,
    guidingQuestionsUsed: 0,
    maxGuidingQuestions: 4,
    pointsPerGuidingQuestion: 7,
    currentQuestionIndex: 0,
    reviewQuestions: [],
    userAnswers: [],
    aiFeedback: []
};

// Initialize validation state
function initValidationState() {
    const validationModule = appState.modules.find(m => m.id === 'validation');
    if (validationModule && validationModule.validationState) {
        validationState = { ...validationModule.validationState };
    }
}

// Show popup notification for new topic unlock
function showTopicUnlockPopup(topic) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'topic-unlock-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <span class="popup-icon">🎉</span>
                <h4>Новый топик открыт!</h4>
                <button class="popup-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="popup-body">
                <h5>${topic.title}</h5>
                <p>${topic.description}</p>
            </div>
            <div class="popup-footer">
                <button class="btn primary" onclick="selectTopicAndClosePopup('${topic.id}', this)">Перейти к следующему топику</button>
                <button class="btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Позже</button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(popup);
    
    // Auto-remove after 10 seconds (увеличили время)
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 10000);
}

// Show popup notification for review topic unlock
function showReviewTopicPopup(topic) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'topic-unlock-popup review';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <span class="popup-icon">🎯</span>
                <h4>Финальный этап!</h4>
                <button class="popup-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="popup-body">
                <h5>${topic.title}</h5>
                <p>${topic.description}</p>
                <p><strong>Нажмите на топик, чтобы начать проверку знаний!</strong></p>
            </div>
            <div class="popup-footer">
                <button class="btn primary" onclick="this.parentElement.parentElement.parentElement.remove()">Понятно</button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(popup);
    
    // Auto-remove after 8 seconds (longer for review topic)
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 8000);
}

// Update topic progress and unlock next topic if needed
function updateTopicProgress(topicId) {
    const validationModule = appState.modules.find(m => m.id === 'validation');
    if (!validationModule) return;

    const topic = validationModule.topics.find(t => t.id === topicId);
    if (!topic) return;

    topic.completedQuestions++;
    
    // Check if topic is completed (4 button clicks)
    if (topic.completedQuestions >= 4) {
        topic.status = 'completed';
        
        // Unlock next topic
        const nextTopicIndex = validationModule.topics.findIndex(t => t.id === topicId) + 1;
        if (nextTopicIndex < validationModule.topics.length) {
            const nextTopic = validationModule.topics[nextTopicIndex];
            nextTopic.status = 'active';
            
            // Show popup notification about new topic
            showTopicUnlockPopup(nextTopic);
        }
        
        // If this was the last regular topic, unlock review topic
        if (nextTopicIndex === validationModule.topics.length - 1) {
            const reviewTopic = validationModule.topics[nextTopicIndex];
            if (reviewTopic.isReviewTopic) {
                reviewTopic.status = 'active';
                showReviewTopicPopup(reviewTopic);
            }
        }
    }
    
    // Update validation state
    validationModule.validationState = { ...validationState };
    
    // Re-render topics
    renderTopics(validationModule.topics);
}

// Start review topic with AI questions
async function startReviewTopic() {
    validationState.currentQuestionIndex = 0;
    validationState.reviewQuestions = [];
    validationState.userAnswers = [];
    validationState.aiFeedback = [];
    
    // Generate review questions based on user's idea
    await generateReviewQuestions();
    
    // Show first question
    if (validationState.reviewQuestions.length > 0) {
        showReviewQuestion(validationState.reviewQuestions[0]);
    }
}

// Generate review questions using AI
async function generateReviewQuestions() {
    const ideaData = appState.projectData?.idea || 'No данных об идее';
    
    const prompt = `На основе следующей бизнес-идеи создай 10 контрольных вопросов для проверки знаний по валидации бизнес-идей:

Идея: ${ideaData}

Создай вопросы, которые:
1. Проверяют понимание методологии валидации
2. Связаны с анализом проблемы и целевой аудитории
3. Касаются конкурентного анализа
4. Требуют развернутых ответов на естественном языке

ВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.

Верни только список вопросов, каждый с новой строки, начиная с номера.`;

    try {
        const response = await callAI(prompt);
        const questions = response.split('\n').filter(q => q.trim() && /^\d+\./.test(q.trim()));
        validationState.reviewQuestions = questions.map(q => q.replace(/^\d+\.\s*/, ''));
    } catch (error) {
        console.error('Error generating review questions:', error);
        // Fallback questions
        validationState.reviewQuestions = [
            'Что такое валидация бизнес-идеи и зачем она нужна?',
            'Как определить, является ли проблема достаточно критичной для решения?',
            'Какие методы используются для выявления целевой аудитории?',
            'Как провести эффективный конкурентный анализ?',
            'Что такое MVP и как его использовать для валидации?',
            'Какие метрики важны при валидации идеи?',
            'Как определить готовность рынка платить за решение?',
            'Что такое Customer Development и как его применять?',
            'Как оценить размер рынка для вашей идеи?',
            'Какие ошибки чаще всего допускают при валидации идей?'
        ];
    }
}

// Show review question in chat
function showReviewQuestion(question) {
    addMessage(`**Вопрос ${validationState.currentQuestionIndex + 1}:** ${question}`, 'assistant');
    
    // Show special input for review answers
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.placeholder = 'Введите ваш развернутый ответ...';
        chatInput.dataset.reviewMode = 'true';
    }
}

// Process review answer with AI feedback
async function processReviewAnswer(userAnswer) {
    const currentQuestion = validationState.reviewQuestions[validationState.currentQuestionIndex];
    
    // Store user answer
    validationState.userAnswers.push(userAnswer);
    
    // Get AI feedback
    const feedback = await getAIAnswerFeedback(currentQuestion, userAnswer);
    validationState.aiFeedback.push(feedback);
    
    // Check if answer is satisfactory
    if (feedback.isCorrect && !feedback.needsGuiding) {
        // Answer is correct, move to next question
        validationState.currentQuestionIndex++;
        
        if (validationState.currentQuestionIndex < validationState.reviewQuestions.length) {
            showReviewQuestion(validationState.reviewQuestions[validationState.currentQuestionIndex]);
        } else {
            // All questions completed
            completeValidationModule();
        }
    } else {
        // Answer needs improvement, show guiding questions
        if (validationState.guidingQuestionsUsed < validationState.maxGuidingQuestions) {
            showGuidingQuestions(feedback.guidingQuestions);
        } else {
            // Max guiding questions reached, move to next question
            validationState.currentQuestionIndex++;
            if (validationState.currentQuestionIndex < validationState.reviewQuestions.length) {
                showReviewQuestion(validationState.reviewQuestions[validationState.currentQuestionIndex]);
            } else {
                completeValidationModule();
            }
        }
    }
}

// Get AI feedback on user answer
async function getAIAnswerFeedback(question, userAnswer) {
    const prompt = `Оцени ответ пользователя на вопрос по валидации бизнес-идей.

Вопрос: ${question}
Ответ пользователя: ${userAnswer}

Проанализируй ответ по следующим критериям:
1. Полнота ответа (охватывает ли все аспекты вопроса)
2. Точность информации
3. Глубина понимания темы
4. Практическая применимость

ВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.

Верни JSON в следующем формате:
{
  "isCorrect": true/false,
  "needsGuiding": true/false,
  "score": число от 0 до 100,
  "feedback": "краткий комментарий",
  "guidingQuestions": ["наводящий вопрос 1", "наводящий вопрос 2"]
}

Если ответ правильный и полный, isCorrect=true, needsGuiding=false.
Если ответ неполный или неточный, isCorrect=false, needsGuiding=true, и предоставь 1-2 наводящих вопроса.`;

    try {
        const response = await callAI(prompt);
        const feedback = JSON.parse(response);
        return feedback;
    } catch (error) {
        console.error('Error getting AI feedback:', error);
        return {
            isCorrect: true,
            needsGuiding: false,
            score: 80,
            feedback: 'Ответ принят',
            guidingQuestions: []
        };
    }
}

// Show guiding questions
function showGuidingQuestions(guidingQuestions) {
    validationState.guidingQuestionsUsed++;
    validationState.totalScore -= validationState.pointsPerGuidingQuestion;
    
    let message = `**Наводящие вопросы для улучшения ответа:**\n\n`;
    guidingQuestions.forEach((q, index) => {
        message += `${index + 1}. ${q}\n`;
    });
    message += `\n*Баллы за наводящие вопросы: -${validationState.pointsPerGuidingQuestion} (осталось: ${validationState.totalScore})*`;
    
    addMessage(message, 'assistant');
}

// Complete validation module
function completeValidationModule() {
    const finalScore = Math.max(0, validationState.totalScore);
    
    const completionMessage = `## 🎉 Модуль валидации завершен!

**Итоговый балл:** ${finalScore}/100

**Статистика:**
- Вопросов пройдено: ${validationState.reviewQuestions.length}
- Наводящих вопросов использовано: ${validationState.guidingQuestionsUsed}
- Баллов снято: ${100 - finalScore}

**Сертификат валидации:**
${getValidationCertificate(finalScore)}

<button class="btn primary" onclick="generateValidationReport()">Сгенерировать отчет</button>
<button class="btn secondary" onclick="nextModule()">Перейти к следующему модулю</button>`;

    addMessage(completionMessage, 'assistant');
    
    // Save validation results to appState
    appState.validationAnswers = {
        finalScore: finalScore,
        timestamp: new Date().toISOString(),
        metrics: {
            questionsAnswered: validationState.reviewQuestions.length,
            guidingQuestionsUsed: validationState.guidingQuestionsUsed,
            pointsDeducted: 100 - finalScore
        },
        userAnswers: validationState.userAnswers,
        aiFeedback: validationState.aiFeedback,
        ideaData: appState.projectData?.idea || 'No данных'
    };
    
    // Update validation indicator
    if (typeof updateValidationIndicator === 'function') {
        updateValidationIndicator();
    }
    
    // Update module status
    const validationModule = appState.modules.find(m => m.id === 'validation');
    if (validationModule) {
        validationModule.status = 'completed';
        validationModule.progress = 100;
        renderModuleList();
    }
}

// Get validation certificate based on score
function getValidationCertificate(score) {
    if (score >= 90) {
        return "🏆 **Отлично!** Вы показали глубокое понимание валидации бизнес-идей.";
    } else if (score >= 75) {
        return "🥇 **Хорошо!** Вы хорошо усвоили основные принципы валидации.";
    } else if (score >= 60) {
        return "🥈 **Удовлетворительно.** Вы понимаете основы валидации, но есть области для улучшения.";
    } else {
        return "📚 **Требует доработки.** Рекомендуется повторить материал по валидации.";
    }
}

// Generate validation report and save to JSON
async function generateValidationReport() {
    const report = {
        module: 'validation',
        completedAt: new Date().toISOString(),
        finalScore: validationState.totalScore,
        statistics: {
            questionsAnswered: validationState.reviewQuestions.length,
            guidingQuestionsUsed: validationState.guidingQuestionsUsed,
            pointsDeducted: 100 - validationState.totalScore
        },
        userAnswers: validationState.userAnswers,
        aiFeedback: validationState.aiFeedback,
        ideaData: appState.projectData?.idea || 'No данных',
        aiVerdict: await generateAIVerdict()
    };
    
    // Save to file
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📄 **Отчет сгенерирован и сохранен!** File loaded в корневую папку проекта.', 'assistant');
}

// Generate AI verdict on the idea
async function generateAIVerdict() {
    const ideaData = appState.projectData?.idea || 'No данных об идее';
    const userAnswers = validationState.userAnswers.join('\n\n');
    
    const prompt = `На основе бизнес-идеи и ответов пользователя на вопросы валидации, дай свой вердикт:

**Идея:** ${ideaData}

**Ответы пользователя на вопросы валидации:**
${userAnswers}

**Итоговый балл:** ${validationState.totalScore}/100

ВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.

Yesй краткий, но обоснованный вердикт о жизнеспособности идеи (1-2 абзаца).`;

    try {
        const verdict = await callAI(prompt);
        return verdict;
    } catch (error) {
        console.error('Error generating AI verdict:', error);
        return 'Не удалось сгенерировать вердикт AI.';
    }
}

// Helper function to call AI
async function callAI(prompt) {
    const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
    if (currentProvider === 'gemini') {
        return await callGemini(prompt);
    } else {
        return await callOpenAI(prompt);
    }
}

// Helper function to get project context
function getProjectContext() {
    const projectData = appState.projectData?.idea || 'Не указана';
    const passport = appState.projectPassport;
    
    let context = `Идея проекта: ${projectData}\n`;
    
    if (passport && passport.basicInfo) {
        context += `Название проекта: ${passport.basicInfo.projectName}\n`;
        context += `Отрасль: ${passport.basicInfo.industry}\n`;
        context += `Этап: ${passport.basicInfo.stage}\n`;
        context += `Локация: ${passport.basicInfo.location}\n`;
    }
    
    if (passport && passport.problem) {
        context += `Проблема: ${passport.problem.description}\n`;
    }
    
    if (passport && passport.solution) {
        context += `Решение: ${passport.solution.description}\n`;
    }
    
    return context;
}

// Move to next module
function nextModule() {
    const currentModuleIndex = appState.currentModule;
    if (currentModuleIndex < appState.modules.length - 1) {
        // Update next module status to active
        appState.modules[currentModuleIndex + 1].status = 'active';
        
        // Activate first topic of the next module
        const nextModule = appState.modules[currentModuleIndex + 1];
        if (nextModule.topics && nextModule.topics.length > 0) {
            nextModule.topics.forEach((topic, index) => {
                if (index === 0) {
                    topic.status = 'active';
                    topic.completedQuestions = 0;
                } else {
                    topic.status = 'locked';
                    topic.completedQuestions = 0;
                }
            });
        }
        
        // Switch to next module
        switchToModule(currentModuleIndex + 1);
        
        // Hide next module button
        const nextModuleBtn = document.getElementById('nextModuleBtn');
        if (nextModuleBtn) {
            nextModuleBtn.classList.add('hidden');
        }
        
        // Clear chat and add welcome message
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            addMessage(`🎉 **Добро пожаловать в модуль: ${nextModule.title}!**\n\n${nextModule.description}\n\nЗадайте любые вопросы по этой теме, и ИИ Агент Ментор поможет вам разобраться.`, 'assistant');
        }
        
        // Update module action button
        setTimeout(() => {
            updateModuleActionButton();
        }, 150);
        
        // Save progress
        saveProgress();
    }
}

// Function to select topic and close popup
function selectTopicAndClosePopup(topicId, buttonElement) {
    console.log('selectTopicAndClosePopup called with topicId:', topicId);
    
    // Close the popup
    const popup = buttonElement.closest('.topic-unlock-popup');
    if (popup) {
        popup.remove();
        console.log('Popup closed');
    }
    
    // Find the topic object
    const currentModule = appState.modules[appState.currentModule];
    const topic = currentModule.topics.find(t => t.id === topicId);
    
    console.log('Found topic:', topic);
    
    if (topic) {
        // Call the selectTopic function to start learning
        selectTopic(topic);
        console.log('selectTopic called');
    } else {
        console.error('Topic not found with id:', topicId);
    }
}

// Make function globally available
window.selectTopicAndClosePopup = selectTopicAndClosePopup;
