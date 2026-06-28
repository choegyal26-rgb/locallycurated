/**
 * Venue name → [lat, lng] lookup for the homepage map.
 *
 * Two layers:
 * 1. Specific venue match (substring against name + aliases).
 * 2. Neighborhood fallback — if no specific venue hits but the venue
 *    string contains a known SF neighborhood, place the pin at that
 *    neighborhood's centroid. Keeps the map spread out instead of
 *    everything clustering in SoMa.
 *
 * Add more entries freely — bigger lookup = better coverage.
 */
type VenueEntry = { name: string; aliases: string[]; lat: number; lng: number };

export const VENUE_COORDS: VenueEntry[] = [
  // —— Music venues (already-scraped sources) ——
  { name: "The Independent", aliases: ["independent"], lat: 37.7758, lng: -122.4376 },
  { name: "The Chapel", aliases: ["chapel"], lat: 37.7639, lng: -122.4203 },
  { name: "Great American Music Hall", aliases: ["gamh", "great american"], lat: 37.7843, lng: -122.4185 },
  { name: "Public Works", aliases: ["public works"], lat: 37.7665, lng: -122.4198 },

  // —— Music — broader SF ——
  { name: "The Fillmore", aliases: ["fillmore"], lat: 37.7842, lng: -122.4329 },
  { name: "Bottom of the Hill", aliases: ["bottom of the hill"], lat: 37.7659, lng: -122.3961 },
  { name: "August Hall", aliases: ["august hall"], lat: 37.7858, lng: -122.4118 },
  { name: "1015 Folsom", aliases: ["1015"], lat: 37.7785, lng: -122.4055 },
  { name: "The Warfield", aliases: ["warfield"], lat: 37.7826, lng: -122.4101 },
  { name: "Bimbo's 365", aliases: ["bimbo"], lat: 37.806, lng: -122.417 },
  { name: "The Saloon", aliases: ["saloon"], lat: 37.7984, lng: -122.4079 },
  { name: "Cafe du Nord", aliases: ["du nord"], lat: 37.7647, lng: -122.4319 },
  { name: "Bender's", aliases: ["benders"], lat: 37.7607, lng: -122.4194 },
  { name: "The Knockout", aliases: ["knockout"], lat: 37.7508, lng: -122.4221 },
  { name: "Brick & Mortar", aliases: ["brick & mortar", "brick and mortar"], lat: 37.7666, lng: -122.4216 },
  { name: "Make-Out Room", aliases: ["make-out room", "makeout room"], lat: 37.7517, lng: -122.4198 },
  { name: "Rickshaw Stop", aliases: ["rickshaw"], lat: 37.7775, lng: -122.4196 },

  // —— Cinemas / cultural ——
  { name: "Balboa Theater", aliases: ["balboa"], lat: 37.7775, lng: -122.4644 },
  { name: "Roxie Theater", aliases: ["roxie"], lat: 37.7644, lng: -122.422 },
  { name: "Castro Theatre", aliases: ["castro theatre", "castro theater"], lat: 37.7613, lng: -122.435 },
  { name: "Vogue Theatre", aliases: ["vogue theatre"], lat: 37.7872, lng: -122.4549 },
  { name: "Alamo Drafthouse", aliases: ["alamo drafthouse"], lat: 37.7574, lng: -122.4216 },
  { name: "SFMOMA", aliases: ["sfmoma"], lat: 37.7857, lng: -122.4011 },
  { name: "de Young Museum", aliases: ["de young"], lat: 37.7714, lng: -122.4687 },
  { name: "Asian Art Museum", aliases: ["asian art museum"], lat: 37.7799, lng: -122.4163 },
  { name: "Exploratorium", aliases: ["exploratorium"], lat: 37.8017, lng: -122.3973 },
  { name: "Club Fugazi", aliases: ["fugazi"], lat: 37.7989, lng: -122.4099 },
  { name: "Yerba Buena Center", aliases: ["yerba buena"], lat: 37.7846, lng: -122.4031 },

  // —— Food / civic / outdoor ——
  { name: "Ferry Building", aliases: ["ferry building", "ferry bldg"], lat: 37.7956, lng: -122.3933 },
  { name: "Outerlands", aliases: ["outerlands"], lat: 37.7593, lng: -122.5103 },
  { name: "The Midway", aliases: ["midway"], lat: 37.7548, lng: -122.3897 },
  { name: "Stern Grove", aliases: ["stern grove"], lat: 37.7383, lng: -122.4818 },
  { name: "Crissy Field", aliases: ["crissy field"], lat: 37.8033, lng: -122.4646 },
  { name: "Dolores Park", aliases: ["dolores park"], lat: 37.7596, lng: -122.4269 },
  { name: "The Riptide", aliases: ["riptide"], lat: 37.7351, lng: -122.5052 },
  { name: "Trick Dog", aliases: ["trick dog"], lat: 37.7619, lng: -122.4135 },
  { name: "Bar Agricole", aliases: ["agricole"], lat: 37.7747, lng: -122.4063 },
  { name: "Smitten", aliases: ["smitten"], lat: 37.7761, lng: -122.426 },

  // —— Pacific Heights / Marina ——
  { name: "Sports Basement Presidio", aliases: ["sports basement"], lat: 37.7985, lng: -122.4587 },

  // —— East Bay ——
  { name: "Fox Theater Oakland", aliases: ["fox theater", "fox oakland"], lat: 37.8087, lng: -122.2701 },
  { name: "The New Parish", aliases: ["new parish"], lat: 37.8077, lng: -122.2727 },
  { name: "The Greek Theatre", aliases: ["greek theatre"], lat: 37.8736, lng: -122.2542 },
  { name: "Eli's Mile High Club", aliases: ["eli's", "elis mile"], lat: 37.8221, lng: -122.2683 },
  { name: "Sweetwater", aliases: ["sweetwater"], lat: 37.9026, lng: -122.5391 },

  // —— Peninsula / South Bay ——
  { name: "Shoreline Amphitheatre", aliases: ["shoreline amphitheatre", "shoreline"], lat: 37.4268, lng: -122.0804 },
  { name: "Computer History Museum", aliases: ["computer history museum"], lat: 37.4143, lng: -122.0774 },
  { name: "Mountain View Center for the Performing Arts", aliases: ["mountain view center"], lat: 37.3895, lng: -122.0801 },
  { name: "Castro Street Mountain View", aliases: ["castro street mountain view"], lat: 37.3939, lng: -122.0796 },
  { name: "Bing Concert Hall", aliases: ["bing concert hall"], lat: 37.4324, lng: -122.1677 },
  { name: "The Guild Theatre", aliases: ["guild theatre", "guild theater"], lat: 37.4534, lng: -122.1822 },
  { name: "Palo Alto Art Center", aliases: ["palo alto art center"], lat: 37.4431, lng: -122.1418 },
  { name: "San Jose Civic", aliases: ["san jose civic"], lat: 37.3308, lng: -121.8887 },
  { name: "The Ritz San Jose", aliases: ["ritz san jose", "the ritz"], lat: 37.3352, lng: -121.8916 },
  { name: "SAP Center", aliases: ["sap center"], lat: 37.3328, lng: -121.9012 },
  { name: "San Jose Museum of Art", aliases: ["san jose museum of art", "sjma"], lat: 37.3337, lng: -121.8899 },
  { name: "California Theatre", aliases: ["california theatre", "california theater"], lat: 37.3303, lng: -121.8882 },
];

