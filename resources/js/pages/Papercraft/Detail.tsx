import Navbar from '@/Components/Navbar';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

// 1. Definisikan tipe data
interface Image {
    id: number;
    image_path: string;
    is_primary: boolean;
}

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

    // 🌟 STATE LIGHTBOX & ZOOM
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getCategoryHierarchy = (category: Category) => {
        const hierarchy = [];
        let current: Category | undefined = category;

        while (current) {
            hierarchy.unshift(current);
            current = current.parent;
        }

        return hierarchy;
    };

    const categoryPath = getCategoryHierarchy(papercraft.category);
    const heroImage = activeImage || papercraft.images[0] || null;

    // 🌟 FUNGSI NAVIGASI GAMBAR
    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = papercraft.images.findIndex(img => img.id === activeImage?.id);
        const prevIndex = currentIndex === 0 ? papercraft.images.length - 1 : currentIndex - 1;
        setActiveImage(papercraft.images[prevIndex]);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = papercraft.images.findIndex(img => img.id === activeImage?.id);
        const nextIndex = currentIndex === papercraft.images.length - 1 ? 0 : currentIndex + 1;
        setActiveImage(papercraft.images[nextIndex]);
    };

    // 🌟 FUNGSI ZOOM & PAN (GESER)
    // Reset zoom saat gambar berubah atau lightbox ditutup
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [activeImage, isLightboxOpen]);

    const handleZoomIn = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setScale(prev => Math.min(prev + 0.5, 4)); // Batas maskimal zoom 4x
    };

    const handleZoomOut = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1); // Batas minimal zoom 1x
            if (newScale === 1) setPosition({ x: 0, y: 0 }); // Kembalikan ke tengah jika ukuran normal
            return newScale;
        });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (scale > 1) {
            e.preventDefault(); // Cegah block selection bawaan browser
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (scale > 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        } else {
            setScale(2.5); // Langsung zoom 2.5x
        }
    };

    // Keyboard controls (Escape & Panah)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') {
                const currentIndex = papercraft.images.findIndex(img => img.id === activeImage?.id);
                const nextIndex = currentIndex === papercraft.images.length - 1 ? 0 : currentIndex + 1;
                setActiveImage(papercraft.images[nextIndex]);
            }
            if (e.key === 'ArrowLeft') {
                const currentIndex = papercraft.images.findIndex(img => img.id === activeImage?.id);
                const prevIndex = currentIndex === 0 ? papercraft.images.length - 1 : currentIndex - 1;
                setActiveImage(papercraft.images[prevIndex]);
            }
        };

        if (isLightboxOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isLightboxOpen, activeImage, papercraft.images]);

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

            {/* 🌟 LIGHTBOX / ZOOM OVERLAY DENGAN FITUR PAN & SCROLL 🌟 */}
            {isLightboxOpen && heroImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a1a]/95 backdrop-blur-xl transition-all duration-300"
                    onClick={() => setIsLightboxOpen(false)}
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Header Controls (Close & Zoom Tools) */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 flex items-center gap-3 z-50 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md shadow-lg" onClick={e => e.stopPropagation()}>
                        <span className="text-white/70 text-xs font-bold mr-2 tracking-widest uppercase">Zoom</span>
                        <button onClick={handleZoomOut} disabled={scale <= 1} className="text-white/70 hover:text-white disabled:opacity-30 transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                        </button>
                        <span className="text-white font-bold text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} disabled={scale >= 4} className="text-white/70 hover:text-white disabled:opacity-30 transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full mr-4 border-r border-white/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        </button>

                        <div className="w-px h-6 bg-white/20 mr-1"></div>

                        <button
                            className="text-white/70 hover:text-[#e07a5f] p-2 transition-colors flex items-center justify-center"
                            onClick={() => setIsLightboxOpen(false)}
                            title="Tutup (Esc)"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Tombol Navigasi Kiri */}
                    {papercraft.images.length > 1 && (
                        <button
                            className="absolute left-4 md:left-10 text-white/70 hover:text-white p-3 md:p-5 bg-white/10 hover:bg-white/25 rounded-full transition-all backdrop-blur-md shadow-lg z-50"
                            onClick={handlePrevImage}
                        >
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}

                    {/* Gambar Utama Fullscreen (Dengan Transform Scale & Translate) */}
                    <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
                        <img
                            src={`/${heroImage.image_path}`}
                            alt={papercraft.title}
                            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-2xl select-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                            onMouseDown={handleMouseDown}
                            onDoubleClick={handleDoubleClick}
                            draggable="false"
                        />
                    </div>

                    {/* Tombol Navigasi Kanan */}
                    {papercraft.images.length > 1 && (
                        <button
                            className="absolute right-4 md:right-10 text-white/70 hover:text-white p-3 md:p-5 bg-white/10 hover:bg-white/25 rounded-full transition-all backdrop-blur-md shadow-lg z-50"
                            onClick={handleNextImage}
                        >
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}

                    {/* Indikator Jumlah Gambar */}
                    {papercraft.images.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 font-bold tracking-[0.2em] text-xs bg-black/40 px-6 py-3 rounded-full backdrop-blur-md shadow-lg z-50">
                            {papercraft.images.findIndex(img => img.id === activeImage?.id) + 1} / {papercraft.images.length}
                        </div>
                    )}
                </div>
            )}

            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#a9c7a3]/20 blur-3xl" />
                <div className="absolute left-0 top-40 h-80 w-80 rounded-full bg-[#e6b95b]/16 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:pt-32">

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

                            {/* 🌟 GAMBAR PREVIEW UTAMA 🌟 */}
                            <div
                                className="relative aspect-square bg-[#f3eadc] group cursor-zoom-in overflow-hidden"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                {heroImage ? (
                                    <img
                                        src={`/${heroImage.image_path}`}
                                        alt={papercraft.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[#8d7c6d]">Tidak ada gambar</div>
                                )}

                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-[2px]">
                                    <div className="bg-white/95 text-[#c97758] p-4 rounded-full shadow-[0_10px_30px_rgba(82,59,40,0.2)] transform scale-75 group-hover:scale-100 transition-all duration-300 flex items-center gap-2 font-bold text-sm pr-6">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                        Klik untuk Zoom
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,47,47,0.34),rgba(47,47,47,0.02))] pointer-events-none z-0" />

                                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-[#fcfaf6]/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6b5a4c] shadow-[0_10px_20px_rgba(82,59,40,0.08)] z-10">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c97758]" />
                                    Preview Only
                                </div>

                                <div className="absolute bottom-4 left-4 rounded-full bg-[#fcfaf6]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b6147] shadow-[0_12px_24px_rgba(82,59,40,0.08)] z-10">
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
                                                    ? 'border-[#c97758] opacity-100 shadow-[0_12px_24px_rgba(82,59,40,0.10)] scale-105'
                                                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
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
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Tipe Konten</p>
                                <p className="mt-3 flex items-center gap-2 text-base font-bold text-[#2f2f2f]">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#c97758]" />
                                    Preview Galeri
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-5 shadow-[0_14px_30px_rgba(82,59,40,0.07)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Kategori Utama</p>
                                <p className="mt-3 text-base font-bold text-[#2f2f2f]">{categoryPath[0]?.name || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <button
                                onClick={handleShare}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-[#c97758] px-10 py-4 text-lg font-bold text-white shadow-[0_16px_30px_rgba(201,119,88,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#b96449]"
                            >
                                {isCopied ? (
                                    <>
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Tautan Tersalin!
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Bagikan Preview Ini
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
                                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a97b5b]">Preview</p>
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