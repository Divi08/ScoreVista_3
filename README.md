# ScoreVista - Advanced IELTS Preparation Platform

<div align="center">
  <img src="public/logo.png" alt="ScoreVista Logo" width="200"/>
  <p><strong>AI-Powered IELTS Preparation & Assessment Platform</strong></p>
  

  
  <br/>
  <a href="https://scorevista3.vercel.app/" target="_blank">
    <strong>🚀 Try ScoreVista Now »</strong>
  </a>
</div>

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

ScoreVista is a comprehensive IELTS preparation platform that leverages artificial intelligence to provide personalized feedback and assessment. The platform focuses on both IELTS Academic Writing and Reading modules, offering real-time analysis and structured practice sessions.

## ✨ Features

### Writing Module
- **AI Writing Analysis**
  - Real-time grammar and style checking
  - IELTS-specific scoring criteria
  - Detailed feedback on Task 1 and Task 2 responses
  - Vocabulary enhancement suggestions

### Reading Module
- **Dynamic Reading Practice**
  - AI-generated academic passages
  - Paragraph heading matching exercises
  - Difficulty levels (Beginner, Intermediate, Advanced)
  - Interactive assessment interface

### General Features
- **Progress Tracking**
  - Performance analytics dashboard
  - Score history and improvement tracking
  - Detailed error analysis
  - Practice session statistics

## 🛠 Technology Stack

- **Frontend Framework**
  - React 18.x
  - TypeScript 5.x
  - Vite (Build tool)

- **UI Components**
  - shadcn/ui
  - Tailwind CSS
  - Framer Motion (animations)

- **State Management**
  - React Context API
  - Custom hooks

- **API Integration**
  - Google Gemini API (AI analysis)
  - RESTful API patterns

- **Development Tools**
  - ESLint
  - Prettier
  - Husky (git hooks)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone git@github.com:YOUR_USERNAME/ScoreVista.git
cd ScoreVista
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

### Environment Setup

Required environment variables:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 📁 Project Structure

```
scorevista/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utility functions and API clients
│   ├── pages/         # Page components
│   ├── styles/        # Global styles and Tailwind config
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── tests/             # Test files
└── vite.config.ts     # Vite configuration
```

## 🔑 Key Components

### Writing Module Components
- `WritingExercise`: Main writing practice interface
- `TextAnalysis`: Real-time text analysis component
- `FeedbackDisplay`: Structured feedback presentation

### Reading Module Components
- `ReadingPractice`: Reading exercise interface
- `PassageGenerator`: AI-powered passage creation
- `HeadingMatcher`: Interactive heading matching component

## 🔌 API Integration

### Gemini API Integration
```typescript
// Example API call structure
const getGeminiFeedback = async (text: string): Promise<FeedbackResponse> => {
  // API implementation
};
```

## 💻 Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## 🚢 Deployment

1. Build the project:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```



## 📄 License

Private and Proprietary - All rights reserved

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Divi08">Divi08</a></p>
</div>
