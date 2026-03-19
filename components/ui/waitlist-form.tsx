'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CenterUnderline } from '@/components/ui/underline-animation';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{7,14}$/;

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function WaitlistForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [state, setState] = useState<SubmitState>('idle');
    const [successMessage, setSuccessMessage] = useState('');

    const validate = () => {
        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanPhone = phone.trim();

        if (!cleanName) {
            return 'Enter your name.';
        }

        if (cleanName.length < 2) {
            return 'Name should be at least 2 characters.';
        }

        if (!cleanEmail) {
            return 'Enter your email.';
        }

        if (!emailRegex.test(cleanEmail)) {
            return 'Enter a valid email address.';
        }

        if (cleanPhone && !phoneRegex.test(cleanPhone)) {
            return 'Enter a valid phone number (e.g. +14155552671).';
        }

        return '';
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            setState('error');
            setSuccessMessage('');
            return;
        }

        setError('');
        setSuccessMessage('');
        setState('loading');

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                }),
            });

            const body = (await response.json()) as {
                message?: string;
            };

            if (!response.ok) {
                throw new Error(body.message || 'Submission failed.');
            }

            setState('success');
            setName('');
            setEmail('');
            setPhone('');
            setSuccessMessage('You are in.');
        } catch (submitError) {
            setState('error');
            setError(
                submitError instanceof Error ? submitError.message : 'Something went wrong.'
            );
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="mx-auto w-full max-w-xl rounded-3xl border border-white/20 bg-gradient-to-b from-zinc-800/70 via-zinc-900/60 to-black/85 p-4 shadow-[0_0_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-5 md:p-8"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-zinc-300 sm:text-sm">
                    Name
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        className="h-12 rounded-xl border border-white/15 bg-black/60 px-4 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 transition focus:border-zinc-100/50"
                    />
                </label>

                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-zinc-300 sm:text-sm">
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-12 rounded-xl border border-white/15 bg-black/60 px-4 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 transition focus:border-zinc-100/50"
                    />
                </label>

                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-zinc-300 sm:text-sm sm:col-span-2">
                    Phone (optional)
                    <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+14155552671"
                        autoComplete="tel"
                        className="h-12 rounded-xl border border-white/15 bg-black/60 px-4 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 transition focus:border-zinc-100/50"
                    />
                </label>
            </div>

            <button
                type="submit"
                disabled={state === 'loading'}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:text-sm"
            >
                {state === 'loading' ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting
                    </span>
                ) : (
                    <CenterUnderline label="Join The Waitlist" className="text-sm" />
                )}
            </button>

            {state === 'success' ? (
                <p className="mt-4 text-sm text-emerald-300">{successMessage}</p>
            ) : null}

            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </form>
    );
}
