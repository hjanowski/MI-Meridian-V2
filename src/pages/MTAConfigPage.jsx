import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateMTAResults } from '../data/dataGenerator';
import { GitBranch, ArrowRight, Play, CheckCircle, Info, Sliders } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0176D3','#2E844A','#FE9339','#BA0517','#9050E9','#04844B','#3296ED','#FCC003','#7B8B8E'];

const MODEL_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'time_decay', label: 'Time Decay' },
  { value: 'position_based', label: 'Position-Based' },
  { value: 'data_driven', label: 'Data-Driven' },
  { value: 'first_touch', label: 'First Touch' },
  { value: 'last_touch', label: 'Last Touch' },
];

const CONVERSION_EVENTS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'signup', label: 'Sign-up' },
  { value: 'lead', label: 'Lead' },
  { value: 'app_install', label: 'App Install' },
];

const MODEL_DESCRIPTIONS = {
  linear: 'Equal credit is distributed across all touchpoints in the conversion path.',
  time_decay: 'More credit is given to touchpoints closer in time to the conversion event.',
  position_based: '40% credit to first and last touchpoints, 20% distributed among middle interactions.',
  data_driven: 'Uses algorithmic analysis to assign credit based on actual conversion patterns in your data.',
  first_touch: 'Full credit is assigned to the first touchpoint that initiated the customer journey.',
  last_touch: 'Full credit is assigned to the last touchpoint before conversion.',
};

const DEFAULT_CHANNELS = [
  { id: 'meta_ads', name: 'Meta Ads', enabled: true },
  { id: 'google_search', name: 'Google Ads Search', enabled: true },
  { id: 'google_display', name: 'Google Ads Display', enabled: true },
  { id: 'youtube', name: 'YouTube', enabled: true },
  { id: 'linkedin', name: 'LinkedIn', enabled: true },
  { id: 'tiktok', name: 'TikTok', enabled: true },
  { id: 'email', name: 'Email', enabled: true },
  { id: 'direct', name: 'Direct', enabled: true },
  { id: 'organic_search', name: 'Organic Search', enabled: true },
];

