import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// 1. Tipe Data (TypeScript Interfaces)
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Category {
    id: number;
    name: string;
    all_children?: Category[];
    parent?: Category;
}

interface Papercraft {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    category: Category;
    primary_image?: {
        image_path: string;
    };
}

interface Props {
    auth: { user: any };
    categories: Category[];
    filters: { search?: string; category_id?: string; status?: string };
    papercrafts: {
        data: Papercraft[];
        links: PaginationLink[];
        total: number;
        from: number;
        to: number;
    };
}

export default function Index({ auth, papercrafts, categories, filters }: Props) {
    const { flash } = usePage<any>().props;
    const { delete: destroy } = useForm();

    // State untuk Filter
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || '');
    const [status, setStatus] = useState(filters?.status || '');

    // State untuk Popup Notifikasi & Modal
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

    // Efek untuk memunculkan toast dari flash message backend
    useEffect(() => {
        if (flash?.success) showToast(flash.success, 'success');
        if (flash?.error) showToast(flash.error, 'error');
    }, [flash]);

    // Efek Trigger Filtering (Debounce 300ms untuk mencegah query beruntun saat mengetik)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/admin/papercrafts', {
                search: searchTerm,
                category_id: categoryId,
                status: status
            }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, categoryId, status]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const confirmDelete = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const executeDelete = () => {
        if (!deleteModal.id) return;
        destroy(`/admin/papercrafts/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ isOpen: false, id: null });
            }
        });
    };

    // Fungsi Render Opsi Kategori untuk Filter (Mendukung Hierarki Tak Terbatas)
    const renderCategoryOptions = (cats: Category[], level = 0) => {
        let options: JSX.Element[] = [];
        cats.forEach((cat) => {
            const prefix = level > 0 ? '—'.repeat(level) + ' ' : '';
            options.push(
                <option key={cat.id} value={cat.id} className="font-semibold text-[#2f2f2f]">
                    {prefix}{cat.name}
                </option>
            );
            if (cat.all_children && cat.all_children.length > 0) {
                options = options.concat(renderCategoryOptions(cat.all_children, level + 1));
            }
        });
        return options;
    };

    // Fungsi Menggambar Breadcrumb Kategori pada Tabel (Misal: "Main Kategori — Sub Kategori")
    const renderCategoryBreadcrumb = (category: Category | undefined) => {
        if (!category) return 'Tanpa Kategori';
        let breadcrumb = category.name;
        let current = category;
        while (current.parent) {
            breadcrumb = `${current.parent.name} — ${breadcrumb}`;
            current = current.parent;
        }
        return breadcrumb;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 relative z-10">
                    <span className="font-black text-2xl text-[#2f2f2f] truncate">Manajemen Papercraft</span>
                </div>
            }
        >
            <Head title="List Papercraft" />

            {/* 🌟 POPUP NOTIFICATION (TOAST) 🌟 */}
            <div className={`fixed top-8 right-8 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border ${toast.type === 'success' ? 'bg-[#f4fbf4] border-[#a9c7a3] text-[#2f2f2f]' : 'bg-[#fff4f2] border-[#e07a5f] text-[#2f2f2f]'}`}>
                    <div className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-full ${toast.type === 'success' ? 'bg-[#a9c7a3]/20 text-[#6b8e61]' : 'bg-[#e07a5f]/20 text-[#e07a5f]'}`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-black">{toast.type === 'success' ? 'Berhasil' : 'Peringatan'}</h4>
                        <p className="text-xs font-semibold text-[#67574b] mt-0.5">{toast.message}</p>
                    </div>
                </div>
            </div>

            {/* 🌟 MODAL KONFIRMASI HAPUS 🌟 */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#2f2f2f]/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-[#fcfaf6] rounded-[34px] p-8 max-w-md w-full shadow-[0_24px_60px_rgba(82,59,40,0.15)] border border-[#eadfce]">
                        <div className="w-16 h-16 bg-[#fff0ed] text-[#e07a5f] rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_16px_rgba(224,122,95,0.15)] border border-[#e07a5f]/20">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-[#2f2f2f] mb-3">Hapus Papercraft?</h3>
                        <p className="text-[#67574b] text-sm leading-relaxed mb-6">
                            Apakah kamu yakin ingin menghapus data papercraft ini?
                            <span className="block mt-2 font-semibold text-[#a97b5b]">Semua gambar yang terkait dengan papercraft ini juga akan ikut terhapus permanen dan tidak dapat dikembalikan.</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="flex-1 px-5 py-3.5 rounded-full border border-[#eadfce] font-bold text-[#67574b] bg-white shadow-sm hover:bg-[#f4e7d4] transition-colors">
                                Batal
                            </button>
                            <button onClick={executeDelete} className="flex-1 px-5 py-3.5 rounded-full bg-[#e07a5f] font-bold text-white shadow-[0_10px_20px_rgba(224,122,95,0.2)] hover:bg-[#cc6a50] hover:-translate-y-0.5 transition-all">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto pb-12 mt-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                    <div>
                        <p className="text-[#67574b] text-sm font-semibold">Terdapat <span className="font-bold text-[#c97758]">{papercrafts.total}</span> template papercraft di database.</p>
                    </div>
                    <Link
                        href="/admin/papercrafts/create"
                        className="bg-[#c97758] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#b96449] hover:-translate-y-0.5 transition-all shadow-[0_12px_24px_rgba(201,119,88,0.22)] flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Tambah Data
                    </Link>
                </div>

                {/* 🌟 FILTER BAR 🌟 */}
                <div className="mb-6 p-5 bg-[#fcfaf6] rounded-[28px] border border-[#eadfce] shadow-[0_10px_30px_rgba(82,59,40,0.03)] flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a97b5b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul papercraft..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-[#eadfce] bg-white text-sm font-semibold text-[#2f2f2f] focus:outline-none focus:border-[#c97758] focus:ring-1 focus:ring-[#c97758]"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl border border-[#eadfce] bg-white text-sm font-semibold text-[#2f2f2f] focus:outline-none focus:border-[#c97758] focus:ring-1 focus:ring-[#c97758]"
                        >
                            <option value="">Semua Kategori</option>
                            {renderCategoryOptions(categories)}
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl border border-[#eadfce] bg-white text-sm font-semibold text-[#2f2f2f] focus:outline-none focus:border-[#c97758] focus:ring-1 focus:ring-[#c97758]"
                        >
                            <option value="">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[34px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_20px_45px_rgba(82,59,40,0.06)]">
                    {/* Tabel Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-[#f4e7d4] border-b border-[#eadfce]">
                                    <th className="px-6 py-5 text-xs font-bold text-[#a97b5b] uppercase tracking-[0.15em]">Papercraft Info</th>
                                    <th className="px-6 py-5 text-xs font-bold text-[#a97b5b] uppercase tracking-[0.15em]">Kategori</th>
                                    <th className="px-6 py-5 text-xs font-bold text-[#a97b5b] uppercase tracking-[0.15em]">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-[#a97b5b] uppercase tracking-[0.15em] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eadfce]">
                                {papercrafts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-2xl bg-[#f4e7d4] flex items-center justify-center text-[#c97758] mb-4">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                </div>
                                                <p className="text-[#67574b] font-bold text-lg">Pencarian tidak menemukan hasil.</p>
                                                <p className="text-[#a97b5b] text-sm mt-1">Coba ubah kata kunci atau filter kamu.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    papercrafts.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#fcf5eb] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-[#f4e7d4] overflow-hidden border border-[#eadfce] flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        {item.primary_image ? (
                                                            /* 🌟 PERBAIKAN: Deteksi URL gambar agar tidak terjadi error path ganda 🌟 */
                                                            <img
                                                                src={item.primary_image.image_path.startsWith('storage/') ? `/${item.primary_image.image_path}` : `/storage/${item.primary_image.image_path}`}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[#c97758] opacity-50">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-[#2f2f2f] text-lg truncate max-w-[200px] md:max-w-md">{item.title}</div>
                                                        <div className="text-xs text-[#a97b5b] font-semibold mt-1 bg-[#f4e7d4] px-2 py-0.5 rounded-md inline-block truncate max-w-[200px] md:max-w-md">/{item.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f1e6d5] text-[#8c6b4e] border border-[#eadfce] shadow-sm whitespace-nowrap">
                                                    {renderCategoryBreadcrumb(item.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {item.is_published ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f1f6f0] text-[#4a6b43] border border-[#cde0ca] shadow-sm whitespace-nowrap">
                                                        <div className="w-2 h-2 rounded-full bg-[#a9c7a3]"></div>
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fff0ed] text-[#b94a2e] border border-[#fbdfd7] shadow-sm whitespace-nowrap">
                                                        <div className="w-2 h-2 rounded-full bg-[#e07a5f]"></div>
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <a href={`/papercraft/${item.slug}`} target="_blank" rel="noreferrer" title="Lihat Halaman Publik" className="p-2 text-[#a97b5b] hover:text-[#2f2f2f] bg-[#f4e7d4] hover:bg-[#e9d3bf] rounded-xl transition-all shadow-sm">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </a>
                                                    <Link href={`/admin/papercrafts/${item.id}/edit`} title="Edit Papercraft" className="p-2 text-[#4a6b43] hover:text-[#2a3d26] bg-[#f1f6f0] hover:bg-[#cde0ca] rounded-xl transition-all shadow-sm">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </Link>
                                                    <button onClick={() => confirmDelete(item.id)} title="Hapus Papercraft" className="p-2 text-[#b94a2e] hover:text-white bg-[#fff0ed] hover:bg-[#e07a5f] rounded-xl transition-all shadow-sm">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {papercrafts.links.length > 3 && (
                        <div className="px-5 sm:px-8 py-5 border-t border-[#eadfce] flex flex-col md:flex-row items-center justify-between bg-[#f4e7d4] gap-4">
                            <span className="text-sm font-semibold text-[#67574b] text-center md:text-left">
                                Menampilkan <span className="font-bold text-[#2f2f2f] bg-[#fcfaf6] px-2 py-0.5 rounded-md border border-[#eadfce]">{papercrafts.from || 0}</span> - <span className="font-bold text-[#2f2f2f] bg-[#fcfaf6] px-2 py-0.5 rounded-md border border-[#eadfce]">{papercrafts.to || 0}</span> dari <span className="font-bold text-[#c97758]">{papercrafts.total}</span> data
                            </span>
                            <div className="flex gap-1.5 flex-wrap justify-center">
                                {papercrafts.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-2 text-sm rounded-xl font-bold transition-all shadow-sm ${link.active
                                            ? 'bg-[#c97758] text-white shadow-[0_4px_10px_rgba(201,119,88,0.3)] ring-2 ring-[#c97758] ring-offset-2 ring-offset-[#f4e7d4]'
                                            : link.url
                                                ? 'bg-[#fcfaf6] text-[#2f2f2f] hover:bg-[#e9d3bf] hover:text-[#c97758] border border-[#eadfce]'
                                                : 'bg-[#f4e7d4] text-[#a97b5b] opacity-50 cursor-not-allowed border border-[#eadfce]'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}