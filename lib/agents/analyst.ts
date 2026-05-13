import { SessionAnswers } from '@/lib/types';
import { AnalystOutput } from '@/lib/types/agents';
import { callLLM } from './shared';

export const ANALYST_SYSTEM_PROMPT = `You are a senior design strategist. Your only job is to read raw product research inputs and produce a clean, structured creative brief for a UI design project. You do not generate concept names, visual ideas, colors, or typography. You only analyse, synthesise, and clarify. You are exceptional at identifying the emotional gap in a market and articulating the core design challenge in one sentence. You always output valid JSON only. No explanation. No markdown. Pure JSON.`;

export function buildAnalystPrompt(answers: SessionAnswers): string {
  return `Analyse the following product research inputs and produce a structured creative brief.

PRODUCT INPUTS:
Product name: ${answers.productName || 'Not specified'}
Domain: ${answers.domain}
What it does: ${answers.productDescription}
Stage: ${answers.stage}
Primary user type: ${answers.userType}
User's primary goal: ${answers.userGoal}
Usage environments: ${answers.environment.join(', ')}
How users should feel: ${answers.userFeelings.join(', ')}
Business perception goals: ${answers.businessPerception.join(', ')}
Business self-description words: ${answers.businessWords.filter(Boolean).join(', ')}
Brands admired visually: ${answers.admireBrands || 'None specified'}
Styles to avoid: ${answers.avoidStyles || 'None specified'}
Competitors: ${answers.competitors.filter(Boolean).join(', ') || 'None specified'}
Market positioning: ${answers.positioning}
Visual benchmarks: ${answers.benchmarks || 'None specified'}

Return ONLY this JSON structure:
{
  "productSummary": "2-3 sentence summary of what the product is and does",
  "userProfile": {
    "type": "who they are",
    "context": "where and how they use the product",
    "primaryNeed": "their core functional need",
    "emotionalState": "their emotional state when using this product"
  },
  "businessIntent": {
    "perceptionGoals": ["how they want to be perceived"],
    "personalityWords": ["brand adjectives"],
    "visualAdmirations": "what they admire and why",
    "visualAvoidances": "what to stay away from",
    "positioningStatement": "One sentence: This product wants to be the X of Y market"
  },
  "marketContext": {
    "competitors": ["competitor names"],
    "competitorVisualPattern": "what competitors visually have in common",
    "differentiationOpportunity": "where the visual white space is in this market"
  },
  "designBriefStatement": "The single most important sentence capturing the design challenge",
  "suggestedConceptTone": ["3-5 tonal adjectives derived from all inputs"]
}`;
}

export async function runAnalyst(answers: SessionAnswers): Promise<AnalystOutput> {
  return callLLM(ANALYST_SYSTEM_PROMPT, buildAnalystPrompt(answers), 0.4, 1500) as Promise<AnalystOutput>;
}
