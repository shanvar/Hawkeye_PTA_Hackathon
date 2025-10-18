// Dynamic learning state
let dynamicLearningState = {
    isActive: false,
    currentTopic: null,
    plan: [], // Simple list of aspect names
    currentAspectIndex: 0, // Current aspect index
    userAnswers: [],
    guidingQuestionsUsed: 0,
    maxGuidingQuestions: 3,
    currentQuestion: '',
    aspectScores: [], // Array for storing scores for each aspect
    currentAspectAttempts: 0, // Attempt counter for current aspect
    maxAttemptsPerAspect: 3, // Maximum attempts per aspect
    waitingForStartConfirmation: false // Waiting for learning start confirmation
};

// Select topic for learning
function selectTopic(topic) {
    // Show chat popup instead of inline chat section
    showChatPopup();
    
    // Start dynamic learning for all modules including validation
    startDynamicLearning(topic);
}

// Start dynamic learning for a topic
async function startDynamicLearning(topic) {
    console.log('startDynamicLearning called with topic:', topic.title);
    
    const loadingMessage = addMessage('⏳ Creating learning plan...', 'assistant');
    
    try {
        // Generate learning plan using AI
        const plan = await generateLearningPlan(topic);
        
        console.log('Generated plan:', plan);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        // Initialize dynamic learning state
        dynamicLearningState = {
            isActive: true,
            currentTopic: topic,
            plan: plan,
            currentAspectIndex: 0,
            userAnswers: [],
            guidingQuestionsUsed: 0,
            maxGuidingQuestions: 3,
            currentQuestion: '',
            aspectScores: [],
            currentAspectAttempts: 0,
            maxAttemptsPerAspect: 3,
            waitingForStartConfirmation: true
        };
        
        console.log('Dynamic learning state initialized:', dynamicLearningState);
        
        // Show plan and ask for confirmation
        console.log('About to call showLearningPlan');
        showLearningPlan();
        
    } catch (error) {
        console.error('Error starting dynamic learning:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addMessage('❌ Error creating learning plan. Please try again.', 'assistant');
    }
}



// Generate learning plan using AI
async function generateLearningPlan(topic) {
    const currentModule = appState.modules[appState.currentModule];
    const ideaData = appState.userIdeaText || 'Not specified';
    
    try {
        const prompt = `Create a learning plan for the topic "${topic.title}" in the context of startup "${appState.projectData?.idea || 'your project'}". 
        
The plan should contain 4-5 key aspects to study. Each aspect should be brief (up to 10 words) and specific.

Response format - numbered list only:
1. First aspect
2. Second aspect
3. Third aspect
4. Fourth aspect

Do not add any additional comments or questions.`;
        
        const response = await callAI(prompt);
        const plan = parseLearningPlan(response);
        
        if (plan.length === 0) {
            // Use fallback plan if AI fails
            return getFallbackLearningPlan(topic);
        }
        
        return plan;
    } catch (error) {
        console.error('Error generating learning plan:', error);
        // Use fallback plan
        return getFallbackLearningPlan(topic);
    }
}

// Get fallback learning plan for specific topics
function getFallbackLearningPlan(topic) {
    const fallbackPlans = {
        'Validation Methodology': [
            'Basics of Business Idea Validation',
            'Customer Development Methods',
            'Creating and Testing Hypotheses',
            'Metrics and Success Criteria',
            'Practical Application to Project'
        ],
        'Problem Analysis': [
            'Identifying Key Problems',
            'Assessing Problem Criticality',
            'Target Audience Research',
            'Willingness to Pay Analysis',
            'Problem Statement Formulation'
        ],
        'Target Audience': [
            'Market Segmentation',
            'Creating Customer Personas',
            'Audience Behavior Research',
            'Defining Acquisition Channels',
            'Target Audience Validation'
        ],
        'Competitive Analysis': [
            'Identifying Competitors',
            'Competitive Advantages Analysis',
            'Business Models Study',
            'Market Position Assessment',
            'Finding Niche Opportunities'
        ],
        'Business Model': [
            'Defining Revenue Sources',
            'Cost Structure',
            'Key Partners',
            'Value Propositions',
            'Distribution Channels'
        ],
        'MVP Development': [
            'Defining Key Features',
            'Feature Prioritization',
            'Solution Prototyping',
            'User Testing',
            'Feedback-Based Iteration'
        ]
    };
    
    // Return specific plan or default plan
    return fallbackPlans[topic.title] || [
        'Core Topic Concepts',
        'Practical Application Methods',
        'Best Practices Analysis',
        'Project Integration',
        'Planning Next Steps'
    ];
}

// Parse AI response into learning plan (new format)
function parseLearningPlan(response) {
    const plan = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and the question line
        if (!trimmedLine || trimmedLine.includes('QUESTION:') || trimmedLine.includes('Start learning')) {
            continue;
        }
        
        // Parse numbered list items (1. 2. 3. etc.)
        const match = trimmedLine.match(/^\d+\.\s*(.+)/);
        if (match) {
            plan.push(match[1].trim());
        }
    }
    
    return plan;
}



// Show learning plan and ask for confirmation
function showLearningPlan() {
    if (!dynamicLearningState.isActive) return;
    
    console.log('showLearningPlan called');
    
    const planText = `## 📋 Topic Learning Plan: ${dynamicLearningState.currentTopic.title}

### 📚 Aspects to Study:

${dynamicLearningState.plan.map((aspect, index) =>
    `**${index + 1}.** ${aspect}`
).join('\n\n')}

---

### ❓ Ready to Start Learning?`;
    
    addMessage(planText, 'assistant');
    
    console.log('About to call showPlanButtons');
    // Show plan confirmation buttons and hide input
    showPlanButtons();
    console.log('showPlanButtons called');
}

// Start the first aspect of dynamic learning
function startFirstAspect() {
    if (!dynamicLearningState.isActive) return;
    
    dynamicLearningState.currentAspectIndex = 0;
    dynamicLearningState.currentAspectAttempts = 0;
    dynamicLearningState.waitingForStartConfirmation = false;
    
    teachCurrentAspect();
}

// Send chat message
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Check if we're in review mode for validation
    if (chatInput.dataset.reviewMode === 'true') {
        await processReviewAnswer(message);
        chatInput.value = '';
        return;
    }
    
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Check if we're in dynamic learning mode
    if (dynamicLearningState.isActive) {
        await processDynamicLearningAnswer(message);
        return;
    }
    
    const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
    const currentApiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : (appState.aiProvider === 'gemini' ? appState.geminiApiKey : appState.apiKey);
    const providerName = currentProvider === 'gemini' ? 'Gemini' : 'OpenAI';
    
    if (!currentApiKey) {
        addMessage(`❌ Please configure ${providerName} API key in sidebar to get AI responses.`, 'assistant');
        return;
    }
    
    const loadingMessage = addMessage(`⏳ AI Mentor Agent is typing...`, 'assistant');
    
    try {
        let response;
        if (currentProvider === 'gemini') {
            response = await callGemini(message);
        } else {
            response = await callOpenAI(message);
        }
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addMessage(response, 'assistant');
        
        // Update progress for validation module
        const currentModule = appState.modules[appState.currentModule];
        if (currentModule.id === 'validation') {
            // For validation module, we track progress differently
            // Progress is updated in handleValidationTopic
        } else {
            updateModuleProgress();
        }
    } catch (error) {
        console.error('Error sending message:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        let errorMessage = `❌ An error occurred when accessing ${providerName} AI: `;
        
        if (error.message.includes('API key') || error.message.includes('403')) {
            errorMessage += 'Check the API key correctness.';
        } else if (error.message.includes('limit') || error.message.includes('429')) {
            errorMessage += 'Request limit exceeded. Try later.';
        } else if (error.message.includes('Access denied')) {
            errorMessage += 'Your account does not have API access.';
        } else {
            errorMessage += error.message;
        }
        
        addMessage(errorMessage, 'assistant');
    }
}

