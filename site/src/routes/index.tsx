import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setToast("You're on the list! 🎉 We'll let you know when FitCheck launches.");
    setEmail("");
    setTimeout(() => setToast(null), 5000);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#fafbf8] text-[#1a1a1a]">
      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-slide-down rounded-xl bg-white px-6 py-4 text-sm font-medium text-[#1a1a1a] shadow-lg ring-1 ring-[#e8e8e3]">
          {toast}
        </div>
      )}

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 border-b border-[#e8e8e3] bg-[#fafbf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#1a1a1a]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8a9a5b] text-sm font-black text-white">
              F
            </span>
            FitCheck
          </a>
          <a
            href="#waitlist"
            className="rounded-full bg-[#8a9a5b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6b7a4a]"
          >
            Get Early Access
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#fafbf8] px-6 pb-20 pt-16 sm:pt-28 sm:pb-32">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#8a9a5b] opacity-[0.04] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full border border-[#8a9a5b]/30 bg-[#8a9a5b]/10 px-4 py-1.5 text-sm font-medium text-[#8a9a5b]">
            AI-Powered Personal Styling
          </span>

          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-[#1a1a1a] sm:text-7xl lg:text-8xl">
            Shop your closet,
            <br />
            <span className="bg-gradient-to-r from-[#8a9a5b] to-[#9dae6d] bg-clip-text text-transparent">
              not the store.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[#6b6b6b] sm:text-xl">
            FitCheck uses AI to generate perfect outfit combinations from the clothes
            you <em>already own</em>. Snap your closet, pick an occasion, and get
            styled — no shopping required.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#waitlist"
              className="group inline-flex items-center gap-2 rounded-full bg-[#8a9a5b] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#6b7a4a] hover:shadow-[0_0_40px_rgba(138,154,91,0.15)]"
            >
              Try FitCheck Free
              <span className="transition group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#9a9a8e] transition hover:text-[#6b6b6b]"
            >
              See how it works ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-t border-[#e8e8e3] bg-[#fcfdfa] px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            Get styled in{" "}
            <span className="bg-gradient-to-r from-[#8a9a5b] to-[#9dae6d] bg-clip-text text-transparent">
              3 steps
            </span>
          </h2>
          <p className="mt-4 text-center text-[#6b6b6b]">
            No stylist. No shopping hauls. Just your closet, supercharged.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="group rounded-2xl border border-[#e8e8e3] bg-white p-8 transition hover:border-[#8a9a5b]/30 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#8a9a5b]/10 text-3xl ring-1 ring-[#8a9a5b]/20">
                📸
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#1a1a1a]">Snap your closet</h3>
              <p className="mt-2 leading-relaxed text-[#6b6b6b]">
                Open your wardrobe and snap photos of your tops, bottoms, dresses,
                and shoes. Our AI catalogs everything automatically.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-[#8a9a5b]/50">
                01
              </span>
            </div>

            {/* Step 2 */}
            <div className="group rounded-2xl border border-[#e8e8e3] bg-white p-8 transition hover:border-[#8a9a5b]/30 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#8a9a5b]/10 text-3xl ring-1 ring-[#8a9a5b]/20">
                🤖
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#1a1a1a]">AI analyzes your style</h3>
              <p className="mt-2 leading-relaxed text-[#6b6b6b]">
                Our vision AI identifies each piece — color, cut, fabric, and vibe.
                It learns your style DNA and builds a smart catalog.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-[#8a9a5b]/50">
                02
              </span>
            </div>

            {/* Step 3 */}
            <div className="group rounded-2xl border border-[#e8e8e3] bg-white p-8 transition hover:border-[#8a9a5b]/30 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#8a9a5b]/10 text-3xl ring-1 ring-[#8a9a5b]/20">
                ✨
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#1a1a1a]">Get outfit combos</h3>
              <p className="mt-2 leading-relaxed text-[#6b6b6b]">
                Pick an occasion — date night, brunch, interview — and get 3-5 styled
                looks from your own clothes. Ready to wear, ready to share.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-[#8a9a5b]/50">
                03
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-[#e8e8e3] bg-[#fafbf8] px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            Built for the{" "}
            <span className="bg-gradient-to-r from-[#8a9a5b] to-[#9dae6d] bg-clip-text text-transparent">
              GRWM generation
            </span>
          </h2>
          <p className="mt-4 text-center text-[#6b6b6b]">
            Everything you need to create, share, and discover — without ever hitting
            "add to cart."
          </p>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Lookbook Cards */}
            <div className="flex flex-col rounded-2xl border border-[#e8e8e3] bg-white p-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1a1a1a]">Lookbook Cards</h3>
                <p className="mt-3 leading-relaxed text-[#6b6b6b]">
                  Every outfit renders as a gorgeous, shareable card — like a
                  magazine editorial, but starring your own clothes.
                </p>
              </div>
              {/* Card mockup */}
              <div className="mt-8 space-y-3">
                {[
                  { label: "Date Night", accent: "#8a9a5b" },
                  { label: "Brunch", accent: "#9dae6d" },
                  { label: "Office Fit", accent: "#bcc597" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="flex items-center gap-3 rounded-xl border border-[#e8e8e3] bg-[#f7f9f5] p-4 transition hover:border-[#8a9a5b]/30"
                  >
                    <div
                      className="h-12 w-12 rounded-lg"
                      style={{ background: card.accent, opacity: 0.12 }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a1a]">{card.label}</div>
                      <div className="text-xs text-[#9a9a8e]">3 outfit options</div>
                    </div>
                    <div className="ml-auto text-xs font-medium text-[#8a9a5b]">
                      VIEW →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Twin */}
            <div className="flex flex-col rounded-2xl border border-[#e8e8e3] bg-white p-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1a1a1a]">Style Twin</h3>
                <p className="mt-3 leading-relaxed text-[#6b6b6b]">
                  Find your style soulmate. FitCheck matches you with people who
                  have similar wardrobes and body types — swap ideas, not clothes.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4 rounded-xl border border-[#e8e8e3] bg-[#f7f9f5] p-5">
                <div className="flex -space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8a9a5b]/15 text-sm font-bold text-[#8a9a5b] ring-2 ring-white">
                    Y
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9dae6d]/15 text-sm font-bold text-[#9dae6d] ring-2 ring-white">
                    T
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">92% wardrobe match</div>
                  <div className="text-xs text-[#9a9a8e]">Your Style Twin</div>
                </div>
              </div>
            </div>

            {/* One-Tap Sharing */}
            <div className="flex flex-col rounded-2xl border border-[#e8e8e3] bg-white p-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1a1a1a]">One-Tap Sharing</h3>
                <p className="mt-3 leading-relaxed text-[#6b6b6b]">
                  Post your looks directly to TikTok and Instagram. One tap, and
                  your outfit is live. Built for the FYP.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8a9a5b] to-[#9dae6d] px-4 py-3 text-sm font-semibold text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 12.5c-.667.667-1.5 1-2.5 1-.8 0-1.55-.267-2.25-.8A4.23 4.23 0 0110.5 13c-.433.3-.95.5-1.5.5-1 0-1.833-.333-2.5-1-.667-.667-1-1.5-1-2.5s.333-1.833 1-2.5C7.167 6.833 8 6.5 9 6.5s1.833.333 2.5 1c.667.667 1 1.5 1 2.5 0 .8-.267 1.55-.8 2.25.533.433 1.117.7 1.75.8L14.5 11h1l.5 3.5z" />
                  </svg>
                  Instagram
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f7f9f5] px-4 py-3 text-sm font-semibold text-[#1a1a1a] ring-1 ring-[#e8e8e3]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.3.02.6.04.9.06.91.07 1.82.15 2.73.28 1.12.16 2.13.47 2.99 1.06.99.68 1.68 1.59 1.99 2.76.23.86.31 1.74.35 2.63.04 1.31.02 2.61.02 3.91v.06c0 1.3.02 2.61-.02 3.91-.04.89-.12 1.77-.35 2.63-.31 1.17-1 2.08-1.99 2.76-.86.59-1.87.9-2.99 1.06-.91.13-1.82.21-2.73.28-.3.02-.6.04-.9.06-1.3.03-2.6.03-3.91.02h-.06c-1.3 0-2.61-.02-3.91.02-.89-.04-1.77-.12-2.63-.35-1.17-.31-2.08-1-2.76-1.99-.59-.86-.9-1.87-1.06-2.99-.13-.91-.21-1.82-.28-2.73-.02-.3-.04-.6-.06-.9C.02 14.586.02 13.286.02 11.986v-.06c0-1.3-.02-2.61.02-3.91.04-.89.12-1.77.35-2.63.31-1.17 1-2.08 1.99-2.76.86-.59 1.87-.9 2.99-1.06.91-.13 1.82-.21 2.73-.28.3-.02.6-.04.9-.06 1.31-.03 2.61-.03 3.91-.02h.06z" />
                  </svg>
                  TikTok
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section
        id="waitlist"
        className="border-t border-[#e8e8e3] bg-[#fcfdfa] px-6 py-24 sm:py-32"
      >
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#e8e8e3] bg-white px-8 py-16 text-center sm:px-16 sm:py-20 shadow-sm">
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-20 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#8a9a5b] opacity-[0.03] blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
              Be the first to know
            </h2>
            <p className="mt-4 text-[#6b6b6b]">
              FitCheck is launching soon. Drop your email and we'll let you know the
              moment you can start styling — plus you'll get early-access perks.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 rounded-xl border border-[#e8e8e3] bg-[#f7f9f5] px-5 py-4 text-[#1a1a1a] placeholder-[#9a9a8e] outline-none transition focus:border-[#8a9a5b]/50 focus:ring-2 focus:ring-[#8a9a5b]/15"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#8a9a5b] px-8 py-4 font-semibold text-white transition hover:bg-[#6b7a4a] hover:shadow-[0_0_30px_rgba(138,154,91,0.15)]"
              >
                Notify Me
              </button>
            </form>

            <p className="mt-4 text-xs text-[#9a9a8e]">
              No spam, ever. Just the launch announcement and early-access details.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#e8e8e3] bg-[#fafbf8] px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-[#1a1a1a]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8a9a5b] text-xs font-black text-white">
              F
            </span>
            FitCheck
          </div>

          <p className="text-sm text-[#9a9a8e]">© 2026 FitCheck. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-[#9a9a8e] transition hover:text-[#6b6b6b]"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-sm text-[#9a9a8e] transition hover:text-[#6b6b6b]"
            >
              TikTok
            </a>
            <a
              href="#"
              className="text-sm text-[#9a9a8e] transition hover:text-[#6b6b6b]"
            >
              Twitter/X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