/**
 * Fallback: when the venue name contains a known SF neighborhood,
 * drop the pin at that neighborhood's centroid. Spreads the map out
 * even when we don't have the specific venue coords yet.
 */
const NEIGHBORHOODS: VenueEntry[] = [
  { name: "Mission", aliases: ["mission district", "mission"], lat: 37.7599, lng: -122.4148 },
  { name: "Castro", aliases: ["castro"], lat: 37.7613, lng: -122.435 },
  { name: "Haight", aliases: ["haight", "haight-ashbury"], lat: 37.7702, lng: -122.4467 },
  { name: "North Beach", aliases: ["north beach"], lat: 37.8005, lng: -122.4105 },
  { name: "Chinatown", aliases: ["chinatown"], lat: 37.7942, lng: -122.4071 },
  { name: "SoMa", aliases: ["soma", "south of market"], lat: 37.7785, lng: -122.4015 },
  { name: "Tenderloin", aliases: ["tenderloin"], lat: 37.7843, lng: -122.4145 },
  { name: "Hayes Valley", aliases: ["hayes valley"], lat: 37.7765, lng: -122.426 },
  { name: "Lower Haight", aliases: ["lower haight"], lat: 37.7727, lng: -122.434 },
  { name: "Western Addition", aliases: ["western addition"], lat: 37.7806, lng: -122.4344 },
  { name: "Pacific Heights", aliases: ["pacific heights"], lat: 37.7918, lng: -122.4385 },
  { name: "Cow Hollow", aliases: ["cow hollow"], lat: 37.7976, lng: -122.4395 },
  { name: "Marina", aliases: ["marina district", "marina"], lat: 37.8019, lng: -122.4377 },
  { name: "Presidio", aliases: ["presidio"], lat: 37.7989, lng: -122.4662 },
  { name: "Richmond", aliases: ["inner richmond", "outer richmond", "richmond district", "richmond"], lat: 37.7795, lng: -122.4646 },
  { name: "Sunset", aliases: ["inner sunset", "outer sunset", "sunset district", "sunset"], lat: 37.756, lng: -122.4953 },
  { name: "Noe Valley", aliases: ["noe valley"], lat: 37.7501, lng: -122.4337 },
  { name: "Bernal Heights", aliases: ["bernal heights", "bernal"], lat: 37.7407, lng: -122.4156 },
  { name: "Glen Park", aliases: ["glen park"], lat: 37.7338, lng: -122.4344 },
  { name: "Excelsior", aliases: ["excelsior"], lat: 37.7253, lng: -122.4366 },
  { name: "Bayview", aliases: ["bayview"], lat: 37.7299, lng: -122.391 },
  { name: "Dogpatch", aliases: ["dogpatch"], lat: 37.7548, lng: -122.3897 },
  { name: "Potrero Hill", aliases: ["potrero hill", "potrero"], lat: 37.7596, lng: -122.4012 },
  { name: "Mission Bay", aliases: ["mission bay"], lat: 37.77, lng: -122.391 },
  { name: "Embarcadero", aliases: ["embarcadero"], lat: 37.7956, lng: -122.3933 },
  { name: "FiDi", aliases: ["financial district", "fidi"], lat: 37.7935, lng: -122.4022 },
  { name: "Nob Hill", aliases: ["nob hill"], lat: 37.7929, lng: -122.4145 },
  { name: "Russian Hill", aliases: ["russian hill"], lat: 37.8014, lng: -122.418 },
  { name: "Telegraph Hill", aliases: ["telegraph hill"], lat: 37.8023, lng: -122.4058 },
  { name: "Twin Peaks", aliases: ["twin peaks"], lat: 37.7544, lng: -122.4477 },
  // East Bay
  { name: "Downtown Oakland", aliases: ["downtown oakland", "oakland"], lat: 37.8044, lng: -122.2712 },
  { name: "Berkeley", aliases: ["berkeley"], lat: 37.8716, lng: -122.273 },
  { name: "Temescal", aliases: ["temescal"], lat: 37.8377, lng: -122.2637 },
  { name: "Jack London", aliases: ["jack london"], lat: 37.7951, lng: -122.2776 },
  { name: "Uptown Oakland", aliases: ["uptown oakland", "uptown"], lat: 37.8098, lng: -122.269 },
  { name: "Alameda", aliases: ["alameda"], lat: 37.7652, lng: -122.2416 },
  // Peninsula / South Bay
  { name: "Mountain View", aliases: ["mountain view"], lat: 37.3861, lng: -122.0839 },
  { name: "Palo Alto", aliases: ["palo alto"], lat: 37.4419, lng: -122.143 },
  { name: "Menlo Park", aliases: ["menlo park"], lat: 37.453, lng: -122.1817 },
  { name: "San Mateo", aliases: ["san mateo"], lat: 37.5629, lng: -122.3255 },
  { name: "Redwood City", aliases: ["redwood city"], lat: 37.4852, lng: -122.2364 },
  { name: "Sunnyvale", aliases: ["sunnyvale"], lat: 37.3688, lng: -122.0363 },
  { name: "Santa Clara", aliases: ["santa clara"], lat: 37.3541, lng: -121.9552 },
  { name: "San Jose", aliases: ["san jose"], lat: 37.3382, lng: -121.8863 },
];

