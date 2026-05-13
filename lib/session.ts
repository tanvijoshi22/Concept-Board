import { AppState, SessionAnswers } from './types';

export const DEFAULT_ANSWERS: SessionAnswers = {
  productName: '',
  domain: '',
  productDescription: '',
  stage: '',
  userType: '',
  userGoal: '',
  environment: [],
  userFeelings: [],
  businessPerception: [],
  businessWords: ['', '', ''],
  admireBrands: '',
  avoidStyles: '',
  competitors: ['', '', ''],
  positioning: '',
  benchmarks: '',
};

export const DEFAULT_STATE: AppState = {
  step: 'welcome',
  answers: DEFAULT_ANSWERS,
  directions: null,
  brief: null,
  selectedDirectionId: null,
  refinementHistory: [],
  showRefinement: false,
  error: null,
};
