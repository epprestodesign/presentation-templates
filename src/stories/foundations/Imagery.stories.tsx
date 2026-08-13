import type { Meta, StoryObj } from '@storybook/react-vite'
import { imagery, imageryNames } from '../../assets/imagery'
import { radius } from '../../tokens/tokens.js'
import { Code, Grid, Page, Section, Specimen } from './_docs'

const devices = import.meta.glob<string>('../../assets/devices/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})
const team = import.meta.glob<string>('../../assets/team/**/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

/** FOUNDATIONS / Imagery — every photo the deck can use, by name. */
const meta = {
  title: 'Foundations/Imagery',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Imagery

Photos are addressed **by name**, not by import: \`img('mosaic/reception-bell')\`.
That keeps a slide spec as plain data an agent can write, and an unknown name
throws with the list of valid ones rather than rendering a silent broken image.

Everything here was **recovered from the reference decks**, which arrived as
flattened 2x exports with no separate assets. \`scripts/detect-images.mjs\` finds
each rect by reading pixels — mask non-white, dilate to close gaps inside a
photo, label connected components, then separate photos from text by how densely
each box is filled. \`pnpm crop:images\` cuts them out and is idempotent.

Crops are kept at their original **2x** resolution, so a slide exported at 2x
never upscales a photo.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Group names by their folder, so the page reads by role. */
function byFolder(names: string[]) {
  const groups = new Map<string, string[]>()
  for (const name of names) {
    const folder = name.includes('/') ? name.split('/')[0] : 'root'
    if (!groups.has(folder)) groups.set(folder, [])
    groups.get(folder)!.push(name)
  }
  return [...groups.entries()]
}

const FOLDER_NOTES: Record<string, string> = {
  mosaic: 'Slide 01’s opening mosaic. The rects are asymmetric by design, so they are placed absolutely rather than on a grid.',
  sports: 'Slide 04’s youth-sports TAM mosaic. Mirrors slide 01’s geometry with the tall frames in the other column.',
  'operating-layer': 'The five cards on slide 03. Detected with a tighter white threshold so the #f5f5f5 card fill did not come along with the photo.',
  value: 'The four value-creation cards on slide 10.',
  clusters: 'Slide 2-01’s floating photo cluster, cropped as ONE image — the lower photo overlaps the gap between the two above it, so they are genuinely one connected region. Keeping it whole also preserves the drop shadows.',
  'full-bleed': 'Whole-slide compositions. These are a photo inside a branded gradient frame with one large rounded corner, which is not a simple inset, so the exact rebuild uses the full canvas.',
  root: 'Pre-masked cover imagery supplied directly.',
}

export const Photos: Story = {
  render: () => (
    <Page>
      {byFolder(imageryNames).map(([folder, names]) => (
        <Section key={folder} title={folder} intro={FOLDER_NOTES[folder]}>
          <Grid min={190}>
            {names.map((name) => (
              <Specimen
                key={name}
                label={name.split('/').pop()!}
                meta={name}
                minHeight={132}
                style={{ padding: 10 }}
              >
                <img
                  src={imagery[name]}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    maxHeight: 112,
                    borderRadius: radius.image,
                    objectFit: 'contain',
                  }}
                />
              </Specimen>
            ))}
          </Grid>
        </Section>
      ))}
    </Page>
  ),
}

/** The named headshots. */
export const Headshots: Story = {
  render: () => (
    <Page>
      <Section
        title="Team headshots"
        intro="Named per person rather than left as the exported frame numbers — `rounded/` matches the leadership row, `circle/` the account-team grid and the contact cards. Anonymous filenames would make an agent-authored team slide unreadable."
      >
        <Grid min={150}>
          {Object.entries(team).map(([path, url]) => {
            const rel = path.replace(/^.*\/team\//, '').replace(/\.png$/, '')
            return (
              <Specimen key={path} label={rel.split('/').pop()!} meta={rel} minHeight={128}>
                <img src={url} alt="" style={{ maxWidth: '100%', maxHeight: 108, objectFit: 'contain' }} />
              </Specimen>
            )
          })}
        </Grid>
      </Section>
    </Page>
  ),
}

/** Device mockups. */
export const DeviceMockups: Story = {
  render: () => (
    <Page>
      <Section
        title="Device mockups"
        intro="Supplied as transparent 2x PNGs. Used by the Device Showcase template to frame product screenshots."
      >
        <Grid min={190}>
          {Object.entries(devices).map(([path, url]) => (
            <Specimen
              key={path}
              label={path.split('/').pop()!.replace(/\.png$/, '')}
              minHeight={150}
              style={{ padding: 10 }}
            >
              <img src={url} alt="" style={{ maxWidth: '100%', maxHeight: 130, objectFit: 'contain' }} />
            </Specimen>
          ))}
        </Grid>
      </Section>
      <div>
        <Code>{Object.keys(devices).length} device frames · {imageryNames.length} photos</Code>
      </div>
    </Page>
  ),
}
