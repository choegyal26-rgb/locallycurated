import type { Metadata } from "next";
import { TOPICS, AREAS } from "@/lib/topics";
import { SiteBar, SiteFooter } from "@/components/SiteBar";
import {
  currentIssueNumber,
  nextDispatchDate,
  formatDispatchDate,
} from "@/lib/issue";

export const metadata: Metadata = {
  title: "Submit an event",
  description:
    "Got a Bay Area event others would miss? Submit it for review and we'll consider it for our next biweekly dispatch.",
  alternates: { canonical: "/submit" },
};

export default function Submit() {
  return (
    <main className="frame">
      <SiteBar
        issue={{
          primary: `Issue № ${currentIssueNumber()}`,
          secondary: formatDispatchDate(nextDispatchDate()),
        }}
        variant="home"
      />
      <section className="pref-masthead" style={{ padding: "60px 0 30px" }}>
        <p className="pref-crumb">
          <span className="dash"></span>FOR ORGANIZERS
        </p>
        <h1>
          Submit an <em>event</em>.
        </h1>
        <p className="deck">
          Got an event others would miss? Drop the link below. Submissions are
          reviewed within 48 hours before they go in the next dispatch.
        </p>
      </section>

      <form
        action="/api/submit"
        method="POST"
        className="rounded-2xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm"
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label htmlFor="website">Leave this empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <Field name="title" label="Event title" required />
        <Field
          name="url"
          label="Event URL"
          required
          type="url"
          placeholder="https://lu.ma/..."
        />
        <Field name="venue" label="Venue (optional)" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            name="startsAt"
            label="Starts (date + time)"
            required
            type="datetime-local"
          />
          <Field name="endsAt" label="Ends (optional)" type="datetime-local" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Description (optional)
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium mb-2">Topics</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOPICS.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 cursor-pointer hover:border-[var(--accent)]"
              >
                <input type="checkbox" name="topics" value={t.id} />
                <span className="text-sm">{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium mb-2">Where</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AREAS.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 cursor-pointer hover:border-[var(--accent)]"
              >
                <input type="radio" name="area" value={a.id} />
                <span className="text-sm">{a.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 cursor-pointer hover:border-[var(--accent)]">
              <input type="checkbox" name="isOnline" value="1" />
              <span className="text-sm">Online / virtual</span>
            </label>
          </div>
        </fieldset>

        <Field name="submitterEmail" label="Your email" required type="email" />

        <button
          type="submit"
          className="w-full sm:w-auto rounded-lg bg-[var(--accent)] text-white px-6 py-3 font-medium hover:opacity-90"
        >
          Submit for review
        </button>
      </form>
      <SiteFooter />
    </main>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-[var(--accent)]"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
