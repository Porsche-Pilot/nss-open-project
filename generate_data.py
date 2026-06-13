"""
Generate synthetic NGO field data for the Impact Measurement Dashboard.
NGO Focus: "Vidya Setu Foundation" — an education NGO running after-school
tutoring, digital literacy, and teacher training programs across rural India.
"""

import json
import random
import os
from datetime import datetime, timedelta

random.seed(42)

# --- Configuration ---
NUM_BENEFICIARIES = 500
NUM_ACTIVITIES = 1200
MONTHS = 18  # 18 months of data
START_DATE = datetime(2025, 1, 1)

DISTRICTS = [
    {"name": "Dharwad", "state": "Karnataka", "region": "South"},
    {"name": "Raichur", "state": "Karnataka", "region": "South"},
    {"name": "Jhansi", "state": "Uttar Pradesh", "region": "North"},
    {"name": "Fatehpur", "state": "Uttar Pradesh", "region": "North"},
    {"name": "Nandurbar", "state": "Maharashtra", "region": "West"},
    {"name": "Washim", "state": "Maharashtra", "region": "West"},
    {"name": "Purulia", "state": "West Bengal", "region": "East"},
    {"name": "Bankura", "state": "West Bengal", "region": "East"},
    {"name": "Dhamtari", "state": "Chhattisgarh", "region": "Central"},
    {"name": "Korba", "state": "Chhattisgarh", "region": "Central"},
]

PROGRAMMES = [
    {
        "id": "P001",
        "name": "After-School Tutoring",
        "type": "education",
        "cost_per_session": 350,
        "target_beneficiaries": 200,
        "target_sessions": 480,
    },
    {
        "id": "P002",
        "name": "Digital Literacy Labs",
        "type": "digital",
        "cost_per_session": 500,
        "target_beneficiaries": 150,
        "target_sessions": 300,
    },
    {
        "id": "P003",
        "name": "Teacher Training Workshops",
        "type": "training",
        "cost_per_session": 1200,
        "target_beneficiaries": 80,
        "target_sessions": 120,
    },
    {
        "id": "P004",
        "name": "Parent Engagement Drives",
        "type": "community",
        "cost_per_session": 200,
        "target_beneficiaries": 300,
        "target_sessions": 200,
    },
]

GENDER_DIST = ["Female", "Male", "Other"]
GENDER_WEIGHTS = [0.52, 0.46, 0.02]
CATEGORY_DIST = ["General", "OBC", "SC", "ST"]
CATEGORY_WEIGHTS = [0.2, 0.4, 0.25, 0.15]
AGE_RANGES = ["6-10", "11-14", "15-18", "19-25", "26-40", "41+"]

FIELD_WORKERS = [
    "Anita Sharma", "Ravi Kumar", "Priya Deshmukh", "Suresh Yadav",
    "Meena Bai", "Arjun Singh", "Kavita Joshi", "Deepak Verma",
    "Sunita Devi", "Ramesh Patil"
]

FUNDING_SOURCES = [
    "CSR - Tata Trusts", "CSR - Infosys Foundation", "Government Grant - SSA",
    "Individual Donors", "FCRA - International Aid", "Self-Generated"
]


def random_date(start, months):
    delta = timedelta(days=random.randint(0, months * 30))
    return start + delta


