import urllib.request
import urllib.parse
import json

BASE = 'http://127.0.0.1:8000/api'

def req(path, data=None, token=None, method='GET'):
    url = f"{BASE}{path}"
    headers = {}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    if isinstance(data, dict):
        headers['Content-Type'] = 'application/json'
        body = json.dumps(data).encode('utf-8')
    elif isinstance(data, str):
        body = data.encode('utf-8')
    else:
        body = None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')

# 1. Login Super Admin
s_stat, s_res = req('/auth/login', {'email': 'admin@nerlogistics.gov.in', 'password': 'admin123'}, method='POST')
assert s_stat == 200, f'Super admin login failed: {s_stat}'
admin_token = s_res['access_token']
print('Super Admin login: OK')

# 2. Login Normal User
n_stat, n_res = req('/auth/login', {'email': 'citizen@nerlogistics.gov.in', 'password': 'admin123'}, method='POST')
assert n_stat == 200, f'Normal user login failed: {n_stat}'
user_token = n_res['access_token']
print('Normal User login: OK')

# 3. Normal user attempts to update incident (PUT /incidents/1) -> MUST BE 403
put_stat, put_res = req('/incidents/1', {'status': 'Resolved'}, token=user_token, method='PUT')
assert put_stat == 403, f'Expected 403 for normal user update, got {put_stat}: {put_res}'
print('Normal User blocked from PUT incident: 403 Forbidden OK')

# 4. Super admin updates incident (PUT /incidents/1) -> MUST BE 200
put_s_stat, put_s_res = req('/incidents/1', {'severity': 'Critical', 'affected_route': 'NH-13 Sela Pass Sector'}, token=admin_token, method='PUT')
assert put_s_stat == 200, f'Super admin update failed: {put_s_stat}: {put_s_res}'
assert put_s_res['affected_route'] == 'NH-13 Sela Pass Sector'
print('Super Admin PUT incident: 200 OK, updated affected_route')

# 5. Super admin resolves incident -> status Resolved and Alert posted
res_stat, res_val = req('/incidents/1', {'status': 'Resolved'}, token=admin_token, method='PUT')
assert res_stat == 200 and res_val['status'] == 'Resolved'
print('Super Admin resolved incident: 200 OK')

# 6. Normal user views incidents and alerts
inc_stat, inc_res = req('/incidents', token=user_token)
assert inc_stat == 200 and len(inc_res) > 0
print(f'Normal User list incidents: 200 OK ({len(inc_res)} items)')

al_stat, al_res = req('/alerts', token=user_token)
assert al_stat == 200 and len(al_res) > 0
print(f'Normal User list alerts: 200 OK ({len(al_res)} alerts)')

# 7. Check if clearance alert exists
clearance_alerts = [a for a in al_res if 'CLEARANCE' in a['title'] or 'Resolved' in a['title']]
assert len(clearance_alerts) > 0, 'Clearance alert was not generated!'
print(f'Clearance alert verified: "{clearance_alerts[0]["title"].encode("ascii", "replace").decode("ascii")}"')

print('ALL BACKEND RBAC & LANDSLIDE ALERT CHECKS PASSED!')
