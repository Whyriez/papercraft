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
                <option key={cat.id} value={cat.id}>
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

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={submit} className="p-8 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Input Judul */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Papercraft</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 focus:bg-white transition-colors`}
                                    placeholder="Contoh: Iron Man Helmet"
                                />
                                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            {/* Dropdown Kategori */}
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

                        {/* Input Deskripsi */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={5}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 focus:bg-white transition-colors`}
                                placeholder="Jelaskan detail dari papercraft ini..."
                            />
                            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        {/* Upload File Template (PDF/ZIP) */}
                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <label className="block text-sm font-bold text-gray-700 mb-2">File Template (PDF / ZIP)</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.zip,.rar"
                                    onChange={e => setData('template_file', e.target.files ? e.target.files[0] : null)}
                                    className={`block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2.5 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100 transition-colors
                                    ${errors.template_file ? 'border-red-300' : ''}
                                    `}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Opsional. File pola untuk dirakit (maks. 20MB).</p>
                            {errors.template_file && <p className="mt-2 text-sm text-red-600">{errors.template_file}</p>}
                        </div>

                        {/* Upload Multiple Images */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Galeri Gambar (Multiple)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-gray-50 hover:bg-indigo-50/50">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload file</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={e => setData('images', Array.from(e.target.files || []))}
                                            />
                                        </label>
                                        <p className="pl-1">atau drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB. (Gambar pertama akan jadi thumbnail)</p>
                                </div>
                            </div>
                            {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}

                            {/* Preview File yang dipilih */}
                            {data.images.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {data.images.map((file, idx) => (
                                        <li key={idx} className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-2 rounded-lg flex items-center justify-between">
                                            <span>{idx + 1}. {file.name}</span>
                                            {idx === 0 && <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-md">Primary Thumbnail</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link href="/admin/papercrafts" className="text-gray-500 font-bold hover:text-gray-700">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
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