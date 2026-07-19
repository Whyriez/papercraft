import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// 1. Definisikan tipe data
interface Image {
    id: number;
    image_path: string;
    is_primary: boolean;
}

// 🌟 Tambahkan 'parent' ke interface Category
interface Category {
    id: number;
    name: string;
    slug: string;
    parent?: Category;
}

interface Papercraft {
    id: number;
    title: string;
    slug: string;
    description: string;
    file_path: string | null;
    category: Category;
    images: Image[];
    primaryImage?: Image | null;
    created_at?: string;
}

interface Props {
    papercraft: Papercraft;
    related: Papercraft[];
}

export default function Detail({ papercraft, related = [] }: Props) {
    const [activeImage, setActiveImage] = useState<Image | null>(
        papercraft.images.find(img => img.is_primary) || papercraft.images[0] || null
    );

    const [isCopied, setIsCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const fileExtension = papercraft.file_path
        ? papercraft.file_path.split('.').pop()?.toUpperCase()
        : '-';

    // 🌟 HELPER: Merangkai Silsilah Kategori (Dari Parent tertinggi ke Child)
    const getCategoryHierarchy = (category: Category) => {
        const hierarchy = [];
        let current: Category | undefined = category;

        while (current) {
            hierarchy.unshift(current);
            current = current.parent;
        }

        return hierarchy;
    };

    // Eksekusi helpernya
    const categoryPath = getCategoryHierarchy(papercraft.category);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
            <Head title={`${papercraft.title} - PaperCraft`} />

            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        PaperCraft<span className="text-indigo-600">.</span>
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 pt-8">

                {/* 🌟 BREADCRUMB DINAMIS (Bisa Diklik & Filter Berdasarkan Slug) */}
                <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-8 font-medium gap-y-2">
                    <Link href="/" className="hover:text-indigo-600 transition">Home</Link>

                    {categoryPath.map((cat) => (
                        <div key={cat.id} className="flex items-center">
                            <span className="mx-2 text-gray-300">/</span>
                            {/* NOTE: Diubah menjadi memanggil cat.slug */}
                            <Link href={`/?category=${cat.slug}`} className="hover:text-indigo-600 transition cursor-pointer">
                                {cat.name}
                            </Link>
                        </div>
                    ))}

                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-gray-900 line-clamp-1">{papercraft.title}</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        <div className="p-8 lg:p-12 bg-gray-50/50 border-r border-gray-100">
                            <div className="aspect-square rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm mb-6 relative group">
                                {activeImage ? (
                                    <img src={`/${activeImage.image_path}`} alt={papercraft.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada gambar</div>
                                )}
                            </div>

                            {papercraft.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {papercraft.images.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage?.id === img.id ? 'border-indigo-600 opacity-100 ring-2 ring-indigo-600/20 ring-offset-1' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={`/${img.image_path}`} alt={`Thumbnail ${img.id}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                            <div>
                                {/* 🌟 BADGE KATEGORI LENGKAP */}
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-widest rounded-lg mb-4 border border-indigo-100/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                    {categoryPath.map(c => c.name).join(' • ')}
                                </span>

                                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                                    {papercraft.title}
                                </h1>

                                <div className="prose prose-indigo prose-lg text-gray-600 mb-8 whitespace-pre-wrap">
                                    {papercraft.description}
                                </div>

                                <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100 mb-8">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tipe Template</p>
                                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                                            {papercraft.file_path ? (
                                                <><span className="w-2 h-2 rounded-full bg-green-500"></span> {fileExtension} File</>
                                            ) : (
                                                <><span className="w-2 h-2 rounded-full bg-red-400"></span> Tidak Ada</>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori Utama</p>
                                        <p className="font-semibold text-gray-900">
                                            {categoryPath[0]?.name || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {papercraft.file_path ? (
                                        <a
                                            href={`/${papercraft.file_path}`}
                                            download
                                            className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download Template
                                        </a>
                                    ) : (
                                        <div className="flex-1 bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            File Belum Tersedia
                                        </div>
                                    )}

                                    <button
                                        onClick={handleShare}
                                        className="px-8 py-4 rounded-2xl font-bold text-lg text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isCopied ? (
                                            <><svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Tersalin!</>
                                        ) : (
                                            <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>Bagikan</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            {related.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 mt-16">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">Papercraft Lainnya di {papercraft.category.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {related.map((item) => (
                            <Link
                                key={item.id}
                                href={`/papercraft/${item.slug}`}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="aspect-square overflow-hidden bg-gray-100">
                                    {item.primaryImage ? (
                                        <img
                                            src={`/${item.primaryImage.image_path}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                        {item.title}
                                    </h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}