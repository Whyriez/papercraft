import { Head, Link, useForm, router } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Tipe Data
interface Category {
    id: number;
    name: string;
    all_children?: Category[];
}

interface Image {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Papercraft {
    id: number;
    title: string;
    category_id: number;
    description: string;
    is_published: boolean; // <--- Pastikan tipe data ini ada
    file_path: string | null;
    images: Image[];
}

interface Props {
    auth: { user: any };
    categories: Category[];
    papercraft: Papercraft;
    errors: any;
}

export default function Edit({
    auth,
    categories,
    papercraft,
    errors: _serverErrors,
}: Props) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'PUT',
        title: papercraft.title,
        category_id: papercraft.category_id.toString(),
        description: papercraft.description,
        is_published: Boolean(papercraft.is_published), // 🌟 Ambil status aktif
        images: [] as File[],
        template_file: null as File | null,
    });

    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });

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

    const handleDeleteImage = (imageId: number) => {
        if (
            confirm(
                'Yakin ingin menghapus gambar ini dari galeri? Tindakan ini tidak bisa dibatalkan.',
            )
        ) {
            router.delete(`/admin/papercraft-images/${imageId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    showToast('Gambar berhasil dihapus!', 'success');
                },
                onError: () => {
                    showToast('Gagal menghapus gambar.', 'error');
                },
            });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();

        post(`/admin/papercrafts/${papercraft.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                showToast('Data papercraft berhasil diupdate!', 'success');
                setData('images', []);
            },
            onError: (err) => {
                console.error('Validasi Error:', err);
                showToast(
                    'Gagal menyimpan! Periksa form isian berwarna merah.',
                    'error',
                );
            },
        });
    };

    const renderImageErrors = () => {
        const imageErrors = Object.keys(errors)
            .filter((key) => key.startsWith('images.'))
            .map((key) => errors[key as keyof typeof errors]);

        if (imageErrors.length === 0 && !errors.images) {
            return null;
        }

        return (
            <div className="mt-4 rounded-xl border border-red-800/50 bg-red-900/30 p-4 text-xs font-bold text-red-400 shadow-sm">
                <ul className="list-disc space-y-1 pl-5">
                    {errors.images && <li>{errors.images}</li>}
                    {imageErrors.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="relative z-10 flex items-center gap-4">
                    <Link
                        href="/admin/papercrafts"
                        className="-ml-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </Link>
                    <span className="truncate text-2xl font-black text-gray-100">
                        Edit: {papercraft.title}
                    </span>
                </div>
            }
        >
            <Head title={`Edit: ${papercraft.title}`} />

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
                        ) : (
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

            <div className="mx-auto mt-6 max-w-4xl pb-12">
                <div className="relative overflow-hidden rounded-[34px] border border-gray-800 bg-gray-900 shadow-lg">
                    <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-gray-800 opacity-30 blur-3xl"></div>

                    <form
                        onSubmit={submit}
                        className="relative z-10 space-y-8 p-8 sm:p-10"
                    >
                        <div className="border-b border-gray-800 pb-6">
                            <h2 className="mb-2 text-2xl font-black text-gray-100">
                                Informasi Dasar
                            </h2>
                            <p className="text-sm font-semibold text-gray-400">
                                Ubah detail papercraft.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div>
                                <label className="mb-3 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Judul Papercraft
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className={`w-full rounded-2xl border bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-200 shadow-inner transition-all placeholder:text-gray-500 focus:ring-2 focus:outline-none ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'}`}
                                />
                                {errors.title && (
                                    <p className="mt-2 text-xs font-bold text-red-400">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-3 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Kategori
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData('category_id', e.target.value)
                                    }
                                    className={`w-full rounded-2xl border bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-200 shadow-inner transition-all focus:ring-2 focus:outline-none ${errors.category_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'}`}
                                >
                                    <option value="" className="text-gray-500">
                                        -- Pilih Kategori --
                                    </option>
                                    {renderCategoryOptions(categories)}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-2 text-xs font-bold text-red-400">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>

                            {/* 🌟 TAMBAHKAN STATUS PUBLIKASI 🌟 */}
                            <div className="md:col-span-2">
                                <label className="mb-3 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Status Publikasi
                                </label>
                                <div className="flex gap-4 rounded-2xl border border-gray-700 bg-gray-800 p-2 shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('is_published', true)
                                        }
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${data.is_published ? 'bg-gray-200 text-gray-900 shadow-md ring-2 ring-gray-400 ring-offset-2 ring-offset-gray-800' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
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
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Publish (Publik)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('is_published', false)
                                        }
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${!data.is_published ? 'bg-gray-600 text-white shadow-md ring-2 ring-gray-500 ring-offset-2 ring-offset-gray-800' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
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
                                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                            />
                                        </svg>
                                        Simpan Draft
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-3 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                Deskripsi Lengkap
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={6}
                                className={`w-full resize-y rounded-2xl border bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-200 shadow-inner transition-all placeholder:text-gray-500 focus:ring-2 focus:outline-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'}`}
                            />
                            {errors.description && (
                                <p className="mt-2 text-xs font-bold text-red-400">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="border-b border-gray-800 pt-6 pb-6">
                            <h2 className="mb-2 text-2xl font-black text-gray-100">
                                File & Media
                            </h2>
                            <p className="text-sm font-semibold text-gray-400">
                                Kelola template PDF dan foto galeri.
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-800/50 p-6 shadow-inner sm:p-8">
                            <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-gray-800 opacity-50 blur-xl"></div>

                            <label className="relative z-10 mb-4 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                Update File Template (PDF / ZIP)
                            </label>

                            {papercraft.file_path && (
                                <div className="relative z-10 mb-5 flex items-start gap-3 rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-bold text-gray-300 shadow-sm sm:items-center">
                                    <div className="flex-shrink-0 rounded-xl bg-gray-700 p-2 text-gray-300 shadow-sm">
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
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    Terdapat file tersimpan. Upload baru untuk
                                    menimpa file lama.
                                </div>
                            )}

                            <div className="relative z-10 rounded-2xl border border-gray-700 bg-gray-900 p-2 shadow-sm">
                                <input
                                    type="file"
                                    accept=".pdf,.zip,.rar"
                                    onChange={(e) =>
                                        setData(
                                            'template_file',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                    className={`block w-full cursor-pointer text-sm font-semibold text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-200 file:px-6 file:py-3 file:text-sm file:font-bold file:text-gray-900 file:shadow-sm file:transition-all hover:file:-translate-y-0.5 hover:file:bg-white ${errors.template_file ? 'text-red-500' : ''}`}
                                />
                            </div>
                            {errors.template_file && (
                                <p className="relative z-10 mt-3 text-xs font-bold text-red-400">
                                    {errors.template_file}
                                </p>
                            )}
                        </div>

                        {papercraft.images.length > 0 && (
                            <div>
                                <label className="mb-4 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Gambar Saat Ini
                                </label>
                                <div className="-mx-1 flex snap-x scrollbar-thin scrollbar-thumb-gray-700 gap-4 overflow-x-auto px-1 pt-1 pb-4">
                                    {papercraft.images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="group relative h-32 w-32 flex-shrink-0 snap-center overflow-hidden rounded-2xl border-2 border-gray-700 bg-gray-900 shadow-md"
                                        >
                                            <img
                                                src={`/${img.image_path}`}
                                                alt="Gallery"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />

                                            {img.is_primary && (
                                                <div className="absolute inset-x-0 top-0 z-10 bg-gray-700/90 py-1 text-center text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
                                                    PRIMARY
                                                </div>
                                            )}

                                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteImage(
                                                            img.id,
                                                        )
                                                    }
                                                    className="transform rounded-full bg-red-600 p-3 text-white shadow-lg transition-all hover:-translate-y-1 hover:scale-110 hover:bg-red-500"
                                                    title="Hapus Gambar"
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-4 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                Tambahkan Gambar Baru
                            </label>

                            <div
                                className={`mt-1 flex justify-center rounded-3xl border-2 border-dashed bg-gray-900/50 px-6 py-10 transition-all ${renderImageErrors() ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'}`}
                            >
                                <div className="space-y-3 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-400 shadow-sm">
                                        <svg
                                            className="h-8 w-8"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-xl bg-gray-200 px-4 py-2 font-bold text-gray-900 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-gray-300 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:outline-none hover:bg-white"
                                        >
                                            <span>Pilih Gambar</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) =>
                                                    setData(
                                                        'images',
                                                        Array.from(
                                                            e.target.files ||
                                                                [],
                                                        ),
                                                    )
                                                }
                                            />
                                        </label>
                                        <p className="font-medium text-gray-500">
                                            atau drag and drop
                                        </p>
                                    </div>
                                    <p className="mt-2 text-xs font-bold text-gray-500">
                                        PNG, JPG, JPEG up to 2MB.
                                    </p>
                                </div>
                            </div>

                            {renderImageErrors()}

                            {data.images.length > 0 && (
                                <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-inner">
                                    <h4 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                        File Terpilih (Baru):
                                    </h4>
                                    <ul className="space-y-2">
                                        {data.images.map((file, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-bold text-gray-200 shadow-sm"
                                            >
                                                <span className="flex-1 truncate">
                                                    {idx + 1}. {file.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex flex-col-reverse items-center justify-end gap-4 border-t border-gray-800 pt-8 sm:flex-row">
                            <Link
                                href="/admin/papercrafts"
                                className="w-full rounded-full px-6 py-4 text-center font-bold text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 sm:w-auto"
                            >
                                Batal
                            </Link>

                            {/* 🌟 TOMBOL SUBMIT DINAMIS MENGKUTI STATUS 🌟 */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-gray-900 shadow-md transition-all hover:-translate-y-0.5 focus:ring-4 focus:outline-none disabled:opacity-50 sm:w-auto sm:text-base ${data.is_published ? 'bg-gray-200 hover:bg-white focus:ring-gray-300/30' : 'bg-gray-400 hover:bg-gray-300 focus:ring-gray-500/30'}`}
                            >
                                {processing ? (
                                    'Menyimpan...'
                                ) : data.is_published ? (
                                    <>
                                        Update & Publish{' '}
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
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        Update & Simpan Draft{' '}
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
                                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
