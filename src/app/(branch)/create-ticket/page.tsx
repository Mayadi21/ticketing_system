'use client';

import { useState } from 'react';
import { X, CloudUpload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateTicketPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form tiket berhasil disubmit!");
    // Kembali ke halaman dashboard setelah submit
    router.push('/branch/dashboard');
  };

  return (
    // Background overlay yang lembut (cocok jika dijadikan modal atau halaman mandiri)
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 md:p-6">
      
      {/* Container Utama Form */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200">
        
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-5 md:px-8 md:py-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              Create New Ticket
            </h2>
            <p className="text-sm text-slate-500">
              Please provide detailed information about your issue.
            </p>
          </div>
          
          {/* Tombol Close (X) */}
          <button 
            onClick={() => router.push('/branch/dashboard')}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-5 md:px-8 md:py-6 space-y-6">
          
          {/* Input: Issue Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of the problem"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
            />
          </div>

          {/* Textarea: Detailed Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Please provide steps to reproduce, error messages, or any other relevant details..."
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base resize-y"
            ></textarea>
          </div>

          {/* Drag & Drop: Attachments */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Attachments <span className="text-red-500">*</span>
            </label>
            
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
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Logika upload file nantinya */ }}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                multiple
              />
              
              <CloudUpload 
                size={36} 
                strokeWidth={1.5} 
                className={`mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-slate-400'}`} 
              />
              
              <p className="text-sm md:text-base text-slate-600 mb-1 text-center">
                <span className="font-bold text-primary">Click to upload</span> or drag and drop
              </p>
              
              <p className="text-xs text-slate-400 text-center">
                SVG, PNG, JPG or PDF (max. 10MB)
              </p>
            </div>
          </div>

          {/* FOOTER & BUTTONS */}
          <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/branch/dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-primary bg-white border border-primary hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-dark shadow-sm transition-colors"
            >
              Submit Ticket
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}