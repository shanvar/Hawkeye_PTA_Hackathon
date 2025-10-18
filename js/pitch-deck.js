// Pitch Deck Module Logic

// Initialize pitch deck state
let pitchDeckState = {
    currentTopicIndex: 0,
    totalScore: 100,
    currentQuestionIndex: 0,
    pitchQuestions: [],
    userAnswers: [],
    aiFeedback: [],
    pitchDeck: {
        structure: null,
        problemSolution: null,
        marketCompetition: null,
        businessModel: null,
        financials: null,
        teamRequest: null,
        slides: []
    }
};

// Pitch Deck Module Button Configuration
function getPitchDeckButtonConfig() {
    return {
        id: 'pitchDeckBtn',
        text: '📊 Create презентацию',
        onclick: 'createPitchDeck()',
        prompt: `Ты эксперт по созданию инвестиционных презентаций (pitch deck) для стартапов.

Твоя задача - создать убедительную презентацию для привлечения инвестиций.

КОНТЕКСТ ПРОЕКТА:
${getProjectContext()}

ТВОЯ РОЛЬ:
- Эксперт по pitch deck и инвестиционным презентациям
- Консультант по привлечению инвестиций
- Ментор стартапов с опытом работы с VC и бизнес-ангелами
- Storytelling специалист

СТРУКТУРА PITCH DECK:
1. **Problem** - Проблема и её масштаб
2. **Solution** - Уникальное решение
3. **Market** - Размер рынка и возможности
4. **Competition** - Конкурентный анализ
5. **Business Model** - Как зарабатываете dayги
6. **Traction** - Достижения и метрики
7. **Marketing** - Стратегия привлечения клиентов
8. **Team** - Команда и экспертиза
9. **Financials** - Финансовые прогнозы
10. **Funding** - Сколько нужно и на что

ПОДХОД:
- Расскажи историю, которая цепляет инвесторов
- Используй данные и метрики для обоснования
- Покажи масштабность возможности
- Демонстрируй командную экспертизу
- Будь честным о рисках и вызовах

Начни с анализа ключевой проблемы для инвесторской презентации.`
    };
}

// Create pitch deck
async function createPitchDeck() {
    console.log('createPitchDeck called');
    
    try {
        disableCurrentModuleButton();
        
        const config = getPitchDeckButtonConfig();
        const prompt = config.prompt;
        
        addMessage('🔄 Создаю pitch deck...', 'user');
        
        // Call AI with pitch deck prompt
        const response = await callAI(prompt);
        
        addMessage(response, 'assistant');
        
        // Initialize pitch deck state
        initPitchDeckState();
        
        enableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error in pitch deck creation:', error);
        addMessage('❌ Произошла ошибка при создании презентации. Попробуйте еще раз.', 'assistant');
        enableCurrentModuleButton();
    }
}

// Initialize pitch deck state
function initPitchDeckState() {
    const pitchModule = appState.modules.find(m => m.id === 'pitch-deck');
    if (pitchModule && pitchModule.pitchDeckState) {
        pitchDeckState = { ...pitchModule.pitchDeckState };
    }
}

// Save pitch deck data
function savePitchDeckData(data) {
    const pitchModule = appState.modules.find(m => m.id === 'pitch-deck');
    if (pitchModule) {
        if (!pitchModule.pitchDeckState) {
            pitchModule.pitchDeckState = { ...pitchDeckState };
        }
        
        // Update with new data
        Object.assign(pitchModule.pitchDeckState.pitchDeck, data);
        
        // Save to global state
        appState.pitchDeck = data;
        saveProgress();
    }
}

// Generate complete pitch deck structure
async function generatePitchDeckStructure() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const userAnswers = pitchDeckState.userAnswers.join('\n\n');
    
    const prompt = `Создай полную структуру pitch deck презентации:

**Проект:** ${projectData}

**Information для презентации:**
${userAnswers}

Создай детальную презентацию:

## 📋 СЛАЙД 1: ЗАГОЛОВОК
**Название:** [Название проекта]
**Tagline:** [Краткое описание в одну строку]
**Контакты:** [Контактная информация]

## 🎯 СЛАЙД 2: ПРОБЛЕМА
**Проблема:** [Четкое описание проблемы]
**Масштаб:** [Размер проблемы в цифрах]
**Pain Points:** [Ключевые болевые точки]

## 💡 СЛАЙД 3: РЕШЕНИЕ
**Решение:** [Ваше уникальное решение]
**Как работает:** [Краткое объяснение]
**Преимущества:** [Ключевые преимущества]

## 📊 СЛАЙД 4: РЫНОК
**TAM:** [Total Addressable Market]
**SAM:** [Serviceable Addressable Market]  
**SOM:** [Serviceable Obtainable Market]

## 🏆 СЛАЙД 5: КОНКУРЕНЦИЯ
**Конкуренты:** [Основные конкуренты]
**Отличия:** [Ваши конкурентные преимущества]
**Позиционирование:** [Как вы выделяетесь]

## 💰 СЛАЙД 6: БИЗНЕС-МОДЕЛЬ
**Монетизация:** [Как зарабатываете]
**Pricing:** [Ценообразование]
**Unit Economics:** [Юнит-экономика]

## 📈 СЛАЙД 7: TRACTION
**Достижения:** [Текущие результаты]
**Метрики:** [Ключевые показатели]
**Рост:** [Динамика роста]

## 👥 СЛАЙД 8: КОМАНДА
**Основатели:** [Основатели и их экспертиза]
**Ключевые сотрудники:** [Команда]
**Советники:** [Менторы и советники]

## 💵 СЛАЙД 9: ФИНАНСЫ
**Прогнозы:** [Финансовые прогнозы на 3-5 лет]
**Точка безубыточности:** [Когда выйдете в плюс]
**Key Metrics:** [Ключевые финансовые метрики]

## 🚀 СЛАЙД 10: ПРИВЛЕЧЕНИЕ ИНВЕСТИЦИЙ
**Сумма:** [Сколько привлекаете]
**Использование:** [На что потратите]
**Milestones:** [Что достигнете с инвестициями]`;

    try {
        const structure = await callAI(prompt);
        
        // Save structure to pitch deck
        savePitchDeckData({ structure });
        
        addMessage(structure, 'assistant');
        addMessage(`
**🎉 Pitch Deck структура создана!**

<button class="btn secondary" onclick="generateInvestorMemo()">📄 Create инвестиционный меморандум</button>
<button class="btn secondary" onclick="generatePitchDeckReport()">📊 Сгенерировать отчет</button>
        `, 'assistant');
        
    } catch (error) {
        console.error('Error generating pitch deck structure:', error);
        addMessage('❌ Не удалось создать структуру презентации.', 'assistant');
    }
}

