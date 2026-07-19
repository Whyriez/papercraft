import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useRef, useEffect, FormEvent } from 'react';

// === TYPES ===
interface Papercraft {
    id: number;
    title: string;
    slug?: string;
    primaryImage?: { image_path: string } | null;
    primary_image?: { image_path: string } | null;
    category?: { name: string };
}

interface Banner {
    id: number;
    type: 'papercraft' | 'custom';
    title: string | null;
    image_path: string | null;
    link_url: string | null;
    papercraft: Papercraft | null;
}

interface SiteSettings {
    whatsapp?: string | null;
    email?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    instagram?: string | null;
}

interface DashboardProps extends PageProps {
    banners: Banner[];
    papercrafts: Papercraft[];
    settings?: SiteSettings;
    flash?: { success?: string; error?: string };
}

// === KOMPONEN HELPER: CUSTOM SELECT DENGAN SEARCH ===
const CustomSelect = ({ items, value, onChange, placeholder, error }: { items: Papercraft[], value: string | number, onChange: (val: string) => void, placeholder: string, error?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Menutup dropdown saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const selectedItem = items.find(item => item.id.toString() === value.toString());

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 rounded-2xl border ${isOpen ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-700'} bg-gray-800 text-sm font-semibold text-gray-200 cursor-pointer flex justify-between items-center transition-all`}
            >
                <span className={selectedItem ? 'text-gray-200' : 'text-gray-400'}>
                    {selectedItem ? selectedItem.title : placeholder}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-800 bg-gray-900">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Cari papercraft..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => { onChange(item.id.toString()); setIsOpen(false); setSearchQuery(''); }}
                                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
                                >
                                    {item.title}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-sm font-medium text-gray-500">
                                Papercraft tidak ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            )}
            {error && <p className="mt-2 text-xs font-bold text-red-400">{error}</p>}
        </div>
    );
};


