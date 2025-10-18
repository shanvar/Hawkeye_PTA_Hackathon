// Market Analysis Module Logic

// Initialize market analysis state
let marketAnalysisState = {
    currentTopicIndex: 0,
    totalScore: 100,
    currentQuestionIndex: 0,
    analysisQuestions: [],
    userAnswers: [],
    aiFeedback: [],
    marketData: {
        tamSamSom: null,
        competitors: [],
        trends: [],
        barriers: [],
        swotAnalysis: null
    }
};

// Market Analysis Module Button Configuration
function getMarketAnalysisButtonConfig() {
    return {
        id: 'marketAnalysisBtn',
        text: '📊 Провести анализ рынка',
        onclick: 'conductMarketAnalysis()',
        prompt: `Ты эксперт по маркетинговому анализу и исследованию рынков. 

Твоя задача - провести глубокий анализ рынка для проекта пользователя.

КОНТЕКСТ ПРОЕКТА:
${getProjectContext()}

ТВОЯ РОЛЬ:
- Эксперт по маркетинговым исследованиям
- Аналитик рынков и конкурентной среды  
- Консультант по стратегическому планированию

ЗАДАЧИ ДЛЯ АНАЛИЗА:
1. Анализ размера рынка (TAM/SAM/SOM)
2. Исследование конкурентов (прямых и косвенных)
3. Выявление трендов и возможностей
4. Определение барьеров входа
5. SWOT анализ проекта

ПОДХОД:
- Задавай целенаправленные вопросы для сбора данных
- Проводи анализ на основе полученной информации
- Предоставляй конкретные рекомендации и выводы
- Используй структурированный подход

Начни с приветствия и первого вопроса о целевом рынке проекта.`
    };
}

// Conduct market analysis
async function conductMarketAnalysis() {
    console.log('conductMarketAnalysis called');
    
    try {
        disableCurrentModuleButton();
        
        const config = getMarketAnalysisButtonConfig();
        const prompt = config.prompt;
        
        addMessage('🔄 Запускаю анализ рынка...', 'user');
        
        // Call AI with market analysis prompt
        const response = await callAI(prompt);
        
        addMessage(response, 'assistant');
        
        // Initialize market analysis state
        initMarketAnalysisState();
        
        enableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error in market analysis:', error);
        addMessage('❌ Произошла ошибка при анализе рынка. Попробуйте еще раз.', 'assistant');
        enableCurrentModuleButton();
    }
}

// Initialize market analysis state
function initMarketAnalysisState() {
    const marketModule = appState.modules.find(m => m.id === 'market-analysis');
    if (marketModule && marketModule.marketAnalysisState) {
        marketAnalysisState = { ...marketModule.marketAnalysisState };
    }
}

// Save market analysis data
function saveMarketAnalysisData(data) {
    const marketModule = appState.modules.find(m => m.id === 'market-analysis');
    if (marketModule) {
        if (!marketModule.marketAnalysisState) {
            marketModule.marketAnalysisState = { ...marketAnalysisState };
        }
        
        // Update with new data
        Object.assign(marketModule.marketAnalysisState.marketData, data);
        
        // Save to global state
        appState.marketAnalysis = data;
        saveProgress();
    }
}

// Generate market analysis report
async function generateMarketAnalysisReport() {
    const report = {
        module: 'market-analysis',
        completedAt: new Date().toISOString(),
        marketData: marketAnalysisState.marketData,
        userAnswers: marketAnalysisState.userAnswers,
        aiFeedback: marketAnalysisState.aiFeedback,
        projectData: appState.projectData?.idea || 'No данных',
        summary: await generateMarketSummary()
    };
    
    // Save to file
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market_analysis_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessage('📄 **Отчет по анализу рынка сгенерирован и сохранен!**', 'assistant');
}

// Generate market summary
async function generateMarketSummary() {
    const projectData = appState.projectData?.idea || 'No данных об идее';
    const userAnswers = marketAnalysisState.userAnswers.join('\n\n');
    
    const prompt = `На основе проведенного анализа рынка, создай краткое резюме:

**Проект:** ${projectData}

**Yesнные анализа:**
${userAnswers}

Создай структурированное резюме анализа рынка (2-3 абзаца) с ключевыми выводами и рекомендациями.`;

    try {
        const summary = await callAI(prompt);
        return summary;
    } catch (error) {
        console.error('Error generating market summary:', error);
        return 'Не удалось сгенерировать резюме анализа рынка.';
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

// Helper function to call AI
async function callAI(prompt) {
    const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
    if (currentProvider === 'gemini') {
        return await callGemini(prompt);
    } else {
        return await callOpenAI(prompt);
    }
}