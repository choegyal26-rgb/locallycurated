// Shared keyword-based topic inference, used by scrapers that don't get
// categories from the source (Funcheap RSS, Eventbrite HTML).
// Uses word-boundary matching so "art" doesn't match "partnership", etc.

const TOPIC_KEYWORDS: Record<string, string[]> = {
  music: [
    "concert", "music", "live band", "live music", "show",
    "acoustic", "festival", "symphony", "orchestra", "gig",
  ],
  nightlife: [
    "dj", "club", "nightclub", "rave", "party", "nightlife",
    "warehouse", "after-hours", "afters",
  ],
  food: [
    "food", "wine", "beer", "tasting", "dinner", "brunch",
    "supper", "cocktail", "restaurant", "chef", "pop-up", "popup",
  ],
  art: [
    "art", "gallery", "exhibit", "exhibition", "museum", "mural",
    "opening", "artist", "ceramics", "painting",
  ],
  tech: [
    "tech", "ai", "developer", "hackathon", "startup", "coding",
    "founder", "saas", "engineer", "robotics",
  ],
  comedy: ["comedy", "stand-up", "standup", "improv", "comic"],
  sports: [
    "run", "marathon", "yoga", "fitness", "game", "match",
    "5k", "10k", "pickleball", "soccer", "basketball",
  ],
  outdoors: ["hike", "trail", "park", "outdoor", "garden", "kayak"],
  family: ["family", "kid", "kids", "children", "story time"],
  film: ["film", "movie", "screening", "cinema", "theater", "play"],
  wellness: [
    "meditation", "wellness", "wellbeing", "breathwork", "sound bath",
  ],
  community: [
    "community", "volunteer", "civic", "town hall", "rally", "networking",
  ],
};

// Pre-compile one regex per topic for word-boundary matching. We escape any
// regex metacharacters in keywords (none right now, but defensive).
function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TOPIC_REGEX: Record<string, RegExp> = Object.fromEntries(
  Object.entries(TOPIC_KEYWORDS).map(([topic, kws]) => [
    topic,
    new RegExp(`\\b(?:${kws.map(escape).join("|")})\\b`, "i"),
  ]),
);

export function inferTopics(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const [topic, re] of Object.entries(TOPIC_REGEX)) {
    if (re.test(text)) out.push(topic);
  }
  return out;
}