def generate_beneficiaries():
    beneficiaries = []
    for i in range(1, NUM_BENEFICIARIES + 1):
        district = random.choice(DISTRICTS)
        gender = random.choices(GENDER_DIST, weights=GENDER_WEIGHTS, k=1)[0]
        category = random.choices(CATEGORY_DIST, weights=CATEGORY_WEIGHTS, k=1)[0]

        if random.random() < 0.6:
            age_range = random.choice(["6-10", "11-14", "15-18"])
        else:
            age_range = random.choice(["19-25", "26-40", "41+"])

        # Pre-intervention baseline scores (out of 100)
        baseline_reading = max(5, min(100, int(random.gauss(35, 15))))
        baseline_math = max(5, min(100, int(random.gauss(30, 18))))
        baseline_digital = max(0, min(100, int(random.gauss(15, 12))))

        # Improvement depends on attendance (will be computed later)
        enrolled_programmes = random.sample(
            [p["id"] for p in PROGRAMMES],
            k=random.randint(1, 3)
        )

        beneficiaries.append({
            "id": f"BEN-{i:04d}",
            "name": f"Beneficiary_{i}",
            "gender": gender,
            "age_range": age_range,
            "category": category,
            "district": district["name"],
            "state": district["state"],
            "region": district["region"],
            "enrollment_date": random_date(START_DATE, 6).strftime("%Y-%m-%d"),
            "enrolled_programmes": enrolled_programmes,
            "baseline_reading": baseline_reading,
            "baseline_math": baseline_math,
            "baseline_digital": baseline_digital,
            "attendance_rate": round(random.uniform(0.4, 1.0), 2),
            "is_active": random.random() < 0.85,
        })

    # Compute post-intervention scores based on attendance
    for b in beneficiaries:
        att = b["attendance_rate"]
        num_prog = len(b["enrolled_programmes"])
        improvement_factor = att * (0.15 + 0.1 * num_prog) * random.uniform(0.7, 1.3)

        b["current_reading"] = min(100, int(b["baseline_reading"] * (1 + improvement_factor)))
        b["current_math"] = min(100, int(b["baseline_math"] * (1 + improvement_factor)))
        b["current_digital"] = min(100, int(b["baseline_digital"] * (1 + improvement_factor * 1.5)))
        b["reading_improvement"] = b["current_reading"] - b["baseline_reading"]
        b["math_improvement"] = b["current_math"] - b["baseline_math"]
        b["digital_improvement"] = b["current_digital"] - b["baseline_digital"]

    return beneficiaries


def generate_activities(beneficiaries):
    activities = []
    for i in range(1, NUM_ACTIVITIES + 1):
        programme = random.choice(PROGRAMMES)
        district = random.choice(DISTRICTS)
        activity_date = random_date(START_DATE, MONTHS)
        field_worker = random.choice(FIELD_WORKERS)
        funding = random.choice(FUNDING_SOURCES)

        # Participants from this district
        district_bens = [b for b in beneficiaries if b["district"] == district["name"]]
        num_participants = min(len(district_bens), random.randint(5, 30))
        participants = random.sample(
            [b["id"] for b in district_bens],
            k=min(num_participants, len(district_bens))
        ) if district_bens else []

        cost = programme["cost_per_session"] * random.uniform(0.8, 1.3)

        # Data quality simulation
        has_quality_issue = random.random() < 0.12
        quality_flags = []
        if has_quality_issue:
            quality_flags = random.sample(
                ["missing_attendance", "duplicate_entry", "date_mismatch",
                 "incomplete_form", "late_submission"],
                k=random.randint(1, 2)
            )

        activities.append({
            "id": f"ACT-{i:04d}",
            "programme_id": programme["id"],
            "programme_name": programme["name"],
            "programme_type": programme["type"],
            "date": activity_date.strftime("%Y-%m-%d"),
            "month": activity_date.strftime("%Y-%m"),
            "district": district["name"],
            "state": district["state"],
            "region": district["region"],
            "field_worker": field_worker,
            "num_participants": len(participants),
            "participant_ids": participants,
            "cost_inr": round(cost, 2),
            "funding_source": funding,
            "duration_hours": round(random.uniform(1, 4), 1),
            "quality_flags": quality_flags,
            "verified": random.random() < 0.88,
        })

    return activities


def generate_monthly_kpis(beneficiaries, activities):
    """Aggregate monthly KPIs for the dashboard."""
    months = sorted(set(a["month"] for a in activities))
    monthly = []

    for month in months:
        month_activities = [a for a in activities if a["month"] == month]
        total_cost = sum(a["cost_inr"] for a in month_activities)
        total_participants = sum(a["num_participants"] for a in month_activities)
        total_sessions = len(month_activities)
        quality_issues = sum(1 for a in month_activities if a["quality_flags"])
        verified_count = sum(1 for a in month_activities if a["verified"])

        # Per-programme breakdown
        prog_breakdown = {}
        for prog in PROGRAMMES:
            prog_acts = [a for a in month_activities if a["programme_id"] == prog["id"]]
            prog_breakdown[prog["id"]] = {
                "sessions": len(prog_acts),
                "participants": sum(a["num_participants"] for a in prog_acts),
                "cost": round(sum(a["cost_inr"] for a in prog_acts), 2),
                "target_sessions": prog["target_sessions"] // MONTHS,
            }

        monthly.append({
            "month": month,
            "total_sessions": total_sessions,
            "total_participants": total_participants,
            "total_cost_inr": round(total_cost, 2),
            "cost_per_participant": round(total_cost / max(total_participants, 1), 2),
            "cost_per_session": round(total_cost / max(total_sessions, 1), 2),
            "quality_issue_rate": round(quality_issues / max(total_sessions, 1), 3),
            "verification_rate": round(verified_count / max(total_sessions, 1), 3),
            "programme_breakdown": prog_breakdown,
        })

    return monthly


