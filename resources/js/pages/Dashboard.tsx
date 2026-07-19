import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useRef, FormEvent } from 'react';

// === TYPES ===
interface Papercraft {
    id: number;
    title: string;
    slug?: string;
    primaryImage?: { image_path: string } | null;
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

interface DashboardProps extends PageProps {
    banners: Banner[];
    papercrafts: Papercraft[];
}

export default function Dashboard({ auth, banners, papercrafts }: DashboardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'papercraft',
        papercraft_id: '',
        title: '',
        link_url: '',
        image: null as File | null,
    });

    const { delete: destroy } = useForm();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setData('image', null);
            setImagePreview(null);
        }
    };

    const submitBanner = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/banners', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                clearErrors();
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    const deleteBanner = (id: number) => {
        if (confirm('Hapus banner ini dari halaman depan?')) {
            destroy(`/admin/banners/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Overview Dashboard">
            <Head title="Dashboard Admin" />

            <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/papercrafts" className="group relative overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#fcfaf6] p-6 shadow-[0_18px_40px_rgba(82,59,40,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(82,59,40,0.12)] block">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-[#f1dfc8] opacity-80 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
                    <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-[#f8eedf] opacity-90 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                    <div className="relative flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a9c7a3] text-white shadow-[0_14px_28px_rgba(169,199,163,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a97b5b]">Total Papercraft</p>
                            <h3 className="mt-1 text-4xl font-black text-[#2f2f2f] transition-colors group-hover:text-[#a9c7a3]">Kelola</h3>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/categories" className="group relative overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#fcfaf6] p-6 shadow-[0_18px_40px_rgba(82,59,40,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(82,59,40,0.12)] block">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[30px] bg-[#f1dfc8] opacity-80 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
                    <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[30px] bg-[#f8eedf] opacity-90 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                    <div className="relative flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6b95b] text-white shadow-[0_14px_28px_rgba(230,185,91,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a97b5b]">Kategori</p>
                            <h3 className="mt-1 text-4xl font-black text-[#2f2f2f] transition-colors group-hover:text-[#e6b95b]">Kelola</h3>
                        </div>
                    </div>
                </Link>
            </div>

            {/* 🌟 MANAJEMEN BANNER SLIDER 🌟 */}
            <div className="mt-16 mb-8 flex items-end justify-between border-b border-[#eadfce] pb-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#2f2f2f]">Manajemen Banner</h2>
                    <p className="text-[#67574b] mt-2 text-sm font-semibold">Atur banner slider yang muncul di halaman utama.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">

                {/* Form Tambah Banner */}
                <div className="relative overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#f4e7d4] p-6 sm:p-8 shadow-[0_16px_30px_rgba(82,59,40,0.06)] h-fit sticky top-28">
                    <h3 className="font-black text-xl text-[#2f2f2f] mb-6">Tambah Banner</h3>

                    <form onSubmit={submitBanner} className="space-y-6 relative z-10">
                        {/* Pilihan Tipe Banner */}
                        <div className="flex gap-4 p-1.5 bg-[#fcfaf6] rounded-2xl border border-[#eadfce]">
                            <button
                                type="button"
                                onClick={() => { setData('type', 'papercraft'); clearErrors(); }}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${data.type === 'papercraft' ? 'bg-[#c97758] text-white shadow-md' : 'text-[#a97b5b] hover:bg-[#f4e7d4]'}`}
                            >
                                Dari Papercraft
                            </button>
                            <button
                                type="button"
                                onClick={() => { setData('type', 'custom'); clearErrors(); }}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${data.type === 'custom' ? 'bg-[#e6b95b] text-white shadow-md' : 'text-[#a97b5b] hover:bg-[#f4e7d4]'}`}
                            >
                                Custom Banner
                            </button>
                        </div>

                        {data.type === 'papercraft' ? (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-2">Pilih Papercraft</label>
                                <select
                                    value={data.papercraft_id}
                                    onChange={e => setData('papercraft_id', e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border border-[#eadfce] bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] focus:outline-none focus:border-[#c97758] focus:ring-1 focus:ring-[#c97758]"
                                >
                                    <option value="" disabled>-- Pilih Papercraft --</option>
                                    {papercrafts.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                {errors.papercraft_id && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.papercraft_id}</p>}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-2">Judul Banner</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl border border-[#eadfce] bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] placeholder:text-[#bcae9f] focus:outline-none focus:border-[#e6b95b]"
                                        placeholder="Judul yang menarik..."
                                    />
                                    {errors.title && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-2">Link Tujuan (Opsional)</label>
                                    <input
                                        type="text"
                                        value={data.link_url}
                                        onChange={e => setData('link_url', e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl border border-[#eadfce] bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] placeholder:text-[#bcae9f] focus:outline-none focus:border-[#e6b95b]"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-2">Gambar Banner</label>
                                    <div className="flex flex-col gap-3">
                                        {imagePreview && (
                                            <div className="h-32 w-full rounded-2xl overflow-hidden border-2 border-[#e6b95b]">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full text-sm text-[#67574b] file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#e6b95b] file:text-white hover:file:bg-[#d6a94b] cursor-pointer"
                                        />
                                    </div>
                                    {errors.image && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.image}</p>}
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={processing} className="w-full bg-[#2f2f2f] text-white px-6 py-4 rounded-full font-bold hover:bg-black transition-all shadow-[0_12px_24px_rgba(47,47,47,0.22)] disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Tambahkan ke Slider'}
                        </button>
                    </form>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#e9d3bf] rounded-full blur-2xl opacity-60 pointer-events-none"></div>
                </div>

                {/* List Banner */}
                <div className="flex flex-col gap-4">
                    {banners.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-[#eadfce] rounded-[30px] bg-[#fcfaf6]">
                            <p className="text-[#a97b5b] font-bold text-lg">Belum ada banner.</p>
                            <p className="text-sm text-[#67574b] mt-1">Tambahkan banner untuk menampilkan slider di Home.</p>
                        </div>
                    ) : (
                        banners.map(banner => {
                            const isCustom = banner.type === 'custom';
                            const title = isCustom ? banner.title : banner.papercraft?.title;
                            const image = isCustom ? banner.image_path : banner.papercraft?.primaryImage?.image_path;
                            const badgeStr = isCustom ? 'Custom' : 'Papercraft';

                            return (
                                <div key={banner.id} className="group relative overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fcfaf6] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-[0_10px_20px_rgba(82,59,40,0.04)] transition-all hover:shadow-[0_14px_30px_rgba(82,59,40,0.08)]">
                                    <div className="h-32 w-full sm:w-48 shrink-0 rounded-2xl bg-[#f3eadc] overflow-hidden border border-[#eadfce] relative">
                                        {image ? (
                                            <img src={`/storage/${image}`} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-[#a97b5b] font-bold uppercase tracking-widest">No Image</div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-2 ${isCustom ? 'bg-[#f8e4db] text-[#c97758]' : 'bg-[#e4ecdf] text-[#6b8e61]'}`}>
                                                    {badgeStr} Banner
                                                </span>
                                                <h4 className="text-xl font-black text-[#2f2f2f] line-clamp-2 leading-snug">{title}</h4>
                                                {isCustom && banner.link_url && (
                                                    <a href={banner.link_url} target="_blank" className="text-sm font-semibold text-[#c97758] hover:underline mt-2 inline-block truncate max-w-[250px]">{banner.link_url}</a>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteBanner(banner.id)}
                                                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#fff0ed] text-[#e07a5f] hover:bg-[#e07a5f] hover:text-white transition-colors border border-[#e07a5f]/20"
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
        </AuthenticatedLayout>
    );
}