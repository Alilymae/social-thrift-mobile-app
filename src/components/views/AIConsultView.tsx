import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { consultService } from '../../services/consultService';
import { AIConsult, View } from '../../types';
import { ArrowLeft, BrainCircuit, Sparkles, Calendar, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import Markdown from 'react-markdown';

interface AIConsultViewProps {
  onViewChange: (view: View) => void;
}

export const AIConsultView: React.FC<AIConsultViewProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const [consults, setConsults] = useState<AIConsult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsult, setSelectedConsult] = useState<AIConsult | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = consultService.subscribeToUserConsults(user.uid, (data) => {
      setConsults(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-5 flex flex-col h-full bg-paper relative">
      <header className="flex justify-between items-end mb-6">
        <Logo onClick={() => onViewChange('home')} />
        <button 
          onClick={() => onViewChange('profile')}
          className="w-10 h-10 bg-paper border-1.5 border-ink rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
      </header>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-yellow rounded-xl border-1.5 border-ink flex items-center justify-center text-dark-green">
          <BrainCircuit size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-black uppercase text-dark-green leading-none">Your AI Lab Notes</h1>
          <p className="text-xs font-serif text-ink/60 italic">Saved blueprints and styling advice</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-dark-green border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-dark-green">Loading Consults...</p>
          </div>
        ) : consults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white border-2 border-ink rounded-full flex items-center justify-center text-4xl hard-shadow opacity-20">
              🧪
            </div>
            <p className="font-serif text-ink/60 italic max-w-[200px]">
              No saved consultations yet. Visit the AI Lab to start a session!
            </p>
            <button 
              onClick={() => onViewChange('sell')}
              className="bg-dark-green text-paper px-6 py-3 rounded-xl font-display font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform shadow-md"
            >
              Go to AI Lab
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {consults.map((consult, index) => (
              <motion.div
                key={consult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-1.5 border-ink rounded-[24px] overflow-hidden hard-shadow flex flex-col"
              >
                <div className="flex items-start gap-4 p-4">
                  <img 
                    src={consult.image} 
                    alt="Consult Source" 
                    className="w-20 h-20 rounded-xl object-cover border-1.5 border-ink shadow-sm cursor-pointer"
                    onClick={() => setSelectedConsult(consult)}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-sans font-bold uppercase px-2 py-1 rounded-full border border-ink/10 ${
                        consult.type === 'repair' ? 'bg-medium-green/10 text-medium-green' : 'bg-purple/10 text-purple'
                      }`}>
                        {consult.type === 'repair' ? 'Repair Blueprint' : 'Styling Insight'}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] text-ink/40 font-sans italic">
                        <Calendar size={10} />
                        {new Date(consult.createdAt?.toDate?.() || consult.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="markdown-body font-serif text-xs leading-relaxed text-ink/80 max-h-[80px] overflow-hidden relative">
                      <Markdown>{consult.response}</Markdown>
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent" />
                    </div>
                  </div>
                </div>
                
                <button 
                   onClick={() => setSelectedConsult(consult)}
                   className="w-full bg-paper py-3 border-t border-ink/5 text-[10px] font-sans font-bold uppercase tracking-widest text-ink/40 hover:text-dark-green transition-colors"
                >
                  View Full Report
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {selectedConsult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedConsult(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-paper w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border-2 border-ink shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full bg-ink/5">
                <img 
                  src={selectedConsult.image} 
                  alt="Consult Context" 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedConsult(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white border-1.5 border-ink rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`text-[10px] font-sans font-bold uppercase px-3 py-1.5 rounded-full border border-ink/20 shadow-sm ${
                    selectedConsult.type === 'repair' ? 'bg-medium-green text-white' : 'bg-purple text-white'
                  }`}>
                    {selectedConsult.type === 'repair' ? 'Repair Blueprint' : 'Styling Insight'}
                  </span>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-center gap-2 text-ink/40 font-sans text-xs italic">
                  <Calendar size={14} />
                  {new Date(selectedConsult.createdAt?.toDate?.() || selectedConsult.createdAt).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>

                <div className="flex items-center gap-2 pb-2 border-b border-ink/5">
                  <Sparkles size={18} className="text-yellow" />
                  <h2 className="font-display font-black uppercase text-lg text-dark-green tracking-tight">AI Analysis Results</h2>
                </div>

                <div className="markdown-body font-serif text-sm leading-relaxed text-ink/80 pb-10">
                  <Markdown>{selectedConsult.response}</Markdown>
                </div>
              </div>

              <div className="p-4 bg-paper border-t border-ink/5">
                <button 
                  onClick={() => setSelectedConsult(null)}
                  className="w-full bg-dark-green text-paper py-4 rounded-2xl font-display font-bold uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Got it, Thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
