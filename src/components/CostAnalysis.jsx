import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, Cell, ComposedChart, Line
} from 'recharts';
import { filterActivities, filterBeneficiaries, activities, beneficiaries, programmes, formatCurrency } from './dataUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];
const PROG_COLORS = { P001: '#6366f1', P002: '#10b981', P003: '#f59e0b', P004: '#f43f5e' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="custom-tooltip-item">
          <span className="custom-tooltip-dot" style={{ background: entry.color || entry.fill }} />
          {entry.name}
          <span className="custom-tooltip-value">
            {typeof entry.value === 'number' 
              ? entry.value >= 1000 ? `₹${(entry.value/1000).toFixed(1)}K` : entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CostAnalysis({ filters }) {
  const filteredActs = useMemo(() => filterActivities(activities, filters), [filters]);
  const filteredBens = useMemo(() => filterBeneficiaries(beneficiaries, filters), [filters]);
  const activeBens = filteredBens.filter(b => b.is_active);

  // Cost per programme
  const progCostData = programmes.map((prog, i) => {
    const progActs = filteredActs.filter(a => a.programme_id === prog.id);
    const totalCost = progActs.reduce((s, a) => s + a.cost_inr, 0);
    const participants = progActs.reduce((s, a) => s + a.num_participants, 0);
    const sessions = progActs.length;
    const progBens = filteredBens.filter(b => b.enrolled_programmes.includes(prog.id) && b.is_active);
    const avgImprovement = progBens.length > 0 
      ? progBens.reduce((s, b) => s + b.reading_improvement + b.math_improvement, 0) / progBens.length / 2
      : 0;

    return {
      name: prog.name,
      totalCost: Math.round(totalCost),
      costPerSession: sessions > 0 ? Math.round(totalCost / sessions) : 0,
      costPerParticipant: participants > 0 ? Math.round(totalCost / participants) : 0,
      costPerOutcome: progBens.length > 0 ? Math.round(totalCost / progBens.length) : 0,
      avgImprovement: Math.round(avgImprovement * 10) / 10,
      participants,
      sessions,
      color: COLORS[i],
    };
  });

  // Cost by funding source
  const fundingData = useMemo(() => {
    const grouped = filteredActs.reduce((acc, a) => {
      acc[a.funding_source] = (acc[a.funding_source] || 0) + a.cost_inr;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, value]) => ({ name: name.replace('CSR - ', ''), value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredActs]);

  // Monthly cost trend with cost-per-outcome
  const monthlyCostData = useMemo(() => {
    const months = [...new Set(filteredActs.map(a => a.month))].sort();
    return months.map(month => {
      const monthActs = filteredActs.filter(a => a.month === month);
      const totalCost = monthActs.reduce((s, a) => s + a.cost_inr, 0);
      const totalParticipants = monthActs.reduce((s, a) => s + a.num_participants, 0);
      return {
        month: month.slice(5),
        totalCost: Math.round(totalCost),
        costPerParticipant: totalParticipants > 0 ? Math.round(totalCost / totalParticipants) : 0,
        sessions: monthActs.length,
      };
    });
  }, [filteredActs]);

  // Efficiency scatter: cost vs improvement
  const efficiencyData = progCostData.map(p => ({
    x: p.costPerParticipant,
    y: p.avgImprovement,
    z: p.participants,
    name: p.name,
    color: p.color,
  }));

  const totalCost = filteredActs.reduce((s, a) => s + a.cost_inr, 0);
  const costPerActiveBen = totalCost / Math.max(activeBens.length, 1);

  return (
    <div>
      {/* Overall KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="kpi-card indigo animate-in">
          <div className="kpi-card-label">Total Investment</div>
          <div className="kpi-card-value">{formatCurrency(totalCost)}</div>
          <div className="kpi-card-subtitle">{filteredActs.length} sessions funded</div>
        </div>
        <div className="kpi-card emerald animate-in animate-in-delay-1">
          <div className="kpi-card-label">Cost per Active Beneficiary</div>
          <div className="kpi-card-value">{formatCurrency(costPerActiveBen)}</div>
          <div className="kpi-card-subtitle">{activeBens.length} active beneficiaries</div>
        </div>
        <div className="kpi-card amber animate-in animate-in-delay-2">
          <div className="kpi-card-label">Most Efficient Programme</div>
          <div className="kpi-card-value" style={{ fontSize: '1.3rem' }}>
            {progCostData.sort((a, b) => a.costPerParticipant - b.costPerParticipant)[0]?.name || 'N/A'}
          </div>
          <div className="kpi-card-subtitle">
            {formatCurrency(progCostData[0]?.costPerParticipant || 0)} per participant
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Cost per programme comparison */}
        <div className="card animate-in animate-in-delay-2">
          <div className="card-header">
            <span className="card-title">Cost per Participant by Programme</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={140} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="costPerParticipant" name="Cost/Participant" radius={[0, 6, 6, 0]}>
                  {progCostData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funding source breakdown */}
        <div className="card animate-in animate-in-delay-3">
          <div className="card-header">
            <span className="card-title">Spending by Funding Source</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Amount (₹)" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly cost trend */}
        <div className="card full-width animate-in animate-in-delay-4">
          <div className="card-header">
            <span className="card-title">Monthly Cost & Cost-per-Participant Trend</span>
          </div>
          <div className="chart-container tall">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="cost" stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis yAxisId="cpp" orientation="right" stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{v}</span>} />
                <Bar yAxisId="cost" dataKey="totalCost" name="Total Cost" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Line yAxisId="cpp" type="monotone" dataKey="costPerParticipant" name="Cost/Participant" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Efficiency Table */}
      <div className="card animate-in" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card-header">
          <span className="card-title">Programme Efficiency Breakdown</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Programme</th>
              <th>Total Cost</th>
              <th>Sessions</th>
              <th>Participants</th>
              <th>₹/Session</th>
              <th>₹/Participant</th>
              <th>₹/Outcome</th>
              <th>Avg Improvement</th>
            </tr>
          </thead>
          <tbody>
            {progCostData.sort((a, b) => a.costPerOutcome - b.costPerOutcome).map((p, i) => (
              <tr key={i}>
                <td style={{ color: p.color, fontWeight: 600 }}>{p.name}</td>
                <td>{formatCurrency(p.totalCost)}</td>
                <td>{p.sessions}</td>
                <td>{p.participants.toLocaleString()}</td>
                <td>{formatCurrency(p.costPerSession)}</td>
                <td>{formatCurrency(p.costPerParticipant)}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(p.costPerOutcome)}</td>
                <td>
                  <span style={{ color: 'var(--accent-emerald-light)' }}>+{p.avgImprovement} pts</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
