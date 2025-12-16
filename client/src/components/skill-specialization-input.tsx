import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const DEFAULT_SKILL_SUGGESTIONS: string[] = [
  // Common NSRP “Other Skills”
  "Auto Mechanic",
  "Beautician",
  "Carpentry Work",
  "Computer Literate",
  "Domestic Chores",
  "Driver",
  "Electrician",
  "Embroidery",
  "Gardening",
  "Masonry",
  "Painter/Artist",
  "Painting Jobs",
  "Photography",
  "Plumbing",
  "Sewing Dresses",
  "Stenography",
  "Tailoring",

  // IT / Software
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express.js",
  "Next.js",
  "Vue.js",
  "Angular",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Bootstrap",
  "REST API",
  "GraphQL",
  "SQL",
  "SQLite",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Firebase",
  "Git",
  "GitHub",
  "Docker",
  "Linux",
  "CI/CD",
  "Testing",
  "Jest",
  "Playwright",
  "Cybersecurity",
  "Networking",
  "Technical Support",
  "System Administration",
  "Data Analysis",
  "Microsoft Excel",
  "Power BI",
  "Python",
  "Java",
  "C#",
  "PHP",

  // Creative / Design
  "Graphic Design",
  "UI/UX Design",
  "Video Editing",
  "Photography",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Canva",

  // Customer service / BPO
  "Call Center",
  "Customer Support",
  "Chat Support",
  "Email Support",
  "Technical Support (BPO)",
  "Inbound Calls",
  "Outbound Calls",
  "Appointment Setting",

  // Retail
  "Cashiering",
  "Sales Associate",
  "Merchandising",
  "Inventory",
  "Store Operations",
  "POS System",

  // Office / Admin
  "Administrative Support",
  "Office Management",
  "Documentation",
  "Data Entry",
  "Records Management",
  "Front Desk",
  "Customer Service",
  "Email Management",
  "Calendar Management",
  "Report Writing",
  "Presentation Skills",
  "Microsoft Word",
  "Microsoft PowerPoint",
  "Google Workspace",

  // Accounting / Finance
  "Accounting",
  "Bookkeeping",
  "Payroll",
  "Accounts Payable",
  "Accounts Receivable",
  "Financial Reporting",
  "Budgeting",
  "Tax Preparation",
  "Auditing",
  "QuickBooks",

  // Sales / Marketing
  "Sales",
  "Lead Generation",
  "Business Development",
  "Negotiation",
  "Digital Marketing",
  "Social Media Marketing",
  "Content Writing",
  "Copywriting",
  "SEO",
  "Brand Management",
  "Customer Relationship Management (CRM)",

  // Project / Product
  "Project Management",
  "Product Management",
  "Scrum",
  "Agile",
  "Kanban",

  // HR
  "Human Resources",
  "Recruitment",
  "Onboarding",
  "Employee Relations",
  "Training & Development",
  "Performance Management",

  // Operations / Logistics
  "Operations Management",
  "Inventory Management",
  "Warehouse Operations",
  "Logistics",
  "Procurement",
  "Supply Chain",
  "Quality Assurance",

  // Manufacturing
  "Production",
  "Assembly Line",
  "Machine Operator",
  "Forklift Operation",
  "Maintenance",
  "Safety Compliance",

  // Hospitality / Service
  "Food & Beverage Service",
  "Barista",
  "Bartending",
  "Kitchen Operations",
  "Cook",
  "Kitchen Helper",
  "Dishwashing",
  "Housekeeping",
  "Front Office",
  "Event Coordination",

  // Tourism / Travel
  "Tour Guiding",
  "Travel Coordination",
  "Reservations",

  // Healthcare
  "Nursing",
  "Caregiving",
  "Medical Assistance",
  "Pharmacy Assistance",
  "First Aid",

  // Education
  "Teaching",
  "Lesson Planning",
  "Classroom Management",
  "Tutoring",

  // Agriculture / Fisheries
  "Farm Work",
  "Crop Production",
  "Animal Husbandry",
  "Aquaculture",
  "Fishing",

  // Construction / Technical trades
  "Carpentry",
  "Masonry",
  "Plumbing",
  "Electrical Installation",
  "Welding",
  "HVAC",
  "Painting",
  "Machine Operation",
  "Auto Mechanic",
  "Motorcycle Mechanics",
  "Driving",

  // Security
  "Security Guard",
  "CCTV Monitoring",
  "Incident Reporting",

  // Soft skills
  "Communication",
  "Teamwork",
  "Leadership",
  "Time Management",
  "Problem Solving",
  "Critical Thinking",
  "Attention to Detail",
  "Adaptability",
  "Multitasking",
];

function normalizeToken(token: string) {
  return token.trim().replace(/\s+/g, " ");
}

function parseTokens(value: string) {
  return value
    .split(",")
    .map(normalizeToken)
    .filter(Boolean);
}

function joinTokens(tokens: string[]) {
  return tokens.join(", ");
}

