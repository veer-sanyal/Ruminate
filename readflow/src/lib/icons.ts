/**
 * ReadFlow — Icon Configuration
 *
 * Central re-export of Lucide React icons with consistent defaults.
 * All icons: 20px, strokeWidth 1.5.
 */
export {
  BookOpen,
  PenLine,
  BarChart3,
  Settings,
  Upload,
  Play,
  Pause,
  RotateCcw,
  MessageCircleQuestion,
  Gauge,
  Headphones,
  Eye,
  Sparkles,
  Link2,
  ArrowLeft,
  X,
  Trash2,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Moon,
  Sun,
  User,
  LogOut,
  Loader2,
  FileText,
  Mic,
  MicOff,
  GripVertical,
} from "lucide-react";

/** Default icon props for consistency */
export const ICON_DEFAULTS = {
  size: 20,
  strokeWidth: 1.5,
} as const;

/** Compact icon props */
export const ICON_COMPACT = {
  size: 16,
  strokeWidth: 1.5,
} as const;

/** Emphasis icon props */
export const ICON_EMPHASIS = {
  size: 24,
  strokeWidth: 1.5,
} as const;
