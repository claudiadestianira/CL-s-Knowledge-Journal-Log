import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { motion } from 'motion/react';
import { Calendar, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface JournalEntryCardProps {
  key?: string;
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export default function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const images = entry.imageUrls || [];
  const dateStr = entry.createdAt?.toDate().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) || 'Just now';

  // Cycle through accent shadow colors based on id length or similar
  const shadowColors = ['#114B5F', '#456990', '#F45B69', '#6B2737'];
  const shadowColor = shadowColors[entry.id.length % shadowColors.length];
  const accentTextColor = ['text-[#114B5F]', 'text-[#456990]', 'text-[#F45B69]', 'text-[#6B2737]'][entry.id.length % 4];

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="vibrant-card !shadow-[6px_6px_0px_var(--shadow)] border-vp-ink group hover:-translate-y-1 transition-transform relative"
      style={{ '--shadow': shadowColor } as any}
    >
      {/* Delete Confirmation Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 bg-white/95 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center">
          <p className="font-black text-xl text-vp-ink mb-6 leading-tight italic">
            DELETE THIS ENTRY?<br/>THIS CANNOT BE UNDONE.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => onDelete(entry.id)}
              className="vibrant-btn vibrant-btn-primary !bg-vp-accent3 !px-6"
            >
              DELETE
            </button>
            <button 
              onClick={() => setShowConfirmDelete(false)}
              className="vibrant-btn !px-6"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Image Slider */}
      {images.length > 0 && (
        <div className="relative aspect-square sm:aspect-video bg-gray-50 overflow-hidden border-b-3 border-vp-ink rounded-t-[2.5rem]">
          <motion.img
            key={currentImgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={images[currentImgIndex]}
            alt={entry.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {images.length > 1 && (
            <>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                <button 
                  onClick={prevImg}
                  className="vibrant-btn !p-2 !shadow-[2px_2px_0px_#000] !rounded-full pointer-events-auto bg-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={nextImg}
                  className="vibrant-btn !p-2 !shadow-[2px_2px_0px_#000] !rounded-full pointer-events-auto bg-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <span className={cn("text-[11px] font-black uppercase tracking-widest", accentTextColor)}>
            {dateStr} • {entry.tags[0] || 'GENERAL'}
          </span>
          <div className="w-10 h-10 bg-vp-secondary border-2 border-vp-ink rounded-full flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
            {entry.title.charAt(0).toUpperCase()}
          </div>
        </div>

        <h3 className="text-2xl font-black leading-tight text-vp-ink">
          {entry.title}
        </h3>

        <p className={cn(
          "text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap overflow-hidden relative",
          !isExpanded && "max-h-24"
        )}>
          {entry.notes}
        </p>

        {entry.notes.length > 200 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-black uppercase tracking-widest text-vp-accent4 hover:underline"
          >
            {isExpanded ? "▲ COLLAPSE" : "▼ READ MORE"}
          </button>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {entry.tags.map((tag) => (
            <span key={tag} className="bg-vp-ink text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-8 pb-8 flex gap-3">
        <button 
          onClick={() => onEdit(entry)}
          className="vibrant-btn !py-2 !px-4 !text-[10px] !shadow-[2px_2px_0px_#000]"
        >
          <Edit3 size={12} />
          EDIT
        </button>
        <button 
          onClick={() => setShowConfirmDelete(true)}
          className="vibrant-btn vibrant-btn-primary !bg-vp-accent3 !py-2 !px-4 !text-[10px] !shadow-[2px_2px_0px_#000]"
        >
          <Trash2 size={12} />
          DELETE
        </button>
      </div>
    </motion.div>
  );
}
