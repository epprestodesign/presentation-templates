import { SectionDivider } from '../../templates/SectionDivider'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { FeatureCards } from '../../templates/FeatureCards'
import { Quadrant } from '../../diagrams/Quadrant'
import type { DeckSlide } from '../types'
import { COVER, WELL } from './shared'

/**
 * PART FOUR — SECTION IV, slides 23–25: the other request types.
 *
 * WAS THREE FULL BOUNDARY DIAGRAMS, ONE PER DEPARTMENT, AND THAT WAS WRONG TWICE.
 *
 * They looked near-identical, which was the reported symptom — three 3x3 zone
 * diagrams with a focal middle column, differing only in the nouns. But the real
 * error was upstream of the layout: giving marketing, the exec deck and support a
 * full process apiece IMPLIED THEY ARE AS INVOLVED AS PRODUCT WORK, and they are
 * not. They are largely graphic-design requests with minimal refinement — a hero
 * banner, a logo resize, a display ad, a deck update. Drawing a sign-off gate and
 * a two-way boundary around a logo resize overstates it, and an audience that does
 * that work daily would notice.
 *
 * WHAT IS ACTUALLY TRUE OF THEM IS VOLUME, NOT COMPLEXITY. So the section is now
 * two slides: 24 plots every request type against refinement and volume, which is
 * where the real claim lives, and 26 names the concrete deliverables three-up. The
 * three-boundary picture stays where it earns its space — product, on slide 06.
 *
 * That also fixes the section's balance: Section IV was four slides making one
 * point three times, and is now three making two points once each.
 */