// Teach current aspect using AI
async function teachCurrentAspect() {
    if (!dynamicLearningState.isActive) return;
    
    const loadingMessage = addMessage('⏳ Preparing material...', 'assistant');
    
    try {
        const currentAspect = dynamicLearningState.plan[dynamicLearningState.currentAspectIndex];
        const projectIdea = appState.projectData?.idea || 'your project';
        
        const prompt = `Teach the aspect "${currentAspect}" for topic "${dynamicLearningState.currentTopic.title}" in the context of startup "${projectIdea}".

Response format:
ASPECT ${dynamicLearningState.currentAspectIndex + 1}: [Aspect name]
Description: [Detailed description of the aspect, no more than 800 characters, with practical examples and methods]
Question: [Control question on studied material with hint about user's project]

Description should be detailed but not exceed 800 characters. Question should test understanding and contain hint related to user's project.`;
        
        const response = await callAI(prompt);
        const aspectData = parseAspectData(response);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        if (aspectData) {
            addMessage(`**ASPECT ${dynamicLearningState.currentAspectIndex + 1}: ${aspectData.title}**

${aspectData.description}

**❓ Control Question:**
${aspectData.question}

*Attempts: ${dynamicLearningState.currentAspectAttempts}/${dynamicLearningState.maxAttemptsPerAspect}*`, 'assistant');
            
            dynamicLearningState.currentQuestion = aspectData.question;
        } else {
            // Use fallback aspect data
            const fallbackData = getFallbackAspectData(currentAspect, dynamicLearningState.currentTopic);
            addMessage(`**ASPECT ${dynamicLearningState.currentAspectIndex + 1}: ${fallbackData.title}**

${fallbackData.description}

**❓ Control Question:**
${fallbackData.question}

*Attempts: ${dynamicLearningState.currentAspectAttempts}/${dynamicLearningState.maxAttemptsPerAspect}*`, 'assistant');
            
            dynamicLearningState.currentQuestion = fallbackData.question;
        }
        
    } catch (error) {
        console.error('Error teaching aspect:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        // Use fallback aspect data
        const currentAspect = dynamicLearningState.plan[dynamicLearningState.currentAspectIndex];
        const fallbackData = getFallbackAspectData(currentAspect, dynamicLearningState.currentTopic);
        addMessage(`**ASPECT ${dynamicLearningState.currentAspectIndex + 1}: ${fallbackData.title}**

${fallbackData.description}

**❓ Control Question:**
${fallbackData.question}

*Attempts: ${dynamicLearningState.currentAspectAttempts}/${dynamicLearningState.maxAttemptsPerAspect}*`, 'assistant');
        
        dynamicLearningState.currentQuestion = fallbackData.question;
    }
}

// Get fallback aspect data
function getFallbackAspectData(aspect, topic) {
    const fallbackData = {
        'Basics of Business Idea Validation': {
            title: 'Basics of Business Idea Validation',
            description: 'Validation is the process of checking business idea viability before investing significant resources. Key principles: 1) Start with the problem, not the solution 2) Test hypotheses through customer interviews 3) Use MVP for rapid testing 4) Measure real metrics, not assumptions. Validation helps avoid creating a product nobody needs.',
            question: 'How would you apply validation principles to your project? Which hypotheses need to be tested first?'
        },
        'Customer Development Methods': {
            title: 'Customer Development Methods',
            description: 'Customer Development is a systematic approach to finding and validating business models. Key methods: 1) In-depth interviews (20-30 minutes) with potential customers 2) User behavior observation 3) A/B testing different hypotheses 4) Product usage data analysis. Goal - understand real customer needs.',
            question: 'Which Customer Development methods could you use for your project? Who would you interview?'
        },
        'Creating and Testing Hypotheses': {
            title: 'Creating and Testing Hypotheses',
            description: 'A hypothesis is an assumption about how the market works or what customers need. Hypothesis format: "We assume that [target audience] needs [solution] because [problem/motivation]". Testing: 1) Define success criteria 2) Conduct experiment 3) Collect data 4) Draw conclusions. Example: "We assume 70% of interviewees are ready to pay for the solution".',
            question: 'Formulate 3 key hypotheses for your project. How would you test them?'
        }
    };
    
    // Return specific data or default
    return fallbackData[aspect] || {
        title: aspect,
        description: `This aspect "${aspect}" is an important part of studying the topic "${topic.title}". Consider key concepts, methods and practical application in your project context.`,
        question: `How can you apply knowledge about "${aspect}" to your project? What specific steps do you plan to take?`
    };
}

// Parse aspect data from AI response
function parseAspectData(response) {
    const lines = response.split('\n');
    let title = '';
    let description = '';
    let question = '';
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('ASPECT')) {
            title = trimmedLine.replace(/^ASPECT \d+:\s*/, '');
        } else if (trimmedLine.startsWith('Description:')) {
            description = trimmedLine.replace('Description:', '').trim();
        } else if (trimmedLine.startsWith('Question:')) {
            question = trimmedLine.replace('Question:', '').trim();
        }
    }
    
    if (title && description && question) {
        return { title, description, question };
    }
    
    return null;
}

