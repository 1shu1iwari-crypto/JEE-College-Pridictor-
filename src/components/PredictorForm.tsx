import React, { useState, useEffect } from 'react';
import type { UserInput } from '../types';
import { Search } from 'lucide-react';

interface PredictorFormProps {
  counseling: string;
  onSubmit: (data: UserInput) => void;
}

const ALL_INSTITUTES = ['IIT', 'NIT', 'IIIT', 'GFTI'];

const STATES = [
  'None', 'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const PredictorForm: React.FC<PredictorFormProps> = ({ counseling, onSubmit }) => {
  const [rank, setRank] = useState<string>('');
  const [category, setCategory] = useState<string>('OPEN');
  const [gender, setGender] = useState<string>('Gender-Neutral');
  const [homeState, setHomeState] = useState<string>('None');
  const [preferredBranch, setPreferredBranch] = useState<string>('Any');
  const [instituteTypes, setInstituteTypes] = useState<string[]>(ALL_INSTITUTES);
  const maxRounds = counseling === 'CSAB' ? 3 : 6;
  const [round, setRound] = useState<string>(maxRounds.toString());

  useEffect(() => {
    if (Number(round) > maxRounds) {
      setRound(maxRounds.toString());
    }
  }, [counseling, maxRounds, round]);

  const handleInstituteToggle = (type: string) => {
    if (type === 'ALL') {
      if (instituteTypes.length === ALL_INSTITUTES.length) {
        setInstituteTypes([]);
      } else {
        setInstituteTypes(ALL_INSTITUTES);
      }
      return;
    }

    if (instituteTypes.includes(type)) {
      setInstituteTypes(instituteTypes.filter(t => t !== type));
    } else {
      setInstituteTypes([...instituteTypes, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || isNaN(Number(rank))) return;
    
    onSubmit({
      counseling,
      round,
      rank: Number(rank),
      category,
      gender,
      quota: homeState !== 'None' ? 'HS' : 'AI', // Legacy fallback
      homeState,
      preferredBranch: preferredBranch === 'Any' ? '' : preferredBranch,
      instituteTypes
    });
  };

  const branches = [
    'Any',
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Data Science and Artificial Intelligence',
    'Mathematics and Computing'
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '8px' }}>{counseling} Predictor</h2>
        <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
          Enter your details below to find the best colleges for you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Rank (CRL or Category Rank)</label>
            <input 
              type="number" 
              placeholder="e.g. 5000" 
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              required
              min="1"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category / Seat Type</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="OPEN">OPEN (General)</option>
                <option value="EWS">EWS</option>
                <option value="OBC-NCL">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Gender-Neutral">Gender-Neutral (Boys/Girls)</option>
                <option value="Female-only (including Supernumerary)">Female Only</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Home State</label>
              <select value={homeState} onChange={(e) => setHomeState(e.target.value)}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Round</label>
              <select value={round} onChange={(e) => setRound(e.target.value)}>
                {Array.from({ length: maxRounds }, (_, i) => i + 1).map(r => (
                  <option key={r} value={r}>Round {r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Branch</label>
            <select value={preferredBranch} onChange={(e) => setPreferredBranch(e.target.value)}>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Institutes</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={instituteTypes.length === ALL_INSTITUTES.length} 
                  onChange={() => handleInstituteToggle('ALL')} 
                /> ALL
              </label>
              {ALL_INSTITUTES.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={instituteTypes.includes(type)} 
                    onChange={() => handleInstituteToggle(type)} 
                  /> {type}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            <Search size={18} /> Find Colleges
          </button>
        </form>
      </div>
    </div>
  );
};

export default PredictorForm;
