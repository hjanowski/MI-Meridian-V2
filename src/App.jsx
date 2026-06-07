import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PipelinePage from './pages/PipelinePage';
import ConfigPage from './pages/ConfigPage';
import MTAConfigPage from './pages/MTAConfigPage';
import TrainingPage from './pages/TrainingPage';
import DashboardPage from './pages/DashboardPage';
import BudgetOptimizationPage from './pages/BudgetOptimizationPage';
import MTAInsightsPage from './pages/MTAInsightsPage';

function AppContent() {
  const { state } = useApp();

  const renderPage = () => {
    switch (state.currentStep) {
      case 'home': return <HomePage />;
      case 'pipeline': return <PipelinePage />;
      case 'mta': return <MTAConfigPage />;
      case 'config': return <ConfigPage />;
      case 'training': return <TrainingPage />;
      case 'budget': return <BudgetOptimizationPage />;
      case 'dashboards': return <DashboardPage />;
      case 'mta-insights': return <MTAInsightsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
