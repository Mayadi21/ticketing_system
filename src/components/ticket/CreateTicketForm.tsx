// src/components/ticket/CreateTicketForm.tsx

'use client';

import { useState } from 'react';
import { X, CloudUpload, ChevronDown, FileText, Search } from 'lucide-react'; // Tambahkan Search
import { useRouter } from 'next/navigation';
import { submitTicketData } from '@/app/actions/ticket'; 
import toast from 'react-hot-toast';

export interface BranchData {
    id: number;
    branch_name: string;
    branch_code: string;
}

export interface EngineerData {
    id: number;
    name: string;
    role: string;
}

interface CreateTicketFormProps {
    role: 'admin' | 'branch';
    branches?: BranchData[];   
    engineers?: EngineerData[]; 
}

export default function CreateTicketForm({ 
    role, 
    branches = [], 
    engineers = [] 
}: CreateTicketFormProps) {

    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    
    // State untuk fitur search engineer
    const [engineerSearch, setEngineerSearch] = useState('');
    const [branchSearch, setBranchSearch] = useState('');

    const isAdmin = role === 'admin';
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const storageUrl = "/attachments";

    // Helper untuk mengambil tanggal & waktu minimal (khusus hari ini minimal jam 17:00)
    const getMinDateTime = () => {
        const now = new Date();
        const today17 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
        const minDate = now > today17 ? now : today17;
        const tzOffset = minDate.getTimezoneOffset() * 60000;
        return new Date(minDate.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    const validateDeadlineDate = (deadlineStr: string): string | null => {
        if (!deadlineStr) return "Deadline wajib diisi!";
        const selected = new Date(deadlineStr);
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const startOfSelectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 0, 0, 0);

        if (startOfSelectedDay < startOfToday) {
            return "Deadline penanganan tidak boleh pada tanggal yang telah lalu!";
        }

        if (startOfSelectedDay.getTime() === startOfToday.getTime()) {
            const today17 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
            if (now > today17) {
                if (selected < now) {
                    return "Deadline penanganan untuk hari ini tidak boleh kurang dari waktu saat ini!";
                }
            } else {
                if (selected < today17) {
                    return "Khusus untuk hari ini, deadline penanganan minimal jam 17:00!";
                }
            }
        }

        return null;
    };

    const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'];

    const isAllowedFile = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const incomingFiles = Array.from(e.target.files);

            const invalidFiles = incomingFiles.filter(f => !isAllowedFile(f));
            if (invalidFiles.length > 0) {
                toast.error("Hanya file PDF, Docs (.doc/.docx/.txt), dan Gambar yang diperbolehkan!");
                e.target.value = "";
                return;
            }

            const totalFiles = [...selectedFiles, ...incomingFiles];

            if (totalFiles.length > 3) {
                toast.error("Maksimal hanya 3 file yang bisa diupload!");
                e.target.value = ""; 
                return;
            }

            setSelectedFiles(totalFiles);
            e.target.value = ""; 
        }
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const config = {
        title: isAdmin ? 'Buat Tiket Baru untuk Cabang Bank' : 'Buat Tiket Baru',
        subtitle: isAdmin
            ? 'Buat tiket baru dan tetapkan langsung ke engineer.'
            : 'Harap berikan informasi detail tentang masalah Anda.',
        cancelRoute: isAdmin ? '/admin/tickets' : '/branch/dashboard',
        submitRoute: isAdmin ? '/admin/tickets' : '/branch/dashboard',
        submitText: isAdmin ? 'Buat Tiket' : 'Submit Tiket',
        cancelButtonStyle: isAdmin
            ? 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
            : 'text-primary bg-white border border-primary hover:bg-primary/5',
        isAttachmentRequired: !isAdmin,
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (config.isAttachmentRequired && selectedFiles.length === 0) {
            toast.error("Minimal harus mengupload 1 file lampiran!");
            return;
        }

setIsLoading(true);
        // Tampilkan toast loading dan simpan referensinya
        const loadingToast = toast.loading('Memproses tiket Anda...');

        try {
            const formData = new FormData(e.currentTarget);

            if (isAdmin) {
                const deadlineVal = formData.get('deadline') as string;
                const deadlineError = validateDeadlineDate(deadlineVal);
                if (deadlineError) {
                    toast.error(deadlineError, { id: loadingToast });
                    setIsLoading(false);
                    return;
                }
            }

            formData.delete('files');
            
            selectedFiles.forEach((file) => {
                formData.append('files', file);
            });

            const result = await submitTicketData(formData);

            if (result.error) {
                // 4. GANTI ALERT GAGAL MENJADI TOAST ERROR, buang loading toast
                toast.error(`Gagal membuat tiket: ${result.error}`, { id: loadingToast });
                setIsLoading(false);
            } else {
                // 5. GANTI ALERT BERHASIL MENJADI TOAST SUCCESS
                toast.success('Tiket berhasil disubmit!', { id: loadingToast });
                
                // Tambahkan sedikit jeda agar user bisa melihat pesan sukses sebelum redirect
                setTimeout(() => {
                    router.push(config.submitRoute);
                }, 1000); 
            }
        } catch (error) {
            toast.error('Terjadi kesalahan pada sistem.', { id: loadingToast });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 md:p-6">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200">

                <div className="flex items-start justify-between px-6 py-5 md:px-8 md:py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{config.title}</h2>
                        <p className="text-sm text-slate-500">{config.subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push(config.cancelRoute)}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="px-6 py-5 md:px-8 md:py-6 space-y-6">

                    {isAdmin && (
                        <div className="flex flex-col space-y-6">
                            {/* --- DYNAMIC BRANCHES DROPDOWN --- */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Bank Cabang <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                   <div className="border border-slate-300 rounded-lg overflow-hidden bg-white flex flex-col">

    {/* Search Branch */}
    <div className="relative border-b border-slate-200 bg-slate-50/50">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
        </div>

        <input
            type="text"
            placeholder="Cari nama atau kode cabang..."
            value={branchSearch}
            onChange={(e) => setBranchSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-transparent text-sm text-slate-900 focus:outline-none placeholder-slate-400"
        />
    </div>

    {/* Branch List */}
    <div className="max-h-48 overflow-y-auto p-1.5">
        {branches.length > 0 ? (
            branches.map((branch) => {
                const keyword = branchSearch.toLowerCase();

                const isMatch =
                    branch.branch_name.toLowerCase().includes(keyword) ||
                    branch.branch_code.toLowerCase().includes(keyword);

                return (
                    <label
                        key={branch.id}
                        className={`items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border-b border-slate-100 last:border-0 ${
                            isMatch ? 'flex' : 'hidden'
                        }`}
                    >
                        <input
                            type="radio"
                            name="affected_branch"
                            value={branch.id}
                            required
                            className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
                        />

                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">
                                {branch.branch_name}
                            </span>
                            <span className="text-xs text-slate-500">
                                {branch.branch_code}
                            </span>
                        </div>
                    </label>
                );
            })
        ) : (
            <div className="p-3 text-sm text-slate-500 text-center">
                Tidak ada cabang bank yang tersedia.
            </div>
        )}

        {branches.length > 0 &&
            !branches.some(
                (branch) =>
                    branch.branch_name
                        .toLowerCase()
                        .includes(branchSearch.toLowerCase()) ||
                    branch.branch_code
                        .toLowerCase()
                        .includes(branchSearch.toLowerCase())
            ) && (
                <div className="p-3 text-sm text-slate-500 text-center">
                    Cabang "{branchSearch}" tidak ditemukan.
                </div>
            )}
    </div>
</div>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* --- DYNAMIC ENGINEERS CHECKBOX WITH SEARCH --- */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Engineer ditugaskan <span className="text-red-500">*</span>
                                </label>
                                
                                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white flex flex-col">
                                    {/* Kolom Pencarian Engineer */}
                                    <div className="relative border-b border-slate-200 bg-slate-50/50">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Search size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Cari nama engineer..."
                                            value={engineerSearch}
                                            onChange={(e) => setEngineerSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-transparent text-sm text-slate-900 focus:outline-none placeholder-slate-400"
                                        />
                                    </div>

                                    {/* Daftar Engineer */}
                                    <div className="p-1.5 max-h-40 overflow-y-auto">
                                        {engineers.length > 0 ? (
                                            engineers.map((eng) => {
                                                // Cek apakah nama engineer cocok dengan pencarian
                                                const isMatch = eng.name.toLowerCase().includes(engineerSearch.toLowerCase());
                                                
                                                return (
                                                    <label 
                                                        key={eng.id} 
                                                        className={`items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border-b border-slate-100 last:border-0 ${isMatch ? 'flex' : 'hidden'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            name="engineer_ids"
                                                            value={eng.id}
                                                            className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-700">{eng.name}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })
                                        ) : (
                                            <div className="p-3 text-sm text-slate-500 text-center">Tidak ada engineer yang tersedia.</div>
                                        )}
                                        {/* Feedback jika pencarian tidak ditemukan */}
                                        {engineers.length > 0 && !engineers.some(eng => eng.name.toLowerCase().includes(engineerSearch.toLowerCase())) && (
                                            <div className="p-3 text-sm text-slate-500 text-center">Engineer "{engineerSearch}" tidak ditemukan.</div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">Anda dapat memilih lebih dari satu engineer.</p>
                            </div>

                            {/* --- TICKET DEADLINE --- */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Deadline Penanganan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="deadline" 
                                    required
                                    min={getMinDateTime()}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* FIELD LAINNYA */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Judul Masalah <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title" 
                            placeholder="Ringkasan singkat dari masalah"
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Deskripsi Rinci <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description" 
                            rows={4}
                            placeholder="Jelaskan masalah secara rinci..."
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base resize-y"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Lampiran Masalah
                            {config.isAttachmentRequired ? (
                                <span className="text-red-500 ml-1">*</span>
                            ) : (
                                <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                            )}
                        </label>

                        <div
                            className={`relative flex flex-col items-center justify-center w-full px-6 py-8 md:py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                            ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { 
                                e.preventDefault(); 
                                setIsDragging(false); 
                                if(e.dataTransfer.files) {
                                    const incomingFiles = Array.from(e.dataTransfer.files);

                                    const invalidFiles = incomingFiles.filter(f => !isAllowedFile(f));
                                    if (invalidFiles.length > 0) {
                                        toast.error("Hanya file PDF, Docs (.doc/.docx/.txt), dan Gambar yang diperbolehkan!");
                                        return;
                                    }

                                    const totalFiles = [...selectedFiles, ...incomingFiles];
                                    if(totalFiles.length > 3) {
                                        toast.error("Maksimal hanya 3 file yang bisa diupload!");
                                        return;
                                    }
                                    setSelectedFiles(totalFiles);
                                }
                            }}
                        >
                            <input
                                type="file"
                                name="files"
                                accept=".pdf,.doc,.docx,.txt,.rtf,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                multiple
                                onChange={handleFileChange}
                            />
                            <CloudUpload size={36} strokeWidth={1.5} className={`mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
                            <p className="text-sm md:text-base text-slate-600 mb-1 text-center">
                                <span className="font-bold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-400 text-center">PDF, DOC, DOCX, TXT, & Gambar (max. 3 file, max. 5MB per file)</p>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-700 mb-2">File dilampirkan ({selectedFiles.length}/3):</p>
                                <ul className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-center min-w-0 mr-4">
                                                <FileText size={18} className="text-slate-400 mr-2 flex-shrink-0" />
                                                <span className="truncate font-medium text-slate-700">{file.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 whitespace-nowrap">
                                                <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-100 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => router.push(config.cancelRoute)}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold transition-colors ${config.cancelButtonStyle}`}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white shadow-sm transition-colors ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                        >
                            {isLoading ? 'Memproses...' : config.submitText}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}