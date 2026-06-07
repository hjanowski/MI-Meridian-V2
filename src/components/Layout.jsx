import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  Plus,
  Bookmark,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Bot,
} from 'lucide-react';

export default function Layout({ children }) {
  const { state, dispatch } = useApp();
  const [meridianExpanded, setMeridianExpanded] = useState(true);
  const [harmonizationExpanded, setHarmonizationExpanded] = useState(false);

  const canNavigate = (page) => {
    switch (page) {
      case 'pipeline':
        return true;
      case 'config':
        return !!state.pipelineData;
      case 'training':
        return !!state.validationResults?.canProceed;
      case 'budget':
        return !!state.validationResults?.canProceed;
      case 'dashboards':
        return state.trainingStatus === 'complete';
      default:
        return true;
    }
  };

  const navigateTo = (page) => {
    if (canNavigate(page)) {
      dispatch({ type: 'SET_STEP', payload: page });
    }
  };

  const sidebarItems = [
    { id: 'data-pipelines', label: 'Data Pipelines', page: null },
    {
      id: 'harmonization',
      label: 'Harmonization',
      expandable: true,
      expanded: harmonizationExpanded,
      onToggle: () => setHarmonizationExpanded(!harmonizationExpanded),
      children: [
        { id: 'data-enrichment', label: 'Data Enrichment', page: null },
        { id: 'patterns', label: 'Patterns', page: null },
      ],
    },
    { id: 'anchor-campaigns', label: 'Anchor Campaigns', page: null },
    { id: 'funnel-attribution', label: 'Funnel-Based Attribution', page: null },
    { id: 'touch-attribution', label: 'Touch-Based Attribution', page: null },
    {
      id: 'meridian',
      label: 'Meridian',
      expandable: true,
      expanded: meridianExpanded,
      onToggle: () => setMeridianExpanded(!meridianExpanded),
      children: [
        { id: 'data-ingestion', label: 'Data Ingestion', page: 'pipeline' },
        { id: 'meridian-configuration', label: 'Configuration', page: 'config' },
        { id: 'model-data-feed', label: 'Model Data Feed', page: 'training' },
        { id: 'budget-optimization', label: 'Budget Optimization', page: 'budget' },
        { id: 'meridian-dashboards', label: 'Dashboards', page: 'dashboards' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* TOP HEADER */}
      <header className="cosmos-global-header" style={{
        height: 48,
        minHeight: 48,
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 100,
      }}>
        {/* SF Cloud Logo */}
        <div style={{ display: 'flex', alignItems: 'center', width: 200 }}>
          <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
            <path d="M13.2 3.6C14.4 1.4 16.8 0 19.5 0c3.2 0 5.9 2.1 6.8 5 1-.4 2-.6 3.1-.6C32.6 4.4 35 7.2 35 10.6c0 3.4-2.4 6.2-5.6 6.2h-1.2c-.8 2.4-3 4.2-5.7 4.2-1.4 0-2.7-.5-3.7-1.3-1 .8-2.3 1.3-3.7 1.3-2.6 0-4.8-1.7-5.6-4H8.6c-3.2 0-5.8-2.8-5.8-6.2 0-3 2-5.5 4.7-6.1.2-3 2.5-5.4 5.3-5.4.1 0 .2 0 .4.3z" fill="#00A1E0"/>
          </svg>
        </div>

        {/* Center Search Bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f3f3f3',
            borderRadius: 20,
            padding: '6px 16px',
            width: 400,
            maxWidth: '100%',
          }}>
            <Search size={16} color="#706e6b" />
            <input
              type="text"
              placeholder="Search Salesforce"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                marginLeft: 8,
                fontSize: 14,
                flex: 1,
                color: '#181818',
              }}
            />
          </div>
        </div>

        {/* Right Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 200, justifyContent: 'flex-end' }}>
          <Bot size={18} color="#706e6b" style={{ cursor: 'pointer' }} />
          <Bookmark size={18} color="#706e6b" style={{ cursor: 'pointer' }} />
          <Plus size={18} color="#706e6b" style={{ cursor: 'pointer' }} />
          <Bell size={18} color="#706e6b" style={{ cursor: 'pointer' }} />
          <HelpCircle size={18} color="#706e6b" style={{ cursor: 'pointer' }} />
          <SettingsIcon size={18} color="#706e6b" style={{ cursor: 'pointer' }} />
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#032d60',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            MI
          </div>
        </div>
      </header>

      {/* NAV TABS */}
      <nav className="cosmos-nav-tabs" style={{
        height: 44,
        minHeight: 44,
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 0,
      }}>
        {/* Waffle + App Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="8" y="2" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="14" y="2" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="2" y="8" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="8" y="8" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="14" y="8" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="2" y="14" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="8" y="14" width="4" height="4" rx="1" fill="#706e6b"/>
            <rect x="14" y="14" width="4" height="4" rx="1" fill="#706e6b"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#181818' }}>Marketing Intelligence</span>
        </div>

        {/* Tabs */}
        <div className="cosmos-tabs" style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
          {[
            { label: 'Home', active: false },
            { label: 'Goals', active: false },
            { label: 'Data Management', active: false },
            { label: 'Planning', active: true },
            { label: 'Marketing Analytics', active: false },
            { label: 'Segment Intelligence', active: false },
            { label: 'Reports', active: false, hasChevron: true },
          ].map((tab) => (
            <div
              key={tab.label}
              className={`cosmos-tabs__item${tab.active ? ' cosmos-tabs__item--active' : ''}`}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: tab.active ? 600 : 400,
                color: tab.active ? '#0176d3' : '#444',
                borderBottom: tab.active ? '2px solid #0176d3' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {tab.hasChevron && <ChevronDown size={14} />}
            </div>
          ))}
        </div>

        {/* Right Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f3f3f3',
          borderRadius: 16,
          padding: '4px 12px',
          fontSize: 12,
          color: '#444',
          whiteSpace: 'nowrap',
        }}>
          Recently Viewed | Data Streams
        </div>
      </nav>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR */}
        <aside className="cosmos-sidebar" style={{
          width: 220,
          minWidth: 220,
          background: '#ffffff',
          borderRight: '1px solid #e5e5e5',
          overflowY: 'auto',
          padding: '16px 0',
        }}>
          <div style={{ padding: '0 16px 12px', fontSize: 11, fontWeight: 700, color: '#706e6b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Planning
          </div>

          {sidebarItems.map((item) => {
            if (item.expandable) {
              return (
                <div key={item.id}>
                  <div
                    className={`cosmos-sidebar__expandable${item.expanded ? ' cosmos-sidebar__expandable--active' : ''}`}
                    onClick={item.onToggle}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#181818',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {item.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {item.label}
                  </div>
                  {item.expanded && item.children.map((child) => {
                    const isActive = state.currentStep === child.page;
                    const isDisabled = child.page && !canNavigate(child.page);
                    return (
                      <div
                        key={child.id}
                        className={`cosmos-sidebar__item cosmos-sidebar__item--child${isActive ? ' cosmos-sidebar__item--active' : ''}${isDisabled ? ' cosmos-sidebar__item--disabled' : ''}`}
                        onClick={() => child.page && navigateTo(child.page)}
                        style={{
                          padding: '7px 16px 7px 38px',
                          fontSize: 13,
                          color: isDisabled ? '#c9c7c5' : isActive ? '#0176d3' : '#444',
                          background: isActive ? '#f0f7ff' : 'transparent',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          borderLeft: isActive ? '3px solid #0176d3' : '3px solid transparent',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {child.label}
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="cosmos-sidebar__item"
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  color: '#444',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </div>
            );
          })}

          {/* Divider */}
          <div style={{ margin: '12px 16px', borderTop: '1px solid #e5e5e5' }} />

          {/* Semantic Data Model */}
          <div
            className="cosmos-sidebar__item"
            style={{
              padding: '8px 16px',
              fontSize: 13,
              color: '#444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Semantic Data Model
            <ExternalLink size={12} color="#706e6b" />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{
          flex: 1,
          padding: 24,
          overflowY: 'auto',
          background: '#f3f3f3',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
