import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/Components/Navbar';

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
        papercraft.images.find((img) => img.is_primary) ||
        papercraft.images[0] ||
        null,
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
        const currentIndex = papercraft.images.findIndex(
            (img) => img.id === activeImage?.id,
        );
        const prevIndex =
            currentIndex === 0
                ? papercraft.images.length - 1
                : currentIndex - 1;
        setActiveImage(papercraft.images[prevIndex]);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = papercraft.images.findIndex(
            (img) => img.id === activeImage?.id,
        );
        const nextIndex =
            currentIndex === papercraft.images.length - 1
                ? 0
                : currentIndex + 1;
        setActiveImage(papercraft.images[nextIndex]);
    };

    // 🌟 FUNGSI ZOOM & PAN (GESER)
    // Reset zoom saat gambar berubah atau lightbox ditutup
    useEffect(() => {
        const to = setTimeout(() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }, 0);

        return () => clearTimeout(to);
    }, [activeImage, isLightboxOpen]);

    const handleZoomIn = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setScale((prev) => Math.min(prev + 0.5, 4)); // Batas maskimal zoom 4x
    };

    const handleZoomOut = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setScale((prev) => {
            const newScale = Math.max(prev - 0.5, 1); // Batas minimal zoom 1x

            if (newScale === 1) {
                setPosition({ x: 0, y: 0 });
            } // Kembalikan ke tengah jika ukuran normal

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
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
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
            if (e.key === 'Escape') {
                setIsLightboxOpen(false);
            }

            if (e.key === 'ArrowRight') {
                const currentIndex = papercraft.images.findIndex(
                    (img) => img.id === activeImage?.id,
                );
                const nextIndex =
                    currentIndex === papercraft.images.length - 1
                        ? 0
                        : currentIndex + 1;
                setActiveImage(papercraft.images[nextIndex]);
            }

            if (e.key === 'ArrowLeft') {
                const currentIndex = papercraft.images.findIndex(
                    (img) => img.id === activeImage?.id,
                );
                const prevIndex =
                    currentIndex === 0
                        ? papercraft.images.length - 1
                        : currentIndex - 1;
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
            className="min-h-screen overflow-hidden bg-gray-950 pb-20 font-sans text-gray-200 selection:bg-gray-700 selection:text-white"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(55, 65, 81, 0.4), transparent 36%), radial-gradient(circle at 85% 12%, rgba(75, 85, 99, 0.2), transparent 28%), radial-gradient(circle at 15% 72%, rgba(31, 41, 55, 0.4), transparent 30%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize:
                    '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
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
                    <div
                        className="absolute top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/40 px-4 py-2 shadow-lg backdrop-blur-md md:right-6 md:left-auto md:translate-x-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="mr-2 text-xs font-bold tracking-widest text-white/70 uppercase">
                            Zoom
                        </span>
                        <button
                            onClick={handleZoomOut}
                            disabled={scale <= 1}
                            className="rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M20 12H4"
                                />
                            </svg>
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-white">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={scale >= 4}
                            className="mr-4 rounded-full border-r border-white/20 bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </button>

                        <div className="mr-1 h-6 w-px bg-white/20"></div>

                        <button
                            className="flex items-center justify-center p-2 text-white/70 transition-colors hover:text-white"
                            onClick={() => setIsLightboxOpen(false)}
                            title="Close (Esc)"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Tombol Navigasi Kiri */}
                    {papercraft.images.length > 1 && (
                        <button
                            className="absolute left-4 z-50 rounded-full bg-white/10 p-3 text-white/70 shadow-lg backdrop-blur-md transition-all hover:bg-white/25 hover:text-white md:left-10 md:p-5"
                            onClick={handlePrevImage}
                        >
                            <svg
                                className="h-6 w-6 md:h-8 md:w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Gambar Utama Fullscreen (Dengan Transform Scale & Translate) */}
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                        <img
                            src={`/${heroImage.image_path}`}
                            alt={papercraft.title}
                            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl select-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                cursor:
                                    scale > 1
                                        ? isDragging
                                            ? 'grabbing'
                                            : 'grab'
                                        : 'zoom-in',
                                transition: isDragging
                                    ? 'none'
                                    : 'transform 0.2s ease-out',
                            }}
                            onMouseDown={handleMouseDown}
                            onDoubleClick={handleDoubleClick}
                            draggable="false"
                        />
                    </div>

                    {/* Tombol Navigasi Kanan */}
                    {papercraft.images.length > 1 && (
                        <button
                            className="absolute right-4 z-50 rounded-full bg-white/10 p-3 text-white/70 shadow-lg backdrop-blur-md transition-all hover:bg-white/25 hover:text-white md:right-10 md:p-5"
                            onClick={handleNextImage}
                        >
                            <svg
                                className="h-6 w-6 md:h-8 md:w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Indikator Jumlah Gambar */}
                    {papercraft.images.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/40 px-6 py-3 text-xs font-bold tracking-[0.2em] text-white/90 shadow-lg backdrop-blur-md">
                            {papercraft.images.findIndex(
                                (img) => img.id === activeImage?.id,
                            ) + 1}{' '}
                            / {papercraft.images.length}
                        </div>
                    )}
                </div>
            )}

            <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gray-700/20 blur-3xl" />
                <div className="absolute top-40 left-0 h-80 w-80 rounded-full bg-gray-600/10 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:pt-32">
                <nav className="mb-8 flex flex-wrap items-center gap-y-2 text-sm font-medium text-gray-400">
                    <Link
                        href="/#categories" // 👈 Tambahkan #categories di sini
                        className="transition-colors hover:text-gray-200"
                    >
                        Home
                    </Link>

                    {categoryPath.map((cat) => (
                        <div key={cat.id} className="flex items-center">
                            <span className="mx-2 text-gray-600">/</span>
                            <Link
                                href={`/?category=${cat.slug}#filtered-view`} // 👈 Tambahkan #filtered-view di sini
                                className="transition-colors hover:text-gray-200"
                            >
                                {cat.name}
                            </Link>
                        </div>
                    ))}

                    <span className="mx-2 text-gray-600">/</span>
                    <span className="line-clamp-1 text-gray-200">
                        {papercraft.title}
                    </span>
                </nav>

                <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative rounded-[36px] border border-gray-800 bg-gray-900 p-5 shadow-lg sm:p-6">
                        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[36px] bg-gray-700 opacity-20" />
                        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[36px] bg-gray-800 opacity-40" />

                        <div className="relative overflow-hidden rounded-4xl border border-gray-800 bg-gray-900/50 shadow-sm">
                            {/* 🌟 GAMBAR PREVIEW UTAMA 🌟 */}
                            <div
                                className="group relative aspect-square cursor-zoom-in overflow-hidden bg-gray-800/50"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                {heroImage ? (
                                    <img
                                        src={`/${heroImage.image_path}`}
                                        alt={papercraft.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                                        No Image
                                    </div>
                                )}

                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                                    <div className="flex scale-75 transform items-center gap-2 rounded-full border border-gray-700 bg-gray-800 p-4 pr-6 text-sm font-bold text-gray-200 shadow-md transition-all duration-300 group-hover:scale-100">
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                            />
                                        </svg>
                                        Click to Zoom
                                    </div>
                                </div>

                                <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-gray-950/40 to-transparent" />

                                <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/90 px-3 py-1 text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase shadow-sm backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                                    Preview Only
                                </div>

                                <div className="absolute bottom-4 left-4 z-10 rounded-full bg-gray-800/90 px-4 py-2 text-[11px] font-bold tracking-[0.22em] text-gray-400 uppercase shadow-sm backdrop-blur-sm">
                                    {categoryPath
                                        .map((c) => c.name)
                                        .join(' • ')}
                                </div>
                            </div>

                            <div className="relative p-5">
                                {papercraft.images.length > 1 && (
                                    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                                        {papercraft.images.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() =>
                                                    setActiveImage(img)
                                                }
                                                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${activeImage?.id === img.id
                                                    ? 'scale-105 border-gray-500 opacity-100 shadow-sm'
                                                    : 'border-transparent opacity-60 hover:scale-105 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={`/${img.image_path}`}
                                                    alt={`Thumbnail ${img.id}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div id="details" className="flex flex-col justify-center">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-4 py-1.5 text-[11px] font-bold tracking-[0.28em] text-gray-400 uppercase shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                            {categoryPath.map((c) => c.name).join(' • ')}
                        </span>

                        <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-tight text-gray-100 sm:text-5xl lg:text-6xl">
                            {papercraft.title}
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 whitespace-pre-wrap text-gray-400">
                            {papercraft.description}
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[28px] border border-gray-800 bg-gray-900 p-5 shadow-sm">
                                <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
                                    Content Type
                                </p>
                                <p className="mt-3 flex items-center gap-2 text-base font-bold text-gray-200">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
                                    Gallery Preview
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-gray-800 bg-gray-900 p-5 shadow-sm">
                                <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
                                    Main Category
                                </p>
                                <p className="mt-3 text-base font-bold text-gray-200">
                                    {categoryPath[0]?.name || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <button
                                onClick={handleShare}
                                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-700 bg-gray-800 px-10 py-4 text-lg font-bold text-gray-200 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-500 hover:bg-gray-700 sm:w-auto"
                            >
                                {isCopied ? (
                                    <>
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Link Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                            />
                                        </svg>
                                        Share this Preview
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
                                <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-4 py-1.5 text-[11px] font-bold tracking-[0.28em] text-gray-400 uppercase shadow-sm">
                                    Related Models
                                </span>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-100 sm:text-4xl">
                                    Other papercrafts in{' '}
                                    {papercraft.category.name}
                                </h2>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/papercraft/${item.slug}`}
                                    className="group relative overflow-hidden rounded-[30px] border border-gray-800 bg-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-600 hover:bg-gray-800"
                                >
                                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-gray-700 opacity-20" />
                                    <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-gray-800 opacity-40" />

                                    <div className="relative">
                                        <div className="aspect-square overflow-hidden rounded-t-[30px] bg-gray-800">
                                            {item.primaryImage ? (
                                                <img
                                                    src={`/${item.primaryImage.image_path}`}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <p className="text-[10px] font-bold tracking-[0.28em] text-gray-500 uppercase">
                                                Preview
                                            </p>
                                            <h3 className="mt-3 line-clamp-2 text-lg leading-snug font-extrabold text-gray-200 transition-colors group-hover:text-white">
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
