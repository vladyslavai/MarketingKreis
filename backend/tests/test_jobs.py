import io


def test_enqueue_import_job(client):
    client.post('/auth/register', json={'name':'U','email':'u@e.com','password':'p','role':'Admin'})
    client.post('/auth/login', data={'username':'u@e.com','password':'p'})

    content = b"title,type,budget,status\nTest,Branding,100,active\n"
    files = { 'file': ('test.csv', io.BytesIO(content), 'text/csv') }
    r = client.post('/import/activities', files=files)
    assert r.status_code == 200
    job_id = r.json()['jobId']

    r = client.get(f'/jobs/{job_id}')
    assert r.status_code == 200
    assert 'status' in r.json()


