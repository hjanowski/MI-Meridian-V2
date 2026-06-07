import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Database,
  Info,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  CloudLightning,
  CheckCircle,
  AlertTriangle,
  Mail,
  MessageSquare,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Globe,
  Sliders,
  GitBranch,
} from 'lucide-react';

const API_SOURCES = [
  { id: 'meta_ads', name: 'Meta', color: '#1877F2' },
  { id: 'google_ads', name: 'Google', color: '#4285F4' },
  { id: 'tiktok_ads', name: 'TikTok', color: '#000000' },
  { id: 'linkedin_ads', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'pinterest_ads', name: 'Pinterest', color: '#E60023' },
  { id: 'snapchat_ads', name: 'Snapchat', color: '#FFFC00' },
];

export default function ConfigPage() {
  const { state, dispatch } = useApp();
  const { config, mtaConfig } = state;
  const [advancedOpen, setAdvancedOpen] = useState(config.showAdvanced || false);

  const updateConfig = (payload) => dispatch({ type: 'UPDATE_CONFIG', payload });
  const updateDataFeed = (payload) => dispatch({ type: 'UPDATE_DATA_FEED', payload });
  const updateExternalFactors = (payload) => dispatch({ type: 'UPDATE_EXTERNAL_FACTORS', payload });
  const updateFirstPartyChannels = (payload) => dispatch({ type: 'UPDATE_FIRST_PARTY_CHANNELS', payload });

  const toggleApiSource = (sourceId) => {
    const current = config.dataFeed.apiSources || {};
    updateDataFeed({
      apiSources: { ...current, [sourceId]: !current[sourceId] },
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="cosmos-page-header">
        <div className="cosmos-page-header__left">
          <div className="cosmos-page-header__icon" style={{ background: '#1B2A4A' }}>
            <Settings size={24} color="#fff" />
          </div>
          <div>
            <h1 className="cosmos-page-header__title">Meridian Configuration</h1>
            <p className="cosmos-page-header__subtitle">Configure your Marketing Mix Model parameters</p>
          </div>
        </div>
        <div className="cosmos-page-header__actions">
          <button
            className="cosmos-btn cosmos-btn--neutral"
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'home' })}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            className="cosmos-btn cosmos-btn--brand"
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'training' })}
          >
            Save &amp; Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Section 1: Data Feed Configuration */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon">
              <Database size={18} />
            </div>
            <h2 className="cosmos-section__title">Data Feed Configuration</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          {/* Radio: API vs TotalConnect */}
          <div className="cosmos-form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="cosmos-label">Third-Party Data Source</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dataFeedType"
                  value="api"
                  checked={config.dataFeed.thirdPartyType === 'api'}
                  onChange={() => updateDataFeed({ thirdPartyType: 'api' })}
                />
                <span className="cosmos-text-sm">API Connections</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dataFeedType"
                  value="totalconnect"
                  checked={config.dataFeed.thirdPartyType === 'totalconnect'}
                  onChange={() => updateDataFeed({ thirdPartyType: 'totalconnect' })}
                />
                <span className="cosmos-text-sm">TotalConnect</span>
              </label>
            </div>
          </div>

          {/* API Sources Grid */}
          {config.dataFeed.thirdPartyType === 'api' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {API_SOURCES.map((source) => {
                  const isSelected = config.dataFeed.apiSources?.[source.id];
                  return (
                    <div
                      key={source.id}
                      className="cosmos-card cosmos-card--interactive"
                      style={{
                        borderColor: isSelected ? source.color : undefined,
                        borderWidth: isSelected ? '2px' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleApiSource(source.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleApiSource(source.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: source.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Globe size={16} color={source.color === '#FFFC00' ? '#000' : '#fff'} />
                        </div>
                        <span className="cosmos-text-bold">{source.name}</span>
                      </div>
                      {isSelected && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <label className="cosmos-label cosmos-text-xs">Sub-Pipeline</label>
                          <input
                            className="cosmos-input"
                            placeholder={`${source.name} pipeline ID`}
                            value={config.dataFeed.apiPipelines?.[source.id] || ''}
                            onChange={(e) =>
                              updateDataFeed({
                                apiPipelines: {
                                  ...config.dataFeed.apiPipelines,
                                  [source.id]: e.target.value,
                                },
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TotalConnect Toggles */}
          {config.dataFeed.thirdPartyType === 'totalconnect' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {['TV', 'Radio', 'Print', 'OOH'].map((channel) => {
                const key = channel.toLowerCase();
                return (
                  <div key={key} className="cosmos-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="cosmos-text-bold">{channel}</span>
                    <label className="cosmos-toggle">
                      <input
                        type="checkbox"
                        checked={!!config.dataFeed.tcPipelines?.[key]}
                        onChange={(e) =>
                          updateDataFeed({
                            tcPipelines: {
                              ...config.dataFeed.tcPipelines,
                              [key]: e.target.checked,
                            },
                          })
                        }
                      />
                      <span className="cosmos-toggle__slider" />
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: First Party Data */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon">
              <Mail size={18} />
            </div>
            <h2 className="cosmos-section__title">First Party Data</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span className="cosmos-text-sm">Connect First Party Data</span>
            <label className="cosmos-toggle">
              <input
                type="checkbox"
                checked={config.connectFirstParty}
                onChange={(e) => updateConfig({ connectFirstParty: e.target.checked })}
              />
              <span className="cosmos-toggle__slider" />
            </label>
          </div>

          {config.connectFirstParty && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="cosmos-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} />
                  <span>Email</span>
                </div>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.firstPartyChannels.email}
                    onChange={(e) => updateFirstPartyChannels({ email: e.target.checked })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>
              <div className="cosmos-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} />
                  <span>WhatsApp</span>
                </div>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.firstPartyChannels.whatsapp}
                    onChange={(e) => updateFirstPartyChannels({ whatsapp: e.target.checked })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>
              <div className="cosmos-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Smartphone size={16} />
                  <span>SMS</span>
                </div>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.firstPartyChannels.sms}
                    onChange={(e) => updateFirstPartyChannels({ sms: e.target.checked })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: KPI Configuration */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon">
              <BarChart3 size={18} />
            </div>
            <h2 className="cosmos-section__title">KPI Configuration</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-form-group">
            <label className="cosmos-label">KPI Type</label>
            <select
              className="cosmos-select"
              value={config.kpiType}
              onChange={(e) => updateConfig({ kpiType: e.target.value })}
            >
              <option value="revenue">Revenue</option>
              <option value="conversions">Conversions</option>
            </select>
          </div>

          {config.kpiType === 'conversions' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="cosmos-form-group">
                <label className="cosmos-label">DMO Object Name</label>
                <input
                  className="cosmos-input"
                  placeholder="e.g. Conversion__c"
                  value={config.kpiDMO.objectName}
                  onChange={(e) =>
                    updateConfig({ kpiDMO: { ...config.kpiDMO, objectName: e.target.value } })
                  }
                />
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">DMO Field Name</label>
                <input
                  className="cosmos-input"
                  placeholder="e.g. ConversionValue__c"
                  value={config.kpiDMO.fieldName}
                  onChange={(e) =>
                    updateConfig({ kpiDMO: { ...config.kpiDMO, fieldName: e.target.value } })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: MTA ↔ Meridian Integration */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon" style={{ background: '#9050E9' }}>
              <GitBranch size={18} color="#fff" />
            </div>
            <h2 className="cosmos-section__title">MTA ↔ Meridian Integration</h2>
          </div>
          <span className="cosmos-badge cosmos-badge--info">NEW</span>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-alert cosmos-alert--info" style={{ marginBottom: '1.5rem' }}>
            <Info size={16} />
            <span>
              Connect Meridian with an existing MI Multi-Touch Attribution model for bidirectional calibration.
              High-performing MTA channels can inform Meridian priors, and Meridian outputs can re-weight MTA channel significance.
            </span>
          </div>

          {/* Pull: MTA → Meridian Priors */}
          <div style={{ border: '1px solid var(--cosmos-border)', borderRadius: 'var(--cosmos-radius-md)', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Pull MTA Channel ROI as Priors</h4>
                <p className="cosmos-text-sm cosmos-text-muted" style={{ margin: '4px 0 0' }}>
                  Use channel ROI from a selected MTA model as informative Bayesian priors for Meridian
                </p>
              </div>
              <label className="cosmos-toggle">
                <input
                  type="checkbox"
                  checked={config.useMTAPriors}
                  onChange={(e) => updateConfig({ useMTAPriors: e.target.checked })}
                />
                <span className="cosmos-toggle__track" />
              </label>
            </div>

            {config.useMTAPriors && (
              <div style={{ marginTop: '16px' }}>
                <div className="cosmos-form-group">
                  <label className="cosmos-label">Select MTA Model</label>
                  <select className="cosmos-select">
                    <option value="data_driven">Data-Driven Attribution (Default)</option>
                    <option value="position_based">Position-Based (U-Shaped)</option>
                    <option value="time_decay">Time Decay</option>
                    <option value="linear">Linear</option>
                  </select>
                  <p className="cosmos-help-text">Channels with high MTA ROI will receive tighter prior distributions, guiding Meridian toward those estimates.</p>
                </div>

                <table className="cosmos-table" style={{ marginTop: '12px' }}>
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>MTA ROI</th>
                      <th>Prior Mean (log)</th>
                      <th>Prior Std</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { channel: 'Google Ads', mtaROI: 2.8, confidence: 'High' },
                      { channel: 'Meta Ads', mtaROI: 1.9, confidence: 'High' },
                      { channel: 'YouTube Ads', mtaROI: 1.8, confidence: 'Medium' },
                      { channel: 'LinkedIn Ads', mtaROI: 1.6, confidence: 'Medium' },
                      { channel: 'TikTok Ads', mtaROI: 1.2, confidence: 'Low' },
                      { channel: 'Amazon Ads', mtaROI: 2.1, confidence: 'High' },
                    ].map((row) => (
                      <tr key={row.channel}>
                        <td style={{ fontWeight: 600 }}>{row.channel}</td>
                        <td>{row.mtaROI.toFixed(2)}</td>
                        <td>{Math.log(row.mtaROI).toFixed(3)}</td>
                        <td>{row.confidence === 'High' ? '0.4' : row.confidence === 'Medium' ? '0.7' : '1.0'}</td>
                        <td>
                          <span className={`cosmos-badge cosmos-badge--${row.confidence === 'High' ? 'success' : row.confidence === 'Medium' ? 'warning' : 'neutral'}`}>
                            {row.confidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Push: Meridian → MTA Re-weighting */}
          <div style={{ border: '1px solid var(--cosmos-border)', borderRadius: 'var(--cosmos-radius-md)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Push Meridian ROI to Re-weight MTA</h4>
                <p className="cosmos-text-sm cosmos-text-muted" style={{ margin: '4px 0 0' }}>
                  After model training, push Meridian's channel ROI back to re-weight channel significance in a selected MTA model
                </p>
              </div>
              <label className="cosmos-toggle">
                <input
                  type="checkbox"
                  checked={state.mtaMMMSync?.mmmToMTA || false}
                  onChange={(e) => dispatch({ type: 'UPDATE_MTA_MMM_SYNC', payload: { mmmToMTA: e.target.checked } })}
                />
                <span className="cosmos-toggle__track" />
              </label>
            </div>

            {state.mtaMMMSync?.mmmToMTA && (
              <div style={{ marginTop: '16px' }}>
                <div className="cosmos-form-group">
                  <label className="cosmos-label">Target MTA Model for Re-weighting</label>
                  <select className="cosmos-select">
                    <option value="data_driven">Data-Driven Attribution (Default)</option>
                    <option value="position_based">Position-Based (U-Shaped)</option>
                    <option value="time_decay">Time Decay</option>
                    <option value="linear">Linear</option>
                  </select>
                  <p className="cosmos-help-text">After Meridian training completes, channel ROI estimates will be pushed to adjust the selected MTA model's channel weighting.</p>
                </div>

                {state.trainingStatus === 'complete' ? (
                  <div className="cosmos-alert cosmos-alert--success" style={{ marginTop: '12px' }}>
                    <CheckCircle size={16} />
                    <span>Meridian model is trained. Channel ROI is ready to push to MTA on next sync.</span>
                  </div>
                ) : (
                  <div className="cosmos-alert cosmos-alert--warning" style={{ marginTop: '12px' }}>
                    <AlertTriangle size={16} />
                    <span>Meridian model training must complete before ROI can be pushed to MTA.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 5: Advanced Parameters (Collapsible) */}
      <section className="cosmos-section animate-slide-in">
        <div
          className="cosmos-section__header"
          style={{ cursor: 'pointer' }}
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon">
              <Sliders size={18} />
            </div>
            <h2 className="cosmos-section__title">Advanced Parameters</h2>
          </div>
          {advancedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {advancedOpen && (
          <div className="cosmos-section__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {/* Adstock Decay */}
              <div className="cosmos-form-group">
                <label className="cosmos-label">Adstock Decay</label>
                <select
                  className="cosmos-select"
                  value={config.adstockDecay}
                  onChange={(e) => updateConfig({ adstockDecay: e.target.value })}
                >
                  <option value="geometric">Geometric</option>
                  <option value="weibull">Weibull</option>
                </select>
              </div>

              {/* Max Lag */}
              <div className="cosmos-form-group">
                <label className="cosmos-label">Max Lag (weeks)</label>
                <input
                  className="cosmos-input"
                  type="number"
                  min={1}
                  max={52}
                  value={config.maxLag}
                  onChange={(e) => updateConfig({ maxLag: parseInt(e.target.value, 10) || 8 })}
                />
              </div>

              {/* Knots */}
              <div className="cosmos-form-group">
                <label className="cosmos-label">Knots</label>
                <select
                  className="cosmos-select"
                  value={config.knots}
                  onChange={(e) => updateConfig({ knots: e.target.value })}
                >
                  <option value="auto">Auto</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {/* Hill Before Adstock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="cosmos-text-sm">Hill Before Adstock</span>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.hillBeforeAdstock}
                    onChange={(e) => updateConfig({ hillBeforeAdstock: e.target.checked })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>

              {/* Enable AKS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="cosmos-text-sm">Enable AKS</span>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.enableAKS}
                    onChange={(e) => updateConfig({ enableAKS: e.target.checked })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>
            </div>

            {/* Prior ROI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Prior ROI Mean</label>
                <input
                  className="cosmos-input"
                  type="number"
                  step="0.1"
                  value={config.priorROI.mean}
                  onChange={(e) =>
                    updateConfig({ priorROI: { ...config.priorROI, mean: parseFloat(e.target.value) || 0 } })
                  }
                />
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Prior ROI Std</label>
                <input
                  className="cosmos-input"
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.priorROI.std}
                  onChange={(e) =>
                    updateConfig({ priorROI: { ...config.priorROI, std: parseFloat(e.target.value) || 0.5 } })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 6: External Factors */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon">
              <CloudLightning size={18} />
            </div>
            <h2 className="cosmos-section__title">External Factors</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { key: 'seasonality', label: 'Seasonality', icon: <BarChart3 size={18} /> },
              { key: 'holidays', label: 'Holidays', icon: <CheckCircle size={18} /> },
              { key: 'gqv', label: 'GQV (Google Query Volume)', icon: <Globe size={18} /> },
              { key: 'competitorActivity', label: 'Competitor Activity', icon: <AlertTriangle size={18} /> },
              { key: 'macroEconomic', label: 'Macro Economic', icon: <BarChart3 size={18} /> },
              { key: 'weather', label: 'Weather', icon: <CloudLightning size={18} /> },
            ].map((factor) => (
              <div
                key={factor.key}
                className="cosmos-card cosmos-card--interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: config.externalFactors[factor.key] ? 'var(--cosmos-brand, #0176d3)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {factor.icon}
                  <span className="cosmos-text-sm cosmos-text-bold">{factor.label}</span>
                </div>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.externalFactors[factor.key]}
                    onChange={(e) => updateExternalFactors({ [factor.key]: e.target.checked })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
