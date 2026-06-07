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
  Globe,
  GitBranch,
  Target,
  Tv,
  Radio,
  Newspaper,
  MapPin,
  Film,
} from 'lucide-react';

// --- SVG Logo Components ---
const MetaLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <text x="4" y="16" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#fff">f</text>
  </svg>
);

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <text x="3" y="16" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="bold" fill="#fff">G</text>
  </svg>
);

const TikTokLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 3C10 3 10 14 10 14C10 15.5 8.5 17 7 17C5.5 17 4 15.5 4 14C4 12.5 5.5 11 7 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M10 3C12 3 14 4 14 6" stroke="#25F4EE" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M10 5C12.5 5 15 6 15 8" stroke="#FE2C55" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const LinkedInLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <text x="2" y="16" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#fff">in</text>
  </svg>
);

const PinterestLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <text x="4" y="16" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#fff">P</text>
  </svg>
);

const SnapchatLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 4C7.5 4 6 5.5 6 7.5V9C5 9 4 9.5 4 10.5C4 11.5 5 12 6 12C6 13.5 5 15 4 16H16C15 15 14 13.5 14 12C15 12 16 11.5 16 10.5C16 9.5 15 9 14 9V7.5C14 5.5 12.5 4 10 4Z" fill="#000" stroke="#000" strokeWidth="0.5"/>
  </svg>
);

// --- Source Configurations ---
const API_SOURCES = [
  { id: 'meta_ads', name: 'Meta', color: '#1877F2', Logo: MetaLogo },
  { id: 'google_ads', name: 'Google Ads', color: '#4285F4', Logo: GoogleLogo },
  { id: 'tiktok_ads', name: 'TikTok', color: '#000000', Logo: TikTokLogo },
  { id: 'linkedin_ads', name: 'LinkedIn', color: '#0A66C2', Logo: LinkedInLogo },
  { id: 'pinterest_ads', name: 'Pinterest', color: '#E60023', Logo: PinterestLogo },
  { id: 'snapchat_ads', name: 'Snapchat', color: '#FFFC00', Logo: SnapchatLogo },
];

const PIPELINE_NAMES = {
  meta_ads: ['Meta EU Central', 'Meta AMER Primary', 'Meta APAC Retargeting', 'Meta EU Brand', 'Meta LATAM Performance'],
  google_ads: ['Google Search Brand US', 'Google Display EMEA', 'Google PMax Global', 'Google YouTube Brand', 'Google Search Non-Brand'],
  tiktok_ads: ['TikTok US Awareness', 'TikTok EU Conversions', 'TikTok APAC Brand'],
  linkedin_ads: ['LinkedIn B2B Global', 'LinkedIn Brand AMER', 'LinkedIn Lead Gen EU'],
  pinterest_ads: ['Pinterest US Shopping', 'Pinterest EU Brand', 'Pinterest AMER Performance'],
  snapchat_ads: ['Snapchat US Gen-Z', 'Snapchat EU Awareness', 'Snapchat AMER Retargeting'],
};

// Seeded history badge based on source name
function getHistoryBadge(sourceId) {
  const hash = sourceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mod = hash % 3;
  if (mod === 0) return { label: '3+ Years', variant: 'success' };
  if (mod === 1) return { label: '1-2 Years', variant: 'warning' };
  return { label: '< 1 Year', variant: 'error' };
}

const TOTALCONNECT_SOURCES = [
  { id: 'tv_linear', name: 'TV Linear', icon: <Tv size={18} /> },
  { id: 'tv_streaming', name: 'TV Streaming', icon: <Tv size={18} /> },
  { id: 'radio', name: 'Radio', icon: <Radio size={18} /> },
  { id: 'print', name: 'Print', icon: <Newspaper size={18} /> },
  { id: 'ooh', name: 'OOH (Out of Home)', icon: <MapPin size={18} /> },
  { id: 'cinema', name: 'Cinema', icon: <Film size={18} /> },
];

