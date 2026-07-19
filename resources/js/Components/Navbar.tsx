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

        // Pindah ke Home dan filter data
        router.get(`/?${params.toString()}#featured`, {}, {
            preserveState: true,
        });

        setIsMobileMenuOpen(false); // Tutup menu mobile jika sedang terbuka
    };

    return (
        <nav className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-0 rounded-[34px] border border-[#eadfce] bg-[#fcfaf6]/95 px-5 py-4 shadow-[0_18px_45px_rgba(82,59,40,0.08)] backdrop-blur-sm transition-all duration-300">
                <div className="flex items-center justify-between gap-6">

                    {/* Logo (shrink-0 agar tidak tertekan) */}
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c97758] text-white shadow-[0_14px_28px_rgba(82,59,40,0.12)] transition-transform hover:-translate-y-0.5">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10l3 7-8 9-8-9 3-7z" />
                            </svg>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#a97b5b]">PaperCraft</p>
                            <p className="text-sm font-semibold text-[#67574b]">Layered models</p>
                        </div>
                    </Link>

                    {/* Desktop Search Bar */}
                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg items-center gap-3 rounded-full border border-[#eadfce] bg-white px-5 py-2.5 shadow-[0_10px_20px_rgba(82,59,40,0.03)] focus-within:border-[#c97758] focus-within:ring-1 focus-within:ring-[#c97758] transition-all">
                        <svg className="h-4 w-4 text-[#a97b5b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm placeholder:text-[#a79a8d] focus:outline-none"
                            placeholder="Cari karakter, armor, senjata..."
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery('')} className="text-[#a79a8d] hover:text-[#c97758]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </form>

                    {/* Desktop Menu */}
                    <div className="hidden shrink-0 items-center gap-8 text-sm font-bold text-[#67574b] lg:flex">
                        <Link href="/" className="transition-colors hover:text-[#c97758]">Home</Link>
                        <Link href="/?all=1#featured" className="transition-colors hover:text-[#c97758]">Explore</Link>
                        <Link href="/?all=1#categories" className="transition-colors hover:text-[#c97758]">Categories</Link>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex shrink-0 items-center gap-3 lg:hidden">
                        <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#c97758] shadow-[0_10px_20px_rgba(82,59,40,0.06)] transition-all hover:-translate-y-0.5 hover:bg-[#f6efe6]"
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
                    <div className="mt-4 flex flex-col gap-2 border-t border-[#efe4d6] pt-4 pb-2 text-sm font-semibold text-[#67574b] lg:hidden">

                        {/* Mobile Search Bar */}
                        <form onSubmit={handleSearch} className="mb-2 flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white px-4 py-3 shadow-[0_10px_20px_rgba(82,59,40,0.03)] focus-within:border-[#c97758] focus-within:ring-1 focus-within:ring-[#c97758]">
                            <svg className="h-5 w-5 text-[#a97b5b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-sm placeholder:text-[#a79a8d] focus:outline-none"
                                placeholder="Cari papercraft..."
                            />
                        </form>

                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-5 py-3 transition-colors hover:bg-[#f6efe6] hover:text-[#c97758]">Home</Link>
                        <Link href="/?all=1#featured" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-5 py-3 transition-colors hover:bg-[#f6efe6] hover:text-[#c97758]">Explore</Link>
                        <Link href="/?all=1#categories" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-5 py-3 transition-colors hover:bg-[#f6efe6] hover:text-[#c97758]">Categories</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}