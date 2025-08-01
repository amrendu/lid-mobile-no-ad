import React from 'react';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Feather,
  AntDesign,
  FontAwesome5,
  Entypo
} from '@expo/vector-icons';

export type IconProps = {
  size?: number;
  color?: string;
  style?: any;
};

// Navigation and UI Icons
export const BackIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <Ionicons name="chevron-back" size={size} color={color} style={style} />
);

export const ForwardIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <Ionicons name="chevron-forward" size={size} color={color} style={style} />
);

export const MenuIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="menu" size={size} color={color} style={style} />
);

export const CloseIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Ionicons name="close" size={size} color={color} style={style} />
);

export const SearchIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="search" size={size} color={color} style={style} />
);

export const FilterIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="filter" size={size} color={color} style={style} />
);

export const SettingsIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="settings" size={size} color={color} style={style} />
);

// Learning and Education Icons
export const BookIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <Ionicons name="book" size={size} color={color} style={style} />
);

export const LibraryIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <MaterialIcons name="library-books" size={size} color={color} style={style} />
);

export const QuestionIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <MaterialCommunityIcons name="help-circle" size={size} color={color} style={style} />
);

export const TestIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <MaterialCommunityIcons name="clipboard-check" size={size} color={color} style={style} />
);

export const CertificateIcon = ({ size = 24, color = '#059669', style }: IconProps) => (
  <MaterialCommunityIcons name="certificate" size={size} color={color} style={style} />
);

export const GraduationIcon = ({ size = 24, color = '#059669', style }: IconProps) => (
  <FontAwesome5 name="graduation-cap" size={size} color={color} style={style} />
);

export const StudyIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <MaterialCommunityIcons name="school" size={size} color={color} style={style} />
);

// Bookmark and Favorites
export const BookmarkIcon = ({ size = 24, color = '#8b5cf6', style }: IconProps) => (
  <Ionicons name="bookmark" size={size} color={color} style={style} />
);

export const BookmarkOutlineIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Ionicons name="bookmark-outline" size={size} color={color} style={style} />
);

export const StarIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <Ionicons name="star" size={size} color={color} style={style} />
);

export const StarOutlineIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Ionicons name="star-outline" size={size} color={color} style={style} />
);

export const HeartIcon = ({ size = 24, color = '#ec4899', style }: IconProps) => (
  <Ionicons name="heart" size={size} color={color} style={style} />
);

export const HeartOutlineIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Ionicons name="heart-outline" size={size} color={color} style={style} />
);

// Status and Feedback Icons
export const CheckIcon = ({ size = 24, color = '#059669', style }: IconProps) => (
  <Ionicons name="checkmark-circle" size={size} color={color} style={style} />
);

export const CheckmarkIcon = ({ size = 24, color = '#059669', style }: IconProps) => (
  <Ionicons name="checkmark" size={size} color={color} style={style} />
);

export const ErrorIcon = ({ size = 24, color = '#dc2626', style }: IconProps) => (
  <Ionicons name="close-circle" size={size} color={color} style={style} />
);

export const WarningIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <Ionicons name="warning" size={size} color={color} style={style} />
);

export const InfoIcon = ({ size = 24, color = '#0284c7', style }: IconProps) => (
  <Ionicons name="information-circle" size={size} color={color} style={style} />
);

// Progress and Statistics
export const ProgressIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <MaterialCommunityIcons name="progress-check" size={size} color={color} style={style} />
);

export const StatsIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <Ionicons name="stats-chart" size={size} color={color} style={style} />
);

export const TrophyIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <Ionicons name="trophy" size={size} color={color} style={style} />
);

export const TargetIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <MaterialCommunityIcons name="target" size={size} color={color} style={style} />
);

// Location and Geography
export const LocationIcon = ({ size = 24, color = '#10b981', style }: IconProps) => (
  <Ionicons name="location" size={size} color={color} style={style} />
);

export const MapIcon = ({ size = 24, color = '#10b981', style }: IconProps) => (
  <Feather name="map" size={size} color={color} style={style} />
);

export const GlobeIcon = ({ size = 24, color = '#0284c7', style }: IconProps) => (
  <Feather name="globe" size={size} color={color} style={style} />
);

export const FlagIcon = ({ size = 24, color = '#dc2626', style }: IconProps) => (
  <Ionicons name="flag" size={size} color={color} style={style} />
);

// Language and Translation
export const TranslateIcon = ({ size = 24, color = '#3b82f6', style }: IconProps) => (
  <MaterialIcons name="translate" size={size} color={color} style={style} />
);

export const LanguageIcon = ({ size = 24, color = '#3b82f6', style }: IconProps) => (
  <Ionicons name="language" size={size} color={color} style={style} />
);

// Time and Calendar
export const TimeIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Ionicons name="time" size={size} color={color} style={style} />
);

