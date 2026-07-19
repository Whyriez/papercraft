import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler} from 'react';
import { useRef, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    image_path?: string;
    all_children?: Category[];
}

interface Props {
    auth: { user: any };
    categories: Category[];
}

export default function Index({ auth, categories }: Props) {
    const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, category: Category | null, subCount: number }>({
        isOpen: false, category: null, subCount: 0
    });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        parent_id: '',
        image: null as File | null,
        _method: 'post',
    });

    const { delete: destroy } = useForm();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('image', null);
            setImagePreview(editingCategory?.image_path ? `/storage/${editingCategory.image_path}` : null);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setFlashMsg(null);

        const url = editingCategory ? `/admin/categories/${editingCategory.id}` : '/admin/categories';

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                cancelEdit();
                setFlashMsg({ type: 'success', text: editingCategory ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!' });
                setTimeout(() => setFlashMsg(null), 3000);

                if (data.parent_id !== '') {
                    toggleNode(parseInt(data.parent_id), true);
                }
            },
            onError: () => setFlashMsg({ type: 'error', text: 'Gagal! Cek form isian di bawah.' })
        });
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setData({
            name: cat.name,
            parent_id: cat.parent_id ? cat.parent_id.toString() : '',
            image: null,
            _method: 'put',
        });
        setImagePreview(cat.image_path ? `/storage/${cat.image_path}` : null);
        clearErrors();

        if (formRef.current) {
formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        reset();
        setData({ name: '', parent_id: '', image: null, _method: 'post' });
        setImagePreview(null);
        clearErrors();

        if (fileInputRef.current) {
fileInputRef.current.value = '';
}
    };

    const confirmDelete = (cat: Category) => {
        let subCount = 0;
        const countChildren = (c: Category) => {
            if (c.all_children) {
                subCount += c.all_children.length;
                c.all_children.forEach(countChildren);
            }
        };
        countChildren(cat);

        setDeleteModal({ isOpen: true, category: cat, subCount });
    };

    const executeDelete = () => {
        if (!deleteModal.category) {
return;
}

        destroy(`/admin/categories/${deleteModal.category.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ isOpen: false, category: null, subCount: 0 });
                setFlashMsg({ type: 'success', text: 'Kategori berhasil dihapus!' });
                setTimeout(() => setFlashMsg(null), 3000);
            }
        });
    };

    const handleQuickAddSub = (parentId: number) => {
        cancelEdit();
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
if (newSet.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }
}

            return newSet;
        });
    };

    const flattenCategories = (cats: Category[], level = 0, result: any[] = []) => {
        cats.forEach(cat => {
            result.push({ id: cat.id, name: cat.name, level, image_path: cat.image_path });

            if (cat.all_children && cat.all_children.length > 0) {
                flattenCategories(cat.all_children, level + 1, result);
            }
        });

        return result;
    };

    const flatCategories = flattenCategories(categories);

    const selectableCategories = flatCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchCategory.toLowerCase()) &&
        (!editingCategory || cat.id !== editingCategory.id)
    );

    const selectedCategory = data.parent_id
        ? flatCategories.find(c => c.id.toString() === data.parent_id)
        : null;

    const renderCategoryTree = (cats: Category[], level = 0) => {
        return (
            <div className={`flex flex-col gap-3 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-gray-700 mt-3' : ''}`}>
                {cats.map((cat) => {
                    const hasChildren = cat.all_children && cat.all_children.length > 0;
                    const isExpanded = expandedNodes.has(cat.id);
                    const isBeingEdited = editingCategory?.id === cat.id;

                    return (
                        <div key={cat.id}>
                            <div className="relative group">
                                {level > 0 && <div className="absolute -left-4 top-1/2 w-4 h-[2px] bg-gray-700 -translate-y-1/2"></div>}

                                <div className={`flex items-center justify-between p-4 bg-gray-800 rounded-2xl border transition-all relative z-10 ${isBeingEdited ? 'border-gray-400 shadow-md ring-1 ring-gray-400'
                                    : data.parent_id === cat.id.toString() ? 'border-gray-500 shadow-md ring-1 ring-gray-500'
                                        : 'border-gray-700 hover:border-gray-500 hover:shadow-lg'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => hasChildren && toggleNode(cat.id)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${hasChildren ? 'hover:bg-gray-700 cursor-pointer text-gray-400 hover:text-white' : 'opacity-0 cursor-default'}`}
                                        >
                                            {hasChildren && (
                                                <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                            )}
                                        </button>

                                        <div className={`flex flex-shrink-0 items-center justify-center w-11 h-11 rounded-xl overflow-hidden shadow-sm border ${level === 0 ? 'bg-gray-700 text-gray-200 border-transparent' : 'bg-gray-900 text-gray-500 border-gray-700'}`}>
                                            {cat.image_path ? (
                                                <img src={`/storage/${cat.image_path}`} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={level === 0 ? "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"} />
                                                </svg>
                                            )}
                                        </div>

                                        <div>
                                            <div className="font-black text-gray-200 text-sm">{cat.name}</div>
                                            {level === 0 && <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Kategori Utama</div>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(cat)} className="text-xs font-bold text-gray-200 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-xl transition-all shadow-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleQuickAddSub(cat.id)} className="text-xs font-bold text-gray-200 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-xl transition-all shadow-sm">
                                            + Sub
                                        </button>
                                        <button onClick={() => confirmDelete(cat)} className="text-xs font-bold text-red-500 bg-red-900/40 hover:bg-red-800 hover:text-white px-3 py-2 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-700">
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>

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

            {deleteModal.isOpen && deleteModal.category && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-950/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-gray-900 rounded-[34px] p-8 max-w-lg w-full shadow-2xl border border-gray-800">
                        <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-800/50">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-100 mb-3">Hapus Kategori?</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Anda akan menghapus kategori <strong className="text-gray-200">{deleteModal.category.name}</strong>.

                            {deleteModal.subCount > 0 && (
                                <span className="block mt-3 px-4 py-3 bg-red-900/30 rounded-xl text-red-400 font-bold border border-red-800/50">
                                    ⚠️ Terdapat {deleteModal.subCount} Sub-Kategori di dalamnya yang akan ikut terhapus permanen!
                                </span>
                            )}

                            <span className="block mt-3 font-semibold text-gray-500">
                                Seluruh template papercraft yang ada di dalam kategori ini juga akan terhapus. Silahkan ubah (reassign) template ke kategori lain terlebih dahulu jika tidak ingin data hilang.
                            </span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => setDeleteModal({ isOpen: false, category: null, subCount: 0 })} className="flex-1 px-5 py-3.5 rounded-full border border-gray-700 font-bold text-gray-300 bg-gray-800 shadow-sm hover:bg-gray-700 transition-colors">
                                Batal
                            </button>
                            <button onClick={executeDelete} className="flex-1 px-5 py-3.5 rounded-full bg-red-600 font-bold text-white hover:bg-red-500 hover:-translate-y-0.5 transition-all">
                                Ya, Hapus Permanen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto flex max-w-7xl flex-col gap-10 pb-12 lg:flex-row">

                {/* KOLOM KIRI: Form Kategori (PENTING: relative z-30 ditambahkan) */}
                <div className="w-full lg:w-1/3 relative z-30" ref={formRef}>

                    {flashMsg && (
                        <div className={`mb-6 p-5 rounded-2xl border font-bold flex items-center gap-3 transition-all shadow-sm ${flashMsg.type === 'success' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                            {flashMsg.text}
                        </div>
                    )}

                    {/* PENTING: overflow-hidden dihapus dari sini */}
                    <div className={`relative rounded-[30px] border border-gray-800 p-6 shadow-lg sm:p-8 sticky top-28 transition-colors ${editingCategory ? 'bg-gray-800 ring-4 ring-gray-600/30' : data.parent_id !== '' ? 'bg-gray-800 ring-4 ring-gray-700' : 'bg-gray-900'}`}>

                        {/* Background Dekorasi Blur dipisah ke kontainer baru agar overflow-hidden tidak mempengaruhi form */}
                        <div className="absolute inset-0 overflow-hidden rounded-[30px] pointer-events-none z-0">
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-800 rounded-full blur-2xl opacity-60"></div>
                        </div>

                        <h3 className="relative z-10 font-black text-xl text-gray-100 mb-8 flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-gray-900 shadow-md ${editingCategory ? 'bg-gray-300' : 'bg-gray-200'}`}>
                                {editingCategory ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                )}
                            </div>
                            {editingCategory ? 'Edit Kategori' : data.parent_id !== '' ? 'Tambah Sub-Kategori' : 'Tambah Kategori Utama'}
                        </h3>

                        <form onSubmit={submit} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full px-5 py-4 rounded-2xl border bg-gray-800 text-sm font-semibold text-gray-200 placeholder:text-gray-500 shadow-inner focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'}`}
                                    placeholder="Contoh: Mecha"
                                />
                                {errors.name && <p className="mt-2 text-xs font-bold text-red-400">{errors.name}</p>}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Induk Kategori (Parent)</label>

                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border bg-gray-800 shadow-inner hover:border-gray-500 transition-all text-left ${errors.parent_id ? 'border-red-500' : 'border-gray-700'}`}
                                >
                                    <span className={`flex items-center gap-2 ${data.parent_id === '' ? 'text-gray-500 font-semibold text-sm' : 'text-gray-200 font-bold text-sm'}`}>
                                        {selectedCategory ? (
                                            <>
                                                {/* 🌟 LOGO / IMAGE DI TOMBOL SELECT PARENT */}
                                                {selectedCategory.image_path ? (
                                                    <img src={`/storage/${selectedCategory.image_path}`} alt="" className="w-5 h-5 rounded-md object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-md bg-gray-700 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                                    </div>
                                                )}
                                                <span className="truncate">{selectedCategory.name}</span>
                                            </>
                                        ) : '-- Tidak ada (Jadikan Kategori Utama) --'}
                                    </span>
                                    <svg className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {/* Z-INDEX 100 ditambahkan disini */}
                                {isDropdownOpen && (
                                    <div className="absolute z-[100] w-full mt-2 bg-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
                                        <div className="p-3 border-b border-gray-700 bg-gray-800">
                                            <input
                                                type="text"
                                                placeholder="Cari kategori..."
                                                value={searchCategory}
                                                onChange={e => setSearchCategory(e.target.value)}
                                                className="w-full px-4 py-3 text-sm font-semibold text-gray-200 placeholder:text-gray-500 border border-gray-700 bg-gray-900 rounded-xl focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => {
 setData('parent_id', ''); setIsDropdownOpen(false); setSearchCategory(''); 
}}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 rounded-xl font-bold transition-colors"
                                            >
                                                -- Tidak ada (Jadikan Kategori Utama) --
                                            </button>

                                            {selectableCategories.length === 0 ? (
                                                <div className="px-4 py-4 text-sm font-bold text-gray-500 text-center">Kategori tidak ditemukan</div>
                                            ) : (
                                                selectableCategories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => {
 setData('parent_id', cat.id.toString()); setIsDropdownOpen(false); setSearchCategory(''); 
}}
                                                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-800 rounded-xl flex items-center gap-3 transition-colors"
                                                    >
                                                        {cat.level > 0 && <span className="text-gray-600 font-black opacity-50">{'—'.repeat(cat.level)}</span>}

                                                        {/* 🌟 LOGO / IMAGE DI LIST DROPDOWN */}
                                                        {cat.image_path ? (
                                                            <img src={`/storage/${cat.image_path}`} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                                            </div>
                                                        )}
                                                        <span className={`truncate ${cat.level === 0 ? 'font-black text-gray-200' : 'font-bold text-gray-400'}`}>{cat.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                {errors.parent_id && <p className="mt-2 text-xs font-bold text-red-400">{errors.parent_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Icon / Gambar (Opsional)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800 overflow-hidden flex-shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-6 h-6 text-gray-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600 cursor-pointer"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">Format: JPG, PNG, WEBP (Max 4MB)</p>
                                    </div>
                                </div>
                                {errors.image && <p className="mt-2 text-xs font-bold text-red-400">{errors.image}</p>}
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={processing} className={`w-full text-gray-900 px-6 py-4 rounded-full font-bold transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400/30 disabled:opacity-50 ${editingCategory ? 'bg-gray-300 hover:bg-white' : 'bg-gray-200 hover:bg-white hover:-translate-y-0.5'}`}>
                                    {processing ? 'Menyimpan...' : editingCategory ? 'Update Kategori' : 'Simpan Kategori'}
                                </button>

                                {editingCategory && (
                                    <button type="button" onClick={cancelEdit} className="w-full mt-3 px-6 py-3 rounded-full font-bold text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
                                        Batal Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* KOLOM KANAN: Visualisasi Tree Kategori */}
                <div className="w-full lg:w-2/3">
                    <div className="relative overflow-hidden bg-gray-900 rounded-[34px] shadow-lg border border-gray-800 p-6 lg:p-10 min-h-[500px]">
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-800 relative z-10">
                            <div>
                                <h2 className="font-black text-2xl text-gray-100">Struktur Kategori</h2>
                                <p className="text-sm font-semibold text-gray-400 mt-2">Klik icon <strong className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md inline-flex border border-gray-700">►</strong> untuk membuka sub-kategori.</p>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {categories.length === 0 ? (
                                <div className="text-center py-24 border-2 border-dashed border-gray-700 rounded-3xl bg-gray-800/50">
                                    <p className="text-gray-500 font-bold text-lg">Belum ada kategori sama sekali.</p>
                                </div>
                            ) : (
                                <div className="pr-4 pb-10">
                                    {renderCategoryTree(categories)}
                                </div>
                            )}
                        </div>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}