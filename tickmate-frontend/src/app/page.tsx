"use client";

import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Gauge,
  Lock,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Ticket Analysis",
    description:
      "OpenAI extracts intent, priority, and category from every ticket so nothing slips through the cracks.",
    accent: "from-primary to-accent",
    span: true,
  },
  {
    icon: Search,
    title: "Smart Similarity Search",
    description:
      "Vector embeddings surface resolved lookalikes instantly, giving users answers before they even file.",
    accent: "from-accent to-secondary",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "User, moderator, and admin roles with granular permissions and a full audit trail.",
    accent: "from-primary to-secondary",
  },
  {
    icon: Mail,
    title: "Email Workflows",
    description:
      "Magic-link verification and password reset delivered via Resend — automatic and reliable.",
    accent: "from-secondary to-accent",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description:
      "JWT sessions in HttpOnly cookies, rate limiting, and constant-time token handling out of the box.",
    accent: "from-accent to-primary",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "A live admin dashboard with token usage, response times, and system health at a glance.",
    accent: "from-secondary to-primary",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Create a ticket",
    description: "Drop in a title, description, and category in seconds.",
  },
  {
    number: "02",
    title: "AI analyzes instantly",
    description:
      "OpenAI extracts intent and flags duplicate or similar issues.",
  },
  {
    number: "03",
    title: "See similar solutions",
    description: "Resolved lookalikes appear before you hit submit.",
  },
  {
    number: "04",
    title: "Track & resolve",
    description: "Moderators reply, update status, and mark work complete.",
  },
];

const techStack = [
  "Node.js + Express",
  "PostgreSQL + Drizzle",
  "OpenAI GPT-4",
  "Qdrant Vector DB",
  "Inngest",
  "Resend",
  "Next.js 15",
  "TypeScript",
];

