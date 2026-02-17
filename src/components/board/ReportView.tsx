import { OutputData } from "@/types/database";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Presentation } from "lucide-react";

interface ReportViewProps {
    outputs: OutputData;
}

export function ReportView({ outputs }: ReportViewProps) {
    if (!outputs.validation) return null;

    const { validation, pitch_deck } = outputs;
    const scoreColor =
        validation.score >= 80
            ? "text-emerald-600"
            : validation.score >= 50
                ? "text-amber-600"
                : "text-red-600";

    const verdictColor =
        validation.verdict === "strong_fit"
            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
            : validation.verdict === "moderate_fit"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-red-100 text-red-800 border-red-200";

    return (
        <div className="space-y-6">
            {/* ─── Validation Score ────────────────────────────── */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-[#03334c] flex items-center justify-between">
                        Validation Score
                        <Badge variant="outline" className={verdictColor}>
                            {validation.verdict.replace("_", " ").toUpperCase()}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Based on clarity, evidence, and market opportunity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-bold ${scoreColor}`}>
                            {validation.score}
                        </span>
                        <span className="text-sm text-gray-500 mb-1">/ 100</span>
                    </div>
                    <Progress value={validation.score} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <ScoreItem
                            label="Problem Clarity"
                            value={validation.breakdown.problem_clarity}
                        />
                        <ScoreItem
                            label="Solution Fit"
                            value={validation.breakdown.solution_fit}
                        />
                        <ScoreItem
                            label="Market Opportunity"
                            value={validation.breakdown.market_opportunity}
                        />
                        <ScoreItem
                            label="Advantage"
                            value={validation.breakdown.competitive_advantage}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ─── Tabs: Analysis & Pitch Deck ─────────────────── */}
            <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analysis">
                        <FileText className="w-4 h-4 mr-2" />
                        Analysis
                    </TabsTrigger>
                    <TabsTrigger value="pitch">
                        <Presentation className="w-4 h-4 mr-2" />
                        Pitch Deck
                    </TabsTrigger>
                </TabsList>

                {/* ─── Analysis Tab ────────────────────────────── */}
                <TabsContent value="analysis" className="space-y-4 mt-4">
                    <Section
                        title="Strengths"
                        items={validation.strengths}
                        icon={CheckCircle2}
                        color="text-emerald-600"
                    />
                    <Section
                        title="Weaknesses"
                        items={validation.weaknesses}
                        icon={XCircle}
                        color="text-red-500"
                    />
                    <Section
                        title="Risks"
                        items={validation.risks}
                        icon={AlertTriangle}
                        color="text-amber-500"
                    />
                    <Section
                        title="Strategic Recommendations"
                        items={validation.recommendations}
                        icon={FileText}
                        color="text-blue-600"
                    />
                </TabsContent>

                {/* ─── Pitch Deck Tab ──────────────────────────── */}
                <TabsContent value="pitch" className="space-y-4 mt-4">
                    {pitch_deck && (
                        <div className="space-y-4">
                            <Slide cardTitle="1. Problem" slide={pitch_deck.problem_slide} />
                            <Slide cardTitle="2. Solution" slide={pitch_deck.solution_slide} />
                            <Slide cardTitle="3. Market" slide={pitch_deck.market_slide} />
                            <Slide cardTitle="4. Why Now" slide={pitch_deck.why_now_slide} />
                            <Slide cardTitle="5. Competition" slide={pitch_deck.competition_slide} />
                            <Slide cardTitle="6. Target Customer" slide={pitch_deck.target_customer_slide} />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>{label}</span>
                <span>{value}/100</span>
            </div>
            <Progress value={value} className="h-1.5" />
        </div>
    );
}

function Section({
    title,
    items,
    icon: Icon,
    color,
}: {
    title: string;
    items: string[];
    icon: any;
    color: string;
}) {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h4 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
                {title}
            </h4>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Slide({ cardTitle, slide }: { cardTitle: string; slide: any }) {
    if (!slide) return null;
    return (
        <Card>
            <CardHeader className="py-3 bg-slate-50 border-b">
                <CardTitle className="text-sm font-semibold text-slate-700">
                    {cardTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <h4 className="font-bold text-[#03334c] mb-2">{slide.title}</h4>
                <ul className="space-y-1 mb-3">
                    {slide.bullets.map((b: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                            {b}
                        </li>
                    ))}
                </ul>
                <p className="text-[10px] text-gray-400 italic">Source: {slide.source}</p>
            </CardContent>
        </Card>
    );
}
