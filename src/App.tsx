import { useState } from 'react';
import { auth, db } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Plus, 
  Search, 
  SortAsc, 
  Clock, 
  Loader2, 
  Sparkles, 
  LayoutGrid, 
  Heart, 
  Tag, 
  Download,
  Laptop,
  Smartphone,
  Tablet,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthGate from './components/AuthGate';
import JournalEntryCard from './components/JournalEntryCard';
import JournalEntryForm from './components/JournalEntryForm';
import { JournalEntry } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'title'>('createdAt');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Firestore query
  const entriesRef = collection(db, 'entries');
  const q = query(
    entriesRef,
    where('userId', '==', user?.uid || 'anonymous'),
    orderBy(sortField, sortField === 'createdAt' ? 'desc' : 'asc')
  );
  
  const [snapshot, loading, error] = useCollection(q);

  const entries = snapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as JournalEntry[] || [];

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSave = async (data: Partial<JournalEntry>) => {
    if (!user) return;

    if (editingEntry) {
      const docRef = doc(db, 'entries', editingEntry.id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(entriesRef, {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'entries', id));
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  return (
    <AuthGate>
      <div className="flex flex-col lg:flex-row min-h-screen bg-vp-bg p-4 lg:p-10 gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[500px] flex flex-col gap-10 shrink-0">
          <div className="flex flex-col gap-6">
            <h1 className="text-[22pt] sm:text-[40pt] lg:text-[50pt] font-jakarta sm:font-pixel font-black italic tracking-normal text-vp-ink leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis">
              Knowledge Journal 💗
            </h1>
            <p className="font-semibold text-base sm:text-[24pt] lg:text-[30pt] font-jakarta sm:font-sans leading-tight text-vp-ink opacity-60">
              An infinite chamber of curiosities that transcends conventional norms of learning.
            </p>
            <button 
                onClick={() => setIsFormOpen(true)}
                className="vibrant-btn vibrant-btn-primary !w-full !px-8 !rounded-2xl mt-4"
              >
                <Plus size={20} className="stroke-[3]" />
                NEW ENTRY
              </button>
          </div>

          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab('all')}
              className={cn("sidebar-item", activeTab === 'all' && "sidebar-item-active")}
            >
              <LayoutGrid size={20} />
              All Entries
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={cn("sidebar-item bg-white border-2 border-vp-ink opacity-60 hover:opacity-100", activeTab === 'favorites' && "sidebar-item-active opacity-100")}
            >
              <Heart size={20} />
              Favorites
            </button>
            <button 
              onClick={() => setActiveTab('tags')}
              className={cn("sidebar-item bg-white border-2 border-vp-ink opacity-60 hover:opacity-100", activeTab === 'tags' && "sidebar-item-active opacity-100")}
            >
              <Tag size={20} />
              Tags
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex flex-col gap-10">
          
          {/* Header Actions */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative flex-grow max-w-xl w-full">
              <input 
                type="text" 
                placeholder="SEARCH YOUR MIND..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vibrant-input pl-14"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" size={24} />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-xs opacity-20 hidden sm:block">⌘K</div>
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto items-center justify-center md:justify-end">
              <div className="flex border-3 border-vp-ink rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000]">
                <button 
                  onClick={() => setSortField('createdAt')}
                  className={cn(
                    "px-4 py-3 bg-white border-r-2 border-vp-ink hover:bg-gray-50 flex items-center gap-2 transition-colors",
                    sortField === 'createdAt' && "bg-vp-secondary"
                  )}
                  title="Sort by Date"
                >
                  <Clock size={18} />
                </button>
                <button 
                  onClick={() => setSortField('title')}
                  className={cn(
                    "px-4 py-3 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors",
                    sortField === 'title' && "bg-vp-secondary"
                  )}
                  title="Sort by Title"
                >
                  <SortAsc size={18} />
                </button>
              </div>

              <button className="vibrant-btn vibrant-btn-secondary !p-4 !rounded-2xl" title="Export Data">
                <Download size={20} />
              </button>

              <div className="flex items-center gap-2 bg-white border-3 border-vp-ink px-4 py-3 rounded-2xl shadow-[4px_4px_0px_#000]">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full border border-vp-ink",
                  loading ? "bg-vp-primary animate-pulse" : "bg-vp-accent2"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-vp-ink">
                  {loading ? 'SYNCING' : 'SYNCED'}
                </span>
              </div>

              <button 
                onClick={() => signOut(auth)}
                className="vibrant-btn vibrant-btn-secondary !shadow-[4px_4px_0px_#000] !px-4 !py-3 !text-xs !rounded-2xl"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden xl:inline">SIGN OUT</span>
              </button>
            </div>
          </header>

          <section className="flex-grow">
            {loading ? (
              <div className="flex justify-center py-40">
                <Loader2 className="w-16 h-16 text-vp-accent4 animate-spin stroke-[3]" />
              </div>
            ) : error ? (
              <div className="vibrant-card border-vp-accent3 p-10 max-w-md mx-auto text-center font-black text-xl italic text-vp-accent3">
                SYNC INTERRUPTED: {error.message}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-40 opacity-40 space-y-6">
                <div className="text-8xl animate-bounce">✨</div>
                <div className="space-y-2">
                  <p className="text-3xl font-black italic tracking-tight">THE CHAMBER IS EMPTY</p>
                  <p className="font-semibold text-lg max-w-xs mx-auto">Start recording your discoveries to see them flourish across your sync network.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry) => (
                    <JournalEntryCard 
                      key={entry.id}
                      entry={entry} 
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <JournalEntryForm 
            entry={editingEntry}
            onSave={handleSave}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>
    </AuthGate>
  );
}
