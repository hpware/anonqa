"use client";
export default function Page() {
  return (
    <section className="container">
      <div className="min-h-[60vh] grid place-items-center">
        <div className="card surface max-w-md w-full p-6 sm:p-8 text-center">
          <h1 className="heading-3">Manage your page</h1>
          <p className="subtle mt-2">
            Sign in to create or manage your anonymous Q&amp;A page.
          </p>
          <div className="divider" />
          <button className="btn btn-primary w-full">
            Login via Instagram
          </button>
        </div>
      </div>
    </section>
  );
}
