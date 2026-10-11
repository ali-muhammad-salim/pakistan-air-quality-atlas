'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, Activity, Navigation, ArrowLeft, Search, Table, 
  ChevronLeft, ChevronRight, Calendar, ArrowUp, ArrowDown, 
  LineChart as LineChartIcon, Cpu, Building2, ExternalLink, 
  ShieldCheck, Radio, Layers, Database, Copy, Check, Sparkles, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [locDetails, setLocDetails] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLocs = async () => {
      setLoading(true);
      try {
        let url = `/api/locations?search=${encodeURIComponent(search)}`;
        if (selectedOwner !== 'ALL') {
          url += `&owner=${encodeURIComponent(selectedOwner)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setLocations(data.locations || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    
    const timeoutId = setTimeout(fetchLocs, 250);
    return () => clearTimeout(timeoutId);
  }, [search, selectedOwner]);

  const handleSelect = async (id) => {
    setSelectedLoc(id);
    setLocDetails(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch(`/api/locations/${id}`);
      const data = await res.json();
      setLocDetails(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    setSelectedLoc(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyCoords = (e, loc) => {
    e.stopPropagation();
    if (loc.latitude && loc.longitude) {
      const text = `${loc.latitude}, ${loc.longitude}`;
      navigator.clipboard.writeText(text);
      setCopiedId(loc.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getOwnerBadge = (owner, isUrbanUnit) => {
    if (isUrbanUnit) {
      return {
        bg: '#ecfdf5',
        color: '#065f46',
        border: '#a7f3d0',
        icon: Building2,
        label: 'The Urban Unit'
      };
    }
    if (owner?.includes('State') || owner?.includes('Government') || owner?.includes('AirNow')) {
      return {
        bg: '#fffbeb',
        color: '#92400e',
        border: '#fde68a',
        icon: ShieldCheck,
        label: 'US DOS Reference'
      };
    }
    if (owner?.includes('PAQI')) {
      return {
        bg: '#eff6ff',
        color: '#1e40af',
        border: '#bfdbfe',
        icon: Radio,
        label: 'PAQI Network'
      };
    }
    if (owner?.includes('AirGradient')) {
      return {
        bg: '#f5f3ff',
        color: '#5b21b6',
        border: '#ddd6fe',
        icon: Cpu,
        label: 'AirGradient Network'
      };
    }
    return {
      bg: '#f8fafc',
      color: '#475569',
      border: '#e2e8f0',
      icon: Activity,
      label: owner || 'Community Sensor'
    };
  };

  const getParameterStyle = (param) => {
    const p = param.toLowerCase();
    if (p.includes('pm25')) return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    if (p.includes('pm10')) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
    if (p.includes('pm1')) return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
    if (p.includes('temp')) return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
    if (p.includes('hum')) return { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' };
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const ownerFilters = [
    { id: 'ALL', label: 'All Stations (447)' },
    { id: 'urban_unit', label: '🏛️ The Urban Unit (166)' },
    { id: 'paqi', label: '🇵🇰 PAQI Network (166)' },
    { id: 'AirGradient', label: '⚡ AirGradient (46)' },
    { id: 'reference', label: '🎖️ Reference BAM-1020 (5)' },
    { id: 'Clarity', label: '🌐 Clarity (2)' },
  ];

  return (
    <main className="container">
      {/* Google / Canva Style Clean Header */}
      <div className="header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.9rem' }}>
          <Sparkles size={14} />
          National Environmental Sensor Directory
        </div>
        <h1 className="title">Pakistan Air Quality Atlas</h1>
        <p className="subtitle">
          Real-time and historical air quality records across Punjab, Sindh, ICT, KP & Balochistan • 2016 – 2026
        </p>
      </div>

      {!selectedLoc ? (
        <>
          {/* Swipeable Filter Pills (Google / Canva Style with Mobile Swipe) */}
          <div className="filter-tray">
            {ownerFilters.map(f => {
              const active = selectedOwner === f.id;
              const isUU = f.id === 'urban_unit';
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedOwner(f.id)}
                  className={`filter-pill ${active ? 'active' : ''}`}
                  style={{
                    background: active 
                      ? (isUU ? '#059669' : '#0f172a') 
                      : '#ffffff',
                    borderColor: active 
                      ? (isUU ? '#059669' : '#0f172a') 
                      : '#e2e8f0',
                    boxShadow: active 
                      ? (isUU ? '0 4px 12px rgba(5, 150, 105, 0.25)' : '0 4px 12px rgba(15, 23, 42, 0.2)') 
                      : '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search Box (Clean White Elevated Pill) */}
          <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <Search style={{ position: 'absolute', top: '16px', left: '20px', color: '#94a3b8' }} size={20} />
            <input 
              type="text" 
              className="search-bar" 
              placeholder="Search by city, operator (e.g. Urban Unit), sensor model, company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '3.4rem', paddingRight: search ? '3rem' : '1.5rem', height: '52px', fontSize: '1rem' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '18px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="skeleton-card" style={{ height: '300px', borderRadius: '16px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', border: '1px solid #e2e8f0' }}></div>
               ))}
            </div>
          ) : (
            <div className="grid">
              {locations.map(loc => {
                const isUrbanUnit = loc.owner?.toLowerCase().includes('urban unit') || loc.name?.toLowerCase().includes('urban unit');
                const badge = getOwnerBadge(loc.owner, isUrbanUnit);
                const BadgeIcon = badge.icon;
                const isReference = loc.sensor_type?.includes('Reference') || loc.instrument?.includes('BAM');
                
                return (
                  <div 
                    key={loc.id} 
                    className="glass-panel location-card" 
                    onClick={() => handleSelect(loc.id)} 
                    style={{ 
                      borderRadius: '16px', 
                      background: isUrbanUnit 
                        ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 16%)' 
                        : isReference
                        ? 'linear-gradient(180deg, #fffbeb 0%, #ffffff 16%)'
                        : '#ffffff', 
                      borderColor: isUrbanUnit ? '#a7f3d0' : isReference ? '#fde68a' : '#e2e8f0', 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                      padding: '1.5rem'
                    }}
                  >
                    {/* Header Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.35rem', 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.78rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.4px',
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        <BadgeIcon size={14} />
                        {badge.label}
                      </span>

                      <span 
                        style={{ 
                          fontSize: '0.73rem', 
                          fontWeight: '500',
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '6px', 
                          background: '#f8fafc', 
                          color: '#64748b',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        via {loc.provider || 'OpenAQ'}
                      </span>
                    </div>

                    {/* Station Name & Locality */}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.35 }}>
                        {loc.name}
                      </h3>
                      {loc.locality && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontSize: '0.86rem', fontWeight: '600' }}>
                          <MapPin size={14} />
                          {loc.locality}
                        </div>
                      )}
                    </div>

                    {/* Hardware Specifications Box (Clean Light Card) */}
                    <div 
                      style={{ 
                        background: '#f8fafc', 
                        padding: '0.9rem 1rem', 
                        borderRadius: '12px', 
                        border: '1px solid #eef2f6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                        fontSize: '0.84rem'
                      }}
                    >
                      {/* Sensor Model No */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <Cpu size={14} color="#6366f1" />
                          <span>Sensor Model:</span>
                        </span>
                        <span style={{ color: '#0f172a', fontWeight: '600', textAlign: 'right' }}>
                          {loc.model || loc.instrument || 'Sensor Node'}
                        </span>
                      </div>

                      {/* Manufacturer Company */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <Building2 size={14} color="#0284c7" />
                          <span>Company:</span>
                        </span>
                        <span style={{ color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>
                          {loc.manufacturer || 'OpenAQ Hardware'}
                        </span>
                      </div>

                      {/* Technology Type */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <Layers size={14} color="#059669" />
                          <span>Technology:</span>
                        </span>
                        <span style={{ color: isReference ? '#b45309' : '#475569', fontWeight: isReference ? '600' : '500', fontSize: '0.8rem', textAlign: 'right' }}>
                          {isReference ? 'EPA Reference FEM (Beta Attenuation)' : 'Laser Particle Counter (OPC)'}
                        </span>
                      </div>

                      {/* Exact Coordinates Bar with Actions */}
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155', fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem', fontWeight: '500' }}>
                          <Navigation size={13} color="#e11d48" />
                          <span>{loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button 
                            onClick={(e) => handleCopyCoords(e, loc)}
                            title="Copy exact coordinates"
                            style={{ 
                              background: copiedId === loc.id ? '#ecfdf5' : '#ffffff', 
                              border: copiedId === loc.id ? '1px solid #a7f3d0' : '1px solid #e2e8f0', 
                              color: copiedId === loc.id ? '#059669' : '#475569', 
                              padding: '0.35rem 0.65rem', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.3rem',
                              fontSize: '0.76rem',
                              fontWeight: '500',
                              minHeight: '32px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {copiedId === loc.id ? <Check size={13} /> : <Copy size={13} />}
                            {copiedId === loc.id ? 'Copied' : 'Copy'}
                          </button>

                          <a
                            href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="View exact pin on Google Maps"
                            style={{ 
                              background: '#eff6ff', 
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8', 
                              padding: '0.35rem 0.65rem', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.3rem',
                              fontSize: '0.76rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                              minHeight: '32px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <ExternalLink size={13} />
                            Maps
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Parameters Pills */}
                    {loc.parameters && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
                        {loc.parameters.split(',').map(p => {
                          const style = getParameterStyle(p);
                          return (
                            <span 
                              key={p} 
                              style={{ 
                                background: style.bg, 
                                color: style.color, 
                                border: `1px solid ${style.border}`,
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '6px', 
                                fontSize: '0.74rem', 
                                fontWeight: '600', 
                                textTransform: 'uppercase'
                              }}
                            >
                              {p}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Historical Timeline & Record Count Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} color="#94a3b8" />
                        {loc.min_date ? new Date(loc.min_date).toLocaleDateString(undefined, { year: '2-digit', month: 'short' }) : 'N/A'} – {loc.max_date ? new Date(loc.max_date).toLocaleDateString(undefined, { year: '2-digit', month: 'short' }) : 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontWeight: '500' }}>
                        <Database size={12} color="#94a3b8" />
                        {loc.data_count ? Number(loc.data_count).toLocaleString() : 0} logs
                      </div>
                    </div>

                  </div>
                );
              })}
              {locations.length === 0 && (
                <div style={{ textAlign: 'center', gridColumn: '1/-1', color: '#64748b', padding: '3rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0f172a' }}>No sensor stations found</p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.3rem' }}>Try clearing the search query or selecting "All Stations".</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <button 
            className="back-btn" 
            onClick={handleBack} 
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              color: '#1e293b', 
              padding: '0.65rem 1.25rem', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              marginBottom: '1.5rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              transition: 'all 0.15s ease', 
              fontWeight: '600',
              fontSize: '0.92rem',
              minHeight: '44px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft size={18} />
            Back to All Stations
          </button>
          
          {!locDetails ? (
             <div className="skeleton-card" style={{ height: '240px', borderRadius: '16px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', border: '1px solid #e2e8f0', marginBottom: '2rem' }}></div>
          ) : (
            <>
              {/* Clean White Detail Header Card */}
              <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.8rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ flex: '1 1 280px' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                      {locDetails.location.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#2563eb', fontSize: '0.95rem', fontWeight: '600', flexWrap: 'wrap' }}>
                      <MapPin size={17} />
                      <span>{locDetails.location.locality || 'Pakistan'}</span>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>ID: {locDetails.location.id}</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${locDetails.location.latitude},${locDetails.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      minHeight: '44px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    <ExternalLink size={16} />
                    View on Google Maps
                  </a>
                </div>

                {/* Specs Grid in Detail View */}
                <div className="specs-grid" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.25rem' }}>Operating Organization</div>
                    <div style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={16} color="#059669" />
                      {locDetails.location.owner || 'Community / OpenAQ'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.25rem' }}>Sensor Model & Number</div>
                    <div style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Cpu size={16} color="#4f46e5" />
                      {locDetails.location.model || locDetails.location.instrument || 'Sensor Node'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.25rem' }}>Hardware Manufacturer</div>
                    <div style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '600' }}>
                      {locDetails.location.manufacturer || 'OpenAQ Hardware'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '0.25rem' }}>Exact Coordinates</div>
                    <div style={{ color: '#0f172a', fontSize: '0.92rem', fontFamily: 'monospace', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Navigation size={15} color="#e11d48" />
                      {locDetails.location.latitude?.toFixed(6)}, {locDetails.location.longitude?.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameter Trends Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', marginTop: '2rem' }}>
                <LineChartIcon size={22} color="#4f46e5" />
                <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Parameter Trends</h3>
              </div>
              
              <LocationCharts locId={locDetails.location.id} />

              {/* Measurements Log Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', marginTop: '2.5rem' }}>
                <Table size={22} color="#2563eb" />
                <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Historical Measurements Log</h3>
              </div>
              
              <LocationDataTable locId={locDetails.location.id} />
            </>
          )}
        </div>
      )}

      {/* Floating Smooth Scroll to Top Button for Mobile / Desktop */}
      {showScrollTop && (
        <button 
          className="scroll-top-btn" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </main>
  );
}

function LocationCharts({ locId }) {
  const [data, setData] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    const fetchCharts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locations/${locId}/chart?range=${range}`);
        const json = await res.json();
        setData(json.data || []);
        setParameters(json.parameters || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchCharts();
  }, [locId, range]);

  const colors = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706', '#db2777'];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Time Range</span>
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
          {['7d', '1m', 'all'].map(r => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: active ? '700' : '500',
                  textTransform: 'uppercase',
                  fontSize: '0.76rem',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  minHeight: '36px',
                  transition: 'all 0.15s ease'
                }}
              >
                {r === '7d' ? '7 Days' : r === '1m' ? '1 Month' : 'All Time'}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="skeleton-card" style={{ height: '280px', borderRadius: '12px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', border: '1px solid #e2e8f0' }}></div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>No chart data available for this range.</div>
      ) : (
        <div className="charts-grid">
          {parameters.map((p, idx) => {
            const color = colors[idx % colors.length];
            return (
              <div key={p.parameter} className="chart-card" style={{ height: '300px', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.85rem 0', color: '#0f172a', textTransform: 'uppercase', fontSize: '0.84rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                  {p.parameter} <span style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: '500' }}>({p.units})</span>
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={data} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="utc_time" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      stroke="#94a3b8" 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} width={32} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '0.82rem', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={p.parameter} 
                      stroke={color} 
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name={p.parameter}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LocationDataTable({ locId }) {
  const [data, setData] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters and Sorting
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `/api/locations/${locId}/measurements?page=${page}&limit=${limit}&sortDir=${sortDir}`;
        if (start) url += `&start=${start}T00:00:00Z`;
        if (end) url += `&end=${end}T23:59:59Z`;
        
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.data) {
          setData(json.data);
          setParameters(json.parameters || []);
          setTotalPages(json.totalPages);
          setTotal(json.total);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    
    const debounce = setTimeout(() => {
      fetchData();
    }, 250);
    
    return () => clearTimeout(debounce);
  }, [locId, page, start, end, sortDir]);

  const handleSort = () => {
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div className="date-filter-group">
          <div className="date-input-chip">
            <Calendar size={15} color="#64748b" style={{ flexShrink: 0 }} />
            <span className="date-input-tag">From:</span>
            <input 
              type="date" 
              value={start}
              onChange={(e) => { setStart(e.target.value); setPage(1); }}
              className="date-input-field"
              aria-label="Start date"
            />
          </div>
          
          <div className="date-input-chip">
            <Calendar size={15} color="#64748b" style={{ flexShrink: 0 }} />
            <span className="date-input-tag">To:</span>
            <input 
              type="date" 
              value={end}
              onChange={(e) => { setEnd(e.target.value); setPage(1); }}
              className="date-input-field"
              aria-label="End date"
            />
          </div>
          
          {(start || end) && (
            <button 
              onClick={() => { setStart(''); setEnd(''); setPage(1); }}
              className="date-clear-button"
            >
              Clear Dates
            </button>
          )}
        </div>

        <div style={{ color: '#64748b', fontSize: '0.84rem' }}>
          Page <strong style={{ color: '#0f172a' }}>{page}</strong> of <strong style={{ color: '#0f172a' }}>{totalPages.toLocaleString()}</strong> ({total.toLocaleString()} records)
        </div>
      </div>

      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', minWidth: '540px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th onClick={handleSort} style={{ cursor: 'pointer', padding: '0.85rem 1rem', color: '#334155', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Date & Time (UTC)
                {sortDir === 'asc' ? <ArrowUp size={14} style={{ display: 'inline', marginLeft: 4 }} /> : <ArrowDown size={14} style={{ display: 'inline', marginLeft: 4 }} />}
              </th>
              {parameters.map(p => (
                <th key={p.parameter} style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#0f172a', fontWeight: '700' }}>{p.parameter}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.35rem' }}>({p.units})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.9rem 1rem' }}><div style={{ height: '18px', width: '140px', borderRadius: '4px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div></td>
                  {parameters.length > 0 ? parameters.map((p, j) => (
                    <td key={j} style={{ padding: '0.9rem 1rem' }}><div style={{ height: '18px', width: '50px', borderRadius: '4px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div></td>
                  )) : (
                    <td style={{ padding: '0.9rem 1rem' }}><div style={{ height: '18px', width: '50px', borderRadius: '4px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div></td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={parameters.length + 1} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No measurements found for this criteria.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} className="table-row">
                  <td style={{ padding: '0.85rem 1rem', color: '#334155', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{new Date(row.utc_time).toLocaleString()}</td>
                  {parameters.map(p => {
                    const val = row[p.parameter];
                    return (
                      <td key={p.parameter} style={{ padding: '0.85rem 1rem', color: '#0f172a', fontSize: '0.92rem', fontWeight: '600' }}>
                        {val != null ? Number(val).toFixed(2) : <span style={{ color: '#cbd5e1' }}>--</span>}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            aria-label="Previous Page"
            style={{ 
              background: page === 1 ? '#f8fafc' : '#ffffff', 
              color: page === 1 ? '#cbd5e1' : '#2563eb', 
              border: '1px solid #e2e8f0', 
              width: '42px',
              height: '42px',
              borderRadius: '10px', 
              cursor: page === 1 ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)' 
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span style={{ color: '#64748b', fontSize: '0.88rem', padding: '0 0.5rem' }}>
            Page <strong style={{ color: '#0f172a' }}>{page}</strong> of {totalPages.toLocaleString()}
          </span>
          
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            aria-label="Next Page"
            style={{ 
              background: page === totalPages ? '#f8fafc' : '#ffffff', 
              color: page === totalPages ? '#cbd5e1' : '#2563eb', 
              border: '1px solid #e2e8f0', 
              width: '42px',
              height: '42px',
              borderRadius: '10px', 
              cursor: page === totalPages ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)' 
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
