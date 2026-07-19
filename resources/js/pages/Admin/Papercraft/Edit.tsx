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
            <div className="mt-4 text-xs font-bold text-[#e07a5f] bg-[#fff0ed] p-4 rounded-xl border border-[#fbdfd7] shadow-sm">
                <ul className="list-disc pl-5 space-y-1">
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
                    <div className={`mb-8 p-5 rounded-2xl border font-bold flex items-center gap-3 transition-all shadow-sm ${
                        flashMsg.type === 'success' ? 'bg-[#f1f6f0] text-[#4a6b43] border-[#cde0ca]' : 'bg-[#fff0ed] text-[#b94a2e] border-[#fbdfd7]'
                    }`}>
                        {flashMsg.type === 'success' 
                            ? <div className="w-8 h-8 rounded-full bg-[#a9c7a3] flex items-center justify-center text-white shadow-sm flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                            : <div className="w-8 h-8 rounded-full bg-[#e07a5f] flex items-center justify-center text-white shadow-sm flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                        }
                        <span>{flashMsg.text}</span>
                    </div>
                )}

                <div className="relative overflow-hidden rounded-[34px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_20px_45px_rgba(82,59,40,0.06)]">
                    
                    {/* Header Dekorasi */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f4e7d4] rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

                    <form onSubmit={submit} className="p-8 sm:p-10 space-y-8 relative z-10">

                        <div className="pb-6 border-b border-[#eadfce]">
                            <h2 className="font-black text-2xl text-[#2f2f2f] mb-2">Informasi Dasar</h2>
                            <p className="text-[#a97b5b] font-semibold text-sm">Ubah detail papercraft.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-3">Judul Papercraft</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className={`w-full px-5 py-4 rounded-2xl border bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] placeholder:text-[#bcae9f] shadow-[0_8px_16px_rgba(82,59,40,0.04)] focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20' : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'}`}
                                />
                                {errors.title && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-3">Kategori</label>
                                <select
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className={`w-full px-5 py-4 rounded-2xl border bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] shadow-[0_8px_16px_rgba(82,59,40,0.04)] focus:outline-none focus:ring-2 transition-all ${errors.category_id ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20' : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'}`}
                                >
                                    <option value="" className="text-[#bcae9f]">-- Pilih Kategori --</option>
                                    {renderCategoryOptions(categories)}
                                </select>
                                {errors.category_id && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.category_id}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-3">Deskripsi Lengkap</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={6}
                                className={`w-full px-5 py-4 rounded-2xl border bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] placeholder:text-[#bcae9f] shadow-[0_8px_16px_rgba(82,59,40,0.04)] focus:outline-none focus:ring-2 transition-all resize-y ${errors.description ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20' : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'}`}
                            />
                            {errors.description && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.description}</p>}
                        </div>

                        <div className="pb-6 pt-6 border-b border-[#eadfce]">
                            <h2 className="font-black text-2xl text-[#2f2f2f] mb-2">File & Media</h2>
                            <p className="text-[#a97b5b] font-semibold text-sm">Kelola template PDF dan foto galeri.</p>
                        </div>

                        <div className="bg-[#f4e7d4] p-6 sm:p-8 rounded-3xl border border-[#eadfce] shadow-inner relative overflow-hidden">
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#e9d3bf] rounded-full blur-xl opacity-60 pointer-events-none"></div>

                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#67574b] mb-4 relative z-10">Update File Template (PDF / ZIP)</label>
                            
                            {papercraft.file_path && (
                                <div className="mb-5 flex items-start sm:items-center gap-3 text-sm font-bold text-[#8c6b4e] bg-[#fcfaf6] border border-[#eadfce] px-4 py-3 rounded-2xl shadow-sm relative z-10">
                                    <div className="bg-[#e6b95b] text-white p-2 rounded-xl flex-shrink-0 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                                    Terdapat file tersimpan. Upload baru untuk menimpa file lama.
                                </div>
                            )}

                            <div className="relative z-10 bg-[#fcfaf6] rounded-2xl p-2 border border-[#eadfce] shadow-sm">
                                <input
                                    type="file"
                                    accept=".pdf,.zip,.rar"
                                    onChange={e => setData('template_file', e.target.files ? e.target.files[0] : null)}
                                    className={`block w-full text-sm text-[#67574b] font-semibold
                                    file:mr-4 file:py-3 file:px-6
                                    file:rounded-xl file:border-0
                                    file:text-sm file:font-bold
                                    file:bg-[#e6b95b] file:text-white file:shadow-[0_4px_12px_rgba(230,185,91,0.3)]
                                    hover:file:bg-[#d4aa53] hover:file:-translate-y-0.5 file:transition-all cursor-pointer
                                    ${errors.template_file ? 'text-red-500' : ''}`}
                                />
                            </div>
                            {errors.template_file && <p className="mt-3 text-xs font-bold text-[#e07a5f] relative z-10">{errors.template_file}</p>}
                        </div>

                        {papercraft.images.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-4">Gambar Saat Ini</label>
                                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x">
                                    {papercraft.images.map((img) => (
                                        <div key={img.id} className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#eadfce] flex-shrink-0 group shadow-[0_8px_16px_rgba(82,59,40,0.06)] snap-center bg-white">
                                            <img src={`/${img.image_path}`} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            
                                            {img.is_primary && (
                                                <div className="absolute top-0 inset-x-0 bg-[#a9c7a3]/90 text-white text-[10px] uppercase tracking-widest font-black text-center py-1 backdrop-blur-md z-10">
                                                    PRIMARY
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-[#2f2f2f]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="bg-[#e07a5f] hover:bg-[#b94a2e] text-white p-3 rounded-full transform hover:scale-110 hover:-translate-y-1 transition-all shadow-[0_8px_16px_rgba(224,122,95,0.4)]"
                                                    title="Hapus Gambar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-4">Tambahkan Gambar Baru</label>
                            
                            <div className={`mt-1 flex justify-center px-6 py-10 border-2 border-dashed rounded-3xl transition-all bg-[#fcfaf6] ${renderImageErrors() ? 'border-[#e07a5f] bg-[#fff0ed]/50' : 'border-[#eadfce] hover:border-[#c97758] hover:bg-[#f4e7d4]'}`}>
                                <div className="space-y-3 text-center">
                                    <div className="mx-auto w-16 h-16 bg-[#f4e7d4] rounded-full flex items-center justify-center text-[#c97758] shadow-sm mb-4">
                                        <svg className="h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="flex text-sm text-[#67574b] justify-center items-center gap-2">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-[#c97758] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#b96449] transition-colors shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#c97758]">
                                            <span>Pilih Gambar</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={e => setData('images', Array.from(e.target.files || []))}
                                            />
                                        </label>
                                        <p className="font-medium text-[#a97b5b]">atau drag and drop</p>
                                    </div>
                                    <p className="text-xs font-bold text-[#a97b5b] mt-2">PNG, JPG, JPEG up to 2MB.</p>
                                </div>
                            </div>
                            
                            {/* 🔥 Render semua pesan error untuk multiple images */}
                            {renderImageErrors()}

                            {data.images.length > 0 && (
                                <div className="mt-6 bg-[#f4e7d4] p-4 rounded-2xl border border-[#eadfce]">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#a97b5b] mb-3">File Terpilih (Baru):</h4>
                                    <ul className="space-y-2">
                                        {data.images.map((file, idx) => (
                                            <li key={idx} className="text-sm text-[#2f2f2f] font-bold bg-[#fcfaf6] px-4 py-3 rounded-xl border border-[#eadfce] flex items-center justify-between shadow-sm">
                                                <span className="truncate flex-1">{idx + 1}. {file.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-8 mt-8 border-t border-[#eadfce]">
                            <Link href="/admin/papercrafts" className="w-full sm:w-auto px-6 py-4 text-[#a97b5b] font-bold hover:text-[#c97758] hover:bg-[#f4e7d4] rounded-full transition-colors text-center">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto bg-[#c97758] text-white px-8 py-4 rounded-full font-bold hover:bg-[#b96449] hover:-translate-y-0.5 transition-all shadow-[0_12px_24px_rgba(201,119,88,0.22)] focus:outline-none focus:ring-4 focus:ring-[#c97758]/30 disabled:opacity-50 text-lg sm:text-base flex justify-center"
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