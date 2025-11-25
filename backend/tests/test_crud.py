def login_and_auth(client):
  client.post('/auth/register', json={'name':'A','email':'a@a.com','password':'p','role':'Admin'})
  r = client.post('/auth/login', data={'username':'a@a.com','password':'p'})
  assert r.status_code == 200


def test_activities_crud(client):
  login_and_auth(client)
  r = client.post('/activities/', json={'title':'Act1','type':'Branding'})
  assert r.status_code == 200
  act = r.json()
  r = client.get('/activities/')
  assert r.status_code == 200
  r = client.put(f"/activities/{act['id']}", json={'status':'active'})
  assert r.status_code == 200
  r = client.delete(f"/activities/{act['id']}")
  assert r.status_code == 200


def test_calendar_and_performance(client):
  login_and_auth(client)
  # create activity
  act = client.post('/activities/', json={'title':'A','type':'Branding'}).json()
  # calendar
  r = client.post('/calendar/', json={'week':1,'activity_id':act['id']})
  assert r.status_code == 200
  r = client.get('/calendar/')
  assert r.status_code == 200
  # performance
  r = client.post('/performance/', json={'activity_id':act['id'],'leads':1})
  assert r.status_code == 200
  r = client.get('/performance/')
  assert r.status_code == 200


