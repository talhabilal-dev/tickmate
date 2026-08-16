"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  Zap,
  Users,
  Search,
  Lock,
  Mail,
  BarChart3,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Shield,
  Workflow,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  const benefits = [
    { title: "50% Faster", subtitle: "Resolution with AI suggestions" },
    { title: "90% Similar", subtitle: "Tickets found instantly" },
    { title: "100% Secure", subtitle: "Enterprise-grade encryption" },
  ];
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Ticket Analysis",
      description:
        "Automatically analyze tickets with OpenAI to extract insights and categorize issues intelligently",
    },
    {
      icon: Search,
      title: "Smart Similarity Search",
      description:
        "Find similar resolved tickets using vector embeddings to help users find solutions faster",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Support user, moderator, and admin roles with granular permissions and audit logging",
    },
    {
      icon: Mail,
      title: "Email Workflows",
      description:
        "Automated email verification and password reset with magic links via Resend",
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      description:
        "JWT-based auth with HttpOnly cookies and comprehensive session management",
    },
    {
      icon: BarChart3,
      title: "Dashboard & Analytics",
      description:
        "Real-time statistics and comprehensive admin dashboard for system monitoring",
    },
  ];

  const techStack = [
    { name: "Node.js + Express", desc: "Fast, scalable backend" },
    { name: "PostgreSQL + Drizzle", desc: "Type-safe database layer" },
    { name: "OpenAI GPT-4", desc: "Intelligent analysis" },
    { name: "Qdrant Vector DB", desc: "Similarity search" },
    { name: "Inngest", desc: "Async workflows" },
    { name: "Resend", desc: "Email delivery" },
  ];

  const howItWorks = [
    {
      number: "1",
      title: "Create Ticket",
      description:
        "Users submit a ticket with title, description, and category",
    },
    {
      number: "2",
      title: "AI Analysis",
      description:
        "System analyzes and finds similar resolved tickets automatically",
    },
    {
      number: "3",
      title: "Show Suggestions",
      description: "User sees similar solutions before creating the ticket",
    },
    {
      number: "4",
      title: "Track & Collaborate",
      description: "Moderators and admins can reply and update ticket status",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Animated gradient orbs with floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
        }
      `}</style>

      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-ai opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none animate-float"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-ai-reverse opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none animate-float-delayed"></div>
      <div className="fixed top-1/3 left-1/4 w-64 h-64 bg-secondary opacity-5 blur-3xl rounded-full pointer-events-none animate-pulse-slow"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b py-2 border-primary/10 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-ai"></div>
            <h2 className="text-xl font-bold text-gradient-ai">TickMate</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-primary/30"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="ai-button">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div
            className="inline-block px-4 py-2 rounded-full bg-gradient-ai/10 border border-primary/20 mb-6 animate-slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-sm font-semibold text-gradient-ai flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4" />
              AI-Powered Ticket Management
            </span>
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Smart Ticket Management
            <br />
            <span className="text-gradient-ai">Powered by AI</span>
          </h1>
          <p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Create, manage, and resolve tickets with intelligent AI analysis.
            Find similar solutions instantly and collaborate seamlessly with
            your team. Powered by OpenAI and vector embeddings.
          </p>
          <div
            className="flex gap-4 justify-center flex-wrap animate-slide-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              asChild
              size="lg"
              className="ai-button font-semibold text-base hover:scale-105 transition-transform"
            >
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/30 transition-colors"
            >
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>

        {/* Benefits Section */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-lg border border-primary/10 backdrop-blur hover:border-primary/30 transition-colors group"
            >
              <p className="text-3xl font-bold text-gradient-ai mb-2 group-hover:scale-110 transition-transform">
                {benefit.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {benefit.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { label: "Real-time Analysis", value: "AI-Powered", icon: Zap },
            { label: "Vector Search", value: "Qdrant DB", icon: Search },
            { label: "Email Workflows", value: "Automated", icon: Mail },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card
                key={i}
                className="border-primary/10 bg-linear-to-br from-card/50 to-card/30 backdrop-blur hover:border-primary/30 transition-all group animate-slide-in-up"
                style={{ animationDelay: `${0.6 + i * 0.1}s` }}
              >
                <CardContent className="">
                  <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gradient-ai">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 "
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-up">
            Powerful Features
          </h2>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Everything you need to manage tickets efficiently and collaborate
            with your team. Powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                className="border-primary/10 hover:border-primary/30 transition-all group hover:shadow-lg hover:-translate-y-1 animate-slide-in-up"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-ai flex items-center justify-center mb-4 group-hover:scale-125 transition-transform group-hover:shadow-lg group-hover:shadow-primary/50">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="group-hover:text-gradient-ai transition-all">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-up">
            How TickMate Works
          </h2>
          <p
            className="text-lg text-muted-foreground animate-slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Simple workflow designed for maximum efficiency and collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, i) => (
            <div
              key={i}
              className="relative animate-slide-in-up"
              style={{ animationDelay: `${0.15 + i * 0.1}s` }}
            >
              <Card className="border-primary/10 h-full hover:border-primary/30 transition-all group hover:shadow-lg">
                <CardContent className="">
                  <div className="w-12 h-12 rounded-full gradient-ai flex items-center justify-center mb-4 text-lg font-bold text-primary-foreground group-hover:scale-125 transition-transform group-hover:shadow-lg group-hover:shadow-primary/50">
                    {step.number}
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-gradient-ai transition-all">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              {i < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-linear-to-r from-primary to-secondary transform -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-up">
            Built with Modern Tech
          </h2>
          <p
            className="text-lg text-muted-foreground animate-slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Enterprise-grade technology for reliability, performance, and
            scalability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech, i) => (
            <Card
              key={i}
              className="border-primary/10 bg-linear-to-br from-card/50 to-card/30 backdrop-blur hover:border-primary/30 transition-all group hover:shadow-lg hover:-translate-y-1 animate-slide-in-up"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-125 transition-transform group-hover:text-gradient-ai" />
                  <div>
                    <h4 className="font-bold group-hover:text-gradient-ai transition-all">
                      {tech.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{tech.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border-primary/20 shadow-2xl ai-glow bg-linear-to-br from-primary/10 via-accent/5 to-secondary/10 hover:shadow-3xl transition-shadow animate-slide-in-up">
          <CardContent className="pt-16 pb-16 text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-ai">
              Ready to transform your ticket management?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join teams using TickMate to manage tickets smarter with
              AI-powered insights, instant similar ticket suggestions, and
              seamless collaboration. Start free today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                asChild
                size="lg"
                className="ai-button font-semibold hover:scale-105 transition-transform"
              >
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Link href="/auth/signin">Sign In to Existing Account</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-8">
              No credit card required. Access immediately after signup.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/10 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="border-t border-primary/10 pt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              Smart ticket management powered by AI. © {new Date().getFullYear()} TickMate.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy  
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
