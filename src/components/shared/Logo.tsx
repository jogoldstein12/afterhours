import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Martini Glass Icon on the left */}
      <svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-secondary drop-shadow-[0_0_10px_rgba(242,82,169,0.9)]"
      >
        <path d="M6 3h12l-6 9Z" />
        <path d="M12 12v9" />
        <path d="M7 21h10" />
        <path d="m15 3 1 4" />
        {/* Animated bubble effect */}
        <circle cx="12" cy="7" r="1" fill="currentColor">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Wordmark on the right */}
      <div className="flex flex-col leading-tight">
        <span className="text-2xl md:text-3xl font-headline font-bold text-primary neon-text-primary tracking-tight">
          AFTER HOURS
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-70">
          Party Game
        </span>
      </div>
    </div>
  );
}