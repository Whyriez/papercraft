import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

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
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fcfaf6] p-4 font-sans text-[#2f2f2f] selection:bg-[#c97758] selection:text-white sm:p-8"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(233, 211, 191, 0.55), transparent 36%), radial-gradient(circle at 85% 12%, rgba(169, 199, 163, 0.32), transparent 28%), radial-gradient(circle at 15% 72%, rgba(230, 185, 91, 0.18), transparent 30%), linear-gradient(rgba(47, 47, 47, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 47, 47, 0.02) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
            }}
        >
            <Head title="Log in - PaperCraft" />

            {/* Background Blur Elements */}
            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#a9c7a3]/30 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#e6b95b]/20 blur-3xl" />
            </div>

            {/* Main Login Card with Stacked Paper Effect */}
            <div className="relative z-10 w-full max-w-md">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[38px] bg-[#e9d3bf] shadow-[0_24px_50px_rgba(82,59,40,0.10)]" />
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[38px] bg-[#f3e7d6] shadow-[0_20px_40px_rgba(82,59,40,0.08)]" />

                <div className="relative rounded-[38px] border border-[#eadfce] bg-[#fcfaf6] p-8 shadow-[0_22px_45px_rgba(82,59,40,0.10)] sm:p-12">
                    <div className="mb-10 text-center">
                        <Link href="/" className="inline-flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c97758] text-white shadow-[0_14px_28px_rgba(82,59,40,0.12)] ring-4 ring-[#fcfaf6] ring-offset-2 ring-offset-[#f3e7d6] transition-transform hover:scale-105">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10l3 7-8 9-8-9 3-7z" />
                                </svg>
                            </div>
                        </Link>
                        <h2 className="mt-6 text-3xl font-black tracking-tight text-[#2f2f2f]">Admin Portal</h2>
                        <p className="mt-3 text-sm font-semibold leading-relaxed text-[#67574b]">
                            Masuk ke dashboard untuk mengelola koleksi papercraft Anda.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-2xl border border-[#a9c7a3] bg-[#f1f6f0] p-4 text-center text-sm font-bold text-[#4a6b43]">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b]">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`mt-3 block w-full rounded-2xl border bg-[#fcfaf6] px-5 py-4 text-sm font-semibold text-[#2f2f2f] placeholder:font-medium placeholder:text-[#bcae9f] shadow-[0_10px_20px_rgba(82,59,40,0.05)] transition-all focus:outline-none focus:ring-2 ${errors.email
                                        ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20'
                                        : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'
                                    }`}
                                placeholder="admin@papercraft.com"
                                autoComplete="username"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b]">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`mt-3 block w-full rounded-2xl border bg-[#fcfaf6] px-5 py-4 text-sm font-semibold text-[#2f2f2f] placeholder:font-medium placeholder:text-[#bcae9f] shadow-[0_10px_20px_rgba(82,59,40,0.05)] transition-all focus:outline-none focus:ring-2 ${errors.password
                                        ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20'
                                        : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'
                                    }`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="group flex cursor-pointer items-center gap-3">
                                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-[#eadfce] bg-[#fcfaf6] transition-colors group-hover:border-[#c97758]">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <svg className="h-3.5 w-3.5 text-[#c97758] opacity-0 transition-opacity peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-[#67574b] transition-colors group-hover:text-[#2f2f2f]">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-bold text-[#c97758] transition-colors hover:text-[#a95038]"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center rounded-full bg-[#c97758] px-6 py-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(201,119,88,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#b96449] focus:outline-none focus:ring-4 focus:ring-[#c97758]/30 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {processing ? 'Memproses...' : 'Masuk ke Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Decorative Folded Paper Elements (Hidden on mobile) */}
            <div className="absolute right-10 top-10 hidden md:block">
                <div className="h-20 w-20 rotate-12 rounded-[24px] bg-[#f4e7d4] shadow-[0_14px_28px_rgba(82,59,40,0.12)] ring-1 ring-[#eadfce]" />
            </div>
            <div className="absolute bottom-10 left-10 hidden md:block">
                <div className="h-24 w-24 -rotate-12 rounded-full bg-[#a9c7a3]/60 shadow-[0_14px_28px_rgba(82,59,40,0.08)] ring-1 ring-[#eadfce]" />
            </div>
        </div>
    );
}