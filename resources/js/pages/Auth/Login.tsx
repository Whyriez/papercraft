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
        <div className="min-h-screen bg-white flex selection:bg-indigo-500 selection:text-white">
            <Head title="Log in - PaperCraft" />

            {/* Bagian Kiri: Form Login */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24 border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900 flex items-center gap-2 mb-10">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        PaperCraft<span className="text-indigo-600">.</span>
                    </Link>

                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Selamat Datang</h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium">
                            Masuk ke dashboard untuk mengelola koleksimu.
                        </p>
                    </div>

                    {status && (
                        <div className="mt-4 p-4 text-sm font-medium text-green-600 bg-green-50 rounded-xl border border-green-100">
                            {status}
                        </div>
                    )}

                    <div className="mt-8">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Input Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email Address</label>
                                <div className="mt-2 relative">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={`appearance-none block w-full px-4 py-3.5 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50/50 focus:bg-white`}
                                        placeholder="admin@papercraft.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Input Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
                                <div className="mt-2 relative">
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className={`appearance-none block w-full px-4 py-3.5 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50/50 focus:bg-white`}
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember_me"
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 font-medium cursor-pointer">
                                        Ingat saya
                                    </label>
                                </div>

                                {canResetPassword && (
                                    <div className="text-sm">
                                        <Link href="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-500">
                                            Lupa password?
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-indigo-200"
                                >
                                    {processing ? 'Memproses...' : 'Masuk ke Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bagian Kanan: Visual Banner (Hidden on Mobile) */}
            <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
                <img
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                    alt="Papercraft art visual"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-gray-900/40 to-transparent" />
                
                {/* Overlay Text */}
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-4 border border-white/20">
                        Admin Portal
                    </span>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                        Kelola koleksi papercraft dengan lebih mudah dan cepat.
                    </h2>
                    <p className="text-indigo-100 text-lg max-w-lg">
                        Sistem manajemen konten terpadu untuk mengatur kategori, mengunggah template, dan memantau interaksi pengguna.
                    </p>
                </div>
            </div>
        </div>
    );
}