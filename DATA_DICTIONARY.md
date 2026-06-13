# Data Dictionary — Vidya Setu Foundation Impact Dashboard

## Overview

This document describes all data fields used in the Impact Measurement Dashboard for Vidya Setu Foundation. The data covers **500 beneficiaries**, **1,200 programme activities**, and **18 months** of operations across **10 districts** in 5 Indian states.

---

## 1. NGO Profile (`ngo_profile.json`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | String | Name of the NGO | "Vidya Setu Foundation" |
| `mission` | String | Mission statement | "Bridging the learning gap..." |
| `founded` | Integer | Year of establishment | 2018 |
| `headquarters` | String | HQ location | "Pune, Maharashtra" |
| `operating_districts` | Array[String] | List of active districts | ["Dharwad", "Raichur", ...] |
| `operating_states` | Array[String] | List of active states | ["Karnataka", "UP", ...] |
| `total_staff` | Integer | Total staff count | 45 |
| `field_workers` | Integer | Number of field workers | 10 |
| `annual_budget_inr` | Integer | Annual budget in INR | 8500000 |
| `programmes` | Array[Object] | List of programme definitions | See Programmes table |
| `funding_sources` | Array[String] | Sources of funding | ["CSR - Tata Trusts", ...] |

---

## 2. Beneficiaries (`beneficiaries.json`)

Each record represents one beneficiary enrolled in Vidya Setu programmes.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | String | Unique beneficiary ID | "BEN-0001" |
| `name` | String | Anonymised name | "Beneficiary_1" |
| `gender` | String | Gender identity | "Female" / "Male" / "Other" |
| `age_range` | String | Age bracket | "6-10", "11-14", "15-18", "19-25", "26-40", "41+" |
| `category` | String | Social category | "General", "OBC", "SC", "ST" |
| `district` | String | Operating district | "Dharwad" |
| `state` | String | State | "Karnataka" |
| `region` | String | Geographic region | "South", "North", "West", "East", "Central" |
| `enrollment_date` | String (Date) | Date of enrolment | "2025-03-15" |
| `enrolled_programmes` | Array[String] | Programme IDs enrolled in | ["P001", "P002"] |
| `baseline_reading` | Integer (0-100) | Pre-intervention reading score | 35 |
| `baseline_math` | Integer (0-100) | Pre-intervention math score | 30 |
| `baseline_digital` | Integer (0-100) | Pre-intervention digital literacy score | 15 |
| `current_reading` | Integer (0-100) | Latest reading score | 48 |
| `current_math` | Integer (0-100) | Latest math score | 42 |
| `current_digital` | Integer (0-100) | Latest digital literacy score | 35 |
| `reading_improvement` | Integer | Change in reading score | +13 |
| `math_improvement` | Integer | Change in math score | +12 |
| `digital_improvement` | Integer | Change in digital literacy score | +20 |
| `attendance_rate` | Float (0-1) | Proportion of sessions attended | 0.78 |
| `is_active` | Boolean | Currently active in programme | true |

---

## 3. Activities (`activities.json`)

Each record represents one programme session/activity conducted in the field.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | String | Unique activity ID | "ACT-0001" |
| `programme_id` | String | Programme identifier | "P001" |
| `programme_name` | String | Human-readable programme name | "After-School Tutoring" |
| `programme_type` | String | Programme category | "education", "digital", "training", "community" |
| `date` | String (Date) | Date of activity | "2025-06-12" |
| `month` | String | Year-month for aggregation | "2025-06" |
| `district` | String | District where conducted | "Dharwad" |
| `state` | String | State | "Karnataka" |
| `region` | String | Region | "South" |
| `field_worker` | String | Name of field worker | "Anita Sharma" |
| `num_participants` | Integer | Number of participants | 18 |
| `participant_ids` | Array[String] | IDs of participating beneficiaries | ["BEN-0012", "BEN-0045"] |
| `cost_inr` | Float | Cost of activity in INR | 425.50 |
| `funding_source` | String | Source of funding | "CSR - Tata Trusts" |
| `duration_hours` | Float | Duration in hours | 2.5 |
| `quality_flags` | Array[String] | Data quality issues detected | ["missing_attendance", "late_submission"] |
| `verified` | Boolean | Whether record has been verified | true |

### Quality Flag Values

