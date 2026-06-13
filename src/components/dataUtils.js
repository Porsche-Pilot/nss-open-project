/**
 * Utility to filter data by the global filters (programme, region, period).
 */

import monthlyKpis from '../data/monthly_kpis.json';
import activities from '../data/activities.json';
import beneficiaries from '../data/beneficiaries.json';
import outcomeSummary from '../data/outcome_summary.json';
import ngoProfile from '../data/ngo_profile.json';
import districts from '../data/districts.json';
import programmes from '../data/programmes.json';

export { monthlyKpis, activities, beneficiaries, outcomeSummary, ngoProfile, districts, programmes };

export function filterActivities(acts, filters) {
  let filtered = [...acts];

  if (filters.programme && filters.programme !== 'all') {
    filtered = filtered.filter(a => a.programme_id === filters.programme);
  }

  if (filters.region && filters.region !== 'all') {
    filtered = filtered.filter(a => a.region === filters.region);
  }

  if (filters.period && filters.period !== 'all') {
    const months = parseInt(filters.period);
    const allMonths = [...new Set(acts.map(a => a.month))].sort();
    const recentMonths = allMonths.slice(-months);
    filtered = filtered.filter(a => recentMonths.includes(a.month));
  }

  return filtered;
}

export function filterBeneficiaries(bens, filters) {
  let filtered = [...bens];

  if (filters.programme && filters.programme !== 'all') {
    filtered = filtered.filter(b => b.enrolled_programmes.includes(filters.programme));
  }

  if (filters.region && filters.region !== 'all') {
    filtered = filtered.filter(b => b.region === filters.region);
  }

  return filtered;
}

export function filterMonthlyKpis(kpis, filters) {
  let filtered = [...kpis];

  if (filters.period && filters.period !== 'all') {
    const months = parseInt(filters.period);
    filtered = filtered.slice(-months);
  }

  return filtered;
}

export function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
}

export function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getPercentChange(current, previous) {
  if (!previous) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
}
