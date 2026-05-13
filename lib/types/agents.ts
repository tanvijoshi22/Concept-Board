import { SessionAnswers } from '@/lib/types';

// ─── Agent 1 — Analyst ───────────────────────────────────────────────────────

export type { SessionAnswers as AnalystInput };

export interface AnalystOutput {
  productSummary: string;
  userProfile: {
    type: string;
    context: string;
    primaryNeed: string;
    emotionalState: string;
  };
  businessIntent: {
    perceptionGoals: string[];
    personalityWords: string[];
    visualAdmirations: string;
    visualAvoidances: string;
    positioningStatement: string;
  };
  marketContext: {
    competitors: string[];
    competitorVisualPattern: string;
    differentiationOpportunity: string;
  };
  designBriefStatement: string;
  suggestedConceptTone: string[];
}

// ─── Agent 2 — Concept Creator ───────────────────────────────────────────────

export interface ConceptKeyword {
  word: string;
  framingPhrase: string;
  icon: string;
  explanation: string;
  visualManifestations: string[];
}

export interface AgentConceptDirection {
  id: 'direction_1' | 'direction_2';
  conceptName: string;
  positioningStatement: string;
  tagline: string;
  keywords: ConceptKeyword[];
  aestheticArchetype: string;
  differentiatorFromDirection2: string;
}

export interface ConceptOutput {
  directions: [AgentConceptDirection, AgentConceptDirection];
}

// ─── Agent 3 — Mood Board Builder ────────────────────────────────────────────

export interface MoodBoardSuggestionRaw {
  keyword: string;
  emotion: string;
  category: string;
  description: string;
  searchQuery: string;
  colorNote: string;
}

export interface MoodBoardSuggestionWithImage extends MoodBoardSuggestionRaw {
  imageUrl: string | null;
  imageThumb: string | null;
  imageAlt: string;
  imageCredit: string;
  imageCreditLink: string;
}

export interface MoodBoardOutput {
  directionId: string;
  moodBoardSuggestions: MoodBoardSuggestionWithImage[];
  overallMoodNote: string;
}

// ─── Agent 4 — Foundations Deriver ───────────────────────────────────────────

export interface FoundationsColorPalette {
  rationale: string;
  theme: 'light' | 'dark';
  themeRationale: string;
  colors: Array<{
    name: string;
    hex: string;
    role: string;
    keywordConnection: string;
  }>;
  semanticColors: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface FoundationsTypography {
  rationale: string;
  displayFont: {
    name: string;
    weight: string;
    usage: string;
    personality: string;
    keywordConnection: string;
    sampleText: string;
  };
  bodyFont: {
    name: string;
    weight: string;
    usage: string;
    personality: string;
    keywordConnection: string;
  };
  scaleBase: number;
  scaleRatio: string;
  lineHeightBody: string;
  letterSpacingDisplay: string;
}

export interface FoundationsOutput {
  directionId: string;
  colorPalette: FoundationsColorPalette;
  typography: FoundationsTypography;
  spacingPersonality: {
    density: 'compact' | 'balanced' | 'spacious';
    baseUnit: number;
    rationale: string;
  };
  visualPersonality: {
    borderRadius: string;
    shadowStyle: string;
    iconographyStyle: string;
    microinteractionFeel: string;
    overallDescription: string;
  };
  uiInspirationReferences: Array<{
    productName: string;
    whatToTakeFrom: string;
    url: string;
  }>;
}

export interface FoundationsInput {
  brief: AnalystOutput;
  concept: AgentConceptDirection;
  moodBoard: MoodBoardOutput | null;
}

// ─── Pipeline result ──────────────────────────────────────────────────────────

export interface PipelineResult {
  directions: [import('@/lib/types').ConceptDirection, import('@/lib/types').ConceptDirection];
  brief: AnalystOutput;
}
