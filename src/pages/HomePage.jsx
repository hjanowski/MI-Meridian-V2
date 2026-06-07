import { useApp } from '../context/AppContext';
import {
  Database,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Zap,
  BarChart3,
  TrendingUp,
  GitBranch,
} from 'lucide-react';

export default function HomePage() {
  const { state, dispatch } = useApp();
  const { pipelineData, validationResults, trainingStatus } = state;

  const steps = [
    {
      number: 1,
      title: 'Data Ingestion',
      description: 'Connect and validate your marketing spend, impressions, and KPI data sources.',
      icon: Database,
      page: 'pipeline',
      ready: true,
      complete: !!pipelineData,
    },
    {
      number: 2,
      title: 'Meridian Configuration',
      description: 'Configure model parameters, MTA-informed priors, adstock, saturation, and external factors.',
      icon: Settings,
      page: 'config',
      ready: !!pipelineData,
      complete: !!validationResults?.canProceed,
    },
    {
      number: 3,
      title: 'Model Data Feed',
      description: 'Run Bayesian inference with MCMC sampling via Meridian.',
      icon: Zap,
      page: 'training',
      ready: !!validationResults?.canProceed,
      complete: trainingStatus === 'complete',
    },
    {
      number: 4,
      title: 'Dashboards & Optimization',
      description: 'View ROI, response curves, budget optimization, and MTA↔MMM insights.',
      icon: LayoutDashboard,
      page: 'dashboards',
      ready: trainingStatus === 'complete',
      complete: false,
    },
  ];

  function handleStepClick(step) {
    if (step.ready) {
      dispatch({ type: 'SET_STEP', payload: step.page });
    }
  }

  return (
    <div className="cosmos-section" style={{ padding: '32px' }}>
      {/* HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg, #032D60, #0176D3)',
          borderRadius: '8px',
          padding: '48px',
          color: '#ffffff',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <BarChart3 size={36} strokeWidth={1.5} />
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Marketing Intelligence</h1>
        </div>
        <h2 style={{ margin: '8px 0 16px', fontSize: '1.25rem', fontWeight: 400, opacity: 0.9 }}>
          Meridian MMM + Multi-Touch Attribution
        </h2>
        <p style={{ margin: 0, maxWidth: '720px', lineHeight: 1.6, opacity: 0.85 }}>
          Combine Google Meridian's open-source Marketing Mix Modeling with Multi-Touch Attribution
          for a unified view of marketing effectiveness. Ingest data, calibrate models with MTA priors,
          optimize budgets, and surface actionable insights — all in one workflow.
        </p>
      </div>

      {/* STEPS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {steps.map((step) => {
          const Icon = step.icon;
          const locked = !step.ready;
          return (
            <div
              key={step.number}
              className="cosmos-card cosmos-card--interactive"
              style={{
                opacity: locked ? 0.5 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
                position: 'relative',
                padding: '24px',
              }}
              onClick={() => handleStepClick(step)}
            >
              {step.isNew && (
                <span
                  className="cosmos-badge cosmos-badge--info"
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                >
                  NEW
                </span>
              )}
              <div className="cosmos-text-xs cosmos-text-muted" style={{ marginBottom: '8px' }}>
                Step {step.number}
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: step.complete ? '#2E844A' : '#0176D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Icon size={24} color="#ffffff" strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 600 }}>{step.title}</h3>
              <p className="cosmos-text-sm cosmos-text-muted" style={{ margin: '0 0 16px', lineHeight: 1.5 }}>
                {step.description}
              </p>
              <span
                className="cosmos-text-sm cosmos-text-brand cosmos-text-bold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {locked ? 'Locked' : step.complete ? 'Complete' : 'Get started'}
                {!locked && <ArrowRight size={14} />}
              </span>
            </div>
          );
        })}
      </div>

      {/* INFO CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* About Google Meridian */}
        <div className="cosmos-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={20} className="cosmos-text-brand" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>About Google Meridian</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 2 }} className="cosmos-text-sm">
            <li>Open-source Bayesian Marketing Mix Model built on JAX/NumPyro</li>
            <li>Hierarchical geo-level modeling with adstock and saturation curves</li>
            <li>Built-in budget optimization with spend constraints</li>
            <li>Prior calibration from experimental lift studies or MTA signals</li>
            <li>Posterior diagnostics including R-hat, effective sample size, and MAPE</li>
          </ul>
        </div>

        {/* MTA ↔ MMM Integration */}
        <div className="cosmos-card" style={{ padding: '24px', position: 'relative' }}>
          <span
            className="cosmos-badge cosmos-badge--info"
            style={{ position: 'absolute', top: '16px', right: '16px' }}
          >
            NEW
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <GitBranch size={20} className="cosmos-text-brand" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>MTA ↔ Meridian Integration</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 2 }} className="cosmos-text-sm">
            <li>Pull channel ROI from an existing MI MTA model as Bayesian priors for Meridian</li>
            <li>Push Meridian channel ROI back to re-weight channel significance in a selected MTA model</li>
            <li>High-performing MTA channels inform tighter Meridian prior distributions</li>
            <li>Meridian's long-term media effects refine MTA's channel weighting</li>
            <li>Configured directly within the Meridian Configuration step</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