// Process user answer in dynamic learning mode
async function processDynamicLearningAnswer(userAnswer) {
    if (!dynamicLearningState.isActive) return;
    
    // Start confirmation is now handled by buttons, skip this check
    
    const currentAspect = dynamicLearningState.plan[dynamicLearningState.currentAspectIndex];
    dynamicLearningState.currentAspectAttempts++;
    
    // Record user answer
    dynamicLearningState.userAnswers.push({
        aspectIndex: dynamicLearningState.currentAspectIndex,
        answer: userAnswer,
        attempt: dynamicLearningState.currentAspectAttempts
    });
    
    const loadingMessage = addMessage('⏳ Evaluating your answer...', 'assistant');
    
    try {
        const projectIdea = appState.projectData?.idea || 'your project';
        
        const prompt = `Evaluate the user's answer to the control question on aspect "${currentAspect}" in the context of the project "${projectIdea}".

Question: ${dynamicLearningState.currentQuestion}
User's answer: ${userAnswer}

IMPORTANT: If the user responds with "next", "continue", "skip" or similar words - this means desire to move to the next aspect. In this case give a score of 5-6 and action NEXT_ASPECT.

Rate the answer on a scale of 1-10, where:
1-3: Incorrect or incomplete answer
4-6: Partially correct answer or desire to continue
7-8: Good answer with understanding
9-10: Excellent answer with deep understanding

Response format:
SCORE: [number from 1 to 10]
COMMENT: [brief comment on the answer]
ACTION: [NEXT_ASPECT if score >= 7 or user wants to continue, else GUIDING_QUESTION]

If ACTION = GUIDING_QUESTION, add a guiding question to help the user.`;
        
        const response = await callAI(prompt);
        await processAIEvaluation(response);
        
    } catch (error) {
        console.error('Error processing answer:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        // Use fallback evaluation
        const fallbackEvaluation = getFallbackEvaluation(userAnswer, currentAspect);
        await processAIEvaluation(fallbackEvaluation);
    }
}

// Get fallback evaluation when AI fails
function getFallbackEvaluation(userAnswer, aspect) {
    const lowerAnswer = userAnswer.toLowerCase().trim();
    
    // Check for "skip" or "continue" responses
    const skipKeywords = ['next', 'continue', 'skip', 'skip', 'next', 'continue'];
    const isSkipResponse = skipKeywords.some(keyword => lowerAnswer.includes(keyword));
    
    if (isSkipResponse) {
        return `SCORE: 5\nCOMMENT: User wants to continue learning. Moving to the next aspect.\nACTION: NEXT_ASPECT`;
    }
    
    // Simple fallback evaluation based on answer length and keywords
    const answerLength = userAnswer.length;
    let score = 5; // Default middle score
    let comment = 'Answer received. Continue learning.';
    let action = 'NEXT_ASPECT';
    
    if (answerLength < 10) {
        score = 3;
        comment = 'Answer too brief. Try to give a more detailed answer.';
        action = 'GUIDING_QUESTION';
    } else if (answerLength > 50) {
        score = 7;
        comment = 'Good detailed answer!';
    }
    
    // Check for relevant keywords
    const relevantKeywords = ['validation', 'client', 'problem', 'solution', 'testing', 'hypothesis', 'analysis', 'mvp', 'startup', 'business'];
    const hasKeywords = relevantKeywords.some(keyword => 
        userAnswer.toLowerCase().includes(keyword)
    );
    
    if (hasKeywords) {
        score = Math.min(score + 2, 10);
        comment = 'Excellent answer using key concepts!';
    }
    
    let fallbackResponse = `SCORE: ${score}\nCOMMENT: ${comment}\nACTION: ${action}`;
    
    if (action === 'GUIDING_QUESTION') {
        fallbackResponse += `\nTry thinking about how this aspect relates to your project. What specifically can you apply?`;
    }
    
    return fallbackResponse;
}

// Process AI evaluation response
async function processAIEvaluation(response) {
    const lines = response.split('\n');
    let score = 0;
    let comment = '';
    let action = '';
    let guidingQuestion = '';
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('SCORE:')) {
            score = parseInt(trimmedLine.replace('SCORE:', '').trim());
        } else if (trimmedLine.startsWith('COMMENT:')) {
            comment = trimmedLine.replace('COMMENT:', '').trim();
        } else if (trimmedLine.startsWith('ACTION:')) {
            action = trimmedLine.replace('ACTION:', '').trim();
        } else if (action === 'GUIDING_QUESTION' && trimmedLine && !trimmedLine.startsWith('SCORE:') && !trimmedLine.startsWith('COMMENT:') && !trimmedLine.startsWith('ACTION:')) {
            guidingQuestion = trimmedLine;
        }
    }
    
    // Add score to current aspect
    if (!dynamicLearningState.aspectScores[dynamicLearningState.currentAspectIndex]) {
        dynamicLearningState.aspectScores[dynamicLearningState.currentAspectIndex] = [];
    }
    dynamicLearningState.aspectScores[dynamicLearningState.currentAspectIndex].push(score);
    
    let message = `**Score: ${score}/10**\n\n${comment}\n\n`;
    
    if (action === 'NEXT_ASPECT' || score >= 7) {
        // Move to next aspect
        message += `✅ **Excellent!** Moving to the next aspect.\n\n`;
        moveToNextStep();
    } else if (action === 'GUIDING_QUESTION' && dynamicLearningState.currentAspectAttempts < dynamicLearningState.maxAttemptsPerAspect) {
        // Ask guiding question
        dynamicLearningState.guidingQuestionsUsed++;
        message += `💡 **Guiding Question:**\n${guidingQuestion}\n\n`;
        message += `*Attempts: ${dynamicLearningState.currentAspectAttempts}/${dynamicLearningState.maxAttemptsPerAspect}*`;
    } else {
        // Max attempts reached or user wants to continue, move to next aspect
        const currentAspectScores = dynamicLearningState.aspectScores[dynamicLearningState.currentAspectIndex] || [];
        const averageScore = currentAspectScores.length > 0 ? 
            currentAspectScores.reduce((a, b) => a + b, 0) / currentAspectScores.length : 0;
        
        if (dynamicLearningState.currentAspectAttempts >= dynamicLearningState.maxAttemptsPerAspect) {
            message += `⚠️ **Attempt limit reached** (${dynamicLearningState.maxAttemptsPerAspect}).\n`;
        } else {
            message += `✅ **Continuing learning.**\n`;
        }
        
        message += `📊 **Average score on aspect: ${averageScore.toFixed(1)}/10**\n\n`;
        message += `Moving to the next aspect.\n\n`;
        moveToNextStep();
    }
    
    addMessage(message, 'assistant');
}

// Move to next step in dynamic learning
function moveToNextStep() {
    dynamicLearningState.currentAspectIndex++;
    dynamicLearningState.currentAspectAttempts = 0;
    
    if (dynamicLearningState.currentAspectIndex >= dynamicLearningState.plan.length) {
        // All aspects completed
        completeDynamicLearning();
        return;
    }
    
    // Teach next aspect
    teachCurrentAspect();
}

// Complete dynamic learning session
function completeDynamicLearning() {
    const totalAspects = dynamicLearningState.plan.length;
    const totalAnswers = dynamicLearningState.userAnswers.length;
    const guidingQuestionsUsed = dynamicLearningState.guidingQuestionsUsed;
    
    // Calculate overall average score
    let totalScore = 0;
    let totalScores = 0;
    
    dynamicLearningState.aspectScores.forEach(aspectScores => {
        if (aspectScores.length > 0) {
            const aspectAverage = aspectScores.reduce((a, b) => a + b, 0) / aspectScores.length;
            totalScore += aspectAverage;
            totalScores++;
        }
    });
    
    const overallAverage = totalScores > 0 ? totalScore / totalScores : 0;
    
    addMessage(`🎉 **Topic study completed!**

✅ Topic "${dynamicLearningState.currentTopic.title}" successfully studied!

📊 **Statistics:**
• Aspects studied: ${totalAspects}
• Total answers: ${totalAnswers}
• Guiding questions: ${guidingQuestionsUsed}
• **Average score: ${overallAverage.toFixed(1)}/10**

🏆 **Result:** ${overallAverage >= 7 ? 'Excellent!' : overallAverage >= 5 ? 'Good!' : 'Requires review'}

Now you can continue studying other topics or move to the next module.`, 'assistant');
    
    // Update progress
    updateTopicProgressUniversal(dynamicLearningState.currentTopic.id);
    
    // Reset dynamic learning state
    dynamicLearningState.isActive = false;
    dynamicLearningState.currentTopic = null;
}

// Helper function to call AI
async function callAI(prompt) {
    const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
    const currentApiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : (appState.aiProvider === 'gemini' ? appState.geminiApiKey : appState.apiKey);
    const providerName = currentProvider === 'gemini' ? 'Gemini' : 'OpenAI';
    
    if (!currentApiKey) {
        throw new Error(`Please configure ${providerName} API key in sidebar to get AI responses.`);
    }
    
    let response;
    if (currentProvider === 'gemini') {
        response = await callGemini(prompt);
    } else {
        response = await callOpenAI(prompt);
    }
    
    return response;
}

// Universal function to update topic progress for all modules
function updateTopicProgressUniversal(topicId) {
    const currentModule = appState.modules[appState.currentModule];
    if (!currentModule || !currentModule.topics) return;

    const topic = currentModule.topics.find(t => t.id === topicId);
    if (!topic) return;

    // Mark topic as completed
    topic.status = 'completed';
    
    // Unlock next topic for all modules
    const nextTopicIndex = currentModule.topics.findIndex(t => t.id === topicId) + 1;
    if (nextTopicIndex < currentModule.topics.length) {
        const nextTopic = currentModule.topics[nextTopicIndex];
        nextTopic.status = 'active';
        
        // Show popup notification about new topic (universal)
        showUniversalTopicUnlockPopup(nextTopic);
        
        // Special handling for validation module's review topic
        if (currentModule.id === 'validation' && nextTopic.isReviewTopic) {
            showUniversalReviewTopicPopup(nextTopic);
        }
    } else {
        // All topics completed, show next module button
        showNextModuleButton();
    }
    
    // Update module progress
    updateModuleProgress();
    
    // Re-render topics if function exists
    if (typeof renderTopics === 'function') {
        renderTopics(currentModule.topics);
    }
    
    // Save progress
    saveProgress();
    
    // Check if all topics are completed for module-specific actions
    const allTopicsCompleted = currentModule.topics.every(topic => topic.status === 'completed');
    if (allTopicsCompleted) {
        if (currentModule.id === 'validation') {
            showValidationButtons();
        } else {
            showModuleCompletionMessage(currentModule);
        }
    }
}