export default function MTAConfigPage() {
  const { state, dispatch } = useApp();
  const { mtaConfig } = state;

  const [model, setModel] = useState(mtaConfig.model || 'data_driven');
  const [lookbackWindow, setLookbackWindow] = useState(mtaConfig.lookbackWindow || 30);
  const [conversionEvent, setConversionEvent] = useState(mtaConfig.conversionEvent || 'purchase');
  const [channels, setChannels] = useState(mtaConfig.channels?.length ? mtaConfig.channels : DEFAULT_CHANNELS);
  const [results, setResults] = useState(mtaConfig.results || null);
  const [useMTAPriors, setUseMTAPriors] = useState(state.config.useMTAPriors || false);

  const handleToggleChannel = (id) => {
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, enabled: !ch.enabled } : ch));
  };

  const handleRunModel = () => {
    const enabledChannels = channels.filter(ch => ch.enabled);
    const config = { model, lookbackWindow, conversionEvent, channels: enabledChannels };
    dispatch({ type: 'UPDATE_MTA_CONFIG', payload: config });

    const mtaResults = generateMTAResults(config);
    setResults(mtaResults);
    dispatch({ type: 'SET_MTA_RESULTS', payload: mtaResults });
  };

  const handleUsePriors = () => {
    setUseMTAPriors(true);
    dispatch({ type: 'UPDATE_CONFIG', payload: { useMTAPriors: true } });
  };

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', payload: 'config' });
  };

  const chartData = results?.channels?.map((ch, i) => ({
    name: ch.channel,
    contribution: ch.contributionPct,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="cosmos-page animate-fade-in">
      {/* Page Header */}
      <div className="cosmos-page-header">
        <div className="cosmos-page-header__left">
          <div className="cosmos-page-header__icon" style={{ background: '#1B5F6A' }}>
            <GitBranch size={22} color="#fff" />
          </div>
          <div>
            <h1 className="cosmos-page-header__title">MTA Configuration</h1>
            <p className="cosmos-page-header__subtitle">Configure multi-touch attribution to inform your marketing mix model</p>
          </div>
        </div>
        <div className="cosmos-page-header__actions">
          <button className="cosmos-btn cosmos-btn--brand" onClick={handleRunModel}>
            <Play size={16} /> Run MTA Model
          </button>
        </div>
      </div>

      {/* Section 1: Attribution Model */}
      <div className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <span className="cosmos-section__icon"><Sliders size={18} /></span>
            <h2 className="cosmos-section__title">Attribution Model</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Model Type</label>
                <select
                  className="cosmos-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {MODEL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Lookback Window (days)</label>
                <input
                  type="number"
                  className="cosmos-input"
                  value={lookbackWindow}
                  onChange={(e) => setLookbackWindow(Number(e.target.value))}
                  min={1}
                  max={365}
                />
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Conversion Event</label>
                <select
                  className="cosmos-select"
                  value={conversionEvent}
                  onChange={(e) => setConversionEvent(e.target.value)}
                >
                  {CONVERSION_EVENTS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="cosmos-text-sm cosmos-text-muted" style={{ marginTop: '1rem' }}>
              <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
              {MODEL_DESCRIPTIONS[model]}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Channel Touchpoints */}
      <div className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <span className="cosmos-section__icon"><GitBranch size={18} /></span>
            <h2 className="cosmos-section__title">Channel Touchpoints</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-card">
            <table className="cosmos-table">
              <thead>
                <tr>
                  <th>Include</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {channels.map(ch => (
                  <tr key={ch.id}>
                    <td>
                      <label className="cosmos-toggle">
                        <input
                          type="checkbox"
                          checked={ch.enabled}
                          onChange={() => handleToggleChannel(ch.id)}
                        />
                        <span className="cosmos-toggle__slider"></span>
                      </label>
                    </td>
                    <td>{ch.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: MTA Results (shown only after running) */}
      {results && (
        <div className="cosmos-section animate-slide-in">
          <div className="cosmos-section__header">
            <div className="cosmos-section__header-left">
              <span className="cosmos-section__icon"><CheckCircle size={18} /></span>
              <h2 className="cosmos-section__title">MTA Results</h2>
              <span className="cosmos-badge cosmos-badge--success">Model Complete</span>
            </div>
          </div>
          <div className="cosmos-section__body">
            <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
              <table className="cosmos-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Touchpoints</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                    <th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {results.channels.map((ch, i) => (
                    <tr key={i}>
                      <td>{ch.channel}</td>
                      <td>{ch.touchpoints.toLocaleString()}</td>
                      <td>{ch.conversions.toLocaleString()}</td>
                      <td>${ch.revenue.toLocaleString()}</td>
                      <td>{ch.roi.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cosmos-card">
              <h3 className="cosmos-text-sm cosmos-text-bold" style={{ marginBottom: '1rem' }}>
                Channel Contribution %
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" fontSize={12} />
                  <YAxis unit="%" fontSize={12} />
                  <Tooltip formatter={(val) => `${val.toFixed(1)}%`} />
                  <Bar dataKey="contribution" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="cosmos-section" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem' }}>
        <button className="cosmos-btn cosmos-btn--brand" onClick={handleRunModel}>
          <Play size={16} /> Run MTA Model
        </button>
        {results && (
          <button
            className={`cosmos-btn cosmos-btn--outline ${useMTAPriors ? 'cosmos-btn--success' : ''}`}
            onClick={handleUsePriors}
            disabled={useMTAPriors}
          >
            <CheckCircle size={16} /> {useMTAPriors ? 'Priors Applied' : 'Use as Meridian Priors'}
          </button>
        )}
        <button className="cosmos-btn cosmos-btn--brand" onClick={handleNext}>
          Next: Meridian Config <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