def generate_outcome_summary(beneficiaries):
    """Compute outcome-level KPIs from beneficiary data."""
    active = [b for b in beneficiaries if b["is_active"]]

    # Outcome metrics
    avg_reading_improvement = sum(b["reading_improvement"] for b in active) / len(active)
    avg_math_improvement = sum(b["math_improvement"] for b in active) / len(active)
    avg_digital_improvement = sum(b["digital_improvement"] for b in active) / len(active)

    # By demographic
    by_gender = {}
    for g in GENDER_DIST:
        group = [b for b in active if b["gender"] == g]
        if group:
            by_gender[g] = {
                "count": len(group),
                "avg_reading_improvement": round(sum(b["reading_improvement"] for b in group) / len(group), 1),
                "avg_math_improvement": round(sum(b["math_improvement"] for b in group) / len(group), 1),
                "avg_attendance": round(sum(b["attendance_rate"] for b in group) / len(group), 2),
            }

    by_category = {}
    for c in CATEGORY_DIST:
        group = [b for b in active if b["category"] == c]
        if group:
            by_category[c] = {
                "count": len(group),
                "avg_reading_improvement": round(sum(b["reading_improvement"] for b in group) / len(group), 1),
                "avg_math_improvement": round(sum(b["math_improvement"] for b in group) / len(group), 1),
                "avg_attendance": round(sum(b["attendance_rate"] for b in group) / len(group), 2),
            }

    by_district = {}
    for d in DISTRICTS:
        group = [b for b in active if b["district"] == d["name"]]
        if group:
            by_district[d["name"]] = {
                "count": len(group),
                "state": d["state"],
                "region": d["region"],
                "avg_reading_improvement": round(sum(b["reading_improvement"] for b in group) / len(group), 1),
                "avg_math_improvement": round(sum(b["math_improvement"] for b in group) / len(group), 1),
                "avg_attendance": round(sum(b["attendance_rate"] for b in group) / len(group), 2),
            }

    return {
        "total_active_beneficiaries": len(active),
        "total_enrolled": len(beneficiaries),
        "retention_rate": round(len(active) / len(beneficiaries), 3),
        "avg_reading_improvement": round(avg_reading_improvement, 1),
        "avg_math_improvement": round(avg_math_improvement, 1),
        "avg_digital_improvement": round(avg_digital_improvement, 1),
        "by_gender": by_gender,
        "by_category": by_category,
        "by_district": by_district,
    }


def main():
    print("Generating synthetic NGO data...")

    beneficiaries = generate_beneficiaries()
    activities = generate_activities(beneficiaries)
    monthly_kpis = generate_monthly_kpis(beneficiaries, activities)
    outcome_summary = generate_outcome_summary(beneficiaries)

    # NGO profile
    ngo_profile = {
        "name": "Vidya Setu Foundation",
        "mission": "Bridging the learning gap for underserved children through community-led education programs",
        "founded": 2018,
        "headquarters": "Pune, Maharashtra",
        "operating_districts": [d["name"] for d in DISTRICTS],
        "operating_states": list(set(d["state"] for d in DISTRICTS)),
        "total_staff": 45,
        "field_workers": len(FIELD_WORKERS),
        "annual_budget_inr": 8500000,
        "programmes": PROGRAMMES,
        "funding_sources": FUNDING_SOURCES,
    }

    # Save all data
    data_dir = os.path.join(os.path.dirname(__file__), "src", "data")
    os.makedirs(data_dir, exist_ok=True)

    datasets = {
        "ngo_profile.json": ngo_profile,
        "beneficiaries.json": beneficiaries,
        "activities.json": activities,
        "monthly_kpis.json": monthly_kpis,
        "outcome_summary.json": outcome_summary,
        "districts.json": DISTRICTS,
        "programmes.json": PROGRAMMES,
    }

    for filename, data in datasets.items():
        filepath = os.path.join(data_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  [OK] {filename} ({len(json.dumps(data))} bytes)")

    print(f"\nDone! Generated {len(beneficiaries)} beneficiaries, {len(activities)} activities, {len(monthly_kpis)} monthly KPI records.")
    print(f"Files saved to: {data_dir}")


if __name__ == "__main__":
    main()
