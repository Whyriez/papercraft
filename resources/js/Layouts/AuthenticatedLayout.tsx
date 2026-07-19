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
            className="flex h-screen overflow-hidden font-sans text-[#2f2f2f] selection:bg-[#c97758] selection:text-white"
            style={{
                backgroundColor: '#fcfaf6',
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(233, 211, 191, 0.45), transparent 40%), radial-gradient(circle at 85% 12%, rgba(169, 199, 163, 0.25), transparent 35%), radial-gradient(circle at 15% 72%, rgba(230, 185, 91, 0.15), transparent 30%), linear-gradient(rgba(47, 47, 47, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 47, 47, 0.02) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
            }}
        >
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-72 flex-col border-r border-[#eadfce] bg-[#f7f3ea]/80 backdrop-blur-md shadow-[10px_0_30px_rgba(82,59,40,0.03)] z-30 shrink-0">
                <div className="flex h-20 shrink-0 items-center border-b border-[#eadfce] px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c97758] text-white shadow-[0_10px_20px_rgba(201,119,88,0.2)] ring-2 ring-[#fcfaf6]">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10l3 7-8 9-8-9 3-7z" /></svg>
                        </div>
                        <span className="text-xl font-black tracking-tight text-[#2f2f2f]">PaperCraft<span className="text-[#c97758]">.</span></span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-2 scrollbar-thin scrollbar-thumb-[#eadfce]">
                    <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#a97b5b]">Menu Utama</div>

                    {navigation.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${isActive
                                    ? 'bg-[#c97758] text-white shadow-[0_12px_24px_rgba(201,119,88,0.22)]'
                                    : 'text-[#67574b] hover:bg-[#f1e6d5] hover:text-[#2f2f2f]'
                                    }`}
                            >
                                <svg className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#a97b5b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Profil User di Bawah Sidebar */}
                <div className="shrink-0 border-t border-[#eadfce] p-6 bg-[#fcfaf6]/50">
                    <div className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-white p-3 shadow-[0_8px_16px_rgba(82,59,40,0.04)]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6b95b] font-black text-white shadow-[0_8px_16px_rgba(230,185,91,0.25)]">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#2f2f2f]">{user.name}</p>
                            <p className="truncate text-xs font-semibold text-[#8a7b6e]">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Area Konten Kanan */}
            {/* PERUBAHAN PENTING 2: Pembungkus kanan ini butuh flex flex-col agar main dan header bisa tersusun vertikal secara rapi */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Header Utama (Topbar) */}
                <header className="shrink-0 z-20 flex h-20 items-center justify-between border-b border-[#eadfce] bg-[#fcfaf6]/90 px-4 backdrop-blur-md sm:px-8 shadow-[0_4px_20px_rgba(82,59,40,0.02)]">
                    {/* Tombol Mobile Menu */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="rounded-full border border-[#eadfce] bg-white p-2.5 text-[#c97758] shadow-[0_8px_16px_rgba(82,59,40,0.06)] transition-all hover:-translate-y-0.5 hover:bg-[#f1e6d5] md:hidden"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Judul Halaman dinamis dari props header */}
                    <div className="ml-4 flex-1 truncate text-xl font-black text-[#2f2f2f] md:ml-0">
                        {header}
                    </div>

                    {/* Action Header Kanan */}
                    <div className="flex items-center gap-5">
                        <a href="/" target="_blank" className="flex items-center gap-2 text-sm font-bold text-[#67574b] transition-colors hover:text-[#c97758]">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            <span className="hidden sm:inline">Lihat Web</span>
                        </a>
                        <div className="h-6 w-px bg-[#eadfce]"></div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-full bg-[#f4e7d4] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a97b5b] transition-all hover:-translate-y-0.5 hover:bg-[#e9d3bf] hover:text-[#8a5d40] shadow-[0_8px_16px_rgba(82,59,40,0.05)]"
                        >
                            Log Out
                        </Link>
                    </div>
                </header>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-[#2f2f2f]/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="fixed inset-y-0 left-0 w-72 bg-[#fcfaf6] p-6 shadow-[20px_0_40px_rgba(82,59,40,0.15)]" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a97b5b]">Menu Utama</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#a97b5b] hover:text-[#c97758] transition-colors">
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
                                                ? 'bg-[#c97758] text-white shadow-[0_12px_24px_rgba(201,119,88,0.22)]'
                                                : 'text-[#67574b] hover:bg-[#f1e6d5] hover:text-[#2f2f2f]'
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

                            <div className="mt-8 border-t border-[#eadfce] pt-6">
                                <div className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-white p-3 shadow-[0_8px_16px_rgba(82,59,40,0.04)]">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6b95b] font-black text-white shadow-[0_8px_16px_rgba(230,185,91,0.25)]">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[#2f2f2f]">{user.name}</p>
                                        <p className="truncate text-xs font-semibold text-[#8a7b6e]">{user.email}</p>
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