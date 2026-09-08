import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils/renderWithProviders';

import Button from '../Button';
import Badge from '../Badge';
import Card from '../Card';
import Input from '../Input';
import Textarea from '../Textarea';
import Select from '../Select';

/**
 * The primitives carry the contracts that were previously re-decided at every
 * call site — and mostly decided wrongly. Each block below pins one of those.
 */

describe('Button', () => {
  it('is a real button element, so it is keyboard-operable for free', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders every variant against semantic tokens, never a literal palette class', () => {
    for (const variant of ['primary', 'secondary', 'ghost', 'danger', 'accent']) {
      const { container, unmount } = render(<Button variant={variant}>Go</Button>);
      const cls = container.querySelector('button').className;
      expect(cls, `${variant} used a literal palette class`).not.toMatch(
        /\b(bg|text|border)-(blue|gray|slate|zinc|neutral|red|green|yellow|indigo)-\d{2,3}\b/
      );
      unmount();
    }
  });

  it('carries a visible focus ring bound to the focus-ring token', () => {
    const { container } = render(<Button>Focus</Button>);
    expect(container.querySelector('button').className).toMatch(/focus-visible:ring-focus-ring/);
  });

  it('blocks activation and announces busy state while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps its accessible name while loading, so the label does not vanish mid-submit', () => {
    render(<Button loading>Submit booking</Button>);
    expect(screen.getByRole('button', { name: /submit booking/i })).toBeInTheDocument();
  });

  it('renders as a link when given href, and drops button-only semantics', () => {
    render(<Button href="https://example.com">Visit</Button>);
    const link = screen.getByRole('link', { name: 'Visit' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).not.toHaveAttribute('aria-busy');
  });

  it('adds rel=noopener to any link it opens in a new tab', () => {
    render(
      <Button href="https://nairobuild.co.ke" target="_blank">
        Sister site
      </Button>
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('presses in on active, using the signature curve', () => {
    // The tactility of a native control is almost entirely this: a small, fast
    // scale-down on press. Without it a button is a coloured rectangle.
    const { container } = render(<Button>Book a viewing</Button>);
    const className = container.firstChild.className;

    expect(className).toMatch(/active:scale-\[0\.97\]/);
    expect(className).toMatch(/ease-spring/);
  });

  it('transitions transform as well as colour', () => {
    // `transition-colors` cannot animate a scale. This was the actual defect:
    // the press state would have snapped, because only colour was in the list.
    const { container } = render(<Button>Book a viewing</Button>);
    expect(container.firstChild.className).toMatch(
      /transition-\[transform,background-color,box-shadow\]/
    );
  });

  it('holds still for a visitor who asked the OS to stop moving things', () => {
    const { container } = render(<Button>Book a viewing</Button>);
    const className = container.firstChild.className;
    expect(className).toMatch(/motion-reduce:transition-none/);
    expect(className).toMatch(/motion-reduce:active:scale-100/);
  });

  it('does not press in while disabled, since nothing will happen', () => {
    const { container } = render(<Button disabled>Book a viewing</Button>);
    expect(container.firstChild.className).toMatch(/disabled:active:scale-100/);
  });

  it('gives the primary variant a lifted shadow', () => {
    const { container } = render(<Button variant="primary">Go</Button>);
    expect(container.firstChild.className).toMatch(/shadow-raised/);
  });

  it('offers a glass variant for controls sitting on a photograph', () => {
    // A solid fill inside a frosted panel punches a hole in the material; a
    // ghost button over a photograph disappears into it. This is the third
    // thing, and it keeps its own border for the same reason the panel does.
    const { container } = render(<Button variant="glass">Search</Button>);
    const className = container.firstChild.className;
    expect(className).toMatch(/bg-glass-strong/);
    expect(className).toMatch(/border-glass-border/);
    // The stylesheet's reduced-transparency and no-backdrop-filter fallbacks
    // bind to this class; without it the control keeps a tint it cannot justify.
    expect(className).toMatch(/\bglass-surface\b/);
  });
});

describe('Badge', () => {
  it('renders booking statuses from the shared status map, not a local opinion', () => {
    render(<Badge status="confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders an intent badge with its own children', () => {
    render(<Badge intent="danger">Overdue</Badge>);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('renders children on a raised surface token', () => {
    const { container } = render(<Card>Inside</Card>);
    expect(screen.getByText('Inside')).toBeInTheDocument();
    expect(container.firstChild.className).toMatch(/bg-surface-raised/);
  });

  it('becomes a real button when made interactive, rather than a clickable div', () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Pick me</Card>);
    expect(screen.getByRole('button', { name: /pick me/i })).toBeInTheDocument();
  });

  it('lifts on hover when it is a control, and only then', () => {
    // A card that lifts under the cursor but does nothing when clicked is a
    // promise the interface does not keep.
    const { container: staticCard } = render(<Card>Listing</Card>);
    expect(staticCard.firstChild.className).not.toMatch(/hover:-translate-y/);

    const { container: clickable } = render(<Card onClick={() => {}}>Listing</Card>);
    expect(clickable.firstChild.className).toMatch(/hover:-translate-y-1/);
    expect(clickable.firstChild.className).toMatch(/ease-spring/);
  });

  it('settles back down under the finger, so the press is felt and not just seen', () => {
    const { container } = render(<Card onClick={() => {}}>Listing</Card>);
    const className = container.firstChild.className;
    expect(className).toMatch(/active:translate-y-0/);
    expect(className).toMatch(/active:scale-\[0\.99\]/);
    expect(className).toMatch(/motion-reduce:hover:translate-y-0/);
  });

  it('sits on the material layer\u2019s radius and elevation, not Tailwind defaults', () => {
    // `rounded-xl shadow-sm` was an 8px corner with a hairline grey shadow --
    // the second-most-obvious tell after the typeface, per DESIGN.md.
    const { container } = render(<Card>Listing</Card>);
    expect(container.firstChild.className).toMatch(/rounded-lg/);
    expect(container.firstChild.className).toMatch(/shadow-raised/);
  });
});

/**
 * The field primitives exist mainly to make the largest accessibility defect in
 * this codebase structurally impossible to reintroduce: 134 `<label>` elements
 * against 11 `htmlFor` attributes, so ~123 controls announced nothing.
 */
describe.each([
  ['Input', Input, 'textbox'],
  ['Textarea', Textarea, 'textbox'],
])('%s', (name, Field, role) => {
  it('associates its label with its control without the caller doing anything', () => {
    render(<Field label="Full name" />);
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByRole(role, { name: 'Full name' })).toBeInTheDocument();
  });

  it('generates a unique id per instance, so two fields never collide', () => {
    render(
      <>
        <Field label="Email" />
        <Field label="Phone" />
      </>
    );
    const email = screen.getByLabelText('Email');
    const phone = screen.getByLabelText('Phone');
    expect(email.id).toBeTruthy();
    expect(email.id).not.toEqual(phone.id);
  });

  it('honours an explicit id rather than overriding it', () => {
    render(<Field label="Email" id="booking-email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'booking-email');
  });

  it('marks itself invalid and points at the error text when one is given', () => {
    render(<Field label="Email" error="Enter a valid email" />);
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const describedBy = field.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy.split(' ')[0])).toHaveTextContent(
      'Enter a valid email'
    );
  });

  it('announces the error politely, so a screen reader hears a failed submit', () => {
    render(<Field label="Email" error="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toHaveAttribute('role', 'alert');
  });

  it('links hint text without claiming the field is invalid', () => {
    render(<Field label="Phone" hint="We only call about this booking" />);
    const field = screen.getByLabelText('Phone');
    expect(field).not.toHaveAttribute('aria-invalid', 'true');
    expect(field.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('marks a required field for assistive technology, not just with an asterisk', () => {
    render(<Field label="Email" required />);
    expect(screen.getByLabelText(/Email/)).toBeRequired();
  });

  it('passes the value through so it stays a controlled field', async () => {
    const onChange = vi.fn();
    render(<Field label="Message" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Message'), 'hi');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Select', () => {
  it('associates its label and renders its options', () => {
    render(
      <Select label="Property type">
        <option value="apartment">Apartment</option>
        <option value="villa">Villa</option>
      </Select>
    );
    const select = screen.getByLabelText('Property type');
    expect(select).toBeInTheDocument();
    expect(within(select).getByText('Villa')).toBeInTheDocument();
  });

  it('reports selection changes', () => {
    const onChange = vi.fn();
    render(
      <Select label="Type" value="apartment" onChange={onChange}>
        <option value="apartment">Apartment</option>
        <option value="villa">Villa</option>
      </Select>
    );
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'villa' } });
    expect(onChange).toHaveBeenCalled();
  });
});
