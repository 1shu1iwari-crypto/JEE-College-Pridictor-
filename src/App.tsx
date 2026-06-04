import { useState } from 'react';
import Home from './components/Home';
import PredictorForm from './components/PredictorForm';
import Results from './components/Results';
import type { UserInput } from './types';
import { GraduationCap } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'form' | 'results'>('home');
  const [selectedCounseling, setSelectedCounseling] = useState<string>('JoSAA');
  const [formData, setFormData] = useState<UserInput | null>(null);

  const handleCounselingSelect = (counseling: string) => {
    setSelectedCounseling(counseling);
    setCurrentView('form');
  };

  const handleFormSubmit = (data: UserInput) => {
    // Save to local storage
    const saved = localStorage.getItem('recentSearches');
    let searches: UserInput[] = saved ? JSON.parse(saved) : [];
    
    // Check if this search already exists
    const exists = searches.findIndex(s => 
      s.counseling === data.counseling && 
      s.rank === data.rank && 
      s.category === data.category && 
      s.gender === data.gender && 
      s.quota === data.quota && 
      s.preferredBranch === data.preferredBranch
    );
    
    if (exists !== -1) {
      searches.splice(exists, 1);
    }
    
    searches.unshift(data);
    localStorage.setItem('recentSearches', JSON.stringify(searches));

    setFormData(data);
    setCurrentView('results');
  };

  const handleRecentSearch = (data: UserInput) => {
    setSelectedCounseling(data.counseling);
    setFormData(data);
    setCurrentView('results');
  };

  const goHome = () => setCurrentView('home');

  return (
    <div className="app">
      <div className="container">
        <nav className="navbar">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={goHome}>
            <GraduationCap size={28} color="var(--primary)" />
            <span>EduPredict</span>
          </div>
          {currentView !== 'home' && (
            <button className="btn-outline" onClick={goHome}>
              Back to Home
            </button>
          )}
        </nav>

        <main style={{ paddingBottom: '60px' }}>
          {currentView === 'home' && (
            <Home onSelectCounseling={handleCounselingSelect} onSelectRecentSearch={handleRecentSearch} />
          )}
          
          {currentView === 'form' && (
            <PredictorForm 
              counseling={selectedCounseling} 
              onSubmit={handleFormSubmit} 
            />
          )}

          {currentView === 'results' && formData && (
            <Results formData={formData} onBack={() => setCurrentView('form')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
