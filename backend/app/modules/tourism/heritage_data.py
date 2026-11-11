from typing import List
from backend.app.modules.tourism.schemas import HeritageCatalogItem

HERITAGE_CATALOG: List[HeritageCatalogItem] = [
    HeritageCatalogItem(
        slug="benteng-belgica",
        title="Benteng Belgica (Fort Belgica)",
        category="BENTENG",
        island="Pulau Neira",
        historical_period="1611 (VOC Pieter Both)",
        narrative=(
            "Benteng pertahanan berbentuk segi lima peninggalan bangsa Belanda di atas bukit Tabaleku, "
            "menghadap langsung ke Gunung Api Banda dan Selat Neira. Pernah menjadi markas garnisun utama "
            "monopoli rempah pala dunia dan diabadikan dalam uang pecahan Rp 1.000 kertas emisi 2016."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5265, 129.9015),
        photo_url="https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80",
    ),
    HeritageCatalogItem(
        slug="benteng-nassau",
        title="Benteng Nassau (Fort Nassau)",
        category="BENTENG",
        island="Pulau Neira",
        historical_period="1609 (Laksamana Verhoeven)",
        narrative=(
            "Benteng pertama yang dibangun oleh VOC di Kepulauan Banda di atas pondasi benteng Portugis yang belum selesai. "
            "Saksi bisu pembunuhan Laksamana Verhoeven dan Perjanjian Perdagangan Rempah 1609 serta tragedi pembantaian 1621."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5292, 129.9042),
        photo_url="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    ),
    HeritageCatalogItem(
        slug="rumah-pengasingan-bung-hatta",
        title="Rumah Pengasingan Mohammad Hatta",
        category="RUMAH_SEJARAH",
        island="Pulau Neira",
        historical_period="1936 - 1942 (Kolonial Hindia Belanda)",
        narrative=(
            "Kediaman tempat Bapak Proklamator dan Wakil Presiden Pertama RI, Drs. Mohammad Hatta, "
            "menjalani masa pembuangan politik oleh pemerintah kolonial Belanda selama enam tahun. "
            "Di rumah ini Bung Hatta mengajar anak-anak Neira matematika, sejarah, serta menulis gagasan koperasi."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5278, 129.9038),
        photo_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    ),
    HeritageCatalogItem(
        slug="rumah-pengasingan-sutan-sjahrir",
        title="Rumah Pengasingan Sutan Sjahrir",
        category="RUMAH_SEJARAH",
        island="Pulau Neira",
        historical_period="1936 - 1942",
        narrative=(
            "Rumah peristirahatan Perdana Menteri Pertama Republik Indonesia, Sutan Sjahrir, "
            "yang diasingkan bersama Bung Hatta. Menyimpan koleksi piringan hitam klasik, gramofon, "
            "serta surat-menyurat intelektual pergerakan kemerdekaan Indonesia."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5271, 129.9029),
        photo_url="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
    ),
    HeritageCatalogItem(
        slug="istana-mini-voc",
        title="Istana Mini Banda Neira",
        category="CAGAR_BUDAYA",
        island="Pulau Neira",
        historical_period="1622 (Gubernur Jenderal Jan Pieterszoon Coen)",
        narrative=(
            "Gedung kediaman resmi Gubernur VOC di Banda Neira sebelum Batavia berkembang. "
            "Arsitektur khas Indis dengan pilar-pilar batu marmer dan lantai terakota Eropa, "
            "merupakan prototipe desain Istana Merdeka Jakarta."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5285, 129.9051),
        photo_url="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
    ),
    HeritageCatalogItem(
        slug="benteng-hollandia-lonthoir",
        title="Benteng Hollandia Lonthoir",
        category="BENTENG",
        island="Banda Besar (Lonthoir)",
        historical_period="1624",
        narrative=(
            "Benteng megah di punggung tebing Desa Lonthoir, Banda Besar, yang mengawasi kebun-kebun pala "
            "kuno dan Selat Zonnegat. Dari tangga benteng ini terlihat panorama Gunung Api Banda yang menakjubkan."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5450, 129.9020),
        photo_url="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    ),
    HeritageCatalogItem(
        slug="benteng-revenge-pulau-ay",
        title="Benteng Revenge (Fort Revenge)",
        category="BENTENG",
        island="Pulau Ay",
        historical_period="1616",
        narrative=(
            "Peninggalan benteng pertahanan VOC di Pulau Ay untuk mematahkan aliansi warga pulau dengan armada "
            "Inggris (East India Company) selama perang rempah sengit abad ke-17."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5280, 129.8380),
        photo_url="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    ),
]
