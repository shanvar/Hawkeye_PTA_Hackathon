// Module Configuration
const moduleConfig = [
    {
        id: 'validation',
        title: 'Idea Validation',
        description: 'Validate your business idea viability and analyze market needs',
        topics: [
            {
                id: 'methodology',
                title: 'Validation Methodology',
                description: 'Learn key approaches to business idea validation',
                status: 'active',
                completedQuestions: 0
            },
            {
                id: 'problem-analysis',
                title: 'Problem Analysis',
                description: 'Define the real problem your product solves',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'target-audience',
                title: 'Target Audience',
                description: 'Identify and analyze your target audience',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'competitive-analysis',
                title: 'Competitive Analysis',
                description: 'Study competitors and find your advantage',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'knowledge-review',
                title: 'Knowledge Review',
                description: 'Test material comprehension with AI questions',
                status: 'locked',
                completedQuestions: 0,
                isReviewTopic: true
            }
        ],
        systemPrompt: 'You are an expert in business idea validation. Help the user analyze their idea, identify target audience and competitive advantages.',
        validationState: {
            currentTopicIndex: 0,
            totalScore: 100,
            guidingQuestionsUsed: 0,
            maxGuidingQuestions: 4,
            pointsPerGuidingQuestion: 7
        }
    },
    {
        id: 'market-analysis',
        title: 'Market Analysis',
        description: 'Deep market research, competitor analysis and opportunity identification',
        topics: [
            {
                id: 'market-size',
                title: 'Market Size (TAM/SAM/SOM)',
                description: 'Calculate your market potential',
                status: 'active',
                completedQuestions: 0
            },
            {
                id: 'competitor-analysis',
                title: 'Competitor Analysis',
                description: 'Detailed analysis of direct and indirect competitors',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'market-trends',
                title: 'Market Trends',
                description: 'Identify key trends and opportunities',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'entry-barriers',
                title: 'Entry Barriers',
                description: 'Identify obstacles and ways to overcome them',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'swot-analysis',
                title: 'SWOT Analysis',
                description: 'Conduct comprehensive SWOT analysis',
                status: 'locked',
                completedQuestions: 0
            }
        ],
        systemPrompt: 'You are a marketing analysis expert. Help conduct deep market analysis and develop marketing strategy.'
    },
    {
        id: 'business-model',
        title: 'Business Model',
        description: 'Create a sustainable business model and financial planning',
        topics: [
            {
                id: 'canvas-model',
                title: 'Canvas Model',
                description: 'Create a Business Model Canvas',
                status: 'active',
                completedQuestions: 0
            },
            {
                id: 'monetization-models',
                title: 'Monetization Models',
                description: 'Choose the optimal monetization model',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'pricing-strategy',
                title: 'Pricing Strategy',
                description: 'Define pricing strategy',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'financial-planning',
                title: 'Financial Planning',
                description: 'Create financial plan and projections',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'break-even-point',
                title: 'Break-even Point',
                description: 'Calculate break-even point',
                status: 'locked',
                completedQuestions: 0
            }
        ],
        systemPrompt: 'You are an expert in business modeling and financial planning. Help create a sustainable business model.'
    },
    {
        id: 'mvp-development',
        title: 'MVP Development',
        description: 'Create a minimum viable product',
        topics: [
            {
                id: 'mvp-definition',
                title: 'MVP Definition',
                description: 'Select key features for MVP',
                status: 'active',
                completedQuestions: 0
            },
            {
                id: 'technical-requirements',
                title: 'Technical Requirements',
                description: 'Define technical specifications',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'ui-ux-design',
                title: 'UI/UX Design',
                description: 'Create user interface',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'development',
                title: 'Development',
                description: 'Technical implementation of MVP',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'testing',
                title: 'Testing',
                description: 'Test MVP with users',
                status: 'locked',
                completedQuestions: 0
            }
        ],
        systemPrompt: 'You are an MVP development expert. Help define key features and create a development plan.'
    },
    {
        id: 'pitch-deck',
        title: 'Pitch Deck',
        description: 'Create investor presentation',
        topics: [
            {
                id: 'presentation-structure',
                title: 'Presentation Structure',
                description: 'Learn effective pitch deck structure',
                status: 'active',
                completedQuestions: 0
            },
            {
                id: 'problem-solution',
                title: 'Problem and Solution',
                description: 'Clearly articulate problem and your solution',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'market-competition',
                title: 'Market and Competition',
                description: 'Present market analysis',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'business-model-presentation',
                title: 'Business Model',
                description: 'Explain your business model',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'financial-forecasts',
                title: 'Financial Projections',
                description: 'Present financial metrics',
                status: 'locked',
                completedQuestions: 0
            },
            {
                id: 'team-request',
                title: 'Team and Request',
                description: 'Present team and investment request',
                status: 'locked',
                completedQuestions: 0
            }
        ],
        systemPrompt: 'You are an expert in creating investor presentations. Help create a compelling pitch deck.'
    }
];
