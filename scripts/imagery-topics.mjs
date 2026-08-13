/* The curated imagery brief — what EventPipe decks actually need pictures of.
 *
 * This is the input to `pnpm imagery:fetch`. It exists as a checked-in manifest
 * rather than as ad-hoc search terms so that a fetch is REPRODUCIBLE: the same
 * manifest plus the same API returns the same library, and a teammate can see
 * why a photo is in the repo.
 *
 * `count` is deliberately modest per topic. A slide library wants a few strong,
 * on-brand options per subject, not fifty near-duplicates to scroll past — and
 * Unsplash's demo tier allows only 50 requests/hour, so restraint is also
 * practical.
 *
 * Topics map to the subject matter across the reference decks: youth sports
 * (the wedge), hotels and housing (the product), live events (the market),
 * payments and software (the platform), and people/teams (the company).
 */

/** @typedef {{ slug: string, query: string, count?: number, orientation?: 'landscape'|'portrait'|'squarish', note?: string }} Topic */

/** @type {{ group: string, why: string, topics: Topic[] }[]} */
export const IMAGERY_BRIEF = [
  {
    group: 'youth-sports',
    why: 'The wedge. Slides 04 and the TAM story lean on youth and amateur sport.',
    topics: [
      { slug: 'youth-baseball', query: 'youth baseball game' },
      { slug: 'youth-soccer', query: 'youth soccer tournament' },
      { slug: 'youth-basketball', query: 'youth basketball game indoor' },
      { slug: 'youth-hockey', query: 'youth ice hockey player' },
      { slug: 'youth-volleyball', query: 'youth volleyball tournament' },
      { slug: 'team-huddle', query: 'kids sports team huddle' },
      { slug: 'sports-parents-stands', query: 'parents watching youth sports bleachers' },
      { slug: 'tournament-venue', query: 'indoor sports complex courts' },
    ],
  },
  {
    group: 'hotels-housing',
    why: 'The product. Room blocks, check-in, and the hotel side of the marketplace.',
    topics: [
      { slug: 'hotel-lobby', query: 'modern hotel lobby interior' },
      { slug: 'hotel-reception', query: 'hotel reception check in desk' },
      { slug: 'hotel-room', query: 'hotel room double beds' },
      { slug: 'hotel-exterior', query: 'hotel exterior building daytime' },
      { slug: 'hotel-key-card', query: 'hotel key card door' },
      { slug: 'luggage-lobby', query: 'luggage suitcases hotel lobby' },
      { slug: 'hotel-breakfast', query: 'hotel breakfast buffet' },
      { slug: 'concierge', query: 'hotel concierge helping guest' },
    ],
  },
  {
    group: 'live-events',
    why: 'The market beyond sport — festivals, citywide events, esports.',
    topics: [
      { slug: 'stadium-crowd', query: 'stadium crowd cheering' },
      { slug: 'music-festival', query: 'music festival crowd stage' },
      { slug: 'convention-hall', query: 'convention center exhibition hall' },
      { slug: 'conference-audience', query: 'conference audience seated' },
      { slug: 'esports-arena', query: 'esports tournament arena' },
      { slug: 'city-skyline-event', query: 'city skyline evening downtown' },
    ],
  },
  {
    group: 'travel',
    why: 'Group travel and the attendee journey.',
    topics: [
      { slug: 'airport-terminal', query: 'airport terminal travellers walking' },
      { slug: 'team-bus', query: 'charter bus team travel' },
      { slug: 'road-trip-family', query: 'family road trip car' },
      { slug: 'booking-on-phone', query: 'person booking travel on phone' },
      { slug: 'map-planning', query: 'planning trip map laptop' },
    ],
  },
  {
    group: 'platform',
    why: 'Payments, software and the operator’s day — the least literal group, so it needs the most care.',
    topics: [
      { slug: 'payment-terminal', query: 'contactless card payment terminal' },
      { slug: 'dashboard-laptop', query: 'analytics dashboard laptop screen' },
      { slug: 'spreadsheet-work', query: 'person working spreadsheet desk' },
      { slug: 'developer-screen', query: 'software developer code screen' },
      { slug: 'phone-app-ui', query: 'hands holding phone app interface' },
      { slug: 'contract-signing', query: 'signing contract business documents' },
    ],
  },
  {
    group: 'people',
    why: 'Team, partnership and support slides. Faces, not stock-photo handshakes where avoidable.',
    topics: [
      { slug: 'team-meeting', query: 'small team meeting office collaboration' },
      { slug: 'customer-support', query: 'customer support headset representative' },
      { slug: 'handshake-partnership', query: 'business handshake meeting' },
      { slug: 'portrait-professional', query: 'professional portrait neutral background', orientation: 'squarish' },
      { slug: 'presenting-to-room', query: 'person presenting to small group' },
    ],
  },
  {
    group: 'abstract',
    why: 'Backgrounds and section dividers where a literal photo would be worse than a texture.',
    topics: [
      { slug: 'teal-gradient-texture', query: 'teal blue abstract gradient texture' },
      { slug: 'architecture-lines', query: 'minimal architecture lines blue' },
      { slug: 'network-abstract', query: 'abstract network connection lines' },
    ],
  },
]

/** Flattened topic list, with defaults applied. */
export function allTopics() {
  return IMAGERY_BRIEF.flatMap(({ group, topics }) =>
    topics.map((t) => ({
      count: 3,
      orientation: 'landscape',
      ...t,
      group,
      /** Where the files land, e.g. unsplash/hotels-housing/hotel-lobby-1.jpg */
      dir: `unsplash/${group}`,
    }))
  )
}