export const CalendarIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Ionicons name="calendar" size={size} color={color} style={style} />
);

export const ClockIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <Feather name="clock" size={size} color={color} style={style} />
);

// Support and Help
export const SupportIcon = ({ size = 24, color = '#ec4899', style }: IconProps) => (
  <MaterialCommunityIcons name="lifebuoy" size={size} color={color} style={style} />
);

export const HelpIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="help-circle" size={size} color={color} style={style} />
);

export const ContactIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="mail" size={size} color={color} style={style} />
);

export const PhoneIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="phone" size={size} color={color} style={style} />
);

// Social and Sharing
export const ShareIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="share-2" size={size} color={color} style={style} />
);

export const LinkIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="external-link" size={size} color={color} style={style} />
);

// Media and Content
export const ImageIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="image" size={size} color={color} style={style} />
);

export const PlayIcon = ({ size = 24, color = '#059669', style }: IconProps) => (
  <Ionicons name="play-circle" size={size} color={color} style={style} />
);

export const PauseIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <Ionicons name="pause-circle" size={size} color={color} style={style} />
);

// Actions
export const EditIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="edit-2" size={size} color={color} style={style} />
);

export const DeleteIcon = ({ size = 24, color = '#dc2626', style }: IconProps) => (
  <Feather name="trash-2" size={size} color={color} style={style} />
);

export const CopyIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="copy" size={size} color={color} style={style} />
);

export const DownloadIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="download" size={size} color={color} style={style} />
);

export const UploadIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="upload" size={size} color={color} style={style} />
);

// Grid and List Views
export const GridIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="grid" size={size} color={color} style={style} />
);

export const ListIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="list" size={size} color={color} style={style} />
);

// Refresh and Sync
export const RefreshIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <Feather name="refresh-cw" size={size} color={color} style={style} />
);

export const SyncIcon = ({ size = 24, color = '#64748b', style }: IconProps) => (
  <MaterialCommunityIcons name="sync" size={size} color={color} style={style} />
);

// Payment and Money
export const PaymentIcon = ({ size = 24, color = '#059669', style }: IconProps) => (
  <MaterialCommunityIcons name="credit-card" size={size} color={color} style={style} />
);

export const CoinIcon = ({ size = 24, color = '#f59e0b', style }: IconProps) => (
  <MaterialCommunityIcons name="coin" size={size} color={color} style={style} />
);

export const BankIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <MaterialCommunityIcons name="bank" size={size} color={color} style={style} />
);

// Special App Icons
export const AppIcon = ({ size = 24, color = '#2563eb', style }: IconProps) => (
  <GraduationIcon size={size} color={color} style={style} />
);

export const GermanyIcon = ({ size = 24, color = '#dc2626', style }: IconProps) => (
  <FlagIcon size={size} color={color} style={style} />
);

// Icon mapping for easy access
export const Icons = {
  // Navigation
  back: BackIcon,
  forward: ForwardIcon,
  menu: MenuIcon,
  close: CloseIcon,
  search: SearchIcon,
  filter: FilterIcon,
  settings: SettingsIcon,
  
  // Learning
  book: BookIcon,
  library: LibraryIcon,
  question: QuestionIcon,
  test: TestIcon,
  certificate: CertificateIcon,
  graduation: GraduationIcon,
  study: StudyIcon,
  
  // Bookmarks
  bookmark: BookmarkIcon,
  bookmarkOutline: BookmarkOutlineIcon,
  star: StarIcon,
  starOutline: StarOutlineIcon,
  heart: HeartIcon,
  heartOutline: HeartOutlineIcon,
  
  // Status
  check: CheckIcon,
  checkmark: CheckmarkIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  
  // Progress
  progress: ProgressIcon,
  stats: StatsIcon,
  trophy: TrophyIcon,
  target: TargetIcon,
  
  // Location
  location: LocationIcon,
  map: MapIcon,
  globe: GlobeIcon,
  flag: FlagIcon,
  
  // Language
  translate: TranslateIcon,
  language: LanguageIcon,
  
  // Time
  time: TimeIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  
  // Support
  support: SupportIcon,
  help: HelpIcon,
  contact: ContactIcon,
  phone: PhoneIcon,
  
  // Social
  share: ShareIcon,
  link: LinkIcon,
  
  // Media
  image: ImageIcon,
  play: PlayIcon,
  pause: PauseIcon,
  
  // Actions
  edit: EditIcon,
  delete: DeleteIcon,
  copy: CopyIcon,
  download: DownloadIcon,
  upload: UploadIcon,
  
  // Views
  grid: GridIcon,
  list: ListIcon,
  
  // Sync
  refresh: RefreshIcon,
  sync: SyncIcon,
  
  // Payment
  payment: PaymentIcon,
  coin: CoinIcon,
  bank: BankIcon,
  
  // App specific
  app: AppIcon,
  germany: GermanyIcon,
};