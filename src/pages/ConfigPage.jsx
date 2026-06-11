import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { buildIdentificationDemo } from '../data/dataGenerator';
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
  Unlink,
  ShieldCheck,
  Route,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  LabelList,
  ResponsiveContainer,
} from 'recharts';

const IDENT_COLORS = ['#0176D3', '#2E844A', '#FE9339', '#9050E9', '#04844B', '#3296ED'];

// Renders a "%pt" callout at a line's peak/trough (only where value is non-null).
function PctLabel({ x, y, value, fill, dy = -6 }) {
  if (value == null) return null;
  return (
    <text x={x} y={y} dy={dy} fill={fill} fontSize={11} fontWeight={700} textAnchor="middle">
      {Math.round(value)}%
    </text>
  );
}

// MTA-prior confidence → Meridian prior std. Tighter std = Meridian starts more
// certain. PRIOR_DEFAULT_STD is the vague, uninformed prior we improve on.
const PRIOR_DEFAULT_STD = 1.2;
const STD_BY_CONFIDENCE = { High: 0.4, Medium: 0.7, Low: 1.0 };

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

// --- DMO Objects and Fields ---
const DMO_OBJECTS = [
  'Revenue__dlm',
  'Order__dlm',
  'Opportunity__dlm',
  'Sales_Transaction__dlm',
  'Conversion_Event__dlm',
  'Lead_Conversion__dlm',
  'Purchase_Event__dlm',
  'Subscription__dlm',
  'Engagement_Event__dlm',
  'Campaign_Influence__dlm',
  'Web_Session__dlm',
  'App_Event__dlm',
  'Marketing_Attribution__dlm',
  'Customer_Lifetime_Value__dlm',
];

const DMO_FIELDS = {
  'Revenue__dlm': ['Total_Revenue__c', 'Net_Revenue__c', 'Gross_Revenue__c', 'Recurring_Revenue__c', 'Revenue_Amount__c', 'Transaction_Value__c'],
  'Order__dlm': ['Order_Total__c', 'Order_Value__c', 'Order_Count__c', 'Average_Order_Value__c', 'Net_Order_Revenue__c'],
  'Opportunity__dlm': ['Amount__c', 'Expected_Revenue__c', 'Closed_Won_Amount__c', 'Pipeline_Value__c', 'Opportunity_Count__c'],
  'Sales_Transaction__dlm': ['Transaction_Amount__c', 'Net_Sales__c', 'Gross_Sales__c', 'Units_Sold__c', 'Discount_Amount__c'],
  'Conversion_Event__dlm': ['Conversion_Count__c', 'Conversion_Value__c', 'Assisted_Conversions__c', 'Direct_Conversions__c', 'Conversion_Rate__c'],
  'Lead_Conversion__dlm': ['Converted_Leads__c', 'Lead_Value__c', 'Qualified_Leads__c', 'MQL_Count__c', 'SQL_Count__c'],
  'Purchase_Event__dlm': ['Purchase_Count__c', 'Purchase_Value__c', 'First_Purchase__c', 'Repeat_Purchase__c', 'Average_Purchase_Value__c'],
  'Subscription__dlm': ['New_Subscriptions__c', 'Subscription_Revenue__c', 'Churn_Count__c', 'MRR__c', 'ARR__c'],
  'Engagement_Event__dlm': ['Engagement_Score__c', 'Page_Views__c', 'Session_Count__c', 'Time_On_Site__c', 'Form_Submissions__c'],
  'Campaign_Influence__dlm': ['Influenced_Revenue__c', 'Influenced_Pipeline__c', 'Campaign_ROI__c', 'Touches__c', 'First_Touch_Revenue__c'],
  'Web_Session__dlm': ['Sessions__c', 'Unique_Visitors__c', 'Bounce_Rate__c', 'Pages_Per_Session__c', 'Goal_Completions__c'],
  'App_Event__dlm': ['App_Installs__c', 'In_App_Purchases__c', 'Active_Users__c', 'Session_Length__c', 'Event_Count__c'],
  'Marketing_Attribution__dlm': ['Attributed_Revenue__c', 'Attributed_Conversions__c', 'Touch_Points__c', 'Attribution_Weight__c', 'Channel_Contribution__c'],
  'Customer_Lifetime_Value__dlm': ['CLV__c', 'Predicted_CLV__c', 'Historical_CLV__c', 'Average_CLV__c', 'CLV_Segment__c'],
};

