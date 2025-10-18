// State Manager - Управление состоянием приложения с историей изменений
class StateManager {
    constructor() {
        this.currentState = null;
        this.history = [];
        this.maxHistorySize = 50; // Максимальное количество состояний в истории
        this.isLoading = false;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 5000; // 5 secунд
        
        this.init();
    }
    
    init() {
        // Загружаем последнее состояние при инициализации
        this.loadLastState();
        
        // Запускаем автосохранение
        this.startAutoSave();
        
        // Слушаем события изменения состояния
        this.setupEventListeners();
    }
    
    // Создание снапшота текущего состояния
    createSnapshot() {
        if (this.isLoading) return; // Не создаем снапшоты во время загрузки
        
        const snapshot = {
            timestamp: Date.now(),
            state: this.deepClone(appState),
            description: this.generateStateDescription()
        };
        
            // Добавляем в историю только если состояние изменилось
    if (!this.isStateEqual(this.currentState, snapshot.state)) {
        this.addToHistory(snapshot);
        this.currentState = this.deepClone(snapshot.state);
        
        // Показываем уведомление о создании снапшота (только в режиме разработки)
        if (window.showNotification && this.history.length % 10 === 0) { // Каждый 10-й снапшот
            window.showNotification(`Создан снапшот состояния (${this.history.length}/${this.maxHistorySize})`, 'info', 2000);
        }
    }
        
        return snapshot;
    }
    
    // Добавление состояния в историю
    addToHistory(snapshot) {
        this.history.push(snapshot);
        
        // Ограничиваем размер истории
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        
        // Сохраняем историю в localStorage
        this.saveHistory();
    }
    
    // Откат на один шаг назад
    undo() {
        if (this.history.length < 2) {
            console.log('No states to undo');
            return false;
        }
        
        // Удаляем текущее состояние
        this.history.pop();
        
        // Получаем предыдущее состояние
        const previousState = this.history[this.history.length - 1];
        
        if (previousState) {
            this.restoreState(previousState.state);
            console.log('Undo performed:', previousState.description);
            
            // Показываем уведомление об откате
            if (window.showNotification) {
                window.showNotification(`Undo performed: ${previousState.description}`, 'success');
            }
            
            return true;
        }
        
        return false;
    }
    
