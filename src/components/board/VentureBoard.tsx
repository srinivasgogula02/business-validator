"use client";

import { Venture, getCompletionPercentage } from "@/types/database";
import {
    CheckCircle2,
    Circle,
    AlertTriangle,
    Lightbulb,
    MapPin,
    Users,
    Target,
    Shield,
    Zap,
    TrendingUp,
    ClipboardCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MarketCard } from "./MarketCard";

import { ReportView } from "./ReportView";

interface VentureBoardProps {
    venture: Venture;
}

export function VentureBoard({ venture }: VentureBoardProps) {
    const kg = venture.knowledge_graph;
    const completion = getCompletionPercentage(kg);

    // If report is ready and outputs are available, show the report view
    if (venture.stage === "report_ready") {
        if (kg.outputs?.validation) {
            return (
                <div className="p-5 space-y-6">
                    {/* ─── Phase & Progress Header (Reused) ──────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[#03334c] flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" />
                                Venture Report
                            </h3>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                                📊 Report Ready
                            </Badge>
                        </div>
                    </div>

                    <ReportView outputs={kg.outputs} />
                </div>
            );
        } else {
            // Generating state
            return (
                <div className="p-5 space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03334c]"></div>
                    <p className="text-[#03334c] font-medium mt-4">Generating your Venture Report...</p>
                    <p className="text-sm text-gray-500">Analyzing unit economics, risks, and market data.</p>
                </div>
            );
        }
    }

    // Default Discovery/Analysis View
    const coreFields = [
        {
            key: "context_type",
            label: "Context",
            icon: ClipboardCheck,
            value: kg.core_inputs.context_type
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
        },
        {
            key: "business_idea",
            label: "Business Idea",
            icon: Lightbulb,
            value: kg.core_inputs.business_idea,
        },
        {
            key: "target_customer",
            label: "Target Customer",
            icon: Users,
            value: kg.core_inputs.target_customer,
        },
        {
            key: "problem_statement",
            label: "Problem",
            icon: Target,
            value: kg.core_inputs.problem_statement,
        },
        {
            key: "solution_differentiation",
            label: "Differentiator",
            icon: Zap,
            value: kg.core_inputs.solution_differentiation,
        },
        {
            key: "location",
            label: "Location",
            icon: MapPin,
            value: kg.core_inputs.location,
        },
    ];

    const filledCount = coreFields.filter((f) => f.value).length;

    return (
        <div className="p-5 space-y-6">
            {/* ─── Phase & Progress ────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#03334c] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        Venture Board
                    </h3>
                    <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold ${venture.stage === "discovery"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : venture.stage === "analysis"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                    >
                        {venture.stage === "discovery"
                            ? "🔍 Discovery"
                            : venture.stage === "analysis"
                                ? "🔬 Analysis"
                                : "📊 Report Ready"}
                    </Badge>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-[#5a6b7f]">
                            Core Inputs ({filledCount}/{coreFields.length})
                        </span>
                        <span className="font-semibold text-[#03334c]">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-2 bg-[#e2e8f0]" />
                </div>
            </div>

            <Separator className="bg-[#03334c]/5" />

            {/* ─── Core Inputs ─────────────────────────────────── */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#03334c] uppercase tracking-wider">
                    Core Inputs
                </h4>
                <div className="space-y-2">
                    {coreFields.map((field) => (
                        <div
                            key={field.key}
                            className={`rounded-lg p-3 transition-all duration-300 ${field.value
                                ? "bg-white border border-[#03334c]/10 shadow-sm animate-pulse-glow"
                                : "bg-[#f5f7fa] border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {field.value ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                    <Circle className="w-3.5 h-3.5 text-[#cbd5e1] shrink-0" />
                                )}
                                <div className="flex items-center gap-1.5">
                                    <field.icon className="w-3 h-3 text-[#5a6b7f]" />
                                    <span
                                        className={`text-xs font-medium ${field.value ? "text-[#03334c]" : "text-[#94a3b8]"
                                            }`}
                                    >
                                        {field.label}
                                    </span>
                                </div>
                            </div>
                            {field.value && (
                                <p className="text-xs text-[#5a6b7f] ml-5.5 line-clamp-2 leading-relaxed">
                                    {field.value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Refinements ─────────────────────────────────── */}
            {(kg.refinements.target_narrowed ||
                kg.refinements.differentiation_clarified ||
                kg.refinements.founder_market_fit) && (
                    <>
                        <Separator className="bg-[#03334c]/5" />
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-[#03334c] uppercase tracking-wider">
                                Refinements
                            </h4>
                            <div className="space-y-2">
                                {kg.refinements.target_narrowed && (
                                    <InfoCard
                                        icon={Users}
                                        label="Narrowed Target"
                                        value={kg.refinements.target_narrowed}
                                    />
                                )}
                                {kg.refinements.differentiation_clarified && (
                                    <InfoCard
                                        icon={Zap}
                                        label="Differentiation"
                                        value={kg.refinements.differentiation_clarified}
                                    />
                                )}
                                {kg.refinements.founder_market_fit && (
                                    <InfoCard
                                        icon={Shield}
                                        label="Founder-Market Fit"
                                        value={kg.refinements.founder_market_fit}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}

            {/* ─── Validation Evidence ─────────────────────────── */}
            {kg.validation_evidence.interviews_conducted && (
                <>
                    <Separator className="bg-[#03334c]/5" />
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-[#03334c] uppercase tracking-wider">
                            Validation Evidence
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-[#03334c]/10 shadow-sm">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#5a6b7f]">Interviews Conducted</span>
                                <span className="font-semibold text-[#03334c]">
                                    {kg.validation_evidence.interview_count || "Yes"}
                                </span>
                            </div>
                            {kg.validation_evidence.findings && (
                                <p className="text-xs text-[#5a6b7f] mt-2 leading-relaxed">
                                    {kg.validation_evidence.findings}
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ─── Market & Competitors ────────────────────────── */}
            {(kg.market_data.competitors.length > 0 || kg.market_data.tam) && (
                <>
                    <Separator className="bg-[#03334c]/5" />
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-[#03334c] uppercase tracking-wider">
                            Market Analysis
                        </h4>

                        {/* Market Size Cards */}
                        {(kg.market_data.tam || kg.market_data.sam || kg.market_data.som) && (
                            <div className="grid grid-cols-3 gap-2">
                                <MarketCard label="TAM" value={kg.market_data.tam} />
                                <MarketCard label="SAM" value={kg.market_data.sam} />
                                <MarketCard label="SOM" value={kg.market_data.som} />
                            </div>
                        )}

                        {/* Competitor Grid */}
                        {kg.market_data.competitors.length > 0 && (
                            <div className="bg-white rounded-lg border border-[#03334c]/10 shadow-sm overflow-hidden">
                                <div className="px-3 py-2 bg-[#f8fafc] border-b border-[#03334c]/5 flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#03334c]">Competitor Landscape</span>
                                    <Badge variant="outline" className="text-[10px] h-5 bg-white">
                                        {kg.market_data.competitors.length} Found
                                    </Badge>
                                </div>
                                <div className="divide-y divide-[#03334c]/5">
                                    {kg.market_data.competitors.map((comp, i) => (
                                        <div key={i} className="p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-[#03334c]">{comp.name}</span>
                                                <span className="text-[10px] text-[#5a6b7f] uppercase tracking-wide bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                                                    {comp.type}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#5a6b7f] line-clamp-2">
                                                {comp.description || "No description available."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ─── Red Flags ───────────────────────────────────── */}
            {kg.red_flags.length > 0 && (
                <>
                    <Separator className="bg-[#03334c]/5" />
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Areas to Address ({kg.red_flags.length})
                        </h4>
                        <div className="space-y-2">
                            {kg.red_flags.map((flag) => (
                                <div
                                    key={flag.id}
                                    className={`rounded-lg p-3 border ${flag.severity === "high"
                                        ? "bg-red-50 border-red-200"
                                        : flag.severity === "medium"
                                            ? "bg-amber-50 border-amber-200"
                                            : "bg-yellow-50 border-yellow-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle
                                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${flag.severity === "high"
                                                ? "text-red-500"
                                                : flag.severity === "medium"
                                                    ? "text-amber-500"
                                                    : "text-yellow-500"
                                                }`}
                                        />
                                        <div>
                                            <p className="text-xs font-medium text-[#0f1729]">
                                                {flag.message}
                                            </p>
                                            {flag.suggestion && (
                                                <p className="text-[10px] text-[#5a6b7f] mt-1">
                                                    💡 {flag.suggestion}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ─── Phase Progress Steps ────────────────────────── */}
            <Separator className="bg-[#03334c]/5" />
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#03334c] uppercase tracking-wider">
                    Journey
                </h4>
                <div className="space-y-0">
                    {[
                        {
                            label: "Discovery",
                            stage: "discovery",
                            desc: "Core questions",
                        },
                        { label: "Analysis", stage: "analysis", desc: "Deep dive" },
                        {
                            label: "Reports",
                            stage: "report_ready",
                            desc: "5 expert reports",
                        },
                    ].map((step, i) => {
                        const stageOrder = ["discovery", "analysis", "report_ready"];
                        const currentIdx = stageOrder.indexOf(venture.stage);
                        const stepIdx = stageOrder.indexOf(step.stage);
                        const isComplete = stepIdx < currentIdx;
                        const isCurrent = stepIdx === currentIdx;

                        return (
                            <div key={step.stage} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${isComplete
                                            ? "bg-emerald-500 text-white"
                                            : isCurrent
                                                ? "bg-[#03334c] text-white"
                                                : "bg-[#e2e8f0] text-[#94a3b8]"
                                            }`}
                                    >
                                        {isComplete ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    {i < 2 && (
                                        <div
                                            className={`w-0.5 h-8 ${isComplete ? "bg-emerald-500" : "bg-[#e2e8f0]"
                                                }`}
                                        />
                                    )}
                                </div>
                                <div className="pt-0.5">
                                    <p
                                        className={`text-xs font-medium ${isCurrent ? "text-[#03334c]" : "text-[#94a3b8]"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-[#94a3b8]">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Reusable info card ─────────────────────────────────────────
function InfoCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white rounded-lg p-3 border border-[#03334c]/10 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-[#5a6b7f]" />
                <span className="text-xs font-medium text-[#03334c]">{label}</span>
            </div>
            <p className="text-xs text-[#5a6b7f] leading-relaxed line-clamp-3">
                {value}
            </p>
        </div>
    );
}
