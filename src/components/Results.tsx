import React, { useEffect, useState } from 'react';
import type { CollegeData, UserInput } from '../types';
import { ArrowLeft, Building, Download, BarChart2, X } from 'lucide-react';

interface ResultsProps {
  formData: UserInput;
  onBack: () => void;
}

const NIT_STATES: Record<string, string> = {
  'NIT Trichy': 'Tamil Nadu', 'NIT Surathkal': 'Karnataka', 'NIT Warangal': 'Telangana',
  'VNIT Nagpur': 'Maharashtra', 'SVNIT Surat': 'Gujarat', 'MNNIT Allahabad': 'Uttar Pradesh',
  'NIT Jalandhar': 'Punjab', 'NIT Patna': 'Bihar', 'NIT Hamirpur': 'Himachal Pradesh',
  'NIT Srinagar': 'Jammu and Kashmir', 'NIT Manipur': 'Manipur', 'NIT Mizoram': 'Mizoram',
  'NIT Andhra Pradesh': 'Andhra Pradesh', 'NIT Jamshedpur': 'Jharkhand', 'NIT Uttarakhand': 'Uttarakhand',
  'NIT Kurukshetra': 'Haryana', 'NIT Rourkela': 'Odisha', 'NIT Silchar': 'Assam',
  'NIT Durgapur': 'West Bengal', 'NIT Calicut': 'Kerala', 'NIT Raipur': 'Chhattisgarh',
  'NIT Agartala': 'Tripura', 'NIT Goa': 'Goa', 'NIT Meghalaya': 'Meghalaya',
  'NIT Nagaland': 'Nagaland', 'NIT Sikkim': 'Sikkim', 'NIT Arunachal Pradesh': 'Arunachal Pradesh',
  'NIT Delhi': 'Delhi', 'NIT Puducherry': 'Puducherry', 'MANIT Bhopal': 'Madhya Pradesh',
  'MNIT Jaipur': 'Rajasthan'
};

const getInstType = (name: string) => {
  if (name.includes('IIT ') && !name.includes('IIIT')) return 'IIT';
  if (name.includes('IIIT ') || name.includes('IIITM')) return 'IIIT';
  if (name.includes('NIT ') || ['VNIT', 'SVNIT', 'MNNIT', 'MANIT', 'MNIT'].some(n => name.includes(n))) return 'NIT';
  return 'GFTI';
};

