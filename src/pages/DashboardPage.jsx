import { useState, useMemo } from 'react';
import { BarChart3, DollarSign, TrendingUp, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, Cell, ComposedChart, ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';

const COLORS = ['#0176D3', '#2E844A', '#FE9339', '#BA0517', '#9050E9', '#04844B', '#3296ED', '#FCC003', '#7B8B8E'];

function formatCurrency(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'roi', label: 'ROI Analysis', icon: DollarSign },
  { key: 'response', label: 'Response Curves', icon: TrendingUp },
  { key: 'effects', label: 'Media Effects', icon: Activity },
];

export default function DashboardPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChannel, setSelectedChannel] = useState(null);

  const data = state.dashboardData;

  if (!data) {
    return (
      <div className="cosmos-section">
        <div className="cosmos-page-header">
          <div className="cosmos-page-header__left">
            <div className="cosmos-page-header__icon" style={{ background: '#001639' }}>
              <BarChart3 size={24} color="#fff" />
            </div>
            <div>
              <div className="cosmos-page-header__title">Meridian Dashboards</div>
              <div className="cosmos-page-header__subtitle">Model results, media analysis, and budget optimization</div>
            </div>
          </div>
        </div>
        <div className="cosmos-section__body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BarChart3 size={64} color="#7B8B8E" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#181818', marginBottom: '0.5rem' }}>No Dashboard Data Available</h3>
          <p className="cosmos-text-muted">Run model training to generate dashboard results and visualizations.</p>
        </div>
      </div>
    );
  }

  const channels = data.channels || [];
  const timeSeries = data.timeSeries || [];
  const channelMetrics = data.channelMetrics || [];

  if (!selectedChannel && channels.length > 0) {
    // Set default without re-render loop
    if (selectedChannel === null && channels.length > 0) {
      // Will be set on first interaction or via useMemo
    }
  }

  const effectiveSelectedChannel = selectedChannel || (channels.length > 0 ? channels[0] : '');

  // Sample time series for area chart (every Nth week)
  const sampledTimeSeries = useMemo(() => {
    if (!timeSeries.length) return [];
    const n = Math.max(1, Math.floor(timeSeries.length / 30));
    return timeSeries.filter((_, i) => i % n === 0);
  }, [timeSeries]);

  // Overview metrics
  const totalRevenue = data.totalRevenue || 0;
  const totalSpend = data.totalSpend || 0;
  const baselinePercent = data.baselinePercent || 0;
  const mediaContribution = data.mediaContribution || 0;

  // Spend vs contribution data
  const spendVsContrib = useMemo(() => {
    return channelMetrics.map((ch) => ({
      channel: ch.name,
      'Spend %': ch.spendPercent || 0,
      'Contribution %': ch.contributionPercent || 0,
    }));
  }, [channelMetrics]);

  // ROI data
  const roiData = useMemo(() => {
    return channelMetrics.map((ch, i) => ({
      channel: ch.name,
      roi: ch.roi || 0,
      mROI: ch.mROI || 0,
      color: COLORS[i % COLORS.length],
    }));
  }, [channelMetrics]);

  // Response curve data for selected channel
  const responseCurveData = useMemo(() => {
    if (!data.responseCurves) return [];
    return data.responseCurves[effectiveSelectedChannel] || [];
  }, [data.responseCurves, effectiveSelectedChannel]);

  // Adstock decay data
  const adstockData = data.adstockDecay || [];
  // Hill saturation data
  const hillData = data.hillSaturation || [];
  // Parameters table
  const parametersTable = data.parameters || [];

  return (
    <div className="cosmos-section animate-fade-in">
      {/* Page Header */}
      <div className="cosmos-page-header">
        <div className="cosmos-page-header__left">
          <div className="cosmos-page-header__icon" style={{ background: '#001639' }}>
            <BarChart3 size={24} color="#fff" />
          </div>
          <div>
            <div className="cosmos-page-header__title">Meridian Dashboards</div>
            <div className="cosmos-page-header__subtitle">Model results, media analysis, and budget optimization</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cosmos-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`cosmos-tabs__item${activeTab === tab.key ? ' cosmos-tabs__item--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} style={{ marginRight: '0.5rem' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            totalRevenue={totalRevenue}
            totalSpend={totalSpend}
            baselinePercent={baselinePercent}
            mediaContribution={mediaContribution}
            sampledTimeSeries={sampledTimeSeries}
            spendVsContrib={spendVsContrib}
            channels={channels}
          />
        )}
        {activeTab === 'roi' && (
          <ROITab roiData={roiData} channelMetrics={channelMetrics} />
        )}
        {activeTab === 'response' && (
          <ResponseCurvesTab
            channels={channels}
            selectedChannel={effectiveSelectedChannel}
            setSelectedChannel={setSelectedChannel}
            responseCurveData={responseCurveData}
            allResponseCurves={data.responseCurves || {}}
          />
        )}
        {activeTab === 'effects' && (
          <MediaEffectsTab
            adstockData={adstockData}
            hillData={hillData}
            parametersTable={parametersTable}
            channels={channels}
          />
        )}
      </div>
    </div>
  );
}

/* ========== OVERVIEW TAB ========== */
function OverviewTab({ totalRevenue, totalSpend, baselinePercent, mediaContribution, sampledTimeSeries, spendVsContrib, channels }) {
  return (
    <div className="animate-slide-in">
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="cosmos-metric">
          <div className="cosmos-metric__label">Total Revenue</div>
          <div className="cosmos-metric__value">{formatCurrency(totalRevenue)}</div>
          <div className="cosmos-metric__sub">Model period</div>
        </div>
        <div className="cosmos-metric">
          <div className="cosmos-metric__label">Total Spend</div>
          <div className="cosmos-metric__value">{formatCurrency(totalSpend)}</div>
          <div className="cosmos-metric__sub">All channels</div>
        </div>
        <div className="cosmos-metric">
          <div className="cosmos-metric__label">Baseline %</div>
          <div className="cosmos-metric__value">{baselinePercent.toFixed(1)}%</div>
          <div className="cosmos-metric__sub">Non-media driven</div>
        </div>
        <div className="cosmos-metric">
          <div className="cosmos-metric__label">Media Contribution</div>
          <div className="cosmos-metric__value">{mediaContribution.toFixed(1)}%</div>
          <div className="cosmos-metric__sub">Media driven</div>
        </div>
      </div>

      {/* Stacked Area Chart */}
      <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">Revenue Decomposition Over Time</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={sampledTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="baseline" stackId="1" fill="#7B8B8E" stroke="#7B8B8E" name="Baseline" />
              {channels.map((ch, i) => (
                <Area
                  key={ch}
                  type="monotone"
                  dataKey={ch}
                  stackId="1"
                  fill={COLORS[i % COLORS.length]}
                  stroke={COLORS[i % COLORS.length]}
                  name={ch}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped Bar Chart: Spend% vs Contribution% */}
      <div className="cosmos-card">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">Spend % vs Contribution %</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendVsContrib}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="Spend %" fill="#0176D3" />
              <Bar dataKey="Contribution %" fill="#2E844A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ========== ROI ANALYSIS TAB ========== */
function ROITab({ roiData, channelMetrics }) {
  return (
    <div className="animate-slide-in">
      {/* ROI Bar Chart with Reference Line */}
      <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">Channel ROI</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" name="ROI" fill="#0176D3">
                {roiData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
              <ReferenceLine y={1} stroke="#BA0517" strokeDasharray="5 5" label="Break-even" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter: ROI vs mROI */}
      <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">ROI vs Marginal ROI</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="roi" name="ROI" type="number" />
              <YAxis dataKey="mROI" name="mROI" type="number" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Channels" data={roiData}>
                {roiData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Metrics Table */}
      <div className="cosmos-card">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">Channel Performance Metrics</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <table className="cosmos-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Spend</th>
                <th>Revenue</th>
                <th>ROI</th>
                <th>mROI</th>
                <th>Contribution %</th>
                <th>CPA</th>
              </tr>
            </thead>
            <tbody>
              {channelMetrics.map((ch, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                    {ch.name}
                  </td>
                  <td>{formatCurrency(ch.spend || 0)}</td>
                  <td>{formatCurrency(ch.revenue || 0)}</td>
                  <td>{(ch.roi || 0).toFixed(2)}</td>
                  <td>{(ch.mROI || 0).toFixed(2)}</td>
                  <td>{(ch.contributionPercent || 0).toFixed(1)}%</td>
                  <td>{formatCurrency(ch.cpa || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========== RESPONSE CURVES TAB ========== */
function ResponseCurvesTab({ channels, selectedChannel, setSelectedChannel, responseCurveData, allResponseCurves }) {
  // Find current spend for reference line
  const currentSpend = responseCurveData.length > 0
    ? responseCurveData.find((d) => d.currentSpend)?.spend || 0
    : 0;

  return (
    <div className="animate-slide-in">
      {/* Main Response Curve */}
      <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">Response Curve</div>
          </div>
          <div>
            <select
              className="cosmos-select"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              {channels.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={responseCurveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="spend" tickFormatter={(v) => formatCurrency(v)} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="upper" fill="#E1F5FE" stroke="#90CAF9" name="Upper CI" />
              <Area type="monotone" dataKey="response" fill="#0176D3" fillOpacity={0.3} stroke="#0176D3" strokeWidth={2} name="Response" />
              <Area type="monotone" dataKey="lower" fill="#E1F5FE" stroke="#90CAF9" name="Lower CI" />
              {currentSpend > 0 && (
                <ReferenceLine x={currentSpend} stroke="#BA0517" strokeDasharray="5 5" label="Current Spend" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of small response curves per channel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {channels.map((ch, i) => {
          const curveData = allResponseCurves[ch] || [];
          return (
            <div key={ch} className="cosmos-card cosmos-card--interactive" onClick={() => setSelectedChannel(ch)}>
              <div className="cosmos-section__header">
                <div className="cosmos-section__header-left">
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                  <div className="cosmos-section__title cosmos-text-sm">{ch}</div>
                </div>
              </div>
              <div className="cosmos-section__body">
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={curveData}>
                    <XAxis dataKey="spend" hide />
                    <YAxis hide />
                    <Line type="monotone" dataKey="response" stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== MEDIA EFFECTS TAB ========== */
function MediaEffectsTab({ adstockData, hillData, parametersTable, channels }) {
  return (
    <div className="animate-slide-in">
      {/* Adstock Decay Chart */}
      <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon"><Activity size={18} /></div>
            <div className="cosmos-section__title">Adstock Decay</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adstockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lag" label={{ value: 'Lag (weeks)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Effect', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {channels.map((ch, i) => (
                <Line
                  key={ch}
                  type="monotone"
                  dataKey={ch}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={ch}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hill Saturation Chart */}
      <div className="cosmos-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__icon"><TrendingUp size={18} /></div>
            <div className="cosmos-section__title">Hill Saturation Curves</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hillData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="spend" tickFormatter={(v) => formatCurrency(v)} />
              <YAxis label={{ value: 'Saturation', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {channels.map((ch, i) => (
                <Line
                  key={ch}
                  type="monotone"
                  dataKey={ch}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={ch}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="cosmos-card">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <div className="cosmos-section__title">Media Transformation Parameters</div>
          </div>
        </div>
        <div className="cosmos-section__body">
          <table className="cosmos-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Alpha (Decay)</th>
                <th>Half-life (weeks)</th>
                <th>EC (Half-saturation)</th>
                <th>Slope (Hill)</th>
              </tr>
            </thead>
            <tbody>
              {parametersTable.map((row, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                    {row.channel}
                  </td>
                  <td>{(row.alpha || 0).toFixed(3)}</td>
                  <td>{(row.halfLife || 0).toFixed(1)}</td>
                  <td>{formatCurrency(row.ec || 0)}</td>
                  <td>{(row.slope || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
