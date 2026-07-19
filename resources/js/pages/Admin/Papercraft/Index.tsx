import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

// 1. Tipe Data (TypeScript Interfaces)
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Papercraft {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    category: {
        id: number;
        name: string;
    };
    primary_image?: {
        image_path: string;
    };
}

interface Props {
    auth: { user: any };
    papercrafts: {
        data: Papercraft[];
        links: PaginationLink[];
        total: number;
        from: number;
        to: number;
    };
}

export default function Index({ auth, papercrafts }: Props) {
    const { delete: destroy } = useForm();

    // Fungsi untuk menghapus data dengan konfirmasi
    const handleDelete = (id: number) => {
        if (confirm('Apakah kamu yakin ingin menghapus papercraft ini? Semua gambar juga akan terhapus.')) {
            destroy(`/admin/papercrafts/${id}`);
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 relative z-10">
                    <span className="font-black text-2xl text-[#2f2f2f]">Manajemen Papercraft</span>
                    <Link 
                        href="/admin/papercrafts/create" 
                        className="bg-[#c97758] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#b96449] hover:-translate-y-0.5 transition-all shadow-[0_12px_24px_rgba(201,119,88,0.22)] flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Tambah Data
                    </Link>
                </div>
            }
        >
            <Head title="List Papercraft" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="relative overflow-hidden rounded-[34px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_20px_45px_rgba(82,59,40,0.06)]">
                    
                    {/* Tabel Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
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
                                                <p className="text-[#67574b] font-bold text-lg">Belum ada data papercraft.</p>
                                                <p className="text-[#a97b5b] text-sm mt-1">Silakan klik tombol "Tambah Data" untuk memulai.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    papercrafts.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#fcf5eb] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-5">
                                                    {/* Thumbnail */}
                                                    <div className="w-16 h-16 rounded-2xl bg-[#f4e7d4] overflow-hidden border border-[#eadfce] flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        {item.primary_image ? (
                                                            <img src={`/${item.primary_image.image_path}`} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[#c97758] opacity-50">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#2f2f2f] text-lg">{item.title}</div>
                                                        <div className="text-xs text-[#a97b5b] font-semibold mt-1 bg-[#f4e7d4] px-2 py-0.5 rounded-md inline-block">/{item.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f1e6d5] text-[#8c6b4e] border border-[#eadfce] shadow-sm">
                                                    {item.category.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {item.is_published ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f1f6f0] text-[#4a6b43] border border-[#cde0ca] shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-[#a9c7a3]"></div>
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fff0ed] text-[#b94a2e] border border-[#fbdfd7] shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-[#e07a5f]"></div>
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {/* Tombol Lihat di Web (Public) */}
                                                    <a href={`/papercraft/${item.slug}`} target="_blank" className="p-2 text-[#a97b5b] hover:text-[#2f2f2f] bg-[#f4e7d4] hover:bg-[#e9d3bf] rounded-xl transition-all shadow-sm">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </a>
                                                    
                                                    {/* Tombol Edit */}
                                                    <Link href={`/admin/papercrafts/${item.id}/edit`} className="p-2 text-[#4a6b43] hover:text-[#2a3d26] bg-[#f1f6f0] hover:bg-[#cde0ca] rounded-xl transition-all shadow-sm">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </Link>
                                                    
                                                    {/* Tombol Hapus */}
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-[#b94a2e] hover:text-white bg-[#fff0ed] hover:bg-[#e07a5f] rounded-xl transition-all shadow-sm"
                                                    >
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
                        <div className="px-8 py-5 border-t border-[#eadfce] flex flex-col md:flex-row items-center justify-between bg-[#f4e7d4] gap-4">
                            <span className="text-sm font-semibold text-[#67574b]">
                                Menampilkan <span className="font-bold text-[#2f2f2f] bg-[#fcfaf6] px-2 py-0.5 rounded-md border border-[#eadfce]">{papercrafts.from || 0}</span> - <span className="font-bold text-[#2f2f2f] bg-[#fcfaf6] px-2 py-0.5 rounded-md border border-[#eadfce]">{papercrafts.to || 0}</span> dari <span className="font-bold text-[#c97758]">{papercrafts.total}</span> data
                            </span>
                            <div className="flex gap-1.5 flex-wrap justify-center">
                                {papercrafts.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-2 text-sm rounded-xl font-bold transition-all shadow-sm ${
                                            link.active 
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