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
      /* Texture around the game rather than the game itself — the travel day is
       * where EventPipe actually shows up, and the deck had no picture of it. */
      { slug: 'team-hotel-arrival', query: 'young athletes with sports bags walking' },
      // Reworded: the original 'sports duffel bags gym corridor floor' returned
      // zero results — Unsplash narrows hard on long literal phrases.
      { slug: 'gear-bags-corridor', query: 'sports bags equipment' },
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
      /* The operator's desk, for the diagram and process templates: what the
       * person on the other side of the software is actually sitting at. */
      { slug: 'dual-screen-desk', query: 'dual monitors desk office workstation' },
      { slug: 'wall-calendar-planning', query: 'wall calendar planner office wall' },
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
      /* Two more divider surfaces: one cool and architectural, one warm and
       * papery, so consecutive dividers in a long deck need not repeat. */
      { slug: 'glass-steel-detail', query: 'glass and steel building facade detail' },
      { slug: 'paper-texture', query: 'textured paper close up neutral background' },
    ],
  },
  /* --- Added for the documentation templates ---------------------------
   *
   * Timeline, Process, Quote and KPI Board arrived after the original brief was
   * written, and they want pictures the deck did not previously need: a face
   * for an attributed quote, and the ordinary operational scenes an internal
   * deck uses — onboarding, a working session, a review.
   *
   * Portraits are squarish because Quote crops them to a circle; a landscape
   * frame crops to a slice of cheek. */
  {
    group: 'documentation',
    why: 'Internal and external explainer decks: onboarding, process, QBRs, all-hands.',
    topics: [
      { slug: 'onboarding-session', query: 'training session laptop colleagues' },
      { slug: 'whiteboard-planning', query: 'whiteboard planning sticky notes team' },
      { slug: 'working-session', query: 'two people working laptop desk office' },
      { slug: 'quarterly-review', query: 'business review meeting presentation screen' },
      { slug: 'documentation-desk', query: 'organised desk notebook laptop overhead' },
      { slug: 'video-call', query: 'video call remote meeting laptop screen' },
    ],
  },
  {
    group: 'portraits',
    why: 'Attributed quotes and team slides. Squarish because Quote and TeamGrid crop to a circle.',
    topics: [
      { slug: 'portrait-woman-professional', query: 'professional woman portrait plain background', orientation: 'squarish' },
      { slug: 'portrait-man-professional', query: 'professional man portrait plain background', orientation: 'squarish' },
      { slug: 'portrait-smiling-candid', query: 'candid smiling professional headshot', orientation: 'squarish' },
      { slug: 'portrait-outdoor-natural', query: 'natural light portrait person outdoors', orientation: 'squarish' },
    ],
  },
  /* --- Added for the diagram and timeline templates --------------------
   *
   * hotels-housing shows the hotel as a GUEST sees it — a lobby, a room, a key
   * card. The diagram, process and timeline templates need the hotel as STAFF
   * see it: the handover, the cart, the printed rooming list, the loading of a
   * shuttle. That operational half was missing entirely. */
  {
    group: 'hotel-operations',
    why: 'The staff-side hotel: handovers, housekeeping, the rooming list, the shuttle. Process and timeline steps need a picture of the work, not of the lobby.',
    topics: [
      { slug: 'front-desk-handover', query: 'hotel staff behind front desk computer' },
      { slug: 'housekeeping-cart', query: 'hotel housekeeping cart hallway' },
      { slug: 'rooming-list', query: 'clipboard checklist paper pen desk' },
      { slug: 'shuttle-loading', query: 'passengers boarding bus with luggage' },
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