// Show validation buttons when all topics are completed
function showValidationButtons() {
    addMessage(`🎯 **Validation module completed!**

✅ All validation module topics successfully studied!

Now you can:
1. **Validate your idea** - get professional expert assessment
2. **Move to next module** - continue learning

Choose action:`, 'assistant');
    
    // Enable validation button
    enableCurrentModuleButton();
    
    // Show next module button
    const nextModuleBtn = document.getElementById('nextModuleBtn');
    if (nextModuleBtn) {
        nextModuleBtn.classList.remove('hidden');
        const nextModule = appState.modules[appState.currentModule + 1];
        if (nextModule) {
            nextModuleBtn.textContent = `Go to module: ${nextModule.title}`;
        }
    }
}

// Show next module button
function showNextModuleButton() {
    const currentModuleIndex = appState.currentModule;
    const nextModuleIndex = currentModuleIndex + 1;
    
    if (nextModuleIndex < appState.modules.length) {
        const nextModule = appState.modules[nextModuleIndex];
        
        // Show next module button
        const nextModuleBtn = document.getElementById('nextModuleBtn');
        if (nextModuleBtn) {
            nextModuleBtn.classList.remove('hidden');
            nextModuleBtn.textContent = `Go to module: ${nextModule.title}`;
        }
        
        addMessage(`🎉 **Module "${appState.modules[currentModuleIndex].title}" completed!**

✅ All module topics successfully studied!

🚀 **Next module:** ${nextModule.title}
📝 **Description:** ${nextModule.description}

Нажмите кнопку "Go to module: ${nextModule.title}" to continue learning.`, 'assistant');
    } else {
        // All modules completed
        addMessage(`🎉 **Congratulations! All modules completed!**

🏆 Вы успешно прошли весь курс по развитию бизнес-идеи!

📊 **Итоговая статистика:**
• Модулей завершено: ${appState.modules.length}
• Общий прогресс: 100%

Теперь у вас есть полное понимание процесса валидации и развития бизнес-идеи.`, 'assistant');
    }
}

// Validate idea using Gemini with internet search
async function validateIdea() {
    // Show chat popup
    showChatPopup();
    
    const loadingMessage = addMessage('⏳ Conducting professional validation of your idea...\n\n🔍 Анализирую рынок, конкурентов и потенциал проекта...', 'assistant');
    
    try {
        // Prepare validation data
        const userIdea = appState.projectData?.idea || 'Not specified';
        const userRegion = appState.projectPassport?.basicInfo?.location || 'не указан';
        const userExperience = 'начинающий предприниматель'; // Можно добавить поле в проект
        
        // Collect learning data
        const learningData = collectLearningData();
        
        const validationPrompt = `Вы - ведущий эксперт по валидации стартапов с 15-летним опытом работы в топовых инкубаторах (Y Combinator, Techstars, 500 Startups). Ваша задача - провести профессиональную валидацию бизнес-идеи по всем стандартам стартап-индустрии.

КОНТЕКСТ ПРОЕКТА:
Идея: ${userIdea}
Регион: ${userRegion}
Опыт основателя: ${userExperience}

ДАННЫЕ ОБ ОБУЧЕНИИ:
${learningData}

ТРЕБОВАНИЯ К АНАЛИЗУ:
1. Проведите комплексную валидацию по методологии HADI (Hypothesis-Action-Data-Insight)
2. Используйте framework Problem-Solution-Market Fit
3. Применяйте критерии оценки ведущих инкубаторов
4. Yesйте конкретные, actionable рекомендации
5. Укажите красные флаги и риски
6. Предложите следующие шаги для валидации

СТРУКТУРА ОТВЕТА:
Подготовьте детальный отчет в корпоративном стиле (до 10000 символов) по следующей структуре:

## 📋 EXECUTIVE SUMMARY
- Краткая оценка потенциала идеи (Высокий/Средний/Низкий)
- Ключевые выводы (3-4 пункта)
- Рекомендация: Развивать/Пивотить/Остановить

## 🎯 АНАЛИЗ ПРОБЛЕМЫ (Problem Validation)
### Критичность проблемы:
- Насколько острая боль у пользователей (1-10)?
- Частота возникновения проблемы
- Текущие способы решения и их недостатки
- Размер аудитории, испытывающей проблему

### Готовность платить:
- Платят ли сейhr за альтернативные решения?
- Размер бюджета на решение этой проблемы
- Priority в списке проблем пользователя

## 💡 АНАЛИЗ РЕШЕНИЯ (Solution Validation)
### Уникальность и дифференциация:
- В чем инновация относительно существующих решений?
- Барьеры для копирования конкурентами
- Технологическая сложность реализации

### Product-Market Fit потенциал:
- Соответствие решения уровню проблемы
- Простота понимания ценности пользователем
- Вирусный потенциал и word-of-mouth эффект

## 🏪 АНАЛИЗ РЫНКА (Market Validation)
### Размер и потенциал:
- TAM/SAM/SOM оценка для данной идеи
- Темпы роста рынка
- Сезонность и циклы

### Конкурентная среда:
- Прямые и косвенные конкуренты
- Барьеры входа на рынок
- Positioning relative to competitors

## 💰 БИЗНЕС-МОДЕЛЬ И МОНЕТИЗАЦИЯ
### Модель доходов:
- Оптимальная модель монетизации для данной идеи
- Unit economics прогноз
- Масштабируемость бизнес-модели

### Ресурсы и инвестиции:
- Минимальные ресурсы для запуска
- Потребность в финансировании
- Timeline до break-even

## ⚠️ РИСКИ И ОГРАНИЧЕНИЯ
### Высокие риски:
- Ключевые угрозы для проекта
- Регуляторные ограничения
- Технологические риски

### Зависимости:
- Критические предположения (assumptions)
- Внешние факторы успеха
- Team-fit для данной идеи

## 🎯 ПЛАН ВАЛИДАЦИИ (Next Steps)
### Первоочередные шаги (1-2 недели):
1. [Конкретное действие с timeline]
2. [Конкретное действие с timeline]
3. [Конкретное действие с timeline]

### Ключевые гипотезы для тестирования:
- Hypothesis #1: [with verification method]
- Hypothesis #2: [with verification method]
- Hypothesis #3: [with verification method]

### Критерии успеха валидации:
- Метрика 1: [конкретная цифра]
- Метрика 2: [конкретная цифра]
- Метрика 3: [конкретная цифра]

## 📊 ИТОГОВАЯ ОЦЕНКА
### Scoring по критериям (1-10):
- Problem-Market Fit: X/10
- Solution Quality: X/10
- Market Size: X/10
- Competition Level: X/10
- Execution Feasibility: X/10
- **ОБЩАЯ SCORE: XX/50**

### Рекомендация:
[Четкая рекомендация с обоснованием]

ВАЖНО: 
- Будьте конструктивно критичны - большинство идей требуют пивота
- Yesвайте конкретные, actionable советы, а не общие фразы
- Используйте данные и примеры из индустрии где возможно
- Укажите на blind spots, которые основатель мог не учесть
- Пишите в профессиональном, но понятном стиле
- Длина ответа: 8000-10000 символов`;

        // Call Gemini with internet search
        const response = await callGeminiWithSearch(validationPrompt);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        addMessage(`🎯 **ПРОФЕССИОНАЛЬНАЯ ВАЛИДАЦИЯ ИДЕИ**

${response}`, 'assistant');
        
        // Disable validation button after use
        disableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error validating idea:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        let errorMessage = '❌ Error при валидации идеи.\n\n';
        
        if (error.message.includes('Gemini API ключ не настроен')) {
            errorMessage += `**Для валидации идеи нужен Gemini API ключ:**\n\n`;
            errorMessage += `1. **Получите API ключ** на https://aistudio.google.com/app/apikey\n`;
            errorMessage += `2. **В боковой панели** убедитесь, что выбран "Google Gemini"\n`;
            errorMessage += `3. **Вставьте ключ** в поле "Google AI API ключ"\n`;
            errorMessage += `4. **Нажмите "Save"** и "Тест"\n`;
            errorMessage += `5. **Попробуйте валидацию снова**\n\n`;
            errorMessage += `💡 **Примечание:** Валидация использует Gemini по умолчанию`;
        } else if (error.message.includes('Gemini API error')) {
            errorMessage += `**Проблема с Gemini API:**\n\n`;
            errorMessage += `• Проверьте правильность API ключа\n`;
            errorMessage += `• Убедитесь, что у вас есть доступ к Gemini\n`;
            errorMessage += `• Попробуйте позже`;
        } else {
            errorMessage += `**Техническая ошибка:** ${error.message}\n\n`;
            errorMessage += `Попробуйте еще раз или обратитесь к адminистратору.`;
        }
        
        addMessage(errorMessage, 'assistant');
    }
}

