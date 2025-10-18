# Fix ui.js - translate all Russian headers
import re

# Read the file
with open('js/ui.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define translations for UI headers
translations = {
    # Project passport headers
    'Паспорт проекта:': 'Project Passport:',
    'Паспорт проекта': 'Project Passport',
    'Основная информация': 'Basic Information',
    'Проблема и решение': 'Problem and Solution',
    'Проблема:': 'Problem:',
    'Решение:': 'Solution:',
    'Рынок': 'Market',
    'Бизнес-модель': 'Business Model',
    'Команда:': 'Team:',
    'Команда': 'Team',
    'Финансы': 'Financials',
    'Технологии': 'Technology',

    # Field labels
    'Отрасль:': 'Industry:',
    'Стадия:': 'Stage:',
    'Размер команды:': 'Team Size:',
    'Локация:': 'Location:',
    'Размер рынка:': 'Market Size:',
    'Конкуренты:': 'Competitors:',
    'Источники дохода:': 'Revenue Streams:',
    'Ценообразование:': 'Pricing:',
    'Основатели:': 'Founders:',
    'Финансирование:': 'Funding:',
    'Платформа:': 'Platform:',
    'Бэкенд:': 'Backend:',
    'AI:': 'AI:',
    'Интеграции:': 'Integrations:',

    # Content sections
    'Целевая аудитория:': 'Target Audience:',
    'Ключевые особенности:': 'Key Features:',
    'Описание:': 'Description:',

    # Button and UI text
    'Загружено': 'Loaded',
    'Не загружено': 'Not loaded',
    'записей': 'entries',
    'модулей завершено': 'modules completed',
}

# Apply translations
for russian, english in translations.items():
    content = content.replace(russian, english)

# Write the translated content back
with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ui.js translation completed!")
print(f"Applied {len(translations)} translations")
