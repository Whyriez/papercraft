import Navbar from '@/Components/Navbar';
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
        papercraft.images.find((img) => img.is_primary) || papercraft.images[0] || null
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
    const heroImage = activeImage || papercraft.images[0] || null;

    return (
        <div
            className="min-h-screen overflow-hidden bg-[#fcfaf6] font-sans text-[#2f2f2f] selection:bg-[#c97758] selection:text-white pb-20"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(233, 211, 191, 0.55), transparent 36%), radial-gradient(circle at 85% 14%, rgba(169, 199, 163, 0.28), transparent 28%), linear-gradient(rgba(47, 47, 47, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 47, 47, 0.02) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 44px 44px, 44px 44px',
            }}
        >
            <Head title={`${papercraft.title} - PaperCraft`} />

            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#a9c7a3]/20 blur-3xl" />
                <div className="absolute left-0 top-40 h-80 w-80 rounded-full bg-[#e6b95b]/16 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-12">
                <nav className="mb-8 flex flex-wrap items-center gap-y-2 text-sm font-medium text-[#7f6e5e]">
                    <Link href="/" className="transition-colors hover:text-[#c97758]">
                        Home
                    </Link>

                    {categoryPath.map((cat) => (
                        <div key={cat.id} className="flex items-center">
                            <span className="mx-2 text-[#d7c4b1]">/</span>
                            <Link href={`/?category=${cat.slug}`} className="transition-colors hover:text-[#c97758]">
                                {cat.name}
                            </Link>
                        </div>
                    ))}

                    <span className="mx-2 text-[#d7c4b1]">/</span>
                    <span className="line-clamp-1 text-[#2f2f2f]">{papercraft.title}</span>
                </nav>

                <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative rounded-[36px] border border-[#eadfce] bg-[#fcfaf6] p-5 shadow-[0_20px_50px_rgba(82,59,40,0.09)] sm:p-6">
                        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[36px] bg-[#e9d3bf] opacity-80" />
                        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[36px] bg-[#f3e7d6] opacity-90" />

                        <div className="relative overflow-hidden rounded-4xl border border-[#eadfce] bg-[#f7efe3] shadow-[0_14px_30px_rgba(82,59,40,0.06)]">
                            <div className="relative aspect-square bg-[#f3eadc]">
                                {heroImage ? (
                                    <img src={`/${heroImage.image_path}`} alt={papercraft.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[#8d7c6d]">Tidak ada gambar</div>
                                )}

                                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,47,47,0.34),rgba(47,47,47,0.02))]" />

                                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-[#fcfaf6]/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6b5a4c] shadow-[0_10px_20px_rgba(82,59,40,0.08)]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c97758]" />
                                    Printable
                                </div>

                                <div className="absolute bottom-4 left-4 rounded-full bg-[#fcfaf6]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b6147] shadow-[0_12px_24px_rgba(82,59,40,0.08)]">
                                    {categoryPath.map((c) => c.name).join(' • ')}
                                </div>
                            </div>

                            <div className="relative p-5">
                                {papercraft.images.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {papercraft.images.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => setActiveImage(img)}
                                                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${activeImage?.id === img.id
                                                    ? 'border-[#c97758] opacity-100 shadow-[0_12px_24px_rgba(82,59,40,0.10)]'
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img src={`/${img.image_path}`} alt={`Thumbnail ${img.id}`} className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div id="details" className="flex flex-col justify-center">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a97b5b] shadow-[0_10px_20px_rgba(82,59,40,0.06)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c97758]" />
                            {categoryPath.map((c) => c.name).join(' • ')}
                        </span>

                        <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-tight text-[#2f2f2f] sm:text-5xl lg:text-6xl">
                            {papercraft.title}
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#67574b] whitespace-pre-wrap">
                            {papercraft.description}
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-5 shadow-[0_14px_30px_rgba(82,59,40,0.07)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Tipe Template</p>
                                <p className="mt-3 flex items-center gap-2 text-base font-bold text-[#2f2f2f]">
                                    {papercraft.file_path ? (
                                        <>
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#7aa16e]" />
                                            {fileExtension} File
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#c97758]" />
                                            Tidak Ada
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-5 shadow-[0_14px_30px_rgba(82,59,40,0.07)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Kategori Utama</p>
                                <p className="mt-3 text-base font-bold text-[#2f2f2f]">{categoryPath[0]?.name || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                            {papercraft.file_path ? (
                                <a
                                    href={`/${papercraft.file_path}`}
                                    download
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#c97758] px-7 py-4 text-lg font-bold text-white shadow-[0_16px_30px_rgba(201,119,88,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#b96449] sm:flex-none"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Template
                                </a>
                            ) : (
                                <div className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[#eadfce] bg-[#f5efe6] px-7 py-4 text-lg font-bold text-[#a79a8d] sm:flex-none">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    File Belum Tersedia
                                </div>
                            )}

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfce] bg-[#fcfaf6] px-7 py-4 text-lg font-bold text-[#2f2f2f] shadow-[0_14px_30px_rgba(82,59,40,0.07)] transition-all hover:-translate-y-0.5 hover:bg-white"
                            >
                                {isCopied ? (
                                    <>
                                        <svg className="h-6 w-6 text-[#7aa16e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Tersalin!
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Bagikan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {related.length > 0 && (
                    <section id="related" className="mt-20">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a97b5b] shadow-[0_10px_20px_rgba(82,59,40,0.06)]">
                                    Related Models
                                </span>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-[#2f2f2f] sm:text-4xl">
                                    Papercraft lainnya di {papercraft.category.name}
                                </h2>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/papercraft/${item.slug}`}
                                    className="group relative overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_18px_40px_rgba(82,59,40,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(82,59,40,0.12)]"
                                >
                                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-[#ead6c2] opacity-70" />
                                    <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-[#f4e7d4] opacity-90" />

                                    <div className="relative">
                                        <div className="aspect-square overflow-hidden rounded-t-[30px] bg-[#f3eadc]">
                                            {item.primaryImage ? (
                                                <img
                                                    src={`/${item.primaryImage.image_path}`}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-[#8d7c6d]">No Image</div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a97b5b]">Template</p>
                                            <h3 className="mt-3 line-clamp-2 text-lg font-extrabold leading-snug text-[#2f2f2f] transition-colors group-hover:text-[#c97758]">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}