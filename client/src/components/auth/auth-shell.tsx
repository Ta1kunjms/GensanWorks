import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  roleLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  sideContent?: React.ReactNode;
  formVariant?: "card" | "plain";
  layout?: "split" | "centered";
  nav?: {
    loginHref: string;
    joinHref: string;
    homeHref?: string;
    aboutHref?: string;
    portals?: Array<{ id: "jobseeker" | "employer" | "admin"; label: string; href: string }>;
    activePortalId?: "jobseeker" | "employer" | "admin";
  };
  className?: string;
};

export function AuthShell({
  title,
  subtitle,
  roleLabel,
  children,
  footer,
  sideContent,
  formVariant = "card",
  layout = "split",
  nav,
  className,
}: AuthShellProps) {
  const homeHref = nav?.homeHref ?? "/";
  const aboutHref = nav?.aboutHref ?? "/about";

  const isJobseeker = nav?.activePortalId === "jobseeker" || roleLabel.toLowerCase().includes("jobseeker");
  const isEmployer = nav?.activePortalId === "employer" || roleLabel.toLowerCase().includes("employer");
  const isAdmin = nav?.activePortalId === "admin" || roleLabel.toLowerCase().includes("admin");
  const isSignupView = /create|sign\s*up|signup|request/i.test(title);
  const heroTitle = isEmployer
    ? "Hire with clarity."
    : isJobseeker
      ? "Find work with confidence."
      : isAdmin
        ? "Manage with control."
      : "Connect with confidence.";
  const heroSubtitle = isEmployer
    ? "Post vacancies, review applicants, and track referrals through the official PESO platform."
    : isJobseeker
      ? "Browse verified opportunities, track applications, and get supported by PESO services."
      : isAdmin
        ? "Review data, manage postings, and oversee platform activity in one place."
      : "Official PESO platform for job matching and referrals.";
  const heroBullets = isEmployer
    ? [
        "Verified employer access and posting tools",
        "Streamlined applicant review and tracking",
        "PESO-aligned referrals and reporting",
      ]
    : isJobseeker
      ? [
          "Verified employers and job postings",
          "Application tracking and updates",
          "Support through PESO services",
        ]
      : isAdmin
        ? [
            "Centralized oversight and reporting",
            "Faster reviews and approvals",
            "Cleaner audit visibility",
          ]
        : [
            "Verified employers and job postings",
            "Application tracking and updates",
            "Support through PESO services",
          ];

  return (
    <div
      className={cn(
        "h-[100svh] w-full flex-1 overflow-hidden bg-gradient-to-br from-background via-muted/40 to-accent/60 text-foreground",
        className,
      )}
    >
      <div className="relative flex h-full w-full flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(800px_circle_at_85%_25%,hsl(var(--accent)/0.55),transparent_60%)]"
        />

        {nav ? (
          <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-5">
                <a href={homeHref} className="flex items-center gap-3 cursor-pointer group">
                  <img
                    src="/peso-gsc-logo.png"
                    alt="PESO GSC"
                    className="h-11 w-11 transition-transform group-hover:scale-105 duration-200"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg text-slate-900 tracking-tight">GensanWorks</span>
                    <span className="text-xs text-slate-500">Public Employment Service Office</span>
                  </div>
                </a>

                <nav className="hidden lg:flex items-center gap-1">
                  <a
                    href={homeHref}
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    Home
                  </a>
                  <a
                    href="/#services"
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    Services
                  </a>
                  <a
                    href="/#how-it-works"
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    How It Works
                  </a>
                  <a
                    href={aboutHref}
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    About
                  </a>
                  <a
                    href="/contact"
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    Contact
                  </a>

                  <div className="flex items-center gap-2 ml-6 pl-6 border-l border-slate-200">
                    {isJobseeker || isEmployer ? (
                      <div className="inline-flex rounded-full border border-slate-200 bg-white/95 p-1 shadow-lg">
                        <a href={isSignupView ? "/jobseeker/signup" : "/jobseeker/login"}>
                          <Button
                            type="button"
                            className={cn(
                              "h-10 px-7 text-sm font-semibold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                              isJobseeker
                                ? "bg-slate-900 hover:bg-slate-900 text-white shadow-md"
                                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-transparent",
                            )}
                          >
                            Jobseeker
                          </Button>
                        </a>
                        <a href={isSignupView ? "/employer/signup" : "/employer/login"}>
                          <Button
                            type="button"
                            className={cn(
                              "h-10 px-7 text-sm font-semibold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                              isEmployer
                                ? "bg-slate-900 hover:bg-slate-900 text-white shadow-md"
                                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-transparent",
                            )}
                          >
                            Employer
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <>
                        <a href={nav.loginHref}>
                          <Button variant="ghost" className="font-medium text-sm">
                            Login
                          </Button>
                        </a>
                        <a href={nav.joinHref}>
                          <Button className="font-medium text-sm bg-blue-600 hover:bg-blue-700">
                            {isAdmin ? "Request Access" : "Get Started"}
                          </Button>
                        </a>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </header>
        ) : null}

        <div className={cn("relative grid flex-1", layout === "split" ? "lg:grid-cols-2" : "grid-cols-1", nav ? "min-h-0" : "h-full")}>
          {layout === "split" ? (
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border/60 bg-card/30 p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_15%_15%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(700px_circle_at_80%_30%,hsl(var(--accent)/0.60),transparent_60%)]"
              />

              <div className="relative max-w-md space-y-3">
                <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                  {title.toLowerCase().includes("create") ? "JOIN FOR FREE" : "WELCOME BACK"}
                </div>
                <div className="text-5xl font-semibold leading-[1.05] tracking-tight">
                  {heroTitle.replace("confidence", "confidence")} <span className="text-primary">.</span>
                </div>
                <div className="text-muted-foreground">{heroSubtitle}</div>

                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {heroBullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {sideContent ? (
                <div className="relative rounded-2xl border border-border/60 bg-card/25 p-5 backdrop-blur [&_.text-muted-foreground]:text-muted-foreground">
                  {sideContent}
                </div>
              ) : null}

              <div className="relative text-xs text-muted-foreground">Official Job Assistance Platform of PESO – General Santos City</div>
            </div>
          ) : null}

          <div className={cn("relative flex items-center justify-center", layout === "centered" ? "px-6 py-12 sm:px-10" : "p-6 sm:p-10")}>
            {formVariant === "plain" ? (
              <div className="w-full max-w-md">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {title} <span className="text-primary">.</span>
                  </h1>
                  {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
                </div>

                <div className="mt-6 space-y-6">
                  {children}
                  {footer ? <div className="border-t border-border/60 pt-5">{footer}</div> : null}
                </div>
              </div>
            ) : (
              <Card className="w-full max-w-md border-card-border/60 bg-card/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/70">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-3xl tracking-tight">
                    {title} <span className="text-primary">.</span>
                  </CardTitle>
                  {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
                </CardHeader>

                <CardContent className="space-y-6">
                  {children}
                  {footer ? <div className="border-t border-border/60 pt-5">{footer}</div> : null}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
