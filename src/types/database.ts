// ─── Venture Stage ────────────────────────────────────────────────
export type VentureStage = "discovery" | "analysis" | "report_ready";

// ─── Knowledge Graph (JSONB) ─────────────────────────────────────
export interface CoreInputs {
    context_type?: "new_idea" | "existing_business" | "new_product" | "pivot";
    business_idea?: string;
    target_customer?: string;
    problem_statement?: string;
    solution_differentiation?: string;
    location?: string;
}

export interface ValidationEvidence {
    interviews_conducted?: boolean;
    interview_count?: number;
    findings?: string;
    surveys?: boolean;
    pre_orders?: boolean;
    beta_testers?: number;
}

export interface MarketData {
    global_market_size?: string;
    global_growth_rate?: string;
    tam?: string;
    sam?: string;
    som?: string;
    competitors: Competitor[];
}

export interface Competitor {
    name: string;
    type: "global" | "regional" | "local";
    description?: string;
    funding?: string;
    scale?: string;
    weakness?: string;
}

export interface RedFlag {
    id: string;
    type: string;
    message: string;
    severity: "low" | "medium" | "high";
    suggestion?: string;
}

export interface Refinements {
    target_narrowed?: string;
    differentiation_clarified?: string;
    additional_context?: string;
    founder_market_fit?: string;
}

export interface ValidationOutput {
    score: number;
    breakdown: {
        problem_clarity: number;
        solution_fit: number;
        market_opportunity: number;
        competitive_advantage: number;
    };
    verdict: "strong_fit" | "moderate_fit" | "weak_fit" | "no_fit";
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    recommendations: string[];
}

export interface PitchDeckSlide {
    title: string;
    bullets: string[];
    source: string;
}

export interface OutputData {
    validation?: ValidationOutput;
    market?: MarketData;
    competitors?: {
        global: Competitor[];
        regional: Competitor[];
        local: Competitor[];
        your_value: string;
    };
    positioning?: string;
    pitch_deck?: {
        problem_slide?: PitchDeckSlide;
        solution_slide?: PitchDeckSlide;
        market_slide?: PitchDeckSlide;
        competition_slide?: PitchDeckSlide;
        why_now_slide?: PitchDeckSlide;
        target_customer_slide?: PitchDeckSlide;
    };
}

export interface KnowledgeGraph {
    core_inputs: CoreInputs;
    refinements: Refinements;
    validation_evidence: ValidationEvidence;
    market_data: MarketData;
    red_flags: RedFlag[];
    outputs: OutputData;
}

// ─── Venture ─────────────────────────────────────────────────────
export interface Venture {
    id: string;
    user_id?: string;
    stage: VentureStage;
    knowledge_graph: KnowledgeGraph;
    created_at: string;
    updated_at: string;
}

// ─── Chat Message ────────────────────────────────────────────────
export interface Message {
    id: string;
    venture_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

// ─── Empty Knowledge Graph Factory ──────────────────────────────
export function createEmptyKnowledgeGraph(): KnowledgeGraph {
    return {
        core_inputs: {},
        refinements: {},
        validation_evidence: {},
        market_data: {
            competitors: [],
        },
        red_flags: [],
        outputs: {},
    };
}

// ─── Knowledge Graph Completion % ────────────────────────────────
export function getCompletionPercentage(kg: KnowledgeGraph): number {
    const fields = [
        kg.core_inputs.context_type,
        kg.core_inputs.business_idea,
        kg.core_inputs.target_customer,
        kg.core_inputs.problem_statement,
        kg.core_inputs.solution_differentiation,
        kg.core_inputs.location,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
}
