export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            AI SEO Audit
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Website SEO Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Review simulated SEO audit results, monitor website health, and
            explore performance insights from one dashboard.
          </p>
        </header>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="url"
              placeholder="https://example.com"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Run SEO Audit
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Overall SEO Score
            </p>
            <p className="mt-3 text-5xl font-bold text-blue-600">78</p>
            <p className="mt-2 text-sm text-slate-500">Good</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Technical SEO
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-900">82</p>
            <p className="mt-2 text-sm text-slate-500">Good performance</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Performance
            </p>
            <p className="mt-3 text-4xl font-bold text-slate-900">74</p>
            <p className="mt-2 text-sm text-slate-500">Needs improvement</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Audit Summary
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Technical SEO
                </span>
                <span className="font-semibold text-slate-900">82%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[82%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  On-Page SEO
                </span>
                <span className="font-semibold text-slate-900">79%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[79%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Performance
                </span>
                <span className="font-semibold text-slate-900">74%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[74%] rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
