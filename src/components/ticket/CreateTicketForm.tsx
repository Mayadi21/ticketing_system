'use client';

import { useState } from 'react';
import { X, CloudUpload, ChevronDown, FileText } from 'lucide-react'; // Ditambahkan FileText untuk estetika list file
import { useRouter } from 'next/navigation';
import { submitTicketData } from '@/app/actions/ticket'; 

interface CreateTicketFormProps {
    role: 'admin' | 'branch';
}

export default function CreateTicketForm({ role }: CreateTicketFormProps) {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 

    const isAdmin = role === 'admin';
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const incomingFiles = Array.from(e.target.files);
            
            // Logika: menggabungkan file lama + baru agar user bisa mencicil upload
            const totalFiles = [...selectedFiles, ...incomingFiles];

            if (totalFiles.length > 3) {
                alert("Maksimal hanya 3 file yang bisa diupload!");
                e.target.value = ""; // Reset input element
                return;
            }

            setSelectedFiles(totalFiles);
            e.target.value = ""; // Reset input agar user bisa pilih file yang sama lagi jika sempat dihapus
        }
    };

    // Fungsi menghapus file secara spesifik
    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const config = {
        title: isAdmin ? 'Create Master Ticket' : 'Create New Ticket',
        subtitle: isAdmin
            ? 'Record a new issue and assign it directly to an IT engineer.'
            : 'Please provide detailed information about your issue.',
        cancelRoute: isAdmin ? '/admin/tickets' : '/branch/dashboard',
        submitRoute: isAdmin ? '/admin/tickets' : '/branch/dashboard',
        submitText: isAdmin ? 'Create Ticket and Assign' : 'Submit Ticket',
        cancelButtonStyle: isAdmin
            ? 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
            : 'text-primary bg-white border border-primary hover:bg-primary/5',
        isAttachmentRequired: !isAdmin,
    };

    // Eksekusi Submit dengan manipulasi FormData manual agar file di state sinkron ke Backend
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validasi required file di sisi client (karena manual, required native input dilepas)
        if (config.isAttachmentRequired && selectedFiles.length === 0) {
            alert("Minimal harus mengupload 1 file lampiran!");
            return;
        }

        setIsLoading(true);
        
        // Ambil data form yang ada
        const formData = new FormData(e.currentTarget);
        
        // Hapus key 'files' bawaan input HTML agar tidak bentrok
        formData.delete('files');
        
        // Masukkan file dari state React secara akurat (maksimal 3)
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        const result = await submitTicketData(formData);

        if (result.error) {
            alert(`Gagal membuat tiket: ${result.error}`);
            setIsLoading(false);
        } else {
            alert('Tiket berhasil disubmit!');
            router.push(config.submitRoute);
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

                {/* Gunakan onSubmit manual agar sinkronisasi file aman */}
                <form onSubmit={handleFormSubmit} className="px-6 py-5 md:px-8 md:py-6 space-y-6">

                    {isAdmin && (
                        <div className="flex flex-col space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Bank Cabang <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="affected_branch"
                                        required
                                        defaultValue=""
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
                                    >
                                        <option value="" disabled>Select a branch...</option>
                                        <option value="2">KC Koordinator Pematang Siantar</option>
                                        <option value="1">Kantor Pusat Medan</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Assigned Engineer(s) <span className="text-red-500">*</span>
                                </label>
                                <div className="border border-slate-300 rounded-lg p-1.5 max-h-32 overflow-y-auto bg-white">
                                    <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border-b border-slate-100 last:border-0">
                                        <input
                                            type="checkbox"
                                            name="engineer_ids"
                                            value="3"
                                            className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700">Jesica</span>
                                            <span className="text-xs text-slate-500">IT Support</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border-b border-slate-100 last:border-0">
                                        <input
                                            type="checkbox"
                                            name="engineer_ids"
                                            value="4"
                                            className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700">Putra Silalahi</span>
                                            <span className="text-xs text-slate-500">Network Engineer</span>
                                        </div>
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">You can select more than one engineer.</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Issue Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title" 
                            placeholder="Brief summary of the problem"
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description" 
                            rows={4}
                            placeholder="Please provide steps to reproduce, error messages, or any other relevant details..."
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base resize-y"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Attachments
                            {config.isAttachmentRequired ? (
                                <span className="text-red-500 ml-1">*</span>
                            ) : (
                                <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                            )}
                        </label>

                        {/* Kotak Dropzone */}
                        <div
                            className={`
                            relative flex flex-col items-center justify-center w-full px-6 py-8 md:py-10 
                            border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                            ${isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50'
                                }
                            `}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { 
                                e.preventDefault(); 
                                setIsDragging(false); 
                                if(e.dataTransfer.files) {
                                    const incomingFiles = Array.from(e.dataTransfer.files);
                                    const totalFiles = [...selectedFiles, ...incomingFiles];
                                    if(totalFiles.length > 3) {
                                        alert("Maksimal hanya 3 file yang bisa diupload!");
                                        return;
                                    }
                                    setSelectedFiles(totalFiles);
                                }
                            }}
                        >
                            {/* Note: attribute required dilepas karena di-handle oleh onSubmit state */}
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
                            <p className="text-xs text-slate-400 text-center">SVG, PNG, JPG or PDF (max. 3 files, max. 10MB per file)</p>
                        </div>

                        {/* Menampilkan daftar file + Tombol Delete individual */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Selected files ({selectedFiles.length}/3):</p>
                                <ul className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-center min-w-0 mr-4">
                                                <FileText size={18} className="text-slate-400 mr-2 flex-shrink-0" />
                                                <span className="truncate font-medium text-slate-700">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 whitespace-nowrap">
                                                <span className="text-xs text-slate-500">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white shadow-sm transition-colors ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                                }`}
                        >
                            {isLoading ? 'Processing...' : config.submitText}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}