import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

// === TYPE DEFINITIONS ===
interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
    papercrafts?: Papercraft[];
}

interface Papercraft {
    id: number;
    title: string;
    slug: string;
    category: Category;
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

interface Props {
    categories: Category[];
    filters: { search?: string; category?: string; all?: string };
    isFiltered: boolean;
    activeCategory?: Category;
    papercrafts?: PaginatedData<Papercraft>;
    latestPapercrafts?: Papercraft[];
    categorySections?: Category[];
}

const buildCategoryHref = (slug: string, searchQuery?: string): string => {
    const params = new URLSearchParams({ category: slug });

    if (searchQuery) {
        params.set('search', searchQuery);
    }

    return `/?${params.toString()}`;
};

const PapercraftCard = ({ item }: { item: Papercraft }) => {
    const coverImage = item.primaryImage ?? item.primary_image ?? null;

    return (
        <Link
            href={`/papercraft/${item.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_18px_45px_rgba(82,59,40,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(82,59,40,0.16)]"
        >
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-[#ead6c2] opacity-70 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-[#f4e7d4] opacity-90 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />

            <div className="relative rounded-[30px] bg-[#fcfaf6]">
                <div className="relative aspect-4/3 overflow-hidden rounded-t-[30px] bg-[#f3eadc]">
                    {coverImage ? (
                        <img
                            src={`/${coverImage.image_path}`}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#8d7c6d]">
                            <svg className="h-11 w-11 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em]">No Preview</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,47,47,0.38),rgba(47,47,47,0.02))] opacity-80" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-[#fcfaf6]/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6b5a4c] shadow-[0_10px_20px_rgba(82,59,40,0.08)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c97758]" />
                        Printable
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/15 backdrop-blur-sm">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0-8l-3 3m3-3l3 3M4 6h16" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Paper Model</p>
                            <p className="text-sm font-bold">Craft-ready template</p>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-1 flex-col gap-4 p-6 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a97b5b]">{item.category?.name}</p>
                            <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-[#2f2f2f] transition-colors group-hover:text-[#c97758]">
                                {item.title}
                            </h3>
                        </div>

                        <button
                            type="button"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#eadfce] bg-[#fcfaf6] text-[#c97758] shadow-[0_10px_20px_rgba(82,59,40,0.08)] transition-transform duration-300 group-hover:-rotate-6"
                            aria-label="Favorite"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f4e7d4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b6147]">Layered</span>
                        <span className="rounded-full bg-[#e3f0de] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#63805b]">PDF Ready</span>
                        <span className="rounded-full bg-[#f8e3db] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a86247]">Free Preview</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-[#efe4d6] pt-4 text-sm font-semibold text-[#7f6e5e]">
                        <span>View Template</span>
                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a97b5b] shadow-[0_10px_20px_rgba(82,59,40,0.06)]">
                {eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#2f2f2f] sm:text-4xl">{title}</h2>
            {description && <p className="mt-4 max-w-xl text-base leading-7 text-[#67574b]">{description}</p>}
        </div>

        {action && (
            <Link
                href={action.href}
                className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-[#fcfaf6] px-5 py-3 text-sm font-bold text-[#2f2f2f] shadow-[0_10px_20px_rgba(82,59,40,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#d9c8b0] hover:bg-white"
            >
                {action.label}
            </Link>
        )}
    </div>
);

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) => (
    <div className="rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-6 shadow-[0_18px_40px_rgba(82,59,40,0.08)] transition-transform duration-300 hover:-translate-y-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#f6ebdb] text-[#c97758] shadow-[0_10px_20px_rgba(82,59,40,0.06)]">
            {icon}
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-[#2f2f2f]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#67574b]">{description}</p>
    </div>
);

const ProcessStep = ({ index, title }: { index: string; title: string }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#eadfce] bg-[#fcfaf6] text-lg font-black text-[#c97758] shadow-[0_12px_24px_rgba(82,59,40,0.08)]">
            {index}
        </div>
        <p className="mt-4 max-w-36 text-sm font-bold text-[#2f2f2f]">{title}</p>
    </div>
);

const TestimonialCard = ({ quote, name, role }: { quote: string; name: string; role: string }) => (
    <div className="relative rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-7 shadow-[0_18px_40px_rgba(82,59,40,0.08)]">
        <div className="absolute left-6 top-6 text-6xl leading-none text-[#e7d7c0]">“</div>
        <p className="relative mt-6 text-base leading-7 text-[#56493e]">{quote}</p>
        <div className="mt-6 flex items-center gap-4 border-t border-[#efe4d6] pt-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#a9c7a3] to-[#e6b95b] text-sm font-black text-[#2f2f2f] shadow-[0_10px_20px_rgba(82,59,40,0.08)]">
                {name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
            </div>
            <div>
                <p className="text-sm font-extrabold text-[#2f2f2f]">{name}</p>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a8474]">{role}</p>
            </div>
        </div>
    </div>
);

const HeroIllustration = () => (
    <div className="relative mx-auto h-130 w-full max-w-140">
        <div className="absolute left-10 top-14 h-24 w-24 rounded-full bg-[#a9c7a3]/55 blur-2xl" />
        <div className="absolute right-12 top-6 h-20 w-20 rounded-full bg-[#e6b95b]/45 blur-2xl" />

        <div className="absolute inset-6 translate-x-4 translate-y-4 rounded-[38px] bg-[#e9d3bf] shadow-[0_24px_50px_rgba(82,59,40,0.10)]" />
        <div className="absolute inset-8 translate-x-2 translate-y-2 rounded-[36px] bg-[#f3e7d6] shadow-[0_20px_40px_rgba(82,59,40,0.08)]" />
        <div className="absolute inset-10 rounded-[34px] bg-[#fcfaf6] shadow-[0_22px_45px_rgba(82,59,40,0.10)] ring-1 ring-[#eadfce]" />

        <div className="absolute left-16 top-16 h-14 w-36 rounded-full bg-[#a9c7a3]/70 shadow-[0_14px_28px_rgba(82,59,40,0.08)]" />
        <div className="absolute right-16 top-18 h-10 w-24 rounded-full bg-[#fcfaf6] shadow-[0_12px_24px_rgba(82,59,40,0.08)] ring-1 ring-[#eadfce]" />

        <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden rounded-b-[34px] bg-[#f1e0c8]">
            <div className="absolute bottom-0 left-0 right-0 h-36 rounded-t-[52px] bg-[#c97758]" />
            <div className="absolute bottom-10 left-10 h-28 w-28 rounded-[38px] bg-[#7aa16e]" />
            <div className="absolute bottom-14 left-32 h-24 w-44 rounded-[46px] bg-[#a9c7a3]" />
            <div className="absolute bottom-16 right-10 h-28 w-28 rounded-[34px] bg-[#e6b95b]" />
        </div>

        <div className="absolute left-12 top-40 h-52 w-44 rounded-[42px] bg-[#f4e7d4] shadow-[0_18px_35px_rgba(82,59,40,0.12)] ring-1 ring-[#eadfce] rotate-[-5deg]" />
        <div className="absolute left-24 top-48 h-44 w-36 rounded-[36px] bg-[#fcfaf6] shadow-[0_18px_35px_rgba(82,59,40,0.10)] ring-1 ring-[#eadfce] -rotate-2" />

        <div className="absolute left-36 top-56 flex h-28 w-28 items-center justify-center rounded-full bg-[#c97758] shadow-[0_18px_35px_rgba(82,59,40,0.12)]">
            <div className="h-16 w-16 rounded-full border-4 border-[#fcfaf6]" />
        </div>

        <div className="absolute right-12 top-42 h-40 w-28 rounded-[34px] bg-[#f8ebd7] shadow-[0_16px_30px_rgba(82,59,40,0.10)] ring-1 ring-[#eadfce] rotate-[8deg]" />
        <div className="absolute right-20 top-48 h-24 w-16 rounded-[20px] bg-[#2f2f2f] shadow-[0_16px_30px_rgba(82,59,40,0.12)] rotate-18" />
        <div className="absolute right-28 top-52 h-5 w-32 rounded-full bg-[#fcfaf6] shadow-[0_10px_20px_rgba(82,59,40,0.08)] rotate-18" />

        <div className="absolute right-16 bottom-28 h-22 w-22 rounded-[26px] bg-[#e6b95b] shadow-[0_16px_30px_rgba(82,59,40,0.10)] rotate-10" />
        <div className="absolute left-12 bottom-28 h-5 w-24 rounded-full bg-[#fcfaf6] shadow-[0_10px_20px_rgba(82,59,40,0.08)] rotate-[-16deg]" />
        <div className="absolute left-24 bottom-34 h-16 w-5 rounded-full bg-[#c97758] rotate-24" />
        <div className="absolute left-28 bottom-34 h-5 w-16 rounded-full bg-[#fcfaf6] rotate-24" />

        <div className="absolute bottom-10 right-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fcfaf6] shadow-[0_14px_28px_rgba(82,59,40,0.10)] ring-1 ring-[#eadfce]">
            <svg className="h-7 w-7 text-[#c97758]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m-7-7h14" />
            </svg>
        </div>

        <div className="absolute bottom-14 left-14 rounded-full bg-[#fcfaf6] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7b6147] shadow-[0_14px_28px_rgba(82,59,40,0.08)] ring-1 ring-[#eadfce]">
            Fold. Cut. Glue.
        </div>
    </div>
);

// === KOMPONEN HELPER: REKURSIF KATEGORI DROPDOWN ===
const CategoryItem = ({ cat, level = 0, filters, searchQuery }: { cat: Category; level?: number; filters: Props['filters']; searchQuery: string }) => {
    const isActive = filters.category === cat.slug;
    const hasChildren = Boolean(cat.children && cat.children.length > 0);

    const checkChildActive = (category: Category): boolean => {
        if (category.slug === filters.category) {
            return true;
        }

        if (category.children && category.children.length > 0) {
            return category.children.some(checkChildActive);
        }

        return false;
    };

    const [isOpen, setIsOpen] = useState(isActive || checkChildActive(cat));

    return (
        <li className="flex flex-col">
            <div
                className={`flex items-center justify-between rounded-2xl border border-[#eadfce] bg-[#fcfaf6] transition-all duration-300 ${
                    isActive ? 'shadow-[0_14px_26px_rgba(82,59,40,0.10)] ring-1 ring-[#eadfce]' : 'shadow-[0_10px_20px_rgba(82,59,40,0.05)] hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(82,59,40,0.08)]'
                }`}
            >
                <Link
                    href={buildCategoryHref(cat.slug, searchQuery)}
                    preserveScroll
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive ? 'text-[#c97758]' : level === 0 ? 'text-[#3d332b]' : 'text-[#6e5c4c]'}`}
                    style={{ paddingLeft: `${0.75 + level * 0.55}rem` }}
                >
                    {cat.name}
                </Link>

                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }}
                        className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfce] bg-[#f7efe3] text-[#c97758] transition-transform duration-200 hover:-translate-y-0.5"
                        aria-label="Toggle Subcategory"
                    >
                        <svg className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {hasChildren && isOpen && (
                <ul className="ml-4 mt-2 flex flex-col gap-2 border-l border-[#eadfce] pl-3">
                    {cat.children!.map((child) => (
                        <CategoryItem key={child.id} cat={child} level={level + 1} filters={filters} searchQuery={searchQuery} />
                    ))}
                </ul>
            )}
        </li>
    );
};