export function SkillSpecializationInput(props: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
  persistKey?: string;
  "aria-invalid"?: boolean;
}) {
  const { value, onChange, placeholder, disabled, className, suggestions, persistKey = "skills:suggestions:v1", ...rest } = props;
  const initialTokens = useMemo(() => parseTokens(value ?? ""), [value]);

  const [tokens, setTokens] = useState<string[]>(initialTokens);
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const persistedSuggestions = useMemo(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (!raw) return [] as string[];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as string[];
      return parsed.map((s) => normalizeToken(String(s))).filter(Boolean);
    } catch {
      return [] as string[];
    }
  }, [persistKey]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/skills/suggestions?limit=500", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as unknown;
        if (!Array.isArray(data)) return;
        const list = data.map((s) => normalizeToken(String(s))).filter(Boolean);
        if (!cancelled) setRemoteSuggestions(list);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Sync local token state when parent value changes (e.g., editing an existing job).
    const next = parseTokens(value ?? "");
    const same = next.length === tokens.length && next.every((t, i) => t === tokens[i]);
    if (!same) setTokens(next);
  }, [tokens, value]);

  const allSuggestions = useMemo(() => {
    const base = (suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SKILL_SUGGESTIONS)
      .map(normalizeToken)
      .filter(Boolean);
    const list = [...base, ...remoteSuggestions, ...persistedSuggestions].map(normalizeToken).filter(Boolean);
    return Array.from(new Set(list));
  }, [persistedSuggestions, remoteSuggestions, suggestions]);

  const filteredSuggestions = useMemo(() => {
    const q = normalizeToken(query).toLowerCase();
    if (!q) return [];

    const selected = new Set(tokens.map((t) => t.toLowerCase()));

    const ranked = allSuggestions
      .filter((s) => !selected.has(s.toLowerCase()))
      .map((s) => {
        const lower = s.toLowerCase();
        const starts = lower.startsWith(q);
        const includes = lower.includes(q);
        return { s, score: starts ? 0 : includes ? 1 : 2 };
      })
      .filter((x) => x.score !== 2)
      .sort((a, b) => a.score - b.score || a.s.localeCompare(b.s));

    return ranked.slice(0, 12).map((r) => r.s);
  }, [allSuggestions, query, tokens]);

  const commitTokens = (nextTokens: string[]) => {
    setTokens(nextTokens);
    onChange(joinTokens(nextTokens));
  };

  const addToken = (raw: string) => {
    const nextToken = normalizeToken(raw);
    if (!nextToken) return;

    const existingLower = new Set(tokens.map((t) => t.toLowerCase()));
    if (existingLower.has(nextToken.toLowerCase())) {
      setQuery("");
      setOpen(false);
      return;
    }

    const nextTokens = [...tokens, nextToken];
    commitTokens(nextTokens);

    // Learn new skills automatically: persist custom entries so they appear in future suggestions.
    try {
      const normalized = normalizeToken(nextToken);
      const existing = new Set(allSuggestions.map((s) => s.toLowerCase()));
      if (!existing.has(normalized.toLowerCase())) {
        const updated = Array.from(new Set([...persistedSuggestions, normalized])).sort((a, b) => a.localeCompare(b));
        localStorage.setItem(persistKey, JSON.stringify(updated));
      }
    } catch {
      // ignore storage failures
    }

    // Also persist to shared server catalog (cross-device). Fire-and-forget.
    try {
      fetch("/api/skills/suggestions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextToken }),
      }).catch(() => undefined);
      setRemoteSuggestions((prev) => {
        const normalized = nextToken.toLowerCase();
        if (prev.some((s) => s.toLowerCase() === normalized)) return prev;
        return [...prev, nextToken];
      });
    } catch {
      // ignore
    }

    setQuery("");
    setOpen(false);

    // Keep focus so user can keep adding more.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const removeToken = (tokenToRemove: string) => {
    const nextTokens = tokens.filter((t) => t !== tokenToRemove);
    commitTokens(nextTokens);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      const typed = normalizeToken(query);
      if (typed) {
        e.preventDefault();
        addToken(typed);
      }
      return;
    }

    if (e.key === "Backspace" && !query && tokens.length > 0) {
      // Remove last token for quick editing.
      e.preventDefault();
      removeToken(tokens[tokens.length - 1]);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (event.target instanceof Node && el.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      {tokens.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tokens.map((token) => (
            <Badge key={token} variant="secondary" className="gap-1">
              <span>{token}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeToken(token)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          {...rest}
          ref={(node) => {
            inputRef.current = node;
          }}
          value={query}
          disabled={disabled}
          placeholder={placeholder ?? "Type a skill and press Enter"}
          onFocus={() => {
            if (normalizeToken(query)) setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(Boolean(normalizeToken(e.target.value)));
          }}
          onKeyDown={onKeyDown}
        />

        {open && filteredSuggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md"
            onMouseDown={(e) => {
              // Keep focus on the input when clicking a suggestion.
              e.preventDefault();
            }}
          >
            <Command>
              <CommandList className="max-h-64">
                <CommandEmpty>No matches.</CommandEmpty>
                {filteredSuggestions.map((s) => (
                  <CommandItem key={s} value={s} onSelect={() => addToken(s)}>
                    {s}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
}
