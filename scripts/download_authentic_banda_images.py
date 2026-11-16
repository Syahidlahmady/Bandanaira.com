import os
import time
import json
import urllib.request
import urllib.parse

os.makedirs('frontend/public/images/landmarks', exist_ok=True)

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
HEADERS = {'User-Agent': USER_AGENT}

TARGETS = [
    ('belgica.jpg', 'Fort Belgica (48250814991).jpg'),
    ('nassau.jpg', 'Benteng Nassau 02.jpg'),
    ('istana-mini.jpg', 'Istana Mini (48226707612).jpg'),
    ('bung-hatta.jpg', 'Rumah Pengasingan Bung Hatta 03.jpg'),
    ('sutan-sjahrir.jpg', 'Rumah Pengasingan Bung Sjahrir.jpg'),
    ('gunung-api.jpg', 'Banda Neira and Gunung Api.jpg'),
    ('lava-flow.jpg', '2019-03-27 Lava Flows Gunung Api.jpg'),
    ('hollandia.jpg', 'Fort Hollandia (48216003921).jpg'),
    ('pohon-talang.jpg', 'Fort Hollandia (48216003921).jpg'),
    ('rumah-budaya.jpg', 'Rumah Budaya Banda 2026 03.jpg'),
    ('gereja-tua.jpg', 'Gereja Tua Banda (48248765226).jpg'),
    ('gereja-betlehem.jpg', 'Gereja Tua Neira 05.jpg'),
    ('klenteng.jpg', 'Klenteng Sun Thien Kong (Banda Neira) 01.jpg'),
    ('sumur-lonthoir.jpg', 'Sumur Pusaka Lonthoir 01.jpg'),
    ('pulau-rhun.jpg', 'Run, Banda islands, Maluku, Indonesia.jpg'),
    ('pulau-nailaka.jpg', 'Nailaka Island1.jpg'),
    ('pulau-ay.jpg', 'Ai Island1.jpg'),
    ('benteng-revenge.jpg', 'Benteng Revenge 10.jpg'),
    ('concordia.jpg', 'AMH-4731-NA Fort at Waijer.jpg'),
    ('bandara.jpg', 'Bandanaira Airport Runway.jpg'),
    ('pulau-pisang.jpg', 'Banda Pisang.jpg'),
    ('kebun-pala.jpg', 'Blätter eines jungen Muskatnussbaums (Myristica fragrans).jpg'),
    ('welvaren.jpg', 'Luchtfoto van Pulau Ai, de noordkust met rechts Perk Welvaren en grote droogloods - 20650911 - RCE.jpg'),
    ('pelabuhan.jpg', 'Banda-0039.jpg'),
    ('hotel-maulana.jpg', 'COLLECTIE TROPENMUSEUM Het hotel te Neira TMnr 60033448.jpg'),
    ('colonial-house.jpg', 'COLLECTIE TROPENMUSEUM Een straat met perkenierswoningen in Banda-Neira TMnr 60014216.jpg'),
]

def get_file_url(filename):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(filename)}&prop=imageinfo&iiprop=url&format=json&iiurlwidth=1200'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as res:
        data = json.loads(res.read().decode())
        pages = data.get('query', {}).get('pages', {})
        for p in pages.values():
            info = p.get('imageinfo', [{}])[0]
            return info.get('thumburl') or info.get('url')
    return None

def download_file(url, out_path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as res:
        content = res.read()
        with open(out_path, 'wb') as f:
            f.write(content)
        return len(content)

print(f'Starting authentic image scraping for {len(TARGETS)} landmark targets...')

for dest_name, wiki_file in TARGETS:
    out_path = os.path.join('frontend/public/images/landmarks', dest_name)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        print(f'Already exists: {dest_name} ({os.path.getsize(out_path)} bytes)')
        continue
    
    print(f'Fetching URL for: {wiki_file} -> {dest_name}...')
    try:
        img_url = get_file_url(wiki_file)
        if not img_url:
            print(f'  Failed to get URL for {wiki_file}')
            continue
        
        time.sleep(1.2)
        size = download_file(img_url, out_path)
        print(f'  Downloaded {dest_name}: {size} bytes')
    except Exception as e:
        print(f'  Error downloading {dest_name}: {e}')
    
    time.sleep(1.5)

print('Finished scraping authentic landmark images!')
