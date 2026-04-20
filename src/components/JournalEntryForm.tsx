import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image as ImageIcon, X, Plus, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JournalEntryFormProps {
  entry?: JournalEntry | null;
  onSave: (entry: Partial<JournalEntry>) => Promise<void>;
  onClose: () => void;
}

export default function JournalEntryForm({ entry, onSave, onClose }: JournalEntryFormProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setNotes(entry.notes);
      setTags(entry.tags.join(', '));
      setImageUrls(entry.imageUrls || []);
    }
  }, [entry]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files) as File[];
    
    // Size limit 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    const tooLarge = files.filter(f => f.size > MAX_SIZE);
    if (tooLarge.length > 0) {
      alert(`The following files are too large (Max 5MB): ${tooLarge.map(f => f.name).join(', ')}`);
      setIsUploading(false);
      e.target.value = '';
      return;
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `journal-images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      });
      
      const urls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed. This could be due to network issues or Firebase Storage configuration.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        notes: notes.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        imageUrls
      });
      onClose();
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-pj-text/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative vibrant-card !rounded-[1.5rem] border-vp-ink bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 space-y-8"
      >
        <div className="flex justify-between items-center border-b-4 border-black pb-6">
          <h2 className="text-3xl font-black italic tracking-tighter text-vp-ink">
            {entry ? 'Edit entry' : 'New entry'}
          </h2>
          <button onClick={onClose} className="vibrant-btn !p-2 !shadow-[2px_2px_0px_#000] !rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] block opacity-60">Entry Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's in your mind?"
              className="vibrant-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] block opacity-60">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="physics, philosophy, art..."
              className="vibrant-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] block opacity-60">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your discoveries here..."
              className="vibrant-input min-h-[150px] resize-vertical"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] block opacity-60">Attachments</label>
            
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {imageUrls.map((url, i) => (
                  <motion.div 
                    key={url} 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="relative w-24 h-24 vibrant-card !rounded-2xl overflow-hidden !shadow-[2px_2px_0px_#000]"
                  >
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 bg-vp-accent3 text-white p-1 border-l-2 border-b-2 border-vp-ink"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <label className="w-24 h-24 border-3 border-dashed border-vp-ink rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_#000]">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="animate-spin text-vp-primary" />
                ) : (
                  <>
                    <Plus size={24} className="text-vp-ink" />
                    <span className="text-[10px] font-black uppercase mt-1">Add</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="submit" 
              disabled={isSaving}
              className="vibrant-btn vibrant-btn-primary flex-1 py-5 text-xl"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              <span>{entry ? 'UPDATE' : 'SAVE'}</span>
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="vibrant-btn flex-1 py-5 text-xl"
            >
              CANCEL
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
