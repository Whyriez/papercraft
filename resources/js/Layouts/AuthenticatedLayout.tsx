import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';

// Tipe data bawaan
interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    user: User;
    header?: ReactNode;
}

export default function AuthenticatedLayout({ user, header, children }: PropsWithChildren<Props>) {
    // State untuk toggle sidebar di tampilan mobile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mengambil URL aktif saat ini untuk styling menu sidebar
    const { url } = usePage();

    // Data menu sidebar
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Kategori', href: '/admin/categories', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'Papercrafts', href: '/admin/papercrafts', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ];

    return (
        // PERUBAHAN PENTING 1: Gunakan 'h-screen overflow-hidden' agar halaman web tidak bisa discroll secara global.
        <div
            className="flex h-screen overflow-hidden font-sans text-gray-200 selection:bg-gray-700 selection:text-white"
            style={{
                backgroundColor: '#030712', // gray-950 equivalent
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(55, 65, 81, 0.4), transparent 40%), radial-gradient(circle at 85% 12%, rgba(75, 85, 99, 0.2), transparent 35%), radial-gradient(circle at 15% 72%, rgba(31, 41, 55, 0.4), transparent 30%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
            }}
        >
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-72 flex-col border-r border-gray-800 bg-gray-950/80 backdrop-blur-md shadow-lg z-30 shrink-0">
                <div className="flex h-20 shrink-0 items-center border-b border-gray-800 px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-200 shadow-sm ring-2 ring-gray-900 border border-gray-700 overflow-hidden">
                            <img src="/logo.png" alt="PaperCraft Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-100">PaperCraft<span className="text-gray-500">.</span></span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
                    <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Menu Utama</div>

                    {navigation.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${isActive
                                    ? 'bg-gray-800 text-white shadow-md border border-gray-700'
                                    : 'text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent'
                                    }`}
                            >
                                <svg className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Profil User di Bawah Sidebar */}
                <div className="shrink-0 border-t border-gray-800 p-6 bg-gray-900/30">
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-3 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800 border border-gray-700 font-black text-gray-300">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-200">{user.name}</p>
                            <p className="truncate text-xs font-semibold text-gray-400">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Area Konten Kanan */}
            {/* PERUBAHAN PENTING 2: Pembungkus kanan ini butuh flex flex-col agar main dan header bisa tersusun vertikal secara rapi */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Header Utama (Topbar) */}
                <header className="shrink-0 z-20 flex h-20 items-center justify-between border-b border-gray-800 bg-gray-950/90 px-4 backdrop-blur-md sm:px-8 shadow-sm">
                    {/* Tombol Mobile Menu */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="rounded-full border border-gray-700 bg-gray-800 p-2.5 text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-700 md:hidden"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Judul Halaman dinamis dari props header */}
                    <div className="ml-4 flex-1 truncate text-xl font-black text-gray-100 md:ml-0">
                        {header}
                    </div>

                    {/* Action Header Kanan */}
                    <div className="flex items-center gap-5">
                        <a href="/" target="_blank" className="flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-white">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            <span className="hidden sm:inline">Lihat Web</span>
                        </a>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-full bg-gray-800 border border-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-300 transition-all hover:-translate-y-0.5 hover:bg-gray-700 hover:text-white shadow-sm"
                        >
                            Log Out
                        </Link>
                    </div>
                </header>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="fixed inset-y-0 left-0 w-72 bg-gray-950 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Menu Utama</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {navigation.map((item) => {
                                    const isActive = url.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${isActive
                                                ? 'bg-gray-800 text-white shadow-md border border-gray-700'
                                                : 'text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent'
                                                }`}
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-8 border-t border-gray-800 pt-6">
                                <div className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-3 shadow-sm">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800 border border-gray-700 font-black text-gray-300">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-gray-200">{user.name}</p>
                                        <p className="truncate text-xs font-semibold text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Konten Utama (Render Page) */}
                {/* PERUBAHAN PENTING 3: Beri 'overflow-y-auto' di main konten ini, sehingga ini satu-satunya area yang bisa di-scroll */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}