export default function Dashboard({ auth, banners, papercrafts, settings }: DashboardProps) {
    const { flash } = usePage<DashboardProps>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // State untuk Popup Notifikasi
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    // Efek untuk menangkap flash message dari backend (jika ada)
    useEffect(() => {
        if (flash?.success) showToast(flash.success, 'success');
        if (flash?.error) showToast(flash.error, 'error');
    }, [flash]);

    // Fungsi Trigger Notifikasi
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // Form Banner
    const { data: bannerData, setData: setBannerData, post: postBanner, processing: processingBanner, errors: bannerErrors, reset: resetBanner, clearErrors: clearBannerErrors } = useForm({
        type: 'papercraft',
        papercraft_id: '',
        title: '',
        link_url: '',
        image: null as File | null,
    });

    const { delete: destroyBanner } = useForm();

    // Form Pengaturan Situs
    const { data: settingsData, setData: setSettingsData, post: postSettings, processing: processingSettings, errors: settingsErrors } = useForm({
        whatsapp: settings?.whatsapp || '',
        email: settings?.email || '',
        youtube: settings?.youtube || '',
        tiktok: settings?.tiktok || '',
        instagram: settings?.instagram || '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setBannerData('image', null);
            setImagePreview(null);
        }
    };

    const submitBanner = (e: FormEvent) => {
        e.preventDefault();
        postBanner('/admin/banners', {
            preserveScroll: true,
            onSuccess: () => {
                resetBanner();
                setImagePreview(null);
                clearBannerErrors();
                if (fileInputRef.current) fileInputRef.current.value = '';
                showToast('Banner berhasil ditambahkan!', 'success');
            },
            onError: () => showToast('Gagal menambahkan banner. Periksa form!', 'error'),
        });
    };

    const deleteBanner = (id: number) => {
        if (confirm('Hapus banner ini dari halaman depan?')) {
            destroyBanner(`/admin/banners/${id}`, {
                preserveScroll: true,
                onSuccess: () => showToast('Banner berhasil dihapus!', 'success'),
            });
        }
    };

    const submitSettings = (e: FormEvent) => {
        e.preventDefault();
        postSettings('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => showToast('Pengaturan Sosial Media berhasil disimpan!', 'success'),
            onError: () => showToast('Gagal menyimpan pengaturan. Periksa form!', 'error'),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Overview Dashboard">
            <Head title="Dashboard Admin" />

            {/* 🌟 POPUP NOTIFICATION (TOAST) 🌟 */}
            <div className={`fixed top-8 right-8 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border ${toast.type === 'success' ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                    <div className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-full ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-gray-100">{toast.type === 'success' ? 'Berhasil' : 'Peringatan'}</h4>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">{toast.message}</p>
                    </div>
                </div>
            </div>

            <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/papercrafts" className="group relative overflow-hidden rounded-[30px] border border-gray-800 bg-gray-900 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-gray-800 opacity-80 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
                    <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-gray-700/50 opacity-90 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                    <div className="relative flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700 text-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Total Papercraft</p>
                            <h3 className="mt-1 text-4xl font-black text-gray-100 transition-colors group-hover:text-white">Kelola</h3>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/categories" className="group relative overflow-hidden rounded-[30px] border border-gray-800 bg-gray-900 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-gray-800 opacity-80 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
                    <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-gray-700/50 opacity-90 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                    <div className="relative flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700 text-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Kategori</p>
                            <h3 className="mt-1 text-4xl font-black text-gray-100 transition-colors group-hover:text-white">Kelola</h3>
                        </div>
                    </div>
                </Link>
            </div>

            {/* 🌟 MANAJEMEN BANNER SLIDER 🌟 */}
            <div className="mt-16 mb-8 flex items-end justify-between border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-100">Manajemen Banner</h2>
                    <p className="text-gray-400 mt-2 text-sm font-semibold">Atur banner slider yang muncul di halaman utama.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
                {/* Form Tambah Banner */}
                <div className="relative rounded-[30px] border border-gray-800 bg-gray-900 p-6 sm:p-8 shadow-lg h-fit overflow-hidden">
                    <h3 className="font-black text-xl text-gray-100 mb-6 relative z-10">Tambah Banner</h3>

                    <form onSubmit={submitBanner} className="space-y-6 relative z-10">
                        <div className="flex gap-4 p-1.5 bg-gray-800 rounded-2xl border border-gray-700">
                            <button
                                type="button"
                                onClick={() => { setBannerData('type', 'papercraft'); clearBannerErrors(); }}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${bannerData.type === 'papercraft' ? 'bg-gray-200 text-gray-900 shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                            >
                                Dari Papercraft
                            </button>
                            <button
                                type="button"
                                onClick={() => { setBannerData('type', 'custom'); clearBannerErrors(); }}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${bannerData.type === 'custom' ? 'bg-gray-200 text-gray-900 shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                            >
                                Custom Banner
                            </button>
                        </div>

                        {bannerData.type === 'papercraft' ? (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Pilih Papercraft</label>
                                <CustomSelect
                                    items={papercrafts}
                                    value={bannerData.papercraft_id}
                                    onChange={(val) => setBannerData('papercraft_id', val)}
                                    placeholder="-- Ketik untuk mencari papercraft --"
                                    error={bannerErrors.papercraft_id}
                                />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Judul Banner</label>
                                    <input
                                        type="text"
                                        value={bannerData.title || ''}
                                        onChange={e => setBannerData('title', e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                        placeholder="Judul yang menarik..."
                                    />
                                    {bannerErrors.title && <p className="mt-2 text-xs font-bold text-red-400">{bannerErrors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Link Tujuan (Opsional)</label>
                                    <input
                                        type="text"
                                        value={bannerData.link_url || ''}
                                        onChange={e => setBannerData('link_url', e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Gambar Banner</label>
                                    <div className="flex flex-col gap-3">
                                        {imagePreview && (
                                            <div className="h-32 w-full rounded-2xl overflow-hidden border-2 border-gray-600">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600 cursor-pointer"
                                        />
                                    </div>
                                    {bannerErrors.image && <p className="mt-2 text-xs font-bold text-red-400">{bannerErrors.image}</p>}
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={processingBanner} className="w-full bg-gray-200 text-gray-900 px-6 py-4 rounded-full font-bold hover:bg-white transition-all shadow-md disabled:opacity-50">
                            {processingBanner ? 'Menyimpan...' : 'Tambahkan ke Slider'}
                        </button>
                    </form>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-700/30 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* List Banner */}
                <div className="flex flex-col gap-4">
                    {banners.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-gray-700 rounded-[30px] bg-gray-900/50">
                            <p className="text-gray-400 font-bold text-lg">Belum ada banner.</p>
                            <p className="text-sm text-gray-500 mt-1">Tambahkan banner untuk menampilkan slider di Home.</p>
                        </div>
                    ) : (
                        banners.map(banner => {
                            const isCustom = banner.type === 'custom';
                            const title = isCustom ? banner.title : banner.papercraft?.title;
                            const rawImgPath = isCustom
                                ? banner.image_path
                                : (banner.papercraft?.primaryImage?.image_path ?? banner.papercraft?.primary_image?.image_path);
                            const badgeStr = isCustom ? 'Custom' : 'Papercraft';

                            const finalImage = rawImgPath
                                ? (rawImgPath.startsWith('storage/') ? `/${rawImgPath}` : `/storage/${rawImgPath}`)
                                : null;

                            return (
                                <div key={banner.id} className="group relative overflow-hidden rounded-[24px] border border-gray-800 bg-gray-900 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-sm transition-all hover:shadow-lg">
                                    <div className="h-32 w-full sm:w-48 shrink-0 rounded-2xl bg-gray-800 overflow-hidden border border-gray-700 relative">
                                        {finalImage ? (
                                            <img src={finalImage} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-gray-500 font-bold uppercase tracking-widest">No Image</div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-2 border ${isCustom ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                                    {badgeStr} Banner
                                                </span>
                                                <h4 className="text-xl font-black text-gray-100 line-clamp-2 leading-snug">{title}</h4>
                                                {isCustom && banner.link_url && (
                                                    <a href={banner.link_url} target="_blank" className="text-sm font-semibold text-gray-400 hover:text-white hover:underline mt-2 inline-block truncate max-w-[250px]">{banner.link_url}</a>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteBanner(banner.id)}
                                                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-900/30 text-red-500 hover:bg-red-800 hover:text-white transition-colors border border-red-900/50"
                                                title="Hapus Banner"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 🌟 MANAJEMEN PENGATURAN KONTAK & SOSIAL MEDIA 🌟 */}
            <div className="mt-16 mb-8 flex items-end justify-between border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-100">Kontak & Sosial Media</h2>
                    <p className="text-gray-400 mt-2 text-sm font-semibold">Atur informasi kontak dan tautan sosial media yang ditampilkan kepada pengguna.</p>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-gray-800 bg-gray-900 p-6 sm:p-8 shadow-lg mb-10">
                <form onSubmit={submitSettings} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">WhatsApp Number</label>
                            <input
                                type="text"
                                value={settingsData.whatsapp || ''}
                                onChange={e => setSettingsData('whatsapp', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                placeholder="Contoh: 6281234567890"
                            />
                            {settingsErrors.whatsapp && <p className="mt-2 text-xs font-bold text-red-400">{settingsErrors.whatsapp}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={settingsData.email || ''}
                                onChange={e => setSettingsData('email', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                placeholder="emailkamu@gmail.com"
                            />
                            {settingsErrors.email && <p className="mt-2 text-xs font-bold text-red-400">{settingsErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Instagram URL</label>
                            <input
                                type="url"
                                value={settingsData.instagram || ''}
                                onChange={e => setSettingsData('instagram', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                placeholder="https://instagram.com/username"
                            />
                            {settingsErrors.instagram && <p className="mt-2 text-xs font-bold text-red-400">{settingsErrors.instagram}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">YouTube URL</label>
                            <input
                                type="url"
                                value={settingsData.youtube || ''}
                                onChange={e => setSettingsData('youtube', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                placeholder="https://youtube.com/c/username"
                            />
                            {settingsErrors.youtube && <p className="mt-2 text-xs font-bold text-red-400">{settingsErrors.youtube}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">TikTok URL</label>
                            <input
                                type="url"
                                value={settingsData.tiktok || ''}
                                onChange={e => setSettingsData('tiktok', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-500"
                                placeholder="https://tiktok.com/@username"
                            />
                            {settingsErrors.tiktok && <p className="mt-2 text-xs font-bold text-red-400">{settingsErrors.tiktok}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button type="submit" disabled={processingSettings} className="bg-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-white transition-all shadow-md disabled:opacity-50">
                            {processingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}