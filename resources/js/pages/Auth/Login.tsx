import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useEffect } from 'react';

interface Props {
    canResetPassword?: boolean;
    status?: string;
}

export default function Login({ canResetPassword, status }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Reset password field jika terjadi error
    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 p-4 font-sans text-gray-200 selection:bg-gray-700 selection:text-white sm:p-8"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(55, 65, 81, 0.4), transparent 36%), radial-gradient(circle at 85% 12%, rgba(75, 85, 99, 0.2), transparent 28%), radial-gradient(circle at 15% 72%, rgba(31, 41, 55, 0.4), transparent 30%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
            }}
        >
            <Head title="Log in - PaperCraft" />

            {/* Background Blur Elements */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gray-700/30 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gray-600/20 blur-3xl" />
            </div>

            {/* Main Login Card with Stacked Paper Effect */}
            <div className="relative z-10 w-full max-w-md">
                {/* Latar Tumpukan 1 & 2 */}
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[38px] bg-gray-800 shadow-lg" />
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[38px] bg-gray-700/50 shadow-md" />

                <div className="relative rounded-[38px] border border-gray-800 bg-gray-900 p-8 shadow-xl sm:p-12">
                    <div className="mb-10 text-center">
                        <Link href="/" className="inline-flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-800 text-gray-200 shadow-sm ring-4 ring-gray-900 ring-offset-2 ring-offset-gray-800 transition-transform hover:scale-105 border border-gray-700 overflow-hidden">
                                <img src="/logo.png" alt="PaperCraft Logo" className="w-full h-full object-cover" />
                            </div>
                        </Link>
                        <h2 className="mt-6 text-3xl font-black tracking-tight text-gray-100">Admin Portal</h2>
                        <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-400">
                            Masuk ke dashboard untuk mengelola koleksi papercraft Anda.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-2xl border border-green-800 bg-green-900/30 p-4 text-center text-sm font-bold text-green-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`mt-3 block w-full rounded-2xl border bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-200 placeholder:font-medium placeholder:text-gray-500 shadow-inner transition-all focus:outline-none focus:ring-2 ${errors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'
                                    }`}
                                placeholder="admin@papercraft.com"
                                autoComplete="username"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="mt-2 text-xs font-bold text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`mt-3 block w-full rounded-2xl border bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-200 placeholder:font-medium placeholder:text-gray-500 shadow-inner transition-all focus:outline-none focus:ring-2 ${errors.password
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'
                                    }`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="mt-2 text-xs font-bold text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="group flex cursor-pointer items-center gap-3">
                                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 transition-colors group-hover:border-gray-500">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <svg className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-400 transition-colors group-hover:text-gray-200">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-bold text-gray-400 transition-colors hover:text-white"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center rounded-full bg-gray-200 px-6 py-4 text-sm font-bold text-gray-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-gray-200/30 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {processing ? 'Memproses...' : 'Masuk ke Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Decorative Folded Paper Elements (Hidden on mobile) */}
            <div className="absolute right-10 top-10 hidden md:block opacity-60">
                <div className="h-20 w-20 rotate-12 rounded-[24px] bg-gray-800 shadow-lg ring-1 ring-gray-700" />
            </div>
            <div className="absolute bottom-10 left-10 hidden md:block opacity-60">
                <div className="h-24 w-24 -rotate-12 rounded-full bg-gray-800/80 shadow-lg ring-1 ring-gray-700" />
            </div>
        </div>
    );
}