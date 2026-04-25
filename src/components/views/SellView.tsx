import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Package, Camera, Send, Loader2, Shirt, Plus, Tag, DollarSign, BrainCircuit } from 'lucide-react';
import { getAILabAdvice } from '../../services/gemini';
import Markdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { outfitService } from '../../services/outfitService';
import { wardrobeService } from '../../services/wardrobeService';
import { productService } from '../../services/productService';
import { consultService } from '../../services/consultService';

import { Logo } from '../common/Logo';
import { View } from '../../types';

interface SellViewProps {
  onViewChange: (view: View) => void;
}

export const SellView: React.FC<SellViewProps> = ({ onViewChange }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'lab' | 'fitcheck' | 'wardrobe' | 'list'>('lab');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [consultImage, setConsultImage] = useState<string | null>(null);
  const [isSavingConsult, setIsSavingConsult] = useState(false);

  // Fit Check State
  const [postImage, setPostImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Wardrobe State
  const [wardrobeImage, setWardrobeImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Tops');
  const [isAddingToWardrobe, setIsAddingToWardrobe] = useState(false);

  // Marketplace State
  const [listImage, setListImage] = useState<string | null>(null);
  const [listName, setListName] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listCategory, setListCategory] = useState('');
  const [isListing, setIsListing] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setConsultImage(base64);
      const advice = await getAILabAdvice(base64);
      setAiAdvice(advice);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFitCheckUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPostImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleWardrobePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setWardrobeImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleListPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setListImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConsult = async () => {
    if (!user || !consultImage || !aiAdvice) return;
    setIsSavingConsult(true);
    try {
      await consultService.saveConsult(user.uid, {
        type: 'styling', // Default to styling, could be logic to detect repair
        image: consultImage,
        response: aiAdvice
      });
      alert('Advice saved to your notes and you earned an Upcycle Point! 💎');
    } catch (error) {
      console.error('Error saving consult:', error);
      alert('Failed to save advice.');
    } finally {
      setIsSavingConsult(false);
    }
  };

  const handlePostFitCheck = async () => {
    if (!user || !profile || !postImage) return;

    setIsPosting(true);
    try {
      await outfitService.createFitCheck({
        userId: user.uid,
        userName: profile.name,
        userImage: profile.image,
        image: postImage,
        caption: caption,
        items: [],
        isPrivate: profile.isPrivate || false
      });
      setPostImage(null);
      setCaption('');
      alert('Fit check posted successfully!');
      onViewChange('home');
    } catch (error) {
      console.error('Error posting fit check:', error);
      alert('Failed to post fit check. Try a smaller image.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddToWardrobe = async () => {
    if (!user || !wardrobeImage || !itemName) return;

    setIsAddingToWardrobe(true);
    try {
      await wardrobeService.addToWardrobe(user.uid, {
        name: itemName,
        image: wardrobeImage,
        category: itemCategory
      });
      setWardrobeImage(null);
      setItemName('');
      alert('Added to your wardrobe!');
      onViewChange('styler');
    } catch (error) {
      console.error('Error adding to wardrobe:', error);
      alert('Failed to add item to wardrobe.');
    } finally {
      setIsAddingToWardrobe(false);
    }
  };

  const handleListProduct = async () => {
    if (!user || !profile || !listImage || !listName || !listPrice || !listCategory) return;

    setIsListing(true);
    try {
      await productService.createProduct({
        userId: user.uid,
        name: listName,
        price: parseFloat(listPrice),
        image: listImage,
        category: listCategory,
        seller: profile.name,
        sellerImage: profile.image,
        description: listDesc,
        isPrivate: profile.isPrivate || false
      });
      setListImage(null);
      setListName('');
      setListPrice('');
      setListDesc('');
      alert('Product listed successfully!');
      onViewChange('home');
    } catch (error) {
      console.error('Error listing product:', error);
      alert('Failed to list product.');
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="p-5 space-y-6">
      <header className="flex justify-between items-end">
        <Logo onClick={() => onViewChange('home')} />
        <button 
          onClick={() => onViewChange('profile')}
          className="w-10 h-10 bg-pink border-1.5 border-ink rounded-lg flex items-center justify-center text-sm shadow-[2px_2px_0px_#000] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
        >
          {profile?.image ? (
            <img src={profile.image} alt="Profile" className="w-full h-full rounded-md object-cover" />
          ) : '📸'}
        </button>
      </header>

      {/* Tab Switcher */}
      <div className="flex bg-white/50 p-1 rounded-xl border border-ink/10">
        <button 
          onClick={() => setActiveTab('lab')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-display font-bold uppercase transition-all ${
            activeTab === 'lab' ? 'bg-dark-green text-paper shadow-sm' : 'text-ink/40'
          }`}
        >
          Lab
        </button>
        <button 
          onClick={() => setActiveTab('fitcheck')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-display font-bold uppercase transition-all ${
            activeTab === 'fitcheck' ? 'bg-ink text-gold shadow-sm' : 'text-ink/40'
          }`}
        >
          Post Fit
        </button>
        <button 
          onClick={() => setActiveTab('wardrobe')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-display font-bold uppercase transition-all ${
            activeTab === 'wardrobe' ? 'bg-pink text-white shadow-sm' : 'text-ink/40'
          }`}
        >
          Wardrobe
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-display font-bold uppercase transition-all ${
            activeTab === 'list' ? 'bg-medium-green text-white shadow-sm' : 'text-ink/40'
          }`}
        >
          List
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'lab' ? (
          <motion.section 
            key="lab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-yellow border-2 border-ink p-5 rounded-[20px] relative"
          >
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-dark-green" size={24} />
                <h2 className="font-display text-lg font-black uppercase">The AI Fashion Lab</h2>
              </div>
              <p className="text-sm leading-tight opacity-90">Upload a photo for AI-powered repair blueprints or styling advice to level up your look.</p>
              
              {!aiAdvice ? (
                <label className="inline-block bg-dark-green text-paper px-4 py-2 rounded-full font-sans text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none transition-all">
                  {isAnalyzing ? 'Consulting AI...' : 'Begin Consultation'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isAnalyzing} />
                </label>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/30 p-4 rounded-xl border border-ink/10 space-y-4"
                >
                  <h3 className="font-display text-sm font-bold uppercase text-dark-green flex items-center gap-2">
                    <Sparkles size={14} /> AI Recommendation
                  </h3>
                  
                  <div className="markdown-body font-serif text-sm leading-relaxed text-ink/80">
                    <Markdown>{aiAdvice}</Markdown>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setAiAdvice(null)}
                      className="flex-1 bg-white/40 text-[10px] font-sans font-bold uppercase tracking-widest text-dark-green p-2 rounded-lg border border-ink/10"
                    >
                      New Session
                    </button>
                    <button 
                      onClick={handleSaveConsult}
                      disabled={isSavingConsult}
                      className="flex-1 bg-dark-green text-white text-[10px] font-sans font-bold uppercase tracking-widest p-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isSavingConsult ? <Loader2 size={12} className="animate-spin" /> : null}
                      Save Notes
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        ) : activeTab === 'fitcheck' ? (
          <motion.section 
            key="fitcheck"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-purple/20 border-2 border-ink p-5 rounded-[20px] space-y-4"
          >
            <h2 className="font-display text-lg font-black uppercase text-purple">Share Your Look</h2>
            
            <div className="aspect-[4/5] bg-white rounded-xl border-2 border-ink border-dashed flex items-center justify-center relative overflow-hidden group">
              {postImage ? (
                <img src={postImage} alt="Post preview" className="w-full h-full object-cover" />
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer outline-none">
                  <div className="w-12 h-12 bg-purple/10 text-purple rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink/40">Upload Fit Check</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFitCheckUpload} />
                </label>
              )}
              {postImage && (
                <button 
                  onClick={() => setPostImage(null)}
                  className="absolute top-2 right-2 bg-pink text-white w-6 h-6 rounded-full border border-ink flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {postImage && (
              <div className="space-y-3">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell us about the outfit..."
                  className="w-full bg-white/50 border-1.5 border-ink rounded-lg p-3 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-purple/20 min-h-[80px]"
                />
                <button 
                   onClick={handlePostFitCheck}
                   disabled={isPosting}
                   className="w-full bg-dark-green text-paper py-4 rounded-xl font-display font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  {isPosting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  {isPosting ? 'Posting...' : 'Share with Community'}
                </button>
              </div>
            )}
          </motion.section>
        ) : activeTab === 'wardrobe' ? (
          <motion.section 
            key="wardrobe"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-pink/10 border-2 border-ink p-5 rounded-[20px] space-y-4"
          >
            <h2 className="font-display text-lg font-black uppercase text-pink">Digital Closet</h2>
            <p className="text-xs font-serif opacity-70 italic">Add your own pieces to curate your virtual wardrobe.</p>
            
            <div className="aspect-square bg-white rounded-xl border-2 border-ink border-dashed flex items-center justify-center relative overflow-hidden group">
              {wardrobeImage ? (
                <img src={wardrobeImage} alt="Wardrobe piece" className="w-full h-full object-cover" />
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer outline-none">
                  <div className="w-12 h-12 bg-pink/10 text-pink rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shirt size={24} />
                  </div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink/40">Upload Clothes</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleWardrobePhotoUpload} />
                </label>
              )}
            </div>

            {wardrobeImage && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Name of item (e.g. Blue Denim Jacket)"
                  className="w-full bg-white border-1.5 border-ink rounded-lg px-4 py-3 text-sm font-display font-bold"
                />
                <select 
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full bg-white border-1.5 border-ink rounded-lg px-4 py-3 text-sm font-display font-bold appearance-none"
                >
                  {['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Accessories', 'Shoes'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button 
                  onClick={handleAddToWardrobe}
                  disabled={isAddingToWardrobe || !itemName}
                  className="w-full bg-pink text-white py-4 rounded-xl font-display font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Plus size={20} />
                  {isAddingToWardrobe ? 'Adding...' : 'Add to Closet'}
                </button>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section 
            key="list"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-medium-green/10 border-2 border-ink p-5 rounded-[20px] space-y-4"
          >
            <h2 className="font-display text-lg font-black uppercase text-medium-green">Seller Marketplace</h2>
            <p className="text-xs font-serif opacity-70 italic">List your pre-loved gems for others to discover.</p>
            
            <div className="aspect-square bg-white rounded-xl border-2 border-ink border-dashed flex items-center justify-center relative overflow-hidden group">
              {listImage ? (
                <img src={listImage} alt="Listing piece" className="w-full h-full object-cover" />
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer outline-none">
                  <div className="w-12 h-12 bg-medium-green/10 text-medium-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag size={24} />
                  </div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink/40">Upload Product image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleListPhotoUpload} />
                </label>
              )}
            </div>

            {listImage && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Product Name"
                  className="w-full bg-white border-1.5 border-ink rounded-lg px-4 py-3 text-sm font-display font-bold"
                />
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full bg-white border-1.5 border-ink rounded-lg pl-10 pr-4 py-3 text-sm font-display font-bold"
                  />
                </div>
                <select 
                  value={listCategory}
                  onChange={(e) => setListCategory(e.target.value)}
                  className={`w-full bg-white border-1.5 border-ink rounded-lg px-4 py-3 text-sm font-display font-bold appearance-none ${!listCategory ? 'text-ink/30' : 'text-ink'}`}
                >
                  <option value="" disabled>Select Category</option>
                  {['Outerwear', 'Dresses', 'Accessories', 'Pants', 'Tops', 'Shoes'].map(cat => (
                    <option key={cat} value={cat} className="text-ink">{cat}</option>
                  ))}
                </select>
                <textarea
                  value={listDesc}
                  onChange={(e) => setListDesc(e.target.value)}
                  placeholder="Describe your item..."
                  className="w-full bg-white border-1.5 border-ink rounded-lg p-3 text-xs font-serif min-h-[60px]"
                />
                <button 
                  onClick={handleListProduct}
                  disabled={isListing || !listName || !listPrice || !listCategory}
                  className="w-full bg-medium-green text-white py-4 rounded-xl font-display font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Send size={20} />
                  {isListing ? 'Listing...' : 'Post to Shop'}
                </button>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Management */}
      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold text-ink/40 uppercase tracking-tighter">Management</h3>
        <div className="space-y-3">
          <button 
            onClick={() => onViewChange('profile')}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border-1.5 border-ink hard-shadow group active:translate-y-[2px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange/20 p-2 rounded-lg text-orange group-hover:scale-110 transition-transform">
                <Package size={20} />
              </div>
              <span className="font-display font-bold">Inventory Dashboard</span>
            </div>
            <ArrowRight size={16} className="text-ink/20" />
          </button>
        </div>
      </section>
    </div>
  );
};