// Generate investor memo
async function generateInvestorMemo() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const pitchStructure = pitchDeckState.pitchDeck.structure;
    
    const prompt = `Создай инвестиционный меморандум (Executive Summary):

**Проект:** ${projectData}

**Pitch Deck:** ${pitchStructure}

Создай краткий инвестиционный меморандум (1-2 страницы):

## 📋 EXECUTIVE SUMMARY

### 🎯 КОМПАНИЯ И ПРОДУКТ
[Краткое описание компании и продукта]

### 🎪 ПРОБЛЕМА И РЕШЕНИЕ  
[Проблема и ваше решение]

### 📊 РЫНОК И ВОЗМОЖНОСТИ
[Размер рынка и потенциал]

### 💰 БИЗНЕС-МОДЕЛЬ
[Как зарабатываете dayги]

### 🏆 КОНКУРЕНТНЫЕ ПРЕИМУЩЕСТВА
[Ваши ключевые преимущества]

### 👥 КОМАНДА
[Ключевые люди и их экспертиза]

### 📈 ФИНАНСОВЫЕ ПРОГНОЗЫ
[Краткие финансовые прогнозы]

### 💵 ИНВЕСТИЦИОННОЕ ПРЕДЛОЖЕНИЕ
[Сколько нужно, на что, результат]

### 🎯 ИСПОЛЬЗОВАНИЕ СРЕДСТВ
[Детальное распределение инвестиций]

### 🚀 ВЫХОД ДЛЯ ИНВЕСТОРОВ
[Стратегия выхода через 3-7 лет]`;

    try {
        const memo = await callAI(prompt);
        
        // Save memo
        savePitchDeckData({ investorMemo: memo });
        
        addMessage(memo, 'assistant');
        
    } catch (error) {
        console.error('Error generating investor memo:', error);
        addMessage('❌ Не удалось создать инвестиционный меморандум.', 'assistant');
    }
}

// Generate pitch deck report
async function generatePitchDeckReport() {
    const report = {
        module: 'pitch-deck',
        completedAt: new Date().toISOString(),
        pitchDeck: pitchDeckState.pitchDeck,
        userAnswers: pitchDeckState.userAnswers,
        aiFeedback: pitchDeckState.aiFeedback,
        projectData: appState.projectData?.idea || 'No данных',
        presentationSummary: await generatePitchDeckSummary()
    };
    
    // Save to file
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch_deck_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📄 **Отчет по pitch deck сгенерирован и сохранен!**', 'assistant');
}

// Generate pitch deck summary
async function generatePitchDeckSummary() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const pitchDeck = pitchDeckState.pitchDeck;
    
    const prompt = `Создай краткое резюме pitch deck презентации:

**Проект:** ${projectData}

**Pitch Deck данные:** ${JSON.stringify(pitchDeck)}

Создай executive summary (2-3 абзаца) с ключевыми моментами презентации, инвестиционной привлекательностью и рекомендациями по улучшению.`;

    try {
        const summary = await callAI(prompt);
        return summary;
    } catch (error) {
        console.error('Error generating pitch deck summary:', error);
        return 'Не удалось сгенерировать резюме pitch deck.';
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
        context += `Локация: ${passport.basicInfo.location}\n`;
    }
    
    if (passport && passport.financials) {
        context += `Финансирование: ${passport.financials.funding.amount} (${passport.financials.funding.stage})\n`;
        context += `Прогноз выручки: ${passport.financials.projections.year1.revenue}\n`;
    }
    
    // Include data from previous modules
    if (appState.validationAnswers) {
        context += `Валидация: Завершена\n`;
    }
    
    if (appState.marketAnalysis) {
        context += `Анализ рынка: Завершен\n`;
    }
    
    if (appState.businessModel) {
        context += `Бизнес-модель: Создана\n`;
    }
    
    if (appState.mvpFeatures) {
        context += `MVP план: Разработан\n`;
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