import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { CARS_INVENTORY as DEFAULT_CARS_INVENTORY } from './data/cars';
import { Car, FilterState } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InventorySection } from './components/InventorySection';
import { InventoryPage } from './components/InventoryPage';
import { FinancingAndTradeSection } from './components/FinancingAndTradeSection';
import { AboutUsSection } from './components/AboutUsSection';
import { CustomerReviews } from './components/CustomerReviews';
import { ShowroomContact } from './components/ShowroomContact';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { fetchAllVehicles, recordSiteEvent } from './lib/supabase';

// Lazy load heavy modal & portal components for instant initial page loading and maximum fluidity
const AdminPortal = lazy(() => import('./components/admin/AdminPortal').then(m => ({ default: m.AdminPortal })));
const CarDetailModal = lazy(() => import('./components/CarDetailModal').then(m => ({ default: m.CarDetailModal })));
const ComparisonDrawer = lazy(() => import('./components/ComparisonDrawer').then(m => ({ default: m.ComparisonDrawer })));
const TestDriveModal = lazy(() => import('./components/TestDriveModal').then(m => ({ default: m.TestDriveModal })));
const FavoritesDrawer = lazy(() => import('./components/FavoritesDrawer').then(m => ({ default: m.FavoritesDrawer })));

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  brand: '',
  category: '',
  minPrice: 0,
  maxPrice: 1000000,
  minYear: 1900,
  maxYear: 2035,
  transmission: '',
  fuel: '',
  maxMileage: 150000,
  onlyUniqueOwner: false,
  onlyArmor: false,
  sortBy: 'featured'
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'stock'>('home');
  const [financialTab, setFinancialTab] = useState<'financing' | 'trade-in'>('financing');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  
  // Hidden Admin Portal State
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Dynamic inventory (synced with Supabase / local storage)
  const [inventoryCars, setInventoryCars] = useState<Car[]>(DEFAULT_CARS_INVENTORY);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('f2k_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [comparedCars, setComparedCars] = useState<string[]>([]);
  
  // Modals & Drawers state
  const [selectedCarForDetail, setSelectedCarForDetail] = useState<Car | null>(null);
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] = useState<Car | null>(null);
  const [selectedCarForFinancing, setSelectedCarForFinancing] = useState<Car | null>(null);
  
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // -------------------------------------------------------------
  // DETECÇÃO DE URL PARA O PORTAL ADMINISTRATIVO (/admin) E ATALHO
  // -------------------------------------------------------------
  const checkHiddenAdminUrl = () => {
    const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    const isSecretUrl = 
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname.includes('/admin-f2k') || 
      pathname.includes('/f2k-admin') || 
      pathname.includes('/portal-f2k') ||
      pathname.includes('/gestao-f2k') ||
      hash === '#/admin' ||
      hash === '#admin' ||
      hash.includes('admin-f2k') || 
      hash.includes('f2k-admin') ||
      hash.includes('portal-f2k') ||
      search.includes('portal=admin') ||
      search.includes('admin=f2k');

    if (isSecretUrl) {
      setIsAdminPortalOpen(true);
    }
  };

  useEffect(() => {
    checkHiddenAdminUrl();

    const handleLocationChange = () => {
      checkHiddenAdminUrl();
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Atalho de teclado: Ctrl+Shift+A ou Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminPortalOpen(prev => {
          const next = !prev;
          if (next) {
            window.history.pushState({}, '', '/admin');
          } else {
            window.history.pushState({}, '', '/');
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Carregar estoque sincronizado do Supabase
  useEffect(() => {
    fetchAllVehicles().then(cars => {
      if (cars && cars.length > 0) {
        setInventoryCars(cars);
      }
    }).catch(console.error);
  }, [isAdminPortalOpen]);

  // Gravar métrica de visita / fluxo
  useEffect(() => {
    if (!isAdminPortalOpen) {
      recordSiteEvent({
        event_type: 'page_view',
        path: currentView === 'stock' ? '/estoque' : '/',
        metadata: { view: currentView }
      }).catch(console.error);
    }
  }, [currentView, isAdminPortalOpen]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('f2k_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Memoized Filtered & Sorted cars logic to avoid recalculations on unrelated state changes
  const filteredCars = useMemo(() => {
    return inventoryCars.filter((car) => {
      // Search query match
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchBrand = car.brand.toLowerCase().includes(query);
        const matchModel = car.model.toLowerCase().includes(query);
        const matchVersion = car.version.toLowerCase().includes(query);
        const matchTags = car.tags.some(t => t.toLowerCase().includes(query));
        if (!matchBrand && !matchModel && !matchVersion && !matchTags) return false;
      }

      // Brand
      if (filters.brand && car.brand.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }

      // Category
      if (filters.category && car.category !== filters.category) {
        return false;
      }

      // Price
      if (car.price < filters.minPrice || (filters.maxPrice < 1000000 && car.price > filters.maxPrice)) {
        return false;
      }

      // Year
      if (filters.minYear > 1900 && car.yearFabrication < filters.minYear) {
        return false;
      }
      if (filters.maxYear < 2035 && car.yearFabrication > filters.maxYear) {
        return false;
      }

      // Mileage
      if (filters.maxMileage < 150000 && car.mileage > filters.maxMileage) {
        return false;
      }

      // Fuel
      if (filters.fuel && car.fuel !== filters.fuel) {
        return false;
      }

      // Transmission
      if (filters.transmission && car.transmission !== filters.transmission) {
        return false;
      }

      // Unique Owner
      if (filters.onlyUniqueOwner && !car.history?.unicoDono) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'year-desc') return b.yearFabrication - a.yearFabrication;
      if (filters.sortBy === 'km-asc') return a.mileage - b.mileage;
      // 'featured'
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [inventoryCars, filters]);

  const handleToggleFavorite = useCallback((carId: string) => {
    setFavorites(prev => 
      prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
    );
  }, []);

  const handleToggleCompare = useCallback((carId: string) => {
    setComparedCars(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      }
      if (prev.length >= 3) {
        setIsComparisonOpen(true);
        return prev;
      }
      const updated = [...prev, carId];
      if (updated.length >= 2) {
        setIsComparisonOpen(true);
      }
      return updated;
    });
  }, []);

  const handleQuickSearch = useCallback((brand: string, category: string, maxPrice: number) => {
    setFilters(prev => ({
      ...prev,
      brand,
      category,
      maxPrice: maxPrice > 0 ? maxPrice : 1000000
    }));

    // Redirect directly to the dedicated Stock page
    setCurrentView('stock');
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    if (sectionId === 'estoque') {
      setCurrentView('stock');
      return;
    }

    if (sectionId === 'avaliacao') {
      setFinancialTab('trade-in');
    } else if (sectionId === 'simulador') {
      setFinancialTab('financing');
    }

    // If on stock page and navigating to a home section (hero, sobre, simulador, contato)
    if (currentView === 'stock') {
      setCurrentView('home');
      setTimeout(() => {
        const targetId = sectionId === 'avaliacao' ? 'simulador' : sectionId;
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const targetId = sectionId === 'avaliacao' ? 'simulador' : sectionId;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentView]);

  const handleOpenFinancingForCar = useCallback((car: Car) => {
    setSelectedCarForDetail(null);
    setSelectedCarForFinancing(car);
    setFinancialTab('financing');
    if (currentView === 'stock') {
      setCurrentView('home');
    }
    setTimeout(() => {
      const simEl = document.getElementById('simulador');
      if (simEl) {
        simEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }, [currentView]);

  const handleViewCarDetails = useCallback((car: Car) => {
    setSelectedCarForDetail(car);
    // Gravar métrica de visualização de veículo no fluxo
    recordSiteEvent({
      event_type: 'car_view',
      car_id: car.id,
      metadata: {
        model: `${car.brand} ${car.model}`,
        price: car.price
      }
    }).catch(console.error);
  }, []);

  // Full cars list for favorites & comparison
  const favoriteCarsList = useMemo(() => inventoryCars.filter(c => favorites.includes(c.id)), [inventoryCars, favorites]);
  const comparedCarsList = useMemo(() => inventoryCars.filter(c => comparedCars.includes(c.id)), [inventoryCars, comparedCars]);

  // -------------------------------------------------------------
  // RENDERIZAÇÃO DO PORTAL ESCONDIDO (SE ACESSADO PELA URL ESCONDIDA)
  // -------------------------------------------------------------
  if (isAdminPortalOpen) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-[#070707] flex items-center justify-center text-white">
          <div className="flex items-center gap-3 font-mono text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span>Carregando Portal Seguro F2K...</span>
          </div>
        </div>
      }>
        <AdminPortal
          onBackToSite={() => {
            setIsAdminPortalOpen(false);
            // Limpa URL para a home pública
            window.history.pushState({}, '', '/');
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-zinc-950 font-sans antialiased">
      
      {/* Header Navigation */}
      <Navbar
        favoritesCount={favorites.length}
        comparisonCount={comparedCars.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Main View Switching: Home Page vs Dedicated Stock Page */}
      {currentView === 'stock' ? (
        <InventoryPage
          cars={filteredCars}
          filters={filters}
          favorites={favorites}
          comparedCars={comparedCars}
          onUpdateFilters={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
          onToggleFavorite={handleToggleFavorite}
          onToggleCompare={handleToggleCompare}
          onViewDetails={handleViewCarDetails}
          onScheduleTestDrive={(car) => setSelectedCarForTestDrive(car)}
          onBackToHome={() => setCurrentView('home')}
        />
      ) : (
        <>
          {/* Hero Showcase with Fast Search */}
          <Hero
            cars={inventoryCars}
            onQuickSearch={handleQuickSearch}
            onExploreClick={() => setCurrentView('stock')}
            onSimulateClick={() => handleNavigate('simulador')}
          />

          {/* Vehicle Highlights & Top 4 Quadros */}
          <InventorySection
            cars={filteredCars}
            filters={filters}
            favorites={favorites}
            comparedCars={comparedCars}
            onUpdateFilters={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
            onResetFilters={() => setFilters(INITIAL_FILTERS)}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            onViewDetails={handleViewCarDetails}
            onScheduleTestDrive={(car) => setSelectedCarForTestDrive(car)}
            onNavigateToStock={() => setCurrentView('stock')}
          />

          {/* Unified Financing & Trade-In Section */}
          <FinancingAndTradeSection
            cars={inventoryCars}
            initialCar={selectedCarForFinancing}
            initialTab={financialTab}
            onSelectCarToView={handleViewCarDetails}
          />

          {/* About Us F2K Motors Section */}
          <AboutUsSection />

          {/* Customer Reviews & Google Rating */}
          <CustomerReviews />

          {/* Showroom Map & Contact */}
          <ShowroomContact />
        </>
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals and Drawers with Lazy Loading & Suspense */}
      <Suspense fallback={null}>
        {selectedCarForDetail && (
          <CarDetailModal
            car={selectedCarForDetail}
            isOpen={Boolean(selectedCarForDetail)}
            isFavorite={favorites.includes(selectedCarForDetail.id)}
            isCompared={comparedCars.includes(selectedCarForDetail.id)}
            onClose={() => setSelectedCarForDetail(null)}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            onScheduleTestDrive={(car) => {
              setSelectedCarForDetail(null);
              setSelectedCarForTestDrive(car);
            }}
            onOpenFinancingForCar={handleOpenFinancingForCar}
          />
        )}

        {selectedCarForTestDrive && (
          <TestDriveModal
            isOpen={Boolean(selectedCarForTestDrive)}
            car={selectedCarForTestDrive}
            cars={inventoryCars}
            onClose={() => setSelectedCarForTestDrive(null)}
          />
        )}

        {isComparisonOpen && (
          <ComparisonDrawer
            isOpen={isComparisonOpen}
            comparedCars={comparedCarsList}
            onClose={() => setIsComparisonOpen(false)}
            onRemoveCar={(carId) => setComparedCars(prev => prev.filter(id => id !== carId))}
            onClearAll={() => setComparedCars([])}
            onViewCarDetails={handleViewCarDetails}
          />
        )}

        {isFavoritesOpen && (
          <FavoritesDrawer
            isOpen={isFavoritesOpen}
            favorites={favoriteCarsList}
            onClose={() => setIsFavoritesOpen(false)}
            onRemoveFavorite={handleToggleFavorite}
            onClearFavorites={() => setFavorites([])}
            onViewCar={handleViewCarDetails}
          />
        )}
      </Suspense>

      {/* Floating WhatsApp Quick Bubble */}
      <FloatingWhatsApp />

    </div>
  );
}