    // Восстановление состояния
    restoreState(state) {
        this.isLoading = true;
        
        try {
            // Восстанавливаем основное состояние
            Object.assign(appState, state);
            
            // Обновляем UI
            this.updateUI();
            
            // Сохраняем текущее состояние
            this.saveCurrentState();
            
            console.log('State restored');
        } catch (error) {
            console.error('Error при восстановлении состояния:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
    // Обновление UI после изменения состояния
    updateUI() {
        // Обновляем список модулей
        if (typeof renderModuleList === 'function') {
            renderModuleList();
        }
        
        // Обновляем контент модуля
        if (typeof renderModuleContent === 'function') {
            renderModuleContent();
        }
        
        // Обновляем общий прогресс
        if (typeof updateOverallProgress === 'function') {
            updateOverallProgress();
        }
        
        // Обновляем паспорт проекта
        if (typeof updateProjectPassport === 'function') {
            updateProjectPassport();
        }
        
        // Обновляем чат
        if (typeof updateChatDisplay === 'function') {
            updateChatDisplay();
        }
    }
    
    // Сохранение текущего состояния
    saveCurrentState() {
        const stateData = {
            appState: this.deepClone(appState),
            timestamp: Date.now(),
            version: '1.0'
        };
        
        try {
            localStorage.setItem('aiIncubatorCurrentState', JSON.stringify(stateData));
        } catch (error) {
            console.error('Error при сохранении состояния:', error);
        }
    }
    
    // Загрузка последнего состояния
    loadLastState() {
        try {
            const savedState = localStorage.getItem('aiIncubatorCurrentState');
            if (savedState) {
                const stateData = JSON.parse(savedState);
                Object.assign(appState, stateData.appState);
                this.currentState = this.deepClone(appState);
                console.log('Последнее состояние загружено');
            }
        } catch (error) {
            console.error('Error при загрузке состояния:', error);
        }
    }
    
    // Загрузка истории
    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('aiIncubatorHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                console.log('История загружена:', this.history.length, 'состояний');
            }
        } catch (error) {
            console.error('Error при загрузке истории:', error);
            this.history = [];
        }
    }
    
    // Сохранение истории
    saveHistory() {
        try {
            localStorage.setItem('aiIncubatorHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error при сохранении истории:', error);
        }
    }
    
    // Генерация описания состояния
    generateStateDescription() {
        const currentModule = appState.modules[appState.currentModule];
        const completedTopics = currentModule?.topics?.filter(t => t.status === 'completed').length || 0;
        const totalTopics = currentModule?.topics?.length || 0;
        
        return `Модуль: ${currentModule?.title || 'Неизвестно'} (${completedTopics}/${totalTopics} топиков)`;
    }
    
    // Сравнение состояний
    isStateEqual(state1, state2) {
        if (!state1 || !state2) return false;
        
        // Сравниваем ключевые поля
        const keyFields = ['currentModule', 'projectData', 'userIdeaText'];
        
        for (const field of keyFields) {
            if (JSON.stringify(state1[field]) !== JSON.stringify(state2[field])) {
                return false;
            }
        }
        
        // Сравниваем статусы модулей и топиков
        if (state1.modules && state2.modules) {
            for (let i = 0; i < state1.modules.length; i++) {
                const module1 = state1.modules[i];
                const module2 = state2.modules[i];
                
                if (module1.status !== module2.status || module1.progress !== module2.progress) {
                    return false;
                }
                
                if (module1.topics && module2.topics) {
                    for (let j = 0; j < module1.topics.length; j++) {
                        const topic1 = module1.topics[j];
                        const topic2 = module2.topics[j];
                        
                        if (topic1.status !== topic2.status || topic1.completedQuestions !== topic2.completedQuestions) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }
    
    // Глубокое клонирование объекта
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    // Запуск автосохранения
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.createSnapshot();
        }, this.autoSaveDelay);
    }
    
    // Остановка автосохранения
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    // Настройка слушателей событий
    setupEventListeners() {
        // Создаем снапшот при изменении состояния
        const originalSaveProgress = window.saveProgress;
        window.saveProgress = () => {
            if (originalSaveProgress) {
                originalSaveProgress();
            }
            this.createSnapshot();
        };
        
        // Создаем снапшот при завершении топика
        const originalCompleteTopic = window.completeTopic;
        window.completeTopic = () => {
            if (originalCompleteTopic) {
                originalCompleteTopic();
            }
            this.createSnapshot();
        };
        
        // Создаем снапшот при переходе к следующему модулю
        const originalNextModule = window.nextModule;
        window.nextModule = () => {
            if (originalNextModule) {
                originalNextModule();
            }
            this.createSnapshot();
        };
    }
    
    // Получение информации о состоянии
    getStateInfo() {
        return {
            currentState: this.currentState ? this.generateStateDescription() : 'No сохраненного состояния',
            historySize: this.history.length,
            maxHistorySize: this.maxHistorySize,
            lastSnapshot: this.history.length > 0 ? new Date(this.history[this.history.length - 1].timestamp).toLocaleString() : 'No'
        };
    }
    
    // Очистка истории
    clearHistory() {
        this.history = [];
        this.saveHistory();
        console.log('History cleared');
    }
    
    // Экспорт состояния
    exportState() {
        const exportData = {
            currentState: this.currentState,
            history: this.history,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-incubator-state-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Импорт состояния
    importState(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (importData.currentState) {
                        this.restoreState(importData.currentState);
                    }
                    
                    if (importData.history) {
                        this.history = importData.history;
                        this.saveHistory();
                    }
                    
                    console.log('State imported');
                    resolve();
                } catch (error) {
                    console.error('Error при импорте состояния:', error);
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Создаем глобальный экземпляр StateManager
window.stateManager = new StateManager();

// Функции для использования в других модулях
window.undoLastAction = () => {
    return window.stateManager.undo();
};

window.getStateInfo = () => {
    return window.stateManager.getStateInfo();
};

window.clearStateHistory = () => {
    window.stateManager.clearHistory();
};

window.exportAppState = () => {
    window.stateManager.exportState();
};

window.importAppState = (file) => {
    return window.stateManager.importState(file);
};
