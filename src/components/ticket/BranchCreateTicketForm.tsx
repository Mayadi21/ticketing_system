// src/components/ticket/BranchCreateTicketForm.tsx

'use client';

import { useState } from 'react';
import { X, CloudUpload, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitBranchTicketData } from '@/app/actions/ticket';
import toast from 'react-hot-toast';

export default function BranchCreateTicketForm() {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB dalam bytes

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const incomingFiles = Array.from(e.target.files);

            // Cek apakah ada file yang melebihi 5MB
            const hasLargeFile = incomingFiles.some(file => file.size > MAX_FILE_SIZE);
            if (hasLargeFile) {
                toast.error("Ukuran setiap file maksimal adalah 5 MB!");
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

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Wajib melampirkan file untuk Branch
        if (selectedFiles.length === 0) {
            toast.error("Minimal harus mengupload 1 file lampiran!");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Memproses tiket Anda...');

        try {
            const formData = new FormData(e.currentTarget);
            formData.delete('files');

            selectedFiles.forEach((file) => {
                formData.append('files', file);
            });

            const result = await submitBranchTicketData(formData);

            if (result.error) {
                toast.error(`Gagal membuat tiket: ${result.error}`, { id: loadingToast });
                setIsLoading(false);
            } else {
                toast.success('Tiket berhasil disubmit!', { id: loadingToast });

                setTimeout(() => {
                    router.push('/branch/dashboard');
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

                {/* Header Section */}
                <div className="flex items-start justify-between px-6 py-5 md:px-8 md:py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Buat Tiket Baru</h2>
                        <p className="text-sm text-slate-500">Silakan berikan informasi rinci tentang masalah Anda.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push('/branch/dashboard')}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleFormSubmit} className="px-6 py-5 md:px-8 md:py-6 space-y-6">

                    {/* Issue Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Judul Masalah <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Masukkan judul masalah Anda..."
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>

                    {/* Detailed Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Deskripsi Rinci <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            placeholder="Silakan berikan detail error atau detail relevan lainnya..."
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base resize-y"
                        ></textarea>
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Lampiran <span className="text-red-500 ml-1">*</span>
                        </label>

                        <div
                            className={`relative flex flex-col items-center justify-center w-full px-6 py-8 md:py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                            ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files) {
                                    const incomingFiles = Array.from(e.dataTransfer.files);

                                    // Cek ukuran file saat drag and drop
                                    const hasLargeFile = incomingFiles.some(file => file.size > MAX_FILE_SIZE);
                                    if (hasLargeFile) {
                                        toast.error("Ukuran setiap file maksimal adalah 5 MB!");
                                        return;
                                    }

                                    const totalFiles = [...selectedFiles, ...incomingFiles];
                                    if (totalFiles.length > 3) {
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
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                multiple
                                onChange={handleFileChange}
                            />
                            <CloudUpload size={36} strokeWidth={1.5} className={`mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
                            <p className="text-sm md:text-base text-slate-600 mb-1 text-center">
                                <span className="font-bold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-400 text-center">PNG, JPG atau PDF (max. 3 file, max. 5MB per file)</p>
                        </div>

                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-700 mb-2">File terlampir ({selectedFiles.length}/3):</p>
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

                    {/* Action Buttons */}
                    <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => router.push('/branch/dashboard')}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold transition-colors text-primary bg-white border border-primary hover:bg-primary/5"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white shadow-sm transition-colors ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                        >
                            {isLoading ? 'Memproses...' : 'Kirim Tiket'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}