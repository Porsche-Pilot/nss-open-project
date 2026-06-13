import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { filterActivities, activities, programmes, formatNumber } from './dataUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];
const PROG_COLORS = { P001: '#6366f1', P002: '#10b981', P003: '#f59e0b', P004: '#f43f5e' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="custom-tooltip-item">
          <span className="custom-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}
          <span className="custom-tooltip-value">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgrammeProgress({ filters }) {
  const filteredActs = useMemo(() => filterActivities(activities, filters), [filters]);

  // Programme progress
  const progData = programmes.map(prog => {
    const progActs = filteredActs.filter(a => a.programme_id === prog.id);
    const actual = progActs.length;
    const target = prog.target_sessions;
    const progress = Math.min((actual / target * 100), 100);
    const participants = progActs.reduce((s, a) => s + a.num_participants, 0);
    const cost = progActs.reduce((s, a) => s + a.cost_inr, 0);

    return {
      id: prog.id,
      name: prog.name,
      actual,
      target,
      progress: Math.round(progress),
      participants,
      cost: Math.round(cost),
      color: PROG_COLORS[prog.id],
    };
  });

  // Monthly sessions by programme
  const monthlyData = useMemo(() => {
    const months = [...new Set(filteredActs.map(a => a.month))].sort();
    return months.map(month => {
      const monthActs = filteredActs.filter(a => a.month === month);
      const row = { month: month.slice(5) };
      programmes.forEach(p => {
        row[p.name] = monthActs.filter(a => a.programme_id === p.id).length;
      });
      return row;
    });
  }, [filteredActs]);

  return (
    <div>
      {/* Progress Cards */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        {progData.map((prog, i) => (
          <div key={prog.id} className="card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="card-header">
              <span className="card-title" style={{ color: prog.color }}>{prog.name}</span>
              <span className={`card-badge ${prog.progress >= 80 ? 'positive' : prog.progress >= 50 ? 'neutral' : 'negative'}`}>
                {prog.progress}%
              </span>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-header">
                <span className="progress-bar-label">Sessions: {prog.actual} / {prog.target}</span>
                <span className="progress-bar-value">{prog.progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div 
                  className={`progress-bar-fill ${['indigo', 'emerald', 'amber', 'rose'][i]}`}
                  style={{ width: `${prog.progress}%` }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Participants</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prog.participants.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{(prog.cost / 100000).toFixed(1)}L
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Stacked Bar */}
      <div className="card animate-in animate-in-delay-2">
        <div className="card-header">
          <span className="card-title">Monthly Sessions by Programme</span>
        </div>
        <div className="chart-container tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{value}</span>}
              />
              {programmes.map((p, i) => (
                <Bar key={p.id} dataKey={p.name} stackId="a" fill={COLORS[i]} radius={i === programmes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
