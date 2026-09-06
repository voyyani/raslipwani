#!/usr/bin/env node
/**
 * Mechanically rewrites `react-icons` call sites to the `<Icon>` registry.
 *
 * Why a codemod rather than 28 hand-migrated files: the 200 icon call sites in
 * this codebase are not 200 decisions. They are 77 distinct names — 74 after the
 * three brand marks move into `BrandMarks.jsx` — and three sizing idioms. That
 * shape is what a codemod is for, and it is the same argument that turned the
 * colour migration from five days of surface-by-surface PRs into an afternoon.
 *
 * The sizing translation is the part a human would get wrong at scale.
 * `react-icons` renders at `1em` when it is given no explicit size, so 43 call
 * sites size their icon with a `text-*` class. `lucide-react` emits explicit
 * `width`/`height` attributes and an SVG ignores font-size, so carrying those
 * classes across unchanged would silently shrink 43 icons to 16px — a defect no
 * test in this repo would catch and no reviewer would reliably spot in a
 * 200-site diff.
 *
 * Two rules keep this honest:
 *
 * 1. **Only JSX call sites are rewritten.** Four files store an icon as a
 *    *component value* (`{ icon: FaHome }`) and render it via
 *    `const Icon = item.icon`. Converting those means two coordinated edits —
 *    the data array becomes strings, the render site becomes
 *    `<Icon name={item.icon} />` — which is judgement, not repetition. Those
 *    files are refused by name and migrated by hand.
 * 2. **A name not in the table refuses its whole file.** A partial rewrite that
 *    leaves one `react-icons` import behind looks finished and is not.
 *
 *   node scripts/codemod-icons.mjs --dry     report what would change
 *   node scripts/codemod-icons.mjs           write the changes
 *
 * Idempotent: `<Icon name="...">` matches nothing here, so a second run is a
 * no-op. `scripts/__tests__/codemod-icons.test.js` asserts that.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * react-icons component → registry name, in the FontAwesome vocabulary the
 * registry keys use. Every Feather (`Fi`) and Material (`Md`) spelling collapses
 * onto the FontAwesome name for the same glyph: two registry names for one X
 * would be two slightly different X icons on adjacent screens.
 */
export const NAME_MAP = {
  // Navigation and shell
  FaHome: 'home', FiHome: 'home',
  FaBars: 'bars', FiMenu: 'bars',
  FaTh: 'th', FiGrid: 'th',
  FaList: 'list',
  FaCog: 'cog',
  FaSignOutAlt: 'sign-out-alt',
  FaEllipsisV: 'ellipsis-v',
  MdDashboard: 'tachometer-alt',
  FaChevronLeft: 'chevron-left',
  FaChevronRight: 'chevron-right',
  FaChevronDown: 'chevron-down', FiChevronDown: 'chevron-down',
  FaChevronUp: 'chevron-up', FiChevronUp: 'chevron-up',

  // Record actions
  FaCheck: 'check',
  FaTimes: 'times', FiX: 'times',
  FaEdit: 'edit',
  FaTrash: 'trash',
  FaSave: 'save',
  FaPlus: 'plus',
  FaPlusCircle: 'plus-circle',
  FaBan: 'ban',
  FaEye: 'eye',
  FaArchive: 'archive',
  FaTrashRestore: 'trash-restore',
  FaFilter: 'filter', FiFilter: 'filter',
  FaSearch: 'search', FiSearch: 'search',
  FaDownload: 'download',
  FaUpload: 'upload',
  FaCloudUploadAlt: 'cloud-upload-alt',
  FiMaximize: 'expand',
  FiMinimize: 'compress',
  FiExternalLink: 'external-link-alt',

  // Status and diagnostics
  FaSpinner: 'spinner',
  FaCheckCircle: 'check-circle',
  FaTimesCircle: 'times-circle',
  FaExclamationTriangle: 'exclamation-triangle',
  FiInfo: 'info-circle',
  FiHelpCircle: 'question-circle',
  FaBug: 'bug',
  FaTools: 'tools', FiTool: 'tools',
  FaCloud: 'cloud',

  // Scheduling and money
  FaCalendar: 'calendar',
  FaCalendarAlt: 'calendar',
  FaCalendarDay: 'calendar-day',
  FaCalendarWeek: 'calendar-week',
  FaCalendarCheck: 'calendar-check',
  FaClock: 'clock',
  FaDollarSign: 'dollar-sign',
  FaStar: 'star',

  // People and correspondence
  FaUser: 'user',
  FaUsers: 'users',
  FaUserFriends: 'user-friends',
  FaEnvelope: 'envelope',
  FaPhone: 'phone', FiPhone: 'phone',

  // Places and property
  FaBuilding: 'building',
  FaCity: 'city',
  FaLandmark: 'landmark',
  FaGlobe: 'globe', FiGlobe: 'globe',
  FaMap: 'map',
  FaMapMarkerAlt: 'map-marker-alt', FiMapPin: 'map-marker-alt',
  FaBed: 'bed',
  FaBath: 'bath',
  FaRuler: 'ruler-combined',
};

