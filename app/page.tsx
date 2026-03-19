import Image from 'next/image';
import CelestialInkShader from '@/components/ui/celestial-ink-shader';
import { Component as Footer } from '@/components/ui/footer-taped-design';
import { WaitlistForm } from '@/components/ui/waitlist-form';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-zinc-100">
      <CelestialInkShader />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Image
            src="/logo-main.jpeg"
            alt="Genfux"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-14 text-center md:py-20">
        <div className="mb-8 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-300">
          Gothic Y2K Drop
        </div>
        <h1 className="max-w-4xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white md:text-6xl">
          Join the waitlist
        </h1>
        <p className="mt-4 max-w-2xl text-sm uppercase tracking-[0.18em] text-zinc-400 md:text-base">
          Enter your email and phone to get early access.
        </p>

        <div className="mt-10 w-full">
          <WaitlistForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
