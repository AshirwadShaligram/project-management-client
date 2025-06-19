import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowUp, ArrowDown, Minus } from "lucide-react";

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: ArrowDown,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Minus,
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: ArrowUp,
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
};

export default function PriorityBadge({ priority, showIcon = true }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.color)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
