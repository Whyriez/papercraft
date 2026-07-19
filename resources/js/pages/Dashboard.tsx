import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react'; // 1. Import Link dari Inertia
import { PageProps } from '@/types';

export default function Dashboard({ auth }: PageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Overview Dashboard"
        >
            <Head title="Dashboard Admin" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 2. Kartu Statistik diubah menjadi Link menuju Index Papercraft */}
                <Link href="/admin/papercrafts" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all group">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Total Papercraft</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">24</h3>
                    </div>
                </Link>

                <Link href="/admin/categories" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Kategori</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">8</h3>
                    </div>
                </Link>
            </div>

            {/* Banner Selamat Datang */}
            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-extrabold mb-4">Selamat datang kembali, {auth.user.name}!</h2>
                    <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                        Sistem manajemen papercraft sudah siap digunakan. Kamu bisa mulai menambahkan template baru atau mengatur struktur kategori dari sidebar di sebelah kiri.
                    </p>
                    
                    {/* 3. Ubah tag <button> menjadi <Link> dan arahkan ke route Create */}
                    <Link 
                        href="/admin/papercrafts/create" 
                        className="inline-block bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        + Tambah Papercraft Baru
                    </Link>
                </div>
                
                {/* Dekorasi Background */}
                <svg className="absolute right-0 bottom-0 text-white/5 w-96 h-96 -mr-20 -mb-20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
        </AuthenticatedLayout>
    );
}