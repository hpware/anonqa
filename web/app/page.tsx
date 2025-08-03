export default function Page() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-2">
      {/* Vibrant background for visual interest */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent" />
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="rounded-2xl bg-white/90 shadow-xl border border-gray-200 p-4 sm:p-8 w-full text-center backdrop-blur-md">
            <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Ask me anything. Anonymously.
            </h1>
            <p className="mt-3 text-gray-600 text-base sm:text-lg">
              Create your page, share your link, and receive anonymous questions
              from your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a
                href="/manage"
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-semibold shadow hover:from-fuchsia-700 hover:to-blue-700 transition"
              >
                Get Started
              </a>
              <a
                href="/testing"
                className="w-full sm:w-auto px-6 py-2 rounded-lg border border-blue-500 text-blue-700 font-semibold bg-white hover:bg-blue-50 transition"
              >
                Try Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
