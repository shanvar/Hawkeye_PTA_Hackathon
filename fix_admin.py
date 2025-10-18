# Fix admin.js - translate all Russian text and update team info
import re

# Read the file
with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define comprehensive translations
translations = {
    # Button texts
    'Hide админ панель': 'Hide Admin Panel',
    'Адmin панель': 'Admin Panel',
    'Скрыть админ панель': 'Hide Admin Panel',

    # Dropdown options
    'Выберите модуль...': 'Select module...',
    'Сначала выберите модуль...': 'First select a module...',
    'Выберите топик...': 'Select topic...',

    # Status messages
    'Выберите модуль из списка': 'Select module from list',
    'All модули разблокированы': 'All modules unlocked',
    'All топики разблокированы': 'All topics unlocked',
    'All топики сброшены': 'All topics reset',
    'All топики завершены': 'All topics completed',
    'Переход к модулю': 'Switched to module',
    'выполнен': 'completed',
    'Переход к топику': 'Switched to topic',
    'Неверный модуль': 'Invalid module',
    'Неверный топик': 'Invalid topic',
    'Выберите модуль и топик': 'Select module and topic',

    # Welcome messages
    'Добро пожаловать в модуль': 'Welcome to module',
    'Задайте любые вопросы по этой теме, и ИИ Агент Ментор поможет вам разобраться.': 'Ask any questions about this topic, and the AI Mentor Agent will help you understand.',
    'Задайте любые вопросы по этой теме.': 'Ask any questions about this topic.',

    # Test data messages
    'Тестовая бизнес-идея:': 'Test business idea:',
    'Тестовые данные очищены': 'Test data cleared',
    'Полные тестовые данные загружены': 'Full test data loaded',
    'Полные тестовые данные загружены!': 'Full test data loaded!',
    'Тестовые данные для модуля': 'Test data for module',
    'загружены': 'loaded',
    'All тестовые данные очищены': 'All test data cleared',

    # Admin status
    'Текущий модуль:': 'Current module:',
    'Статус:': 'Status:',
    'Прогресс:': 'Progress:',
    'модулей завершено': 'modules completed',
    'Идея:': 'Idea:',
    'Загружена': 'Loaded',
    'Не загружена': 'Not loaded',
    'AI Провайдер:': 'AI Provider:',
    'Модель Gemini:': 'Gemini Model:',
    'История состояний:': 'State history:',
    'записей': 'entries',
    'Последний снапшот:': 'Last snapshot:',

    # Gemini model messages
    'Переключились на модель:': 'Switched to model:',
    'Достигнут конец списка моделей': 'Reached end of models list',
    'Сброшено на модель по умолчанию:': 'Reset to default model:',

    # Undo/History messages
    'Undo performed успешно': 'Undo performed successfully',
    'No действий для отката': 'No actions to undo',
    'История состояний очищена': 'State history cleared',
    'Error при очистке истории': 'Error clearing history',

    # API Logger messages
    'API Logger не инициализирован': 'API Logger not initialized',
    'No логов для модуля:': 'No logs for module:',
    'Экспортированы логи модуля:': 'Exported module logs:',
    'No логов для экспорта': 'No logs to export',
    'Экспортированы все логи': 'Exported all logs',
    'модулей': 'modules',
    'запросов': 'requests',
    'Статистика API логов:': 'API Logs Statistics:',
    'Allго модулей:': 'Total modules:',
    'Allго запросов:': 'Total requests:',
    'Allго ответов:': 'Total responses:',
    'Детализация по модулям:': 'Breakdown by modules:',
    'ответов': 'responses',
    'No логов для очистки': 'No logs to clear',
    'Вы уверены, что хотите очистить все логи?': 'Are you sure you want to clear all logs?',
    'Это удалит': 'This will delete',
    'All логи очищены': 'All logs cleared',

    # State export/import
    'State exported': 'State exported',
    'Error при экспорте состояния': 'Error exporting state',
    'State imported успешно': 'State imported successfully',
    'Error при импорте состояния:': 'Error importing state:',

    # Loading messages
    'Loading error тестовых данных:': 'Error loading test data:',
    'Loading error данных модуля:': 'Error loading module data:',
    'Loading error файла test-data.json:': 'Error loading test-data.json file:',
    'Модуль не найден': 'Module not found',

    # Project info
    'Проект:': 'Project:',
    'от идеи до готового MVP': 'from idea to ready MVP',
    'Ключевые особенности:': 'Key features:',
    'Целевая аудитория:': 'Target audience:',
    'Проблема:': 'Problem:',
    'Решение:': 'Solution:',
    'Описание:': 'Description:',

    # Common words
    'monthы': 'months',
    'minут': 'minutes',
    'человек': 'people',
    'year': 'year',
    'month': 'month',
    'тыс': 'K',
    'млрд': 'B',
    'млн': 'M',
}

# Apply translations
for russian, english in translations.items():
    content = content.replace(russian, english)

# Write the translated content back
with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Admin.js translation completed!")
print(f"Applied {len(translations)} translations")
