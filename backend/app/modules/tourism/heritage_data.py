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
        photo_url="/images/landmarks/belgica.jpg",
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
        photo_url="/images/landmarks/nassau.jpg",
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
        photo_url="/images/landmarks/bung-hatta.jpg",
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
        photo_url="/images/landmarks/sutan-sjahrir.jpg",
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
        photo_url="/images/landmarks/istana-mini.jpg",
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
        photo_url="/images/landmarks/hollandia.jpg",
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
        photo_url="/images/landmarks/benteng-revenge.jpg",
    ),
    HeritageCatalogItem(
        slug="klenteng-sun-tian-kong",
        title="Klenteng Sun Tian Kong (1673)",
        category="CAGAR_BUDAYA",
        island="Pulau Neira",
        historical_period="1673 (Jaringan Niaga Bahari Tionghoa)",
        narrative=(
            "Klenteng bersejarah tertua di Kepulauan Banda yang didirikan tahun 1673 sebagai bukti akulturasi "
            "harmonis pelaut dan pedagang Tionghoa dengan masyarakat adat Banda. Panduan Etika Adat (Tabea & Sasi): "
            "Wisatawan wajib berpakaian sopan, mengucapkan salam Tabea kepada penjaga klenteng, serta tidak menyentuh "
            "altar persembahan atau artefak kayu berukir tanpa izin."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5262, 129.9038),
        photo_url="/images/landmarks/klenteng.jpg",
    ),
    HeritageCatalogItem(
        slug="sumur-pusaka-parigi-rante-rumah-budaya",
        title="Sumur Pusaka Parigi Rante & Rumah Budaya",
        category="CAGAR_BUDAYA",
        island="Pulau Neira",
        historical_period="Abad ke-16 - ke-17 (Adat Negeri & Kolonial)",
        narrative=(
            "Situs sakral Sumur Pusaka Parigi Rante yang menjadi pusat ritual adat pencucian rantai pusaka (Buka Kampong) "
            "berdampingan dengan Rumah Budaya Banda yang menyimpan meriam VOC, lukisan Tragedi 1621, dan mata uang kuno. "
            "Panduan Etika Adat (Tabea & Sasi): Pengunjung wajib menjaga ketenangan, menghormati hukum adat Sasi dan tata "
            "krama Tabea, serta meminta pendampingan juru kunci adat saat mendekati area sumur keramat."
        ),
        audio_guide_url="https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg",
        coordinates=(-4.5274, 129.9032),
        photo_url="/images/landmarks/perigi-rante.jpg",
    ),
]
