export interface Color {
  name: string;
  hex: string;
  role: string;
}

export interface ColorPalette {
  rationale: string;
  colors: Color[];
  theme: 'light' | 'dark';
}

export interface FontSpec {
  name: string;
  source: string;
  usage: string;
  personality: string;
}

export interface Typography {
  rationale: string;
  displayFont: FontSpec;
  bodyFont: FontSpec;
}

export interface Keyword {
  word: string;
  icon?: string;
  framingPhrase?: string;
  explanation: string;
  visualManifestations?: string[];
}

export interface MoodBoardSuggestion {
  keyword: string;
  emotion: string;
  category: string;
  description: string;
  searchQuery: string;
  // Pre-fetched by Agent 3
  imageUrl?: string | null;
  imageThumb?: string | null;
  imageAlt?: string;
  imageCredit?: string;
  imageCreditLink?: string;
  colorNote?: string;
}

export interface MoodBoardImage {
  keyword: string;
  emotion: string;
  category: string;
  url: string | null;
  thumb?: string;
  alt?: string;
  credit?: string;
  creditLink?: string;
  fallbackQuery?: string;
}

export interface UIInspiration {
  productName: string;
  whatToTakeFrom: string;
  url?: string;
}

export interface ConceptDirection {
  id: 'direction_1' | 'direction_2';
  conceptName: string;
  tagline: string;
  keywords: Keyword[];
  colorPalette: ColorPalette;
  typography: Typography;
  moodBoardImageSuggestions: MoodBoardSuggestion[];
  uiInspirationReferences: UIInspiration[];
  designPersonality: string;
}

export interface SessionAnswers {
  productName: string;
  domain: string;
  productDescription: string;
  stage: string;
  userType: string;
  userGoal: string;
  environment: string[];
  userFeelings: string[];
  businessPerception: string[];
  businessWords: [string, string, string];
  admireBrands: string;
  avoidStyles: string;
  competitors: [string, string, string];
  positioning: string;
  benchmarks: string;
}

export type AppStep = 'welcome' | 1 | 2 | 3 | 4 | 'loading' | 'results';

export interface RefinementMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppState {
  step: AppStep;
  answers: SessionAnswers;
  directions: [ConceptDirection, ConceptDirection] | null;
  brief: import('@/lib/types/agents').AnalystOutput | null;
  selectedDirectionId: 'direction_1' | 'direction_2' | null;
  refinementHistory: RefinementMessage[];
  showRefinement: boolean;
  error: string | null;
}
