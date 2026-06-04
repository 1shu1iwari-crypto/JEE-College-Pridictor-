import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Map, Clock } from 'lucide-react';
import type { UserInput } from '../types';

interface HomeProps {
  onSelectCounseling: (counseling: string) => void;
  onSelectRecentSearch: (search: UserInput) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectCounseling, onSelectRecentSearch }) => {
  const [recentSearches, setRecentSearches] = useState<UserInput[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Find Your Dream College</h1>
      <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '48px', lineHeight: '1.6' }}>
        Enter your entrance exam rank and discover the engineering colleges and branches you are most likely to get. Backed by real cutoffs and placement data.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', textAlign: 'left', marginBottom: '48px' }}>
        <div 
          className="card card-hover" 
          style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={() => onSelectCounseling('JoSAA')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', color: 'var(--primary)' }}>
              <BookOpen size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>JoSAA 2025</h2>
          </div>
          <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
            Predict admissions for IITs, NITs, IIITs, and GFTIs based on JEE Main & Advanced ranks.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem' }}>
            Start Prediction <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </div>
        </div>

        <div 
          className="card card-hover" 
          style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={() => onSelectCounseling('CSAB')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '12px', color: '#c026d3' }}>
              <Map size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>CSAB Special</h2>
          </div>
          <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
            Special round counseling for NITs, IIITs, and GFTIs. Predict seats available after JoSAA.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#c026d3', fontWeight: 500, fontSize: '0.9rem' }}>
            Start Prediction <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </div>
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--text-muted)" /> Recent Searches
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {recentSearches.slice(0, 5).map((search, idx) => (
              <div 
                key={idx} 
                className="card card-hover" 
                style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                onClick={() => onSelectRecentSearch(search)}
              >
                <strong>{search.rank}</strong> 
                <span className="text-muted">({search.category}, {search.quota})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
