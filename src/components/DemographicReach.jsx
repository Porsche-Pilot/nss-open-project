import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { filterBeneficiaries, beneficiaries } from './dataUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'];
const GENDER_COLORS = { Female: '#ec4899', Male: '#6366f1', Other: '#10b981' };
const CATEGORY_COLORS = { General: '#6366f1', OBC: '#10b981', SC: '#f59e0b', ST: '#f43f5e' };

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

export default function DemographicReach({ filters }) {
  const filteredBens = useMemo(() => filterBeneficiaries(beneficiaries, filters), [filters]);

  // Gender breakdown
  const genderData = useMemo(() => {
    const counts = filteredBens.reduce((acc, b) => {
      acc[b.gender] = (acc[b.gender] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredBens]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts = filteredBens.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredBens]);

  // Age range breakdown
  const ageData = useMemo(() => {
    const counts = filteredBens.reduce((acc, b) => {
      acc[b.age_range] = (acc[b.age_range] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const order = ['6-10', '11-14', '15-18', '19-25', '26-40', '41+'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
  }, [filteredBens]);

  // District-wise performance
  const districtData = useMemo(() => {
    const grouped = {};
    filteredBens.forEach(b => {
      if (!grouped[b.district]) {
        grouped[b.district] = { count: 0, readingSum: 0, mathSum: 0, state: b.state };
      }
      grouped[b.district].count++;
      grouped[b.district].readingSum += b.reading_improvement;
      grouped[b.district].mathSum += b.math_improvement;
    });
    return Object.entries(grouped).map(([district, data]) => ({
      district,
      state: data.state,
      beneficiaries: data.count,
      avgReading: Math.round(data.readingSum / data.count),
      avgMath: Math.round(data.mathSum / data.count),
    })).sort((a, b) => b.beneficiaries - a.beneficiaries);
  }, [filteredBens]);

  // Radar chart: outcomes by category
  const radarData = useMemo(() => {
    const categories = ['General', 'OBC', 'SC', 'ST'];
    return categories.map(cat => {
      const group = filteredBens.filter(b => b.category === cat && b.is_active);
      if (!group.length) return { category: cat, reading: 0, math: 0, digital: 0, attendance: 0 };
      return {
        category: cat,
        reading: Math.round(group.reduce((s, b) => s + b.reading_improvement, 0) / group.length),
        math: Math.round(group.reduce((s, b) => s + b.math_improvement, 0) / group.length),
        digital: Math.round(group.reduce((s, b) => s + b.digital_improvement, 0) / group.length),
        attendance: Math.round(group.reduce((s, b) => s + b.attendance_rate, 0) / group.length * 100),
      };
    });
  }, [filteredBens]);

  return (
    <div>
      {/* Summary chips */}
      <div className="card animate-in" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header">
          <span className="card-title">Demographic Overview</span>
          <span className="card-badge positive">{filteredBens.length} beneficiaries</span>
        </div>
        <div className="demo-chips">
          {genderData.map((g, i) => (
            <div key={i} className="demo-chip">
              <span className="demo-chip-dot" style={{ background: GENDER_COLORS[g.name] || COLORS[i] }} />
              {g.name}
              <span className="demo-chip-value">{g.value}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ({(g.value / filteredBens.length * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 var(--space-sm)' }} />
          {categoryData.map((c, i) => (
            <div key={i} className="demo-chip">
              <span className="demo-chip-dot" style={{ background: CATEGORY_COLORS[c.name] || COLORS[i] }} />
              {c.name}
              <span className="demo-chip-value">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        {/* Gender Pie */}
        <div className="card animate-in animate-in-delay-1">
          <div className="card-header">
            <span className="card-title">Gender Distribution</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={GENDER_COLORS[entry.name] || COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.78rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="card animate-in animate-in-delay-2">
          <div className="card-header">
            <span className="card-title">Age Distribution</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Beneficiaries" radius={[6, 6, 0, 0]}>
                  {ageData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcomes by Category — Radar */}
        <div className="card animate-in animate-in-delay-3">
          <div className="card-header">
            <span className="card-title">Outcomes by Social Category</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(0,0,0,0.08)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Reading" dataKey="reading" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Radar name="Math" dataKey="math" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Digital" dataKey="digital" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Legend formatter={(v) => <span style={{ color: '#475569', fontSize: '0.75rem' }}>{v}</span>} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Table */}
        <div className="card animate-in animate-in-delay-4">
          <div className="card-header">
            <span className="card-title">District-wise Performance</span>
          </div>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>State</th>
                  <th>Beneficiaries</th>
                  <th>Avg Reading ↑</th>
                  <th>Avg Math ↑</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.district}</td>
                    <td>{d.state}</td>
                    <td style={{ fontWeight: 600 }}>{d.beneficiaries}</td>
                    <td>
                      <span style={{ color: d.avgReading > 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)' }}>
                        +{d.avgReading}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: d.avgMath > 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)' }}>
                        +{d.avgMath}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
