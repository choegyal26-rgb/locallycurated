/**
 * Venue name → [lat, lng] lookup for the homepage map.
 * Match against e.venue (case-insensitive substring) to place real
 * events as pins. Events whose venue isn't in this table are skipped
 * from the map (they still appear in digests).
 *
 * Add venues by name + coords. Substring match makes "GAMH" hit
 * "Great American Music Hall" too, etc.
 */
type VenueEntry = { name: string; aliases: string[]; lat: number; lng: number };

export const VENUE_COORDS: VenueEntry[] = [
  // Music venues — already scraped via venues.ts
  { name: "The Independent", aliases: ["independent"], lat: 37.7758, lng: -122.4376 },
  { name: "The Chapel", aliases: ["chapel"], lat: 37.7639, lng: -122.4203 },
  { name: "Great American Music Hall", aliases: ["gamh", "great american"], lat: 37.7843, lng: -122.4185 },
  { name: "Public Works", aliases: ["public works"], lat: 37.7665, lng: -122.4198 },

  // Common SF venues
  { name: "The Fillmore", aliases: ["fillmore"], lat: 37.7842, lng: -122.4329 },
  { name: "Bottom of the Hill", aliases: ["bottom of the hill"], lat: 37.7659, lng: -122.3961 },
  { name: "August Hall", aliases: ["august hall"], lat: 37.7858, lng: -122.4118 },
  { name: "1015 Folsom", aliases: ["1015"], lat: 37.7785, lng: -122.4055 },
  { name: "The Warfield", aliases: ["warfield"], lat: 37.7826, lng: -122.4101 },
  { name: "Bimbo's 365", aliases: ["bimbo"], lat: 37.8060, lng: -122.4170 },
  { name: "The Saloon", aliases: ["saloon"], lat: 37.7984, lng: -122.4079 },
  { name: "Sweetwater", aliases: ["sweetwater"], lat: 37.9026, lng: -122.5391 },

  // Cinemas / cultural
  { name: "Balboa Theater", aliases: ["balboa"], lat: 37.7775, lng: -122.4644 },
  { name: "Roxie Theater", aliases: ["roxie"], lat: 37.7644, lng: -122.4220 },
  { name: "Castro Theatre", aliases: ["castro theatre"], lat: 37.7613, lng: -122.4350 },
  { name: "SFMOMA", aliases: ["sfmoma"], lat: 37.7857, lng: -122.4011 },
  { name: "de Young Museum", aliases: ["de young"], lat: 37.7714, lng: -122.4687 },
  { name: "Club Fugazi", aliases: ["fugazi"], lat: 37.7989, lng: -122.4099 },

  // Food / civic
  { name: "Ferry Building", aliases: ["ferry building", "ferry bldg"], lat: 37.7956, lng: -122.3933 },
  { name: "Outerlands", aliases: ["outerlands"], lat: 37.7593, lng: -122.5103 },
  { name: "The Midway", aliases: ["midway"], lat: 37.7548, lng: -122.3897 },
  { name: "Stern Grove", aliases: ["stern grove"], lat: 37.7383, lng: -122.4818 },

  // East Bay
  { name: "Fox Theater Oakland", aliases: ["fox theater", "fox oakland"], lat: 37.8087, lng: -122.2701 },
  { name: "The New Parish", aliases: ["new parish"], lat: 37.8077, lng: -122.2727 },
  { name: "The Greek Theatre", aliases: ["greek theatre"], lat: 37.8736, lng: -122.2542 },
];

export function findVenueCoords(venue: string | null): [number, number] | null {
  if (!venue) return null;
  const v = venue.toLowerCase();
  const hit = VENUE_COORDS.find(
    (entry) => entry.aliases.some((a) => v.includes(a)) || v.includes(entry.name.toLowerCase()),
  );
  return hit ? [hit.lat, hit.lng] : null;
}
