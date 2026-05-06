export const TOPICS = [
  { id: "music", label: "Music & Concerts" },
  { id: "nightlife", label: "Nightlife & DJ Sets" },
  { id: "food", label: "Food & Drink" },
  { id: "art", label: "Art & Culture" },
  { id: "tech", label: "Tech & AI" },
  { id: "comedy", label: "Comedy" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "outdoors", label: "Outdoors & Hiking" },
  { id: "family", label: "Family & Kids" },
  { id: "film", label: "Film & Theater" },
  { id: "wellness", label: "Wellness" },
  { id: "community", label: "Community & Civic" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export const TOPIC_IDS = TOPICS.map((t) => t.id) as TopicId[];

export const AREAS = [
  { id: "sf", label: "San Francisco" },
  { id: "east-bay", label: "East Bay (Oakland, Berkeley)" },
  { id: "peninsula", label: "Peninsula (Daly City → San Mateo)" },
  { id: "south-bay", label: "South Bay (San Jose, Palo Alto)" },
  { id: "north-bay", label: "North Bay (Marin, Sonoma)" },
] as const;

export type AreaId = (typeof AREAS)[number]["id"];
export const AREA_IDS = AREAS.map((a) => a.id) as AreaId[];
