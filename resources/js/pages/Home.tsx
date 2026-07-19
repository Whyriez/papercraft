import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

// 1. Definisikan tipe data (TypeScript) agar lebih rapi
interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

interface Papercraft {
    id: number;
    title: string;
    slug: string;
    category: Category;
    primary_image?: { image_path: string };
}

interface Props {
    categories: Category[];
    papercrafts: { data: Papercraft[] };
    filters: { search?: string };
}

export default function Home({ categories, papercrafts, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        
        // Melakukan request GET ke '/' dengan parameter search
        router.get('/', { search: searchQuery }, {
            preserveState: true, // Biarkan state form tidak keriset
            preserveScroll: true, // Jangan gulung halaman ke atas
        });
    };

    // Helper untuk merender kategori secara rekursif (N-Level)
    const renderCategories = (cats: Category[], level = 0) => {
        return (
            <ul className={`flex flex-col gap-1 ${level > 0 ? 'ml-4 mt-1 border-l border-gray-200 pl-3' : ''}`}>
                {cats.map((cat) => (
                    <li key={cat.id}>
                        <a 
                            href={`#`} 
                            className={`block py-1.5 text-sm transition-colors hover:text-indigo-600 ${
                                level === 0 ? 'font-semibold text-gray-800' : 'text-gray-500'
                            }`}
                        >
                            {cat.name}
                        </a>
                        {/* Jika punya sub-kategori, render ulang fungsinya */}
                        {cat.children && cat.children.length > 0 && renderCategories(cat.children, level + 1)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            <Head title="Koleksi Papercraft Premium" />

            {/* Navbar Simple */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span className="text-xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        PaperCraft<span className="text-indigo-600">.</span>
                    </span>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition flex items-center">Admin Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200/60 pt-16 pb-20 px-6 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
                    Bangun Imajinasimu dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Template Papercraft</span>
                </h1>
                <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
                    Koleksi premium template papercraft dari cosplay helmet, karakter anime, hingga model low-poly. Download, print, dan rakit sekarang!
                </p>
                
                {/* Form Pencarian Premium di Hero Section */}
                <div className="mt-10 max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-14 pr-32 py-4 border-2 border-gray-100 rounded-full text-lg shadow-sm bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="Cari papercraft, contoh: Iron Man..."
                        />
                        <div className="absolute inset-y-0 right-2 flex items-center">
                            <button
                                type="submit"
                                className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-600 hover:shadow-md transition-all text-sm"
                            >
                                Cari
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
                
                {/* Sidebar Kategori */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Kategori</h3>
                        {renderCategories(categories)}
                    </div>
                </aside>

                {/* Grid Papercrafts */}
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {filters.search ? `Hasil untuk "${filters.search}"` : 'Terbaru'}
                        </h2>
                        <span className="text-sm text-gray-500">{papercrafts.data.length} item ditemukan</span>
                    </div>

                    {papercrafts.data.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                            <p className="text-gray-500 text-lg">Maaf, papercraft yang kamu cari tidak ditemukan.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); router.get('/'); }}
                                className="mt-4 text-indigo-600 font-bold hover:underline"
                            >
                                Tampilkan semua papercraft
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {papercrafts.data.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={`/papercraft/${item.slug}`} 
                                    className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-square overflow-hidden bg-gray-100 relative">
                                        {item.primary_image ? (
                                            <img 
                                                src={`/${item.primary_image.image_path}`} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span className="text-sm font-medium">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    
                                    <div className="p-5">
                                        <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                                            {item.category.name}
                                        </span>
                                        <h2 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {item.title}
                                        </h2>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}