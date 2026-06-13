import { useState } from 'react';
import {
  LayoutDashboard, TreePine, TrendingUp, Users, IndianRupee,
  BarChart3, ShieldCheck, Menu, X
} from 'lucide-react';
import ExecutiveSummary from './components/ExecutiveSummary';
import KPITreeView from './components/KPITreeView';
import ProgrammeProgress from './components/ProgrammeProgress';
import DemographicReach from './components/DemographicReach';
import CostAnalysis from './components/CostAnalysis';
import TrendAnalysis from './components/TrendAnalysis';
import DataQuality from './components/DataQuality';

const NAV_ITEMS = [
  { id: 'overview', label: 'Executive Summary', icon: LayoutDashboard, section: 'dashboards' },
  { id: 'kpi-tree', label: 'KPI Tree', icon: TreePine, section: 'dashboards' },
  { id: 'progress', label: 'Programme Progress', icon: TrendingUp, section: 'analytics' },
  { id: 'demographics', label: 'Demographic Reach', icon: Users, section: 'analytics' },
  { id: 'cost', label: 'Cost-per-Impact', icon: IndianRupee, section: 'analytics' },
  { id: 'trends', label: 'Trend Analysis', icon: BarChart3, section: 'analytics' },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck, section: 'operations' },
];

function App() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    programme: 'all',
    region: 'all',
    period: 'all',
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <ExecutiveSummary filters={filters} />;
      case 'kpi-tree': return <KPITreeView filters={filters} />;
      case 'progress': return <ProgrammeProgress filters={filters} />;
      case 'demographics': return <DemographicReach filters={filters} />;
      case 'cost': return <CostAnalysis filters={filters} />;
      case 'trends': return <TrendAnalysis filters={filters} />;
      case 'quality': return <DataQuality filters={filters} />;
      default: return <ExecutiveSummary filters={filters} />;
    }
  };

  const activeItem = NAV_ITEMS.find(n => n.id === activeView);

  const dashboardItems = NAV_ITEMS.filter(n => n.section === 'dashboards');
  const analyticsItems = NAV_ITEMS.filter(n => n.section === 'analytics');
  const operationsItems = NAV_ITEMS.filter(n => n.section === 'operations');

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay visible" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">📊</div>
          <div className="sidebar-brand-text">
            <h1>Vidya Setu</h1>
            <span>Impact Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Dashboards</div>
          {dashboardItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
            >
              <item.icon className="nav-icon" size={18} />
              {item.label}
            </div>
          ))}

          <div className="sidebar-section-title">Analytics</div>
          {analyticsItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
            >
              <item.icon className="nav-icon" size={18} />
              {item.label}
            </div>
          ))}

          <div className="sidebar-section-title">Operations</div>
          {operationsItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
            >
              <item.icon className="nav-icon" size={18} />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            Vidya Setu Foundation<br />
            <span style={{ color: 'var(--text-muted)' }}>
              NSS Open Projects 2026 — Challenge 5.1
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <button
                className="menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ display: window.innerWidth <= 968 ? 'flex' : 'none' }}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h2>{activeItem?.label || 'Dashboard'}</h2>
                <p>Vidya Setu Foundation — Real-time impact monitoring</p>
              </div>
            </div>
          </div>
          <div className="page-header-right">
            <div className="last-updated">
              <div className="pulse-dot"></div>
              Live Data — Last updated: June 2026
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Programme</label>
            <select
              className="filter-select"
              value={filters.programme}
              onChange={(e) => handleFilterChange('programme', e.target.value)}
            >
              <option value="all">All Programmes</option>
              <option value="P001">After-School Tutoring</option>
              <option value="P002">Digital Literacy Labs</option>
              <option value="P003">Teacher Training</option>
              <option value="P004">Parent Engagement</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Region</label>
            <select
              className="filter-select"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="South">South</option>
              <option value="North">North</option>
              <option value="West">West</option>
              <option value="East">East</option>
              <option value="Central">Central</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Period</label>
            <select
              className="filter-select"
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            >
              <option value="all">All Time (18 months)</option>
              <option value="6">Last 6 Months</option>
              <option value="3">Last 3 Months</option>
              <option value="1">Last Month</option>
            </select>
          </div>
        </div>

        {/* Active View */}
        {renderView()}
      </main>
    </div>
  );
}

export default App;
