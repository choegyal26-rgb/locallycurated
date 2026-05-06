export default function Thanks() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-6 pb-24">
      <h1 className="text-3xl font-semibold tracking-tight">You&apos;re in.</h1>
      <p className="mt-4 text-neutral-700">
        Your first digest will land in your inbox within two weeks. In the
        meantime, if you know an event others might miss,{" "}
        <a href="/submit" className="underline">
          submit it
        </a>
        .
      </p>
    </div>
  );
}
