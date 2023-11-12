import pprint
import requests

params = {'keyword': '駐車', 'limit': 3}
#params = {'law_id': '425M60080000002'}
#params = {'law_id': '425M60080000002_20200401_502M60080000004'}
params = {'law_num': '平成七年国家公安委員会規則第四号'}

url = 'https://api.lawapi-prototype-test-elaws.e-gov.go.jp/api/2'
#response = requests.get(f"{url}/keyword", params=params)
response = requests.get(f"{url}/lawdata", params=params)

data = response.json()
#print(data.keys())

law_full_text = data["law_full_text"]

#print(data)
print(law_full_text)
quit()
items = data["items"]
print(len(items))


res = []

for item in items:
    reduced_item = {}
    reduced_item["law_id"] = item["law_info"]["law_id"]
    reduced_item["law_num"] = item["law_info"]["law_num"]
    reduced_item["sentence"] = item.get("sentence")
    res.append(reduced_item)


pprint.pprint(res)