// Collect learning data for validation
function collectLearningData() {
    const currentModule = appState.modules[appState.currentModule];
    let learningData = `Модуль: ${currentModule.title}\n`;
    
    // Collect topic completion data
    currentModule.topics.forEach(topic => {
        if (topic.status === 'completed') {
            learningData += `✅ ${topic.title}: Завершен\n`;
        }
    });
    
    // Collect project passport data if available
    if (appState.projectPassport) {
        learningData += `\nYesнные паспорта проекта:\n`;
        learningData += `- Отрасль: ${appState.projectPassport.basicInfo?.industry || 'Not specified'}\n`;
        learningData += `- Этап: ${appState.projectPassport.basicInfo?.stage || 'Не указан'}\n`;
        learningData += `- Команда: ${appState.projectPassport.basicInfo?.teamSize || 'Not specified'}\n`;
    }
    
    return learningData;
}

// Call Gemini with internet search capability
async function callGeminiWithSearch(prompt) {
    // Get Gemini API key from settings (regardless of current provider)
    const apiKey = localStorage.getItem('geminiApiKey') || appState.geminiApiKey;
    if (!apiKey) {
        throw new Error('Gemini API ключ не настроен. Для валидации идеи нужен Gemini API ключ в настройках.');
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    const requestData = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000
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
            window.apiLogger.logResponse(requestId, null, false, `Gemini API error: ${response.status}`);
        }
        throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log successful response
    if (window.apiLogger && requestId) {
        window.apiLogger.logResponse(requestId, data, true);
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
    } else {
        // Log parsing error
        if (window.apiLogger && requestId) {
            window.apiLogger.logResponse(requestId, data, false, 'Неожиданный формат ответа от Gemini API');
        }
        throw new Error('Неожиданный формат ответа от Gemini API');
    }
}

// Update module progress
function updateModuleProgress() {
    const currentModule = appState.modules[appState.currentModule];
    
    // Calculate progress based on completed topics
    if (currentModule.topics && currentModule.topics.length > 0) {
        const completedTopics = currentModule.topics.filter(topic => topic.status === 'completed').length;
        const totalTopics = currentModule.topics.length;
        currentModule.progress = Math.round((completedTopics / totalTopics) * 100);
    } else {
        // Fallback: increment by 10 if no topics structure
        currentModule.progress += 10;
    }
    
    if (currentModule.progress >= 50) {
        showTestSection();
    }
    
    updateOverallProgress();
}

// Show test section
function showTestSection() {
    const testSection = document.getElementById('testSection');
    if (testSection) {
        testSection.classList.remove('hidden');
        generateTest();
    }
}

// Generate test questions
function generateTest() {
    const testQuestions = [
        {
            question: "Какой основной принцип валидации бизнес-идеи?",
            options: [
                "Сразу начать разработку продукта",
                "Проверить гипотезы с minимальными затратами",
                "Провести масштабное маркетинговое исследование",
                "Найти инвесторов"
            ],
            correct: 1
        },
        {
            question: "Что такое MVP?",
            options: [
                "Most Valuable Player",
                "Minimum Viable Product",
                "Maximum Value Proposition",
                "Marketing Validation Process"
            ],
            correct: 1
        }
    ];
    
    appState.testQuestions = testQuestions;
    appState.currentQuestion = 0;
    renderQuestion();
}

// Render current question
function renderQuestion() {
    const currentQ = appState.testQuestions[appState.currentQuestion];
    const questionContainer = document.getElementById('currentQuestion');
    
    if (!questionContainer) return;
    
    questionContainer.innerHTML = `
        <div class="question">
            <div class="question-text">Вопрос ${appState.currentQuestion + 1}: ${currentQ.question}</div>
            <div class="options">
                ${currentQ.options.map((option, index) => `
                    <div class="option" onclick="selectOption(${index})" data-index="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Select test option
function selectOption(optionIndex) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    if (options[optionIndex]) {
        options[optionIndex].classList.add('selected');
    }
    
    appState.selectedOption = optionIndex;
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    if (nextQuestionBtn) {
        nextQuestionBtn.classList.remove('hidden');
    }
}

// Next question
function nextQuestion() {
    if (appState.selectedOption !== undefined) {
        appState.testAnswers.push(appState.selectedOption);
    }
    
    appState.currentQuestion++;
    
    if (appState.currentQuestion < appState.testQuestions.length) {
        renderQuestion();
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        if (nextQuestionBtn) {
            nextQuestionBtn.classList.add('hidden');
        }
        appState.selectedOption = undefined;
    } else {
        completeTest();
    }
}

// Complete test
function completeTest() {
    const score = calculateScore();
    const testSection = document.getElementById('testSection');
    if (testSection) {
        testSection.innerHTML = `
            <h3>Тест завершен!</h3>
            <p>Ваш результат: ${score}/${appState.testQuestions.length}</p>
            <p>Поздравляем! Вы успешно завершили этот модуль.</p>
        `;
    }
    
    completeModule();
}

// Calculate test score
function calculateScore() {
    let score = 0;
    appState.testAnswers.forEach((answer, index) => {
        if (answer === appState.testQuestions[index].correct) {
            score++;
        }
    });
    return score;
}

// Complete current module
function completeModule() {
    const currentModule = appState.modules[appState.currentModule];
    currentModule.status = 'completed';
    currentModule.progress = 100;
    
    if (appState.currentModule < appState.modules.length - 1) {
        appState.modules[appState.currentModule + 1].status = 'pending';
        const nextModuleBtn = document.getElementById('nextModuleBtn');
        if (nextModuleBtn) {
            nextModuleBtn.classList.remove('hidden');
        }
    } else {
        showCompletionScreen();
    }
    
    updateOverallProgress();
    renderModuleList();
    saveProgress();
}

// Next module
function nextModule() {
    if (appState.currentModule < appState.modules.length - 1) {
        appState.currentModule++;
        appState.modules[appState.currentModule].status = 'active';
        renderModuleList();
        renderModuleContent();
        setTimeout(() => {
            updateModuleActionButton();
        }, 150);
    }
}

