'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CenterUnderline } from '@/components/ui/underline-animation';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{7,14}$/;

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function WaitlistForm() {
    const [contact, setContact] = useState('');
    const [error, setError] = useState('');
    const [state, setState] = useState<SubmitState>('idle');
    const [successMessage, setSuccessMessage] = useState('');

    const validate = () => {
        const cleanContact = contact.trim();

        if (!cleanContact) {
            return 'Enter an email or phone number.';
        }

        if (!emailRegex.test(cleanContact) && !phoneRegex.test(cleanContact)) {
            return 'Enter a valid email or phone number (e.g. you@example.com or +14155552671).';
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
                    contact: contact.trim(),
                }),
            });

            const body = (await response.json()) as {
                message?: string;
                sentEmail?: boolean;
            };

            if (!response.ok) {
                throw new Error(body.message || 'Submission failed.');
            }

            setState('success');
            setContact('');
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
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-zinc-300 sm:text-sm">
                Email or phone
                <input
                    type="text"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="you@example.com or +14155552671"
                    autoComplete="off"
                    className="h-12 rounded-xl border border-white/15 bg-black/60 px-4 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 transition focus:border-zinc-100/50"
                />
            </label>

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
