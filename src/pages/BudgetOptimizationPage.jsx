import { useState, useMemo } from 'react';
import { Info, Target, FileSpreadsheet, BarChart3, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateOptimizationResults } from '../data/dataGenerator';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SEASONALITY_INDEX = {
  Jan: 0.78, Feb: 0.82, Mar: 0.95, Apr: 0.98, May: 1.05, Jun: 1.10,
  Jul: 0.92, Aug: 0.88, Sep: 1.08, Oct: 1.31, Nov: 1.42, Dec: 1.47,
};

const COLORS = {
  brand: '#0176D3',
  success: '#2E844A',
  warning: '#DD7A01',
  error: '#EA001E',
  info: '#0176D3',
  darkBlue: '#032D60',
};

function formatCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export default function BudgetOptimizationPage() {
  const { state, dispatch } = useApp();
  const budgetConfig = state.config.budgetOptimization;
  const dashboardData = state.dashboardData;
  const optimizationResults = state.optimizationResults;

  const [seasonalityEnabled, setSeasonalityEnabled] = useState(budgetConfig.useSeasonalityIndex || false);

  const updateConfig = (updates) => {
    dispatch({ type: 'UPDATE_BUDGET_CONFIG', payload: updates });
  };

  const handleRunOptimization = () => {
    if (!dashboardData) return;
    const results = generateOptimizationResults(budgetConfig, dashboardData, seasonalityEnabled ? SEASONALITY_INDEX : null);
    dispatch({ type: 'SET_OPTIMIZATION_RESULTS', payload: results });
  };

  const seasonalityTotal = useMemo(() => {
    return Object.values(SEASONALITY_INDEX).reduce((sum, v) => sum + v, 0);
  }, []);

  const channelMonthlyData = useMemo(() => {
    if (!optimizationResults || !seasonalityEnabled) return null;
    const channels = optimizationResults.channels || [];
    const totalSeasonality = Object.values(SEASONALITY_INDEX).reduce((s, v) => s + v, 0);

    return channels.map((ch) => {
      const monthlySpend = MONTH_NAMES.map((month) => {
        const seasonFactor = SEASONALITY_INDEX[month] / totalSeasonality;
        return ch.optimizedSpend * seasonFactor;
      });
      return { name: ch.name, monthlySpend };
    });
  }, [optimizationResults, seasonalityEnabled]);

  const monthlyTotals = useMemo(() => {
    if (!channelMonthlyData) return null;
    return MONTH_NAMES.map((_, mi) =>
      channelMonthlyData.reduce((sum, ch) => sum + ch.monthlySpend[mi], 0)
    );
  }, [channelMonthlyData]);

  const handleExportCSV = () => {
    if (!channelMonthlyData) return;
    const rows = [];
    rows.push(['Channel', ...MONTH_NAMES, 'Total'].join(','));
    channelMonthlyData.forEach((ch) => {
      const total = ch.monthlySpend.reduce((s, v) => s + v, 0);
      rows.push([ch.name, ...ch.monthlySpend.map((v) => v.toFixed(2)), total.toFixed(2)].join(','));
    });
    rows.push(['']);
    rows.push(['Total', ...monthlyTotals.map((v) => v.toFixed(2)), monthlyTotals.reduce((s, v) => s + v, 0).toFixed(2)].join(','));
    rows.push(['']);
    rows.push(['Summary']);
    rows.push([`Total Budget,${budgetConfig.totalBudget}`]);
    rows.push([`Scenario,${budgetConfig.scenario}`]);
    rows.push([`Period,${budgetConfig.budgetPeriod}`]);
    if (seasonalityEnabled) {
      rows.push(['']);
      rows.push(['Seasonality Index']);
      rows.push(['Month', 'Index'].join(','));
      MONTH_NAMES.forEach((m) => {
        rows.push([m, SEASONALITY_INDEX[m]].join(','));
      });
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget_optimization_monthly.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // No data state
  if (!dashboardData) {
    return (
      <div className="animate-fade-in">
        <div className="cosmos-page-header">
          <div className="cosmos-page-header__left">
            <div className="cosmos-page-header__icon" style={{ background: COLORS.darkBlue }}>
              <DollarSign size={20} color="#fff" />
            </div>
            <div>
              <h1 className="cosmos-page-header__title">Budget Optimization</h1>
              <p className="cosmos-page-header__subtitle">Optimize channel budget allocation</p>
            </div>
          </div>
        </div>
        <div className="cosmos-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <Info size={48} color={COLORS.warning} style={{ marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No Model Data Available</h3>
          <p className="cosmos-text-muted">Please complete model training first to unlock budget optimization. Model results are required to generate allocation recommendations.</p>
        </div>
      </div>
    );
  }

  // Empty state - results not yet generated
  if (!optimizationResults) {
    return (
      <div className="animate-fade-in">
        <div className="cosmos-page-header">
          <div className="cosmos-page-header__left">
            <div className="cosmos-page-header__icon" style={{ background: COLORS.darkBlue }}>
              <DollarSign size={20} color="#fff" />
            </div>
            <div>
              <h1 className="cosmos-page-header__title">Budget Optimization</h1>
              <p className="cosmos-page-header__subtitle">Optimize channel budget allocation</p>
            </div>
          </div>
          <div className="cosmos-page-header__actions">
            <button className="cosmos-btn cosmos-btn--outline" onClick={handleRunOptimization}>
              <TrendingUp size={16} /> Run Optimization
            </button>
          </div>
        </div>

        {/* Budget Settings */}
        <section className="cosmos-section animate-slide-in">
          <div className="cosmos-section__header">
            <div className="cosmos-section__header-left">
              <DollarSign size={18} className="cosmos-section__icon" />
              <h2 className="cosmos-section__title">Budget Settings</h2>
            </div>
            <span className="cosmos-badge cosmos-badge--info">{formatCurrency(budgetConfig.totalBudget)}</span>
          </div>
          <div className="cosmos-section__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Scenario</label>
                <select
                  className="cosmos-select"
                  value={budgetConfig.scenario}
                  onChange={(e) => updateConfig({ scenario: e.target.value })}
                >
                  <option value="fixed">Fixed Budget</option>
                  <option value="flexible_roi">Flexible (Target ROI)</option>
                  <option value="flexible_mroi">Flexible (Target mROI)</option>
                </select>
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Total Budget</label>
                <input
                  type="number"
                  className="cosmos-input"
                  value={budgetConfig.totalBudget}
                  onChange={(e) => updateConfig({ totalBudget: Number(e.target.value) })}
                />
              </div>
              {(budgetConfig.scenario === 'flexible_roi' || budgetConfig.scenario === 'flexible_mroi') && (
                <div className="cosmos-form-group">
                  <label className="cosmos-label">Target ROI</label>
                  <input
                    type="number"
                    step="0.1"
                    className="cosmos-input"
                    value={budgetConfig.targetROI}
                    onChange={(e) => updateConfig({ targetROI: Number(e.target.value) })}
                  />
                </div>
              )}
              <div className="cosmos-form-group">
                <label className="cosmos-label">Period</label>
                <select
                  className="cosmos-select"
                  value={budgetConfig.budgetPeriod}
                  onChange={(e) => updateConfig({ budgetPeriod: e.target.value })}
                >
                  <option value="yearly">Yearly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Begin Date</label>
                <input
                  type="date"
                  className="cosmos-input"
                  value={budgetConfig.beginDate}
                  onChange={(e) => updateConfig({ beginDate: e.target.value })}
                />
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Lower Bound (0-1)</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  className="cosmos-input"
                  value={budgetConfig.spendConstraintLower}
                  onChange={(e) => updateConfig({ spendConstraintLower: Number(e.target.value) })}
                />
              </div>
              <div className="cosmos-form-group">
                <label className="cosmos-label">Upper Bound (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="cosmos-input"
                  value={budgetConfig.spendConstraintUpper}
                  onChange={(e) => updateConfig({ spendConstraintUpper: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seasonality Index */}
        <section className="cosmos-section animate-slide-in">
          <div className="cosmos-section__header">
            <div className="cosmos-section__header-left">
              <Calendar size={18} className="cosmos-section__icon" />
              <h2 className="cosmos-section__title">Seasonality Index</h2>
            </div>
            <label className="cosmos-toggle">
              <input
                type="checkbox"
                checked={seasonalityEnabled}
                onChange={(e) => {
                  setSeasonalityEnabled(e.target.checked);
                  updateConfig({ useSeasonalityIndex: e.target.checked });
                }}
              />
              <span className="cosmos-toggle__slider"></span>
            </label>
          </div>
          <div className="cosmos-section__body">
            <table className="cosmos-table">
              <thead>
                <tr>
                  {MONTH_NAMES.map((m) => (
                    <th key={m}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {MONTH_NAMES.map((m) => (
                    <td key={m}>{SEASONALITY_INDEX[m].toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  {MONTH_NAMES.map((m) => {
                    const maxIndex = Math.max(...Object.values(SEASONALITY_INDEX));
                    const pct = (SEASONALITY_INDEX[m] / maxIndex) * 100;
                    return (
                      <td key={m} style={{ padding: '8px 4px' }}>
                        <div style={{ width: '100%', height: 24, background: 'var(--cosmos-neutral-90)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: COLORS.brand, borderRadius: 4, transition: 'width 0.3s' }} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
            {seasonalityEnabled && (
              <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                <span className="cosmos-text-sm cosmos-text-muted">Sum: {seasonalityTotal.toFixed(2)}</span>
                <span className="cosmos-text-sm cosmos-text-muted">Avg: {(seasonalityTotal / 12).toFixed(2)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Empty State */}
        <div className="cosmos-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <Target size={48} color={COLORS.brand} style={{ marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>Ready to Optimize</h3>
          <p className="cosmos-text-muted" style={{ marginBottom: 24 }}>Configure your budget settings above, then run the optimization to see channel allocation recommendations.</p>
          <button className="cosmos-btn cosmos-btn--brand" onClick={handleRunOptimization}>
            <TrendingUp size={16} /> Run Optimization
          </button>
        </div>
      </div>
    );
  }

  // Results state
  return (
    <div className="animate-fade-in">
      <div className="cosmos-page-header">
        <div className="cosmos-page-header__left">
          <div className="cosmos-page-header__icon" style={{ background: COLORS.darkBlue }}>
            <DollarSign size={20} color="#fff" />
          </div>
          <div>
            <h1 className="cosmos-page-header__title">Budget Optimization</h1>
            <p className="cosmos-page-header__subtitle">Optimize channel budget allocation</p>
          </div>
        </div>
        <div className="cosmos-page-header__actions">
          <button className="cosmos-btn cosmos-btn--outline" onClick={handleRunOptimization}>
            <TrendingUp size={16} /> Run Optimization
          </button>
        </div>
      </div>

      {/* Budget Settings */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <DollarSign size={18} className="cosmos-section__icon" />
            <h2 className="cosmos-section__title">Budget Settings</h2>
          </div>
          <span className="cosmos-badge cosmos-badge--info">{formatCurrency(budgetConfig.totalBudget)}</span>
        </div>
        <div className="cosmos-section__body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="cosmos-form-group">
              <label className="cosmos-label">Scenario</label>
              <select
                className="cosmos-select"
                value={budgetConfig.scenario}
                onChange={(e) => updateConfig({ scenario: e.target.value })}
              >
                <option value="fixed">Fixed Budget</option>
                <option value="flexible_roi">Flexible (Target ROI)</option>
                <option value="flexible_mroi">Flexible (Target mROI)</option>
              </select>
            </div>
            <div className="cosmos-form-group">
              <label className="cosmos-label">Total Budget</label>
              <input
                type="number"
                className="cosmos-input"
                value={budgetConfig.totalBudget}
                onChange={(e) => updateConfig({ totalBudget: Number(e.target.value) })}
              />
            </div>
            {(budgetConfig.scenario === 'flexible_roi' || budgetConfig.scenario === 'flexible_mroi') && (
              <div className="cosmos-form-group">
                <label className="cosmos-label">Target ROI</label>
                <input
                  type="number"
                  step="0.1"
                  className="cosmos-input"
                  value={budgetConfig.targetROI}
                  onChange={(e) => updateConfig({ targetROI: Number(e.target.value) })}
                />
              </div>
            )}
            <div className="cosmos-form-group">
              <label className="cosmos-label">Period</label>
              <select
                className="cosmos-select"
                value={budgetConfig.budgetPeriod}
                onChange={(e) => updateConfig({ budgetPeriod: e.target.value })}
              >
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="cosmos-form-group">
              <label className="cosmos-label">Begin Date</label>
              <input
                type="date"
                className="cosmos-input"
                value={budgetConfig.beginDate}
                onChange={(e) => updateConfig({ beginDate: e.target.value })}
              />
            </div>
            <div className="cosmos-form-group">
              <label className="cosmos-label">Lower Bound (0-1)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                className="cosmos-input"
                value={budgetConfig.spendConstraintLower}
                onChange={(e) => updateConfig({ spendConstraintLower: Number(e.target.value) })}
              />
            </div>
            <div className="cosmos-form-group">
              <label className="cosmos-label">Upper Bound (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                className="cosmos-input"
                value={budgetConfig.spendConstraintUpper}
                onChange={(e) => updateConfig({ spendConstraintUpper: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seasonality Index */}
      <section className="cosmos-section animate-slide-in">
        <div className="cosmos-section__header">
          <div className="cosmos-section__header-left">
            <Calendar size={18} className="cosmos-section__icon" />
            <h2 className="cosmos-section__title">Seasonality Index</h2>
          </div>
          <label className="cosmos-toggle">
            <input
              type="checkbox"
              checked={seasonalityEnabled}
              onChange={(e) => {
                setSeasonalityEnabled(e.target.checked);
                updateConfig({ useSeasonalityIndex: e.target.checked });
              }}
            />
            <span className="cosmos-toggle__slider"></span>
          </label>
        </div>
        <div className="cosmos-section__body">
          <table className="cosmos-table">
            <thead>
              <tr>
                {MONTH_NAMES.map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {MONTH_NAMES.map((m) => (
                  <td key={m}>{SEASONALITY_INDEX[m].toFixed(2)}</td>
                ))}
              </tr>
              <tr>
                {MONTH_NAMES.map((m) => {
                  const maxIndex = Math.max(...Object.values(SEASONALITY_INDEX));
                  const pct = (SEASONALITY_INDEX[m] / maxIndex) * 100;
                  return (
                    <td key={m} style={{ padding: '8px 4px' }}>
                      <div style={{ width: '100%', height: 24, background: 'var(--cosmos-neutral-90)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: COLORS.brand, borderRadius: 4, transition: 'width 0.3s' }} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
          {seasonalityEnabled && (
            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <span className="cosmos-text-sm cosmos-text-muted">Sum: {seasonalityTotal.toFixed(2)}</span>
              <span className="cosmos-text-sm cosmos-text-muted">Avg: {(seasonalityTotal / 12).toFixed(2)}</span>
            </div>
          )}
        </div>
      </section>

      {/* Channel Budget by Month */}
      {seasonalityEnabled && channelMonthlyData && (
        <section className="cosmos-section animate-slide-in">
          <div className="cosmos-section__header">
            <div className="cosmos-section__header-left">
              <FileSpreadsheet size={18} className="cosmos-section__icon" />
              <h2 className="cosmos-section__title">Channel Budget by Month</h2>
            </div>
            <button className="cosmos-btn cosmos-btn--success cosmos-btn--sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} /> Export CSV
            </button>
          </div>
          <div className="cosmos-section__body" style={{ overflowX: 'auto' }}>
            <table className="cosmos-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  {MONTH_NAMES.map((m) => (
                    <th key={m}>{m}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {channelMonthlyData.map((ch) => {
                  const total = ch.monthlySpend.reduce((s, v) => s + v, 0);
                  return (
                    <tr key={ch.name}>
                      <td className="cosmos-text-bold">{ch.name}</td>
                      {ch.monthlySpend.map((v, i) => (
                        <td key={i}>{formatCurrency(v)}</td>
                      ))}
                      <td className="cosmos-text-bold">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 600, borderTop: '2px solid var(--cosmos-border-strong)' }}>
                  <td>Total</td>
                  {monthlyTotals.map((v, i) => (
                    <td key={i}>{formatCurrency(v)}</td>
                  ))}
                  <td>{formatCurrency(monthlyTotals.reduce((s, v) => s + v, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