const Results: React.FC<ResultsProps> = ({ formData, onBack }) => {
  const [data, setData] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<CollegeData[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const prefix = formData.counseling === 'CSAB' ? 'csab' : 'josaa';
    const dataUrl = `/${prefix}_round${formData.round}.json`;
    fetch(dataUrl)
      .then(res => res.json())
      .then((jsonData: CollegeData[]) => {
        const filtered = jsonData.filter(item => {
          if (item.seatType !== formData.category && item.seatType !== `${formData.category} (PwD)`) return false;
          if (item.gender !== formData.gender) return false;

          const itemType = getInstType(item.institute);
          if (formData.instituteTypes && formData.instituteTypes.length > 0 && !formData.instituteTypes.includes(itemType)) return false;

          if (item.quota === 'HS') {
            if (formData.homeState === 'None') return false; // Show OS/AI by default
            const instState = NIT_STATES[item.institute];
            if (instState && instState !== formData.homeState) return false;
          } else if (item.quota === 'OS') {
            const instState = NIT_STATES[item.institute];
            if (instState && instState === formData.homeState) return false;
          }
          if (formData.preferredBranch && item.program !== formData.preferredBranch) {
            if (!item.program.toLowerCase().includes(formData.preferredBranch.toLowerCase())) {
               return false;
            }
          }
          // Allow up to a 20% margin or 1000 ranks for ambitious options
          if (formData.rank > item.closingRank + 1000 && formData.rank > item.closingRank * 1.2) return false;
          return true;
        });

        filtered.sort((a, b) => a.closingRank - b.closingRank);
        setData(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, [formData]);

  const toggleCompare = (college: CollegeData) => {
    const exists = selectedForCompare.find(c => c.institute === college.institute && c.program === college.program);
    if (exists) {
      setSelectedForCompare(selectedForCompare.filter(c => c !== exists));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, college]);
      } else {
        alert("You can only compare up to 3 colleges at a time.");
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Institute', 'Program', 'Quota', 'Opening Rank', 'Closing Rank', 'Placement %', 'Avg Package', 'Highest Package'];
    const csvData = data.map(d => [
      `"${d.institute}"`,
      `"${d.program}"`,
      `"${d.quota}"`,
      d.openingRank,
      d.closingRank,
      `"${d.placement.placementPercentage}"`,
      `"${d.placement.averagePackage}"`,
      `"${d.placement.highestPackage}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `edu_predictions_${formData.rank}.csv`);
    link.click();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">Analyzing your chances...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Your Predictions</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Based on {formData.counseling} Round 6 | Rank: {formData.rank} ({formData.category}, {formData.homeState !== 'None' ? `${formData.homeState} (HS)` : 'AI/OS'})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn-outline" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Edit
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '0.9rem', color: '#1e3a8a' }}>
        <strong>Disclaimer:</strong> These results are estimations based on past year cutoff and placement data. Actual results during counseling may vary.
      </div>

      {data.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ marginBottom: '8px' }}>No matches found</h3>
          <p className="text-muted">
            We couldn't find any colleges matching your criteria. Try adjusting your preferred branch or quota.
          </p>
        </div>
      ) : (
        <div className="result-list">
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
            Showing {data.length} possibilities, sorted by best match:
          </p>
          {data.map((college, idx) => {
            let chance = 'Low';
            if (formData.rank <= college.closingRank * 0.9 || formData.rank <= college.closingRank - 500) {
              chance = 'High';
            } else if (formData.rank <= college.closingRank + 200 || formData.rank <= college.closingRank * 1.05) {
              chance = 'Medium';
            }

            const isSelected = !!selectedForCompare.find(c => c.institute === college.institute && c.program === college.program);

            return (
              <div key={idx} className={`card result-card ${isSelected ? 'selected' : 'card-hover'}`} style={{ border: isSelected ? '1px solid var(--primary)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleCompare(college)}
                    style={{ width: '20px', height: '20px', marginTop: '4px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Building size={18} color="var(--primary)" />
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{college.institute}</h3>
                    </div>
                    <p style={{ fontWeight: 500, marginBottom: '4px', color: '#374151' }}>
                      {college.program}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>Quota: {college.quota}</span>
                      <span>Gender: {college.gender.split(' ')[0]}</span>
                      <span>Opening Rank: {college.openingRank}</span>
                      <span>Closing Rank: <strong>{college.closingRank}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chance</span>
                    <span className={`badge ${chance === 'High' ? 'badge-success' : 'badge-warning'}`}>
                      {chance}
                    </span>
                  </div>
                  
                  {college.placement.averagePackage !== 'Not Available' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{college.placement.averagePackage} LPA Avg</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{college.placement.placementPercentage} Placed</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedForCompare.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'white', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 0 0 1px var(--border-light)',
          display: 'flex', alignItems: 'center', gap: '24px', zIndex: 100
        }}>
          <div>
            <span style={{ fontWeight: 600 }}>{selectedForCompare.length}</span> selected to compare
          </div>
          <button className="btn-primary" onClick={() => setShowCompareModal(true)}>
            <BarChart2 size={18} /> Compare Now
          </button>
        </div>
      )}

      {showCompareModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <h2 style={{ margin: 0 }}>Compare Colleges</h2>
              <button onClick={() => setShowCompareModal(false)} style={{ padding: '8px' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', gap: '24px', overflowX: 'auto' }}>
              {selectedForCompare.map((c, i) => (
                <div key={i} style={{ flex: 1, minWidth: '250px', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{c.institute}</h3>
                  <p style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: '16px', fontSize: '0.9rem' }}>{c.program}</p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Closing Rank</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{c.closingRank}</div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Avg Package</div>
                    <div style={{ fontWeight: 600, color: c.placement.averagePackage !== 'Not Available' ? '#059669' : 'var(--text-muted)' }}>
                      {c.placement.averagePackage !== 'Not Available' ? `${c.placement.averagePackage} LPA` : 'N/A'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Highest Package</div>
                    <div style={{ fontWeight: 600 }}>{c.placement.highestPackage}</div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Placement %</div>
                    <div style={{ fontWeight: 600 }}>{c.placement.placementPercentage}</div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Category & Quota</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.seatType} • {c.quota}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
