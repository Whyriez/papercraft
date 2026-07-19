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
                <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xl text-gray-800">Manajemen Papercraft</span>
                    <Link 
                        href="/admin/papercrafts/create" 
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Tambah Data
                    </Link>
                </div>
            }
        >
            <Head title="List Papercraft" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Tabel Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Papercraft Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {papercrafts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Belum ada data papercraft. Silakan tambah data baru!
                                        </td>
                                    </tr>
                                ) : (
                                    papercrafts.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Thumbnail */}
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                        {item.primary_image ? (
                                                            <img src={`/${item.primary_image.image_path}`} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.title}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">/{item.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600">
                                                    {item.category.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.is_published ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-50 text-yellow-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                {/* Tombol Lihat di Web (Public) */}
                                                <a href={`/papercraft/${item.slug}`} target="_blank" className="text-sm font-semibold text-gray-400 hover:text-indigo-600 transition">
                                                    View
                                                </a>
                                                
                                                {/* Tombol Edit (TODO) */}
                                                <Link href={`/admin/papercrafts/${item.id}/edit`} className="text-sm font-semibold text-gray-400 hover:text-blue-600 transition">
                                                    Edit
                                                </Link>
                                                
                                                {/* Tombol Hapus */}
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-sm font-semibold text-red-400 hover:text-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {papercrafts.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                            <span className="text-sm text-gray-500">
                                Menampilkan <span className="font-bold text-gray-900">{papercrafts.from || 0}</span> - <span className="font-bold text-gray-900">{papercrafts.to || 0}</span> dari total <span className="font-bold text-gray-900">{papercrafts.total}</span> data
                            </span>
                            <div className="flex gap-1">
                                {papercrafts.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        // dangerouslySetInnerHTML digunakan karena Laravel mengembalikan '&laquo;' dan '&raquo;' untuk panah
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                                            link.active 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                            : link.url 
                                                ? 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200' 
                                                : 'bg-transparent text-gray-400 cursor-not-allowed'
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