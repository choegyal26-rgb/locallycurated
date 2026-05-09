import { sendEmail, type EmailResult } from "@/lib/email";

export const WELCOME_VERSIONS: string[] = [
  // v1
  `Welcome to LocallyCurated.

On the day you signed up, the Bay kept moving the way it always does—quietly, without announcement. Fog pulled back from the Golden Gate in slow sheets, revealing the outline of something familiar, something that never quite repeats itself the same way twice. Across the water, ferries cut through the morning with a kind of certainty, while somewhere in Oakland, someone unlocked a small venue door hours before anyone would arrive, setting up lights that would only matter later, for a few hours, to a handful of people.

That's how most things here begin—without spectacle.

The Bay Area has always been less about what is obvious and more about what is discovered. A room above a café where a musician plays to twenty people. A conversation that turns into something bigger months later. A pop-up dinner that exists for one night and then disappears into memory. These moments rarely announce themselves. They wait.

What you've signed up for isn't just a list of events. It's a way of noticing—of catching things before they pass, of being just a little more in sync with what's unfolding around you. Every two weeks, you'll receive a small dispatch of what's new, what's forming, and what might be worth stepping out for.

Not everything will matter to you. That's the point. But somewhere in each edition, there will be something that feels like it was placed there on purpose.

Until your first dispatch arrives, the Bay will keep doing what it does best—quietly creating things worth finding.

We'll help you find a few of them.`,

  // v2
  `Welcome to LocallyCurated.

The Bay doesn't really pause. Even on the day you signed up, something was already in motion—someone sound-checking in a room that won't fill until later, a gallery door propped open for the first time that week, a table being set for a dinner that doesn't exist anywhere else but here, tonight.

Most of it happens quietly.

There's a rhythm to this place that doesn't follow headlines or schedules. It moves through neighborhoods, through small decisions, through people choosing to make something—knowing full well it might only last a few hours, or reach a handful of others. And still, they do it.

That's what makes the Bay feel the way it does.

You don't need to see everything. No one does. But every now and then, you catch something at the right moment—a set, a space, a conversation—and it shifts how you see the rest of your week. Not dramatically. Just enough.

What you've stepped into here is a way of catching more of those moments before they pass. Every two weeks, we'll send a small selection of what's newly forming around you—events that feel worth the time, not just worth listing.

It won't be everything. It shouldn't be.

But somewhere in there, something will feel like it found you at the right time.

Until then, things will keep unfolding across the Bay—rooms opening, lights warming up, people showing up without knowing exactly what they'll walk into.

We'll make sure you hear about a few of them.`,

  // v3
  `Welcome to LocallyCurated.

If you stood still for a moment on the day you signed up, you might have noticed how much was already happening around you. Not loudly, not all at once—but in fragments. A line forming outside a place that wasn't there last year. A flyer taped slightly crooked to a window. Music spilling out onto a street just long enough to make you slow down.

That's usually how it starts.

The Bay has never needed permission to create something new. It just does—between neighborhoods, between people, between moments that don't always look important until later. What lasts isn't always what's planned. It's what people decide to show up for.

And showing up, here, has its own kind of weight.

Not because everything is worth it—but because the right things are.

What you've signed up for is a way to stay closer to those right things. Every two weeks, we'll send you a small, considered set of events that feel like they belong—not just to the city, but to the moment they're happening in.

No overload. No noise.

Just enough to make it easier to say yes when something feels right.

Between now and your first dispatch, the Bay will keep layering itself—new ideas on top of old spaces, new people inside familiar rooms, new energy moving through places you've passed before.

Somewhere in all of that, something will be worth your time.

We'll make sure you don't miss it.`,

  // v4
  `Welcome to LocallyCurated.

There's a certain kind of detail you only notice if you're paying attention. The way the light hits the hills in the late afternoon. The way a space feels different once it fills, even if nothing about it has changed. The way a city like this keeps rearranging itself without asking anyone first.

On the day you signed up, all of that was already happening.

The Bay isn't built on single moments—it's built on accumulation. Small things, layered over time. A venue that used to be something else. A crowd that forms around a sound you hadn't heard before. A night that doesn't seem like much until you're in the middle of it.

And then, suddenly, it is.

Most of these things don't announce themselves ahead of time. They don't need to. They exist for the people who find them, or for the people who were already looking.

That's where this comes in.

Every two weeks, we'll send you a quiet selection of what's been taking shape across the Bay—events that feel intentional, current, and worth stepping into. Not everything. Just enough.

Enough to keep you connected to what's forming, without having to search for it.

Until then, the city will keep moving in its usual way—building things in plain sight, creating moments that only exist for a short time, and then making space for the next ones.

We'll help you stay close to a few of them.`,

  // v5
  `Welcome to LocallyCurated.

Some places ask for your attention. The Bay doesn't. It assumes you'll notice, eventually.

On the day you signed up, there were already a dozen things unfolding that wouldn't be there next week. A set that only exists for one night. A gathering that feels unplanned but somehow isn't. A space being used in a way it wasn't meant to be, and somehow working better because of it.

That's the pattern here.

Things appear, take shape, and move on—leaving behind just enough to make you wonder what else you've been missing.

Not everything is meant to be found. But some things are.

And when you do find them, it rarely feels accidental.

This isn't about seeing more. It's about seeing better—catching the things that feel like they belong in your week before they pass by unnoticed.

Every two weeks, we'll send you a small set of events that feel aligned with that idea. Things that are new, relevant, and worth stepping out for—not because they're popular, but because they're happening at the right time, in the right place.

The rest, you can let go.

Between now and your first dispatch, the Bay will keep doing what it always does—shifting, building, dissolving, and starting again.

Somewhere in that cycle, there will be something meant for you.

We'll help you find it.`,
];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildWelcomeHTML(opts: {
  version: string;
  unsubscribeUrl: string;
}) {
  const { version, unsubscribeUrl } = opts;
  const [titleLine, ...rest] = version.split("\n\n");
  const bodyParagraphs = rest
    .map(
      (p) =>
        `<p style="color:#1a1a1a;font-size:16px;line-height:1.7;margin:0 0 18px 0;">${escapeHtml(p.trim())}</p>`,
    )
    .join("");

  return `<!doctype html><html><body style="font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif;background:#fdfaf4;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:40px;">
    <h1 style="font-size:22px;margin:0 0 24px 0;font-weight:600;color:#1a1a1a;">${escapeHtml(titleLine.trim())}</h1>
    ${bodyParagraphs}
    <p style="color:#999;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px;font-family:ui-sans-serif,system-ui,sans-serif;">
      You're getting this because you signed up at locallycurated.co.
      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#999;">Unsubscribe</a>.
    </p>
  </div></body></html>`;
}

export function pickWelcomeVersion(): { index: number; text: string } {
  const index = Math.floor(Math.random() * WELCOME_VERSIONS.length);
  return { index, text: WELCOME_VERSIONS[index] };
}

export async function sendWelcome(opts: {
  to: string;
  subscriberId: string;
}): Promise<EmailResult & { versionIndex?: number }> {
  const { index, text } = pickWelcomeVersion();
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/unsubscribe?id=${opts.subscriberId}`;
  const html = buildWelcomeHTML({ version: text, unsubscribeUrl });
  const result = await sendEmail({
    to: opts.to,
    subject: "Welcome to LocallyCurated",
    html,
  });
  return { ...result, versionIndex: index };
}
