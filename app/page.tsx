import Image from 'next/image';
import CelestialInkShader from '@/components/ui/celestial-ink-shader';
import { Component as Footer } from '@/components/ui/footer-taped-design';
import { WaitlistForm } from '@/components/ui/waitlist-form';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-zinc-100">
      <CelestialInkShader />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Image
            src="/logo-main.jpeg"
            alt="Genfux"
            width={160}
            height={48}
            className="h-9 w-auto object-contain sm:h-10"
            priority
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-14 md:py-20">
        <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[9px] uppercase tracking-[0.24em] text-zinc-300 sm:mb-8 sm:px-4 sm:text-[10px] sm:tracking-[0.3em]">
          Gothic Y2K Drop
        </div>
        <h1 className="max-w-4xl font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-4xl md:text-6xl">
          Join the waitlist
        </h1>
        <p className="mt-3 max-w-2xl text-xs uppercase tracking-[0.15em] text-zinc-400 sm:mt-4 sm:text-sm sm:tracking-[0.18em] md:text-base">
          Enter your email or phone to get early access.
        </p>

        <div className="mt-8 w-full sm:mt-10">
          <WaitlistForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