export const partFour: DeckSlide[] = [
  /* ------------------------------------------------------------------ 23 */
  {
    id: 'section-other-departments',
    title: 'Section IV · By request type',
    notes:
      'Section four. Everything so far has been the product request — Scott and Josh. It is not a product-only process, and these three slides are the same picture for marketing, the exec deck and customer support.\n\nWhat to notice: the middle column never changes shape. In every one of them there is a step before anything gets built where scope is decided, and in every one of them that step is the one nobody asks for. The third column is what changes — who the work is actually for.',
    render: () => (
      <SectionDivider
        {...COVER}
        pageNumber={23}
        label="Section IV · By request type"
        title={'Same shape.\nDifferent process.'}
        lead="Product is one of seven sources. Marketing, the exec deck and support each run their own version — different inputs, a different sign-off, a different definition of done. What holds across all three is that each has one step, before anything is built, where scope gets decided."
      />
    ),
  },

  /* ------------------------------------------------------------------ 24 */
  {
    id: 'refinement-and-volume',
    title: 'Refinement against volume',
    notes:
      'This is the honest picture of the other request types, and it is the correction to how I described them earlier.\n\nProduct work is the top-left: high refinement, and not that many of them. Everything else — marketing placements, sales support, the exec deck, support graphics, ad-hoc concepts — sits along the bottom. Low refinement. A hero banner, a logo resize, a display ad, a deck update. None of it is hard, and none of it needs a screen inventory or a sign-off gate.\n\nBut look at the horizontal axis. That is where the volume is. Individually cheap, collectively the larger share of requests, and every one of them arrives the same way as everything else — Slack, no ticket, asap.\n\nSo the argument is not that these need the product process. It is the opposite: they need the routing from slide 12 precisely BECAUSE they are simple. Simple work that arrives unrouted is what interrupts the work that is not simple.',
    /* THE STANDARD Quadrant grammar (`items`), not the consultant one. The axes hold
       measurements and position inside a cell means something, which is the whole
       point — this slide exists to show that the request types separate cleanly on
       two independent drivers, and that the separation runs diagonally rather than
       clustering.
     *
     * PRODUCT IS THE FOCAL ITEM, which looks backwards on a slide about the other
     * types until you read the axes: it is the item everything else interrupts. The
     * argument of Section II is that low-refinement volume arriving unrouted is what
     * costs the high-refinement work its continuity, and the focal dot is the thing
     * being protected rather than the thing being discussed.
     *
     * `labelSide` is set per item because the dots cluster along the bottom edge and
     * the default side would stack three labels on top of each other. Each one points
     * at whichever side is open canvas. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Refinement and volume"
        pageNumber={24}
        title={['Not harder. ', { accent: 'Just more of it.' }]}
        lead="Every request type on two drivers. The other work is not complex — it is numerous, and it arrives the same way product work does."
        {...WELL}
        footnote="These need the routing on slide 12 because they are simple, not despite it. Simple work arriving unrouted is what interrupts the work that is not simple."
        children={({ width, height }) => (
          <Quadrant
            width={width}
            height={height}
            xAxis={{ high: 'High volume', low: 'Low volume' }}
            yAxis={{ high: 'High refinement', low: 'Low refinement' }}
            /* THE TOP-RIGHT TAG SAYS THE QUADRANT IS EMPTY, because it is, and that is
               a finding rather than a gap to fill. Nothing we do is both high-volume
               and high-refinement — if something landed there it would break the
               process, since the process assumes refinement is rare. A tag asserting
               a property of an empty cell ('needs a queue most', the first pass) reads
               as a bug in three seconds.
               
               `focalCorner` is 3, not 0: the tint belongs on the claim, which is where
               the volume is. Product stays the focal ITEM — the thing being protected
               — and those are two different signals on two different axes.
               
               POSITIONS ARE SPREAD FOR LABELS, NOT FOR PRECISION. The first pass put
               marketing at (0.82, 0.20) and support at (0.66, 0.12) and their labels
               landed on top of each other; nothing here is measured to two decimal
               places, so the honest constraint is legibility. Exec decks moved off
               y=0.52 for the same reason — a label centred on the axis line straddles
               it. */
            cornerTags={[
              'Needs the full process',
              'Nothing sits here',
              'Rare and quick',
              'Where the volume is',
            ]}
            focalCorner={3}
            items={[
              {
                name: 'Product requests',
                sublabel: 'Inventory, review, coverage doc',
                x: 0.22,
                y: 0.86,
                focal: true,
                labelSide: 'right',
              },
              {
                name: 'Exec decks',
                sublabel: 'Investor updates',
                x: 0.34,
                y: 0.62,
                labelSide: 'right',
              },
              {
                name: 'Ad-hoc concepts',
                sublabel: 'From anyone, any time',
                x: 0.54,
                y: 0.4,
                labelSide: 'left',
              },
              {
                name: 'Marketing placements',
                sublabel: 'Banners, ads, logo resizes',
                x: 0.88,
                y: 0.26,
                labelSide: 'left',
              },
              {
                name: 'Sales support',
                sublabel: 'Pitches, decks, concepts',
                x: 0.44,
                y: 0.18,
                labelSide: 'below',
              },
              {
                name: 'Support graphics',
                sublabel: 'Presto page assets',
                x: 0.7,
                y: 0.1,
                labelSide: 'below',
              },
            ]}
            legend={[{ label: 'What the rest interrupts', kind: 'focal' }]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 25 */
  {
    id: 'the-other-requests',
    title: 'The other three, concretely',
    notes:
      'The concrete version, so nobody has to guess what "low refinement" means.\n\nMarketing is Jeff Porter: brand and website work, hero banners, logo resizes, and display ads on two Presto pages — the landing page and the hotel details page. The exec deck is investor updates from the C-suite. Support is Presto page graphics driven by ticket themes.\n\nTwo things worth saying out loud even though none of this is complex.\n\nFirst, marketing cannot start without final copy. A layout built around placeholder text gets rebuilt when the real headline is forty percent longer — that is the one place this simple work turns into rework.\n\nSecond, two of those display-ad placements sit inside the booking flow. A display ad on the hotel details page competes with the task that page exists to complete, which makes it a product surface as well as a marketing one. It is also the same page support wants clarifying space on — same pixels, opposite purposes. Nothing here resolves that, and I am not going to pretend it does.',
    /* `FeatureCards` with `layout="flat"` — text-only, no imagery, because the deck's
       photography is gitignored and a photo layout with no image renders an empty band
       that reads as a missing asset.
     *
     * THREE CARDS RATHER THAN THREE SLIDES. The content per department is a list of
     * deliverables and one caveat; a card holds that, and a full boundary diagram
     * overstated it. The one genuinely interesting thing in this section is the
     * collision named in the footnote, which needs the three side by side to land. */
    render: () => (
      <FeatureCards
        fit="none"
        eyebrow="The other request types"
        pageNumber={25}
        layout="flat"
        /* 2x2 rather than 4 across. Four cards in one row gives 280px each, which is
           enough for a title and two short paragraphs and nothing more — the marketing
           card carries six deliverables and was the one being squeezed. Two columns
           doubles the measure to 571px, so each card's copy sets on fewer, longer lines
           and the row heights absorb the difference. `columns` drives the grid; the
           second row is created by the four cards wrapping. */
        columns={2}
        title={['Graphic design, ', { accent: 'mostly.' }]}
        lead="What the other four actually ask for. Minimal refinement — and two of them carry a caveat that turns cheap work into rework."
        titleWidth={900}
        top={274}
        height={392}
        gap={12}
        cards={[
          {
            title: 'Marketing · Jeff Porter',
            body: [
              'Hero banners and logo resizes. Display ads on the landing and hotel details pages. Print collateral and one-off banner ads. CMS marketing page work.',
              'Needs final copy first — placeholder text means the layout is built twice.',
            ],
          },
          {
            title: 'Sales',
            body: [
              'Presto page pitches, sales decks and concepts — assembled from the deck system rather than drawn.',
              'The lightest of the four, and the least predictable in timing.',
            ],
          },
          {
            title: 'C-suite · Investor decks',
            body: [
              'Updates to the investor deck, composed from the same deck system.',
              'Figures are finance-approved and dated, or they do not go on a slide.',
            ],
          },
          {
            title: 'Support · Presto pages',
            body: [
              'Graphics for the booking pages, driven by what tickets say confuses people.',
              'Often the answer is the copy, not an illustration. Ticket volume says which.',
            ],
          },
        ]}
      />
    ),
  }
]