/**
 * Tailwind text sizes in pixels. These are the sizes the icons actually render
 * at today, because react-icons draws at 1em and inherits the font-size this
 * class sets. Translating rather than guessing is what makes this migration
 * pixel-neutral.
 */
const TEXT_SIZE_PX = {
  'text-xs': 12,
  'text-sm': 14,
  'text-base': 16,
  'text-lg': 18,
  'text-xl': 20,
  'text-2xl': 24,
  'text-3xl': 30,
  'text-4xl': 36,
};

/** `w-5` is 1.25rem is 20px. The scale is linear at 4px per step. */
const spacingPx = (n) => Number(n) * 4;

const IMPORT_RE = /^import\s*\{([^}]*)\}\s*from\s*'react-icons\/\w+';?[ \t]*\n/gm;

/**
 * Pulls the sizing out of a literal className and returns the class list with
 * it removed. Returns `size: null` when there is nothing to translate, and
 * `review` when the class list sizes the icon in a way the table cannot decide.
 */
function extractSize(classList) {
  const classes = classList.split(/\s+/).filter(Boolean);

  const textClass = classes.find((c) => c in TEXT_SIZE_PX);
  if (textClass) {
    return {
      size: TEXT_SIZE_PX[textClass],
      className: classes.filter((c) => c !== textClass).join(' '),
      review: null,
    };
  }

  const w = classes.find((c) => /^w-\d+$/.test(c));
  const h = classes.find((c) => /^h-\d+$/.test(c));
  if (w && h) {
    const wn = w.slice(2);
    const hn = h.slice(2);
    if (wn !== hn) {
      return { size: null, className: classList, review: `non-square sizing: ${w} ${h}` };
    }
    return {
      size: spacingPx(wn),
      className: classes.filter((c) => c !== w && c !== h).join(' '),
      review: null,
    };
  }

  if (w || h) {
    return { size: null, className: classList, review: `half a sizing pair: ${w || h}` };
  }

  return { size: null, className: classList, review: null };
}

/** Rewrites one `<FaThing ... />` element into `<Icon name="thing" ... />`. */
function rewriteElement(component, attrs, reviews) {
  const name = NAME_MAP[component];
  let rest = attrs;
  let sizeProp = '';

  const classMatch = rest.match(/\sclassName="([^"]*)"/);
  if (classMatch) {
    const { size, className, review } = extractSize(classMatch[1]);
    if (review) reviews.push(`<${component}> — ${review}`);
    if (size !== null) sizeProp = ` size={${size}}`;
    rest = className
      ? rest.replace(classMatch[0], ` className="${className}"`)
      : rest.replace(classMatch[0], '');
  } else if (/\sclassName=\{/.test(rest)) {
    reviews.push(`<${component}> — className is an expression; sizing not translated`);
  }

  return `<Icon name="${name}"${sizeProp}${rest.replace(/\s+$/, '')} />`;
}

