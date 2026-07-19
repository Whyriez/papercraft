import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
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
    const [flashMsg, setFlashMsg] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        category: Category | null;
        subCount: number;
    }>({
        isOpen: false,
        category: null,
        subCount: 0,
    });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            parent_id: '',
            image: null as File | null,
            _method: 'post',
        });

    const { delete: destroy } = useForm();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
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
            setImagePreview(
                editingCategory?.image_path
                    ? `/storage/${editingCategory.image_path}`
                    : null,
            );
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setFlashMsg(null);

        const url = editingCategory
            ? `/admin/categories/${editingCategory.id}`
            : '/admin/categories';

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                cancelEdit();
                setFlashMsg({
                    type: 'success',
                    text: editingCategory
                        ? 'Kategori berhasil diperbarui!'
                        : 'Kategori berhasil ditambahkan!',
                });
                setTimeout(() => setFlashMsg(null), 3000);

                if (data.parent_id !== '') {
                    toggleNode(parseInt(data.parent_id), true);
                }
            },
            onError: () =>
                setFlashMsg({
                    type: 'error',
                    text: 'Gagal! Cek form isian di bawah.',
                }),
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
            formRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
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
                setFlashMsg({
                    type: 'success',
                    text: 'Kategori berhasil dihapus!',
                });
                setTimeout(() => setFlashMsg(null), 3000);
            },
        });
    };

    const handleQuickAddSub = (parentId: number) => {
        cancelEdit();
        setData('parent_id', parentId.toString());

        if (formRef.current) {
            formRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    const toggleNode = (id: number, forceExpand = false) => {
        setExpandedNodes((prev) => {
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

    const flattenCategories = (
        cats: Category[],
        level = 0,
        result: any[] = [],
    ) => {
        cats.forEach((cat) => {
            result.push({
                id: cat.id,
                name: cat.name,
                level,
                image_path: cat.image_path,
            });

            if (cat.all_children && cat.all_children.length > 0) {
                flattenCategories(cat.all_children, level + 1, result);
            }
        });

        return result;
    };

    const flatCategories = flattenCategories(categories);

    const selectableCategories = flatCategories.filter(
        (cat) =>
            cat.name.toLowerCase().includes(searchCategory.toLowerCase()) &&
            (!editingCategory || cat.id !== editingCategory.id),
    );

    const selectedCategory = data.parent_id
        ? flatCategories.find((c) => c.id.toString() === data.parent_id)
        : null;

    const renderCategoryTree = (cats: Category[], level = 0) => {
        return (
            <div
                className={`flex flex-col gap-3 ${level > 0 ? 'mt-3 ml-6 border-l-2 border-gray-700 pl-4' : ''}`}
            >
                {cats.map((cat) => {
                    const hasChildren =
                        cat.all_children && cat.all_children.length > 0;
                    const isExpanded = expandedNodes.has(cat.id);
                    const isBeingEdited = editingCategory?.id === cat.id;

                    return (
                        <div key={cat.id}>
                            <div className="group relative">
                                {level > 0 && (
                                    <div className="absolute top-1/2 -left-4 h-[2px] w-4 -translate-y-1/2 bg-gray-700"></div>
                                )}

                                <div
                                    className={`relative z-10 flex items-center justify-between rounded-2xl border bg-gray-800 p-4 transition-all ${
                                        isBeingEdited
                                            ? 'border-gray-400 shadow-md ring-1 ring-gray-400'
                                            : data.parent_id ===
                                                cat.id.toString()
                                              ? 'border-gray-500 shadow-md ring-1 ring-gray-500'
                                              : 'border-gray-700 hover:border-gray-500 hover:shadow-lg'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                hasChildren &&
                                                toggleNode(cat.id)
                                            }
                                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${hasChildren ? 'cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white' : 'cursor-default opacity-0'}`}
                                        >
                                            {hasChildren && (
                                                <svg
                                                    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={3}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>

                                        <div
                                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm ${level === 0 ? 'border-transparent bg-gray-700 text-gray-200' : 'border-gray-700 bg-gray-900 text-gray-500'}`}
                                        >
                                            {cat.image_path ? (
                                                <img
                                                    src={`/storage/${cat.image_path}`}
                                                    alt={cat.name}
                                                    className="h-full w-full object-cover"
                                                />
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
                                                        strokeWidth={2}
                                                        d={
                                                            level === 0
                                                                ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                                                                : 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                                                        }
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <div>
                                            <div className="text-sm font-black text-gray-200">
                                                {cat.name}
                                            </div>
                                            {level === 0 && (
                                                <div className="mt-1 text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                                                    Kategori Utama
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="rounded-xl bg-gray-700 px-3 py-2 text-xs font-bold text-gray-200 shadow-sm transition-all hover:bg-gray-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleQuickAddSub(cat.id)
                                            }
                                            className="rounded-xl bg-gray-600 px-3 py-2 text-xs font-bold text-gray-200 shadow-sm transition-all hover:bg-gray-500"
                                        >
                                            + Sub
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(cat)}
                                            className="rounded-xl border border-transparent bg-red-900/40 px-3 py-2 text-xs font-bold text-red-500 shadow-sm transition-all hover:border-red-700 hover:bg-red-800 hover:text-white"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {hasChildren &&
                                isExpanded &&
                                renderCategoryTree(
                                    cat.all_children!,
                                    level + 1,
                                )}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm transition-opacity sm:p-6">
                    <div className="w-full max-w-lg rounded-[34px] border border-gray-800 bg-gray-900 p-8 shadow-2xl">
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-gray-100">
                            Hapus Kategori?
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-gray-400">
                            Anda akan menghapus kategori{' '}
                            <strong className="text-gray-200">
                                {deleteModal.category.name}
                            </strong>
                            .
                            {deleteModal.subCount > 0 && (
                                <span className="mt-3 block rounded-xl border border-red-800/50 bg-red-900/30 px-4 py-3 font-bold text-red-400">
                                    ⚠️ Terdapat {deleteModal.subCount}{' '}
                                    Sub-Kategori di dalamnya yang akan ikut
                                    terhapus permanen!
                                </span>
                            )}
                            <span className="mt-3 block font-semibold text-gray-500">
                                Seluruh template papercraft yang ada di dalam
                                kategori ini juga akan terhapus. Silahkan ubah
                                (reassign) template ke kategori lain terlebih
                                dahulu jika tidak ingin data hilang.
                            </span>
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        isOpen: false,
                                        category: null,
                                        subCount: 0,
                                    })
                                }
                                className="flex-1 rounded-full border border-gray-700 bg-gray-800 px-5 py-3.5 font-bold text-gray-300 shadow-sm transition-colors hover:bg-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 rounded-full bg-red-600 px-5 py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-red-500"
                            >
                                Ya, Hapus Permanen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto flex max-w-7xl flex-col gap-10 pb-12 lg:flex-row">
                {/* KOLOM KIRI: Form Kategori (PENTING: relative z-30 ditambahkan) */}
                <div className="relative z-30 w-full lg:w-1/3" ref={formRef}>
                    {flashMsg && (
                        <div
                            className={`mb-6 flex items-center gap-3 rounded-2xl border p-5 font-bold shadow-sm transition-all ${flashMsg.type === 'success' ? 'border-green-800 bg-green-900/30 text-green-400' : 'border-red-800 bg-red-900/30 text-red-400'}`}
                        >
                            {flashMsg.text}
                        </div>
                    )}

                    {/* PENTING: overflow-hidden dihapus dari sini */}
                    <div
                        className={`relative sticky top-28 rounded-[30px] border border-gray-800 p-6 shadow-lg transition-colors sm:p-8 ${editingCategory ? 'bg-gray-800 ring-4 ring-gray-600/30' : data.parent_id !== '' ? 'bg-gray-800 ring-4 ring-gray-700' : 'bg-gray-900'}`}
                    >
                        {/* Background Dekorasi Blur dipisah ke kontainer baru agar overflow-hidden tidak mempengaruhi form */}
                        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[30px]">
                            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-gray-800 opacity-60 blur-2xl"></div>
                        </div>

                        <h3 className="relative z-10 mb-8 flex items-center gap-3 text-xl font-black text-gray-100">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-gray-900 shadow-md ${editingCategory ? 'bg-gray-300' : 'bg-gray-200'}`}
                            >
                                {editingCategory ? (
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                )}
                            </div>
                            {editingCategory
                                ? 'Edit Kategori'
                                : data.parent_id !== ''
                                  ? 'Tambah Sub-Kategori'
                                  : 'Tambah Kategori Utama'}
                        </h3>

                        <form
                            onSubmit={submit}
                            className="relative z-10 space-y-6"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className={`w-full rounded-2xl border bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-200 shadow-inner transition-all placeholder:text-gray-500 focus:ring-2 focus:outline-none ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-gray-500 focus:ring-gray-500/20'}`}
                                    placeholder="Contoh: Mecha"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-xs font-bold text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <label className="mb-2 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Induk Kategori (Parent)
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsDropdownOpen(!isDropdownOpen)
                                    }
                                    className={`flex w-full items-center justify-between rounded-2xl border bg-gray-800 px-5 py-4 text-left shadow-inner transition-all hover:border-gray-500 ${errors.parent_id ? 'border-red-500' : 'border-gray-700'}`}
                                >
                                    <span
                                        className={`flex items-center gap-2 ${data.parent_id === '' ? 'text-sm font-semibold text-gray-500' : 'text-sm font-bold text-gray-200'}`}
                                    >
                                        {selectedCategory ? (
                                            <>
                                                {/* 🌟 LOGO / IMAGE DI TOMBOL SELECT PARENT */}
                                                {selectedCategory.image_path ? (
                                                    <img
                                                        src={`/storage/${selectedCategory.image_path}`}
                                                        alt=""
                                                        className="h-5 w-5 flex-shrink-0 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-gray-700 text-gray-400">
                                                        <svg
                                                            className="h-3 w-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span className="truncate">
                                                    {selectedCategory.name}
                                                </span>
                                            </>
                                        ) : (
                                            '-- Tidak ada (Jadikan Kategori Utama) --'
                                        )}
                                    </span>
                                    <svg
                                        className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Z-INDEX 100 ditambahkan disini */}
                                {isDropdownOpen && (
                                    <div className="absolute z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-xl">
                                        <div className="border-b border-gray-700 bg-gray-800 p-3">
                                            <input
                                                type="text"
                                                placeholder="Cari kategori..."
                                                value={searchCategory}
                                                onChange={(e) =>
                                                    setSearchCategory(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-semibold text-gray-200 placeholder:text-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="max-h-60 space-y-1 overflow-y-auto p-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('parent_id', '');
                                                    setIsDropdownOpen(false);
                                                    setSearchCategory('');
                                                }}
                                                className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-300 transition-colors hover:bg-gray-800"
                                            >
                                                -- Tidak ada (Jadikan Kategori
                                                Utama) --
                                            </button>

                                            {selectableCategories.length ===
                                            0 ? (
                                                <div className="px-4 py-4 text-center text-sm font-bold text-gray-500">
                                                    Kategori tidak ditemukan
                                                </div>
                                            ) : (
                                                selectableCategories.map(
                                                    (cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setData(
                                                                    'parent_id',
                                                                    cat.id.toString(),
                                                                );
                                                                setIsDropdownOpen(
                                                                    false,
                                                                );
                                                                setSearchCategory(
                                                                    '',
                                                                );
                                                            }}
                                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-gray-800"
                                                        >
                                                            {cat.level > 0 && (
                                                                <span className="font-black text-gray-600 opacity-50">
                                                                    {'—'.repeat(
                                                                        cat.level,
                                                                    )}
                                                                </span>
                                                            )}

                                                            {/* 🌟 LOGO / IMAGE DI LIST DROPDOWN */}
                                                            {cat.image_path ? (
                                                                <img
                                                                    src={`/storage/${cat.image_path}`}
                                                                    alt=""
                                                                    className="h-6 w-6 flex-shrink-0 rounded-md object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gray-700 text-gray-400">
                                                                    <svg
                                                                        className="h-3 w-3"
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
                                                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <span
                                                                className={`truncate ${cat.level === 0 ? 'font-black text-gray-200' : 'font-bold text-gray-400'}`}
                                                            >
                                                                {cat.name}
                                                            </span>
                                                        </button>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                                {errors.parent_id && (
                                    <p className="mt-2 text-xs font-bold text-red-400">
                                        {errors.parent_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Icon / Gambar (Opsional)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-600 bg-gray-800">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                className="h-6 w-6 text-gray-500 opacity-50"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full cursor-pointer text-sm text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-gray-700 file:px-5 file:py-2.5 file:text-xs file:font-bold file:text-gray-200 hover:file:bg-gray-600"
                                        />
                                        <p className="mt-1 text-[10px] font-semibold text-gray-500">
                                            Format: JPG, PNG, WEBP (Max 4MB)
                                        </p>
                                    </div>
                                </div>
                                {errors.image && (
                                    <p className="mt-2 text-xs font-bold text-red-400">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full rounded-full px-6 py-4 font-bold text-gray-900 shadow-md transition-all focus:ring-4 focus:ring-gray-400/30 focus:outline-none disabled:opacity-50 ${editingCategory ? 'bg-gray-300 hover:bg-white' : 'bg-gray-200 hover:-translate-y-0.5 hover:bg-white'}`}
                                >
                                    {processing
                                        ? 'Menyimpan...'
                                        : editingCategory
                                          ? 'Update Kategori'
                                          : 'Simpan Kategori'}
                                </button>

                                {editingCategory && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="mt-3 w-full rounded-full border border-gray-700 bg-gray-800 px-6 py-3 font-bold text-gray-300 transition-colors hover:bg-gray-700"
                                    >
                                        Batal Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* KOLOM KANAN: Visualisasi Tree Kategori */}
                <div className="w-full lg:w-2/3">
                    <div className="relative min-h-[500px] overflow-hidden rounded-[34px] border border-gray-800 bg-gray-900 p-6 shadow-lg lg:p-10">
                        <div className="relative z-10 mb-8 flex items-center justify-between border-b border-gray-800 pb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-100">
                                    Struktur Kategori
                                </h2>
                                <p className="mt-2 text-sm font-semibold text-gray-400">
                                    Klik icon{' '}
                                    <strong className="inline-flex rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-gray-300">
                                        ►
                                    </strong>{' '}
                                    untuk membuka sub-kategori.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {categories.length === 0 ? (
                                <div className="rounded-3xl border-2 border-dashed border-gray-700 bg-gray-800/50 py-24 text-center">
                                    <p className="text-lg font-bold text-gray-500">
                                        Belum ada kategori sama sekali.
                                    </p>
                                </div>
                            ) : (
                                <div className="pr-4 pb-10">
                                    {renderCategoryTree(categories)}
                                </div>
                            )}
                        </div>

                        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-gray-800 opacity-30 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
