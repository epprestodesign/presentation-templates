import type { Meta, StoryObj } from '@storybook/react-vite'
import { Timeline } from '../../templates/Timeline'

/** TEMPLATES / Timeline — dated milestones along one rule.
 *
 * Stories are content objects, nothing else. Every date, figure and name below
 * is illustrative.
 */
const meta = {
  title: 'Templates/Narrative/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Timeline

Three to six dated milestones strung along a single rule — a roadmap by quarter,
the company's history, the lifecycle of a room block from contract to
reconciliation.

The rule is **one element**, drawn across the whole well behind the markers, with
a teal fill that stops at the milestone marked \`current\`. Where that fill ends is
computed from the milestone geometry rather than measured off the DOM, so it lands
on the dot in the browser and in the exported raster alike.

State is **derived from position**. One milestone declares \`state: 'current'\`;
everything before it renders as done and everything after as upcoming. Nothing
marked current means the whole line reads as history, which is what a company
story wants. An explicit \`state\` still wins, for the roadmap item that slipped.

Icons are all-or-nothing: the slot is reserved for every milestone as soon as one
of them carries a glyph, so the markers stay on the line and the columns stay
equal.

Set \`orientation: 'vertical'\` when the descriptions run long — six lines of copy
under a horizontal column wraps to a stripe two words wide.
        `,
      },
    },
  },
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

/** The room-block lifecycle — the slide that opens an onboarding deck, because
 *  everything else in the product is a step on this line.
 *
 *  Six milestones is the practical ceiling: at 1155px of well the columns come
 *  out at ~172px, which leaves about 24 characters to a line — so descriptions
 *  here are kept under 50 characters and land on two lines. Written at the
 *  length the five-column roadmap uses, every one of them runs to four lines and
 *  breaks in the wrong places.
 *
 *  Nothing is marked current, so the whole line reads as one completed cycle
 *  rather than as a plan. */
export const RoomBlockLifecycle: Story = {
  args: {
    eyebrow: 'How Event Housing Works',
    pageNumber: 4,
    title: ['A room block has ', { accent: 'a life cycle' }, ', and EventPipe is the record of it.'],
    lead: 'Every block moves through the same six stages, whether it is 40 rooms for a regional tournament or 9,000 for a citywide.',
    milestones: [
      {
        date: 'T–180',
        icon: 'draw',
        title: 'Contract',
        description: 'Rates, counts and attrition terms agreed per hotel.',
      },
      {
        date: 'T–150',
        icon: 'dashboard_customize',
        title: 'Block build',
        description: 'Inventory loaded, policies set, site branded.',
      },
      {
        date: 'T–120',
        icon: 'link',
        title: 'Booking opens',
        description: 'Teams book against the block on the event site.',
      },
      {
        date: 'T–30',
        icon: 'monitoring',
        title: 'Pickup watch',
        description: 'Nightly pickup tracked against the contract.',
      },
      {
        date: 'T–14',
        icon: 'event_busy',
        title: 'Cut-off',
        description: 'Unsold rooms released, late requests handled.',
      },
      {
        date: 'T+30',
        icon: 'account_balance',
        title: 'Reconcile',
        description: 'Rooms actualised, commission and rebates paid.',
      },
    ],
  },
}

/** A product roadmap with a "you are here" marker.
 *
 *  This is the story the `current` state exists for: the fill stops on Q3, the
 *  two quarters behind it read as shipped, and the two ahead sit as hollow dots.
 *  Five columns rather than six leaves room for a fuller sentence per quarter. */
export const ProductRoadmap: Story = {
  args: {
    eyebrow: 'Roadmap',
    pageNumber: 12,
    title: ['What ships ', { accent: 'this year' }],
    lead: 'Dates are directional. Anything past the current quarter is sequenced, not committed.',
    milestones: [
      {
        date: 'Q1 2026',
        title: 'Group booking links',
        description: 'One link per team, with a coach-managed rooming list behind it.',
      },
      {
        date: 'Q2 2026',
        title: 'Attrition forecasting',
        description: 'Projected pickup against contract, seven weeks out.',
      },
      {
        date: 'Q3 2026',
        state: 'current',
        title: 'Payments rebuild',
        description: 'Card on file, split payments and deposit schedules on one ledger.',
      },
      {
        date: 'Q4 2026',
        title: 'Housing partner API',
        description: 'Blocks, pickup and commission readable by a partner system.',
      },
      {
        date: 'Q1 2027',
        title: 'Citywide tooling',
        description: 'Multi-hotel, multi-organiser events managed as one inventory pool.',
      },
    ],
  },
}

/** The same shape turned on its side, for an implementation schedule.
 *
 *  Vertical because these descriptions are sentences rather than labels: the
 *  copy takes the width the horizontal version spends on columns, and the dates
 *  right-align into a single edge against the rule. */
export const OnboardingSchedule: Story = {
  args: {
    orientation: 'vertical',
    eyebrow: 'Implementation',
    pageNumber: 6,
    title: ['Live in ', { accent: 'six weeks' }, ', not six months.'],
    titleWidth: 900,
    top: 172,
    height: 486,
    gap: 18,
    // Narrower than the full gutter width on purpose. At 973px of copy every
    // description lands on one short line and the whole schedule reads as a
    // left-hand stripe; pulling the right edge in gives each row two lines and
    // a shape. The rows have the height for it — 82px each — because the glyph
    // sits beside the title in this orientation rather than above it.
    insetRight: 470,
    milestones: [
      {
        date: 'Week 1',
        icon: 'flag',
        title: 'Kick-off and account setup',
        description:
          'Users, permissions and the event calendar configured live on the call, with your housing leads in the room rather than in a follow-up email.',
      },
      {
        date: 'Weeks 2–3',
        icon: 'inventory_2',
        title: 'Hotels and contracts loaded',
        description:
          'Existing contracts imported, then rate structures, cut-off dates and attrition terms mapped onto EventPipe as your team would describe them.',
      },
      {
        date: 'Week 4',
        state: 'current',
        icon: 'palette',
        title: 'Booking sites branded',
        description:
          'Event sites styled to your brand and to each organiser brand you carry, then reviewed together before anything is pointed at a live domain.',
      },
      {
        date: 'Week 5',
        icon: 'school',
        title: 'Team training',
        description:
          'Two sessions for housing coordinators and one for finance, all recorded so the hire you make in August gets the same onboarding.',
      },
      {
        date: 'Week 6',
        icon: 'rocket_launch',
        title: 'First event live',
        description:
          'A real event opens for booking with your implementation lead watching pickup daily for the first two weeks, not a support queue.',
      },
    ],
  },
}
