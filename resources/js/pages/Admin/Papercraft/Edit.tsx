import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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
    file_path: string | null;
    images: Image[];
}

interface Props {
    auth: { user: any };
    categories: Category[];
    papercraft: Papercraft;
    errors: any; // Mengambil semua error dari Inertia
}

export default function Edit({ auth, categories, papercraft, errors: serverErrors }: Props) {
    // State tambahan untuk notifikasi manual
    const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Inisialisasi state dengan data lama
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'PUT',
        title: papercraft.title,
        category_id: papercraft.category_id.toString(),
        description: papercraft.description,
        images: [] as File[],
        template_file: null as File | null,
    });

    const renderCategoryOptions = (cats: Category[], level = 0) => {
        let options: JSX.Element[] = [];

        cats.forEach((cat) => {
            const prefix = level > 0 ? '—'.repeat(level) + ' ' : '';
            options.push(
                <option key={cat.id} value={cat.id}>
                    {prefix}{cat.name}
                </option>
            );

            if (cat.all_children && cat.all_children.length > 0) {
                options = options.concat(renderCategoryOptions(cat.all_children, level + 1));
            }
        });

        return options;
    };

    // FUNGSI HAPUS GAMBAR GALERI DENGAN FEEDBACK
    const handleDeleteImage = (imageId: number) => {
        if (confirm('Yakin ingin menghapus gambar ini dari galeri? Tindakan ini tidak bisa dibatalkan.')) {
            router.delete(`/admin/papercraft-images/${imageId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setFlashMsg({ type: 'success', text: 'Gambar berhasil dihapus!' });
                    setTimeout(() => setFlashMsg(null), 3000);
                },
                onError: () => {
                    setFlashMsg({ type: 'error', text: 'Gagal menghapus gambar.' });
                }
            });
        }
    };

    // FUNGSI SUBMIT FORM DENGAN FEEDBACK
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();
        setFlashMsg(null);

        post(`/admin/papercrafts/${papercraft.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Notifikasi Sukses
                setFlashMsg({ type: 'success', text: 'Data papercraft berhasil diupdate!' });
                setData('images', []); // Kosongkan file input setelah sukses
                setTimeout(() => setFlashMsg(null), 3000);
            },
            onError: (err) => {
                // Notifikasi Gagal
                console.error("Validasi Error:", err);
                setFlashMsg({ type: 'error', text: 'Gagal menyimpan! Silakan cek pesan error berwarna merah pada form.' });
            }
        });
    };

    // Helper untuk mencari error dari array gambar (cth: images.0, images.1)
    const renderImageErrors = () => {
        const imageErrors = Object.keys(errors)
            .filter(key => key.startsWith('images.'))
            .map(key => errors[key]);

        if (imageErrors.length === 0 && !errors.images) return null;

        return (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <ul className="list-disc pl-4">
                    {errors.images && <li>{errors.images}</li>}
                    {imageErrors.map((msg, idx) => <li key={idx}>{msg}</li>)}
                </ul>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Edit Papercraft">
            <Head title={`Edit: ${papercraft.title}`} />

            <div className="max-w-4xl mx-auto pb-12">
                
                {/* 🌟 BANNER NOTIFIKASI SUKSES / ERROR 🌟 */}
                {flashMsg && (
                    <div className={`mb-6 p-4 rounded-xl border font-bold flex items-center gap-3 transition-all ${
                        flashMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {flashMsg.type === 'success' 
                            ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        }
                        {flashMsg.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={submit} className="p-8 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Papercraft</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 focus:bg-white transition-colors`}
                                />
                                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                <select
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.category_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 focus:bg-white transition-colors`}
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {renderCategoryOptions(categories)}
                                </select>
                                {errors.category_id && <p className="mt-2 text-sm text-red-600">{errors.category_id}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={5}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 focus:bg-white transition-colors`}
                            />
                            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Update File Template (PDF / ZIP)</label>
                            
                            {papercraft.file_path && (
                                <div className="mb-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-100/50 px-3 py-2 rounded-lg inline-flex">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Terdapat file tersimpan. Upload baru untuk menimpa file lama.
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.zip,.rar"
                                    onChange={e => setData('template_file', e.target.files ? e.target.files[0] : null)}
                                    className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors ${errors.template_file ? 'border-red-300' : ''}`}
                                />
                            </div>
                            {errors.template_file && <p className="mt-2 text-sm text-red-600">{errors.template_file}</p>}
                        </div>

                        {papercraft.images.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Saat Ini</label>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {papercraft.images.map((img) => (
                                        <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group">
                                            <img src={`/${img.image_path}`} alt="Gallery" className="w-full h-full object-cover" />
                                            
                                            {img.is_primary && (
                                                <div className="absolute top-0 inset-x-0 bg-indigo-600/90 text-white text-[10px] font-bold text-center py-0.5 backdrop-blur-sm z-10">
                                                    PRIMARY
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-transform shadow-lg"
                                                    title="Hapus Gambar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tambahkan Gambar Baru</label>
                            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors bg-gray-50 ${renderImageErrors() ? 'border-red-300 bg-red-50/30' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/50'}`}>
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                            <span>Pilih gambar</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={e => setData('images', Array.from(e.target.files || []))}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB.</p>
                                </div>
                            </div>
                            
                            {/* 🔥 INI YANG SEBELUMNYA HILANG: Render semua pesan error untuk multiple images */}
                            {renderImageErrors()}

                            {data.images.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {data.images.map((file, idx) => (
                                        <li key={idx} className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-2 rounded-lg flex items-center justify-between">
                                            <span>{idx + 1}. {file.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link href="/admin/papercrafts" className="text-gray-500 font-bold hover:text-gray-700">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Update Papercraft'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}