// Show completion screen
function showCompletionScreen() {
    const moduleContent = document.getElementById('moduleContent');
    if (moduleContent) {
        moduleContent.innerHTML = `
            <div class="welcome-screen">
                <h1 class="welcome-title">Поздравляем!</h1>
                <p class="welcome-description">
                    Вы успешно завершили все модули AI Инкубатора. 
                    Ваш проект готов к следующему этапу развития!
                </p>
                <button class="btn primary" onclick="generatePitchDeck()">Create Pitch Deck</button>
                <button class="btn" onclick="downloadResults()">Скачать результаты</button>
            </div>
        `;
    }
}

// Generate Pitch Deck
function generatePitchDeck() {
    alert('Генерация Pitch Deck будет добавлена в следующей версии!');
}

// Download results
function downloadResults() {
    const results = {
        projectData: appState.projectData,
        modules: appState.modules,
        completionDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incubator-results.json';
    a.click();
}

// Market Analysis function
async function conductMarketAnalysis() {
    const loadingMessage = addMessage('⏳ Conducting deep market analysis...\n\n📊 Анализирую размер рынка, конкурентов и возможности...', 'assistant');
    
    try {
        const userIdea = appState.projectData?.idea || 'Not specified';
        const userRegion = appState.projectPassport?.basicInfo?.location || 'не указан';
        const learningData = collectLearningData();
        
        const analysisPrompt = `Вы - ведущий маркетинг-аналитик с 20-летним опытом исследования рынков в различных индустриях. Проведите комплексный анализ рынка для стартапа.

КОНТЕКСТ ПРОЕКТА:
Идея: ${userIdea}
Регион: ${userRegion}

ДАННЫЕ ОБ ОБУЧЕНИИ:
${learningData}

СТРУКТУРА АНАЛИЗА:
Подготовьте детальный отчет (до 12000 символов):

## 📈 АНАЛИЗ РАЗМЕРА РЫНКА
### TAM (Total Available Market):
- Общий размер рынка в денежном выражении
- Количество потенциальных пользователей
- Темпы роста рынка

### SAM (Serviceable Available Market):
- Сегмент рынка, доступный для данного решения
- Географические и демографические ограничения

### SOM (Serviceable Obtainable Market):
- Реалистичная доля рынка в первые 3-5 лет
- Обоснование прогнозов

## 🎯 КОНКУРЕНТНЫЙ АНАЛИЗ
### Прямые конкуренты:
- Топ-5 конкурентов с описанием
- Их сильные и слабые стороны
- Модели монетизации и ценообразования

### Косвенные конкуренты:
- Альтернативные решения проблемы
- Заменители и субституты

### Конкурентные преимущества:
- Уникальные особенности решения
- Барьеры для входа конкурентов

## 📊 ТРЕНДЫ И ВОЗМОЖНОСТИ
### Ключевые тренды:
- Технологические тренды
- Поведенческие изменения пользователей
- Регуляторные изменения

### Возможности:
- Неохваченные сегменты
- Emerging потребности
- Технологические возможности

## ⚠️ РИСКИ И БАРЬЕРЫ
### Риски:
- Рыночные риски
- Технологические риски
- Конкурентные угрозы

### Барьеры входа:
- Финансовые барьеры
- Технологические барьеры
- Регуляторные барьеры

## 💡 РЕКОМЕНДАЦИИ
- Стратегия позиционирования
- Приоритетные сегменты для входа
- Timing выхода на рынок
- Ключевые метрики для отслеживания

Используйте актуальные данные и конкретные цифры где возможно.`;

        const response = await callGeminiAPI(analysisPrompt);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        addMessage(response, 'assistant');
        
        disableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error conducting market analysis:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addMessage('❌ Error при проведении анализа рынка. Попробуйте еще раз.', 'assistant');
    }
}

// Business Model function
async function createBusinessModel() {
    const loadingMessage = addMessage('⏳ Создаю бизнес-модель...\n\n🏗️ Разрабатываю Canvas модель и стратегию монетизации...', 'assistant');
    
    try {
        const userIdea = appState.projectData?.idea || 'Not specified';
        const learningData = collectLearningData();
        
        const modelPrompt = `Вы - опытный бизнес-консультант и автор бизнес-моделей для технологических стартапов с опытом работы в McKinsey & Company. Создайте детальную бизнес-модель.

КОНТЕКСТ ПРОЕКТА:
Идея: ${userIdea}

ДАННЫЕ ОБ ОБУЧЕНИИ:
${learningData}

СТРУКТУРА БИЗНЕС-МОДЕЛИ:
Подготовьте комплексный анализ (до 12000 символов):

## 🎨 BUSINESS MODEL CANVAS

### 1. Ключевые партнёры (Key Partners):
- Стратегические партнёры
- Поставщики ключевых ресурсов
- Мотивация партнёрства

### 2. Ключевые активности (Key Activities):
- Основные операционные процессы
- Критически важные действия
- Ресурсоёмкие активности

### 3. Ключевые ресурсы (Key Resources):
- Физические ресурсы
- Интеллектуальные ресурсы  
- Человеческие ресурсы
- Финансовые ресурсы

### 4. Ценностные предложения (Value Propositions):
- Уникальные преимущества
- Решаемые проблемы
- Удовлетворяемые потребности
- Пакеты продуктов/услуг

### 5. Взаимоотношения с клиентами (Customer Relationships):
- Типы отношений с каждым сегментом
- Стратегия удержания клиентов
- Сообщества и поддержка

### 6. Каналы сбыта (Channels):
- Каналы коммуникации
- Каналы дистрибуции
- Каналы продаж
- Послепродажная поддержка

### 7. Сегменты клиентов (Customer Segments):
- Основные группы клиентов
- Характеристики каждого сегмента
- Потребности сегментов

### 8. Структура затрат (Cost Structure):
- Основные статьи расходов
- Переменные и постоянные затраты
- Экономия от масштаба

### 9. Потоки доходов (Revenue Streams):
- Источники доходов
- Модели ценообразования
- Способы получения платежей

## 💰 МОДЕЛИ МОНЕТИЗАЦИИ

### Рекомендуемая модель:
- Обоснование выбора
- Механизм работы
- Преимущества и риски

### Альтернативные модели:
- Дополнительные источники дохода
- Возможности масштабирования

## 📊 ФИНАНСОВЫЕ ПРОГНОЗЫ
- Прогноз доходов на 3 yearа
- Основные финансовые показатели
- Unit economics
- Точка безубыточности

## 🚀 ПЛАН РЕАЛИЗАЦИИ
- Этапы развития бизнес-модели
- Ключевые метрики
- Пилотные проекты

Сосредоточьтесь на практичности и реализуемости модели.`;

        const response = await callGeminiAPI(modelPrompt);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        addMessage(response, 'assistant');
        
        disableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error creating business model:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addMessage('❌ Error при создании бизнес-модели. Попробуйте еще раз.', 'assistant');
    }
}

// MVP Development function
async function developMVP() {
    const loadingMessage = addMessage('⏳ Планирую разработку MVP...\n\n⚡ Определяю ключевые функции и техническую архитектуру...', 'assistant');
    
    try {
        const userIdea = appState.projectData?.idea || 'Not specified';
        const learningData = collectLearningData();
        
        const mvpPrompt = `Вы - опытный Product Manager и технический архитектор с опытом запуска 50+ успешных MVP. Создайте детальный план разработки minимально жизнеспособного продукта.

КОНТЕКСТ ПРОЕКТА:
Идея: ${userIdea}

ДАННЫЕ ОБ ОБУЧЕНИИ:
${learningData}

СТРУКТУРА MVP ПЛАНА:
Подготовьте комплексный план (до 12000 символов):

## 🎯 ОПРЕДЕЛЕНИЕ MVP

### Core Features (Must-have):
- Критически важные функции для решения основной проблемы
- Минимальный набор для тестирования основных гипотез
- Обоснование выбора каждой функции

### Nice-to-have Features:
- Функции для следующих версий
- Причины исключения из MVP

### Success Metrics:
- KPI для измерения успеха MVP
- Целевые значения метрик
- Методы измерения

## 🏗️ ТЕХНИЧЕСКАЯ АРХИТЕКТУРА

### Technology Stack:
- Frontend: Рекомендуемые технологии и обоснование
- Backend: Архитектура и технологии
- База данных: Выбор и структура
- Инфраструктура: Hosting и deployment

### Архитектурные решения:
- Выбор архитектурного паттерна
- Масштабируемость и производительность
- Безопасность и надёжность

### Third-party интеграции:
- Необходимые API и сервисы
- Payment processing
- Analytics и мониторинг

## 💡 UX/UI ДИЗАЙН

### User Journey:
- Пользовательские сценарии
- Ключевые экраны и переходы
- Wireframes основных страниц

### Design System:
- Стиль и брендинг
- Компоненты интерфейса
- Responsive design

## 📋 ПЛАН РАЗРАБОТКИ

### Phase 1 (Weeks 1-2): Foundation
- Настройка инфраструктуры
- Базовая архитектура
- Основные модели данных

### Phase 2 (Weeks 3-4): Core Features
- Реализация ключевого функционала
- Основные пользовательские флоу
- Базовый UI

### Phase 3 (Weeks 5-6): Integration & Testing
- Интеграция компонентов
- Тестирование и отладка
- Подготовка к запуску

### Timeline и Milestones:
- Детальный календарный план
- Контрольные точки
- Критический путь

## 🧪 ТЕСТИРОВАНИЕ И ВАЛИДАЦИЯ

### Testing Strategy:
- Виды тестирования
- Критерии готовности
- User acceptance testing

### Launch Strategy:
- Soft launch план
- Beta testing с пользователями
- Feedback collection

### Metrics и Analytics:
- Инструменты для отслеживания
- События для трекинга
- A/B testing возможности

## 💰 БЮДЖЕТ И РЕСУРСЫ

### Team Requirements:
- Необходимые роли и компетенции
- Временные затраты по ролям
- Аутсорс vs внутренняя команда

### Estimated Costs:
- Разработка
- Инфраструктура
- Third-party сервисы
- Маркетинг и запуск

## 🚀 GO-TO-MARKET STRATEGY

### Launch Plan:
- Pre-launch активности
- Launch campaign
- Post-launch support

### Early Adopters:
- Стратегия привлечения первых пользователей
- Feedback loops
- Iteration планы

Сфокусируйтесь на практической реализуемости и быстром time-to-market.`;

        const response = await callGeminiAPI(mvpPrompt);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        addMessage(response, 'assistant');
        
        disableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error developing MVP:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addMessage('❌ Error при планировании разработки MVP. Попробуйте еще раз.', 'assistant');
    }
}

// Pitch Deck function
async function createPitchDeck() {
    const loadingMessage = addMessage('⏳ Создаю pitch deck...\n\n📊 Разрабатываю презентацию для инвесторов...', 'assistant');
    
    try {
        const userIdea = appState.projectData?.idea || 'Not specified';
        const learningData = collectLearningData();
        
        const pitchPrompt = `Вы - эксперт по подготовке презентаций для инвесторов с опытом работы в ведущих венчурных фондах (Sequoia Capital, Andreessen Horowitz). Создайте структуру и контент для pitch deck.

КОНТЕКСТ ПРОЕКТА:
Идея: ${userIdea}

ДАННЫЕ ОБ ОБУЧЕНИИ:
${learningData}

СТРУКТУРА PITCH DECK:
Подготовьте детальное содержание презентации (до 12000 символов):

## 📋 СЛАЙД 1: ЗАГОЛОВОК
- Название компании и слоган
- Контактная информация
- Логотип и визуальный стиль

## 🎯 СЛАЙД 2: ПРОБЛЕМА
- Четкое описание проблемы
- Размер аудитории с проблемой
- Текущие болевые точки
- Эмоциональная связь с проблемой

## 💡 СЛАЙД 3: РЕШЕНИЕ
- Ваш продукт/сервис
- Ключевые особенности
- Демо или скриншоты
- Уникальная ценность

## 📊 СЛАЙД 4: РАЗМЕР РЫНКА
- TAM, SAM, SOM с конкретными цифрами
- Темпы роста рынка
- Ключевые драйверы роста

## 🏆 СЛАЙД 5: ПРОДУКТ
- Детальное описание функций
- User experience
- Технологические преимущества
- Roadmap развития

## 📈 СЛАЙД 6: ТЯГОВАЯ СИЛА (TRACTION)
- Ключевые достижения
- Пользовательские метрики
- Финансовые показатели
- Partnerships и клиенты

## 💰 СЛАЙД 7: БИЗНЕС-МОДЕЛЬ
- Источники доходов
- Unit economics
- Модель ценообразования
- LTV/CAC соотношение

## 🎯 СЛАЙД 8: КОНКУРЕНЦИЯ
- Конкурентная карта
- Ваши преимущества
- Барьеры для входа
- Differentiation strategy

## 📊 СЛАЙД 9: ФИНАНСОВЫЕ ПРОГНОЗЫ
- Revenue projections на 3-5 лет
- Key financial metrics
- Path to profitability
- Assumptions и drivers

## 👥 СЛАЙД 10: КОМАНДА
- Основатели и ключевые сотрудники
- Релевантный опыт
- Advisory board
- Планы по найму

## 💵 СЛАЙД 11: ФИНАНСИРОВАНИЕ
- Сколько привлекаете
- Use of funds (детальное распределение)
- Milestones на привлекаемые средства
- Timeline использования

## 🚀 СЛАЙД 12: СЛЕДУЮЩИЕ ШАГИ
- Краткосрочные цели (6-12 monthев)
- Долгосрочная vision
- Call to action для инвесторов

## 📞 СЛАЙД 13: КОНТАКТЫ
- Способы связи
- Дополнительные материалы
- Блаyearарность

## 💡 ДОПОЛНИТЕЛЬНЫЕ РЕКОМЕНДАЦИИ

### Storytelling Tips:
- Нарратив презентации
- Эмоциональные моменты
- Логическая связность

### Visual Guidelines:
- Дизайн и брендинг
- Использование графиков
- Читаемость и clarity

### Presentation Tips:
- Timing по слайдам
- Ключевые messages
- Ответы на hrтые вопросы

### Due Diligence Materials:
- Дополнительные документы
- Financial model
- Technical documentation

Сфокусируйтесь на четкости, убедительности и инвестиционной привлекательности.`;

        const response = await callGeminiAPI(pitchPrompt);
        
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        addMessage(response, 'assistant');
        
        disableCurrentModuleButton();
        
    } catch (error) {
        console.error('Error creating pitch deck:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addMessage('❌ Error при создании pitch deck. Попробуйте еще раз.', 'assistant');
    }
}

// Universal module action function
async function executeModuleAction() {
    const currentModule = appState.modules[appState.currentModule];
    
    switch (currentModule.id) {
        case 'validation':
            await validateIdea();
            break;
        case 'market_analysis':
            await conductMarketAnalysis();
            break;
        case 'business_model':
            await createBusinessModel();
            break;
        case 'mvp_development':
            await developMVP();
            break;
        case 'pitch_deck':
            await createPitchDeck();
            break;
        default:
            console.error('Unknown module:', currentModule.id);
            addMessage('❌ Неизвестный модуль. Обратитесь к адminистратору.', 'assistant');
    }
}

// Show chat popup
function showChatPopup() {
    const chatPopupOverlay = document.getElementById('chatPopupOverlay');
    if (chatPopupOverlay) {
        chatPopupOverlay.classList.add('show');
        
        // Clear previous messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Clean up any existing event listeners on plan buttons
        cleanupPlanButtonListeners();
        
        // Reset to default state: hide plan buttons, show input
        const planButtons = document.getElementById('chatPlanButtons');
        const inputContainer = document.getElementById('chatInputContainer');
        
        if (planButtons) {
            planButtons.classList.add('hidden');
        }
        
        if (inputContainer) {
            inputContainer.classList.remove('hidden');
        }
    }
}

// Close chat popup
function closeChatPopup() {
    const chatPopupOverlay = document.getElementById('chatPopupOverlay');
    if (chatPopupOverlay) {
        chatPopupOverlay.classList.remove('show');
        
        // Clean up event listeners
        cleanupPlanButtonListeners();
        
        // Reset dynamic learning state when closing
        if (dynamicLearningState.isActive) {
            dynamicLearningState.isActive = false;
            dynamicLearningState.currentTopic = null;
        }
    }
}

// Close popup when clicking on overlay
document.addEventListener('DOMContentLoaded', function() {
    const chatPopupOverlay = document.getElementById('chatPopupOverlay');
    if (chatPopupOverlay) {
        chatPopupOverlay.addEventListener('click', function(e) {
            if (e.target === chatPopupOverlay) {
                closeChatPopup();
            }
        });
    }
    
    // Close popup on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeChatPopup();
        }
    });
});

