import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

// Tipe Data
interface Category {
    id: number;
    name: string;
    all_children?: Category[]; // <--- PERBAIKAN 1: Tambahkan all_children
}

interface Props {
    auth: { user: any };
    categories: Category[];
}

export default function Create({ auth, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        description: '',
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

            // <--- PERBAIKAN 2: Ubah cat.children menjadi cat.all_children
            if (cat.all_children && cat.all_children.length > 0) {
                options = options.concat(renderCategoryOptions(cat.all_children, level + 1));
            }
        });

        return options;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // <--- PERBAIKAN 3: Paksa jadi FormData agar file tidak hilang
        post('/admin/papercrafts', {
            forceFormData: true, 
            preserveScroll: true,
            onError: (err) => console.log("Validasi Gagal:", err), // Muncul di console inspect elemen kalau gagal
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Tambah Papercraft Baru">
            <Head title="Tambah Papercraft" />

            <div className="max-w-4xl mx-auto pb-12">
                <div className="relative overflow-hidden rounded-[34px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_20px_45px_rgba(82,59,40,0.06)]">
                    
                    {/* Header Dekorasi */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f4e7d4] rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

                    <form onSubmit={submit} className="p-8 sm:p-10 space-y-8 relative z-10">
                        <div className="pb-6 border-b border-[#eadfce]">
                            <h2 className="font-black text-2xl text-[#2f2f2f] mb-2">Informasi Dasar</h2>
                            <p className="text-[#a97b5b] font-semibold text-sm">Isi detail papercraft yang akan ditambahkan.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Input Judul */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-3">Judul Papercraft</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className={`w-full px-5 py-4 rounded-2xl border bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] placeholder:text-[#bcae9f] shadow-[0_8px_16px_rgba(82,59,40,0.04)] focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20' : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'}`}
                                    placeholder="Contoh: Iron Man Helmet"
                                />
                                {errors.title && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.title}</p>}
                            </div>

                            {/* Dropdown Kategori */}
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

                        {/* Input Deskripsi */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-3">Deskripsi Lengkap</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={6}
                                className={`w-full px-5 py-4 rounded-2xl border bg-[#fcfaf6] text-sm font-semibold text-[#2f2f2f] placeholder:text-[#bcae9f] shadow-[0_8px_16px_rgba(82,59,40,0.04)] focus:outline-none focus:ring-2 transition-all resize-y ${errors.description ? 'border-[#e07a5f] focus:border-[#e07a5f] focus:ring-[#e07a5f]/20' : 'border-[#eadfce] focus:border-[#c97758] focus:ring-[#c97758]/20'}`}
                                placeholder="Jelaskan detail dan instruksi singkat dari papercraft ini..."
                            />
                            {errors.description && <p className="mt-2 text-xs font-bold text-[#e07a5f]">{errors.description}</p>}
                        </div>

                        <div className="pb-6 pt-6 border-b border-[#eadfce]">
                            <h2 className="font-black text-2xl text-[#2f2f2f] mb-2">File & Media</h2>
                            <p className="text-[#a97b5b] font-semibold text-sm">Upload file template dan gambar galeri produk.</p>
                        </div>

                        {/* Upload File Template (PDF/ZIP) */}
                        <div className="bg-[#f4e7d4] p-6 sm:p-8 rounded-3xl border border-[#eadfce] shadow-inner relative overflow-hidden">
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#e9d3bf] rounded-full blur-xl opacity-60 pointer-events-none"></div>
                            
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#67574b] mb-4 relative z-10">File Template (PDF / ZIP)</label>
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
                                    ${errors.template_file ? 'text-red-500' : ''}
                                    `}
                                />
                            </div>
                            <p className="mt-3 text-xs font-bold text-[#a97b5b] relative z-10 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Opsional. File pola untuk dirakit (maks. 20MB).
                            </p>
                            {errors.template_file && <p className="mt-2 text-xs font-bold text-[#e07a5f] relative z-10">{errors.template_file}</p>}
                        </div>

                        {/* Upload Multiple Images */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#a97b5b] mb-4">Galeri Gambar (Multiple)</label>
                            
                            <div className={`mt-1 flex justify-center px-6 py-10 border-2 border-dashed rounded-3xl transition-all bg-[#fcfaf6] ${errors.images ? 'border-[#e07a5f] bg-[#fff0ed]/50' : 'border-[#eadfce] hover:border-[#c97758] hover:bg-[#f4e7d4]'}`}>
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
                                        <p className="font-medium text-[#a97b5b]">atau drag and drop kesini</p>
                                    </div>
                                    <p className="text-xs font-bold text-[#a97b5b] mt-2">PNG, JPG, JPEG up to 2MB. (Gambar pertama akan jadi thumbnail)</p>
                                </div>
                            </div>
                            {errors.images && <p className="mt-3 text-xs font-bold text-[#e07a5f] bg-[#fff0ed] p-3 rounded-xl border border-[#fbdfd7]">{errors.images}</p>}

                            {/* Preview File yang dipilih */}
                            {data.images.length > 0 && (
                                <div className="mt-6 bg-[#f4e7d4] p-4 rounded-2xl border border-[#eadfce]">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#a97b5b] mb-3">File Terpilih:</h4>
                                    <ul className="space-y-2">
                                        {data.images.map((file, idx) => (
                                            <li key={idx} className="text-sm text-[#2f2f2f] font-bold bg-[#fcfaf6] px-4 py-3 rounded-xl border border-[#eadfce] flex items-center justify-between shadow-sm">
                                                <span className="truncate flex-1 mr-4">{idx + 1}. {file.name}</span>
                                                {idx === 0 && <span className="text-xs font-black bg-[#a9c7a3] text-white px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">Primary Thumbnail</span>}
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
                                {processing ? 'Menyimpan...' : 'Simpan Papercraft'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}