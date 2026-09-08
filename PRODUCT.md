# Raslipwani Properties — Product Truth

> Durable context for design work. This file answers *who this is for and what they are
> trying to do*; `DESIGN.md` answers *what it should look like*. When a design decision needs
> justifying, it gets justified from here.

## What it is

A real-estate agency selling and letting residential property on the Kenyan coast at
Kikambala, north of Mombasa, plus a serviced booking flow for property viewings.

## Who it serves, in priority order

1. **Local buyers and tenants (Kenya).** Price-sensitive, mobile-first, on constrained
   networks. They need to trust that the listing is real and that the agency will answer.
2. **Diaspora investors.** Kenyans abroad buying at home, often without visiting. They are
   buying reassurance and process as much as property: proof of title, a named human, and
   evidence the agency has done this before.
3. **UN and diplomatic tenants.** Nairobi-posted staff on housing allowances with specific,
   checkable requirements — distance to duty station, security provision, parking, lease
   terms. The highest-value segment, and the least served by generic listing sites.

## The job each is doing

- **Local:** *find a real place I can afford, and reach someone who will actually show it to me.*
- **Diaspora:** *buy from 6,000 km away without being defrauded.*
- **UN/diplomatic:** *satisfy a housing checklist quickly, on terms my employer will accept.*

## What makes it different from a generic listings site

The International section. A portal aggregator cannot serve a UN housing checklist or a
diaspora buyer's need for process, because both require an agency that answers. That section
is the product's actual moat, and it is currently the least designed part of the site.

## Constraints that shape design

- **Mobile-first, constrained networks.** Bytes are a user-experience decision here, not a
  engineering preference. The first-load budget is a product constraint.
- **Two themes, both AA.** Already shipped, and non-negotiable.
- **Photography is the product.** The interface exists to frame it, never to compete with it.
- **The agency is small.** Design must not promise responsiveness the business cannot meet:
  no fake live chat, no invented review counts, no fabricated agent availability.

## Things that are true and easy to get wrong

- The property is on the **coast at Kikambala**, not in Nairobi. A previous revision of the
  site shipped JSON-LD placing it ~500 km inland.
- Five fields the UN audience cares about (`distance`, `security`, `parking`,
  `preferredTenants`, `leaseTerms`) are **prose inside `description`**, not columns. They
  render from there deliberately; do not invent schema for them.
- **8 booking enquiries are sitting unanswered** because the notification pipeline has never
  had credentials. Design that generates more enquiries makes that worse, not better, until
  it is fixed.
