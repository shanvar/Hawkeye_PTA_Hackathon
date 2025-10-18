// Business Model Module Logic

// Initialize business model state
let businessModelState = {
    currentTopicIndex: 0,
    totalScore: 100,
    currentQuestionIndex: 0,
    modelQuestions: [],
    userAnswers: [],
    aiFeedback: [],
    businessModel: {
        canvas: null,
        revenueStreams: [],
        costStructure: [],
        pricing: null,
        financialPlan: null,
        breakEven: null
    }
};

// Business Model Module Button Configuration
function getBusinessModelButtonConfig() {
    return {
        id: 'businessModelBtn',
        text: '🏗️ Create бизнес-модель',
        onclick: 'createBusinessModel()',
        prompt: `Ты эксперт по бизнес-моделированию и финансовому планированию стартапов.

Твоя задача - помочь создать устойчивую и жизнеспособную бизнес-модель.

КОНТЕКСТ ПРОЕКТА:
${getProjectContext()}

ТВОЯ РОЛЬ:
- Эксперт по бизнес-моделированию 
- Финансовый консультант стартапов
- Специалист по монетизации продуктов
- Стратег ценообразования

ЗАДАЧИ ДЛЯ РАЗРАБОТКИ:
1. Canvas бизнес-модель (9 блоков)
2. Модели монетизации и источники дохода
3. Стратегия ценообразования
4. Финансовое планирование и прогнозы
5. Расчет точки безубыточности
6. Анализ юнит-экономики

ПОДХОД:
- Используй проверенные фреймворки (Canvas, Lean Canvas)
- Анализируй рыночные бенчмарки для ценообразования
- Создавай реалистичные финансовые модели
- Учитывай специфику отрасли и целевой аудитории

Начни с анализа текущего понимания монетизации проекта.`
    };
}

// Create business model
async function createBusinessModel() {
    console.log('createBusinessModel called');
    
    try {
        disableCurrentModuleButton();
        
        const config = getBusinessModelButtonConfig();
        const prompt = config.prompt;
        
        addMessage('🔄 Создаю бизнес-модель...', 'user');
        
        // Call AI with business model prompt
        const response = await callAI(prompt);
        
        addMessage(response, 'assistant');
        
        // Initialize business model state
        initBusinessModelState();
        
        enableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error in business model creation:', error);
        addMessage('❌ Произошла ошибка при создании бизнес-модели. Попробуйте еще раз.', 'assistant');
        enableCurrentModuleButton();
    }
}

// Initialize business model state
function initBusinessModelState() {
    const businessModule = appState.modules.find(m => m.id === 'business-model');
    if (businessModule && businessModule.businessModelState) {
        businessModelState = { ...businessModule.businessModelState };
    }
}

// Save business model data
function saveBusinessModelData(data) {
    const businessModule = appState.modules.find(m => m.id === 'business-model');
    if (businessModule) {
        if (!businessModule.businessModelState) {
            businessModule.businessModelState = { ...businessModelState };
        }
        
        // Update with new data
        Object.assign(businessModule.businessModelState.businessModel, data);
        
        // Save to global state
        appState.businessModel = data;
        saveProgress();
    }
}

// Generate business model canvas
async function generateBusinessModelCanvas() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const userAnswers = businessModelState.userAnswers.join('\n\n');
    
    const prompt = `На основе информации о проекте создай Business Model Canvas:

**Проект:** ${projectData}

**Собранная информация:**
${userAnswers}

Создай детальный Business Model Canvas в формате:

## 🎯 КЛЮЧЕВЫЕ ПАРТНЕРЫ
[Список ключевых партнеров]

## 🛠 КЛЮЧЕВЫЕ АКТИВНОСТИ  
[Основные активности для создания ценности]

## 💎 ЦЕННОСТНЫЕ ПРЕДЛОЖЕНИЯ
[Уникальные ценности для клиентов]

## 👥 ВЗАИМООТНОШЕНИЯ С КЛИЕНТАМИ
[Типы отношений с клиентами]

## 📊 СЕГМЕНТЫ КЛИЕНТОВ
[Целевые сегменты клиентов]

## 🔑 КЛЮЧЕВЫЕ РЕСУРСЫ
[Необходимые ресурсы]

## 📢 КАНАЛЫ
[Каналы коммуникации и продаж]

## 💰 ПОТОКИ ДОХОДОВ
[Источники доходов]

## 💸 СТРУКТУРА ЗАТРАТ
[Основные затраты]`;

    try {
        const canvas = await callAI(prompt);
        
        // Save canvas to business model
        saveBusinessModelData({ canvas });
        
        addMessage(canvas, 'assistant');
        addMessage(`
**🎉 Business Model Canvas создан!**

<button class="btn secondary" onclick="generateFinancialProjections()">📈 Create финансовые прогнозы</button>
<button class="btn secondary" onclick="generateBusinessModelReport()">📄 Сгенерировать отчет</button>
        `, 'assistant');
        
    } catch (error) {
        console.error('Error generating business model canvas:', error);
        addMessage('❌ Не удалось создать Business Model Canvas.', 'assistant');
    }
}

// Generate financial projections
async function generateFinancialProjections() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const businessModel = businessModelState.businessModel;
    
    const prompt = `Создай финансовые прогнозы на 3 yearа для проекта:

**Проект:** ${projectData}

**Бизнес-модель:** ${businessModel.canvas || 'Базовая информация'}

Создай:
1. **Прогноз выручки** (по monthам первый year, по кварталам 2-3 year)
2. **Операционные расходы** (постоянные и переменные)
3. **Прогноз прибыли и убытков**
4. **Расчет точки безубыточности**
5. **Ключевые метрики** (LTV, CAC, Churn rate и др.)

Используй реалистичные данные для данной отрасли.`;

    try {
        const projections = await callAI(prompt);
        
        // Save projections
        saveBusinessModelData({ financialPlan: projections });
        
        addMessage(projections, 'assistant');
        
    } catch (error) {
        console.error('Error generating financial projections:', error);
        addMessage('❌ Не удалось создать финансовые прогнозы.', 'assistant');
    }
}

// Generate business model report
async function generateBusinessModelReport() {
    const report = {
        module: 'business-model',
        completedAt: new Date().toISOString(),
        businessModel: businessModelState.businessModel,
        userAnswers: businessModelState.userAnswers,
        aiFeedback: businessModelState.aiFeedback,
        projectData: appState.projectData?.idea || 'No данных',
        executiveSummary: await generateBusinessModelSummary()
    };
    
    // Save to file
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_model_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📄 **Отчет по бизнес-модели сгенерирован и сохранен!**', 'assistant');
}

// Generate business model summary
async function generateBusinessModelSummary() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const businessModel = businessModelState.businessModel;
    
    const prompt = `Создай executive summary для бизнес-модели:

**Проект:** ${projectData}

**Бизнес-модель:** ${JSON.stringify(businessModel)}

Создай краткое резюме (2-3 абзаца) с ключевыми аспектами бизнес-модели, потенциалом монетизации и рекомендациями.`;

    try {
        const summary = await callAI(prompt);
        return summary;
    } catch (error) {
        console.error('Error generating business model summary:', error);
        return 'Не удалось сгенерировать резюме бизнес-модели.';
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
    
    if (passport && passport.market) {
        context += `Размер рынка: ${passport.market.size}\n`;
        context += `Конкуренты: ${passport.market.competitors}\n`;
    }
    
    if (appState.marketAnalysis) {
        context += `Yesнные анализа рынка: ${JSON.stringify(appState.marketAnalysis)}\n`;
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