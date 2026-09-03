import React from 'react';
import PropTypes from 'prop-types';
import {
  Archive,
  ArchiveRestore,
  Bath,
  Bed,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Crown,
  Eye,
  Facebook,
  FileSignature,
  FileText,
  Footprints,
  Gem,
  Globe,
  Headset,
  History,
  Home,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  Download,
  Map,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  Ruler,
  Save,
  Search,
  Share2,
  ShieldCheck,
  Star,
  StickyNote,
  Target,
  TrendingUp,
  Twitter,
  User,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { SiPinterest, SiTiktok, SiWhatsapp } from 'react-icons/si';

/**
 * The single icon seam for the application.
 *
 * Before this existed, icons arrived three ways: a FontAwesome stylesheet
 * imported in `main.jsx`, `react-icons`, and `lucide-react`. The FontAwesome
 * route was the expensive one — one CSS import emitted **999 kB of font files**
 * (`fa-solid-900`, `fa-brands-400`, `fa-regular-400`, and a v4 compatibility
 * shim, in both `.woff2` and `.ttf`) so the site could draw about forty glyphs.
 * Every one of those glyphs exists in `lucide-react`, which ships as tree-shaken
 * SVG and costs only the icons actually imported.
 *
 * Names are kept in FontAwesome's vocabulary (`map-marker-alt`, not `MapPin`)
 * for one deliberate reason: several call sites store the icon as a *string* in
 * a data array — `{ icon: 'home', title: 'Property Sales' }` — and content-shaped
 * data should not hold React components. A string registry keeps that data
 * serialisable, which matters if these lists ever move to the database.
 *
 * ## Sizing
 *
 * FontAwesome glyphs are text, so they were sized with `text-xl`. An SVG is not
 * text and ignores font-size, so size is an explicit prop in pixels. `className`
 * still carries colour, margin and animation, exactly as before.
 *
 * ## Accessibility
 *
 * Every icon here is decorative — it sits beside a text label or inside a
 * control that carries its own accessible name — so the SVG is hidden from
 * assistive technology by default. Pass a `label` for the rare icon that *is*
 * the only content of its control, and it becomes an `img` with that name.
 *
 * @example
 * <Icon name="map-marker-alt" size={16} className="text-primary" />
 * <Icon name="spinner" className="animate-spin mr-2" />
 */
const REGISTRY = {
  // Property and service vocabulary
  'home': Home,
  'search': Search,
  'search-dollar': CircleDollarSign,
  'chart-line': TrendingUp,
  'tasks': ClipboardList,
  'city': Building2,
  'globe-africa': Globe,
  'map': Map,
  'map-marker-alt': MapPin,
  'bed': Bed,
  'bath': Bath,
  'ruler-combined': Ruler,

  // Trust, values and narrative
  'shield-alt': ShieldCheck,
  'users': Users,
  'bolt': Zap,
  'history': History,
  'gem': Gem,
  'bullseye': Target,
  'rocket': Rocket,
  'eye': Eye,
  'star': Star,
  'crown': Crown,

  // Contact and correspondence
  'envelope': Mail,
  'phone': Phone,
  'comment-alt': MessageSquare,

  // Viewings and documents
  'walking': Footprints,
  'video': Video,
  'vr-cardboard': Headset,
  'calendar-check': CalendarCheck,
  'clock': Clock,
  'user': User,
  'file-alt': FileText,
  'file-contract': FileSignature,
  'sticky-note': StickyNote,
  'file-export': Download,
  'save': Save,

  // Record keeping
  'archive': Archive,
  'trash-restore': ArchiveRestore,
  'share': Share2,

  // Interface
  'check-circle': CheckCircle2,
  'times': X,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'spinner': Loader2,

  // Brand marks. Lucide carries these four; it has no mark for TikTok,
  // WhatsApp or Pinterest, so those three come from `react-icons/si`
  // (Simple Icons), which is already a dependency and ships as SVG.
  'facebook': Facebook,
  'instagram': Instagram,
  'twitter': Twitter,
  'linkedin': Linkedin,
  'whatsapp': SiWhatsapp,
  'tiktok': SiTiktok,
  'pinterest': SiPinterest,
};

/** The names this registry answers to — exported so a test can assert coverage. */
export const ICON_NAMES = Object.keys(REGISTRY);

const Icon = ({ name, size = 16, className = '', label, ...rest }) => {
  const Glyph = REGISTRY[name];

  if (!Glyph) {
    // A missing icon is a typo, not a runtime failure. Rendering nothing keeps
    // the surrounding layout intact; the dev-only warning is how it gets found.
    if (import.meta.env.DEV) {
      console.warn(
        `<Icon name="${name}"> is not in the registry. Add it to src/components/Icon.jsx ` +
          `or use one of: ${ICON_NAMES.join(', ')}`
      );
    }
    return null;
  }

  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': 'true', focusable: 'false' };

  return <Glyph size={size} className={className} {...a11y} {...rest} />;
};

Icon.propTypes = {
  /** A registry name, in FontAwesome's vocabulary. See `ICON_NAMES`. */
  name: PropTypes.string.isRequired,
  /** Edge length in pixels. Defaults to 16 — FontAwesome drew at 1em, and every
   *  unsized call site was calibrated against that. SVGs ignore font-size, so
   *  this cannot be a text class. */
  size: PropTypes.number,
  /** Colour, margin, animation — everything except size. */
  className: PropTypes.string,
  /** Supply only when the icon is the sole content of its control. */
  label: PropTypes.string,
};

export default Icon;
