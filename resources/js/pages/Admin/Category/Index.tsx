import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    all_children?: Category[];
}

interface Props {
    auth: { user: any };
    categories: Category[];
}

export default function Index({ auth, categories }: Props) {
    const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // State untuk Collapsible Tree View (menyimpan ID kategori yang sedang "dibuka")
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    // State untuk Custom Select (Dropdown)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        parent_id: '',
    });

    const { delete: destroy } = useForm();
    const formRef = useRef<HTMLDivElement>(null);

    // Menutup custom dropdown kalau user klik di luar area dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setFlashMsg(null);
        
        post('/admin/categories', {
            preserveScroll: true,
            onSuccess: () => {
                reset('name');
                setFlashMsg({ type: 'success', text: 'Kategori berhasil ditambahkan!' });
                setTimeout(() => setFlashMsg(null), 3000);
                
                // Kalau dia nambahin sub-kategori, otomatis expand parent-nya biar kelihatan
                if (data.parent_id !== '') {
                    toggleNode(parseInt(data.parent_id), true);
                }
            },
            onError: () => setFlashMsg({ type: 'error', text: 'Gagal! Cek form isian di bawah.' })
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus kategori "${name}"?\nPERINGATAN: Semua sub-kategori dan papercraft di dalamnya juga akan terhapus!`)) {
            destroy(`/admin/categories/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setFlashMsg({ type: 'success', text: 'Kategori berhasil dihapus!' });
                    setTimeout(() => setFlashMsg(null), 3000);
                }
            });
        }
    };

    const handleQuickAddSub = (parentId: number) => {
        setData('parent_id', parentId.toString());
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleNode = (id: number, forceExpand = false) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (forceExpand) {
                newSet.add(id);
            } else {
                newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            }
            return newSet;
        });
    };

    // 🌟 HELPER: Mengubah Tree bersarang menjadi Array Datar untuk Custom Dropdown
    const flattenCategories = (cats: Category[], level = 0, result: any[] = []) => {
        cats.forEach(cat => {
            result.push({ id: cat.id, name: cat.name, level });
            if (cat.all_children && cat.all_children.length > 0) {
                flattenCategories(cat.all_children, level + 1, result);
            }
        });
        return result;
    };
    
    const flatCategories = flattenCategories(categories);
    
    // Filter dropdown berdasarkan input search
    const filteredCategories = flatCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    // Dapatkan nama kategori yang sedang dipilih untuk ditampilkan di form
    const selectedCategoryName = data.parent_id 
        ? flatCategories.find(c => c.id.toString() === data.parent_id)?.name 
        : '-- Tidak ada (Jadikan Kategori Utama) --';

    // 🌟 RENDER: Tree View yang bisa di-Collapse
    const renderCategoryTree = (cats: Category[], level = 0) => {
        return (
            <div className={`flex flex-col gap-2 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-indigo-100/50 mt-2' : ''}`}>
                {cats.map((cat) => {
                    const hasChildren = cat.all_children && cat.all_children.length > 0;
                    const isExpanded = expandedNodes.has(cat.id);

                    return (
                        <div key={cat.id}>
                            <div className="relative group">
                                {level > 0 && <div className="absolute -left-4 top-1/2 w-4 h-[2px] bg-indigo-100/50 -translate-y-1/2"></div>}

                                <div className={`flex items-center justify-between p-3 bg-white rounded-xl border transition-all relative z-10 ${
                                    data.parent_id === cat.id.toString() ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {/* Tombol Expand/Collapse */}
                                        <button 
                                            type="button"
                                            onClick={() => hasChildren && toggleNode(cat.id)}
                                            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                                                hasChildren ? 'hover:bg-gray-100 cursor-pointer text-gray-500' : 'opacity-0 cursor-default'
                                            }`}
                                        >
                                            {hasChildren && (
                                                <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            )}
                                        </button>

                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${level === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={level === 0 ? "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"} />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{cat.name}</div>
                                            {level === 0 && <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Kategori Utama</div>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleQuickAddSub(cat.id)} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-lg transition-colors">+ Sub</button>
                                        <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg transition-colors">Hapus</button>
                                    </div>
                                </div>
                            </div>

                            {/* Tampilkan anak-anaknya HANYA jika node ini di-expand */}
                            {hasChildren && isExpanded && renderCategoryTree(cat.all_children!, level + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Manajemen Kategori">
            <Head title="Kategori" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-12">
                
                {/* KOLOM KIRI: Form Tambah Kategori */}
                <div className="w-full lg:w-1/3" ref={formRef}>
                    
                    {/* Banner Notifikasi */}
                    {flashMsg && (
                        <div className={`mb-4 p-4 rounded-xl border font-bold flex items-center gap-3 transition-all ${
                            flashMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {flashMsg.text}
                        </div>
                    )}

                    <div className={`bg-white rounded-2xl shadow-sm border p-6 sticky top-24 transition-colors ${data.parent_id !== '' ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-gray-100'}`}>
                        <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            {data.parent_id !== '' ? 'Tambah Sub-Kategori' : 'Tambah Kategori Utama'}
                        </h3>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 focus:bg-white transition-colors`}
                                    placeholder="Contoh: Mecha"
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* 🌟 CUSTOM SELECT 🌟 */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Induk Kategori (Parent)</label>
                                
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${errors.parent_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} bg-gray-50 hover:bg-white transition-colors text-left`}
                                >
                                    <span className={data.parent_id === '' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                                        {selectedCategoryName}
                                    </span>
                                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                                        <div className="p-2 border-b border-gray-50">
                                            <input 
                                                type="text"
                                                placeholder="Cari kategori..."
                                                value={searchCategory}
                                                onChange={e => setSearchCategory(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border-none bg-gray-50 rounded-lg focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-1">
                                            <button
                                                type="button"
                                                onClick={() => { setData('parent_id', ''); setIsDropdownOpen(false); setSearchCategory(''); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium"
                                            >
                                                -- Tidak ada (Jadikan Kategori Utama) --
                                            </button>
                                            
                                            {filteredCategories.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-400 text-center">Kategori tidak ditemukan</div>
                                            ) : (
                                                filteredCategories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => { setData('parent_id', cat.id.toString()); setIsDropdownOpen(false); setSearchCategory(''); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2"
                                                    >
                                                        {cat.level > 0 && <span className="text-gray-300 font-mono">{'—'.repeat(cat.level)}</span>}
                                                        <span className={cat.level === 0 ? 'font-bold' : ''}>{cat.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {data.parent_id !== '' && (
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <div>
                                            <p className="text-xs text-indigo-700 font-medium">Kategori ini akan masuk sebagai *child* dari parent yang dipilih.</p>
                                            <button type="button" onClick={() => setData('parent_id', '')} className="mt-1 text-xs font-bold text-red-500 hover:text-red-700 hover:underline">
                                                Batal, jadikan Kategori Utama saja
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
                                {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* KOLOM KANAN: Visualisasi Tree Kategori */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[500px]">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                            <div>
                                <h2 className="font-bold text-xl text-gray-900">Struktur Kategori</h2>
                                <p className="text-sm text-gray-500 mt-1">Klik icon <strong className="bg-gray-100 px-1 rounded">►</strong> untuk membuka sub-kategori.</p>
                            </div>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                <p className="text-gray-500 font-medium">Belum ada kategori sama sekali.</p>
                            </div>
                        ) : (
                            <div className="pr-4">
                                {renderCategoryTree(categories)}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}