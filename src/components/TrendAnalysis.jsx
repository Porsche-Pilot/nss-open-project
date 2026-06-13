import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart, Bar
} from 'recharts';
import { filterActivities, filterMonthlyKpis, activities, monthlyKpis, programmes } from './dataUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];
const PROG_COLORS = { P001: '#6366f1', P002: '#10b981', P003: '#f59e0b', P004: '#f43f5e' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="custom-tooltip-item">
          <span className="custom-tooltip-dot" style={{ background: entry.color || entry.stroke }} />
          {entry.name}
          <span className="custom-tooltip-value">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrendAnalysis({ filters }) {
  const [metric, setMetric] = useState('sessions');
  const filteredActs = useMemo(() => filterActivities(activities, filters), [filters]);
  const filteredKpis = useMemo(() => filterMonthlyKpis(monthlyKpis, filters), [filters]);

  // Sessions trend
  const sessionsTrend = filteredKpis.map(m => ({
    month: m.month.slice(5),
    sessions: m.total_sessions,
    participants: m.total_participants,
    cost: Math.round(m.total_cost_inr),
    costPerParticipant: Math.round(m.cost_per_participant),
    qualityRate: Math.round((1 - m.quality_issue_rate) * 100),
    verificationRate: Math.round(m.verification_rate * 100),
  }));

  // Programme-wise monthly trends
  const programmeTrend = useMemo(() => {
    const months = [...new Set(filteredActs.map(a => a.month))].sort();
    return months.map(month => {
      const monthActs = filteredActs.filter(a => a.month === month);
      const row = { month: month.slice(5) };
      programmes.forEach(p => {
        row[p.id] = monthActs.filter(a => a.programme_id === p.id).length;
      });
      return row;
    });
  }, [filteredActs]);

  // Cumulative participants
  const cumulativeData = useMemo(() => {
    let cumSessions = 0;
    let cumParticipants = 0;
    let cumCost = 0;
    return filteredKpis.map(m => {
      cumSessions += m.total_sessions;
      cumParticipants += m.total_participants;
      cumCost += m.total_cost_inr;
      return {
        month: m.month.slice(5),
        cumSessions,
        cumParticipants,
        cumCost: Math.round(cumCost),
      };
    });
  }, [filteredKpis]);

  // Region-wise monthly
  const regionTrend = useMemo(() => {
    const months = [...new Set(filteredActs.map(a => a.month))].sort();
    const regions = [...new Set(filteredActs.map(a => a.region))];
    return months.map(month => {
      const monthActs = filteredActs.filter(a => a.month === month);
      const row = { month: month.slice(5) };
      regions.forEach(r => {
        row[r] = monthActs.filter(a => a.region === r).length;
      });
      return row;
    });
  }, [filteredActs]);

  const regions = [...new Set(filteredActs.map(a => a.region))];

  return (
    <div>
      {/* Metric Tabs */}
      <div className="tab-nav" style={{ marginBottom: 'var(--space-xl)', display: 'inline-flex' }}>
        {[
          { id: 'sessions', label: 'Sessions & Participation' },
          { id: 'cumulative', label: 'Cumulative Growth' },
          { id: 'programme', label: 'By Programme' },
          { id: 'region', label: 'By Region' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${metric === tab.id ? 'active' : ''}`}
            onClick={() => setMetric(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="charts-grid">
        {metric === 'sessions' && (
          <>
            <div className="card full-width animate-in">
              <div className="card-header">
                <span className="card-title">Monthly Sessions & Participants</span>
              </div>
              <div className="chart-container tall">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sessionsTrend}>
                    <defs>
                      <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{v}</span>} />
                    <Area type="monotone" dataKey="sessions" name="Sessions" fill="url(#gradArea)" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="participants" name="Participants" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card animate-in animate-in-delay-1">
              <div className="card-header">
                <span className="card-title">Data Quality Score (%)</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[60, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="qualityRate" name="Quality Score" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                    <Line type="monotone" dataKey="verificationRate" name="Verification Rate" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card animate-in animate-in-delay-2">
              <div className="card-header">
                <span className="card-title">Cost per Participant Over Time</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionsTrend}>
                    <defs>
                      <linearGradient id="gradCpp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="costPerParticipant" name="₹/Participant" stroke="#f43f5e" fill="url(#gradCpp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {metric === 'cumulative' && (
          <>
            <div className="card full-width animate-in">
              <div className="card-header">
                <span className="card-title">Cumulative Growth</span>
                <span className="card-badge positive">18 months</span>
              </div>
              <div className="chart-container tall">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeData}>
                    <defs>
                      <linearGradient id="gradCumS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCumP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{v}</span>} />
                    <Area type="monotone" dataKey="cumSessions" name="Cumulative Sessions" stroke="#6366f1" fill="url(#gradCumS)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cumParticipants" name="Cumulative Participants" stroke="#10b981" fill="url(#gradCumP)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {metric === 'programme' && (
          <div className="card full-width animate-in">
            <div className="card-header">
              <span className="card-title">Sessions by Programme Over Time</span>
            </div>
            <div className="chart-container tall">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={programmeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => {
                    const prog = programmes.find(p => p.id === v);
                    return <span style={{ color: '#475569', fontSize: '0.75rem' }}>{prog?.name || v}</span>;
                  }} />
                  {programmes.map((p) => (
                    <Line key={p.id} type="monotone" dataKey={p.id} name={p.id} stroke={PROG_COLORS[p.id]} strokeWidth={2} dot={{ fill: PROG_COLORS[p.id], r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {metric === 'region' && (
          <div className="card full-width animate-in">
            <div className="card-header">
              <span className="card-title">Sessions by Region Over Time</span>
            </div>
            <div className="chart-container tall">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={regionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{v}</span>} />
                  {regions.map((r, i) => (
                    <Line key={r} type="monotone" dataKey={r} name={r} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ fill: COLORS[i % COLORS.length], r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