/**
 * @param {string} source           the file's contents
 * @param {string} iconImportPath   how this file should import Icon
 */
export function transform(source, iconImportPath) {
  const refusals = [];
  const reviews = [];

  const imported = [];
  for (const [, names] of source.matchAll(IMPORT_RE)) {
    for (const raw of names.split(',')) {
      const name = raw.trim();
      if (name) imported.push(name);
    }
  }

  if (imported.length === 0) return { code: source, refusals, reviews };

  for (const name of imported) {
    if (!(name in NAME_MAP)) {
      refusals.push(`${name} is not in NAME_MAP — add it to the registry and the table first`);
      continue;
    }
    // Every reference must be a JSX opening tag. Anything else is the
    // component-as-value case, which is hand work.
    const all = (source.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
    const asImport = 1;
    const asElement = (source.match(new RegExp(`<${name}[\\s/>]`, 'g')) || []).length;
    if (all - asImport !== asElement) {
      refusals.push(`${name} is referenced as a value, not only as JSX — migrate this file by hand`);
    }
  }

  if (refusals.length > 0) return { code: source, refusals, reviews };

  let code = source.replace(
    /<(Fa|Fi|Md)([A-Z][A-Za-z0-9]*)((?:\s[^>]*?)?)\s*\/>/g,
    (match, prefix, rest, attrs) => {
      const component = prefix + rest;
      if (!(component in NAME_MAP)) return match;
      return rewriteElement(component, attrs, reviews);
    }
  );

  code = code.replace(IMPORT_RE, '');

  if (!/^import\s+Icon\s+from/m.test(code)) {
    // Place it where the deleted import was: after the last remaining import.
    const imports = [...code.matchAll(/^import .*;?$/gm)];
    const last = imports[imports.length - 1];
    const at = last ? last.index + last[0].length : 0;
    code = `${code.slice(0, at)}\nimport Icon from '${iconImportPath}';${code.slice(at)}`;
  }

  return { code, refusals, reviews };
}

/** Every `.jsx`/`.js` under `src/`, excluding tests. */
function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') sourceFiles(full, acc);
    } else if (/\.jsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

const isMain = process.argv[1] && process.argv[1].endsWith('codemod-icons.mjs');
if (isMain) {
  const dry = process.argv.includes('--dry');
  const root = process.cwd();
  const iconFile = path.join(root, 'src/components/Icon.jsx');

  let changed = 0;
  const allRefusals = [];
  const allReviews = [];

  for (const file of sourceFiles(path.join(root, 'src'))) {
    if (file === iconFile) continue;
    const source = readFileSync(file, 'utf8');
    if (!source.includes('react-icons')) continue;

    let rel = path.relative(path.dirname(file), iconFile).replace(/\.jsx$/, '');
    if (!rel.startsWith('.')) rel = `./${rel}`;

    const { code, refusals, reviews } = transform(source, rel);
    const short = path.relative(root, file);

    if (refusals.length > 0) {
      allRefusals.push(`  ${short}\n${refusals.map((r) => `      ${r}`).join('\n')}`);
      continue;
    }
    if (reviews.length > 0) {
      allReviews.push(`  ${short}\n${reviews.map((r) => `      ${r}`).join('\n')}`);
    }
    if (code !== source) {
      changed += 1;
      if (!dry) writeFileSync(file, code);
      console.log(`${dry ? 'would rewrite' : 'rewrote'}  ${short}`);
    }
  }

  console.log(`\n${changed} file(s) ${dry ? 'would be ' : ''}rewritten.`);

  if (allReviews.length > 0) {
    console.log(`\nConverted, but read these before committing:\n${allReviews.join('\n')}`);
  }
  if (allRefusals.length > 0) {
    console.log(`\nRefused — migrate by hand:\n${allRefusals.join('\n')}`);
  }
}
