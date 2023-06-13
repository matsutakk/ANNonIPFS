import json

contract_address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
with open(f'data/{contract_address}.json', 'r') as f:
    json_load = json.load(f)

for key, value in json_load.items():
    value = value.replace('\n', '')
    value = value.replace(' ', '')
    value = value.replace('\"', '')
    value = value.replace('\'', '')
    json_load[key] = value

with open(f'data/{contract_address}.json', 'w') as f:
    json.dump(json_load, f, indent=2)