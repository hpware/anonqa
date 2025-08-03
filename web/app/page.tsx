export default function Home() {
  return (
    <section className="container">
      <div className="center min-h-[60vh]">
        <div className="card surface p-8 sm:p-10 max-w-2xl w-full text-center">
          <h1 className="heading-1 gradient-brand">
            Ask me anything. Anonymously.
          </h1>
          <p className="mt-4 subtle">
            Create your page, share your link, and receive anonymous questions
            from your audience.
          </p>
          <div className="cluster-md justify-center mt-8">
            <a href="/manage" className="btn btn-primary">
              Get Started
            </a>
            <a href="/testing" className="btn btn-outline">
              Try Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