const AREA_CENTROIDS: Record<string, [number, number]> = {
  sf: [37.7749, -122.4194],
  "east-bay": [37.8079, -122.2628],
  peninsula: [37.521, -122.258],
  "south-bay": [37.3861, -122.0839],
  "north-bay": [37.9735, -122.5311],
};

/**
 * Try venue first, fall back to neighborhood centroid. Small jitter
 * (~80m) is added to neighborhood-fallback pins so multiple events
 * in the same neighborhood don't perfectly stack.
 */
export function findVenueCoords(
  venue: string | null,
  jitterSeed?: string,
): [number, number] | null {
  if (!venue) return null;
  const v = venue.toLowerCase();

  // Exact venue match
  const venueHit = VENUE_COORDS.find(
    (entry) => entry.aliases.some((a) => v.includes(a)) || v.includes(entry.name.toLowerCase()),
  );
  if (venueHit) return [venueHit.lat, venueHit.lng];

  // Neighborhood fallback
  const hoodHit = NEIGHBORHOODS.find(
    (entry) => entry.aliases.some((a) => v.includes(a)) || v.includes(entry.name.toLowerCase()),
  );
  if (hoodHit) {
    const jitter = jitterFromSeed(jitterSeed ?? venue);
    return [hoodHit.lat + jitter.dLat, hoodHit.lng + jitter.dLng];
  }

  return null;
}

export function findEventCoords(opts: {
  venue: string | null;
  city?: string | null;
  area?: string | null;
  jitterSeed?: string;
}): [number, number] | null {
  const haystack = [opts.venue, opts.city, opts.area].filter(Boolean).join(" ");
  const exact = findVenueCoords(haystack, opts.jitterSeed);
  if (exact) return exact;

  if (opts.area && AREA_CENTROIDS[opts.area]) {
    const [lat, lng] = AREA_CENTROIDS[opts.area];
    const jitter = jitterFromSeed(opts.jitterSeed ?? haystack);
    return [lat + jitter.dLat * 5, lng + jitter.dLng * 5];
  }

  return null;
}

/** Deterministic ~80m jitter so the same event always lands in the same spot. */
function jitterFromSeed(seed: string): { dLat: number; dLng: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  // ~0.0007 degrees ≈ 80m
  const dLat = (((h & 0xff) / 255) - 0.5) * 0.0014;
  const dLng = ((((h >> 8) & 0xff) / 255) - 0.5) * 0.0014;
  return { dLat, dLng };
}
