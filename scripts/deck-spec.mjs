/* A worked deck in emit-spec form — the export side of "a slide is data".
 *
 * Six slides chosen to exercise every element the emitter can produce, so a
 * round-trip through Drive proves or disproves each one independently:
 *
 *   1  brand plate + display text        → picture background, live headline
 *   2  headline + lead + KPI cards       → rounded shapes, styled runs
 *   3  headline + NATIVE bar chart       → an editable chart object
 *   4  tinted table                      → an editable table
 *   5  gradient panel + reversed text    → rasterised gradient, live text on top
 *   6  closing on brand                  → outlined shapes, on-dark ink
 *
 * Deliberately hand-written rather than derived from the React templates. The
 * emit spec is a narrower thing than a template's props — see the note at the
 * top of src/lib/pptx/emit.ts — and pretending otherwise would couple the
 * exporter to component internals it has no business knowing.
 */
import { resolve } from 'node:path'

const A = (p) => resolve(`src/assets/imagery/${p}`)

export const deck = [
  /* 1 — cover on the brand plate */
  {
    surface: 'brand',
    plate: A('backgrounds/brand-hex.png'),
    eyebrow: 'Series A',
    watermark: false,
    notes: 'Cover. The plate is real artwork; the headline is a live text box.',
    elements: [
      {
        kind: 'text',
        step: 'displayLg',
        x: 40,
        y: 150,
        w: 700,
        text: 'The booking layer\nfor live events.',
        onDark: true,
      },
      {
        kind: 'text',
        step: 'lead',
        x: 40,
        y: 400,
        w: 600,
        text: '$400M+ in lifetime bookings. $260M annually, and growing.',
        onDark: true,
      },
    ],
  },

  /* 2 — KPI cards */
  {
    surface: 'light',
    eyebrow: 'Traction',
    pageNumber: 5,
    notes: 'Four KPI tiles. The fourth reverses onto a gradient picture.',
    elements: [
      { kind: 'text', step: 'h1', x: 40, y: 84, w: 1100, text: 'Growth across every operation metric.' },
      {
        kind: 'text',
        step: 'lead',
        x: 40,
        y: 175,
        w: 1100,
        text: 'EventPipe connects event operators, housing companies, hotels, teams, and attendees around one live source of truth.',
      },
      // Three muted tiles, then one on the brand gradient.
      ...[
        ['Reservations', '1.2M', 16],
        ['Room Nights', '1.9M', 316],
        ['Annual Events', '4.8K', 616],
      ].flatMap(([label, value, x]) => [
        { kind: 'rect', x, y: 360, w: 284, h: 322, fill: '#f5f5f5', radius: 10 },
        { kind: 'text', step: 'h4', x: x + 28, y: 548, w: 240, text: label },
        { kind: 'text', step: 'stat', x: x + 28, y: 578, w: 240, text: value, ink: '#02859d' },
      ]),
      { kind: 'gradient', name: 'brand', x: 916, y: 360, w: 284, h: 322, radius: 10 },
      { kind: 'text', step: 'h4', x: 944, y: 548, w: 240, text: 'Annual Events', onDark: true },
      { kind: 'text', step: 'stat', x: 944, y: 578, w: 240, text: '4.8K', onDark: true },
    ],
  },

  /* 3 — native chart */
  {
    surface: 'light',
    eyebrow: 'Core Business',
    pageNumber: 8,
    notes:
      'The chart is a NATIVE PowerPoint chart. In Google Slides it is a chart object whose data can be edited, not a picture.',
    elements: [
      {
        kind: 'text',
        step: 'h1',
        x: 40,
        y: 84,
        w: 520,
        text: [
          'The core software business is growing ',
          { accent: 'before the new layers arrive.' },
        ],
      },
      {
        kind: 'text',
        step: 'body',
        x: 40,
        y: 300,
        w: 520,
        text: 'Reservation fees create a durable base. Transactional products add revenue per booking as customers adopt more of the platform.',
      },
      { kind: 'text', step: 'h4', x: 40, y: 500, w: 300, text: 'Base Plan Revenue' },
      { kind: 'text', step: 'stat', x: 40, y: 530, w: 240, text: '$5.2M', ink: '#02859d' },
      { kind: 'text', step: 'stat', x: 300, y: 530, w: 240, text: '$8.4M', ink: '#02859d' },
      {
        kind: 'chart',
        type: 'bar',
        x: 620,
        y: 150,
        w: 580,
        h: 460,
        title: 'Total Revenue (USD $000s)',
        categories: ['2023', '2024A', '2025', '2026E', '2027E'],
        series: [{ name: 'Revenue', values: [940, 1610, 2750, 4480, 7300] }],
      },
    ],
  },

  /* 4 — tinted table */
  {
    surface: 'light',
    eyebrow: 'Showpass & EventPipe',
    pageNumber: 12,
    notes: 'An editable table. Row tints come from the measured cyan ramp.',
    elements: [
      { kind: 'text', step: 'h2', x: 40, y: 84, w: 900, text: 'Phase 1 – Static Booking Links' },
      {
        kind: 'text',
        step: 'lead',
        x: 40,
        y: 150,
        w: 900,
        text: 'Direct links from consumer-facing event pages to EventPipe-made Presto pages.',
      },
      {
        kind: 'table',
        x: 40,
        y: 254,
        w: 1155,
        colWidths: [319, 836],
        rowHeight: 96,
        headers: ['Suggested Placement', 'Integration Description'],
        rowFills: ['#20d2f5', '#64e8fe', '#9af2ff'],
        rows: [
          ['Event Pages', 'Embed a static “Book Your Hotel” link in the event details section.'],
          ['Emails', 'Include a static booking link in email campaigns or newsletters.'],
          ['Social Media Posts', 'Share static booking links in social content and promotions.'],
        ],
      },
    ],
  },

  /* 5 — gradient panel with reversed copy */
  {
    surface: 'light',
    eyebrow: 'Integration Roadmap',
    pageNumber: 24,
    notes:
      'Gradient panels are rasterised (PptxGenJS has no gradient fill) but the copy on top stays editable.',
    elements: [
      {
        kind: 'text',
        step: 'h1',
        x: 40,
        y: 84,
        w: 1100,
        text: [{ accent: 'Integration Roadmap: ' }, 'From simple links to fully embedded booking'],
      },
      ...[
        ['Static Booking Hyperlinks', 'Direct, static links from event pages, emails and social media.', 43, 440],
        ['Triggered Post-Purchase Offers', 'Booking modules embedded in confirmation pages and emails.', 444, 360],
        ['Embedded Bookings', 'Widgets fully embedded in ticketing flows, in real time.', 845, 296],
      ].flatMap(([title, body, x, y]) => [
        { kind: 'gradient', name: 'brand', x, y, w: 348, h: 360, radius: 16 },
        { kind: 'text', step: 'body', x: x + 32, y: y + 32, w: 284, text: body, onDark: true },
        { kind: 'text', step: 'h3', x: x + 32, y: y + 290, w: 284, text: title, onDark: true },
      ]),
    ],
  },

  /* 6 — closing on brand */
  {
    surface: 'brand',
    plate: A('backgrounds/brand-arrows.png'),
    tag: 'Confidential',
    watermark: false,
    notes: 'Closing. Outlined cards are real shapes with a hairline border.',
    elements: [
      {
        kind: 'text',
        step: 'display',
        x: 40,
        y: 120,
        w: 900,
        text: 'Let’s build the\nbooking layer together.',
        onDark: true,
      },
      ...[
        ['Brandon Hollmann', 'Chief Revenue Officer', 40],
        ['Todd Beckerman', 'Head of Partnerships', 620],
      ].flatMap(([name, role, x]) => [
        {
          kind: 'rect',
          x,
          y: 420,
          w: 540,
          h: 200,
          radius: 24,
          line: { color: '#ffffff', width: 1 },
        },
        { kind: 'text', step: 'h3', x: x + 36, y: 460, w: 460, text: name, onDark: true },
        { kind: 'text', step: 'lead', x: x + 36, y: 500, w: 460, text: role, onDark: true },
        { kind: 'text', step: 'body', x: x + 36, y: 545, w: 460, text: 'name@eventpipe.com', onDark: true },
      ]),
    ],
  },
]
