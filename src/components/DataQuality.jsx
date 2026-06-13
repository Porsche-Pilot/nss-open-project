import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { filterActivities, activities, filterMonthlyKpis, monthlyKpis } from './dataUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="custom-tooltip-item">
          <span className="custom-tooltip-dot" style={{ background: entry.color || entry.fill }} />
          {entry.name}
          <span className="custom-tooltip-value">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DataQuality({ filters }) {
  const filteredActs = useMemo(() => filterActivities(activities, filters), [filters]);
  const filteredKpis = useMemo(() => filterMonthlyKpis(monthlyKpis, filters), [filters]);

  const totalActivities = filteredActs.length;
  const withIssues = filteredActs.filter(a => a.quality_flags.length > 0);
  const verified = filteredActs.filter(a => a.verified);
  const issueRate = (withIssues.length / Math.max(totalActivities, 1) * 100);
  const verificationRate = (verified.length / Math.max(totalActivities, 1) * 100);

  // Issue type breakdown
  const issueTypes = useMemo(() => {
    const counts = {};
    filteredActs.forEach(a => {
      a.quality_flags.forEach(flag => {
        counts[flag] = (counts[flag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value,
        raw: name,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredActs]);

  // Quality by field worker
  const workerQuality = useMemo(() => {
    const grouped = {};
    filteredActs.forEach(a => {
      if (!grouped[a.field_worker]) {
        grouped[a.field_worker] = { total: 0, issues: 0, verified: 0 };
      }
      grouped[a.field_worker].total++;
      if (a.quality_flags.length > 0) grouped[a.field_worker].issues++;
      if (a.verified) grouped[a.field_worker].verified++;
    });
    return Object.entries(grouped).map(([name, data]) => ({
      name,
      total: data.total,
      issueRate: Math.round(data.issues / data.total * 100),
      verificationRate: Math.round(data.verified / data.total * 100),
      qualityScore: Math.round((1 - data.issues / data.total) * 100),
    })).sort((a, b) => b.qualityScore - a.qualityScore);
  }, [filteredActs]);

  // Monthly quality trend
  const qualityTrend = filteredKpis.map(m => ({
    month: m.month.slice(5),
    qualityScore: Math.round((1 - m.quality_issue_rate) * 100),
    verificationRate: Math.round(m.verification_rate * 100),
  }));

  // Overall quality grade
  const qualityScore = Math.round((1 - issueRate / 100) * 100);
  const getGrade = (score) => {
    if (score >= 95) return { grade: 'A+', color: 'var(--accent-emerald)' };
    if (score >= 90) return { grade: 'A', color: 'var(--accent-emerald-light)' };
    if (score >= 80) return { grade: 'B', color: 'var(--accent-amber)' };
    if (score >= 70) return { grade: 'C', color: 'var(--accent-amber-light)' };
    return { grade: 'D', color: 'var(--accent-rose)' };
  };
  const gradeInfo = getGrade(qualityScore);

  return (
    <div>
      {/* Hero Quality Score */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="kpi-card emerald animate-in">
          <div className="kpi-card-icon emerald"><ShieldCheck size={20} /></div>
          <div className="kpi-card-label">Overall Data Quality Score</div>
          <div className="kpi-card-value" style={{ color: gradeInfo.color }}>
            {qualityScore}%
            <span style={{ fontSize: '1.2rem', marginLeft: '8px' }}>({gradeInfo.grade})</span>
          </div>
          <div className="kpi-card-subtitle">{totalActivities - withIssues.length} clean / {totalActivities} total records</div>
        </div>

        <div className="kpi-card indigo animate-in animate-in-delay-1">
          <div className="kpi-card-icon indigo"><CheckCircle size={20} /></div>
          <div className="kpi-card-label">Verification Rate</div>
          <div className="kpi-card-value">{verificationRate.toFixed(1)}%</div>
          <div className="kpi-card-subtitle">{verified.length} records verified</div>
        </div>

        <div className="kpi-card amber animate-in animate-in-delay-2">
          <div className="kpi-card-icon amber"><AlertTriangle size={20} /></div>
          <div className="kpi-card-label">Records with Issues</div>
          <div className="kpi-card-value">{withIssues.length}</div>
          <div className="kpi-card-subtitle">{issueRate.toFixed(1)}% of all records</div>
        </div>

        <div className="kpi-card rose animate-in animate-in-delay-3">
          <div className="kpi-card-icon rose"><XCircle size={20} /></div>
          <div className="kpi-card-label">Unverified Records</div>
          <div className="kpi-card-value">{totalActivities - verified.length}</div>
          <div className="kpi-card-subtitle">Pending verification</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Issue Type Breakdown */}
        <div className="card animate-in animate-in-delay-2">
          <div className="card-header">
            <span className="card-title">Issue Types</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Occurrences" radius={[0, 6, 6, 0]}>
                  {issueTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Trend */}
        <div className="card animate-in animate-in-delay-3">
          <div className="card-header">
            <span className="card-title">Quality Score Over Time</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{v}</span>} />
                <Line type="monotone" dataKey="qualityScore" name="Quality Score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="verificationRate" name="Verification Rate" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field Worker Quality Table */}
        <div className="card full-width animate-in animate-in-delay-4">
          <div className="card-header">
            <span className="card-title">Field Worker Data Quality Scorecard</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Field Worker</th>
                <th>Records Submitted</th>
                <th>Quality Score</th>
                <th>Issue Rate</th>
                <th>Verification Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workerQuality.map((w, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{w.name}</td>
                  <td>{w.total}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${w.qualityScore}%`,
                          height: '100%',
                          background: w.qualityScore >= 90 ? 'var(--accent-emerald)' : w.qualityScore >= 80 ? 'var(--accent-amber)' : 'var(--accent-rose)',
                          borderRadius: '3px',
                        }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{w.qualityScore}%</span>
                    </div>
                  </td>
                  <td style={{ color: w.issueRate > 15 ? 'var(--accent-rose-light)' : 'var(--text-secondary)' }}>
                    {w.issueRate}%
                  </td>
                  <td>{w.verificationRate}%</td>
                  <td>
                    <div className="quality-indicator">
                      <div className={`quality-dot ${w.qualityScore >= 90 ? 'good' : w.qualityScore >= 80 ? 'warning' : 'bad'}`} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {w.qualityScore >= 90 ? 'Excellent' : w.qualityScore >= 80 ? 'Needs Attention' : 'Action Required'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
