"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  BarChart3,
  Presentation,
  CheckCircle2,
  MessageSquare,
  Target,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Navigation ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#03334c]/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#03334c] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#03334c]">
              OnEasy
            </span>
          </div>
          <Link href="/chat">
            <Button className="bg-[#03334c] hover:bg-[#03334c]/90 text-white rounded-full px-6 cursor-pointer">
              Start Validating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-[#03334c]/[0.02] blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#03334c]/[0.03] blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#03334c]/5 text-[#03334c] text-sm font-medium mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Business Validation
            </motion.div>

            <motion.h1
              variants={fadeIn}
              custom={1}
              className="text-5xl md:text-7xl font-bold text-[#03334c] leading-tight mb-6"
            >
              Validate Your Idea
              <br />
              <span className="gradient-text">Before You Build It</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              custom={2}
              className="text-lg md:text-xl text-[#5a6b7f] max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Have a natural conversation with an AI consultant who thinks like
              a Chartered Accountant. Get market analysis, competitor insights,
              and a pitch-ready validation report — in minutes, not weeks.
            </motion.p>

            <motion.div
              variants={fadeIn}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-[#03334c] hover:bg-[#03334c]/90 text-white rounded-full px-8 py-6 text-lg group cursor-pointer"
                >
                  Start Your Validation
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <span className="text-sm text-[#5a6b7f]">
                Free • No signup required
              </span>
            </motion.div>
          </motion.div>

          {/* ─── Hero Visual ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-[#03334c]/10 bg-white shadow-2xl shadow-[#03334c]/5 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border-b border-[#03334c]/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 ml-3">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-[#5a6b7f] max-w-xs mx-auto border">
                    oneasy.ai/chat
                  </div>
                </div>
              </div>
              {/* Chat preview */}
              <div className="p-6 md:p-8 grid md:grid-cols-5 gap-6 min-h-[320px]">
                <div className="md:col-span-3 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#03334c] flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#f8fafc] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#0f1729]">
                      Welcome! I&apos;m your Business Validation Consultant.
                      Tell me — what&apos;s the idea you&apos;re excited about?
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#03334c] rounded-2xl rounded-tr-md px-4 py-3 text-sm text-white max-w-[85%]">
                      I want to build a farm-to-kitchen marketplace connecting
                      farmers directly with restaurants in Hyderabad.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#03334c] flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#f8fafc] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[#0f1729]">
                      Interesting — a direct marketplace model. Hyderabad has
                      about <strong>15,000 restaurants</strong>. What specific
                      segment are you targeting — dhabas, mid-range, or
                      cloud kitchens?
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 bg-[#f8fafc] rounded-xl p-4 border border-[#03334c]/5">
                  <div className="text-xs font-semibold text-[#03334c] mb-3 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    LIVE VENTURE BOARD
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Business Idea", filled: true },
                      { label: "Target Customer", filled: true },
                      { label: "Location", filled: true },
                      { label: "Problem", filled: false },
                      { label: "Differentiator", filled: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${item.filled
                            ? "bg-[#03334c] text-white"
                            : "border-2 border-[#cbd5e1]"
                            }`}
                        >
                          {item.filled && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                        </div>
                        <span
                          className={
                            item.filled
                              ? "text-[#03334c] font-medium"
                              : "text-[#94a3b8]"
                          }
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#03334c]/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#5a6b7f]">Progress</span>
                      <span className="text-[#03334c] font-semibold">60%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#03334c] rounded-full transition-all"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Social Proof ─────────────────────────────────────── */}
      <section className="py-12 border-y border-[#03334c]/5 bg-[#fafcfe]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "500+", label: "Ideas Validated" },
              { value: "92%", label: "Accuracy Rate" },
              { value: "< 10min", label: "Time to Report" },
              { value: "5", label: "Expert Reports" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeIn} custom={i}>
                <div className="text-2xl md:text-3xl font-bold text-[#03334c]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#5a6b7f] mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeIn}
              custom={0}
              className="text-sm font-semibold text-[#03334c] uppercase tracking-wider mb-3"
            >
              Why OnEasy
            </motion.p>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="text-3xl md:text-4xl font-bold text-[#03334c] mb-4"
            >
              Everything a CA Tells You — Instantly
            </motion.h2>
            <motion.p
              variants={fadeIn}
              custom={2}
              className="text-[#5a6b7f] max-w-xl mx-auto"
            >
              Our AI consultant asks the right questions, does the research, and
              delivers investor-grade insights — all in a 10-minute
              conversation.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Brain,
                title: "AI Consultant",
                desc: "A skeptical, expert AI that challenges your assumptions and helps you think clearly — like a senior CA partner, but available 24/7.",
                color: "bg-[#03334c]",
              },
              {
                icon: BarChart3,
                title: "Market Intelligence",
                desc: "Automated TAM/SAM/SOM calculations, competitor mapping across global, regional, and local levels — backed by real data.",
                color: "bg-[#0ea5e9]",
              },
              {
                icon: Presentation,
                title: "Pitch-Ready Reports",
                desc: "Five structured outputs: Validation Scorecard, Market Analysis, Competitor Grid, Positioning Statement, and Pitch Deck Content.",
                color: "bg-[#06b6d4]",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                custom={i}
                className="group p-8 rounded-2xl border border-[#03334c]/5 bg-white hover:shadow-xl hover:shadow-[#03334c]/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#03334c] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#5a6b7f] leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#fafcfe]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeIn}
              custom={0}
              className="text-sm font-semibold text-[#03334c] uppercase tracking-wider mb-3"
            >
              Simple Process
            </motion.p>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="text-3xl md:text-4xl font-bold text-[#03334c] mb-4"
            >
              Three Steps. One Conversation.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Tell Your Story",
                desc: "Describe your business idea naturally — no forms, no templates. Just talk to the AI like you'd talk to a mentor.",
              },
              {
                step: "02",
                icon: Target,
                title: "AI Analyzes & Refines",
                desc: "The AI researches your market, maps competitors, challenges your assumptions, and fills in the gaps — all in real-time.",
              },
              {
                step: "03",
                icon: FileText,
                title: "Get Your Reports",
                desc: "Receive 5 investor-grade reports: Validation Scorecard, Market Analysis, Competitor Grid, Positioning, and Pitch Deck Content.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeIn}
                custom={i}
                className="relative"
              >
                <div className="text-6xl font-bold text-[#03334c]/5 mb-4">
                  {step.step}
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#03334c]/5 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-[#03334c]" />
                </div>
                <h3 className="text-lg font-semibold text-[#03334c] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#5a6b7f] leading-relaxed">
                  {step.desc}
                </p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-10 -right-5 w-6 h-6 text-[#03334c]/15" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Outputs Preview ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeIn}
              custom={0}
              className="text-sm font-semibold text-[#03334c] uppercase tracking-wider mb-3"
            >
              What You Get
            </motion.p>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="text-3xl md:text-4xl font-bold text-[#03334c] mb-4"
            >
              Five Reports, One Conversation
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[
              {
                icon: "📊",
                title: "Validation Scorecard",
                desc: "0-100 score with breakdown",
              },
              {
                icon: "🌍",
                title: "Market Analysis",
                desc: "TAM / SAM / SOM with data",
              },
              {
                icon: "⚔️",
                title: "Competitors",
                desc: "Global / Regional / Local grid",
              },
              {
                icon: "🎯",
                title: "Positioning",
                desc: "One-line investor pitch",
              },
              {
                icon: "🎬",
                title: "Pitch Deck",
                desc: "Slide-ready content",
              },
            ].map((output, i) => (
              <motion.div
                key={output.title}
                variants={fadeIn}
                custom={i}
                className="p-5 rounded-xl border border-[#03334c]/5 bg-white text-center hover:shadow-lg hover:shadow-[#03334c]/5 transition-all duration-200"
              >
                <div className="text-3xl mb-3">{output.icon}</div>
                <h4 className="text-sm font-semibold text-[#03334c] mb-1">
                  {output.title}
                </h4>
                <p className="text-xs text-[#5a6b7f]">{output.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeIn}
              custom={0}
              className="text-3xl md:text-5xl font-bold text-[#03334c] mb-6"
            >
              Ready to Validate
              <br />
              Your Business Idea?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              custom={1}
              className="text-lg text-[#5a6b7f] mb-10 max-w-xl mx-auto"
            >
              Stop guessing. Start a conversation with your AI consultant and
              get clarity on your idea in under 10 minutes.
            </motion.p>
            <motion.div variants={fadeIn} custom={2}>
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-[#03334c] hover:bg-[#03334c]/90 text-white rounded-full px-10 py-6 text-lg group cursor-pointer"
                >
                  Start Free Validation
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[#03334c]/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#03334c] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#03334c]">
              OnEasy.AI
            </span>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © {new Date().getFullYear()} OnEasy. AI-Powered Business
            Validation.
          </p>
        </div>
      </footer>
    </main>
  );
}
