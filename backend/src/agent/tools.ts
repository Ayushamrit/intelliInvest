import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { tavily } from '@tavily/core';

// 1. Tavily Search (Primary)
const searchTavily = async (query: string): Promise<string> => {
  if (!process.env.TAVILY_API_KEY) throw new Error("Missing TAVILY_API_KEY");
  const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const response = await client.search(query, {
    includeAnswer: "advanced",
    searchDepth: "advanced"
  });
  return response.answer || response.results.map(r => r.content).join('\n') || 'No results from Tavily.';
};

// 2. Serper Search (Fallback 1)
const searchSerper = async (query: string): Promise<string> => {
  if (!process.env.SERPER_API_KEY) throw new Error("Missing SERPER_API_KEY");
  const data = JSON.stringify({ q: query });
  const config = {
    method: 'post',
    url: 'https://google.serper.dev/search',
    headers: { 
      'X-API-KEY': process.env.SERPER_API_KEY, 
      'Content-Type': 'application/json'
    },
    data: data
  };
  const response = await axios(config);
  let results = '';
  if (response.data.organic) {
    response.data.organic.slice(0, 5).forEach((item: any) => {
      results += item.snippet + '\n';
    });
  }
  return results.trim() || 'No results from Serper.';
};

// 3. DuckDuckGo Scraper (Fallback 2)
const searchDuckDuckGo = async (query: string): Promise<string> => {
  const res = await axios.post(
    'https://html.duckduckgo.com/html/',
    `q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    }
  );
  const $ = cheerio.load(res.data);
  let results = '';
  $('.result__snippet').each((i, el) => {
    if (i < 5) results += $(el).text() + '\n';
  });
  return results.trim() || 'No relevant results found.';
};

export const researchCompanyTool = tool(
  async ({ companyName }) => {
    console.log(`Searching for info on: ${companyName}`);
    const query = `What is the market position, financials, and recent news for ${companyName}?`;
    
    // Attempt 1: Tavily
    try {
      console.log('Attempting Tavily search...');
      const tavilyResults = await searchTavily(query);
      if (tavilyResults && tavilyResults !== 'No results from Tavily.') {
        return `[Source: Tavily]\n${tavilyResults}`;
      }
    } catch (e) {
      console.error('Tavily failed, falling back to Serper...');
    }

    // Attempt 2: Serper
    try {
      console.log('Attempting Serper search...');
      const serperResults = await searchSerper(query);
      if (serperResults && serperResults !== 'No results from Serper.') {
        return `[Source: Serper/Google]\n${serperResults}`;
      }
    } catch (e) {
      console.error('Serper failed, falling back to DuckDuckGo...');
    }

    // Attempt 3: DuckDuckGo
    try {
      console.log('Attempting DuckDuckGo search...');
      const ddgResults = await searchDuckDuckGo(query);
      if (ddgResults && ddgResults !== 'No relevant results found.') {
        return `[Source: DuckDuckGo]\n${ddgResults}`;
      }
    } catch (e) {
      console.error('DuckDuckGo failed.');
    }

    return `Failed to fetch data for ${companyName}. All search APIs are exhausted or rate limited. Please try again later.`;
  },
  {
    name: 'research_company',
    description: 'Searches the web for recent news, financial summaries, and company overview. Handles API fallbacks automatically.',
    schema: z.object({
      companyName: z.string().describe('The name of the company to research.'),
    }),
  }
);
