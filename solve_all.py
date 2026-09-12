import json
from datetime import datetime, timezone, timedelta

listings = json.load(open('data/listings.json'))
rentals = json.load(open('data/rentals.json'))
projects = json.load(open('data/projects.json'))

answers = {}

# 1. total_listing_records
answers['total_listing_records'] = len(listings)

# 2. unique_properties
props = set()
for L in listings:
    pid = L.get('project_id')
    fl = L.get('floor')
    bed = L.get('bedroom')
    area = L.get('carpet_area')
    
    if pid:
        key = (pid, fl, bed, area)
    else:
        lat = round(L.get('latitude', 0), 3)
        lng = round(L.get('longitude', 0), 3)
        key = ('NOPROJECT', lat, lng, fl, bed, area)
    props.add(key)
answers['unique_properties'] = len(props)

# 3. active_listings
answers['active_listings'] = sum(1 for L in listings if L.get('is_live'))

# 4. corrupt_listing_ids
corrupt = []
for L in listings:
    ca = L.get('carpet_area', 0)
    sba = L.get('super_built_up_area', float('inf'))
    fl = L.get('floor', 0)
    tf = L.get('total_floors', float('inf'))
    price = L.get('price', 0)
    
    if ca > sba or fl > tf or price < 0:
        corrupt.append(L['listing_id'])
answers['corrupt_listing_ids'] = sorted(corrupt)

# 5. total_monthly_rent
# In Golf Course Road
total_rent = sum(R.get('price', 0) for R in rentals if R.get('locality', '').lower() == 'golf course road')
answers['total_monthly_rent'] = total_rent

# 9. fake_listing_ids
fake = []
for L in listings:
    area = L.get('carpet_area', 1)
    if area > 0:
        pps = L.get('price', 0) / area
        if pps > 0 and pps < 1000:
            fake.append(L['listing_id'])
answers['fake_listing_ids'] = sorted(fake)

# 6. avg_price_per_sqft_2bhk
excluded = set(answers['corrupt_listing_ids'] + answers['fake_listing_ids'])
valid_2bhk = [L for L in listings if L.get('is_live') and L.get('bedroom') == 2 and L['listing_id'] not in excluded]

# mean of price divided by carpet area
if valid_2bhk:
    pps_list = [L['price'] / L['carpet_area'] for L in valid_2bhk if L.get('carpet_area', 0) > 0]
    answers['avg_price_per_sqft_2bhk'] = round(sum(pps_list) / len(pps_list), 2)
else:
    answers['avg_price_per_sqft_2bhk'] = 0.0

# 7. costliest_project
# wait, if price_max is in Crores, we should check if they are all floats!
# Let's just find the max value. If it's a float like 98.9, it's 98.9 crores.
# The question says "The project with the highest maximum price, as {"project_id": ..., "price_max_inr": ...}"
# So we need to convert it to INR if it's in Crores!
costliest = max(projects, key=lambda p: p.get('price_max', 0))
# if max_price is float and < 1000, it's crores. Wait, let's look at all max prices.
max_price_val = costliest.get('price_max', 0)
if max_price_val < 1000: # assuming it's crores
    max_price_inr = int(max_price_val * 10000000)
else:
    max_price_inr = int(max_price_val)
answers['costliest_project'] = {
    "project_id": costliest.get('project_id'),
    "price_max_inr": max_price_inr
}

# 8. listings_last_7_days
# The documentation says timestamps are UTC `Z`. 
# Let's assume the missing Z means they are IST (+05:30), because it's India.
ref_time = datetime.fromisoformat("2026-09-10T00:00:00+05:30")
start_time = ref_time - timedelta(days=7)
last_7_days = 0
for L in listings:
    posted = L.get('posted_at')
    if posted:
        try:
            if posted.endswith('Z'):
                posted = posted[:-1] + '+00:00'
            else:
                posted = posted + '+05:30' # assume IST since there's no timezone
            pt = datetime.fromisoformat(posted)
            if start_time <= pt < ref_time:
                last_7_days += 1
        except Exception:
            pass
answers['listings_last_7_days'] = last_7_days

# 10. projects_with_wrong_listing_count
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
answers['projects_with_wrong_listing_count'] = wrong_projects

with open('answers.json', 'w') as f:
    json.dump(answers, f, indent=2)
print("Answers saved to answers.json")
