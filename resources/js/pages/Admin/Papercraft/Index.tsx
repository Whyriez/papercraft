import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

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

export default function Index({
    auth,
    papercrafts,
    categories,
    filters,
}: Props) {
    const { flash } = usePage<any>().props;
    const { delete: destroy } = useForm();

    // State untuk Filter
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || '');
    const [status, setStatus] = useState(filters?.status || '');

    // State untuk Popup Notifikasi & Modal
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
    }>({ isOpen: false, id: null });

    // Efek untuk memunculkan toast dari flash message backend
    const showToast = (
        message: string,
        type: 'success' | 'error' = 'success',
    ) => {
        setToast({ show: true, message, type });
        setTimeout(
            () => setToast({ show: false, message: '', type: 'success' }),
            4000,
        );
    };

    useEffect(() => {
        if (flash?.success) {
            const to1 = setTimeout(
                () => showToast(flash.success, 'success'),
                0,
            );

            return () => clearTimeout(to1);
        }

        if (flash?.error) {
            const to2 = setTimeout(() => showToast(flash.error, 'error'), 0);

            return () => clearTimeout(to2);
        }
    }, [flash]);

    // Efek Trigger Filtering (Debounce 300ms untuk mencegah query beruntun saat mengetik)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                '/admin/papercrafts',
                {
                    search: searchTerm,
                    category_id: categoryId,
                    status: status,
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, categoryId, status]);

    const confirmDelete = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const executeDelete = () => {
        if (!deleteModal.id) {
            return;
        }

        destroy(`/admin/papercrafts/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ isOpen: false, id: null });
            },
        });
    };

    // Fungsi Render Opsi Kategori untuk Filter (Mendukung Hierarki Tak Terbatas)
    const renderCategoryOptions = (cats: Category[], level = 0) => {
        let options: JSX.Element[] = [];
        cats.forEach((cat) => {
            const prefix = level > 0 ? '—'.repeat(level) + ' ' : '';
            options.push(
                <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-gray-900 font-semibold text-gray-200"
                >
                    {prefix}
                    {cat.name}
                </option>,
            );

            if (cat.all_children && cat.all_children.length > 0) {
                options = options.concat(
                    renderCategoryOptions(cat.all_children, level + 1),
                );
            }
        });

        return options;
    };

    // Fungsi Menggambar Breadcrumb Kategori pada Tabel (Misal: "Main Kategori — Sub Kategori")
    const renderCategoryBreadcrumb = (category: Category | undefined) => {
        if (!category) {
            return 'Tanpa Kategori';
        }

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
                <div className="relative z-10 flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <span className="truncate text-2xl font-black text-gray-100">
                        Manajemen Papercraft
                    </span>
                </div>
            }
        >
            <Head title="List Papercraft" />

            {/* 🌟 POPUP NOTIFICATION (TOAST) 🌟 */}
            <div
                className={`fixed top-8 right-8 z-[100] transform transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-10 opacity-0'}`}
            >
                <div
                    className={`flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-lg ${toast.type === 'success' ? 'border-green-800 bg-green-900/30 text-green-400' : 'border-red-800 bg-red-900/30 text-red-400'}`}
                >
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                        {toast.type === 'success' ? (
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-gray-100">
                            {toast.type === 'success'
                                ? 'Berhasil'
                                : 'Peringatan'}
                        </h4>
                        <p className="mt-0.5 text-xs font-semibold text-gray-400">
                            {toast.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* 🌟 MODAL KONFIRMASI HAPUS 🌟 */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm transition-opacity sm:p-6">
                    <div className="w-full max-w-md rounded-[34px] border border-gray-800 bg-gray-900 p-8 shadow-2xl">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-800/50 bg-red-900/30 text-red-500">
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-gray-100">
                            Hapus Papercraft?
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-gray-400">
                            Apakah kamu yakin ingin menghapus data papercraft
                            ini?
                            <span className="mt-2 block font-semibold text-gray-500">
                                Semua gambar yang terkait dengan papercraft ini
                                juga akan ikut terhapus permanen dan tidak dapat
                                dikembalikan.
                            </span>
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() =>
                                    setDeleteModal({ isOpen: false, id: null })
                                }
                                className="flex-1 rounded-full border border-gray-700 bg-gray-800 px-5 py-3.5 font-bold text-gray-300 shadow-sm transition-colors hover:bg-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 rounded-full bg-red-600 px-5 py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-red-500"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto mt-6 max-w-7xl pb-12">
                <div className="relative z-10 mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-gray-400">
                            Terdapat{' '}
                            <span className="font-bold text-white">
                                {papercrafts.total}
                            </span>{' '}
                            template papercraft di database.
                        </p>
                    </div>
                    <Link
                        href="/admin/papercrafts/create"
                        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gray-200 px-6 py-3 text-sm font-bold text-gray-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-white sm:w-auto"
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
                                strokeWidth={3}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Tambah Data
                    </Link>
                </div>

                {/* 🌟 FILTER BAR 🌟 */}
                <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-gray-800 bg-gray-900 p-5 shadow-md md:flex-row">
                    <div className="relative flex-1">
                        <svg
                            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul papercraft..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-800 py-3.5 pr-5 pl-11 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3.5 text-sm font-semibold text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                        >
                            <option value="" className="text-gray-400">
                                Semua Kategori
                            </option>
                            {renderCategoryOptions(categories)}
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3.5 text-sm font-semibold text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[34px] border border-gray-800 bg-gray-900 shadow-md">
                    {/* Tabel Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-gray-700 bg-gray-800">
                                    <th className="px-6 py-5 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase">
                                        Papercraft Info
                                    </th>
                                    <th className="px-6 py-5 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-5 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-right text-xs font-bold tracking-[0.15em] text-gray-400 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {papercrafts.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="inline-flex flex-col items-center">
                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-700 bg-gray-800 text-gray-500">
                                                    <svg
                                                        className="h-8 w-8"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-bold text-gray-300">
                                                    Pencarian tidak menemukan
                                                    hasil.
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Coba ubah kata kunci atau
                                                    filter kamu.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    papercrafts.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="group transition-colors hover:bg-gray-800/50"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-sm transition-transform group-hover:scale-105">
                                                        {item.primary_image ? (
                                                            /* 🌟 PERBAIKAN: Deteksi URL gambar agar tidak terjadi error path ganda 🌟 */
                                                            <img
                                                                src={
                                                                    item.primary_image.image_path.startsWith(
                                                                        'storage/',
                                                                    )
                                                                        ? `/${item.primary_image.image_path}`
                                                                        : `/storage/${item.primary_image.image_path}`
                                                                }
                                                                alt={item.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-600 opacity-50">
                                                                <svg
                                                                    className="h-6 w-6"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="max-w-[200px] truncate text-lg font-bold text-gray-200 md:max-w-md">
                                                            {item.title}
                                                        </div>
                                                        <div className="mt-1 inline-block max-w-[200px] truncate rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs font-semibold text-gray-400 md:max-w-md">
                                                            /{item.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-gray-300 shadow-sm">
                                                    {renderCategoryBreadcrumb(
                                                        item.category,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {item.is_published ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-800 bg-green-900/30 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-green-400 shadow-sm">
                                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-800 bg-red-900/30 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-red-400 shadow-sm">
                                                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-80 transition-opacity group-hover:opacity-100">
                                                    <a
                                                        href={`/papercraft/${item.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Lihat Halaman Publik"
                                                        className="rounded-xl bg-gray-800 p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-700 hover:text-white"
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
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </a>
                                                    <Link
                                                        href={`/admin/papercrafts/${item.id}/edit`}
                                                        title="Edit Papercraft"
                                                        className="rounded-xl bg-gray-800 p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-700 hover:text-white"
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
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            confirmDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        title="Hapus Papercraft"
                                                        className="rounded-xl bg-red-900/20 p-2 text-red-500 shadow-sm transition-all hover:bg-red-800 hover:text-white"
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
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
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
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 bg-gray-800 px-5 py-5 sm:px-8 md:flex-row">
                            <span className="text-center text-sm font-semibold text-gray-400 md:text-left">
                                Menampilkan{' '}
                                <span className="rounded-md border border-gray-600 bg-gray-700 px-2 py-0.5 font-bold text-gray-200">
                                    {papercrafts.from || 0}
                                </span>{' '}
                                -{' '}
                                <span className="rounded-md border border-gray-600 bg-gray-700 px-2 py-0.5 font-bold text-gray-200">
                                    {papercrafts.to || 0}
                                </span>{' '}
                                dari{' '}
                                <span className="font-bold text-white">
                                    {papercrafts.total}
                                </span>{' '}
                                data
                            </span>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {papercrafts.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className={`rounded-xl px-3 py-2 text-sm font-bold shadow-sm transition-all ${
                                            link.active
                                                ? 'bg-gray-500 text-white shadow-md ring-2 ring-gray-500 ring-offset-2 ring-offset-gray-800'
                                                : link.url
                                                  ? 'border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                  : 'cursor-not-allowed border border-gray-800 bg-gray-900/50 text-gray-600'
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
