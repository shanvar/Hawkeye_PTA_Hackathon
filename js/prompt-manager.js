// Prompt Manager - Управление промптами из JSON файла
class PromptManager {
    constructor() {
        this.prompts = null;
        this.settings = null;
        this.fallbacks = null;
        this.isLoaded = false;
    }
    
    // Загрузка промптов из JSON файла
    async loadPrompts() {
        try {
            const response = await fetch('prompts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.prompts = data.prompts;
            this.settings = data.settings;
            this.fallbacks = data.fallbacks;
            this.isLoaded = true;
            
            console.log('Промпты загружены успешно:', data.metadata);
            return true;
        } catch (error) {
            console.error('Loading error промптов:', error);
            this.loadDefaultPrompts();
            return false;
        }
    }
    
    // Загрузка промптов по умолчанию (встроенные)
    loadDefaultPrompts() {
        this.prompts = {
            modules: {
                validation: {
                    id: 'validation',
                    title: 'Валидация идеи',
                    systemPrompt: 'Вы эксперт по валидации бизнес-идей. Помогите пользователю проанализировать его идею, определить целевую аудиторию и конкурентные преимущества.'
                },
                'market-analysis': {
                    id: 'market-analysis',
                    title: 'Анализ рынка',
                    systemPrompt: 'Вы эксперт по маркетинговому анализу. Помогите провести глубокий анализ рынка и выработать маркетинговую стратегию.'
                },
                'business-model': {
                    id: 'business-model',
                    title: 'Бизнес-модель',
                    systemPrompt: 'Вы эксперт по бизнес-моделированию и финансовому планированию. Помогите создать устойчивую бизнес-модель.'
                },
                'mvp-development': {
                    id: 'mvp-development',
                    title: 'Разработка MVP',
                    systemPrompt: 'Вы эксперт по разработке MVP. Помогите определить ключевые функции и создать план разработки.'
                },
                'pitch-deck': {
                    id: 'pitch-deck',
                    title: 'Pitch Deck',
                    systemPrompt: 'Вы эксперт по созданию презентаций для инвесторов. Помогите создать убедительный pitch deck.'
                }
            },
            chat: {
                learningPlan: {
                    description: 'Создание плана обучения для топика',
                    prompt: 'Создай краткий план обучения для топика "${topic.title}" в контексте модуля "${currentModule.title}".\n\nИдея пользователя: ${ideaData}\n\nСоздай план из 4-6 ключевых аспектов, которые нужно изучить. Каждый аспект должен:\n1. Быть конкретным и практичным\n2. Связан с идеей пользователя\n3. Включать контрольный вопрос для проверки понимания\n\nВАЖНО: Ограничьте ответ максимум 2000 символами. Будьте краткими.\n\nФормат ответа:\nАСПЕКТ 1: [название]\nОписание: [краткое описание]\nВопрос: [контрольный вопрос]\n\nАСПЕКТ 2: [название]\nОписание: [краткое описание]\nВопрос: [контрольный вопрос]\n\nИ так далее...'
                },
                answerEvaluation: {
                    description: 'Оценка ответа пользователя на контрольный вопрос',
                    prompt: 'Оцените ответ пользователя на контрольный вопрос.\n\nТопик: ${dynamicLearningState.currentTopic.title}\nАспект: ${currentStep.title}\nВопрос: ${currentStep.question}\nОтвет пользователя: ${userAnswer}\nИдея пользователя: ${ideaData}\n\nОцените ответ по шкале 1-10, где:\n1-3: Неполный или неверный ответ\n4-6: Частично правильный ответ\n7-10: Полный и правильный ответ\n\nЕсли ответ неполный (оценка 1-6), задайте один наводящий вопрос, связанный с идеей пользователя.\nЕсли ответ полный (оценка 7-10), переходите к следующему аспекту.\n\nВАЖНО: Ограничьте ответ максимум 2000 символами.\n\nФормат ответа:\nОЦЕНКА: [число от 1 до 10]\nКОММЕНТАРИЙ: [краткий комментарий]\nДЕЙСТВИЕ: [СЛЕДУЮЩИЙ_АСПЕКТ или НАВОДЯЩИЙ_ВОПРОС]\n[если НАВОДЯЩИЙ_ВОПРОС, то добавьте сам вопрос]'
                }
            },
            validation: {
                generateQuestions: {
                    description: 'Генерация контрольных вопросов для валидации',
                    prompt: 'На основе следующей бизнес-идеи создай 10 контрольных вопросов для проверки знаний по валидации бизнес-идей:\n\nИдея: ${ideaData}\n\nСоздай вопросы, которые:\n1. Проверяют понимание методологии валидации\n2. Связаны с анализом проблемы и целевой аудитории\n3. Касаются конкурентного анализа\n4. Требуют развернутых ответов на естественном языке\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nВерни только список вопросов, каждый с новой строки, начиная с номера.'
                },
                evaluateAnswer: {
                    description: 'Оценка ответа пользователя на вопрос валидации',
                    prompt: 'Оцени ответ пользователя на вопрос по валидации бизнес-идей.\n\nВопрос: ${question}\nОтвет пользователя: ${userAnswer}\n\nПроанализируй ответ по следующим критериям:\n1. Полнота ответа (охватывает ли все аспекты вопроса)\n2. Точность информации\n3. Глубина понимания темы\n4. Практическая применимость\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nВерни JSON в следующем формате:\n{\n  "isCorrect": true/false,\n  "needsGuiding": true/false,\n  "score": число от 0 до 100,\n  "feedback": "краткий комментарий",\n  "guidingQuestions": ["наводящий вопрос 1", "наводящий вопрос 2"]\n}\n\nЕсли ответ правильный и полный, isCorrect=true, needsGuiding=false.\nЕсли ответ неполный или неточный, isCorrect=false, needsGuiding=true, и предоставь 1-2 наводящих вопроса.'
                },
                generateVerdict: {
                    description: 'Генерация вердикта AI по идее на основе ответов',
                    prompt: 'На основе бизнес-идеи и ответов пользователя на вопросы валидации, дай свой вердикт:\n\n**Идея:** ${ideaData}\n\n**Ответы пользователя на вопросы валидации:**\n${userAnswers}\n\n**Итоговый балл:** ${validationState.totalScore}/100\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nYesй краткий, но обоснованный вердикт о жизнеспособности идеи (1-2 абзаца).'
                }
            },
            dialog: {
                generateQuestions: {
                    description: 'Генерация наводящих вопросов для анализа идеи',
                    prompt: 'Ты эксперт по анализу бизнес-идей. Пользователь описал свою идею: "${dialogState.userIdea}"\n\nСоздай 5-6 наводящих вопросов для получения более детальной информации о:\n1. Целевой аудитории и их проблемах\n2. Конкурентах и рынке\n3. Модели монетизации\n4. Технических аспектах\n5. Ресурсах и команде\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nВопросы должны быть конкретными и помогать лучше понять идею. Верни только список вопросов, каждый с новой строки, начиная с номера.'
                },
                finalAnalysis: {
                    description: 'Создание финального анализа идеи на основе диалога',
                    prompt: 'Ты эксперт по анализу бизнес-идей. Проанализируй идею пользователя и создай детальный отчет.\n\nИсходная идея: "${dialogState.userIdea}"\n\nДиалог с пользователем:\n${dialogSummary}\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nСоздай структурированный анализ в следующем формате:\n\n## Краткое описание идеи\n[Краткое описание в 2-3 предложения]\n\n## Анализ проблемы\n[Какие проблемы решает идея]\n\n## Целевая аудитория\n[Кто является целевой аудиторией]\n\n## Конкурентный анализ\n[Основные конкуренты и отличия]\n\n## Модель монетизации\n[Как планируется зарабатывать]\n\n## Технические аспекты\n[Что нужно для реализации]\n\n## SWOT анализ\n**Сильные стороны:**\n- [список]\n\n**Слабые стороны:**\n- [список]\n\n**Возможности:**\n- [список]\n\n**Угрозы:**\n- [список]\n\n## Рекомендации\n[Конкретные рекомендации по развитию идеи]\n\nИспользуй markdown форматирование.'
                }
            },
            api: {
                chatContext: {
                    description: 'Контекст для чата с AI в модулях',
                    prompt: '${currentModule.systemPrompt}\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nКонтекст проекта: ${appState.userIdeaText}\n\nВопрос пользователя: ${userMessage}'
                },
                generalContext: {
                    description: 'Общий контекст для AI без конкретного вопроса',
                    prompt: '${currentModule.systemPrompt}\n\nВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.\n\nКонтекст проекта пользователя: ${appState.userIdeaText}'
                }
            }
        };
        
        this.settings = {
            maxResponseLength: 2000,
            defaultLanguage: 'ru',
            responseFormat: 'markdown',
            temperature: 0.7,
            maxTokens: 4000
        };
        
        this.fallbacks = {
            validationQuestions: [
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
            ],
            learningPlan: [
                {
                    title: 'Основы темы',
                    description: 'Изучим базовые концепции и принципы',
                    question: 'Какие основные принципы вы поняли из этого аспекта?'
                },
                {
                    title: 'Практическое применение',
                    description: 'Как применить знания к вашей идее',
                    question: 'Как вы планируете применить эти знания к своему проекту?'
                },
                {
                    title: 'Анализ и оценка',
                    description: 'Оценка эффективности подхода',
                    question: 'Какие метрики вы будете использовать для оценки?'
                }
            ]
        };
        
        this.isLoaded = true;
        console.log('Загружены встроенные промпты по умолчанию');
    }
    
    // Получение промпта по категории и типу
    getPrompt(category, type) {
        if (!this.isLoaded || !this.prompts[category] || !this.prompts[category][type]) {
            console.warn(`Промпт не найден: ${category}.${type}`);
            return null;
        }
        
        return this.prompts[category][type];
    }
    
    // Получение системного промпта модуля
    getModuleSystemPrompt(moduleId) {
        if (!this.isLoaded || !this.prompts.modules[moduleId]) {
            console.warn(`Системный промпт модуля не найден: ${moduleId}`);
            return null;
        }
        
        return this.prompts.modules[moduleId].systemPrompt;
    }
    
    // Получение настроек
    getSettings() {
        return this.settings || {};
    }
    
    // Получение резервных данных
    getFallbacks() {
        return this.fallbacks || {};
    }
    
    // Подстановка переменных в промпт
    formatPrompt(promptTemplate, variables) {
        if (!promptTemplate) return '';
        
        let formattedPrompt = promptTemplate;
        
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `\${${key}}`;
            formattedPrompt = formattedPrompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
        
        return formattedPrompt;
    }
    
    // Получение форматированного промпта
    getFormattedPrompt(category, type, variables = {}) {
        const promptData = this.getPrompt(category, type);
        if (!promptData) return null;
        
        return {
            ...promptData,
            prompt: this.formatPrompt(promptData.prompt, variables)
        };
    }
    
    // Обновление промпта
    updatePrompt(category, type, newPrompt) {
        if (!this.isLoaded || !this.prompts[category]) {
            console.error(`Категория промптов не найдена: ${category}`);
            return false;
        }
        
        if (!this.prompts[category][type]) {
            console.error(`Тип промпта не найден: ${category}.${type}`);
            return false;
        }
        
        this.prompts[category][type] = {
            ...this.prompts[category][type],
            ...newPrompt
        };
        
        console.log(`Промпт обновлен: ${category}.${type}`);
        return true;
    }
    
    // Экспорт промптов в JSON
    exportPrompts() {
        if (!this.isLoaded) {
            console.error('Промпты не загружены');
            return null;
        }
        
        return {
            version: '1.0.0',
            description: 'All промпты AI Инкубатора для удобной настройки',
            lastUpdated: new Date().toISOString(),
            prompts: this.prompts,
            settings: this.settings,
            fallbacks: this.fallbacks,
            metadata: {
                totalPrompts: this.countPrompts(),
                categories: Object.keys(this.prompts),
                languages: ['ru'],
                aiProviders: ['gemini', 'openai']
            }
        };
    }
    
    // Подсчет общего количества промптов
    countPrompts() {
        if (!this.isLoaded) return 0;
        
        let count = 0;
        for (const category of Object.values(this.prompts)) {
            count += Object.keys(category).length;
        }
        return count;
    }
    
    // Получение статистики промптов
    getStats() {
        if (!this.isLoaded) return null;
        
        const stats = {
            totalPrompts: this.countPrompts(),
            categories: {},
            settings: this.settings
        };
        
        for (const [category, prompts] of Object.entries(this.prompts)) {
            stats.categories[category] = Object.keys(prompts).length;
        }
        
        return stats;
    }
}

// Создаем глобальный экземпляр PromptManager
window.promptManager = new PromptManager();

// Функции для использования в других модулях
window.getPrompt = (category, type) => {
    return window.promptManager.getPrompt(category, type);
};

window.getModuleSystemPrompt = (moduleId) => {
    return window.promptManager.getModuleSystemPrompt(moduleId);
};

window.getFormattedPrompt = (category, type, variables) => {
    return window.promptManager.getFormattedPrompt(category, type, variables);
};

window.updatePrompt = (category, type, newPrompt) => {
    return window.promptManager.updatePrompt(category, type, newPrompt);
};

window.exportPrompts = () => {
    return window.promptManager.exportPrompts();
};

window.getPromptStats = () => {
    return window.promptManager.getStats();
};
