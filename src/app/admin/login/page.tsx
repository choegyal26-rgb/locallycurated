export default function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="mx-auto max-w-sm px-6 pt-6 pb-24">
      <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
      <form
        action="/api/admin/login"
        method="POST"
        className="mt-6 space-y-4 rounded-2xl bg-white border border-neutral-200 p-6"
      >
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] text-white px-4 py-2 font-medium"
        >
          Sign in
        </button>
        <ErrorBanner promise={searchParams} />
      </form>
    </div>
  );
}

async function ErrorBanner({
  promise,
}: {
  promise: Promise<{ error?: string }>;
}) {
  const { error } = await promise;
  if (!error) return null;
  return <p className="text-sm text-red-600">Wrong password.</p>;
}
