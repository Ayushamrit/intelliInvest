import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { researchCompanyTool } from './tools';

// ─── Define Shared State ─────────────────────────────────────────────────────
export const GraphState = Annotation.Root({
  companyName: Annotation<string>(),
  researchData: Annotation<string>(),
  analysis: Annotation<string>(),
  decision: Annotation<string>(),
  reasoning: Annotation<string>(),
});

// ─── LLM Setup: Groq ─────────────────────────────────────────────────────────
const groqLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile", // one of Groq's best and fastest models
  temperature: 0.2,
});

// ─── LLM Invoker ─────────────────────────────────────────────────────────────
const invokeLLM = async (prompt: string): Promise<string> => {
  console.log('   🔵 Calling Groq LLM...');
  const response = await groqLLM.invoke([new HumanMessage(prompt)]);
  if (!response || !response.content) throw new Error('Empty response from Groq');
  console.log('   ✅ Groq responded successfully.');
  return response.content as string;
};

// ─── Node 1: Researcher ───────────────────────────────────────────────────────
const researcherNode = async (state: typeof GraphState.State) => {
  console.log('\n╔══════════════════════════════╗');
  console.log('║    RESEARCHER NODE ACTIVE    ║');
  console.log('╚══════════════════════════════╝');
  const result = await researchCompanyTool.invoke({ companyName: state.companyName });
  console.log(`Research complete. Got ${result.length} chars of data.`);
  return { researchData: result };
};

// ─── Node 2: Analyst ──────────────────────────────────────────────────────────
const analystNode = async (state: typeof GraphState.State) => {
  console.log('\n╔══════════════════════════════╗');
  console.log('║     ANALYST NODE ACTIVE      ║');
  console.log('╚══════════════════════════════╝');

  const prompt = `You are a senior financial analyst at a top-tier investment bank.
Based on the following research data about "${state.companyName}", provide a concise but thorough analysis covering:
- Market position and competitive landscape
- Recent performance and key financial metrics
- Major growth drivers and risks
- Sentiment from news and market analysts

Research Data:
${state.researchData}
`;

  const content = await invokeLLM(prompt);
  console.log('Analysis complete.');
  return { analysis: content };
};

// ─── Node 3: Decision Maker ───────────────────────────────────────────────────
const deciderNode = async (state: typeof GraphState.State) => {
  console.log('\n╔══════════════════════════════╗');
  console.log('║    DECIDER NODE ACTIVE       ║');
  console.log('╚══════════════════════════════╝');

  const prompt = `You are the lead portfolio manager at a hedge fund.
Based on the following analyst report for "${state.companyName}", make a final investment decision.

You MUST choose either "Invest" or "Pass".

Format your response EXACTLY like this:
DECISION: Invest
REASONING: [Your detailed reasoning here]

Analyst Report:
${state.analysis}
`;

  const content = await invokeLLM(prompt);

  let decision = 'Pass';
  let reasoning = content;

  const decisionMatch = content.match(/DECISION:\s*(Invest|Pass)/i);
  if (decisionMatch) {
    decision = decisionMatch[1];
  }

  const reasoningMatch = content.match(/REASONING:\s*([\s\S]*)/i);
  if (reasoningMatch) {
    reasoning = reasoningMatch[1].trim();
  }

  console.log(`\n🏁 Final Decision: ${decision}`);
  return { decision, reasoning };
};

// ─── Build & Compile LangGraph ────────────────────────────────────────────────
const builder = new StateGraph(GraphState)
  .addNode('researcher', researcherNode)
  .addNode('analyst', analystNode)
  .addNode('decider', deciderNode)
  .addEdge(START, 'researcher')
  .addEdge('researcher', 'analyst')
  .addEdge('analyst', 'decider')
  .addEdge('decider', END);

export const investmentAgent = builder.compile();
