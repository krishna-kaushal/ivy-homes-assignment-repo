import urllib.request
import urllib.error
import urllib.parse
import json
import os
import time

API_KEY = "IVY26-BD3271504E07"
BASE_URL = "https://solve.ivy.homes"
LIMIT = 50
TOKEN = None

def login():
    global TOKEN
    url = f"{BASE_URL}/auth/login"
    data = json.dumps({
        "email": "demo1@ivy.homes",
        "password": "29539c9780"
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data)
    req.add_header('X-API-Key', API_KEY)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            TOKEN = res_data.get("access_token")
            print("Successfully logged in.")
    except Exception as e:
        print(f"Login Error: {e}")

def get_json(url):
    req = urllib.request.Request(url)
    req.add_header('X-API-Key', API_KEY)
    if TOKEN:
        req.add_header('Authorization', f'Bearer {TOKEN}')
        
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error on {url}: {e}")
        return None

def fetch_all(endpoint):
    print(f"Fetching {endpoint}...")
    all_results = []
    offset = 0
    
    while True:
        url = f"{BASE_URL}{endpoint}?offset={offset}&limit={LIMIT}"
        data = get_json(url)
        
        if not data:
            break
            
        results = data.get("results", [])
        all_results.extend(results)
        
        total = data.get("total", 0)
        has_more = data.get("has_more", False)
        
        print(f"Fetched offset {offset} - {len(results)} records (Total so far: {len(all_results)}/{total})")
        
        if not has_more or len(results) == 0:
            break
            
        offset += len(results)
        time.sleep(0.1)
        
    return all_results

def main():
    login()
    if not TOKEN:
        print("Failed to get token, aborting.")
        return
        
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    
    listings = fetch_all("/v1/listings")
    with open(f"{data_dir}/listings.json", "w") as f:
        json.dump(listings, f, indent=2)
        
    rentals = fetch_all("/v1/rentals")
    with open(f"{data_dir}/rentals.json", "w") as f:
        json.dump(rentals, f, indent=2)
        
    projects = fetch_all("/v1/projects")
    with open(f"{data_dir}/projects.json", "w") as f:
        json.dump(projects, f, indent=2)
            
    print("Done downloading data.")

if __name__ == "__main__":
    main()