// === HALAMAN UTAMA ===
export default function Home({ categories, filters, isFiltered, activeCategory, papercrafts, latestPapercrafts, categorySections }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const pageTitle = activeCategory ? activeCategory.name : filters.all ? 'Semua Kategori' : 'Koleksi Papercraft Premium';
    const featuredModels = latestPapercrafts ?? [];
    const quickCategories = categories.slice(0, 6);

    const heroStats = [
        { label: 'Categories', value: String(categories.length).padStart(2, '0') },
        { label: 'Featured', value: String(featuredModels.length).padStart(2, '0') },
        { label: 'Collections', value: String(categorySections?.length ?? 0).padStart(2, '0') },
    ];

    const designFeatures = [
        {
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 7h16M4 12h10M4 17h14" />
                </svg>
            ),
            title: 'Easy to Build',
            description: 'Clear, tactile presentation that makes every template feel approachable and fun to start.',
        },
        {
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9 12l2 2 4-4m-1-5.5a6.5 6.5 0 10-5 11.9 6.5 6.5 0 005-11.9z" />
                </svg>
            ),
            title: 'Printable PDF',
            description: 'A clean paper-first layout that visually reinforces the print-and-fold workflow.',
        },
        {
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 8c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4-4.5 1.8-4.5 4m0-12c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" />
                </svg>
            ),
            title: 'Creator Community',
            description: 'A warm browsing experience that feels human, curated, and creative.',
        },
        {
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 12h16M12 4v16" />
                </svg>
            ),
            title: 'Free Downloads',
            description: 'Generous spacing, soft shadows, and paper layers make browsing feel premium and calm.',
        },
    ];

    const processSteps = ['Choose Model', 'Download PDF', 'Print', 'Cut', 'Fold', 'Glue', 'Finished Papercraft'];

    const testimonials = [
        {
            quote: 'The layered paper look makes the whole library feel handcrafted, not just catalogued.',
            name: 'Ari Putra',
            role: 'Paper Crafter',
        },
        {
            quote: 'Browsing templates now feels like opening a beautifully assembled storybook.',
            name: 'Nadia Sari',
            role: 'Creator',
        },
        {
            quote: 'The new landing page immediately communicates creativity, warmth, and premium craft.',
            name: 'Rafi Mahendra',
            role: 'Community Member',
        },
    ];

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            '/',
            {
                search: searchQuery,
                ...(filters.category ? { category: filters.category } : {}),
                ...(filters.all ? { all: '1' } : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearchQuery('');
        router.get('/');
    };

    return (
        <div
            className="min-h-screen overflow-hidden bg-[#fcfaf6] font-sans text-[#2f2f2f] selection:bg-[#c97758] selection:text-white"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top left, rgba(233, 211, 191, 0.55), transparent 36%), radial-gradient(circle at 85% 12%, rgba(169, 199, 163, 0.32), transparent 28%), radial-gradient(circle at 15% 72%, rgba(230, 185, 91, 0.18), transparent 30%), linear-gradient(rgba(47, 47, 47, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 47, 47, 0.02) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 42px 42px, 42px 42px',
            }}
        >
            <Head title={`PaperCraft | ${pageTitle}`} />

            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#a9c7a3]/20 blur-3xl" />
                <div className="absolute left-0 top-40 h-80 w-80 rounded-full bg-[#e6b95b]/20 blur-3xl" />
            </div>

            <nav className="sticky top-4 z-50 px-4 sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-[34px] border border-[#eadfce] bg-[#fcfaf6]/95 px-5 py-4 shadow-[0_18px_45px_rgba(82,59,40,0.08)] backdrop-blur-sm">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c97758] text-white shadow-[0_14px_28px_rgba(82,59,40,0.12)]">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10l3 7-8 9-8-9 3-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#a97b5b]">PaperCraft</p>
                            <p className="text-sm font-semibold text-[#67574b]">Layered paper models</p>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-6 text-sm font-semibold text-[#67574b] lg:flex">
                        <a href="#home" className="transition-colors hover:text-[#c97758]">Home</a>
                        <a href="#featured" className="transition-colors hover:text-[#c97758]">Explore</a>
                        <a href="#categories" className="transition-colors hover:text-[#c97758]">Categories</a>
                        <a href="#creators" className="transition-colors hover:text-[#c97758]">Creators</a>
                        <a href="#pricing" className="transition-colors hover:text-[#c97758]">Pricing</a>
                        <a href="#community" className="transition-colors hover:text-[#c97758]">Community</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-2 text-sm font-bold text-[#2f2f2f] shadow-[0_10px_20px_rgba(82,59,40,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white">
                            Login
                        </Link>
                        <Link href="/register" className="rounded-full bg-[#c97758] px-4 py-2 text-sm font-bold text-white shadow-[0_14px_28px_rgba(201,119,88,0.26)] transition-all hover:-translate-y-0.5 hover:bg-[#b96449]">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            <main id="home" className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:pt-12">
                <section className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a97b5b] shadow-[0_10px_20px_rgba(82,59,40,0.06)]">
                            Premium Paper Cut
                        </span>

                        <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-[#2f2f2f] sm:text-6xl lg:text-7xl">
                            Create Amazing Papercraft Models
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#67574b]">
                            Discover hundreds of printable papercraft templates made by talented creators around the world.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <a href="#featured" className="inline-flex items-center justify-center rounded-full bg-[#2f2f2f] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_30px_rgba(47,47,47,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1f1f1f]">
                                Explore Models
                            </a>
                            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-[#fcfaf6] px-6 py-3 text-sm font-bold text-[#2f2f2f] shadow-[0_10px_20px_rgba(82,59,40,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white">
                                Become Creator
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {heroStats.map((stat) => (
                                <div key={stat.label} className="rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-5 text-left shadow-[0_14px_30px_rgba(82,59,40,0.06)]">
                                    <p className="text-3xl font-black text-[#2f2f2f]">{stat.value}</p>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9a8474]">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <HeroIllustration />
                    </div>
                </section>

                <section className="mt-16 rounded-[34px] border border-[#eadfce] bg-[#fcfaf6]/95 p-5 shadow-[0_18px_45px_rgba(82,59,40,0.08)] sm:p-6">
                    <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="flex items-center gap-4 rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] px-5 py-4 shadow-[0_10px_20px_rgba(82,59,40,0.05)]">
                            <svg className="h-6 w-6 text-[#a97b5b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-base placeholder:text-[#a79a8d] focus:outline-none"
                                placeholder="Cari karakter, armor, senjata..."
                            />
                        </div>

                        <button type="submit" className="rounded-full bg-[#c97758] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(201,119,88,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#b96449]">
                            Cari Template
                        </button>
                    </form>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link href="/?all=1" className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${filters.all ? 'border-[#c97758] bg-[#f8e4db] text-[#c97758]' : 'border-[#eadfce] bg-[#fcfaf6] text-[#67574b] hover:bg-white'}`}>
                            All Categories
                        </Link>
                        {quickCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={buildCategoryHref(category.slug)}
                                className="rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-2 text-sm font-bold text-[#67574b] transition-all hover:-translate-y-0.5 hover:bg-white"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </section>

                <section id="categories" className="mt-20">
                    <SectionHeading
                        eyebrow="Categories"
                        title="Layered paper cards for every style"
                        description="Browse the most popular papercraft families in a warm, handcrafted layout that feels printed on premium paper."
                        action={{ href: '/?all=1', label: 'Browse All' }}
                    />

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={buildCategoryHref(category.slug)}
                                className="group relative overflow-hidden rounded-[28px] border border-[#eadfce] bg-[#fcfaf6] p-6 shadow-[0_18px_40px_rgba(82,59,40,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(82,59,40,0.12)]"
                            >
                                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[28px] bg-[#f1dfc8] opacity-80 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
                                <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[28px] bg-[#f8eedf] opacity-90 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Category</p>
                                            <h3 className="mt-3 text-2xl font-black text-[#2f2f2f]">{category.name}</h3>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a9c7a3] text-sm font-black text-[#2f2f2f] shadow-[0_14px_28px_rgba(82,59,40,0.08)]">
                                            {String(category.papercrafts?.length ?? 0).padStart(2, '0')}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-[#efe4d6] pt-4 text-sm font-semibold text-[#67574b]">
                                        <span>{category.children?.length ? `${category.children.length} subcategories` : 'Curated papercrafts'}</span>
                                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {isFiltered ? (
                    <section id="featured" className="mt-20">
                        <SectionHeading
                            eyebrow="Filtered Collection"
                            title={filters.search ? `Pencarian: "${filters.search}"` : filters.all ? 'Semua Kategori' : activeCategory?.name || 'Selected Category'}
                            description={`Menampilkan ${papercrafts?.total ?? 0} template papercraft dalam tampilan paper-cut yang lebih hangat dan editorial.`}
                            action={{ href: '/', label: 'Reset Filters' }}
                        />

                        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
                            <aside className="rounded-[30px] border border-[#eadfce] bg-[#fcfaf6] p-5 shadow-[0_18px_40px_rgba(82,59,40,0.08)]">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Categories</h3>
                                    <Link href="/" className="rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c97758] transition-all hover:-translate-y-0.5">
                                        Reset
                                    </Link>
                                </div>

                                <Link
                                    href="/?all=1"
                                    className={`mb-4 block rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${filters.all ? 'border-[#c97758] bg-[#f8e4db] text-[#c97758]' : 'border-[#eadfce] bg-white text-[#2f2f2f] hover:bg-[#fcfaf6]'}`}
                                >
                                    Semua Kategori
                                </Link>

                                <ul className="flex flex-col gap-2">
                                    {categories.map((category) => (
                                        <CategoryItem key={category.id} cat={category} filters={filters} searchQuery={searchQuery} />
                                    ))}
                                </ul>
                            </aside>

                            <div>
                                {papercrafts?.data.length === 0 ? (
                                    <div className="rounded-[34px] border border-dashed border-[#d9c8b0] bg-[#fcfaf6] px-6 py-20 text-center shadow-[0_18px_40px_rgba(82,59,40,0.05)]">
                                        <p className="text-lg font-extrabold text-[#2f2f2f]">Tidak ada hasil ditemukan.</p>
                                        <p className="mt-3 text-sm leading-7 text-[#67574b]">Coba ubah kata kunci atau buka kembali semua kategori untuk melihat koleksi lainnya.</p>
                                        <button
                                            onClick={handleReset}
                                            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#c97758] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(201,119,88,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#b96449]"
                                        >
                                            Lihat Semua Template
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                            {papercrafts?.data.map((item) => (
                                                <PapercraftCard key={item.id} item={item} />
                                            ))}
                                        </div>

                                        {papercrafts?.links && papercrafts.links.length > 3 && (
                                            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                                                {papercrafts.links.map((link, key) => (
                                                    <Link
                                                        key={key}
                                                        href={link.url || '#'}
                                                        className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                                                            link.active
                                                                ? 'border-[#c97758] bg-[#c97758] text-white shadow-[0_14px_28px_rgba(201,119,88,0.22)]'
                                                                : link.url
                                                                    ? 'border-[#eadfce] bg-[#fcfaf6] text-[#67574b] hover:bg-white'
                                                                    : 'cursor-not-allowed border-[#efe4d6] bg-[#f6efe6] text-[#b4a797]'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        preserveScroll
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        <section id="featured" className="mt-20">
                            <SectionHeading
                                eyebrow="Featured Models"
                                title="Beautiful cards that rise like stacked paper sheets"
                                description="Highlighted templates are framed with warm layers, soft shadows, and editorial spacing to feel crafted rather than catalogued."
                            />

                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {featuredModels.map((item) => (
                                    <PapercraftCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>

                        {categorySections && categorySections.length > 0 && (
                            <section className="mt-20">
                                <SectionHeading
                                    eyebrow="Curated Collections"
                                    title="Explore by category family"
                                    description="Every category opens a different corner of the PaperCraft library, from cozy animals to bold fantasy builds."
                                />

                                <div className="mt-8 space-y-12">
                                    {categorySections.map((section) => (
                                        <section key={section.id} className="rounded-[34px] border border-[#eadfce] bg-[#fcfaf6] p-6 shadow-[0_18px_40px_rgba(82,59,40,0.08)] sm:p-8">
                                            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#efe4d6] pb-4">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a97b5b]">Collection</p>
                                                    <h3 className="mt-2 text-2xl font-black text-[#2f2f2f]">{section.name}</h3>
                                                </div>
                                                <Link href={buildCategoryHref(section.slug)} className="text-sm font-bold text-[#c97758] transition-colors hover:text-[#a95038]">
                                                    Lihat Semua {section.name} &rarr;
                                                </Link>
                                            </div>

                                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                                {section.papercrafts?.map((item) => (
                                                    <PapercraftCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section id="creators" className="mt-20">
                            <SectionHeading
                                eyebrow="Why Choose PaperCraft"
                                title="Everything is built to feel handmade, cozy, and premium"
                                description="The entire page uses layered paper surfaces, rounded edges, and soft shadows to keep the browsing experience creative and calm."
                            />

                            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                {designFeatures.map((feature) => (
                                    <FeatureCard key={feature.title} {...feature} />
                                ))}
                            </div>
                        </section>

                        <section id="pricing" className="mt-20">
                            <SectionHeading
                                eyebrow="Download Process"
                                title="A simple paper-making journey"
                                description="Choose a model, print it, and move through each folded step until the finished papercraft is ready to display."
                            />

                            <div className="mt-10 rounded-[34px] border border-[#eadfce] bg-[#fcfaf6] p-6 shadow-[0_18px_40px_rgba(82,59,40,0.08)] sm:p-8">
                                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-7 xl:gap-4">
                                    {processSteps.map((step, index) => (
                                        <div key={step} className="flex items-center justify-center gap-8 xl:contents">
                                            <ProcessStep index={String(index + 1).padStart(2, '0')} title={step} />
                                            {index < processSteps.length - 1 && <div className="hidden h-px flex-1 bg-[#eadfce] xl:block" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="community" className="mt-20">
                            <SectionHeading
                                eyebrow="Testimonials"
                                title="Speech-bubble stories from the maker community"
                                description="A few warm notes that match the handcrafted tone of the new landing page."
                            />

                            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                                {testimonials.map((testimonial) => (
                                    <TestimonialCard key={testimonial.name} {...testimonial} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

                <footer className="mt-20 rounded-[34px] border border-[#eadfce] bg-[#f6ecdf] px-6 py-10 shadow-[0_18px_40px_rgba(82,59,40,0.08)] sm:px-8" id="footer">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#a97b5b]">PaperCraft</p>
                            <h2 className="mt-3 text-3xl font-black text-[#2f2f2f]">A premium paper-cut home for makers, explorers, and creators.</h2>
                            <p className="mt-4 text-base leading-7 text-[#67574b]">Newsletter, social links, and community spaces can live here as the library grows.</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:w-105">
                            <input
                                type="email"
                                placeholder="Email newsletter"
                                className="w-full rounded-full border border-[#eadfce] bg-[#fcfaf6] px-5 py-3 text-sm font-medium text-[#2f2f2f] placeholder:text-[#a79a8d] shadow-[0_10px_20px_rgba(82,59,40,0.05)] focus:outline-none"
                            />
                            <button type="button" className="rounded-full bg-[#2f2f2f] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(47,47,47,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#1f1f1f]">
                                Join Newsletter
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#eadfce] pt-6 text-sm text-[#7f6e5e]">
                        <p>© 2026 PaperCraft. Crafted with layered paper inspiration.</p>
                        <div className="flex flex-wrap gap-4 font-semibold">
                            <a href="#home" className="transition-colors hover:text-[#c97758]">Home</a>
                            <a href="#categories" className="transition-colors hover:text-[#c97758]">Categories</a>
                            <a href="#community" className="transition-colors hover:text-[#c97758]">Community</a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}