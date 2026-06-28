import { useState } from "react";
import { format, parseISO, startOfDay } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (iso: string | null) => void;
  className?: string;
  size?: "sm" | "default";
  placeholder?: string;
  showClear?: boolean;
};

export function TargetDatePicker({
  value,
  onChange,
  className,
  size = "default",
  placeholder = "Set Target Date",
  showClear = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  const today = startOfDay(new Date());

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size={size}
            variant={value ? "outline" : "default"}
            className={cn(
              "press justify-start gap-2 font-medium",
              value
                ? "bg-card/60 border-primary/40 text-foreground hover:bg-primary/10"
                : "bg-primary text-primary-foreground hover:bg-primary",
            )}
          >
            <CalendarDays className="w-4 h-4" />
            {selected ? `Target: ${format(selected, "MMM d, yyyy")}` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto p-0 glass glow-soft border-primary/30"
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? today}
            onSelect={(d) => {
              if (!d) return;
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }}
            disabled={{ before: today }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Clear target date"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
