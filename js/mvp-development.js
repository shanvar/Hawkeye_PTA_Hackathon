// MVP Development Module Logic

// Initialize MVP development state
let mvpDevelopmentState = {
    currentTopicIndex: 0,
    totalScore: 100,
    currentQuestionIndex: 0,
    developmentQuestions: [],
    userAnswers: [],
    aiFeedback: [],
    mvpData: {
        definition: null,
        technicalRequirements: null,
        uiUxDesign: null,
        developmentPlan: null,
        testingStrategy: null,
        features: []
    }
};

// MVP Development Module Button Configuration
function getMVPDevelopmentButtonConfig() {
    return {
        id: 'mvpDevelopmentBtn',
        text: '⚡ Разработать MVP',
        onclick: 'developMVP()',
        prompt: `Ты эксперт по разработке MVP (Minimum Viable Product) и продуктовому менеджменту.

Твоя задача - помочь создать техническую стратегию и план разработки MVP.

КОНТЕКСТ ПРОЕКТА:
${getProjectContext()}

ТВОЯ РОЛЬ:
- Product Manager с опытом MVP разработки
- Технический архитектор 
- UX/UI консультант
- Эксперт по Lean Startup методологии

ЗАДАЧИ ДЛЯ РАЗРАБОТКИ MVP:
1. Определение MVP и приоритизация функций
2. Техническая архитектура и требования
3. UI/UX дизайн и пользовательские сценарии
4. План разработки и техническая реализация  
5. Стратегия тестирования с пользователями
6. Метрики для валидации гипотез

ПОДХОД:
- Фокус на minимальном наборе функций для валидации гипотез
- Выбор оптимального технического стека
- Rapid prototyping и итеративная разработка
- User-centered design подход
- Lean методология и Build-Measure-Learn цикл

Начни с анализа ключевых пользовательских потребностей для MVP.`
    };
}

// Develop MVP
async function developMVP() {
    console.log('developMVP called');
    
    try {
        disableCurrentModuleButton();
        
        const config = getMVPDevelopmentButtonConfig();
        const prompt = config.prompt;
        
        addMessage('🔄 Планирую разработку MVP...', 'user');
        
        // Call AI with MVP development prompt
        const response = await callAI(prompt);
        
        addMessage(response, 'assistant');
        
        // Initialize MVP development state
        initMVPDevelopmentState();
        
        enableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error in MVP development:', error);
        addMessage('❌ Произошла ошибка при планировании MVP. Попробуйте еще раз.', 'assistant');
        enableCurrentModuleButton();
    }
}

// Initialize MVP development state
function initMVPDevelopmentState() {
    const mvpModule = appState.modules.find(m => m.id === 'mvp-development');
    if (mvpModule && mvpModule.mvpDevelopmentState) {
        mvpDevelopmentState = { ...mvpModule.mvpDevelopmentState };
    }
}

// Save MVP development data
function saveMVPDevelopmentData(data) {
    const mvpModule = appState.modules.find(m => m.id === 'mvp-development');
    if (mvpModule) {
        if (!mvpModule.mvpDevelopmentState) {
            mvpModule.mvpDevelopmentState = { ...mvpDevelopmentState };
        }
        
        // Update with new data
        Object.assign(mvpModule.mvpDevelopmentState.mvpData, data);
        
        // Save to global state
        appState.mvpFeatures = data;
        saveProgress();
    }
}

// Generate MVP definition and feature prioritization
async function generateMVPDefinition() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const userAnswers = mvpDevelopmentState.userAnswers.join('\n\n');
    
    const prompt = `Создай определение MVP и приоритизацию функций:

**Проект:** ${projectData}

**Собранная информация:**
${userAnswers}

Создай:

## 🎯 ОПРЕДЕЛЕНИЕ MVP
[Четкое описание того, что представляет собой MVP]

## 🔥 CORE ФУНКЦИИ (Must-have)
[Критически важные функции для запуска]

## ⭐ ВАЖНЫЕ ФУНКЦИИ (Should-have)  
[Важные, но не критичные функции]

## 💡 ЖЕЛАТЕЛЬНЫЕ ФУНКЦИИ (Could-have)
[Функции для будущих итераций]

## 📊 КРИТЕРИИ УСПЕХА MVP
[Метрики для оценки успешности MVP]

## 👥 ЦЕЛЕВЫЕ ПОЛЬЗОВАТЕЛИ MVP
[Конкретные сегменты для первого запуска]

## 🚀 ГИПОТЕЗЫ ДЛЯ ВАЛИДАЦИИ
[Ключевые гипотезы, которые должен проверить MVP]`;

    try {
        const definition = await callAI(prompt);
        
        // Save definition to MVP data
        saveMVPDevelopmentData({ definition });
        
        addMessage(definition, 'assistant');
        addMessage(`
**🎉 MVP определен!**

<button class="btn secondary" onclick="generateTechnicalRequirements()">🛠 Create технические требования</button>
<button class="btn secondary" onclick="generateUXDesign()">🎨 Create UX дизайн</button>
        `, 'assistant');
        
    } catch (error) {
        console.error('Error generating MVP definition:', error);
        addMessage('❌ Не удалось создать определение MVP.', 'assistant');
    }
}

