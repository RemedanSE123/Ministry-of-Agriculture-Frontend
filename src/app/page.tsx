import React from "react";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <section className="text-center p-8 max-w-xl">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          Ministry of Agriculture
        </h1>
        <p className="text-lg text-green-700 mb-6">
          Empowering sustainable agriculture for a better future.
        </p>
        <a
          href="#about"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Learn More
        </a>
      </section>
    </main>
  );
}