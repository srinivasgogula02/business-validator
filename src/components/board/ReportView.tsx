import { OutputData } from "@/types/database";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Presentation, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

            {/* ─── Documents Buttons ─────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                {/* Strategic Execution Plan Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start gap-2 bg-white hover:bg-slate-50 border-[#03334c]/10 text-left transition-all whitespace-normal"
                        >
                            <div className="flex items-center gap-2 w-full">
                                <FileText className="w-5 h-5 shrink-0 text-[#03334c]" />
                                <span className="font-bold text-[#03334c] flex-1 text-base leading-tight">Strategic Execution Plan</span>
                                <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500 font-normal leading-relaxed">
                                View generated problem, competitor analysis, validation, and GTM strategy.
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-4 border-b border-[#03334c]/5 bg-slate-50/50 shrink-0">
                            <DialogTitle className="flex items-center gap-2 text-[#03334c]">
                                <FileText className="w-5 h-5" />
                                Strategic Execution Plan
                            </DialogTitle>
                            <DialogDescription>
                                A comprehensive look into your business aspects, generated from the discovery phase.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 prose-headings:text-[#03334c] prose-headings:font-bold prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:marker:text-gray-400">
                                {outputs.problem_statement && <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputs.problem_statement}</ReactMarkdown>}
                                {outputs.competitor_analysis && (
                                    <>
                                        <hr className="my-8 border-gray-100" />
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputs.competitor_analysis}</ReactMarkdown>
                                    </>
                                )}
                                {outputs.idea_validation && (
                                    <>
                                        <hr className="my-8 border-gray-100" />
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputs.idea_validation}</ReactMarkdown>
                                    </>
                                )}
                                {outputs.gtm_strategy && (
                                    <>
                                        <hr className="my-8 border-gray-100" />
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputs.gtm_strategy}</ReactMarkdown>
                                    </>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pitch Deck Outline Dialog */}
                {pitch_deck && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-start gap-2 bg-white hover:bg-slate-50 border-[#03334c]/10 text-left transition-all whitespace-normal"
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Presentation className="w-5 h-5 shrink-0 text-[#03334c]" />
                                    <span className="font-bold text-[#03334c] flex-1 text-base leading-tight">Pitch Deck Outline</span>
                                    <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-500 font-normal leading-relaxed">
                                    Key slides and bullet points to present your vision to investors.
                                </span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                            <DialogHeader className="p-6 pb-4 border-b border-[#03334c]/5 bg-slate-50/50 shrink-0">
                                <DialogTitle className="flex items-center gap-2 text-[#03334c]">
                                    <Presentation className="w-5 h-5" />
                                    Pitch Deck Outline
                                </DialogTitle>
                                <DialogDescription>
                                    6 essential slides constructed from your venture data.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Slide cardTitle="1. Problem" slide={pitch_deck.problem_slide} />
                                    <Slide cardTitle="2. Solution" slide={pitch_deck.solution_slide} />
                                    <Slide cardTitle="3. Market" slide={pitch_deck.market_slide} />
                                    <Slide cardTitle="4. Why Now" slide={pitch_deck.why_now_slide} />
                                    <Slide cardTitle="5. Competition" slide={pitch_deck.competition_slide} />
                                    <Slide cardTitle="6. Target Customer" slide={pitch_deck.target_customer_slide} />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
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