// Show plan confirmation buttons
function showPlanButtons() {
    const planButtons = document.getElementById('chatPlanButtons');
    const inputContainer = document.getElementById('chatInputContainer');
    
    console.log('showPlanButtons called');
    console.log('planButtons:', planButtons);
    console.log('inputContainer:', inputContainer);
    
    if (planButtons) {
        planButtons.classList.remove('hidden');
        console.log('Showed plan buttons');
        console.log('Plan buttons HTML:', planButtons.innerHTML);
        console.log('Plan buttons classes:', planButtons.className);
        
        // Add event listeners to buttons by ID
        const yesBtn = document.getElementById('planYesBtn');
        const noBtn = document.getElementById('planNoBtn');
        
        console.log('Yes button found:', !!yesBtn);
        console.log('No button found:', !!noBtn);
        
        if (yesBtn && !yesBtn.hasAttribute('data-listener-added')) {
            yesBtn.setAttribute('data-listener-added', 'true');
            yesBtn.addEventListener('click', function(e) {
                console.log('YES button clicked!');
                e.preventDefault();
                e.stopPropagation();
                confirmLearningPlan(true);
            });
        }
        
        if (noBtn && !noBtn.hasAttribute('data-listener-added')) {
            noBtn.setAttribute('data-listener-added', 'true');
            noBtn.addEventListener('click', function(e) {
                console.log('NO button clicked!');
                e.preventDefault();
                e.stopPropagation();
                confirmLearningPlan(false);
            });
        }
    }
    
    if (inputContainer) {
        inputContainer.classList.add('hidden');
        console.log('Hidden input container');
        console.log('Input container classes:', inputContainer.className);
    }
}

