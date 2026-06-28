# AI Investment Research Agent

This is a full-stack web application that uses an AI agent to perform investment research on a given company. It uses LangGraph to orchestrate a workflow where the agent searches the web, analyzes the data, and makes a final "Invest" or "Pass" decision with reasoning.

## Overview

The project consists of:
- **Frontend:** A React application built with Vite and designed with premium Vanilla CSS (dark mode, glassmorphism).
- **Backend:** A Node.js + Express server handling authentication (JWT) and the AI agent logic.
- **Database:** MySQL database managed by Prisma ORM for user accounts.
- **AI Agent:** Built with LangChain and LangGraph, utilizing Google Gemini (`gemini-1.5-pro`) and web search tools (DuckDuckGo scraper + Wikipedia fallback).

## How to run it

### Prerequisites
- Node.js (v18+)
- MySQL server running locally (or remote)
- A Google Gemini API Key

### Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file in the `backend` directory with your database credentials and API key:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/investment_agent"
   JWT_SECRET="your-secret-key"
   PORT=3001
   GOOGLE_API_KEY="your-gemini-api-key"
   ```
4. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).

## How it works

1. **Authentication:** Users must sign up and log in to use the agent. The backend issues a JWT token stored in `localStorage`.
2. **LangGraph Agent Workflow:**
   - **Research Node:** Takes the company name and uses a custom DuckDuckGo search tool to find recent information. If that fails, it falls back to a Wikipedia tool.
   - **Analysis Node:** A Gemini LLM analyzes the raw search data to extract strengths, weaknesses, and market position.
   - **Decision Node:** Another Gemini LLM call reviews the analysis and formats the output into a definitive "Invest" or "Pass" decision, appending its reasoning.

## Key decisions & trade-offs

- **Architecture:** Chose a decoupled React + Express architecture over Next.js to cleanly separate the AI/backend logic from the UI.
- **AI Framework:** Selected **LangGraph** because investment research is fundamentally a multi-step, stateful process (search -> analyze -> decide). While a simple LangChain pipeline could work, LangGraph allows for future improvements like cyclical search loops (e.g., if the first search doesn't yield enough financials, search again).
- **Search Tools:** Instead of relying on paid APIs like Tavily or Serper, a fallback mechanism was implemented using a DuckDuckGo HTML scraper and Wikipedia to ensure the project runs freely for reviewers without requiring additional API keys beyond Gemini.
- **Database:** Used MySQL with Prisma to provide a robust, structured authentication system, moving past simple local storage mocks to demonstrate full-stack competency.

## Example runs

- **Input:** `NVIDIA`
  - **Decision:** INVEST
  - **Reasoning:** NVIDIA holds a massive monopoly on AI hardware and data center GPUs. Despite a high valuation, their continuous innovation (Blackwell architecture) and soaring revenues present a strong buy signal for long-term growth.

- **Input:** `Peloton`
  - **Decision:** PASS
  - **Reasoning:** The company has struggled with declining demand post-pandemic, massive cash burn, and frequent executive turnover. The turnaround plan is unproven, making it too risky for investment at this time.

## What you would improve with more time

- **Advanced Search Loop:** Allow the agent to iteratively search for specific financial metrics (P/E ratio, revenue growth) if the initial search is too broad.
- **Data Visualization:** Display stock charts or financial metric tables on the frontend using libraries like Recharts.
- **Deployment:** Containerize the application with Docker and deploy the backend to Render/Railway and the frontend to Vercel.
- **Streaming UI:** Stream the LLM tokens directly to the frontend so the user can watch the agent "type" its analysis in real-time, improving the UX significantly.
