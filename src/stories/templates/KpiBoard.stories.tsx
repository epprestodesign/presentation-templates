import type { Meta, StoryObj } from '@storybook/react-vite'
import { KpiBoard } from '../../templates/KpiBoard'

/** TEMPLATES / KPI Board — one headline metric held large, the supporting
 *  metrics tiled beside it, every tile carrying a delta against plan.
 *
 * EVERY FIGURE HERE IS INVENTED, including the plan variances. Story data is
 * this template's public specimen, so it has to be plausible without being
 * anyone's real number.
 */
const meta = {
  title: 'Slide Data/KPI Board',
  component: KpiBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## KPI Board

The operating-review slide: a large primary tile plus a grid of secondaries,
sized so one number is visibly the story.

Deltas use the semantic direction tokens — \`color.positive\` (emerald) for
better than plan, \`color.negative\` (coral) for worse. The arrow and the colour
are **separate fields**: \`direction\` points the arrow, \`intent\` decides the
colour. Churn falling and bookings rising are both good news, so a board that
colours by direction alone gets one of them wrong every time. \`intent\`
defaults to up-is-good and is stated only on the metrics where that is false.

On the gradient the soft tints behind a chip vanish and emerald on teal loses
the distinction entirely, so a chip on a brand tile takes a white plate and
keeps its semantic ink.
        `,
      },
    },
  },
} satisfies Meta<typeof KpiBoard>

export default meta
type Story = StoryObj<typeof meta>

/** The standard board: one primary on the gradient, four secondaries 2×2.
 *  Every delta here is favourable, which is what makes it worth also shipping
 *  the mixed story below — a board where nothing is coral tells you nothing
 *  about whether the colour is wired up. */
export const StateOfTheBusiness: Story = {
  args: {
    eyebrow: 'FY26 Q2 Review',
    pageNumber: 3,
    title: ['The quarter in five numbers, ', { accent: 'all ahead of plan.' }],
    titleWidth: 980,
    primary: {
      label: 'Platform bookings',
      value: '$48.6M',
      icon: 'insights',
      delta: { value: '+9.4%', direction: 'up', label: 'vs plan' },
      note: 'Gross value of reservations confirmed through the platform in the quarter.',
    },
    tiles: [
      {
        label: 'Net revenue',
        value: '$11.2M',
        delta: { value: '+6.1%', direction: 'up', label: 'vs plan' },
      },
      {
        label: 'Gross margin',
        value: '78.4%',
        delta: { value: '+140 bps', direction: 'up', label: 'vs plan' },
      },
      {
        label: 'Active operators',
        value: '312',
        delta: { value: '+18', direction: 'up', label: 'vs plan' },
      },
      {
        label: 'Net retention',
        value: '118%',
        delta: { value: '+3 pts', direction: 'up', label: 'vs plan' },
      },
    ],
    footnote: 'Deltas are measured against the FY26 operating plan approved in November. Illustrative figures.',
  },
}

/** Six secondaries at 3-up, and the case the two-field delta model exists for.
 *
 *  Support backlog and cost per booking both fall, and both are green: the
 *  arrow points down while `intent` says that is good news. Sales cycle rises
 *  and is coral on the same logic reversed. A board that coloured by arrow
 *  direction would have all three exactly backwards.
 *
 *  Primary sits on the right here to show the board mirrors. */
export const AgainstPlan: Story = {
  args: {
    eyebrow: 'Operating Review',
    pageNumber: 4,
    title: 'Where we are ahead, and where we are not.',
    lead: 'Six supporting metrics against the same plan. Colour reads good-or-bad, never up-or-down.',
    titleWidth: 1000,
    primarySide: 'right',
    primaryWidth: 400,
    secondaryColumns: 3,
    top: 300,
    height: 336,
    primary: {
      label: 'Net new ARR',
      value: '$3.9M',
      // Not a trend glyph: the delta on this tile is negative, and an arrow in
      // the corner pointing the other way is the kind of detail that gets
      // spotted from the back of the room.
      icon: 'payments',
      delta: { value: '-4.2%', direction: 'down', intent: 'negative', label: 'vs plan' },
      note: 'Two enterprise renewals slipped into Q3; both have since closed.',
    },
    tiles: [
      {
        label: 'Support backlog',
        value: '84',
        delta: { value: '-31%', direction: 'down', intent: 'positive', label: 'vs plan' },
      },
      {
        label: 'Cost per booking',
        value: '$1.84',
        delta: { value: '-12%', direction: 'down', intent: 'positive', label: 'vs plan' },
      },
      {
        label: 'Sales cycle',
        value: '71 days',
        delta: { value: '+9 days', direction: 'up', intent: 'negative', label: 'vs plan' },
      },
      {
        label: 'Logo retention',
        value: '93%',
        delta: { value: '+1 pt', direction: 'up', label: 'vs plan' },
      },
      {
        label: 'Headcount',
        value: '146',
        delta: { value: 'on plan', direction: 'flat', label: 'vs plan' },
      },
      {
        label: 'Cash runway',
        value: '27 mo',
        delta: { value: '+2 mo', direction: 'up', label: 'vs plan' },
      },
    ],
    footnote: 'Illustrative figures. Colour reads better-or-worse than plan, not up-or-down — three of these fall, and two of those are good news.',
  },
}

/** An empty board, for picking the template up as a starting point. */
export const Blank: Story = {
  args: {
    eyebrow: 'Section',
    pageNumber: 1,
    title: ['Headline goes here, with ', { accent: 'the emphasis in teal.' }],
    titleWidth: 900,
    primary: {
      label: 'Headline metric',
      value: '00',
      delta: { value: '+0%', direction: 'flat', label: 'vs plan' },
      note: 'One line explaining what the headline number counts.',
    },
    tiles: [
      { label: 'Metric one', value: '00', delta: { value: '+0%', direction: 'up' } },
      { label: 'Metric two', value: '00', delta: { value: '-0%', direction: 'down' } },
      { label: 'Metric three', value: '00', delta: { value: '+0%', direction: 'up' } },
      { label: 'Metric four', value: '00', delta: { value: '0%', direction: 'flat' } },
    ],
    footnote: 'What the deltas are measured against, and as of when.',
  },
}