const mockTickets = [
  {
    id: "TKT-1042",
    title: "Cannot authenticate with Google OAuth",
    status: "In Progress",
    statusClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    priority: "High",
    priorityClass:
      "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    assignee: "AR",
    assigneeClass: "gradient-ai",
  },
  {
    id: "TKT-1039",
    title: "Billing dashboard shows stale totals",
    status: "Pending",
    statusClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    priority: "Medium",
    priorityClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    assignee: "MK",
    assigneeClass: "bg-accent",
  },
  {
    id: "TKT-1028",
    title: "Export CSV fails for >10k rows",
    status: "Resolved",
    statusClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    priority: "Low",
    priorityClass:
      "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
    assignee: "LS",
    assigneeClass: "bg-secondary",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-gradient-ai/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gradient-ai">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes gradient-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shine {
          0% { left: -30%; opacity: 0; }
          15% { opacity: 1; }
          55%, 100% { left: 115%; opacity: 0; }
        }
        @property --spin-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spin-angle {
          to { --spin-angle: 360deg; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-drift { animation: drift 16s ease-in-out infinite; }
        .animate-fade-up { animation: fade-up 0.8s ease-out both; }
        .animate-shine { animation: shine 3s ease-in-out infinite; }
        .animate-border-spin { animation: spin-angle 7s linear infinite; }
        .gradient-animated {
          background-image: linear-gradient(110deg, var(--primary), var(--secondary), var(--accent), var(--primary));
          background-size: 220% 100%;
          animation: gradient-pan 8s ease infinite;
        }
        .card-spotlight::before {
          pointer-events: none;
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s ease;
          background: radial-gradient(500px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklch, var(--primary) 12%, transparent), transparent 45%);
        }
        .card-spotlight:hover::before { opacity: 1; }
        .bg-grid {
          background-image:
            linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%);
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Animated aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-gradient-to-b from-primary/[0.08] via-accent/[0.05] to-transparent" />
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute left-1/2 top-32 h-[28rem] w-[48rem] max-w-[92vw] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-2xl" />
        <div className="absolute left-1/2 top-40 h-72 w-[42rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/20 via-accent/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-secondary opacity-25 blur-3xl animate-float" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-accent opacity-25 blur-3xl animate-float" />
        <div className="absolute -top-1/4 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-ai opacity-20 blur-3xl animate-drift" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl gradient-ai shadow-lg shadow-primary/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="absolute -inset-0.5 rounded-xl gradient-ai opacity-0 blur transition-opacity duration-300 group-hover:opacity-60" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient-ai">
              TickMate
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#technology"
              className="transition-colors hover:text-foreground"
            >
              Technology
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="ai-button">
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-ai/10 px-4 py-1.5 text-xs font-semibold text-gradient-ai shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              AI-Powered Ticket Management
            </span>
          </div>

          <h1
            className="mt-5 text-balance animate-fade-up text-5xl font-bold leading-[1.02] tracking-tighter drop-shadow-sm sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.08s" }}
          >
            Support tickets that{" "}
            <span className="gradient-animated bg-clip-text text-transparent">
              resolve themselves
            </span>
          </h1>

          <p
            className="mx-auto mt-4 max-w-2xl text-pretty animate-fade-up text-lg text-muted-foreground sm:text-xl"
            style={{ animationDelay: "0.16s" }}
          >
            TickMate reads every ticket with AI, surfaces resolved solutions in
            real time, and gives your team one calm place to collaborate — so
            issues close faster.
          </p>

          <div
            className="mt-7 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.24s" }}
          >
            <Button
              asChild
              size="lg"
              className="ai-button group/cta h-12 w-full overflow-hidden px-7 text-base font-semibold transition-transform hover:scale-[1.03] sm:w-auto"
            >
              <Link href="/auth/signup" className="relative">
                <span className="pointer-events-none absolute inset-0">
                  <span className="absolute left-0 top-0 h-full w-1/4 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </span>
                Start resolving free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full border-primary/30 px-7 text-base sm:w-auto"
            >
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          <div
            className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            style={{ animationDelay: "0.32s" }}
          >
            {["No credit card", "Free to start", "Under 2 min setup"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Product mockup */}
        <div
          className="relative mx-auto mt-12 max-w-5xl animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="absolute -inset-x-8 -top-8 bottom-10 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 opacity-60 blur-3xl" />
          <div
            className="pointer-events-none absolute -inset-1 rounded-[1.15rem] opacity-70 blur-md animate-border-spin"
            style={{
              background:
                "conic-gradient(from var(--spin-angle), var(--primary), var(--secondary), var(--accent), var(--primary))",
            }}
          />

          <div className="relative rounded-2xl border border-muted bg-card/80 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl dark:bg-card/60">
            <div className="flex items-center gap-2 px-3 pb-2 pt-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <div className="ml-4 flex-1 rounded-md border border-muted bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                app.tickmate.dev/tickets
              </div>
            </div>

            <div className="grid gap-3 rounded-xl bg-background p-3 sm:grid-cols-[1.6fr_1fr] sm:p-4">
              {/* Ticket list */}
              <div className="rounded-xl border border-muted bg-card/60 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Open tickets
                  </p>
                  <span className="rounded-full bg-gradient-ai/10 px-2.5 py-0.5 text-xs font-semibold text-gradient-ai">
                    24 active
                  </span>
                </div>
                <div className="space-y-2.5">
                  {mockTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group rounded-lg border border-muted bg-background/60 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {ticket.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {ticket.id} · submitted 2h ago
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ticket.statusClass}`}
                        >
                          {ticket.status}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ticket.priorityClass}`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`ml-auto flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${ticket.assigneeClass}`}
                        >
                          {ticket.assignee}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI analysis panel */}
              <div className="hidden flex-col gap-3 sm:flex">
                <div className="rounded-xl border border-muted bg-card/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-ai shadow-md shadow-primary/25">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">AI Analysis</p>
                      <p className="text-[11px] text-muted-foreground">
                        GPT-4 · real-time
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: "Intent detected", value: 98 },
                      { label: "Category match", value: 94 },
                      { label: "Similar resolved", value: 91 },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="font-semibold">{row.value}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full gradient-ai"
                            style={{ width: `${row.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
                  <div
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent to-emerald-500/10 animate-shimmer"
                    style={{ animation: "shimmer 2.8s ease infinite" }}
                  />
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-xs font-semibold">
                      3 similar tickets found
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    TKT-1009 was resolved last week with the same root cause.
                  </p>
                </div>

                <div className="mt-auto rounded-xl border border-muted bg-card/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Avg. resolution
                      </p>
                      <p className="text-lg font-bold">4.2h</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        User satisfaction
                      </p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        98%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <div className="absolute -left-10 top-1/3 hidden animate-float lg:block">
            <div
              className="pointer-events-none absolute -inset-0.5 rounded-xl opacity-70 blur-[3px] animate-border-spin"
              style={{
                background:
                  "conic-gradient(from var(--spin-angle), var(--primary), var(--secondary), var(--accent), var(--primary))",
              }}
            />
            <div className="relative flex items-center gap-2.5 rounded-xl border border-muted bg-card/90 px-4 py-3 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Ticket resolved</p>
                <p className="text-[11px] text-muted-foreground">just now</p>
              </div>
            </div>
          </div>
          <div
            className="absolute -right-10 top-1/4 hidden animate-float lg:block"
            style={{ animationDelay: "1.2s" }}
          >
            <div
              className="pointer-events-none absolute -inset-0.5 rounded-xl opacity-70 blur-[3px] animate-border-spin"
              style={{
                background:
                  "conic-gradient(from var(--spin-angle), var(--primary), var(--secondary), var(--accent), var(--primary))",
              }}
            />
            <div className="relative flex items-center gap-2.5 rounded-xl border border-muted bg-card/90 px-4 py-3 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-ai text-white shadow-md shadow-primary/30">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Resolution rate</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  ↑ 32% this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics band */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-muted bg-card/50 p-8 backdrop-blur sm:grid-cols-3">
          {[
            { value: "50%", label: "Faster average resolution", icon: Gauge },
            {
              value: "90%",
              label: "Similar tickets found instantly",
              icon: Search,
            },
            {
              value: "100%",
              label: "Encrypted & role-protected",
              icon: ShieldCheck,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group flex flex-col items-center gap-3 text-center p-6 rounded-2xl transition-all ${i > 0 ? "border-l border-border sm:border-l" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-ai/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-4xl font-bold text-gradient-ai">
                  {stat.value}
                </p>
                <p className="max-w-[14rem] text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>Features</SectionEyebrow>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Everything support wishes it had
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            A modern stack that handles the busywork while your team focuses on
            the people.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`card-spotlight group relative overflow-hidden rounded-2xl border border-muted bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 ${feature.span ? "md:col-span-2 lg:col-span-1 lg:row-span-1" : ""}`}
              >
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative scroll-mt-20 border-y border-white/5 bg-background/40 py-8"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Workflow</SectionEyebrow>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              From report to resolved, effortlessly
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              A workflow designed to get people unstuck with as little friction
              as possible.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={step.number} className="group relative">
                <div className="relative h-full rounded-2xl border border-muted bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full badge-gradient font-mono text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                    {step.number}
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-10 hidden h-px w-8 bg-gradient-to-r from-primary to-secondary lg:block">
                    <ArrowRight className="absolute -right-1 -top-[9px] h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack marquee */}
      <section id="technology" className="relative scroll-mt-20 py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionEyebrow>Built on</SectionEyebrow>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            A modern, boring-safe stack
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Type-safe end to end, event-driven behind the scenes, built to
            scale.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="marquee-track flex w-max animate-[marquee_28s_linear_infinite] gap-4">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: duplicated marquee list needs unique per-copy keys
                key={`${tech}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-muted bg-card/60 px-5 py-2.5 text-sm font-medium text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-ai" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-secondary/25" />
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary opacity-20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary opacity-20 blur-3xl" />
          </div>

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-ai shadow-xl shadow-primary/30">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to stop chasing tickets?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Let AI sort, suggest, and speed things up. Your first resolved
              ticket is minutes away.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="ai-button h-12 w-full px-8 text-base font-semibold transition-transform hover:scale-[1.03] sm:w-auto"
              >
                <Link href="/auth/signup">
                  Create your free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 w-full border-white/25 px-8 text-base hover:bg-white/5 sm:w-auto"
              >
                <Link href="/auth/signin">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Free forever for small teams. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-ai">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-gradient-ai">TickMate</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Smart ticket management powered by AI. ©{" "}
              {new Date().getFullYear()} TickMate.
            </p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <a
                href="#features"
                className="transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-foreground"
              >
                Workflow
              </a>
              <a
                href="/auth/signin"
                className="transition-colors hover:text-foreground"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
