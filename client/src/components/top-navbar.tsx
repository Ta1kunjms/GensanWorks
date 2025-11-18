import { Search, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
      <div className="flex h-[72px] items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-2" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                <span className="text-primary">Gensan</span>
                <span className="text-destructive">Works</span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Job Assistance Platform of PESO – General Santos City
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground hidden lg:block" data-testid="page-title">
          Dashboard Overview
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applicants, employers, job posts..."
              className="pl-9 w-[300px] lg:w-[350px] h-10 bg-background"
              data-testid="input-search"
            />
          </div>

          <Button
            variant="outline"
            size="default"
            className="gap-2 hidden sm:flex"
            data-testid="button-new-job-post"
          >
            <Plus className="h-4 w-4" />
            New Job Post
          </Button>

          <Button
            variant="outline"
            size="default"
            className="gap-2 hidden sm:flex"
            data-testid="button-add-applicant"
          >
            <Plus className="h-4 w-4" />
            Add Applicant
          </Button>

          <Button
            size="default"
            className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
            data-testid="button-generate-report"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
    </header>
  );
}
