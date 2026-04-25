/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { SellView } from './components/views/SellView';
import { StylerView } from './components/views/StylerView';
import { ProfileView } from './components/views/ProfileView';
import { CartView } from './components/views/CartView';
import { UserPostsView } from './components/views/UserPostsView';
import { UserProductsView } from './components/views/UserProductsView';
import { UserWardrobeView } from './components/views/UserWardrobeView';
import { AIConsultView } from './components/views/AIConsultView';
import { CategoryResultsView } from './components/views/CategoryResultsView';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScreen } from './components/SplashScreen';
import { View } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showSplash, setShowSplash] = useState(true);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveView('category-results');
  };

  const renderView = () => {
    switch (activeView) {
      case 'home': return <HomeView onViewChange={setActiveView} />;
      case 'search': return <SearchView onViewChange={setActiveView} onCategorySelect={handleCategorySelect} />;
      case 'sell': return <SellView onViewChange={setActiveView} />;
      case 'styler': return <StylerView onViewChange={setActiveView} />;
      case 'profile': return <ProfileView onViewChange={setActiveView} />;
      case 'cart': return <CartView onViewChange={setActiveView} />;
      case 'user-posts': return <UserPostsView onViewChange={setActiveView} />;
      case 'user-products': return <UserProductsView onViewChange={setActiveView} />;
      case 'user-wardrobe': return <UserWardrobeView onViewChange={setActiveView} />;
      case 'ai-consults': return <AIConsultView onViewChange={setActiveView} />;
      case 'category-results': return <CategoryResultsView category={selectedCategory} onViewChange={setActiveView} />;
      default: return <HomeView onViewChange={setActiveView} />;
    }
  };

  return (
    <AuthProvider>
      <SplashScreen onComplete={() => setShowSplash(false)} />
      {!showSplash && (
        <Layout>
          <main className="flex-1 relative z-10 overflow-y-auto pb-40 no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
          
          <Navigation activeView={activeView} onViewChange={setActiveView} />
        </Layout>
      )}
    </AuthProvider>
  );
}

