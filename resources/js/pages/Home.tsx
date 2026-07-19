import Navbar from '@/Components/Navbar';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// === TYPE DEFINITIONS ===
interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
    papercrafts?: Papercraft[];
    image_path?: string | null;
}

interface Papercraft {
    id: number;
    title: string;
    slug: string;
    category?: Category;
    primary_image?: { image_path: string } | null;
    primaryImage?: { image_path: string } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
}

interface SiteSettings {
    whatsapp?: string | null;
    email?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    instagram?: string | null;
}

interface Props {
    categories: Category[];
    filters: { search?: string; category?: string; all?: string };
    isFiltered: boolean;
    activeCategory?: Category;
    papercrafts?: PaginatedData<Papercraft>;
    latestPapercrafts?: Papercraft[];
    categorySections?: Category[];
    banners?: any[];
    settings?: SiteSettings;
}

const buildCategoryHref = (slug: string, searchQuery?: string): string => {
    const params = new URLSearchParams({ category: slug });
    if (searchQuery) {
        params.set('search', searchQuery);
    }
    return `/?${params.toString()}#filtered-view`;
};

// === KOMPONEN HELPER: BANNER SLIDER OTOMATIS ===
const BannerSlider = ({ banners }: { banners: any[] }) => {
    const [current, setCurrent] = useState(0);

    // Fallback jika Admin belum menambahkan banner sama sekali
    const slides = banners.length > 0 ? banners : [
        { id: 991, type: 'custom', title: 'Galeri Preview Papercraft Terbaik', image_path: null, link_url: null },
    ];

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] overflow-hidden rounded-[36px] shadow-lg shadow-black/20 border border-gray-800">
            {slides.map((slide, index) => {
                const isActive = index === current;
                const isCustom = slide.type === 'custom';

                // Logika Pembacaan Data Fleksibel
                const title = isCustom ? slide.title : slide.papercraft?.title;
                const rawImgPath = isCustom ? slide.image_path : (slide.papercraft?.primaryImage?.image_path ?? slide.papercraft?.primary_image?.image_path);
                const linkDest = isCustom ? slide.link_url : (slide.papercraft ? `/papercraft/${slide.papercraft.slug}` : null);
                const badgeName = isCustom ? 'Preview' : slide.papercraft?.category?.name;

                const imgPath = rawImgPath ? (rawImgPath.startsWith('storage/') ? `/${rawImgPath}` : `/storage/${rawImgPath}`) : null;
                return (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
                    >
                        <div className="absolute inset-0 bg-gray-900">
                            {imgPath ? (
                                <img src={imgPath} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(75,85,99,0.4),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(55,65,81,0.4),transparent_50%)] bg-gray-900"></div>
                            )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16 text-white">
                            <div className={`transform transition-all duration-700 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-gray-200 shadow-sm mb-4">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                    {badgeName || 'Update'}
                                </span>
                                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-md line-clamp-2 max-w-4xl leading-tight">
                                    {title}
                                </h2>
                                {linkDest && (
                                    <Link href={linkDest} className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-gray-200 px-8 py-3.5 text-sm font-bold text-gray-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white">
                                        {isCustom ? 'Kunjungi Tautan' : 'Lihat Preview'}
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {slides.length > 1 && (
                <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12 z-20 flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-2.5 rounded-full transition-all duration-500 ${idx === current ? 'w-10 bg-gray-300' : 'w-2.5 bg-white/30 hover:bg-white/60'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// === KOMPONEN HELPER: CARD KATEGORI ===
const CategoryCard = ({ category, searchQuery = '' }: { category: Category; searchQuery?: string }) => {
    const hasChildren = category.children && category.children.length > 0;
    const hasImage = !!category.image_path;

    return (
        <Link
            href={buildCategoryHref(category.slug, searchQuery)}
            className="group relative overflow-hidden rounded-[28px] border border-gray-800 bg-gray-900 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[160px] flex flex-col justify-between"
        >
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[28px] bg-gray-800 opacity-80 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[28px] bg-gray-700 opacity-50 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />

            {hasImage ? (
                <>
                    <img
                        src={`/storage/${category.image_path}`}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-[28px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-gray-950/10 rounded-[28px]" />
                </>
            ) : (
                <div className="absolute inset-0 bg-gray-900 rounded-[28px]" />
            )}

            <div className="relative h-full flex flex-col justify-between z-10">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${hasImage ? 'text-gray-300' : 'text-gray-400'}`}>
                            Kategori
                        </p>
                        <h3 className={`mt-2 text-2xl font-black ${hasImage ? 'text-white drop-shadow-md' : 'text-gray-100'}`}>
                            {category.name}
                        </h3>
                    </div>
                    {hasChildren && (
                        <div className={`flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-sm font-black shadow-sm ${hasImage ? 'bg-black/30 backdrop-blur-md text-white border border-white/20' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}>
                            {String(category.children!.length).padStart(2, '0')}
                        </div>
                    )}
                </div>

                <div className={`mt-6 flex items-center justify-between border-t pt-4 text-sm font-semibold ${hasImage ? 'border-white/20 text-gray-200' : 'border-gray-800 text-gray-400'}`}>
                    <span>{hasChildren ? 'Lihat Sub-Kategori' : 'Lihat Koleksi'}</span>
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
        </Link>
    );
};

// === KOMPONEN HELPER: CARD PAPERCRAFT ===
const PapercraftCard = ({ item }: { item: Papercraft }) => {
    const coverImage = item.primaryImage ?? item.primary_image ?? null;

    return (
        <Link
            href={`/papercraft/${item.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[30px] border border-gray-800 bg-gray-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
        >
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-gray-800 opacity-70 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-gray-700 opacity-40 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />

            <div className="relative rounded-[30px] bg-gray-900">
                <div className="relative aspect-4/3 overflow-hidden rounded-t-[30px] bg-gray-800 border-b border-gray-800">
                    {coverImage ? (
                        <img
                            src={`/${coverImage.image_path}`}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-600">
                            <svg className="h-11 w-11 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em]">No Preview</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,24,39,0.7),rgba(17,24,39,0.02))] opacity-80" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-900/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Preview
                    </div>
                </div>

                <div className="relative flex flex-1 flex-col gap-4 p-6 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gray-400">{item.category?.name}</p>
                            <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-gray-100 transition-colors group-hover:text-white">
                                {item.title}
                            </h3>
                        </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-800 pt-4 text-sm font-semibold text-gray-400">
                        <span className="group-hover:text-gray-200 transition-colors">Lihat Detail</span>
                        <svg className="h-5 w-5 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const SectionHeading = ({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    action?: { href: string; label: string };
}) => (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-gray-400 shadow-sm">
                {eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-100 sm:text-4xl">{title}</h2>
            {description && <p className="mt-4 max-w-xl text-base leading-7 text-gray-400">{description}</p>}
        </div>

        {action && (
            <Link
                href={action.href}
                className="inline-flex items-center justify-center rounded-full border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-bold text-gray-200 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-500 hover:bg-gray-700"
            >
                {action.label}
            </Link>
        )}
    </div>
);

// === HALAMAN UTAMA ===
export default function Home({ categories, filters, isFiltered, activeCategory, papercrafts, latestPapercrafts, banners = [], settings }: Props) {
    const pageTitle = activeCategory ? activeCategory.name : 'Galeri Papercraft';
    const featuredModels = latestPapercrafts ?? [];
    const quickCategories = categories.slice(0, 6);

    const searchQuery = filters.search || '';

    const handleReset = () => {
        router.get('/');
    };

    const showSubcategories = !filters.search && activeCategory && activeCategory.children && activeCategory.children.length > 0;

    // Status All Categories (Jika tidak sedang mencari dan tidak sedang di dalam spesifik kategori)
    const isAllCategoriesActive = !filters.search && !filters.category;

    return (
        <div
            className="min-h-screen overflow-hidden bg-gray-950 font-sans text-gray-200 selection:bg-gray-700 selection:text-white"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(55, 65, 81, 0.4), transparent 36%), radial-gradient(circle at 85% 12%, rgba(75, 85, 99, 0.2), transparent 28%), radial-gradient(circle at 15% 72%, rgba(31, 41, 55, 0.4), transparent 30%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
            }}
        >
            <Head title={`PaperCraft | ${pageTitle}`} />

            <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gray-700/20 blur-3xl" />
                <div className="absolute left-0 top-40 h-80 w-80 rounded-full bg-gray-600/10 blur-3xl" />
            </div>

            <Navbar initialSearch={searchQuery} />

            <main id="home" className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">

                {/* 🌟 BANNER SLIDER 🌟 */}
                <section>
                    <BannerSlider banners={banners} />
                </section>

                {/* 🌟 QUICK CATEGORIES (Di bawah banner) 🌟 */}
                <section className="mt-8 flex flex-wrap justify-center gap-3">
                    {/* PERBAIKAN: Tombol "Semua Kategori" sekarang diarahkan ke #categories dan mereset url param */}
                    <Link href="/#categories" className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all shadow-sm ${isAllCategoriesActive ? 'border-gray-500 bg-gray-800 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:-translate-y-0.5'}`}>
                        Semua Kategori
                    </Link>
                    {quickCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={buildCategoryHref(category.slug)}
                            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all shadow-sm ${filters.category === category.slug ? 'border-gray-500 bg-gray-800 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:-translate-y-0.5'}`}
                        >
                            {category.name}
                        </Link>
                    ))}
                </section>

                {isFiltered ? (
                    <section id="filtered-view" className="mt-20 scroll-mt-24">
                        <SectionHeading
                            eyebrow={showSubcategories ? "Sub-Kategori" : "Koleksi Template"}
                            title={filters.search ? `Pencarian: "${filters.search}"` : activeCategory?.name || 'Kategori Pilihan'}
                            description={
                                showSubcategories
                                    ? `Pilih sub-kategori di dalam ${activeCategory?.name} untuk melihat koleksi spesifik.`
                                    : `Menampilkan ${papercrafts?.total ?? 0} preview papercraft untuk dilihat.`
                            }
                            action={{ href: '/#categories', label: 'Kembali' }}
                        />

                        {showSubcategories ? (
                            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {activeCategory?.children?.map((subCategory) => (
                                    <CategoryCard key={subCategory.id} category={subCategory} searchQuery={searchQuery} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8">
                                {papercrafts?.data.length === 0 ? (
                                    <div className="rounded-[34px] border border-dashed border-gray-700 bg-gray-800 px-6 py-20 text-center shadow-sm">
                                        <p className="text-lg font-extrabold text-gray-100">Tidak ada hasil ditemukan.</p>
                                        <p className="mt-3 text-sm leading-7 text-gray-400">Coba ubah kata kunci atau kembali untuk melihat koleksi lainnya.</p>
                                        <button
                                            onClick={handleReset}
                                            className="mt-6 inline-flex items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-sm font-bold text-gray-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-white"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {papercrafts?.data.map((item) => (
                                                <PapercraftCard key={item.id} item={item} />
                                            ))}
                                        </div>

                                        {papercrafts?.links && papercrafts.links.length > 3 && (
                                            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                                                {papercrafts.links.map((link, key) => (
                                                    <Link
                                                        key={key}
                                                        href={link.url ? `${link.url}#filtered-view` : '#'}
                                                        className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${link.active
                                                            ? 'border-gray-500 bg-gray-700 text-white shadow-md'
                                                            : link.url
                                                                ? 'border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                                                : 'cursor-not-allowed border-gray-900 bg-gray-900/50 text-gray-700'
                                                            }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </section>
                ) : (
                    <>
                        <section id="categories" className="mt-20 scroll-mt-24">
                            {/* PERBAIKAN: Deskripsi Kategori disesuaikan dengan konteks Barter */}
                            <SectionHeading
                                eyebrow="Kategori Template"
                                title="Eksplorasi Koleksi Papercraft"
                                description="Jelajahi galeri preview kami berdasarkan kategori. Temukan model papercraft favoritmu di sini."
                            />

                            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {categories.map((category) => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        </section>

                        <section id="featured" className="mt-20">
                            {/* PERBAIKAN: Deskripsi Featured Models disesuaikan */}
                            <SectionHeading
                                eyebrow="Model Pilihan"
                                title="Preview Template Terpopuler"
                                description="Beberapa koleksi preview papercraft pilihan yang menarik. Lihat detail dan bentuknya sebelum kamu memutuskan untuk berkolaborasi."
                            />

                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {featuredModels.map((item) => (
                                    <PapercraftCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

                <footer className="mt-24 rounded-[34px] border border-gray-800 bg-gray-900 px-6 py-12 shadow-lg sm:px-10 lg:py-16" id="contact">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-gray-400 shadow-sm">
                                Tertarik & Ingin Barter?
                            </span>
                            {/* PERBAIKAN: Copywriting Call To Action difokuskan untuk "Barter" */}
                            <h2 className="mt-5 text-3xl font-black text-gray-100 sm:text-4xl">Mari Berdiskusi dan Bertukar Template!</h2>
                            <p className="mt-4 text-base leading-7 text-gray-400">Website ini didedikasikan sebagai galeri preview. Kalau kamu melihat template yang menarik dan ingin melakukan barter (tukar template), langsung saja hubungi saya lewat kontak di bawah ini!</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                            {/* Tombol Email Dinamis */}
                            {settings?.email && (
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="inline-flex items-center gap-2.5 rounded-full bg-gray-200 px-7 py-4 text-sm font-bold text-gray-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email Saya
                                </a>
                            )}

                            {/* Tombol WhatsApp Dinamis */}
                            {settings?.whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.whatsapp}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2.5 rounded-full border border-gray-700 bg-gray-800 px-7 py-4 text-sm font-bold text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-600 hover:bg-gray-700"
                                >
                                    <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.735-1.48-1.643-1.653-1.94-.173-.296-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            )}

                            {/* Tombol Instagram Dinamis */}
                            {settings?.instagram && (
                                <a
                                    href={settings.instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
                                    aria-label="Instagram"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.76-6.98 6.979-.059 1.28-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 1.76 6.78 6.98 6.979 1.28.059 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.762 6.979-6.979.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-1.778-6.78-6.979-6.98-1.28-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm font-medium text-gray-500">
                        <p>© {new Date().getFullYear()} PaperCraft. All rights reserved.</p>

                        <div className="flex flex-wrap gap-6 font-bold">
                            {settings?.youtube && (
                                <a href={settings.youtube} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">YouTube</a>
                            )}
                            {settings?.tiktok && (
                                <a href={settings.tiktok} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">TikTok</a>
                            )}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}