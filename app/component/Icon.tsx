"use client";

import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  Monitor,
  Plus,
  PlusCircle,
  Search,
  SquarePen,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "material-symbols:dashboard-outline-rounded": LayoutDashboard,
  "carbon:document-set": FileText,
  "gridicons:create": PlusCircle,
  "fluent-mdl2:document-set": FileText,
  "streamline-ultimate:loading-bold": LoaderCircle,
  "iconamoon:search-light": Search,
  "weui:arrow-filled": ArrowRight,
  "carbon:document": FileText,
  "ic:baseline-plus": Plus,
  "tabler:search": Search,
  "tabler:arrow-left": ArrowLeft,
  "mdi:keyboard-arrow-right": ChevronRight,
  "iconoir:user": UserRound,
  "fa6-solid:computer": Monitor,
  "lucide:square-pen": SquarePen,
};

type IconProps = {
  icon: string;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ icon, className, style }: IconProps) {
  const IconComponent = iconMap[icon] ?? FileText;

  return <IconComponent className={className} style={style} />;
}
