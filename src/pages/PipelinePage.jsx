import { useState, useMemo } from 'react';
import {
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Loader,
  CloudLightning,
  FileSpreadsheet,
  Upload,
  Trash2,
  Download,
} from 'lucide-react';
import Papa from 'papaparse';
import { generateSyntheticData, validateData, CHANNELS } from '../data/dataGenerator';
import { useApp } from '../context/AppContext';

// --- Step Indicator ---
function StepIndicator({ steps, activeIndex }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((step, i) => {
        const isActive = i === activeIndex;
        const isComplete = i < activeIndex;
        const isUpcoming = i > activeIndex;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                background: isActive
                  ? 'var(--cos-color-brand, #0176d3)'
                  : isComplete
                  ? 'var(--cos-color-success, #2e844a)'
                  : 'transparent',
                color: isActive || isComplete ? '#fff' : 'var(--cos-color-text-muted, #706e6b)',
                border: isUpcoming ? '2px solid var(--cos-color-border, #c9c7c5)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {isComplete ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span
              style={{
                marginLeft: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive
                  ? 'var(--cos-color-text, #181818)'
                  : 'var(--cos-color-text-muted, #706e6b)',
              }}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  margin: '0 12px',
                  background: isComplete
                    ? 'var(--cos-color-success, #2e844a)'
                    : 'var(--cos-color-border, #c9c7c5)',
                  transition: 'background 0.2s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Step 1: Source Selection ---
function SourceStep({ onSelect }) {
  return (
    <div className="cosmos-section animate-fade-in">
      <div className="cosmos-section__header">
        <div className="cosmos-section__header-left">
          <div className="cosmos-section__title">Choose Data Source</div>
        </div>
      </div>
      <div className="cosmos-section__body">
        <p className="cosmos-text-muted" style={{ marginBottom: 24 }}>
          Select how you want to provide marketing mix data for your Meridian model.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div
            className="cosmos-card cosmos-card--interactive"
            onClick={() => onSelect('synthetic')}
            style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'var(--cos-color-brand-light, #eef4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CloudLightning size={28} color="var(--cos-color-brand, #0176d3)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Generate Synthetic Data</h3>
            <p className="cosmos-text-sm cosmos-text-muted">
              Create realistic marketing data with configurable look-back windows, DMAs, and channels.
            </p>
          </div>

          <div
            className="cosmos-card cosmos-card--interactive"
            onClick={() => onSelect('csv')}
            style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'var(--cos-color-brand-light, #eef4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <FileSpreadsheet size={28} color="var(--cos-color-brand, #0176d3)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Upload CSV</h3>
            <p className="cosmos-text-sm cosmos-text-muted">
              Upload your own historical marketing data in CSV format for Meridian analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step 2a: Look-back Window Selection ---
function LookbackStep({ onSelect, selected }) {
  const options = [
    {
      years: 1,
      weeks: 52,
      badge: 'warning',
      badgeText: 'Minimum',
      description: 'Basic model training with limited seasonality coverage.',
    },
    {
      years: 2,
      weeks: 104,
      badge: 'success',
      badgeText: 'Compliant',
      description: 'Meets Meridian minimum for geo-level modeling.',
    },
    {
      years: 3,
      weeks: 156,
      badge: 'success',
      badgeText: 'Recommended',
      description: 'Strong seasonal patterns and trend detection.',
    },
    {
      years: 4,
      weeks: 208,
      badge: 'success',
      badgeText: 'Recommended',
      description: 'Maximum history for robust long-term modeling.',
    },
  ];

  return (
    <div className="cosmos-section animate-fade-in">
      <div className="cosmos-section__header">
        <div className="cosmos-section__header-left">
          <div className="cosmos-section__title">Select Look-back Window</div>
        </div>
      </div>
      <div className="cosmos-section__body">
        <p className="cosmos-text-muted" style={{ marginBottom: 24 }}>
          How many years of synthetic data should be generated? Longer windows improve model accuracy.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {options.map((opt) => (
            <div
              key={opt.years}
              className={`cosmos-card cosmos-card--interactive ${selected === opt.years ? 'selected' : ''}`}
              onClick={() => onSelect(opt.years)}
              style={{
                cursor: 'pointer',
                padding: 20,
                border: selected === opt.years ? '2px solid var(--cos-color-brand, #0176d3)' : undefined,
                background: selected === opt.years ? 'var(--cos-color-brand-light, #eef4ff)' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>{opt.years}</span>
                <span className={`cosmos-badge cosmos-badge--${opt.badge}`}>{opt.badgeText}</span>
              </div>
              <div className="cosmos-text-sm" style={{ marginBottom: 4 }}>
                <strong>{opt.weeks} weeks</strong>
              </div>
              <div className="cosmos-text-xs cosmos-text-muted" style={{ marginBottom: 8 }}>
                {new Date(Date.now() - opt.weeks * 7 * 86400000).toISOString().slice(0, 10)} to today
              </div>
              <div className="cosmos-text-xs cosmos-text-muted" style={{ marginBottom: 4 }}>
                {CHANNELS.length} channels
              </div>
              <div className="cosmos-text-xs cosmos-text-muted" style={{ marginBottom: 8 }}>
                15 DMAs
              </div>
              <p className="cosmos-text-xs cosmos-text-muted">{opt.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Step 2b: CSV Upload ---
function CSVUploadStep({ onFileLoaded, fileName, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    setError(null);
    setParsing(true);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsing(false);
        if (results.errors.length > 0) {
          setError(`Parse errors: ${results.errors[0].message}`);
          return;
        }
        onFileLoaded(results.data, file.name);
      },
      error: (err) => {
        setParsing(false);
        setError(`Failed to parse: ${err.message}`);
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div className="cosmos-section animate-fade-in">
      <div className="cosmos-section__header">
        <div className="cosmos-section__header-left">
          <div className="cosmos-section__title">Upload CSV File</div>
        </div>
      </div>
      <div className="cosmos-section__body">
        {fileName ? (
          <div className="cosmos-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <FileSpreadsheet size={24} color="var(--cos-color-success, #2e844a)" />
            <div style={{ flex: 1 }}>
              <div className="cosmos-text-bold">{fileName}</div>
              <div className="cosmos-text-xs cosmos-text-muted">File loaded successfully</div>
            </div>
            <button className="cosmos-btn cosmos-btn--destructive cosmos-btn--sm" onClick={onClear}>
              <Trash2 size={14} style={{ marginRight: 4 }} /> Remove
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: `2px dashed ${dragOver ? 'var(--cos-color-brand, #0176d3)' : 'var(--cos-color-border, #c9c7c5)'}`,
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              background: dragOver ? 'var(--cos-color-brand-light, #eef4ff)' : 'var(--cos-color-bg-alt, #f3f3f3)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            {parsing ? (
              <Loader size={32} className="animate-pulse" color="var(--cos-color-brand, #0176d3)" />
            ) : (
              <Upload size={32} color="var(--cos-color-text-muted, #706e6b)" />
            )}
            <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>
              {parsing ? 'Parsing file...' : 'Drag and drop your CSV here, or click to browse'}
            </p>
            <p className="cosmos-text-xs cosmos-text-muted" style={{ marginTop: 8 }}>
              Expected columns: date, geo, kpi_*, channel_spend, channel_impressions
            </p>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
          </div>
        )}
        {error && (
          <div className="cosmos-alert cosmos-alert--error" style={{ marginTop: 16 }}>
            <XCircle size={16} style={{ marginRight: 8 }} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Step 3: Preview ---
function PreviewStep({ data, source }) {
  const previewRows = data?.rows ? data.rows.slice(0, 10) : [];
  const columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  // Summary stats
  const stats = useMemo(() => {
    if (!data) return null;
    if (data.summary) {
      // Synthetic data has built-in summary
      return {
        rows: data.rows?.length || data.summary.totalRows || 0,
        dateRange: data.summary.dateRange
          ? `${data.summary.dateRange.start} to ${data.summary.dateRange.end}`
          : 'N/A',
        geos: data.numGeos || 0,
        channels: data.numChannels || 0,
        spend: data.summary.totalSpend || 0,
        kpi: data.summary.totalKPI || 0,
      };
    }
    // CSV data - compute stats
    const rows = data.rows || data;
    const allDates = rows.map((r) => r.date || r.week).filter(Boolean).sort();
    const uniqueGeos = [...new Set(rows.map((r) => r.geo).filter(Boolean))];
    const spendCols = Object.keys(rows[0] || {}).filter((c) => c.endsWith('_spend') || c === 'spend');
    const kpiCols = Object.keys(rows[0] || {}).filter((c) => c.startsWith('kpi_') || c === 'kpi');
    const uniqueChannels = [...new Set(rows.map((r) => r.channel).filter(Boolean))];

    const totalSpend = rows.reduce((s, r) => {
      return s + spendCols.reduce((ss, col) => ss + (Number(r[col]) || 0), 0);
    }, 0);
    const totalKpi = rows.reduce((s, r) => {
      return s + kpiCols.reduce((ss, col) => ss + (Number(r[col]) || 0), 0);
    }, 0);

    return {
      rows: rows.length,
      dateRange: allDates.length > 0 ? `${allDates[0]} to ${allDates[allDates.length - 1]}` : 'N/A',
      geos: uniqueGeos.length,
      channels: uniqueChannels.length || spendCols.length,
      spend: Math.round(totalSpend),
      kpi: Math.round(totalKpi),
    };
  }, [data]);

  if (!data || previewRows.length === 0) {
    return (
      <div className="cosmos-section animate-fade-in">
        <div className="cosmos-section__body">
          <div className="cosmos-alert cosmos-alert--warning">
            <AlertTriangle size={16} style={{ marginRight: 8 }} />
            No data available for preview.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmos-section animate-fade-in">
      <div className="cosmos-section__header">
        <div className="cosmos-section__header-left">
          <div className="cosmos-section__title">Data Preview</div>
        </div>
        <span className="cosmos-badge cosmos-badge--info">{source === 'synthetic' ? 'Synthetic' : 'CSV Upload'}</span>
      </div>
      <div className="cosmos-section__body">
        {/* Summary Metrics */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
            <div className="cosmos-metric">
              <div className="cosmos-metric__label">Rows</div>
              <div className="cosmos-metric__value">{stats.rows.toLocaleString()}</div>
            </div>
            <div className="cosmos-metric">
              <div className="cosmos-metric__label">Date Range</div>
              <div className="cosmos-metric__value" style={{ fontSize: 12 }}>{stats.dateRange}</div>
            </div>
            <div className="cosmos-metric">
              <div className="cosmos-metric__label">Geos</div>
              <div className="cosmos-metric__value">{stats.geos}</div>
            </div>
            <div className="cosmos-metric">
              <div className="cosmos-metric__label">Channels</div>
              <div className="cosmos-metric__value">{stats.channels}</div>
            </div>
            <div className="cosmos-metric">
              <div className="cosmos-metric__label">Total Spend</div>
              <div className="cosmos-metric__value">${(stats.spend / 1000000).toFixed(1)}M</div>
            </div>
            <div className="cosmos-metric">
              <div className="cosmos-metric__label">Total KPI</div>
              <div className="cosmos-metric__value">${(stats.kpi / 1000000).toFixed(1)}M</div>
            </div>
          </div>
        )}

        {/* Preview Table */}
        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--cos-color-border, #e5e5e5)' }}>
          <table className="cosmos-table">
            <thead>
              <tr>
                {columns.slice(0, 8).map((col) => (
                  <th key={col}>{col}</th>
                ))}
                {columns.length > 8 && <th>...</th>}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i}>
                  {columns.slice(0, 8).map((col) => (
                    <td key={col}>
                      {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col] ?? '')}
                    </td>
                  ))}
                  {columns.length > 8 && <td className="cosmos-text-muted">...</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cosmos-text-xs cosmos-text-muted" style={{ marginTop: 8 }}>
          Showing first 10 of {stats?.rows?.toLocaleString()} rows
          {columns.length > 8 ? ` (${columns.length} columns, first 8 shown)` : ` (${columns.length} columns)`}
        </p>
      </div>
    </div>
  );
}

// --- Step 4: Validation ---
function ValidationStep({ validationResults, onProceed }) {
  if (!validationResults) {
    return (
      <div className="cosmos-section animate-fade-in">
        <div className="cosmos-section__body">
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Loader size={32} className="animate-pulse" color="var(--cos-color-brand, #0176d3)" />
            <p className="cosmos-text-muted" style={{ marginTop: 16 }}>Running validation checks...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallStatus, passedChecks, totalChecks, errors, warnings, canProceed, issues } = validationResults;

  const statusConfig = {
    PASS: { badge: 'success', text: 'All Checks Passed', icon: CheckCircle },
    PASS_WITH_WARNINGS: { badge: 'warning', text: 'Passed with Warnings', icon: AlertTriangle },
    FAIL: { badge: 'error', text: 'Validation Failed', icon: XCircle },
  };

  const statusInfo = statusConfig[overallStatus] || statusConfig.FAIL;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="cosmos-section animate-fade-in">
      <div className="cosmos-section__header">
        <div className="cosmos-section__header-left">
          <div className="cosmos-section__title">Validation Results</div>
        </div>
        <span className={`cosmos-badge cosmos-badge--${statusInfo.badge}`}>
          <StatusIcon size={12} style={{ marginRight: 4 }} />
          {statusInfo.text}
        </span>
      </div>
      <div className="cosmos-section__body">
        {/* Summary */}
        <div className="cosmos-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatusIcon
              size={32}
              color={
                overallStatus === 'PASS'
                  ? 'var(--cos-color-success, #2e844a)'
                  : overallStatus === 'PASS_WITH_WARNINGS'
                  ? 'var(--cos-color-warning, #fe9339)'
                  : 'var(--cos-color-error, #ea001e)'
              }
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {passedChecks}/{totalChecks} checks passed
              </div>
              <div className="cosmos-text-sm cosmos-text-muted">
                {validationResults.summary || `${errors.length} error(s), ${warnings.length} warning(s)`}
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {issues && issues.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 className="cosmos-text-bold" style={{ marginBottom: 12 }}>Issues</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(errors || []).map((issue, i) => (
                <div key={`err-${i}`} className="cosmos-alert cosmos-alert--error" style={{ margin: 0 }}>
                  <XCircle size={14} style={{ marginRight: 8, flexShrink: 0 }} />
                  <span className="cosmos-text-sm">{issue.message}</span>
                </div>
              ))}
              {(warnings || []).map((issue, i) => (
                <div key={`warn-${i}`} className="cosmos-alert cosmos-alert--warning" style={{ margin: 0 }}>
                  <AlertTriangle size={14} style={{ marginRight: 8, flexShrink: 0 }} />
                  <span className="cosmos-text-sm">{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proceed Button */}
        {canProceed && (
          <button className="cosmos-btn cosmos-btn--brand cosmos-btn--lg" onClick={onProceed}>
            Proceed to Configuration <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </button>
        )}
        {!canProceed && (
          <div className="cosmos-alert cosmos-alert--error" style={{ marginTop: 16 }}>
            <XCircle size={14} style={{ marginRight: 8 }} />
            Resolve all errors before proceeding. Adjust your data source or upload a corrected file.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function PipelinePage() {
  const { state, dispatch } = useApp();

  const [wizardStep, setWizardStep] = useState(0); // 0=source, 1=lookback/upload, 2=preview, 3=validation
  const [source, setSource] = useState(null); // 'synthetic' | 'csv'
  const [lookbackYears, setLookbackYears] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [generatedData, setGeneratedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const stepsForSource = source === 'csv'
    ? ['Source', 'Upload CSV', 'Preview', 'Validation']
    : ['Source', 'Look-back Window', 'Preview', 'Validation'];

  // Navigate to next step
  const goNext = () => {
    if (wizardStep < 3) setWizardStep(wizardStep + 1);
  };

  const goBack = () => {
    if (wizardStep > 0) setWizardStep(wizardStep - 1);
  };

  // Step 1 handler
  const handleSourceSelect = (selectedSource) => {
    setSource(selectedSource);
    setWizardStep(1);
  };

  // Step 2a handler - lookback
  const handleLookbackSelect = (years) => {
    setLookbackYears(years);
    dispatch({ type: 'SET_LOOKBACK_YEARS', payload: years });
  };

  // Step 2b handler - CSV
  const handleCSVLoaded = (data, fileName) => {
    setCsvData(data);
    setCsvFileName(fileName);
  };

  const handleCSVClear = () => {
    setCsvData(null);
    setCsvFileName('');
  };

  // Generate and move to preview
  const handleGeneratePreview = () => {
    setGenerating(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      if (source === 'synthetic' && lookbackYears) {
        const data = generateSyntheticData(null, lookbackYears);
        setGeneratedData(data);
        dispatch({ type: 'SET_PIPELINE_DATA', payload: data });
      } else if (source === 'csv' && csvData) {
        // Wrap CSV data in a structure compatible with preview
        const wrapped = {
          rows: csvData,
          numGeos: [...new Set(csvData.map((r) => r.geo).filter(Boolean))].length,
          numChannels: [...new Set(csvData.map((r) => r.channel).filter(Boolean))].length || CHANNELS.length,
          numWeeks: [...new Set(csvData.map((r) => r.date || r.week).filter(Boolean))].length,
          summary: null,
        };
        setGeneratedData(wrapped);
        dispatch({ type: 'SET_PIPELINE_DATA', payload: wrapped });
      }
      setGenerating(false);
      setWizardStep(2);
    }, 300);
  };

  // Run validation
  const handleRunValidation = () => {
    setWizardStep(3);
    setTimeout(() => {
      if (generatedData) {
        const results = validateData(generatedData);
        setValidationResults(results);
        dispatch({ type: 'SET_VALIDATION_RESULTS', payload: results });
      }
    }, 500);
  };

  // Proceed to config
  const handleProceed = () => {
    dispatch({ type: 'SET_STEP', payload: 'config' });
  };

  // Can advance from step 2?
  const canAdvanceFromStep2 =
    (source === 'synthetic' && lookbackYears !== null) || (source === 'csv' && csvData !== null);

  return (
    <div className="animate-slide-in">
      {/* Page Header */}
      <div className="cosmos-page-header" style={{ marginBottom: 32 }}>
        <div className="cosmos-page-header__left">
          <div
            className="cosmos-page-header__icon"
            style={{
              background: 'var(--cos-color-brand, #0176d3)',
              color: '#fff',
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={20} />
          </div>
          <div>
            <h1 className="cosmos-page-header__title">Data Ingestion</h1>
            <p className="cosmos-page-header__subtitle">
              Configure your marketing data pipeline for Meridian modeling
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={stepsForSource} activeIndex={wizardStep} />

      {/* Wizard Content */}
      {wizardStep === 0 && <SourceStep onSelect={handleSourceSelect} />}

      {wizardStep === 1 && source === 'synthetic' && (
        <LookbackStep onSelect={handleLookbackSelect} selected={lookbackYears} />
      )}

      {wizardStep === 1 && source === 'csv' && (
        <CSVUploadStep
          onFileLoaded={handleCSVLoaded}
          fileName={csvFileName}
          onClear={handleCSVClear}
        />
      )}

      {wizardStep === 2 && <PreviewStep data={generatedData} source={source} />}

      {wizardStep === 3 && (
        <ValidationStep validationResults={validationResults} onProceed={handleProceed} />
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--cos-color-border, #e5e5e5)' }}>
        <button
          className="cosmos-btn cosmos-btn--neutral"
          onClick={goBack}
          disabled={wizardStep === 0}
          style={{ opacity: wizardStep === 0 ? 0.4 : 1 }}
        >
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          {wizardStep === 1 && canAdvanceFromStep2 && (
            <button className="cosmos-btn cosmos-btn--brand" onClick={handleGeneratePreview} disabled={generating}>
              {generating ? (
                <>
                  <Loader size={14} className="animate-pulse" style={{ marginRight: 6 }} /> Generating...
                </>
              ) : (
                <>
                  Generate Preview <ArrowRight size={16} style={{ marginLeft: 6 }} />
                </>
              )}
            </button>
          )}

          {wizardStep === 2 && (
            <button className="cosmos-btn cosmos-btn--brand" onClick={handleRunValidation}>
              Run Validation <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