const DATA_CLOUD_OBJECTS = [
  'Individual_Contact__dlm',
  'Engagement_Event__dlm',
  'Campaign_Member__dlm',
];

const FIRST_PARTY_CHANNELS = [
  { id: 'email', name: 'Email', icon: <Mail size={18} /> },
  { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare size={18} /> },
  { id: 'sms', name: 'SMS', icon: <Smartphone size={18} /> },
];

const STEP_LABELS = ['Data Feed', 'KPI Setup', 'Model Settings'];

export default function ConfigPage() {
  const { state, dispatch } = useApp();
  const { config, mtaMMMSync, trainingStatus } = state;

  const [currentPart, setCurrentPart] = useState(1);
  const [excludedPipelines, setExcludedPipelines] = useState({});
  const [sourceMetrics, setSourceMetrics] = useState({});
  const [firstPartyObjects, setFirstPartyObjects] = useState({});
  const [firstPartyFields, setFirstPartyFields] = useState({});
  const [totalConnectMetrics, setTotalConnectMetrics] = useState({});
  const [totalConnectEnabled, setTotalConnectEnabled] = useState({});
  const [revenuePerKPI, setRevenuePerKPI] = useState('');

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

  const handleExcludePipeline = (sourceId, pipeline) => {
    const current = excludedPipelines[sourceId] || [];
    if (current.includes(pipeline)) {
      setExcludedPipelines({ ...excludedPipelines, [sourceId]: current.filter((p) => p !== pipeline) });
    } else {
      setExcludedPipelines({ ...excludedPipelines, [sourceId]: [...current, pipeline] });
    }
  };

  const handleNext = () => {
    if (currentPart < 3) setCurrentPart(currentPart + 1);
    else dispatch({ type: 'SET_STEP', payload: 'training' });
  };

  const handleBack = () => {
    if (currentPart > 1) setCurrentPart(currentPart - 1);
    else dispatch({ type: 'SET_STEP', payload: 'home' });
  };

  // --- RENDER ---
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
      </div>

      {/* Step Indicator */}
      <div className="cosmos-section" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0' }}>
          {STEP_LABELS.map((label, idx) => {
            const partNum = idx + 1;
            const isActive = currentPart === partNum;
            const isCompleted = currentPart > partNum;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {idx > 0 && (
                  <div style={{
                    width: '40px',
                    height: '2px',
                    background: isCompleted ? 'var(--cosmos-brand, #0176d3)' : 'var(--cosmos-border, #e0e0e0)',
                    margin: '0 0.25rem',
                  }} />
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  background: isActive ? 'var(--cosmos-brand, #0176d3)' : isCompleted ? '#e8f4fd' : 'var(--cosmos-surface, #f4f6f9)',
                  color: isActive ? '#fff' : isCompleted ? 'var(--cosmos-brand, #0176d3)' : 'var(--cosmos-text-muted, #6b7280)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                }}>
                  {isCompleted ? (
                    <CheckCircle size={14} />
                  ) : (
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--cosmos-border, #e0e0e0)',
                      color: isActive ? '#fff' : 'var(--cosmos-text-muted, #6b7280)',
                    }}>
                      {partNum}
                    </span>
                  )}
                  <span>Part {partNum}: {label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ PART 1: Data Feed Configuration ============ */}
      {currentPart === 1 && (
        <div className="animate-fade-in">
          {/* Sub-section A: Third Party Data Sources */}
          <section className="cosmos-section animate-slide-in">
            <div className="cosmos-section__header">
              <div className="cosmos-section__header-left">
                <div className="cosmos-section__icon">
                  <Database size={18} />
                </div>
                <h2 className="cosmos-section__title">Third Party Data Sources</h2>
              </div>
            </div>
            <div className="cosmos-section__body">
              <p className="cosmos-text-sm cosmos-text-muted" style={{ marginBottom: '1rem' }}>
                Select the ad platforms to include in your Meridian model. Configure metric type and exclude specific pipelines per source.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {API_SOURCES.map((source) => {
                  const isSelected = !!config.dataFeed.apiSources?.[source.id];
                  const historyBadge = getHistoryBadge(source.id);
                  const Logo = source.Logo;
                  return (
                    <div
                      key={source.id}
                      className="cosmos-card cosmos-card--interactive"
                      style={{
                        borderColor: isSelected ? source.color : undefined,
                        borderWidth: isSelected ? '2px' : undefined,
                      }}
                    >
                      {/* Card Header Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleApiSource(source.id)}
                          />
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              background: source.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Logo />
                          </div>
                          <span className="cosmos-text-bold">{source.name}</span>
                        </div>
                        <span className={`cosmos-badge cosmos-badge--${historyBadge.variant}`}>
                          {historyBadge.label}
                        </span>
                      </div>

                      {/* Expanded config when selected */}
                      {isSelected && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cosmos-border, #e0e0e0)' }}>
                          {/* Exclude Pipelines */}
                          <div className="cosmos-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="cosmos-label cosmos-text-xs">Exclude Pipelines</label>
                            <select
                              className="cosmos-select"
                              multiple
                              value={excludedPipelines[source.id] || []}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                                setExcludedPipelines({ ...excludedPipelines, [source.id]: selected });
                              }}
                              style={{ minHeight: '70px', fontSize: '12px' }}
                            >
                              {(PIPELINE_NAMES[source.id] || []).map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <p className="cosmos-help-text">Hold Ctrl/Cmd to select multiple pipelines to exclude</p>
                          </div>

                          {/* Metric Radio */}
                          <div className="cosmos-form-group" style={{ marginBottom: '0' }}>
                            <label className="cosmos-label cosmos-text-xs">Metric</label>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`metric_${source.id}`}
                                  value="impressions"
                                  checked={(sourceMetrics[source.id] || 'impressions') === 'impressions'}
                                  onChange={() => setSourceMetrics({ ...sourceMetrics, [source.id]: 'impressions' })}
                                />
                                <span className="cosmos-text-sm">Impressions</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`metric_${source.id}`}
                                  value="clicks"
                                  checked={sourceMetrics[source.id] === 'clicks'}
                                  onChange={() => setSourceMetrics({ ...sourceMetrics, [source.id]: 'clicks' })}
                                />
                                <span className="cosmos-text-sm">Clicks</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Sub-section B: First Party Data (Data Cloud) */}
          <section className="cosmos-section animate-slide-in">
            <div className="cosmos-section__header">
              <div className="cosmos-section__header-left">
                <div className="cosmos-section__icon">
                  <Mail size={18} />
                </div>
                <h2 className="cosmos-section__title">First Party Data (Data Cloud)</h2>
              </div>
            </div>
            <div className="cosmos-section__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span className="cosmos-text-sm cosmos-text-bold">Connect First Party Data from Data Cloud</span>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {FIRST_PARTY_CHANNELS.map((channel) => (
                    <div key={channel.id} className="cosmos-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {channel.icon}
                          <span className="cosmos-text-bold">{channel.name}</span>
                        </div>
                        <label className="cosmos-toggle">
                          <input
                            type="checkbox"
                            checked={config.firstPartyChannels[channel.id]}
                            onChange={(e) => updateFirstPartyChannels({ [channel.id]: e.target.checked })}
                          />
                          <span className="cosmos-toggle__slider" />
                        </label>
                      </div>

                      {config.firstPartyChannels[channel.id] && (
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--cosmos-border, #e0e0e0)' }}>
                          <div className="cosmos-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="cosmos-label cosmos-text-xs">Data Cloud Object</label>
                            <select
                              className="cosmos-select"
                              value={firstPartyObjects[channel.id] || ''}
                              onChange={(e) => setFirstPartyObjects({ ...firstPartyObjects, [channel.id]: e.target.value })}
                            >
                              <option value="">-- Select Object --</option>
                              {DATA_CLOUD_OBJECTS.map((obj) => (
                                <option key={obj} value={obj}>{obj}</option>
                              ))}
                            </select>
                          </div>
                          <div className="cosmos-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="cosmos-label cosmos-text-xs">Field Name</label>
                            <input
                              className="cosmos-input"
                              placeholder="e.g. Opens, Clicks, Sends"
                              value={firstPartyFields[channel.id] || ''}
                              onChange={(e) => setFirstPartyFields({ ...firstPartyFields, [channel.id]: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="cosmos-badge cosmos-badge--info" style={{ fontSize: '11px' }}>
                              Available from: Jan 2022 — Present
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sub-section C: TotalConnect */}
          <section className="cosmos-section animate-slide-in">
            <div className="cosmos-section__header">
              <div className="cosmos-section__header-left">
                <div className="cosmos-section__icon">
                  <Tv size={18} />
                </div>
                <h2 className="cosmos-section__title">TotalConnect</h2>
              </div>
            </div>
            <div className="cosmos-section__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span className="cosmos-text-sm cosmos-text-bold">Enable TotalConnect Sources</span>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.dataFeed.thirdPartyType === 'totalconnect'}
                    onChange={(e) => updateDataFeed({ thirdPartyType: e.target.checked ? 'totalconnect' : 'api' })}
                  />
                  <span className="cosmos-toggle__slider" />
                </label>
              </div>

              {config.dataFeed.thirdPartyType === 'totalconnect' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {TOTALCONNECT_SOURCES.map((source) => (
                    <div key={source.id} className="cosmos-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {source.icon}
                          <span className="cosmos-text-bold">{source.name}</span>
                        </div>
                        <label className="cosmos-toggle">
                          <input
                            type="checkbox"
                            checked={!!totalConnectEnabled[source.id]}
                            onChange={(e) => setTotalConnectEnabled({ ...totalConnectEnabled, [source.id]: e.target.checked })}
                          />
                          <span className="cosmos-toggle__slider" />
                        </label>
                      </div>
                      {totalConnectEnabled[source.id] && (
                        <div className="cosmos-form-group" style={{ marginBottom: 0 }}>
                          <label className="cosmos-label cosmos-text-xs">Metric</label>
                          <select
                            className="cosmos-select"
                            value={totalConnectMetrics[source.id] || 'grp'}
                            onChange={(e) => setTotalConnectMetrics({ ...totalConnectMetrics, [source.id]: e.target.value })}
                          >
                            <option value="grp">GRP</option>
                            <option value="impressions">Impressions</option>
                            <option value="spend">Spend</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ============ PART 2: KPI Configuration ============ */}
      {currentPart === 2 && (
        <div className="animate-fade-in">
          <section className="cosmos-section animate-slide-in">
            <div className="cosmos-section__header">
              <div className="cosmos-section__header-left">
                <div className="cosmos-section__icon">
                  <Target size={18} />
                </div>
                <h2 className="cosmos-section__title">KPI Configuration</h2>
              </div>
            </div>
            <div className="cosmos-section__body">
              <div className="cosmos-form-group" style={{ maxWidth: '400px' }}>
                <label className="cosmos-label">KPI Type</label>
                <select
                  className="cosmos-select"
                  value={config.kpiType}
                  onChange={(e) => updateConfig({ kpiType: e.target.value })}
                >
                  <option value="revenue">Revenue</option>
                  <option value="conversions">Conversions</option>
                  <option value="leads">Leads</option>
                  <option value="app_installs">App Installs</option>
                </select>
              </div>

              {config.kpiType !== 'revenue' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="cosmos-form-group">
                      <label className="cosmos-label">Filter Field</label>
                      <input
                        className="cosmos-input"
                        placeholder="e.g. Status__c"
                        value={config.kpiDMO.filterField || ''}
                        onChange={(e) =>
                          updateConfig({ kpiDMO: { ...config.kpiDMO, filterField: e.target.value } })
                        }
                      />
                    </div>
                    <div className="cosmos-form-group">
                      <label className="cosmos-label">Filter Operator</label>
                      <select
                        className="cosmos-select"
                        value={config.kpiDMO.filterOperator || 'equals'}
                        onChange={(e) =>
                          updateConfig({ kpiDMO: { ...config.kpiDMO, filterOperator: e.target.value } })
                        }
                      >
                        <option value="equals">equals</option>
                        <option value="contains">contains</option>
                        <option value="greater_than">greater_than</option>
                      </select>
                    </div>
                    <div className="cosmos-form-group">
                      <label className="cosmos-label">Filter Value</label>
                      <input
                        className="cosmos-input"
                        placeholder="e.g. Completed"
                        value={config.kpiDMO.filterValue || ''}
                        onChange={(e) =>
                          updateConfig({ kpiDMO: { ...config.kpiDMO, filterValue: e.target.value } })
                        }
                      />
                    </div>
                  </div>

                  <div className="cosmos-form-group" style={{ marginTop: '1rem', maxWidth: '300px' }}>
                    <label className="cosmos-label">Revenue per KPI Unit</label>
                    <input
                      className="cosmos-input"
                      type="number"
                      placeholder="e.g. 45.00"
                      value={revenuePerKPI}
                      onChange={(e) => setRevenuePerKPI(e.target.value)}
                    />
                    <p className="cosmos-help-text">Estimated monetary value per conversion/lead/install</p>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="cosmos-alert cosmos-alert--info" style={{ marginTop: '1.5rem' }}>
                <Info size={16} />
                <span className="cosmos-text-sm">
                  KPI will be summed across all geos and time periods.
                  {config.kpiType !== 'revenue' && revenuePerKPI && (
                    <> Estimated revenue = {config.kpiType} count x ${revenuePerKPI} per unit.</>
                  )}
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============ PART 3: Model Settings ============ */}
      {currentPart === 3 && (
        <div className="animate-fade-in">
          {/* Sub-section A: Meridian MTA Cross-feed */}
          <section className="cosmos-section animate-slide-in">
            <div className="cosmos-section__header">
              <div className="cosmos-section__header-left">
                <div className="cosmos-section__icon" style={{ background: '#9050E9' }}>
                  <GitBranch size={18} color="#fff" />
                </div>
                <h2 className="cosmos-section__title">Meridian MTA Cross-feed</h2>
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

              {/* Pull: MTA Priors */}
              <div style={{ border: '1px solid var(--cosmos-border)', borderRadius: 'var(--cosmos-radius-md, 8px)', padding: '20px', marginBottom: '16px' }}>
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

              {/* Push: Meridian ROI to MTA */}
              <div style={{ border: '1px solid var(--cosmos-border)', borderRadius: 'var(--cosmos-radius-md, 8px)', padding: '20px' }}>
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
                      checked={mtaMMMSync?.mmmToMTA || false}
                      onChange={(e) => dispatch({ type: 'UPDATE_MTA_MMM_SYNC', payload: { mmmToMTA: e.target.checked } })}
                    />
                    <span className="cosmos-toggle__track" />
                  </label>
                </div>

                {mtaMMMSync?.mmmToMTA && (
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

                    {trainingStatus === 'complete' ? (
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

          {/* Sub-section B: External Factors */}
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
              <p className="cosmos-text-sm cosmos-text-muted" style={{ marginBottom: '1rem' }}>
                Enable external factors to include as control variables in the model.
              </p>
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
      )}

      {/* Navigation Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--cosmos-border, #e0e0e0)',
      }}>
        <button
          className="cosmos-btn cosmos-btn--neutral"
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          {currentPart === 1 ? 'Back to Home' : 'Back'}
        </button>

        <span className="cosmos-text-sm cosmos-text-muted">
          Part {currentPart} of 3
        </span>

        <button
          className="cosmos-btn cosmos-btn--brand"
          onClick={handleNext}
        >
          {currentPart === 3 ? 'Save & Start Training' : 'Next'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
