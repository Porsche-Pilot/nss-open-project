import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { filterActivities, filterBeneficiaries, activities, beneficiaries, formatCurrency } from './dataUtils';

export default function KPITreeView({ filters }) {
  const filteredActs = useMemo(() => filterActivities(activities, filters), [filters]);
  const filteredBens = useMemo(() => filterBeneficiaries(beneficiaries, filters), [filters]);
  const activeBens = filteredBens.filter(b => b.is_active);

  // ACTIVITY level metrics
  const totalSessions = filteredActs.length;
  const totalHours = filteredActs.reduce((s, a) => s + a.duration_hours, 0);
  const uniqueDistricts = new Set(filteredActs.map(a => a.district)).size;
  const uniqueWorkers = new Set(filteredActs.map(a => a.field_worker)).size;

  // OUTPUT level metrics
  const totalParticipants = filteredActs.reduce((s, a) => s + a.num_participants, 0);
  const uniqueEnrolled = filteredBens.length;
  const tutoringSessions = filteredActs.filter(a => a.programme_id === 'P001').length;
  const digitalSessions = filteredActs.filter(a => a.programme_id === 'P002').length;

  // OUTCOME level metrics
  const avgReadingGain = activeBens.reduce((s, b) => s + b.reading_improvement, 0) / Math.max(activeBens.length, 1);
  const avgMathGain = activeBens.reduce((s, b) => s + b.math_improvement, 0) / Math.max(activeBens.length, 1);
  const avgDigitalGain = activeBens.reduce((s, b) => s + b.digital_improvement, 0) / Math.max(activeBens.length, 1);
  const retentionRate = (activeBens.length / Math.max(filteredBens.length, 1) * 100);

  // IMPACT level metrics
  const totalCost = filteredActs.reduce((s, a) => s + a.cost_inr, 0);
  const costPerOutcome = totalCost / Math.max(activeBens.length, 1);
  const beneficiariesImproved = activeBens.filter(b => b.reading_improvement > 5 || b.math_improvement > 5).length;
  const improvementRate = (beneficiariesImproved / Math.max(activeBens.length, 1) * 100);

  const levels = [
    {
      label: 'Activity',
      color: 'activity',
      description: 'What we do on the ground',
      items: [
        { label: 'Sessions Held', value: totalSessions.toLocaleString() },
        { label: 'Total Hours', value: `${totalHours.toFixed(0)}h` },
        { label: 'Districts Covered', value: uniqueDistricts },
        { label: 'Field Workers Active', value: uniqueWorkers },
      ]
    },
    {
      label: 'Output',
      color: 'output',
      description: 'Direct products of our activities',
      items: [
        { label: 'Total Participations', value: totalParticipants.toLocaleString() },
        { label: 'Unique Enrolled', value: uniqueEnrolled },
        { label: 'Tutoring Sessions', value: tutoringSessions },
        { label: 'Digital Lab Sessions', value: digitalSessions },
      ]
    },
    {
      label: 'Outcome',
      color: 'outcome',
      description: 'Measurable changes in beneficiaries',
      items: [
        { label: 'Avg Reading Gain', value: `+${avgReadingGain.toFixed(1)} pts` },
        { label: 'Avg Math Gain', value: `+${avgMathGain.toFixed(1)} pts` },
        { label: 'Avg Digital Gain', value: `+${avgDigitalGain.toFixed(1)} pts` },
        { label: 'Retention Rate', value: `${retentionRate.toFixed(1)}%` },
      ]
    },
    {
      label: 'Impact',
      color: 'impact',
      description: 'Long-term societal change indicators',
      items: [
        { label: 'Cost per Outcome', value: formatCurrency(costPerOutcome) },
        { label: 'Beneficiaries Improved', value: beneficiariesImproved },
        { label: 'Improvement Rate', value: `${improvementRate.toFixed(1)}%` },
        { label: 'Total Investment', value: formatCurrency(totalCost) },
      ]
    },
  ];

  return (
    <div>
      <div className="card animate-in" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header">
          <span className="card-title">KPI Tree — Activity → Output → Outcome → Impact</span>
          <span className="card-badge positive">Theory of Change</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.7 }}>
          This KPI tree maps how ground-level activities ladder up through outputs and outcomes to ultimate social impact. 
          Each level answers a progressively harder question: <em>"What did we do?"</em> → <em>"What did we produce?"</em> → <em>"What changed?"</em> → <em>"Does it matter?"</em>
        </p>

        <div className="kpi-tree">
          {levels.map((level, idx) => (
            <div key={level.label}>
              <div className="kpi-tree-level">
                <div className={`kpi-tree-label ${level.color}`}>
                  <div>
                    <div>{level.label}</div>
                  </div>
                </div>
                <div className="kpi-tree-items">
                  {level.items.map((item, i) => (
                    <div key={i} className="kpi-tree-item">
                      <div className="kpi-tree-item-value">{item.value}</div>
                      <div className="kpi-tree-item-label">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {idx < levels.length - 1 && (
                <div className="kpi-tree-arrow">
                  <ArrowRight size={20} style={{ transform: 'rotate(90deg)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation Card */}
      <div className="card animate-in animate-in-delay-1">
        <div className="card-header">
          <span className="card-title">How to Read This Tree</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
          {[
            { level: 'Activity', color: 'var(--accent-indigo-light)', desc: 'The inputs and actions. Sessions run, hours invested, geographic coverage.' },
            { level: 'Output', color: 'var(--accent-cyan-light)', desc: 'Direct countable products. Number of people trained, sessions completed.' },
            { level: 'Outcome', color: 'var(--accent-emerald-light)', desc: 'Measurable behavioral change. Test scores, skill levels, retention.' },
            { level: 'Impact', color: 'var(--accent-amber-light)', desc: 'Long-term societal value. Cost-effectiveness, lives improved, systemic change.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: item.color, marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.level}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
