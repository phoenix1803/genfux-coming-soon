'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

export const Component = () => {
    return (
        <footer className="w-full px-6 pb-6 pt-8 text-zinc-300">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md md:p-6">
                <Link href="/" aria-label="Genfux home" className="inline-flex items-center">
                    <Image
                        src="/logo-main.jpeg"
                        alt="Genfux logo"
                        width={120}
                        height={40}
                        className="h-9 w-auto object-contain"
                        priority
                    />
                </Link>

                <div className="flex items-center gap-3">
                    <a
                        href="https://www.instagram.com/genfux.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-zinc-200 transition hover:border-white/40 hover:text-white"
                    >
                        <Instagram className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};
