import * as React from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "success" | "danger" | "warning" | "info";

const toneStyles: Record<AlertTone, { icon: LucideIcon; box: string; iconColor: string }> = {
  success: { icon: CircleCheck, box: "border-success-line bg-success-soft", iconColor: "text-success" },
  danger: { icon: CircleAlert, box: "border-danger-line bg-danger-soft", iconColor: "text-danger" },
  warning: { icon: TriangleAlert, box: "border-warning-line bg-warning-soft", iconColor: "text-warning" },
  info: { icon: Info, box: "border-info-line bg-info-soft", iconColor: "text-info" },
};

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: AlertTone;
  title: React.ReactNode;
  action?: React.ReactNode;
}

/** Inline message. Errors use role="alert"; everything else is a polite status. */
export function Alert({ tone = "info", title, action, children, className, ...props }: AlertProps) {
  const { icon: Icon, box, iconColor } = toneStyles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-card border p-4", box, className)}
      {...props}
    >
      <Icon aria-hidden strokeWidth={2} className={cn("mt-0.5 size-[1.125rem] shrink-0", iconColor)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-small font-semibold text-fg">{title}</p>
        {children && <div className="text-small text-fg-muted">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
