import { describe, it, expect } from 'vitest';
import { transform, NAME_MAP } from '../codemod-icons.mjs';

const ICON = '@/components/Icon';

describe('the name table', () => {
  it('maps every react-icons name in use to a registry name', () => {
    // 74 names: the 77 distinct names measured in src/ on 2026-09-06 minus the
    // three Si* brand marks, which live in Icon.jsx and moved to BrandMarks.
    expect(Object.keys(NAME_MAP)).toHaveLength(74);
  });

  it('sends every FontAwesome and Feather spelling of one glyph to one name', () => {
    // FaTimes and FiX are the same X. Two registry names for it would be two
    // slightly different X icons on adjacent admin screens, which is the exact
    // inconsistency this consolidation exists to remove.
    expect(NAME_MAP.FaTimes).toBe(NAME_MAP.FiX);
    expect(NAME_MAP.FaHome).toBe(NAME_MAP.FiHome);
    expect(NAME_MAP.FaSearch).toBe(NAME_MAP.FiSearch);
    expect(NAME_MAP.FaPhone).toBe(NAME_MAP.FiPhone);
    expect(NAME_MAP.FaGlobe).toBe(NAME_MAP.FiGlobe);
  });
});

describe('rewriting call sites', () => {
  it('rewrites a bare icon and its import', () => {
    const source = [
      "import { FaSave } from 'react-icons/fa';",
      '',
      'const C = () => <FaSave />;',
    ].join('\n');

    const { code, refusals } = transform(source, ICON);

    expect(refusals).toEqual([]);
    expect(code).toContain("import Icon from '@/components/Icon';");
    expect(code).not.toContain('react-icons');
    expect(code).toContain('<Icon name="save" />');
  });

  it('keeps a className that carries no sizing', () => {
    const source = [
      "import { FaTimes } from 'react-icons/fa';",
      'const C = () => <FaTimes className="mr-1" />;',
    ].join('\n');

    expect(transform(source, ICON).code).toContain('<Icon name="times" className="mr-1" />');
  });

  it('translates a text-size class into an explicit size prop', () => {
    // The whole reason a codemod is safer than 200 hand edits: react-icons
    // renders at 1em so `text-3xl` sized it, and an SVG with width/height
    // attributes ignores font-size. Every one of these 43 call sites would
    // silently shrink to 16px if the class were merely carried over.
    const source = [
      "import { FaSpinner } from 'react-icons/fa';",
      'const C = () => <FaSpinner className="animate-spin text-3xl text-brand" />;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code).toContain('size={30}');
    expect(code).toContain('className="animate-spin text-brand"');
    expect(code).not.toContain('text-3xl');
  });

  it('translates a matched w-/h- pair into a size prop', () => {
    const source = [
      "import { FaEye } from 'react-icons/fa';",
      'const C = () => <FaEye className="w-5 h-5" />;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code).toContain('<Icon name="eye" size={20} />');
    expect(code).not.toContain('w-5');
  });

  it('leaves a mismatched w-/h- pair alone and flags it for review', () => {
    const source = [
      "import { FaEye } from 'react-icons/fa';",
      'const C = () => <FaEye className="w-6 h-4" />;',
    ].join('\n');

    const { code, reviews } = transform(source, ICON);

    expect(code).toContain('className="w-6 h-4"');
    expect(code).not.toContain('size=');
    expect(reviews.join(' ')).toMatch(/w-6 h-4/);
  });

  it('carries other props through untouched', () => {
    const source = [
      "import { FaTrash } from 'react-icons/fa';",
      'const C = () => <FaTrash onClick={remove} title="Delete" />;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code).toContain('onClick={remove}');
    expect(code).toContain('title="Delete"');
    expect(code).toContain('name="trash"');
  });

  it('refuses a file that stores an icon as a component value', () => {
    // This is the case the codemod must not touch: converting it means editing
    // the data array AND the render site that does `const Icon = item.icon`.
    const source = [
      "import { FaHome } from 'react-icons/fa';",
      "const items = [{ path: '', label: 'Dashboard', icon: FaHome }];",
      'const C = () => items.map((i) => { const I = i.icon; return <I />; });',
    ].join('\n');

    const { code, refusals } = transform(source, ICON);

    expect(refusals).toHaveLength(1);
    expect(refusals[0]).toMatch(/FaHome/);
    expect(code).toBe(source);
  });

  it('refuses an icon name that is not in the table', () => {
    const source = [
      "import { FaUnicorn } from 'react-icons/fa';",
      'const C = () => <FaUnicorn />;',
    ].join('\n');

    const { code, refusals } = transform(source, ICON);

    expect(refusals[0]).toMatch(/FaUnicorn/);
    expect(code).toBe(source);
  });

  it('does not add a second Icon import when one is already there', () => {
    const source = [
      "import Icon from '@/components/Icon';",
      "import { FaSave } from 'react-icons/fa';",
      'const C = () => <><Icon name="home" /><FaSave /></>;',
    ].join('\n');

    const { code } = transform(source, ICON);

    expect(code.match(/import Icon from/g)).toHaveLength(1);
  });

  it('is idempotent', () => {
    const source = [
      "import { FaSave } from 'react-icons/fa';",
      'const C = () => <FaSave className="text-xl" />;',
    ].join('\n');

    const once = transform(source, ICON).code;
    const twice = transform(once, ICON).code;

    expect(twice).toBe(once);
  });

  it('does not rewrite a name that only appears in a comment', () => {
    // The palette codemod quietly rewrote four doc comments. Same trap, so:
    // same test.
    const source = ['// FaSave used to live here.', 'const C = () => null;'].join('\n');

    expect(transform(source, ICON).code).toBe(source);
  });
});
