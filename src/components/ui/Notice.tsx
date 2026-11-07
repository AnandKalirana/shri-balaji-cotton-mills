import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoticeProps {
  tone?: "info" | "warning" | "success" | "error";
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const tones = {
  info: { box: "bg-[#1a1a1a]/[0.04] text-[#1a1a1a]", Icon: Info },
  warning: { box: "bg-amber-50 text-amber-900", Icon: AlertTriangle },
  success: { box: "bg-emerald-50 text-emerald-900", Icon: CheckCircle2 },
  error: { box: "bg-rose-50 text-rose-900", Icon: AlertTriangle },
};

export function Notice({ tone = "info", children, action, className }: NoticeProps) {
  const { box, Icon } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-2xl px-4 py-3 text-sm", box, className)}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 leading-relaxed">{children}</div>
      {action}
    </div>
  );
}