const DMO_FIELDS_DEFAULT = ['Amount__c', 'Count__c', 'Value__c', 'Total__c', 'Revenue__c'];

// --- Searchable Select Component ---
function SearchableSelect({ placeholder, value, options, onChange }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const displayValue = value || '';

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="cosmos-input"
        placeholder={placeholder}
        value={isOpen ? search : displayValue}
        onChange={(e) => { setSearch(e.target.value); if (!isOpen) setIsOpen(true); }}
        onFocus={() => { setIsOpen(true); setSearch(''); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{ paddingRight: '32px' }}
      />
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#747474" strokeWidth="2"
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--cosmos-neutral-100, #fff)', border: '1px solid var(--cosmos-border, #e5e5e5)',
          borderRadius: 'var(--cosmos-radius-sm, 4px)', boxShadow: 'var(--cosmos-shadow-lg)',
          maxHeight: 200, overflowY: 'auto', marginTop: 4,
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--cosmos-neutral-50)' }}>No results found</div>
          )}
          {filtered.map((opt) => (
            <div
              key={opt}
              style={{
                padding: '8px 12px', fontSize: 13, cursor: 'pointer',
                background: opt === value ? 'var(--cosmos-info-light, #eaf5fe)' : 'transparent',
                fontWeight: opt === value ? 600 : 400,
              }}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setIsOpen(false); setSearch(''); }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cosmos-neutral-95, #f3f3f3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = opt === value ? 'var(--cosmos-info-light, #eaf5fe)' : 'transparent'; }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConfigPage() {
  const { state, dispatch } = useApp();
  const { config, mtaMMMSync, trainingStatus } = state;

  // Collinearity / identification demo: the "killer use-case" for MTA priors.
  // When two channels move together in spend data, Meridian can identify their
  // combined ROI but not the split between them. MTA supplies the split from
  // user-level paths, letting Meridian resolve the individual ROIs.
  const identification = useMemo(() => {
    if (!state.pipelineData) return null;
    return buildIdentificationDemo(state.pipelineData, state.mtaConfig?.results, 0.8);
  }, [state.pipelineData, state.mtaConfig?.results]);

  // ---- MTA-insight cards (shown when "pull MTA priors" is on) ----------------
  // All three derive from MTA, which sees user-level journeys Meridian can't.
  // Series are deterministic (layered sines, no Math.random) so the demo is stable.

  // The two channels Meridian struggles to separate (falls back to a sensible
  // default pair when no collinear pair is detected in the pipeline data).
  const lockPair = useMemo(() => {
    if (identification?.pair) return [identification.pair.a, identification.pair.b];
    return ['Meta Ads', 'Google Ads'];
  }, [identification]);

  const lockCorr = identification?.pair?.r ?? 0.91;

  // Card 1 — Contribution split. The two lines are each channel's % of the
  // pair's combined contribution (they sum to 100 at every point).
  //   Pre-MTA  : Meridian can't separate collinear spend, so it assumes the
  //              split is IDENTICAL — both lines sit on the ~50/50 midline.
  //   Post-MTA : user-level paths reveal the true split (from identification),
  //              so the lines diverge to e.g. 60/40 while still summing to 100.
  // Peaks/troughs are labelled with their contribution percentage points.
  const splitA = useMemo(() => {
    const s = identification?.split?.a;
    return s && s > 0 && s < 1 ? s : 0.6; // share for channel A post-MTA
  }, [identification]);

  const lockstepData = useMemo(() => {
    const N = 26;
    // Shared seasonal shape both channels ride (this co-movement is exactly
    // what makes them collinear). Amplitude is in contribution points.
    const wave = (t) => 7 * Math.sin(t * 0.5 - 0.4) + 3 * Math.sin(t * 0.27 + 1.1);
    const aPts = N - 1;
    const meanA = Math.round(splitA * 100); // post-MTA mean for channel A
    const rows = Array.from({ length: N }, (_, t) => {
      const w = wave(t);
      // Pre-MTA: both assumed identical → both on the 50/50 midline (tiny
      // offset so the two lines are visibly stacked, not one on top of other).
      const preA = Math.round((50 + w + 0.6) * 10) / 10;
      const preB = Math.round((50 + w - 0.6) * 10) / 10;
      // Post-MTA: diverge around the true split; A and B always sum to 100.
      const postA = Math.round((meanA + w) * 10) / 10;
      const postB = Math.round((100 - postA) * 10) / 10;
      return { t, preA, preB, postA, postB };
    });
    // Tag the global peak and trough of channel A's post-MTA line for labels;
    // mirror those same x-positions on B so the callouts line up.
    let hi = 1, lo = 1;
    for (let i = 1; i < aPts; i++) {
      if (rows[i].postA > rows[hi].postA) hi = i;
      if (rows[i].postA < rows[lo].postA) lo = i;
    }
    return rows.map((r, i) => ({
      ...r,
      postAlbl: i === hi || i === lo ? r.postA : null,
      postBlbl: i === hi || i === lo ? r.postB : null,
    }));
  }, [splitA]);

  // Card 2 — ROI Confidence. MTA gives each channel an ROI anchor; its
  // confidence sets how tight the Meridian prior is (high confidence → narrow
  // prior std → Meridian starts far more certain). Honest, computed headline.
  const confidenceRows = useMemo(() => {
    const rows = [
      { channel: 'Google Ads', mtaROI: 2.8, confidence: 'High' },
      { channel: 'Meta Ads', mtaROI: 1.9, confidence: 'High' },
      { channel: 'Amazon Ads', mtaROI: 2.1, confidence: 'High' },
      { channel: 'YouTube Ads', mtaROI: 1.8, confidence: 'Medium' },
      { channel: 'LinkedIn Ads', mtaROI: 1.6, confidence: 'Medium' },
      { channel: 'TikTok Ads', mtaROI: 1.2, confidence: 'Low' },
    ];
    return rows.map((r) => {
      const std = STD_BY_CONFIDENCE[r.confidence];
      return { ...r, std, certaintyPct: Math.round((1 - std / PRIOR_DEFAULT_STD) * 100) };
    });
  }, []);
  const confidenceHeadline = useMemo(() => {
    const meanStd = confidenceRows.reduce((s, r) => s + r.std, 0) / confidenceRows.length;
    return Math.round((1 - meanStd / PRIOR_DEFAULT_STD) * 100); // avg uncertainty reduction
  }, [confidenceRows]);

  // Card 3 — Customer Journey. The thing only MTA can see: the sequence of
  // touches. Upper-funnel channels assist; closers convert. Keeps Meridian
  // from zeroing out an assisting channel.
  const journey = { assist: lockPair[0], close: lockPair[1], assistPct: 38 };

  const [priorsApplied, setPriorsApplied] = useState(false);
  const handleApplyMTAPriors = () => {
    setPriorsApplied(true);
    dispatch({
      type: 'UPDATE_MTA_MMM_SYNC',
      payload: { mtaToMMM: true, lastSyncDate: new Date().toISOString() },
    });
  };

  const [currentPart, setCurrentPart] = useState(1);
  const [excludedPipelines, setExcludedPipelines] = useState({});
  const [sourceMetrics, setSourceMetrics] = useState({});
  const [firstPartyObjects, setFirstPartyObjects] = useState({});
  const [firstPartyFields, setFirstPartyFields] = useState({});
  const [totalConnectActive, setTotalConnectActive] = useState(false);
  const [totalConnectMetrics, setTotalConnectMetrics] = useState({});
  const [totalConnectEnabled, setTotalConnectEnabled] = useState({});

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

          {/* Sub-section B: First Party Data (Marketing Cloud) */}
          <section className="cosmos-section animate-slide-in">
            <div className="cosmos-section__header">
              <div className="cosmos-section__header-left">
                <div className="cosmos-section__icon" style={{ background: '#FF6D2E' }}>
                  <Mail size={18} color="#fff" />
                </div>
                <h2 className="cosmos-section__title">First Party Data (Marketing Cloud)</h2>
              </div>
            </div>
            <div className="cosmos-section__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span className="cosmos-text-sm cosmos-text-bold">Connect First Party Data from Marketing Cloud</span>
                <label className="cosmos-toggle">
                  <input
                    type="checkbox"
                    checked={config.connectFirstParty}
                    onChange={(e) => updateConfig({ connectFirstParty: e.target.checked })}
                  />
                  <span className="cosmos-toggle__track" />
                </label>
              </div>

              {config.connectFirstParty && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {[
                    { id: 'email', name: 'Email', icon: <Mail size={18} />, activities: ['Email Opens', 'Emails Delivered', 'Emails Clicked', 'Emails Sent', 'Email Bounces', 'Email Unsubscribes'] },
                    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare size={18} />, activities: ['WhatsApp Delivered', 'WhatsApp Read', 'WhatsApp Replied', 'WhatsApp Sent', 'WhatsApp Failed'] },
                    { id: 'sms', name: 'SMS', icon: <Smartphone size={18} />, activities: ['SMS Delivered', 'SMS Clicked', 'SMS Sent', 'SMS Bounced', 'SMS Opted Out'] },
                  ].map((channel) => (
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
                          <span className="cosmos-toggle__track" />
                        </label>
                      </div>

                      {config.firstPartyChannels[channel.id] && (
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--cosmos-border, #e0e0e0)' }}>
                          <div className="cosmos-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="cosmos-label cosmos-text-xs">Activity Represents (Media Activity)</label>
                            <select
                              className="cosmos-select"
                              value={firstPartyObjects[channel.id] || ''}
                              onChange={(e) => setFirstPartyObjects({ ...firstPartyObjects, [channel.id]: e.target.value })}
                            >
                              <option value="">-- Select Activity --</option>
                              {channel.activities.map((act) => (
                                <option key={act} value={act}>{act}</option>
                              ))}
                            </select>
                            <p className="cosmos-help-text">Select the Data Cloud activity field that represents engagement for this channel</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="cosmos-badge cosmos-badge--success" style={{ fontSize: '11px' }}>
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
                <div className="cosmos-section__icon" style={{ background: '#032D60' }}>
                  <Tv size={18} color="#fff" />
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
                    checked={totalConnectActive}
                    onChange={(e) => setTotalConnectActive(e.target.checked)}
                  />
                  <span className="cosmos-toggle__track" />
                </label>
              </div>

              {totalConnectActive && (
                <div>
                  {/* Pipeline Selection List */}
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Pipeline Selection</h4>
                  <div style={{
                    background: 'var(--cosmos-neutral-100)', border: '1px solid var(--cosmos-border)',
                    borderRadius: 'var(--cosmos-radius-md)', maxHeight: 220, overflowY: 'auto', marginBottom: 20,
                  }}>
                    {[
                      { id: 'tv_linear_national', name: 'TV - Linear National' },
                      { id: 'tv_linear_local', name: 'TV - Linear Local' },
                      { id: 'tv_streaming_hulu', name: 'TV - Streaming (Hulu)' },
                      { id: 'tv_streaming_roku', name: 'TV - Streaming (Roku)' },
                      { id: 'tv_streaming_paramount', name: 'TV - Streaming (Paramount+)' },
                      { id: 'radio_national', name: 'Radio - National' },
                      { id: 'radio_local', name: 'Radio - Local/Spot' },
                      { id: 'radio_streaming', name: 'Radio - Streaming (Spotify/Pandora)' },
                      { id: 'print_newspaper', name: 'Print - Newspaper' },
                      { id: 'print_magazine', name: 'Print - Magazine' },
                      { id: 'ooh_billboards', name: 'OOH - Billboards' },
                      { id: 'ooh_transit', name: 'OOH - Transit' },
                      { id: 'ooh_digital', name: 'OOH - Digital Screens' },
                      { id: 'cinema', name: 'Cinema' },
                    ].map((p) => {
                      const isSelected = !!totalConnectEnabled[p.id];
                      return (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', padding: '8px 14px',
                          borderBottom: '1px solid var(--cosmos-neutral-90)',
                          background: isSelected ? 'var(--cosmos-info-light)' : 'transparent',
                        }}>
                          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => setTotalConnectEnabled({ ...totalConnectEnabled, [p.id]: e.target.checked })}
                            />
                            <span style={{ fontWeight: isSelected ? 600 : 400 }}>{p.name}</span>
                          </label>
                          {isSelected && (
                            <span className="cosmos-badge cosmos-badge--success" style={{ fontSize: 10 }}>Selected</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Meridian Measurement Mapping */}
                  {Object.keys(totalConnectEnabled).filter(k => totalConnectEnabled[k]).length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Meridian Measurement Mapping</h4>
                      <p className="cosmos-text-sm cosmos-text-muted" style={{ marginBottom: 12 }}>
                        For each selected TotalConnect source, choose which measurement represents the
                        <strong> Media Activity</strong> and which represents the <strong>Media Cost</strong>.
                      </p>
                      <div style={{ border: '1px solid var(--cosmos-border)', borderRadius: 'var(--cosmos-radius-md)', overflow: 'hidden' }}>
                        <table className="cosmos-table">
                          <thead>
                            <tr>
                              <th style={{ width: '25%' }}>Source</th>
                              <th style={{ width: '37%' }}>Media Activity Measurement</th>
                              <th style={{ width: '38%' }}>Media Cost Measurement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(totalConnectEnabled).filter(k => totalConnectEnabled[k]).map((id) => {
                              const name = id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                              const isLinearTV = id.includes('tv_linear');
                              const isStreamingTV = id.includes('tv_streaming');
                              const isRadioStream = id.includes('radio_streaming');
                              const isRadioTrad = id.includes('radio') && !id.includes('streaming');
                              const isOOHDigital = id === 'ooh_digital';
                              const isOOH = id.includes('ooh') && !isOOHDigital;
                              const isPrint = id.includes('print');
                              const isCinema = id === 'cinema';

                              const activityOptions = isLinearTV
                                ? ['TV Gross Rating Points (GRPs)', 'TV Target Rating Points (TRPs)', 'TV Impressions', 'TV Reach', 'TV Frequency', 'TV Spot Count']
                                : isStreamingTV
                                ? ['CTV Impressions', 'CTV Completed Views', 'CTV Video Completion Rate', 'CTV Reach', 'CTV Frequency', 'CTV Clicks']
                                : isRadioStream
                                ? ['Audio Impressions', 'Audio Listens (30s+)', 'Audio Completion Rate', 'Audio Reach', 'Audio Frequency', 'Audio Clicks']
                                : isRadioTrad
                                ? ['Radio Gross Impressions', 'Radio Spots Aired', 'Radio GRPs', 'Radio Reach', 'Radio Frequency']
                                : isOOHDigital
                                ? ['DOOH Impressions', 'DOOH Plays', 'DOOH Share of Voice', 'DOOH Reach', 'DOOH Frequency', 'DOOH Dwell Time (avg sec)']
                                : isOOH
                                ? ['Transit Impressions', 'Transit Panels', 'Transit Reach', 'Transit Frequency']
                                : isPrint
                                ? ['Print Circulation', 'Print Readership', 'Print Page Views', 'Print Ad Insertions']
                                : isCinema
                                ? ['Cinema Impressions', 'Cinema Admissions', 'Cinema Screen Count', 'Cinema Reach']
                                : ['Impressions', 'Reach', 'GRPs'];

                              const costOptions = isLinearTV
                                ? ['TV Net Spend', 'TV Gross Spend', 'TV CPP (Cost Per Point)', 'TV CPM (Cost Per Mille)']
                                : isStreamingTV
                                ? ['CTV Net Spend', 'CTV Gross Spend', 'CTV CPM', 'CTV CPCV (Cost Per Completed View)']
                                : isRadioStream
                                ? ['Audio Net Spend', 'Audio Gross Spend', 'Audio CPM', 'Audio CTR']
                                : isRadioTrad
                                ? ['Radio Net Spend', 'Radio Gross Spend', 'Radio CPP', 'Radio CPM']
                                : isOOHDigital
                                ? ['DOOH Net Spend', 'DOOH Gross Spend', 'DOOH CPM']
                                : isOOH
                                ? ['Transit Net Spend', 'Transit Gross Spend', 'Transit CPM']
                                : isPrint
                                ? ['Print Gross Spend', 'Print Net Spend', 'Print CPM', 'Print Response Rate']
                                : isCinema
                                ? ['Cinema Net Spend', 'Cinema Gross Spend', 'Cinema CPM', 'Cinema Cost Per Admission']
                                : ['Net Spend', 'Gross Spend', 'CPM'];
                              return (
                                <tr key={id}>
                                  <td style={{ fontWeight: 600, fontSize: 12 }}>{name}</td>
                                  <td>
                                    <select
                                      className="cosmos-select"
                                      style={{ fontSize: 12 }}
                                      value={totalConnectMetrics[id + '_activity'] || ''}
                                      onChange={(e) => setTotalConnectMetrics({ ...totalConnectMetrics, [id + '_activity']: e.target.value })}
                                    >
                                      <option value="">-- Select Activity --</option>
                                      {activityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                  </td>
                                  <td>
                                    <select
                                      className="cosmos-select"
                                      style={{ fontSize: 12 }}
                                      value={totalConnectMetrics[id + '_cost'] || ''}
                                      onChange={(e) => setTotalConnectMetrics({ ...totalConnectMetrics, [id + '_cost']: e.target.value })}
                                    >
                                      <option value="">-- Select Cost --</option>
                                      {costOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
                </select>
                <p className="cosmos-help-text">
                  {config.kpiType === 'revenue'
                    ? 'Revenue is the monetary value generated. Must be summable across geo and time.'
                    : 'Conversions are countable events (purchases, sign-ups). Must be summable across geo and time.'}
                </p>
              </div>

              {/* DMO Configuration — shown for both KPI types */}
              <div style={{ marginTop: '1.5rem', border: '1px solid var(--cosmos-border)', borderRadius: 'var(--cosmos-radius-md)', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>
                  Data Model Object (DMO) Configuration
                </h4>
                <p className="cosmos-text-sm cosmos-text-muted" style={{ marginBottom: '16px' }}>
                  Select the Data Cloud object and field that contains your {config.kpiType === 'revenue' ? 'revenue' : 'conversion'} data.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="cosmos-form-group">
                    <label className="cosmos-label">DMO Object</label>
                    <SearchableSelect
                      placeholder="Search objects..."
                      value={config.kpiDMO.objectName}
                      options={DMO_OBJECTS}
                      onChange={(val) => updateConfig({ kpiDMO: { ...config.kpiDMO, objectName: val, fieldName: '' } })}
                    />
                  </div>
                  <div className="cosmos-form-group">
                    <label className="cosmos-label">DMO Field</label>
                    <SearchableSelect
                      placeholder="Search fields..."
                      value={config.kpiDMO.fieldName}
                      options={DMO_FIELDS[config.kpiDMO.objectName] || DMO_FIELDS_DEFAULT}
                      onChange={(val) => updateConfig({ kpiDMO: { ...config.kpiDMO, fieldName: val } })}
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
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
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

              </div>

              {/* Preview */}
              <div className="cosmos-alert cosmos-alert--info" style={{ marginTop: '1.5rem' }}>
                <Info size={16} />
                <span className="cosmos-text-sm">
                  {config.kpiType === 'revenue'
                    ? 'Revenue KPI will be summed across all geos and time periods for model training.'
                    : 'Conversions will be summed across all geos and time periods for model training.'
                  }
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
                    <div className="cosmos-form-group" style={{ maxWidth: '420px' }}>
                      <label className="cosmos-label">Select MTA Model</label>
                      <select className="cosmos-select">
                        <option value="data_driven">Data-Driven Attribution (Default)</option>
                        <option value="position_based">Position-Based (U-Shaped)</option>
                        <option value="time_decay">Time Decay</option>
                        <option value="linear">Linear</option>
                      </select>
                      <p className="cosmos-help-text">Three insights from your MTA model, used to set Meridian&apos;s Bayesian priors.</p>
                    </div>

                    {/* Three MTA-insight cards */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '16px',
                        marginTop: '16px',
                      }}
                    >
                      {/* CARD 1 — Contribution split (assumed identical → differentiated) */}
                      <div className="cosmos-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <Unlink size={15} color="var(--cosmos-brand)" />
                          <span className="cosmos-text-xs cosmos-text-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--cosmos-neutral-50)' }}>
                            Contribution Split
                          </span>
                        </div>
                        <p className="cosmos-help-text" style={{ margin: '0 0 8px' }}>
                          <strong>{lockPair[0]}</strong> &amp; <strong>{lockPair[1]}</strong> are{' '}
                          {Math.round(Math.abs(lockCorr) * 100)}% lock-step in spend. Lines show each
                          channel&apos;s share of the pair&apos;s contribution.
                        </p>

                        {/* channel legend */}
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '6px' }}>
                          <span className="cosmos-text-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: 10, height: 3, borderRadius: 2, background: IDENT_COLORS[0], display: 'inline-block' }} />
                            {lockPair[0]}
                          </span>
                          <span className="cosmos-text-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: 10, height: 3, borderRadius: 2, background: IDENT_COLORS[1], display: 'inline-block' }} />
                            {lockPair[1]}
                          </span>
                        </div>

                        <div style={{ marginBottom: '2px' }}>
                          <span className="cosmos-text-xs cosmos-text-muted">Pre-MTA — contribution assumed identical</span>
                          <ResponsiveContainer width="100%" height={72}>
                            <LineChart data={lockstepData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <Line type="monotone" dataKey="preA" stroke={IDENT_COLORS[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
                              <Line type="monotone" dataKey="preB" stroke={IDENT_COLORS[1]} strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <span className="cosmos-text-xs cosmos-text-muted">Post-MTA — accurately differentiated</span>
                          <ResponsiveContainer width="100%" height={72}>
                            <LineChart data={lockstepData} margin={{ top: 14, right: 12, left: 12, bottom: 0 }}>
                              <Line type="monotone" dataKey="postA" stroke={IDENT_COLORS[0]} strokeWidth={2} dot={false} isAnimationActive={false}>
                                <LabelList dataKey="postAlbl" content={(p) => <PctLabel {...p} fill={IDENT_COLORS[0]} dy={-6} />} />
                              </Line>
                              <Line type="monotone" dataKey="postB" stroke={IDENT_COLORS[1]} strokeWidth={2} dot={false} isAnimationActive={false}>
                                <LabelList dataKey="postBlbl" content={(p) => <PctLabel {...p} fill={IDENT_COLORS[1]} dy={14} />} />
                              </Line>
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                          <span className="cosmos-badge cosmos-badge--success">
                            Split resolved: {Math.round(splitA * 100)}/{100 - Math.round(splitA * 100)}
                          </span>
                        </div>
                      </div>

                      {/* CARD 2 — ROI Confidence */}
                      <div className="cosmos-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <ShieldCheck size={15} color="var(--cosmos-brand)" />
                          <span className="cosmos-text-xs cosmos-text-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--cosmos-neutral-50)' }}>
                            ROI Confidence
                          </span>
                        </div>
                        <p className="cosmos-help-text" style={{ margin: '0 0 10px' }}>
                          MTA gives each channel an ROI anchor — and how hard to trust it. High
                          confidence tightens Meridian&apos;s prior.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          {confidenceRows.map((row) => {
                            const variant = row.confidence === 'High' ? 'success' : row.confidence === 'Medium' ? 'warning' : 'neutral';
                            const barColor = row.confidence === 'High' ? 'var(--cosmos-success)' : row.confidence === 'Medium' ? 'var(--cosmos-warning)' : 'var(--cosmos-neutral-60)';
                            return (
                              <div key={row.channel} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 34px', alignItems: 'center', gap: '8px' }}>
                                <span className="cosmos-text-xs" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.channel}</span>
                                <div style={{ height: 7, borderRadius: 'var(--cosmos-radius-pill)', background: 'var(--cosmos-neutral-90)', overflow: 'hidden' }}>
                                  <div style={{ width: `${row.certaintyPct}%`, height: '100%', background: barColor, borderRadius: 'var(--cosmos-radius-pill)' }} />
                                </div>
                                <span className="cosmos-text-xs cosmos-text-bold" style={{ color: `var(--cosmos-${variant === 'neutral' ? 'neutral-50' : variant})`, textAlign: 'right' }}>
                                  {row.mtaROI.toFixed(1)}x
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                          <span className="cosmos-badge cosmos-badge--success">Meridian starts {confidenceHeadline}% more certain</span>
                        </div>
                      </div>

                      {/* CARD 3 — Customer Journey */}
                      <div className="cosmos-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <Route size={15} color="var(--cosmos-brand)" />
                          <span className="cosmos-text-xs cosmos-text-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--cosmos-neutral-50)' }}>
                            Customer Journey
                          </span>
                        </div>
                        <p className="cosmos-help-text" style={{ margin: '0 0 14px' }}>
                          MTA sees the order of touches — what Meridian can&apos;t. Upper-funnel
                          channels assist the win.
                        </p>

                        {/* assist → close → convert flow */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 0 14px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--cosmos-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                              <span className="cosmos-text-xs cosmos-text-bold" style={{ color: 'var(--cosmos-brand)' }}>Assist</span>
                            </div>
                            <span className="cosmos-text-xs cosmos-text-muted" style={{ display: 'block', marginTop: 4 }}>{journey.assist}</span>
                          </div>
                          <ArrowRight size={16} color="var(--cosmos-neutral-60)" style={{ flexShrink: 0, marginBottom: 18 }} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--cosmos-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                              <span className="cosmos-text-xs cosmos-text-bold" style={{ color: 'var(--cosmos-brand)' }}>Close</span>
                            </div>
                            <span className="cosmos-text-xs cosmos-text-muted" style={{ display: 'block', marginTop: 4 }}>{journey.close}</span>
                          </div>
                          <ArrowRight size={16} color="var(--cosmos-neutral-60)" style={{ flexShrink: 0, marginBottom: 18 }} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--cosmos-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                              <CheckCircle size={22} color="var(--cosmos-success)" />
                            </div>
                            <span className="cosmos-text-xs cosmos-text-muted" style={{ display: 'block', marginTop: 4 }}>Convert</span>
                          </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                          <span className="cosmos-badge cosmos-badge--info">{journey.assistPct}% of wins are assisted</span>
                          <p className="cosmos-help-text" style={{ margin: '8px 0 0' }}>
                            Keeps Meridian from zeroing out {journey.assist}.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Single apply CTA */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                      {priorsApplied && (
                        <span className="cosmos-text-sm" style={{ color: 'var(--cosmos-success)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={15} /> Applied to Meridian priors
                        </span>
                      )}
                      <button
                        className={`cosmos-btn ${priorsApplied ? 'cosmos-btn--success' : 'cosmos-btn--brand'}`}
                        onClick={handleApplyMTAPriors}
                        disabled={priorsApplied}
                      >
                        <Sparkles size={16} />
                        {priorsApplied ? 'MTA Insights Applied' : 'Apply MTA Insights to Priors'}
                      </button>
                    </div>
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
                      <span className="cosmos-toggle__track" />
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
