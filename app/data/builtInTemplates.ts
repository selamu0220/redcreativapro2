import { PromptTemplate } from './promptTemplates'

export const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code for best practices, bugs, and improvements',
    category: 'coding',
    icon: '🔍',
    content: `Please review the following code and provide feedback on:

1. **Code Quality & Best Practices**
   - Code structure and organization
   - Naming conventions
   - Code readability and maintainability

2. **Potential Issues**
   - Bugs or logical errors
   - Performance concerns
   - Security vulnerabilities

3. **Improvements**
   - Optimization opportunities
   - Better algorithms or approaches
   - Code simplification

**Code to review:**
\`\`\`{{language}}
{{code}}
\`\`\`

Please provide specific, actionable feedback with examples where possible.`,
    tags: ['code-review', 'development', 'quality-assurance'],
    variables: ['language', 'code'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bug-debugging',
    name: 'Bug Debugging',
    description: 'Systematic approach to debug and fix code issues',
    category: 'coding',
    icon: '🐛',
    content: `I'm experiencing a bug in my code. Please help me debug it systematically:

**Problem Description:**
{{problem_description}}

**Expected Behavior:**
{{expected_behavior}}

**Actual Behavior:**
{{actual_behavior}}

**Code:**
\`\`\`{{language}}
{{code}}
\`\`\`

**Error Messages (if any):**
\`\`\`
{{error_messages}}
\`\`\`

**Environment:**
- Language/Framework: {{environment}}
- Version: {{version}}

Please provide:
1. Potential root causes
2. Step-by-step debugging approach
3. Possible solutions
4. Prevention strategies for similar issues`,
    tags: ['debugging', 'troubleshooting', 'development'],
    variables: ['problem_description', 'expected_behavior', 'actual_behavior', 'language', 'code', 'error_messages', 'environment', 'version'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Generate comprehensive API documentation',
    category: 'coding',
    icon: '📚',
    content: `Please create comprehensive API documentation for the following endpoint:

**Endpoint:** {{method}} {{endpoint}}

**Code:**
\`\`\`{{language}}
{{code}}
\`\`\`

Please include:

1. **Overview**
   - Brief description of what this endpoint does
   - Use cases

2. **Request Details**
   - HTTP method and URL
   - Headers required
   - Request body schema (if applicable)
   - Query parameters

3. **Response Details**
   - Success response format
   - Error response formats
   - Status codes

4. **Examples**
   - Sample request
   - Sample response
   - Error examples

5. **Authentication**
   - Required permissions
   - Authentication method

Format the documentation in a clear, professional manner.`,
    tags: ['api', 'documentation', 'development'],
    variables: ['method', 'endpoint', 'language', 'code'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'blog-post-writer',
    name: 'Blog Post Writer',
    description: 'Create engaging blog posts on any topic',
    category: 'writing',
    icon: '✍️',
    content: `Write a comprehensive blog post about "{{topic}}" with the following specifications:

**Target Audience:** {{target_audience}}
**Tone:** {{tone}}
**Word Count:** {{word_count}} words
**SEO Keywords:** {{keywords}}

**Structure Requirements:**
1. **Compelling Headline** - Attention-grabbing and SEO-friendly
2. **Introduction** - Hook the reader and outline what they'll learn
3. **Main Content** - {{main_points}} main sections with:
   - Clear subheadings
   - Practical examples
   - Actionable insights
4. **Conclusion** - Summarize key points and include a call-to-action

**Additional Requirements:**
- Include relevant statistics or data points
- Add practical tips or actionable advice
- Use engaging storytelling where appropriate
- Optimize for readability with short paragraphs
- Include meta description (150-160 characters)

Please create an engaging, informative, and well-structured blog post.`,
    tags: ['blog', 'writing', 'content-creation'],
    variables: ['topic', 'target_audience', 'tone', 'word_count', 'keywords', 'main_points'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze data and provide insights',
    category: 'analysis',
    icon: '📊',
    content: `Please analyze the following data and provide comprehensive insights:

**Dataset Description:**
{{dataset_description}}

**Analysis Objectives:**
{{objectives}}

**Data:**
\`\`\`
{{data}}
\`\`\`

**Specific Questions to Address:**
{{questions}}

Please provide:

1. **Data Overview**
   - Summary statistics
   - Data quality assessment
   - Key observations

2. **Analysis Results**
   - Trends and patterns
   - Correlations
   - Anomalies or outliers

3. **Insights & Interpretations**
   - What the data tells us
   - Business implications
   - Actionable recommendations

4. **Visualizations**
   - Suggest appropriate charts/graphs
   - Key metrics to track

5. **Next Steps**
   - Further analysis recommendations
   - Data collection suggestions

Present findings in a clear, structured format with supporting evidence.`,
    tags: ['data-analysis', 'insights', 'statistics'],
    variables: ['dataset_description', 'objectives', 'data', 'questions'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'creative-brainstorm',
    name: 'Creative Brainstorming',
    description: 'Generate creative ideas and solutions',
    category: 'creative',
    icon: '💡',
    content: `Let's have a creative brainstorming session for: "{{challenge}}"

**Context:**
{{context}}

**Target Audience:**
{{target_audience}}

**Constraints:**
{{constraints}}

**Goals:**
{{goals}}

Please generate creative ideas using these approaches:

1. **Traditional Solutions** (3-5 ideas)
   - Proven approaches that work
   - Industry best practices

2. **Innovative Approaches** (3-5 ideas)
   - Fresh perspectives
   - Unconventional methods
   - Technology-enabled solutions

3. **Wild Ideas** (2-3 ideas)
   - Think outside the box
   - No constraints
   - Blue-sky thinking

**For each idea, provide:**
- Brief description
- Potential benefits
- Implementation difficulty (1-5 scale)
- Unique value proposition

**Follow-up Questions:**
- Which ideas could be combined?
- What would make these ideas even better?
- What are the potential risks or challenges?

Let's think creatively and explore all possibilities!`,
    tags: ['brainstorming', 'creativity', 'innovation'],
    variables: ['challenge', 'context', 'target_audience', 'constraints', 'goals'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'business-plan',
    name: 'Business Plan Section',
    description: 'Create sections for business plans',
    category: 'general',
    icon: '📈',
    content: `Create a comprehensive {{section}} section for a business plan:

**Business Overview:**
- Company Name: {{company_name}}
- Industry: {{industry}}
- Business Model: {{business_model}}
- Target Market: {{target_market}}

**Specific Focus for {{section}}:**
{{specific_requirements}}

**Key Information to Include:**
{{key_information}}

Please create a professional, detailed {{section}} section that includes:

1. **Clear Structure** - Well-organized with appropriate headings
2. **Comprehensive Content** - Cover all relevant aspects
3. **Data-Driven Insights** - Include relevant statistics and market data
4. **Professional Tone** - Suitable for investors and stakeholders
5. **Actionable Information** - Specific, measurable, and realistic

**Format Requirements:**
- Use bullet points for key information
- Include relevant metrics and KPIs
- Provide timeline where applicable
- Address potential risks and mitigation strategies

Make it compelling and investor-ready!`,
    tags: ['business-plan', 'strategy', 'entrepreneurship'],
    variables: ['section', 'company_name', 'industry', 'business_model', 'target_market', 'specific_requirements', 'key_information'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Plan Creator',
    description: 'Create structured lesson plans for education',
    category: 'general',
    icon: '🎓',
    content: `Create a comprehensive lesson plan for:

**Subject:** {{subject}}
**Topic:** {{topic}}
**Grade Level:** {{grade_level}}
**Duration:** {{duration}}
**Class Size:** {{class_size}}

**Learning Objectives:**
{{learning_objectives}}

**Prerequisites:**
{{prerequisites}}

Please create a detailed lesson plan with:

**1. Lesson Overview**
- Brief description
- Key concepts to be covered
- Connection to curriculum standards

**2. Materials Needed**
- Required resources
- Technology requirements
- Handouts or worksheets

**3. Lesson Structure**
- **Opening ({{opening_time}} minutes)**
  - Hook/attention grabber
  - Review of previous learning
  - Introduction of objectives

- **Main Activity ({{main_time}} minutes)**
  - Step-by-step instruction
  - Student activities
  - Guided practice

- **Closing ({{closing_time}} minutes)**
  - Summary of key points
  - Assessment of understanding
  - Preview of next lesson

**4. Assessment Methods**
- Formative assessment strategies
- Summative assessment options
- Success criteria

**5. Differentiation**
- Accommodations for different learning styles
- Extensions for advanced learners
- Support for struggling students

**6. Homework/Follow-up**
- Practice activities
- Preparation for next lesson

Make it engaging, age-appropriate, and educationally sound!`,
    tags: ['lesson-plan', 'education', 'teaching'],
    variables: ['subject', 'topic', 'grade_level', 'duration', 'class_size', 'learning_objectives', 'prerequisites', 'opening_time', 'main_time', 'closing_time'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  }
]
