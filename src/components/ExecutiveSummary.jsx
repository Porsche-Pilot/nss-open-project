import { useMemo } from 'react';
import { Users, BookOpen, TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  filterActivities, filterBeneficiaries, filterMonthlyKpis,
  activities, beneficiaries, monthlyKpis, outcomeSummary,
  formatCurrency, formatNumber
} from './dataUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="custom-tooltip-item">
          <span className="custom-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}
          <span className="custom-tooltip-value">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ExecutiveSummary({ filters }) {
  const filteredActivities = useMemo(() => filterActivities(activities, filters), [filters]);
  const filteredBeneficiaries = useMemo(() => filterBeneficiaries(beneficiaries, filters), [filters]);
  const filteredKpis = useMemo(() => filterMonthlyKpis(monthlyKpis, filters), [filters]);

  // Compute hero KPIs
  const totalBeneficiaries = filteredBeneficiaries.length;
  const activeBeneficiaries = filteredBeneficiaries.filter(b => b.is_active).length;
  const totalSessions = filteredActivities.length;
  const totalCost = filteredActivities.reduce((sum, a) => sum + a.cost_inr, 0);
  const avgReadingImprovement = filteredBeneficiaries.reduce((sum, b) => sum + b.reading_improvement, 0) / Math.max(filteredBeneficiaries.length, 1);
  const avgMathImprovement = filteredBeneficiaries.reduce((sum, b) => sum + b.math_improvement, 0) / Math.max(filteredBeneficiaries.length, 1);
  const costPerBeneficiary = totalCost / Math.max(activeBeneficiaries, 1);
  const retentionRate = (activeBeneficiaries / Math.max(totalBeneficiaries, 1) * 100);

  // Monthly trend data
  const trendData = filteredKpis.map(m => ({
    month: m.month.slice(5), // "01", "02", etc.
    sessions: m.total_sessions,
    participants: m.total_participants,
    cost: Math.round(m.total_cost_inr),
  }));

  // Programme distribution
  const programmeData = [
    { name: 'Tutoring', value: filteredActivities.filter(a => a.programme_id === 'P001').length },
    { name: 'Digital Literacy', value: filteredActivities.filter(a => a.programme_id === 'P002').length },
    { name: 'Teacher Training', value: filteredActivities.filter(a => a.programme_id === 'P003').length },
    { name: 'Parent Engagement', value: filteredActivities.filter(a => a.programme_id === 'P004').length },
  ].filter(p => p.value > 0);

  // Region distribution
  const regionData = Object.entries(
    filteredActivities.reduce((acc, a) => {
      acc[a.region] = (acc[a.region] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // The "one number" — composite impact score
  const impactScore = Math.round(
    (avgReadingImprovement * 0.3 + avgMathImprovement * 0.3 + retentionRate * 0.2 + Math.min(totalSessions / 10, 20) * 0.2) 
  );

  return (
    <div>
      {/* Hero Impact Score */}
      <div className="card animate-in" style={{
        marginBottom: 'var(--space-xl)',
        background: 'var(--gradient-hero)',
        border: '1px solid var(--border-accent)',
        textAlign: 'center',
        padding: 'var(--space-2xl) var(--space-xl)',
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
          The Monday Number — Composite Impact Score
        </div>
        <div style={{
          fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #4f46e5, #059669)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>
          {impactScore}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
          out of 100 — weighted by learning gains, retention, and programme reach
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card indigo animate-in animate-in-delay-1">
          <div className="kpi-card-icon indigo"><Users size={20} /></div>
          <div className="kpi-card-label">Active Beneficiaries</div>
          <div className="kpi-card-value">{activeBeneficiaries.toLocaleString()}</div>
          <div className="kpi-card-trend up">
            <ArrowUpRight size={14} /> {retentionRate.toFixed(1)}% retention
          </div>
          <div className="kpi-card-subtitle">of {totalBeneficiaries} enrolled</div>
        </div>

        <div className="kpi-card emerald animate-in animate-in-delay-2">
          <div className="kpi-card-icon emerald"><BookOpen size={20} /></div>
          <div className="kpi-card-label">Total Sessions</div>
          <div className="kpi-card-value">{totalSessions.toLocaleString()}</div>
          <div className="kpi-card-trend up">
            <ArrowUpRight size={14} /> across 4 programmes
          </div>
          <div className="kpi-card-subtitle">18-month period</div>
        </div>

        <div className="kpi-card amber animate-in animate-in-delay-3">
          <div className="kpi-card-icon amber"><TrendingUp size={20} /></div>
          <div className="kpi-card-label">Avg. Reading Gain</div>
          <div className="kpi-card-value">+{avgReadingImprovement.toFixed(1)}</div>
          <div className="kpi-card-trend up">
            <ArrowUpRight size={14} /> points improvement
          </div>
          <div className="kpi-card-subtitle">Math: +{avgMathImprovement.toFixed(1)} pts</div>
        </div>

        <div className="kpi-card rose animate-in animate-in-delay-4">
          <div className="kpi-card-icon rose"><IndianRupee size={20} /></div>
          <div className="kpi-card-label">Cost per Beneficiary</div>
          <div className="kpi-card-value">{formatCurrency(costPerBeneficiary)}</div>
          <div className="kpi-card-trend down">
            <ArrowDownRight size={14} /> Total: {formatCurrency(totalCost)}
          </div>
          <div className="kpi-card-subtitle">across all programmes</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Monthly Trend */}
        <div className="card full-width">
          <div className="card-header">
            <span className="card-title">Monthly Activity & Participation Trend</span>
            <span className="card-badge positive">18 months</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradParticipants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" fill="url(#gradSessions)" strokeWidth={2} />
                <Area type="monotone" dataKey="participants" name="Participants" stroke="#10b981" fill="url(#gradParticipants)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Programme Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Programme Distribution</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programmeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {programmeData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value) => <span style={{ color: '#475569', fontSize: '0.78rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Activity by Region</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Sessions" radius={[0, 6, 6, 0]}>
                  {regionData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
