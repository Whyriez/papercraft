import { Link, router } from '@inertiajs/react';
import { useState, useEffect, FormEvent } from 'react';

export default function Navbar({ initialSearch = '' }: { initialSearch?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    // Sinkronisasi jika pencarian di-reset dari luar (contoh: tombol Reset di Home)
    useEffect(() => {
        setSearchQuery(initialSearch || '');
    }, [initialSearch]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);

        // 🌟 PERBAIKAN 1: Arahkan ke #filtered-view agar langsung otomatis scroll ke hasil pencarian
        router.get(`/?${params.toString()}#filtered-view`, {}, {
            preserveState: true,
        });

        setIsMobileMenuOpen(false); // Tutup menu mobile jika sedang terbuka
    };

    return (
        <nav className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-0 rounded-[34px] border border-gray-800 bg-gray-900/95 px-5 py-3 sm:py-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300">
                <div className="flex items-center justify-between gap-4 sm:gap-6">

                    {/* Logo (shrink-0 agar tidak tertekan) */}
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                        {/* 🌟 PERBAIKAN 2: Ukuran logo sedikit dikecilkan di mobile agar teks merek muat */}
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gray-800 text-gray-200 border border-gray-700 shadow-sm transition-transform hover:-translate-y-0.5 overflow-hidden">
                            <img src="/logo.png" alt="PaperCraft Logo" className="w-full h-full object-cover" />
                        </div>
                        {/* 🌟 PERBAIKAN 2: Class 'hidden sm:block' dihapus. Ukuran teks disesuaikan untuk mobile */}
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.34em] text-gray-400">PaperCraft</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-200">Layered models</p>
                        </div>
                    </Link>

                    {/* Desktop Search Bar */}
                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg items-center gap-3 rounded-full border border-gray-700 bg-gray-800 px-5 py-2.5 shadow-inner focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
                            placeholder="Cari karakter, armor, senjata..."
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-300 transition-colors">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </form>

                    {/* Desktop Menu */}
                    <div className="hidden shrink-0 items-center gap-8 text-sm font-bold text-gray-300 lg:flex">
                        <Link href="/" className="transition-colors hover:text-white">Home</Link>
                        <Link href="/?all=1#filtered-view" className="transition-colors hover:text-white">Explore</Link>
                        <Link href="/#categories" className="transition-colors hover:text-white">Categories</Link>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex shrink-0 items-center gap-3 lg:hidden">
                        <button
                            type="button"
                            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-700 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-gray-700 pt-4 pb-2 text-sm font-semibold text-gray-300 lg:hidden">

                        {/* Mobile Search Bar */}
                        <form onSubmit={handleSearch} className="mb-2 flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 shadow-inner focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
                                placeholder="Cari papercraft..."
                            />
                        </form>

                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-5 py-3 transition-colors hover:bg-gray-800 hover:text-white">Home</Link>
                        {/* 🌟 PERBAIKAN: Arahkan Menu Explore di Mobile ke #filtered-view */}
                        <Link href="/?all=1#filtered-view" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-5 py-3 transition-colors hover:bg-gray-800 hover:text-white">Explore</Link>
                        {/* 🌟 PERBAIKAN: Arahkan Menu Categories di Mobile ke #categories */}
                        <Link href="/#categories" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-5 py-3 transition-colors hover:bg-gray-800 hover:text-white">Categories</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}