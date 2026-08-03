// src/app/engineer/tickets/[id]/solution/page.tsx

'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, FileText, 
  Upload, X, Loader2, AlertCircle 
} from 'lucide-react';

// IMPORT SERVER ACTION ANDA
// Sesuaikan path import ini dengan lokasi file ticket.ts Anda
import { submitSolutionData } from '@/app/actions/ticket'; 

import { toast } from 'react-hot-toast';
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TicketSolutionPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  // State
  const [solutionNote, setSolutionNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'];

  // Handle Input File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const invalidFiles = newFiles.filter((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return !ext || !ALLOWED_EXTENSIONS.includes(ext);
      });

      if (invalidFiles.length > 0) {
        toast.error("Hanya file PDF, Docs (.doc/.docx/.txt), dan Gambar yang diperbolehkan!");
        e.target.value = "";
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Logic Submit Menggunakan Server Action
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Siapkan FormData
      const formData = new FormData();
      formData.append('ticketId', ticketId);
      formData.append('solutionNote', solutionNote);
      
      // Masukkan semua file ke dalam FormData
      files.forEach((file) => {
        formData.append('files', file);
      });

      // 2. Panggil Server Action
      const result = await submitSolutionData(formData);

      // 3. Tangani hasil dari Server Action
      if (result.error) {
        throw new Error(result.error);
      }

      // Berhasil
      toast.success(result.message || "Solution submitted successfully!");

await new Promise(resolve => setTimeout(resolve, 1200));

router.push('/engineer');

    } catch (error: any) {
      console.error('Error finishing problem:', error);
      toast.error('An error occurred: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Complete Ticket</h1>
                <p className="text-sm text-slate-500">Provide solution details and supporting attachments</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Solution Note */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} /> Solution Note
              </label>
              <textarea
                required
                rows={6}
                value={solutionNote}
                onChange={(e) => setSolutionNote(e.target.value)}
                placeholder="Jelaskan langkah-langkah perbaikan yang telah dilakukan..."
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-slate-700"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Upload size={16} /> Solution Attachments (PDF/Docs/Image)
              </label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors group relative">
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf,.doc,.docx,.txt,.rtf,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-2" size={32} />
                <p className="text-sm text-slate-500">
                  <span className="text-emerald-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, TXT, & Gambar (Max 5MB)</p>
              </div>

              {/* File List Preview */}
              {files.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={18} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-600 truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!solutionNote || isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
            >
              Finish Problem
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertCircle size={28} />
              <h3 className="text-xl font-bold">Confirm Completion</h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to complete this ticket? Please ensure the issue is resolved and any attachments (if applicable) are correct. This action will change the ticket status to <span className="font-bold">RESOLVED</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}