| Flag | Meaning |
|------|---------|
| `missing_attendance` | Attendance sheet not submitted |
| `duplicate_entry` | Possible duplicate record detected |
| `date_mismatch` | Activity date doesn't match reporting period |
| `incomplete_form` | Required fields missing in submission |
| `late_submission` | Record submitted after deadline |

---

## 4. Programmes (`programmes.json`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | String | Programme identifier | "P001" |
| `name` | String | Programme name | "After-School Tutoring" |
| `type` | String | Programme category | "education" |
| `cost_per_session` | Integer | Baseline cost per session (INR) | 350 |
| `target_beneficiaries` | Integer | Target number of beneficiaries | 200 |
| `target_sessions` | Integer | Target sessions over project period | 480 |

### Programme List

| ID | Name | Type | Target Sessions |
|----|------|------|----------------|
| P001 | After-School Tutoring | education | 480 |
| P002 | Digital Literacy Labs | digital | 300 |
| P003 | Teacher Training Workshops | training | 120 |
| P004 | Parent Engagement Drives | community | 200 |

---

## 5. Monthly KPIs (`monthly_kpis.json`)

Pre-aggregated monthly metrics for dashboard performance.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | String | Year-month | "2025-01" |
| `total_sessions` | Integer | Sessions conducted in month | 65 |
| `total_participants` | Integer | Total participations (not unique) | 1,050 |
| `total_cost_inr` | Float | Total spending in month | 42,500.00 |
| `cost_per_participant` | Float | Average cost per participation | 40.48 |
| `cost_per_session` | Float | Average cost per session | 653.85 |
| `quality_issue_rate` | Float (0-1) | Proportion of records with issues | 0.12 |
| `verification_rate` | Float (0-1) | Proportion of verified records | 0.88 |
| `programme_breakdown` | Object | Per-programme monthly metrics | See below |

### Programme Breakdown (nested)

| Field | Type | Description |
|-------|------|-------------|
| `sessions` | Integer | Sessions for this programme in month |
| `participants` | Integer | Participants for this programme |
| `cost` | Float | Cost for this programme in month |
| `target_sessions` | Integer | Monthly target for comparison |

---

## 6. Outcome Summary (`outcome_summary.json`)

Aggregated outcome metrics with demographic breakdowns.

| Field | Type | Description |
|-------|------|-------------|
| `total_active_beneficiaries` | Integer | Currently active beneficiaries |
| `total_enrolled` | Integer | Total ever enrolled |
| `retention_rate` | Float (0-1) | Active / Enrolled ratio |
| `avg_reading_improvement` | Float | Average reading score gain |
| `avg_math_improvement` | Float | Average math score gain |
| `avg_digital_improvement` | Float | Average digital score gain |
| `by_gender` | Object | Metrics broken down by gender |
| `by_category` | Object | Metrics broken down by social category |
| `by_district` | Object | Metrics broken down by district |

---

## 7. Districts (`districts.json`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | String | District name | "Dharwad" |
| `state` | String | State | "Karnataka" |
| `region` | String | Region classification | "South" |

### District List

| District | State | Region |
|----------|-------|--------|
| Dharwad | Karnataka | South |
| Raichur | Karnataka | South |
| Jhansi | Uttar Pradesh | North |
| Fatehpur | Uttar Pradesh | North |
| Nandurbar | Maharashtra | West |
| Washim | Maharashtra | West |
| Purulia | West Bengal | East |
| Bankura | West Bengal | East |
| Dhamtari | Chhattisgarh | Central |
| Korba | Chhattisgarh | Central |

---

## KPI Definitions

| KPI | Formula | Level |
|-----|---------|-------|
| **Composite Impact Score** | `(reading_gain × 0.3) + (math_gain × 0.3) + (retention_rate × 0.2) + (reach_factor × 0.2)` | Impact |
| **Retention Rate** | `active_beneficiaries / total_enrolled × 100` | Outcome |
| **Cost per Beneficiary** | `total_cost / active_beneficiaries` | Impact |
| **Cost per Session** | `total_cost / total_sessions` | Output |
| **Data Quality Score** | `(1 - quality_issue_rate) × 100` | Operations |
| **Verification Rate** | `verified_records / total_records × 100` | Operations |
| **Improvement Rate** | `beneficiaries_with_score_gain_>5 / total_active × 100` | Outcome |

---

*Document Version: 1.0 | Generated: June 2026 | Vidya Setu Foundation — NSS Open Projects 2026, Challenge 5.1*