// Hide plan confirmation buttons and show input
function hidePlanButtons() {
    const planButtons = document.getElementById('chatPlanButtons');
    const inputContainer = document.getElementById('chatInputContainer');
    
    console.log('hidePlanButtons called');
    console.log('planButtons:', planButtons);
    console.log('inputContainer:', inputContainer);
    
    if (planButtons) {
        planButtons.classList.add('hidden');
        console.log('Hidden plan buttons');
        
        // Clear listener flags when hiding buttons
        const yesBtn = document.getElementById('planYesBtn');
        const noBtn = document.getElementById('planNoBtn');
        
        if (yesBtn) {
            yesBtn.removeAttribute('data-listener-added');
        }
        if (noBtn) {
            noBtn.removeAttribute('data-listener-added');
        }
    }
    
    if (inputContainer) {
        inputContainer.classList.remove('hidden');
        console.log('Showed input container');
        
        // Focus on input
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
                console.log('Focused on input');
            }
        }, 100);
    }
}

// Confirm learning plan (called by buttons)
function confirmLearningPlan(confirmed) {
    console.log('confirmLearningPlan called with:', confirmed);
    
    // Add the user's response message
    if (confirmed) {
        addMessage('Yes', 'user');
    } else {
        addMessage('No', 'user');
    }
    
    // Hide plan buttons and show input with delay to ensure DOM updates
    setTimeout(() => {
        hidePlanButtons();
        
        if (confirmed) {
            startFirstAspect();
        } else {
            addMessage('❌ Обучение отменено. Выберите другой топик или попробуйте еще раз.', 'assistant');
            dynamicLearningState.isActive = false;
            dynamicLearningState.currentTopic = null;
        }
    }, 100);
}

// Function is now called directly via event listeners

// Universal popup for topic unlock (works for all modules)
function showUniversalTopicUnlockPopup(topic) {
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
                <button class="btn primary" onclick="selectTopicAndCloseUniversalPopup('${topic.id}', this)">Перейти к следующему топику</button>
                <button class="btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Позже</button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(popup);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 10000);
}

// Universal popup for review topic unlock 
function showUniversalReviewTopicPopup(topic) {
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
                <button class="btn primary" onclick="selectTopicAndCloseUniversalPopup('${topic.id}', this)">Start проверку</button>
                <button class="btn secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Позже</button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(popup);
    
    // Auto-remove after 12 seconds (longer for review topic)
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 12000);
}

// Universal function to select topic and close popup
function selectTopicAndCloseUniversalPopup(topicId, buttonElement) {
    console.log('selectTopicAndCloseUniversalPopup called with topicId:', topicId);
    
    // Close the popup
    const popup = buttonElement.closest('.topic-unlock-popup');
    if (popup) {
        popup.remove();
        console.log('Universal popup closed');
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

// Show module completion message for non-validation modules
function showModuleCompletionMessage(module) {
    addMessage(`🎉 **Module "${module.title}" completed!**

✅ All module topics successfully studied!

🚀 Now you can:
1. **Использовать специальную функцию модуля** - получить экспертный анализ
2. **Move to next module** - continue learning

Choose action:`, 'assistant');
    
    // Enable module action button
    enableCurrentModuleButton();
    
    // Show next module button if there are more modules
    const currentModuleIndex = appState.currentModule;
    if (currentModuleIndex < appState.modules.length - 1) {
        const nextModuleBtn = document.getElementById('nextModuleBtn');
        if (nextModuleBtn) {
            nextModuleBtn.classList.remove('hidden');
            const nextModule = appState.modules[currentModuleIndex + 1];
            if (nextModule) {
                nextModuleBtn.textContent = `Go to module: ${nextModule.title}`;
            }
        }
    }
}

// Clean up plan button event listeners
function cleanupPlanButtonListeners() {
    const yesBtn = document.getElementById('planYesBtn');
    const noBtn = document.getElementById('planNoBtn');
    
    console.log('Cleaning up plan button listeners');
    
    if (yesBtn) {
        // Remove data attribute to allow re-adding listeners
        yesBtn.removeAttribute('data-listener-added');
        // Clone and replace to remove all event listeners
        const newYesBtn = yesBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
        console.log('Cleaned yes button listeners');
    }
    
    if (noBtn) {
        // Remove data attribute to allow re-adding listeners
        noBtn.removeAttribute('data-listener-added');
        // Clone and replace to remove all event listeners
        const newNoBtn = noBtn.cloneNode(true);
        noBtn.parentNode.replaceChild(newNoBtn, noBtn);
        console.log('Cleaned no button listeners');
    }
}

// Make functions globally available
window.selectTopicAndCloseUniversalPopup = selectTopicAndCloseUniversalPopup;
window.showUniversalTopicUnlockPopup = showUniversalTopicUnlockPopup;
window.showUniversalReviewTopicPopup = showUniversalReviewTopicPopup;
window.cleanupPlanButtonListeners = cleanupPlanButtonListeners;
