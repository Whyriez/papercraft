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
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-indigo-500 selection:text-white">
            
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-72 bg-gray-900 border-r border-gray-800 transition-all">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <Link href="/" className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        PaperCraft<span className="text-indigo-500">.</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Menu Utama</div>
                    
                    {navigation.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                                    isActive 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Profil User di Bawah Sidebar */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Area Konten Kanan */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Header Utama (Topbar) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
                    {/* Tombol Mobile Menu */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Judul Halaman dinamis dari props header */}
                    <div className="font-bold text-xl text-gray-800 truncate flex-1 md:ml-0 ml-4">
                        {header}
                    </div>

                    {/* Action Header Kanan */}
                    <div className="flex items-center gap-4">
                        <a href="/" target="_blank" className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            <span className="hidden sm:inline">Lihat Web</span>
                        </a>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button"
                            className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                        >
                            Log Out
                        </Link>
                    </div>
                </header>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="fixed inset-y-0 left-0 w-72 bg-gray-900 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Menu Utama</div>
                            <div className="space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-gray-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Konten Utama (Render Page) */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}