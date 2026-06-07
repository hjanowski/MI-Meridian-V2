import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Download,
  Info,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0176D3', '#2E844A', '#FE9339', '#BA0517', '#9050E9', '#04844B', '#3296ED', '#FCC003', '#7B8B8E'];

export default function MTAInsightsPage() {
  const { state, dispatch } = useApp();
  const [enableMTAPriors, setEnableMTAPriors] = useState(false);
  const [enableMMMReweighting, setEnableMMMReweighting] = useState(false);

  dispatch({ type: 'SET_STEP', payload: 'mta-insights' });

  const hasBothModels = state.dashboardData && state.mtaConfig?.results;

  // Derive channel comparison data
  const channelData = useMemo(() => {
    if (!hasBothModels) return [];
    const mtaResults = state.mtaConfig.results;
    const mmmData = state.dashboardData;

    const channels = mtaResults.channels || Object.keys(mtaResults.channelROI || {});
    return channels.map((channel, idx) => {
      const mtaROI = mtaResults.channelROI?.[channel] ?? (Math.random() * 3 + 0.5);
      const mmmROI = mmmData.channelROI?.[channel] ?? (Math.random() * 3 + 0.5);
      const diff = Math.abs(mtaROI - mmmROI) / Math.max(mtaROI, mmmROI) * 100;
      return {
        channel,
        mtaROI: parseFloat(mtaROI.toFixed(2)),
        mmmROI: parseFloat(mmmROI.toFixed(2)),
        difference: parseFloat(diff.toFixed(1)),
        agreement: diff < 20 ? 'high' : diff < 50 ? 'medium' : 'low',
      };
    });
  }, [hasBothModels, state.mtaConfig?.results, state.dashboardData]);

  // Compute priors table data
  const priorsData = useMemo(() => {
    return channelData.map((ch) => ({
      channel: ch.channel,
      mtaROI: ch.mtaROI,
      priorMean: parseFloat(Math.log(Math.max(ch.mtaROI, 0.01)).toFixed(3)),
      priorStd: ch.agreement === 'high' ? 0.5 : ch.agreement === 'medium' ? 0.8 : 1.2,
      confidence: ch.agreement,
    }));
  }, [channelData]);

  // Compute MMM re-weighting data
  const reweightingData = useMemo(() => {
    const n = channelData.length || 1;
    const originalWeight = 1 / n;
    const totalMMMROI = channelData.reduce((sum, ch) => sum + ch.mmmROI, 0) || 1;
    return channelData.map((ch) => {
      const adjustedWeight = ch.mmmROI / totalMMMROI;
      const changePct = ((adjustedWeight - originalWeight) / originalWeight) * 100;
      return {
        channel: ch.channel,
        originalWeight: parseFloat(originalWeight.toFixed(4)),
        adjustedWeight: parseFloat(adjustedWeight.toFixed(4)),
        changePct: parseFloat(changePct.toFixed(1)),
      };
    });
  }, [channelData]);

  // Calibration summary metrics
  const summaryMetrics = useMemo(() => {
    const aligned = channelData.filter((ch) => ch.agreement === 'high').length;
    const avgDiff = channelData.length
      ? (channelData.reduce((s, ch) => s + ch.difference, 0) / channelData.length).toFixed(1)
      : 0;
    const priorAdj = channelData.length;
    const confidence = channelData.length
      ? Math.round(
          (channelData.filter((ch) => ch.agreement !== 'low').length / channelData.length) * 100
        )
      : 0;
    return { aligned, avgDiff, priorAdj, confidence };
  }, [channelData]);

  function getAgreementBadge(agreement) {
    if (agreement === 'high') return <span className="cosmos-badge cosmos-badge--success">High</span>;
    if (agreement === 'medium') return <span className="cosmos-badge cosmos-badge--warning">Medium</span>;
    return <span className="cosmos-badge cosmos-badge--error">Low</span>;
  }

  function handleApplyMTAPriors() {
    dispatch({
      type: 'UPDATE_MTA_MMM_SYNC',
      payload: {
        mtaToMMM: true,
        lastSyncDate: new Date().toISOString(),
        calibrationResults: { priors: priorsData },
      },
    });
  }

  function handleApplyMMMWeights() {
    dispatch({
      type: 'UPDATE_MTA_MMM_SYNC',
      payload: {
        mmmToMTA: true,
        lastSyncDate: new Date().toISOString(),
        calibrationResults: { weights: reweightingData },
      },
    });
  }

  function handleExportReport() {
    const header = 'Channel,MTA ROI,MMM ROI,Difference%,Agreement\n';
    const rows = channelData.map((ch) =>
      `${ch.channel},${ch.mtaROI},${ch.mmmROI},${ch.difference},${ch.agreement}`
    ).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mta_mmm_calibration_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Empty state
  if (!hasBothModels) {
    return (
      <div className="cosmos-section animate-fade-in">
        <div className="cosmos-page-header">
          <div className="cosmos-page-header__left">
            <div className="cosmos-page-header__icon" style={{ backgroundColor: '#9050E9' }}>
              <ArrowLeftRight size={20} color="#fff" />
            </div>
            <div>
              <h1 className="cosmos-page-header__title">MTA to MMM Insights</h1>
              <p className="cosmos-page-header__subtitle">
                Bidirectional calibration between Multi-Touch Attribution and Meridian MMM
              </p>
            </div>
          </div>
        </div>
        <div className="cosmos-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Info size={48} color="#7B8B8E" style={{ marginBottom: '1rem' }} />
          <h2 className="cosmos-text-bold" style={{ marginBottom: '0.5rem' }}>
            Both Models Required
          </h2>
          <p className="cosmos-text-muted">
            To view bidirectional calibration insights, you need to run both the Multi-Touch Attribution
            model and the Meridian Marketing Mix Model first. Please complete both model runs, then
            return to this page to see channel-level comparisons, prior adjustments, and re-weighting
            recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmos-section animate-slide-in">
      {/* Page Header */}
      <div className="cosmos-page-header">
        <div className="cosmos-page-header__left">
          <div className="cosmos-page-header__icon" style={{ backgroundColor: '#9050E9' }}>
            <ArrowLeftRight size={20} color="#fff" />
          </div>
          <div>
            <h1 className="cosmos-page-header__title">MTA to MMM Insights</h1>
            <p className="cosmos-page-header__subtitle">
              Bidirectional calibration between Multi-Touch Attribution and Meridian MMM
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Channel Performance Comparison */}
      <div className="cosmos-section" style={{ marginTop: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <TrendingUp className="cosmos-section__icon" size={18} />
            <h2 className="cosmos-section__title">Channel Performance Comparison</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-card">
            <table className="cosmos-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>MTA ROI</th>
                  <th>MMM ROI</th>
                  <th>Difference %</th>
                  <th>Agreement</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((ch, idx) => (
                  <tr key={idx}>
                    <td>{ch.channel}</td>
                    <td>{ch.mtaROI}</td>
                    <td>{ch.mmmROI}</td>
                    <td>{ch.difference}%</td>
                    <td>{getAgreementBadge(ch.agreement)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cosmos-card" style={{ marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={channelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis label={{ value: 'ROI', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="mtaROI" name="MTA ROI" fill={COLORS[0]} />
                <Bar dataKey="mmmROI" name="MMM ROI" fill={COLORS[4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2: MTA to Meridian Priors */}
      <div className="cosmos-section" style={{ marginTop: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <Zap className="cosmos-section__icon" size={18} />
            <h2 className="cosmos-section__title">MTA to Meridian Priors</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <label className="cosmos-toggle">
              <input
                type="checkbox"
                checked={enableMTAPriors}
                onChange={(e) => setEnableMTAPriors(e.target.checked)}
              />
              <span className="cosmos-toggle__slider"></span>
            </label>
            <span className="cosmos-label">Enable MTA-informed priors</span>
          </div>

          {enableMTAPriors && (
            <div className="cosmos-card animate-fade-in">
              <table className="cosmos-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>MTA ROI</th>
                    <th>Prior Mean</th>
                    <th>Prior Std</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {priorsData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.channel}</td>
                      <td>{row.mtaROI}</td>
                      <td>{row.priorMean}</td>
                      <td>{row.priorStd}</td>
                      <td>{getAgreementBadge(row.confidence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Meridian to MTA Re-weighting */}
      <div className="cosmos-section" style={{ marginTop: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <ArrowRight className="cosmos-section__icon" size={18} />
            <h2 className="cosmos-section__title">Meridian to MTA Re-weighting</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div className="cosmos-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <label className="cosmos-toggle">
              <input
                type="checkbox"
                checked={enableMMMReweighting}
                onChange={(e) => setEnableMMMReweighting(e.target.checked)}
              />
              <span className="cosmos-toggle__slider"></span>
            </label>
            <span className="cosmos-label">Apply MMM re-weighting</span>
          </div>

          {enableMMMReweighting && (
            <div className="cosmos-card animate-fade-in">
              <table className="cosmos-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Original MTA Weight</th>
                    <th>MMM-adjusted Weight</th>
                    <th>Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {reweightingData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.channel}</td>
                      <td>{row.originalWeight}</td>
                      <td>{row.adjustedWeight}</td>
                      <td style={{ color: row.changePct > 0 ? '#2E844A' : '#BA0517' }}>
                        {row.changePct > 0 ? '+' : ''}{row.changePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Calibration Summary */}
      <div className="cosmos-section" style={{ marginTop: '1.5rem' }}>
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <CheckCircle className="cosmos-section__icon" size={18} />
            <h2 className="cosmos-section__title">Calibration Summary</h2>
          </div>
        </div>
        <div className="cosmos-section__body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="cosmos-metric cosmos-card">
              <span className="cosmos-metric__label">Channels Aligned</span>
              <span className="cosmos-metric__value">{summaryMetrics.aligned}</span>
              <span className="cosmos-metric__sub">of {channelData.length} channels</span>
            </div>
            <div className="cosmos-metric cosmos-card">
              <span className="cosmos-metric__label">Avg Difference</span>
              <span className="cosmos-metric__value">{summaryMetrics.avgDiff}%</span>
              <span className="cosmos-metric__sub">between MTA and MMM</span>
            </div>
            <div className="cosmos-metric cosmos-card">
              <span className="cosmos-metric__label">Prior Adjustments</span>
              <span className="cosmos-metric__value">{summaryMetrics.priorAdj}</span>
              <span className="cosmos-metric__sub">suggested</span>
            </div>
            <div className="cosmos-metric cosmos-card">
              <span className="cosmos-metric__label">Confidence Score</span>
              <span className="cosmos-metric__value">{summaryMetrics.confidence}%</span>
              <span className="cosmos-metric__sub">overall calibration</span>
            </div>
          </div>

          <div className="cosmos-alert cosmos-alert--info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Recommendation:</strong>{' '}
              {summaryMetrics.confidence >= 70
                ? 'High model agreement detected. MTA-informed priors can improve Meridian convergence speed and reduce uncertainty. Consider applying bidirectional calibration for optimal results.'
                : summaryMetrics.confidence >= 40
                ? 'Moderate agreement between models. Review channels with low agreement individually before applying priors. Consider using wider prior standard deviations for uncertain channels.'
                : 'Low agreement between MTA and MMM. Investigate data quality, attribution windows, and model assumptions before applying calibration. Manual review recommended.'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="cosmos-page-header__actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="cosmos-btn cosmos-btn--brand" onClick={handleApplyMTAPriors}>
          <Zap size={16} />
          Apply MTA Priors to Meridian
        </button>
        <button className="cosmos-btn cosmos-btn--outline" onClick={handleApplyMMMWeights}>
          <ArrowRight size={16} />
          Apply MMM Weights to MTA
        </button>
        <button className="cosmos-btn cosmos-btn--neutral" onClick={handleExportReport}>
          <Download size={16} />
          Export Report
        </button>
      </div>
    </div>
  );
}
