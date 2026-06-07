import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateModelResults } from '../data/dataGenerator';
import { Zap, CheckCircle, XCircle, Loader, Play, RotateCcw, ArrowRight, GitBranch } from 'lucide-react';

const TRAINING_PHASES = [
  { label: 'Initializing model graph...', duration: 400 },
  { label: 'Compiling Bayesian priors...', duration: 600 },
  { label: 'Building adstock transformations...', duration: 800 },
  { label: 'Configuring Hill saturation curves...', duration: 700 },
  { label: 'Sampling chain 1 of 4...', duration: 3000 },
  { label: 'Sampling chain 2 of 4...', duration: 2800 },
  { label: 'Sampling chain 3 of 4...', duration: 2600 },
  { label: 'Sampling chain 4 of 4...', duration: 2400 },
  { label: 'Computing diagnostics & convergence...', duration: 1200 },
  { label: 'Finalizing posterior summaries...', duration: 500 },
];

export default function TrainingPage() {
  const { state, dispatch } = useApp();
  const [logs, setLogs] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const logRef = useRef(null);

  const progress = state.trainingProgress || 0;
  const diagnostics = state.modelDiagnostics;
  const trainingStatus = state.trainingStatus || 'idle';

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Training phase progression
  useEffect(() => {
    if (!isRunning) return;
    if (currentPhase >= TRAINING_PHASES.length) return;

    const phase = TRAINING_PHASES[currentPhase];
    const phaseProgress = Math.round(((currentPhase + 1) / TRAINING_PHASES.length) * 100);

    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${phase.label}`]);

    dispatch({ type: 'SET_TRAINING_PROGRESS', payload: phaseProgress });
    dispatch({ type: 'SET_TRAINING_STATUS', payload: 'running' });

    const timer = setTimeout(() => {
      if (currentPhase === TRAINING_PHASES.length - 1) {
        // Last phase: generate results
        const results = generateModelResults(state.pipelineData, state.config);
        dispatch({ type: 'SET_DASHBOARD_DATA', payload: results });
        dispatch({
          type: 'SET_MODEL_DIAGNOSTICS',
          payload: generateDiagnostics(state.config),
        });
        dispatch({ type: 'SET_TRAINING_STATUS', payload: 'complete' });
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Training complete. All chains converged.`,
        ]);
        setIsRunning(false);
      } else {
        setCurrentPhase((p) => p + 1);
      }
    }, phase.duration);

    return () => clearTimeout(timer);
  }, [isRunning, currentPhase]);

  const handleStart = () => {
    setLogs([]);
    setCurrentPhase(0);
    setIsRunning(true);
    dispatch({ type: 'SET_TRAINING_STATUS', payload: 'running' });
    dispatch({ type: 'SET_TRAINING_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_MODEL_DIAGNOSTICS', payload: null });
  };

  const handleRetrain = () => {
    handleStart();
  };

  const handleViewDashboards = () => {
    dispatch({ type: 'SET_STEP', payload: 'dashboards' });
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="cosmos-page-header">
        <div className="cosmos-page-header__left">
          <div className="cosmos-page-header__icon" style={{ backgroundColor: '#16325c' }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <h1 className="cosmos-page-header__title">Model Data Feed</h1>
            <p className="cosmos-page-header__subtitle">
              Train the Meridian MMM using configured channels and priors
            </p>
          </div>
        </div>
        <div className="cosmos-page-header__actions">
          {trainingStatus === 'idle' && (
            <button className="cosmos-btn cosmos-btn--brand" onClick={handleStart}>
              <Play size={16} /> Start
            </button>
          )}
          {trainingStatus === 'complete' && (
            <>
              <button className="cosmos-btn cosmos-btn--neutral" onClick={handleRetrain}>
                <RotateCcw size={16} /> Re-train
              </button>
              <button className="cosmos-btn cosmos-btn--brand" onClick={handleViewDashboards}>
                <ArrowRight size={16} /> View Dashboards
              </button>
            </>
          )}
          {trainingStatus === 'running' && (
            <button className="cosmos-btn cosmos-btn--neutral" disabled>
              <Loader size={16} className="animate-pulse" /> Running...
            </button>
          )}
        </div>
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* LEFT: Training Progress */}
        <div className="cosmos-section">
          <div className="cosmos-section__header">
            <div className="cosmos-section__header-left">
              <GitBranch size={18} className="cosmos-section__icon" />
              <h2 className="cosmos-section__title">Training Progress</h2>
            </div>
          </div>
          <div className="cosmos-section__body">
            {/* Progress bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className="cosmos-text-sm cosmos-text-bold">{progress}%</span>
                <span className="cosmos-text-sm cosmos-text-muted">
                  {currentPhase < TRAINING_PHASES.length
                    ? TRAINING_PHASES[currentPhase]?.label
                    : 'Complete'}
                </span>
              </div>
              <div className="cosmos-progress">
                <div
                  className={`cosmos-progress__bar ${progress === 100 ? 'cosmos-progress__bar--success' : ''}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Metric boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="cosmos-metric">
                <span className="cosmos-metric__label">Chains</span>
                <span className="cosmos-metric__value">4</span>
              </div>
              <div className="cosmos-metric">
                <span className="cosmos-metric__label">Warmup</span>
                <span className="cosmos-metric__value">500</span>
              </div>
              <div className="cosmos-metric">
                <span className="cosmos-metric__label">Samples</span>
                <span className="cosmos-metric__value">500</span>
              </div>
              <div className="cosmos-metric">
                <span className="cosmos-metric__label">Adstock</span>
                <span className="cosmos-metric__value">{state.config.adstockDecay || 'geometric'}</span>
              </div>
            </div>

            {/* MTA Priors badge */}
            {state.config.useMTAPriors && (
              <div style={{ marginBottom: '1rem' }}>
                <span className="cosmos-badge cosmos-badge--info">MTA Priors Active</span>
              </div>
            )}

            {/* Console log */}
            <div
              ref={logRef}
              style={{
                background: '#1a1a2e',
                color: '#a8f0a8',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '0.75rem',
                borderRadius: '6px',
                maxHeight: '300px',
                overflowY: 'auto',
                minHeight: '120px',
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: '#666' }}>Awaiting training start...</span>
              ) : (
                logs.map((line, i) => (
                  <div key={i}>{line}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Model Diagnostics */}
        <div className="cosmos-section">
          <div className="cosmos-section__header">
            <div className="cosmos-section__header-left">
              <CheckCircle size={18} className="cosmos-section__icon" />
              <h2 className="cosmos-section__title">Model Diagnostics</h2>
            </div>
          </div>
          <div className="cosmos-section__body">
            {trainingStatus === 'idle' && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                <Zap size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                <p className="cosmos-text-sm cosmos-text-muted">
                  Diagnostics will appear after training completes.
                </p>
              </div>
            )}

            {trainingStatus === 'running' && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <Loader size={32} className="animate-pulse" style={{ margin: '0 auto 0.5rem', display: 'block', color: '#0070d2' }} />
                <p className="cosmos-text-sm cosmos-text-muted">Running convergence checks...</p>
              </div>
            )}

            {trainingStatus === 'complete' && diagnostics && (
              <div>
                {diagnostics.checks.map((check, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: i < diagnostics.checks.length - 1 ? '1px solid #e5e7eb' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {check.pass ? (
                        <CheckCircle size={16} color="#2e844a" />
                      ) : (
                        <XCircle size={16} color="#c23934" />
                      )}
                      <span className="cosmos-text-sm">{check.label}</span>
                    </div>
                    <span className="cosmos-text-xs cosmos-text-muted">{check.value}</span>
                  </div>
                ))}
                {state.config.useMTAPriors && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0',
                      marginTop: '0.25rem',
                    }}
                  >
                    <CheckCircle size={16} color="#0070d2" />
                    <span className="cosmos-text-sm cosmos-text-brand">MTA Calibration: Active</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate diagnostic results
function generateDiagnostics(config) {
  const rhat = (0.98 + Math.random() * 0.08).toFixed(3);
  const ess = Math.round(450 + Math.random() * 200);
  const ppp = (0.1 + Math.random() * 0.7).toFixed(2);

  const checks = [
    { label: 'R-hat < 1.1', value: rhat, pass: parseFloat(rhat) < 1.1 },
    { label: 'ESS > 400', value: String(ess), pass: ess > 400 },
    { label: 'PPP 0.05-0.95', value: ppp, pass: parseFloat(ppp) >= 0.05 && parseFloat(ppp) <= 0.95 },
    { label: 'ROI Plausibility', value: 'Pass', pass: true },
    { label: 'Prior-Posterior Shift', value: 'Acceptable', pass: true },
    { label: 'Overall', value: parseFloat(rhat) < 1.1 && ess > 400 ? 'Converged' : 'Warning', pass: parseFloat(rhat) < 1.1 && ess > 400 },
  ];

  return { checks };
}
