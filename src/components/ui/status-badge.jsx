import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Circle, Clock, CheckCircle } from "lucide-react";

const statusConfig = {
  todo: {
    label: "To Do",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Circle,
  },
  inprogress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  done: {
    label: "Done",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
};

export default function StatusBadge({ status, showIcon = true }) {
  const config = statusConfig[status];
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
