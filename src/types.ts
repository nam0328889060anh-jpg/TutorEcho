export type OperationalMode = 
  | 'SCENARIO_GEN' 
  | 'PARTNER_MODE' 
  | 'FEYNMAN_MODE' 
  | 'DIAGNOSE_SESSION' 
  | 'FLASHCARDS'
  | 'PERFORMANCE_ADVISOR';

export interface PartnerScenario {
  context: string;
  ai_role: string;
  user_role: string;
  opening_line: string;
}

export interface FeynmanScenario {
  student_persona: string;
  initial_question: string;
}

export interface ScenarioModule {
  id?: string;
  topic: string;
  partner_scenario: PartnerScenario;
  feynman_scenario: FeynmanScenario;
  category?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  responseTimeSeconds?: number;
  microCorrection?: string | null;
}

export interface MistakeItem {
  type: string;
  user_said: string;
  recommended_correction: string;
  explanation: string;
}

export interface FlashcardItem {
  front: string;
  back: string;
  interval_days: number;
}

export interface DiagnosticResult {
  fluency_score: string;
  recurring_mistakes: MistakeItem[];
  srs_flashcards: FlashcardItem[];
  feynman_concept_verdict: string;
}

export interface StoredFlashcard {
  id: string;
  front: string;
  back: string;
  interval_days: number;
  sourceTopic?: string;
  created_at: number;
  next_review_at: number;
  repetitions: number;
}

export interface SessionHistoryRecord {
  id: string;
  timestamp: number;
  mode: 'PARTNER_MODE' | 'FEYNMAN_MODE';
  topic: string;
  messagesCount: number;
  diagnostic: DiagnosticResult;
}

export interface StrategicBottleneck {
  issue: string;
  impact: string;
}

export interface StrategicPrescriptionItem {
  priority: number;
  focus_area: string;
  recommended_action: string;
  trigger_next_mode: string;
}

export interface StrategicAdvisorReport {
  performance_summary: {
    overall_mastery: string;
    core_strengths: string[];
    critical_bottlenecks: StrategicBottleneck[];
  };
  pedagogical_growth: string;
  actionable_prescription: StrategicPrescriptionItem[];
  immediate_challenge: string;
}
