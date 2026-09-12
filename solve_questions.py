import json
from datetime import datetime, timezone, timedelta

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

listings = load_json('data/listings.json')
rentals = load_json('data/rentals.json')
projects = load_json('data/projects.json')

print(f"1. total_listing_records: {len(listings)}")

# 2. Unique properties
# To find unique properties, we can look at the physical attributes + location + project + apartment_name
# Or maybe coordinates?
# Let's write a function to group them by exact coordinates or similar combination of attributes.
# For now let's just see how many unique (latitude, longitude) there are, or (locality, apartment_name, floor, bedroom)
# Actually, the instructions say "genuine or not, how many distinct properties do they describe? A property described by several records counts once."
# Usually, listings with same lat, lng, floor, bhk, property_type, area, facing... are same.

active = [L for L in listings if L.get('is_live', False)]
print(f"3. active_listings: {len(active)}")

# Q5
gcr_rentals = [R for R in rentals if R.get('locality', '').lower() == 'golf course road']
total_rent = sum(R.get('price', 0) for R in gcr_rentals)
print(f"5. total_monthly_rent in Golf Course Road: {total_rent}")

# Q7
costliest = max(projects, key=lambda p: p.get('price_max', 0))
print(f"7. costliest_project: {costliest.get('project_id')} with max price {costliest.get('price_max')}")

# Q8
ref_time = datetime.fromisoformat("2026-09-10T00:00:00+05:30")
start_time = ref_time - timedelta(days=7)
last_7_days_count = 0
naive_dates = 0
for L in listings:
    posted = L.get('posted_at')
    if posted:
        try:
            if posted.endswith('Z'):
                posted = posted[:-1] + '+00:00'
            else:
                # Missing timezone! Let's assume IST or UTC? The documentation says UTC.
                naive_dates += 1
                posted = posted + '+00:00' # Assume UTC for comparison
            pt = datetime.fromisoformat(posted)
            if start_time <= pt < ref_time:
                last_7_days_count += 1
        except Exception as e:
            print(f"Error parsing date {posted}: {e}")
print(f"8. listings_last_7_days: {last_7_days_count}")
print(f"   (Naive dates found: {naive_dates})")

# Q10
project_listing_counts = {}
for L in listings:
    pid = L.get('project_id')
    if pid:
        project_listing_counts[pid] = project_listing_counts.get(pid, 0) + 1

wrong_projects = 0
for p in projects:
    pid = p.get('project_id')
    reported = p.get('total_listings', 0)
    actual = project_listing_counts.get(pid, 0)
    if reported != actual:
        wrong_projects += 1
print(f"10. projects_with_wrong_listing_count: {wrong_projects}")