// Generate technical requirements
async function generateTechnicalRequirements() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const mvpDefinition = mvpDevelopmentState.mvpData.definition;
    
    const prompt = `Создай технические требования для MVP:

**Проект:** ${projectData}

**MVP определение:** ${mvpDefinition}

Создай детальные технические требования:

## 🏗 АРХИТЕКТУРА СИСТЕМЫ
[Общая архитектура и компоненты]

## 💻 ТЕХНИЧЕСКИЙ СТЕК
**Frontend:** [Рекомендуемые технологии]
**Backend:** [Рекомендуемые технологии] 
**База данных:** [Рекомендации по БД]
**Инфраструктура:** [Хостинг и развертывание]

## 🔧 API СПЕЦИФИКАЦИЯ
[Основные API endpoints]

## 🗄 СТРУКТУРА ДАННЫХ
[Основные сущности и связи]

## 🔐 БЕЗОПАСНОСТЬ
[Требования безопасности]

## 📈 ПРОИЗВОДИТЕЛЬНОСТЬ
[Требования к производительности]

## 🔗 ИНТЕГРАЦИИ
[Внешние сервисы и API]

## 📱 ПЛАТФОРМЫ
[Поддерживаемые платформы и устройства]`;

    try {
        const requirements = await callAI(prompt);
        
        // Save requirements
        saveMVPDevelopmentData({ technicalRequirements: requirements });
        
        addMessage(requirements, 'assistant');
        
    } catch (error) {
        console.error('Error generating technical requirements:', error);
        addMessage('❌ Не удалось создать технические требования.', 'assistant');
    }
}

// Generate UX design and user flows
async function generateUXDesign() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const mvpDefinition = mvpDevelopmentState.mvpData.definition;
    
    const prompt = `Создай UX дизайн и пользовательские сценарии для MVP:

**Проект:** ${projectData}

**MVP определение:** ${mvpDefinition}

Создай:

## 🎨 UX/UI КОНЦЕПЦИЯ
[Общий подход к дизайну и пользовательскому опыту]

## 👤 ПОЛЬЗОВАТЕЛЬСКИЕ ПЕРСОНАЖИ
[Основные персонажи пользователей MVP]

## 🗺 USER JOURNEY MAP
[Основные пути пользователей через MVP]

## 📱 WIREFRAMES ОПИСАНИЕ
[Описание ключевых экранов и их функций]

## 🔄 USER FLOWS
[Основные пользовательские сценарии]

## 🎯 КЛЮЧЕВЫЕ ДЕЙСТВИЯ
[Основные действия, которые должны выполнять пользователи]

## 📊 UX МЕТРИКИ
[Метрики для оценки пользовательского опыта]

## 🧪 ПЛАН ТЕСТИРОВАНИЯ UX
[Как тестировать UX с пользователями]`;

    try {
        const uxDesign = await callAI(prompt);
        
        // Save UX design
        saveMVPDevelopmentData({ uiUxDesign: uxDesign });
        
        addMessage(uxDesign, 'assistant');
        
    } catch (error) {
        console.error('Error generating UX design:', error);
        addMessage('❌ Не удалось создать UX дизайн.', 'assistant');
    }
}

// Generate MVP development report
async function generateMVPReport() {
    const report = {
        module: 'mvp-development',
        completedAt: new Date().toISOString(),
        mvpData: mvpDevelopmentState.mvpData,
        userAnswers: mvpDevelopmentState.userAnswers,
        aiFeedback: mvpDevelopmentState.aiFeedback,
        projectData: appState.projectData?.idea || 'No данных',
        developmentSummary: await generateMVPSummary()
    };
    
    // Save to file
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mvp_development_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📄 **Отчет по разработке MVP сгенерирован и сохранен!**', 'assistant');
}

// Generate MVP summary
async function generateMVPSummary() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const mvpData = mvpDevelopmentState.mvpData;
    
    const prompt = `Создай краткое резюме плана разработки MVP:

**Проект:** ${projectData}

**MVP данные:** ${JSON.stringify(mvpData)}

Создай executive summary (2-3 абзаца) с ключевыми решениями по MVP, техническим подходом и планом реализации.`;

    try {
        const summary = await callAI(prompt);
        return summary;
    } catch (error) {
        console.error('Error generating MVP summary:', error);
        return 'Не удалось сгенерировать резюме MVP.';
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
        context += `Команда: ${passport.basicInfo.teamSize}\n`;
    }
    
    if (appState.validationAnswers) {
        context += `Yesнные валидации: ${JSON.stringify(appState.validationAnswers)}\n`;
    }
    
    if (appState.marketAnalysis) {
        context += `Анализ рынка: ${JSON.stringify(appState.marketAnalysis)}\n`;
    }
    
    if (appState.businessModel) {
        context += `Бизнес-модель: ${JSON.stringify(appState.businessModel)}\n`;
    }
    
    return context;
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