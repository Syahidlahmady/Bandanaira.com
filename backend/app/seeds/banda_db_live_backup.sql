--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg110+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO postgres;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO postgres;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO postgres;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accommodations (
    id uuid NOT NULL,
    name character varying(150) NOT NULL,
    type character varying(50) DEFAULT 'HOMESTAY'::character varying NOT NULL,
    island_name character varying(100) DEFAULT 'Pulau Neira'::character varying NOT NULL,
    address character varying(255) DEFAULT 'Banda Neira, Maluku Tengah'::character varying NOT NULL,
    price_per_night_rp numeric(12,2) NOT NULL,
    rooms_available integer DEFAULT 5 NOT NULL,
    has_clean_ro_water boolean DEFAULT true NOT NULL,
    has_solar_backup boolean DEFAULT true NOT NULL,
    eco_stay_badge boolean DEFAULT true NOT NULL,
    contact_whatsapp character varying(20) DEFAULT '6281234567891'::character varying NOT NULL,
    description text NOT NULL,
    photo_url character varying(255),
    is_verified boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accommodations OWNER TO postgres;

--
-- Name: administrative_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrative_requests (
    id uuid NOT NULL,
    resident_id uuid NOT NULL,
    request_type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'submitted'::character varying NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.administrative_requests OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_name character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    changes_json json,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: batch_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_events (
    id uuid NOT NULL,
    batch_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    event_timestamp timestamp with time zone NOT NULL,
    recorded_by_user_id uuid NOT NULL,
    location character varying(255),
    description text,
    metadata_json json,
    event_hash character varying(64) NOT NULL,
    previous_event_hash character varying(64),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.batch_events OWNER TO postgres;

--
-- Name: batch_harvests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_harvests (
    batch_id uuid NOT NULL,
    harvest_id uuid NOT NULL,
    allocated_quantity_kg double precision NOT NULL
);


ALTER TABLE public.batch_harvests OWNER TO postgres;

--
-- Name: blockchain_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blockchain_transactions (
    id uuid NOT NULL,
    batch_id uuid NOT NULL,
    event_id uuid,
    transaction_hash character varying(66),
    block_number bigint,
    contract_address character varying(42) NOT NULL,
    data_hash character varying(66) NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    submitted_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.blockchain_transactions OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id uuid NOT NULL,
    booking_code character varying(36) NOT NULL,
    accommodation_id uuid NOT NULL,
    guest_name character varying(150) NOT NULL,
    guest_whatsapp character varying(20) NOT NULL,
    guest_email character varying(100),
    check_in date NOT NULL,
    check_out date NOT NULL,
    total_nights integer DEFAULT 1 NOT NULL,
    rooms_count integer DEFAULT 1 NOT NULL,
    total_price_rp numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    notes text,
    wa_link text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: coop_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coop_accounts (
    id uuid NOT NULL,
    resident_id uuid NOT NULL,
    coop_balance_rp numeric(12,2) DEFAULT 0.0 NOT NULL,
    plastic_points integer DEFAULT 0 NOT NULL,
    clean_water_quota_ltr double precision DEFAULT '20'::double precision NOT NULL,
    total_commodities_kg double precision DEFAULT '0'::double precision NOT NULL,
    total_plastic_recycled_kg double precision DEFAULT '0'::double precision NOT NULL,
    pin_hash character varying(128),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coop_accounts OWNER TO postgres;

--
-- Name: coop_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coop_transactions (
    id uuid NOT NULL,
    account_id uuid NOT NULL,
    resident_id uuid NOT NULL,
    transaction_code character varying(36) NOT NULL,
    transaction_type character varying(50) NOT NULL,
    item_name character varying(100) NOT NULL,
    weight_or_volume numeric(10,2) NOT NULL,
    unit_price_rp numeric(10,2) DEFAULT 0.0 NOT NULL,
    monetary_value_rp numeric(10,2) DEFAULT 0.0 NOT NULL,
    water_quota_impact_ltr double precision DEFAULT '0'::double precision NOT NULL,
    destination character varying(20) DEFAULT 'BALANCE'::character varying NOT NULL,
    receipt_hash character varying(66) NOT NULL,
    station_code character varying(50),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coop_transactions OWNER TO postgres;

--
-- Name: farmer_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farmer_groups (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    leader_name character varying(255),
    village character varying(100) DEFAULT 'Banda Neira'::character varying NOT NULL,
    contact_number character varying(20),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.farmer_groups OWNER TO postgres;

--
-- Name: farmers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farmers (
    id uuid NOT NULL,
    farmer_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    user_id uuid,
    resident_id uuid,
    farmer_group_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.farmers OWNER TO postgres;

--
-- Name: farms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farms (
    id uuid NOT NULL,
    farmer_id uuid NOT NULL,
    farm_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    location_description text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    polygon_boundary_geojson json,
    area_sqm double precision DEFAULT '0'::double precision NOT NULL,
    primary_commodity character varying(100) NOT NULL,
    verification_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.farms OWNER TO postgres;

--
-- Name: harvests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.harvests (
    id uuid NOT NULL,
    farm_id uuid NOT NULL,
    farmer_id uuid NOT NULL,
    harvest_code character varying(50) NOT NULL,
    commodity character varying(100) NOT NULL,
    harvest_date date NOT NULL,
    quantity_kg double precision NOT NULL,
    quality_grade character varying(20),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.harvests OWNER TO postgres;

--
-- Name: iot_telemetry_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iot_telemetry_logs (
    id uuid NOT NULL,
    station_code character varying(50) NOT NULL,
    station_name character varying(150) NOT NULL,
    island_name character varying(100) NOT NULL,
    raw_water_tds_ppm double precision DEFAULT '2400'::double precision NOT NULL,
    filtered_water_tds_ppm double precision DEFAULT '58.5'::double precision NOT NULL,
    clean_tank_level_pct double precision DEFAULT '85'::double precision NOT NULL,
    daily_dispensed_liters double precision DEFAULT '0'::double precision NOT NULL,
    valve_status character varying(20) DEFAULT 'CLOSED'::character varying NOT NULL,
    active_power_source character varying(50) DEFAULT 'SOLAR_DIRECT_GRAVITY'::character varying NOT NULL,
    solar_panel_voltage_v double precision DEFAULT '26.4'::double precision NOT NULL,
    solar_current_a double precision DEFAULT '8.2'::double precision NOT NULL,
    power_watt double precision DEFAULT '216.48'::double precision NOT NULL,
    battery_soc_pct double precision DEFAULT '92'::double precision NOT NULL,
    alert_level character varying(20) DEFAULT 'NORMAL'::character varying NOT NULL,
    alert_message character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.iot_telemetry_logs OWNER TO postgres;

--
-- Name: product_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_batches (
    id uuid NOT NULL,
    batch_code character varying(50) NOT NULL,
    commodity character varying(100) NOT NULL,
    total_quantity_kg double precision NOT NULL,
    production_date date NOT NULL,
    public_verification_token character varying(64) NOT NULL,
    status character varying(50) DEFAULT 'created'::character varying NOT NULL,
    blockchain_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_batches OWNER TO postgres;

--
-- Name: raw_surveys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raw_surveys (
    id uuid NOT NULL,
    survey_code character varying(30) NOT NULL,
    collector_name character varying(120) NOT NULL,
    problem_domain character varying(40) NOT NULL,
    island_name character varying(50) NOT NULL,
    village_name character varying(100),
    rt_rw character varying(30),
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    title character varying(200) NOT NULL,
    urgency_level character varying(20) DEFAULT 'SEDANG'::character varying NOT NULL,
    flexible_attributes json,
    photo_evidence_url character varying(255),
    notes text,
    etl_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    migrated_feature_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.raw_surveys OWNER TO postgres;

--
-- Name: residents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.residents (
    id uuid NOT NULL,
    nik character varying(16) NOT NULL,
    full_name character varying(255) NOT NULL,
    gender character varying(10) NOT NULL,
    birth_place character varying(100),
    birth_date date,
    address text,
    rt character varying(5),
    rw character varying(5),
    village character varying(100) DEFAULT 'Banda Neira'::character varying NOT NULL,
    religion character varying(50),
    marital_status character varying(50),
    occupation character varying(100),
    phone_number character varying(20),
    verification_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    verified_by uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    nik_encrypted text,
    nik_blind_index character varying(64)
);


ALTER TABLE public.residents OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: spatial_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spatial_features (
    id uuid NOT NULL,
    name character varying(150) NOT NULL,
    layer_type character varying(50) NOT NULL,
    category character varying(30) DEFAULT 'publik'::character varying NOT NULL,
    island_name character varying(50) NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    geometry_geojson json,
    properties_meta json,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.spatial_features OWNER TO postgres;

--
-- Name: tour_guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_guides (
    id uuid NOT NULL,
    name character varying(150) NOT NULL,
    license_number character varying(50) DEFAULT 'HPI-BANDA-LOKAL'::character varying NOT NULL,
    phone_whatsapp character varying(20) NOT NULL,
    specialties character varying(255) NOT NULL,
    languages character varying(100) DEFAULT 'Indonesia, English'::character varying NOT NULL,
    fee_per_day_rp numeric(12,2) NOT NULL,
    photo_url character varying(255),
    bio text NOT NULL,
    island_base character varying(100) DEFAULT 'Pulau Neira'::character varying NOT NULL,
    is_verified boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    rating numeric(3,2) DEFAULT 4.9 NOT NULL,
    trips_completed integer DEFAULT 12 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tour_guides OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_superuser boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accommodations (id, name, type, island_name, address, price_per_night_rp, rooms_available, has_clean_ro_water, has_solar_backup, eco_stay_badge, contact_whatsapp, description, photo_url, is_verified, created_at, updated_at) FROM stdin;
2d634d68-5d12-44c0-ae82-34df7073b96c	Delfika Homestay & Heritage Villa	HOMESTAY	Pulau Neira	Jl. Nusantara No. 12, Banda Neira	350000.00	6	t	t	t	6281234567891	Homestay bernuansa kolonial peninggalan abad ke-18 dengan halaman kebun pala luas, air minum RO gratis dari Koperasi Hatta, dan panel surya mandiri.	https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80	t	2026-11-13 13:54:27.240288+00	2026-11-13 13:54:27.240288+00
e63e23a7-7ec2-4c13-a54b-f4537496e46d	The Nutmeg Tree Seaside Hotel	HOTEL	Pulau Neira	Jl. Pelabuhan Banda Neira No. 04	600000.00	10	t	t	t	6281234567892	Hotel tepi pantai dengan panorama Gunung Api Banda. Dilengkapi stasiun pengisian tumbler air minum higienis dan fasilitas diving terverifikasi PADI.	https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80	t	2026-11-13 13:54:27.240288+00	2026-11-13 13:54:27.240288+00
a6fef506-e056-4721-b124-ee26910089c0	Maulana Hotel & Heritage Resto	HOTEL	Pulau Neira	Jl. Pelabuhan, Banda Neira	750000.00	8	t	f	f	6281234567893	Hotel bersejarah langganan tokoh nasional dan mancanegara dengan dermaga pribadi langsung ke Selat Neira.	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80	t	2026-11-13 13:54:27.240288+00	2026-11-13 13:54:27.240288+00
83b916ee-88f7-4137-918b-d25d678fd5b9	Mutiara Guesthouse Banda	HOMESTAY	Pulau Neira	Jl. Kujali, Banda Neira	250000.00	4	t	f	t	6281234567894	Penginapan ramah anggaran dengan sarapan pisang goreng sambal kenari dan teh rempah pala khas Banda.	https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80	t	2026-11-13 13:54:27.240288+00	2026-11-13 13:54:27.240288+00
40a0105c-1434-4bd8-be49-09f8a64e7bef	Hatta Island Coral Reef Cabin	CABIN	Pulau Hatta	Kampung Lama, Pulau Hatta	400000.00	4	t	t	t	6281234567895	Kabin kayu ramah lingkungan 100% bertenaga surya langsung di bibir terumbu karang pulau Hatta.	https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80	t	2026-11-13 13:54:27.240288+00	2026-11-13 13:54:27.240288+00
2f837c0d-1b1d-4947-9d02-70b944af31a1	Ai Island Spice & Beach Lodge	HOMESTAY	Pulau Ay	Pesisir Barat Pulau Ay	300000.00	5	t	t	t	6281234567896	Lodge tepi pantai berpasir putih di dekat benteng Revenge dengan pemandangan lumba-lumba liar di pagi hari.	https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80	t	2026-11-13 13:54:27.240288+00	2026-11-13 13:54:27.240288+00
\.


--
-- Data for Name: administrative_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_requests (id, resident_id, request_type, status, notes, created_at, updated_at) FROM stdin;
667cb487-294f-4c59-83b4-9fb590a9b819	ddc28b50-a0e1-4c09-9992-54fb85d64149	Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)	approved	Disetujui untuk pengajuan modal KUR Pertanian Bank Mandiri Banda	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
15c86f11-b76a-463c-a00f-39325a3566d7	cd479262-b9bb-477a-82b1-835db1ca60ab	Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)	submitted	Pengajuan kuota solar bersubsidi perahu nelayan 5 GT di SPDN Banda Neira	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
655f177d-7512-44e1-96cb-18bb3dcae314	d52cce62-0e44-4e39-8b00-27b850f61955	Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah	submitted	Pengajuan verifikasi mutu Indikasi Geografis Fuli Merah Banda	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
012_tour_guides_table
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_name, entity_id, changes_json, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: batch_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_events (id, batch_id, event_type, event_timestamp, recorded_by_user_id, location, description, metadata_json, event_hash, previous_event_hash, created_at) FROM stdin;
09e06821-e4c7-43ae-8673-440c660257bb	ab0e106c-0e30-42d0-b19f-9d295ead51fd	harvest_aggregated	2026-10-25 13:59:36.813567+00	c91ca400-fd2f-45aa-b179-d20559db60a6	Sentra Pengumpulan Lonthoir	Penggabungan 350kg biji pala ranum dari petani mitra	{"location": "Sentra Pengumpulan Lonthoir", "description": "Penggabungan 350kg biji pala ranum dari petani mitra"}	5462b0b63312c2be527a5f18bf85e6ae05147bec98f0c2061b724eb5700a81f6	\N	2026-11-13 13:59:36.814828+00
ae69ea03-cfb9-4a88-83c8-020da02ccea4	ab0e106c-0e30-42d0-b19f-9d295ead51fd	sorting	2026-10-26 13:59:36.813573+00	c91ca400-fd2f-45aa-b179-d20559db60a6	Unit Sortasi Lonthoir	Pemisahan tempurung dan sortasi ukuran butir Grade A Super	{"location": "Unit Sortasi Lonthoir", "description": "Pemisahan tempurung dan sortasi ukuran butir Grade A Super"}	2f53e8ae5c1374128b6ece92a9fe7bd9b3fc03755efbf125a805ac0072016368	5462b0b63312c2be527a5f18bf85e6ae05147bec98f0c2061b724eb5700a81f6	2026-11-13 13:59:36.816863+00
e981bf06-64fc-4463-ae7e-24d1491eeb02	ab0e106c-0e30-42d0-b19f-9d295ead51fd	drying	2026-11-01 13:59:36.813575+00	c91ca400-fd2f-45aa-b179-d20559db60a6	Rumah Jemur Surya Lonthoir	Pengeringan surya terkontrol 6 hari hingga kadar air < 10%	{"location": "Rumah Jemur Surya Lonthoir", "description": "Pengeringan surya terkontrol 6 hari hingga kadar air < 10%"}	d1a1b2b281d5c0d5663f1c7944e0278b9de5bd6cb1e547905d60edff3148fd1f	2f53e8ae5c1374128b6ece92a9fe7bd9b3fc03755efbf125a805ac0072016368	2026-11-13 13:59:36.818153+00
ac0d025f-3cf0-4dfa-b92c-8e42f8465dcb	ab0e106c-0e30-42d0-b19f-9d295ead51fd	packaging	2026-11-08 13:59:36.813577+00	c91ca400-fd2f-45aa-b179-d20559db60a6	Fasilitas Pengemasan Desa Banda Neira	Pengemasan vakum nitrogen food-grade standar ekspor Eropa	{"location": "Fasilitas Pengemasan Desa Banda Neira", "description": "Pengemasan vakum nitrogen food-grade standar ekspor Eropa"}	12e22a08be54aa16719813a3a918abace4d2f2f3c6ce1b616c85478aaba87f61	d1a1b2b281d5c0d5663f1c7944e0278b9de5bd6cb1e547905d60edff3148fd1f	2026-11-13 13:59:36.819462+00
7780328c-2704-4430-a189-1622240ef283	ab0e106c-0e30-42d0-b19f-9d295ead51fd	quality_inspection	2026-11-11 13:59:36.813578+00	c91ca400-fd2f-45aa-b179-d20559db60a6	Laboratorium Pengujian Rempah Banda	Sertifikasi lolos uji aflatoksin & penetapan Indikasi Geografis	{"location": "Laboratorium Pengujian Rempah Banda", "description": "Sertifikasi lolos uji aflatoksin & penetapan Indikasi Geografis"}	0baa9de410a2f05975889d7ad599f8e6f4eb20047b931c5b3a10c7103ff8dc37	12e22a08be54aa16719813a3a918abace4d2f2f3c6ce1b616c85478aaba87f61	2026-11-13 13:59:36.820694+00
\.


--
-- Data for Name: batch_harvests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_harvests (batch_id, harvest_id, allocated_quantity_kg) FROM stdin;
ab0e106c-0e30-42d0-b19f-9d295ead51fd	b6561934-0ffe-46c8-92b7-37bc1efc715e	350
86f6ca03-22aa-4e62-b5da-89e42b547496	a38b5896-55d4-4d44-b1f4-45e7d211f05f	120
\.


--
-- Data for Name: blockchain_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blockchain_transactions (id, batch_id, event_id, transaction_hash, block_number, contract_address, data_hash, status, submitted_at, confirmed_at, error_message, created_at, updated_at) FROM stdin;
cfe5bddf-6116-4d66-937a-c1e8b089e257	ab0e106c-0e30-42d0-b19f-9d295ead51fd	7780328c-2704-4430-a189-1622240ef283	0x9d83393f4c5ba2324f068d2bbfdec702e481c7d090969f770395498716c1979f	18492041	0x0000000000000000000000000000000000000000	0baa9de410a2f05975889d7ad599f8e6f4eb20047b931c5b3a10c7103ff8dc37	confirmed	2026-11-11 13:59:36.825156+00	2026-11-11 13:59:36.825163+00	\N	2026-11-13 13:59:36.826441+00	\N
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, booking_code, accommodation_id, guest_name, guest_whatsapp, guest_email, check_in, check_out, total_nights, rooms_count, total_price_rp, status, notes, wa_link, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coop_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coop_accounts (id, resident_id, coop_balance_rp, plastic_points, clean_water_quota_ltr, total_commodities_kg, total_plastic_recycled_kg, pin_hash, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coop_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coop_transactions (id, account_id, resident_id, transaction_code, transaction_type, item_name, weight_or_volume, unit_price_rp, monetary_value_rp, water_quota_impact_ltr, destination, receipt_hash, station_code, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: farmer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farmer_groups (id, name, leader_name, village, contact_number, created_at, updated_at) FROM stdin;
f0852e33-e6bc-44ed-ad5d-55d266f55680	Kelompok Tani Pala Lonthoir Subur	Daud Walalayo	Lonthoir	081234000001	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
71af9109-0b23-426e-8531-b3ffbe200962	Kelompok Tani Rempah Banda Neira Makmur	Ibrahim Baadilla	Banda Neira	081234000002	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
4d794876-74f7-437e-8450-48b55bd00feb	Kelompok Tani Selamon Bersatu	Hasan Latarissa	Selamon	081234000003	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: farmers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farmers (id, farmer_code, name, phone, status, user_id, resident_id, farmer_group_id, created_at, updated_at) FROM stdin;
94a3059b-242f-445a-8463-d35352728bf6	BN-FRM-001	Usman Alkatiri	081240111222	active	\N	\N	f0852e33-e6bc-44ed-ad5d-55d266f55680	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
25ee7b09-a811-412a-adbf-26e34569bac3	BN-FRM-002	Daud Walalayo	081240111333	active	\N	\N	f0852e33-e6bc-44ed-ad5d-55d266f55680	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
3d2750b2-7c26-402e-978f-11c33fc7e705	BN-FRM-003	Fatimah Patty	081240111444	active	\N	\N	71af9109-0b23-426e-8531-b3ffbe200962	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
0df9fdbf-105a-4b39-9812-4d7c92ddeeab	BN-FRM-004	Ali Renuat	081240111555	active	\N	\N	4d794876-74f7-437e-8450-48b55bd00feb	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: farms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farms (id, farmer_id, farm_code, name, location_description, latitude, longitude, polygon_boundary_geojson, area_sqm, primary_commodity, verification_status, created_at, updated_at) FROM stdin;
e8a82111-f2bd-487d-9e92-915841778093	94a3059b-242f-445a-8463-d35352728bf6	BN-FARM-001	Kebun Pala Lonthoir Barat	Desa Lonthoir, lereng barat Banda Besar	-4.5321	129.8972	{"type": "Polygon", "coordinates": [[[129.8964, -4.5329], [129.898, -4.5329], [129.898, -4.5313], [129.8964, -4.5313], [129.8964, -4.5329]]]}	8500	Pala	verified	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
3aaae1fc-8544-49d1-8954-d24dbe7f8d3f	25ee7b09-a811-412a-adbf-26e34569bac3	BN-FARM-002	Kebun Pala Lereng Gunung Api	Kaki Gunung Api Banda, tanah vulkanis subur	-4.5245	129.889	{"type": "Polygon", "coordinates": [[[129.8882, -4.5253], [129.8898, -4.5253], [129.8898, -4.5237], [129.8882, -4.5237], [129.8882, -4.5253]]]}	12000	Pala & Fuli	verified	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
9289f15f-2e5e-448f-99d2-f7c9f78fcf2a	3d2750b2-7c26-402e-978f-11c33fc7e705	BN-FARM-003	Kebun Rempah Warisan Belgica	Sekitar Benteng Belgica, Nusantara	-4.5268	129.9045	{"type": "Polygon", "coordinates": [[[129.90370000000001, -4.5276], [129.9053, -4.5276], [129.9053, -4.526], [129.90370000000001, -4.526], [129.90370000000001, -4.5276]]]}	6200	Fuli	verified	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
e5173b7b-3888-42ce-8455-5d285c8a6314	0df9fdbf-105a-4b39-9812-4d7c92ddeeab	BN-FARM-004	Kebun Pala Selamon Pesisir	Pesisir timur Banda Besar, Desa Selamon	-4.538	129.912	{"type": "Polygon", "coordinates": [[[129.9112, -4.5388], [129.9128, -4.5388], [129.9128, -4.5372], [129.9112, -4.5372], [129.9112, -4.5388]]]}	9400	Pala	verified	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: harvests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.harvests (id, farm_id, farmer_id, harvest_code, commodity, harvest_date, quantity_kg, quality_grade, notes, created_at, updated_at) FROM stdin;
b6561934-0ffe-46c8-92b7-37bc1efc715e	e8a82111-f2bd-487d-9e92-915841778093	94a3059b-242f-445a-8463-d35352728bf6	BN-HRV-2026-001	Pala	2026-10-24	350	Grade A Super	Panen petik ranum musim raya Lonthoir	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
a38b5896-55d4-4d44-b1f4-45e7d211f05f	9289f15f-2e5e-448f-99d2-f7c9f78fcf2a	3d2750b2-7c26-402e-978f-11c33fc7e705	BN-HRV-2026-002	Fuli Merah	2026-10-26	120	Grade 1 Export	Bunga pala merah cerah utuh	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
36a8b131-face-4dcc-9236-fdc9720ff7ee	3aaae1fc-8544-49d1-8954-d24dbe7f8d3f	25ee7b09-a811-412a-adbf-26e34569bac3	BN-HRV-2026-003	Pala	2026-10-29	280	Grade A	Hasil kebun lereng vulkanik Banda	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: iot_telemetry_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iot_telemetry_logs (id, station_code, station_name, island_name, raw_water_tds_ppm, filtered_water_tds_ppm, clean_tank_level_pct, daily_dispensed_liters, valve_status, active_power_source, solar_panel_voltage_v, solar_current_a, power_watt, battery_soc_pct, alert_level, alert_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_batches (id, batch_code, commodity, total_quantity_kg, production_date, public_verification_token, status, blockchain_status, created_at, updated_at) FROM stdin;
ab0e106c-0e30-42d0-b19f-9d295ead51fd	BN-BTC-2026-001	Pala Banda Grade A Super	350	2026-10-25	BN_VERIFY_PALA_SUPER_2026_LONTHOIR	packaged	confirmed	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
86f6ca03-22aa-4e62-b5da-89e42b547496	BN-BTC-2026-002	Fuli Banda Super Merah	120	2026-10-27	BN_VERIFY_FULI_MERAH_2026_BELGICA	packaged	confirmed	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: raw_surveys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raw_surveys (id, survey_code, collector_name, problem_domain, island_name, village_name, rt_rw, latitude, longitude, title, urgency_level, flexible_attributes, photo_evidence_url, notes, etl_status, migrated_feature_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: residents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.residents (id, nik, full_name, gender, birth_place, birth_date, address, rt, rw, village, religion, marital_status, occupation, phone_number, verification_status, verified_by, verified_at, created_at, updated_at, nik_encrypted, nik_blind_index) FROM stdin;
08bc1b4c-2ed0-49f5-b565-386bc7f06369	8171010101850001	Ahmad Baadilla, S.STP	L	Banda Neira	1985-01-01	Jl. Nusantara No. 1	001	001	Lonthoir	\N	\N	Aparatur Desa	081201850001	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.747708+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
b34e7ecd-1f10-45df-9536-a72aa770de8c	8171010202880002	Siti Rahma Marasabessy	P	Banda Neira	1988-02-02	Jl. Pelabuhan No. 15	001	002	Banda Neira	\N	\N	Pegawai Negeri Sipil	081202880002	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.753086+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
fb2d3314-da9b-4f2a-9b79-2ef47a68319e	8171010303790003	Daud Walalayo	L	Lonthoir	1979-03-03	Desa Lonthoir Atas	002	001	Lonthoir	\N	\N	Petani Rempah Pala	081203790003	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.755766+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
ddc28b50-a0e1-4c09-9992-54fb85d64149	8171010404910004	Usman Alkatiri	L	Lonthoir	1991-04-04	Desa Lonthoir Bawah	002	002	Lonthoir	\N	\N	Petani Rempah Pala	081204910004	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.758411+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
950669ed-7328-457a-b5f8-e8ce7ce7cc55	8171010505940005	Nurul Hidayah Baadilla	P	Banda Neira	1994-05-05	Jl. Benteng Belgica No. 8	003	001	Banda Neira	\N	\N	Pedagang Olahan Rempah	081205940005	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.761395+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
ed9794e4-f894-4011-8c1a-1d0fe317dfdf	8171010606900006	Ali Renuat	L	Selamon	1990-06-06	Desa Selamon RT 01	001	001	Selamon	\N	\N	Petani Pala & Nelayan	081206900006	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.763725+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
bccfa907-0e00-4082-b5c9-6c982727ae58	8171010707820007	Fatimah Patty	P	Banda Neira	1982-07-07	Jl. Cengkeh No. 20	002	002	Banda Neira	\N	\N	Petani & Pengrajin Selai Pala	081207820007	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.766288+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
e1df7686-d771-48ba-9808-bd34a580a97e	8171010808980008	Muhammad Ridwan	L	Diera	1998-08-08	Dusun Diera No. 5	001	001	Diera	\N	\N	Penyuluh Pertanian Lapangan	081208980008	pending	\N	\N	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
6194c177-5938-4c82-963d-9740e021cefd	8171010909950009	Zainab Latarissa	P	Selamon	1995-09-09	Desa Selamon RT 02	002	001	Selamon	\N	\N	Pendidik / Guru Sekolah	081209950009	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.77266+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
bceb7057-e040-4920-862d-1a226e177bca	8171011010870010	Hasan Basri Baadilla	L	Banda Neira	1987-10-10	Jl. Syahrir No. 4	001	003	Banda Neira	\N	\N	Pemandu Wisata Sejarah	081210870010	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.775307+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
cd479262-b9bb-477a-82b1-835db1ca60ab	8171011111880011	La Ode Karim	L	Banda Neira	1988-11-11	Kampung Nelayan Nusantara	003	002	Banda Neira	\N	\N	Nelayan Tangkap Tradisional	081211880011	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.777512+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
77dc9959-6d4b-4a58-bd00-9783d57ab3d7	8171011212850012	Jafar Rumra	L	Selamon	1985-12-12	Pesisir Selamon RT 03	003	001	Selamon	\N	\N	Nelayan Pesisir & Pengering Ikan	081212850012	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.779595+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
d52cce62-0e44-4e39-8b00-27b850f61955	8171011301930013	Marni Kelirey	P	Lonthoir	1993-01-13	Desa Lonthoir Tengah	001	002	Lonthoir	\N	\N	Pengolah & Pengering Fuli Merah	081201930013	verified	c91ca400-fd2f-45aa-b179-d20559db60a6	2026-11-13 13:59:36.781721+00	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00	\N	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description) FROM stdin;
0980581d-443b-433b-8f51-13f98f64af79	admin	Administrator Sistem Desa
dea7317d-d6d3-4925-bde4-d60a9d5242bc	village_officer	Petugas Kantor Desa
b5458387-e634-4084-ac50-f4772ebe018e	farmer_group_admin	Ketua Kelompok Tani
300e8067-31cb-47ff-8d39-5a1fd6a66960	farmer	Petani Rempah Terdaftar
997cdc07-3140-4e1f-be52-e983c7c3c856	resident	Warga Masyarakat Desa
\.


--
-- Data for Name: spatial_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_features (id, name, layer_type, category, island_name, latitude, longitude, geometry_geojson, properties_meta, description, is_active, created_at, updated_at) FROM stdin;
30a2f1b4-a7c0-479d-98fe-aec27863b108	Batas Wilayah Rajawali	LAYER_DESA_ADMIN	zona_wilayah	Pulau Neira	-4.5132143125	129.90189875	{"type": "MultiPolygon", "coordinates": [[[[129.896775, -4.507131], [129.902902, -4.504168], [129.904693, -4.505174], [129.905434, -4.50542], [129.905841, -4.506201], [129.906399, -4.506211], [129.906861, -4.506939], [129.907011, -4.507624], [129.907086, -4.508084], [129.907172, -4.508383], [129.896239, -4.512372], [129.896132, -4.511281], [129.895939, -4.511142], [129.896121, -4.510575], [129.89611, -4.510051], [129.895971, -4.509709], [129.895917, -4.509249], [129.895917, -4.5088], [129.896389, -4.508201], [129.896657, -4.507698], [129.896775, -4.507131]]], [[[129.906002, -4.519324], [129.906249, -4.523634], [129.905562, -4.523698], [129.905659, -4.524265], [129.904618, -4.524362], [129.904618, -4.524918], [129.904103, -4.524918], [129.904082, -4.52387], [129.902837, -4.52388], [129.902687, -4.519121], [129.906002, -4.519324]]]]}	{"village_name": "Rajawali", "color": "#d946ef", "population": "891 Jiwa", "main_commodity": "Pala & Cengkeh Rakyat", "area_ha": "294 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "MultiPolygon", "vertex_count": 32, "area_km2": 2.94, "density": 303}	Batas wilayah administratif resmi Rajawali, Pulau Neira.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
41aca56b-5f06-4100-91b9-2dcb954a2253	Batas Wilayah Dwiwarna	LAYER_DESA_ADMIN	zona_wilayah	Pulau Neira	-4.528093772727273	129.90208713636363	{"type": "Polygon", "coordinates": [[[129.904039, -4.524939], [129.904608, -4.524971], [129.90449, -4.530971], [129.904243, -4.53111], [129.903374, -4.531196], [129.90244, -4.530843], [129.90155, -4.530201], [129.90111, -4.53003], [129.900692, -4.530009], [129.900568, -4.530084], [129.900627, -4.530239], [129.900627, -4.530388], [129.900498, -4.530378], [129.900472, -4.530228], [129.900531, -4.529715], [129.900418, -4.529458], [129.900477, -4.524276], [129.9014, -4.523078], [129.902794, -4.523217], [129.902827, -4.523891], [129.904093, -4.523902], [129.904039, -4.524939]]]}	{"village_name": "Dwiwarna", "color": "#a3e635", "population": "880 Jiwa", "main_commodity": "Pendidikan & Perdagangan Rempah", "area_ha": "410 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 22, "area_km2": 4.1, "density": 215}	Batas wilayah administratif resmi Dwiwarna, Pulau Neira.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
2e5d3326-7770-4666-a7c6-ba7f4c3045b3	Embung Pulau Ay	LAYER_WATER_INFRA	resiliensi	Pulau Ay	-4.521746	129.774837	null	{"image_url": "/images/landmarks/sumur-lonthoir.jpg"}		t	2026-11-14 05:41:19.35972+00	2026-11-16 08:15:11.818298+00
643e7872-db9e-4959-beba-6303dc79b0f0	Batas Wilayah Desa Pulau Rhun	LAYER_DESA_ADMIN	zona_wilayah	Pulau Rhun	-4.548122066666666	129.68637621333332	{"type": "MultiPolygon", "coordinates": [[[[129.666781, -4.56111], [129.669571, -4.563577], [129.671416, -4.565516], [129.677167, -4.564518], [129.682403, -4.564518], [129.684248, -4.563534], [129.686437, -4.562507], [129.687037, -4.561095], [129.688711, -4.558486], [129.691458, -4.556775], [129.69223, -4.555534], [129.693217, -4.554379], [129.694633, -4.552026], [129.694548, -4.549887], [129.693646, -4.548903], [129.693561, -4.547449], [129.693475, -4.545224], [129.694118, -4.544069], [129.694118, -4.541545], [129.693217, -4.541117], [129.692316, -4.541417], [129.690642, -4.542144], [129.689784, -4.543299], [129.689054, -4.544368], [129.688239, -4.545481], [129.68708, -4.545609], [129.686136, -4.545951], [129.685664, -4.546379], [129.685149, -4.546764], [129.684119, -4.54732], [129.683561, -4.548219], [129.682403, -4.549031], [129.681416, -4.549288], [129.680986, -4.550486], [129.680343, -4.551384], [129.680171, -4.55224], [129.679484, -4.552753], [129.679313, -4.553181], [129.678884, -4.553694], [129.678712, -4.554379], [129.677896, -4.554636], [129.676652, -4.555192], [129.675922, -4.554978], [129.675322, -4.555962], [129.674978, -4.556432], [129.67412, -4.556989], [129.67339, -4.557416], [129.673262, -4.558657], [129.672446, -4.5587], [129.671202, -4.558828], [129.669871, -4.557759], [129.669485, -4.55947], [129.66867, -4.560069], [129.666781, -4.56111]]], [[[129.695599, -4.535991], [129.69547, -4.536501], [129.696608, -4.536354], [129.69723, -4.536076], [129.697659, -4.535378], [129.697863, -4.534797], [129.697841, -4.534422], [129.697788, -4.534144], [129.697884, -4.533952], [129.697584, -4.533952], [129.697262, -4.533952], [129.696865, -4.534123], [129.696769, -4.534465], [129.696747, -4.534636], [129.696543, -4.534871], [129.696543, -4.535192], [129.696414, -4.535481], [129.696286, -4.535684], [129.696178, -4.535877], [129.696039, -4.535962], [129.695599, -4.535991]]]]}	{"village_name": "Desa Pulau Rhun", "color": "#db2424", "population": "1.606 Jiwa", "main_commodity": "", "area_ha": "1316 Hektar", "area_km2": 13.16, "density": 122, "highlights": "", "demographics": {"total_population": 1606}, "is_zone": true, "polygon_type": "MultiPolygon", "vertex_count": 75}	Batas wilayah administratif resmi Desa Pulau Rhun, Pulau Rhun.	t	2026-11-15 00:25:21.655693+00	2026-11-16 02:30:35.394004+00
073b4bb6-08ac-4a64-aeb9-873fc5c40523	Dermaga Pulau Lonthoir	LAYER_PUBLIC_SAFETY	publik	Banda Besar	-4.542773	129.876707	null	{}	\N	t	2026-11-14 16:13:50.41282+00	2026-11-14 16:13:50.41282+00
84414869-dda0-44ac-ae5f-f570e5a33725	Historic Dutch Grave	LAYER_HERITAGE	publik	Banda Besar	-4.550073	129.879105	null	{}	\N	t	2026-11-14 16:29:59.585918+00	2026-11-14 16:30:54.094251+00
ed957108-f2e8-4fcc-ba5b-bd02b03becdb	Batas Wilayah Walling Spanciby	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.5463233333333335	129.90961147916667	{"type": "Polygon", "coordinates": [[[129.892119, -4.545517], [129.892302, -4.547217], [129.893954, -4.547175], [129.895306, -4.546618], [129.896861, -4.546725], [129.897473, -4.54694], [129.897827, -4.54694], [129.898009, -4.546854], [129.898428, -4.54695], [129.898213, -4.547763], [129.898975, -4.54787], [129.899222, -4.547934], [129.899222, -4.54817], [129.900445, -4.548394], [129.903696, -4.548929], [129.905627, -4.549902], [129.908534, -4.55033], [129.911742, -4.550009], [129.915208, -4.549303], [129.919188, -4.548363], [129.923952, -4.546972], [129.926376, -4.545432], [129.926763, -4.544491], [129.928093, -4.542395], [129.928672, -4.541539], [129.925625, -4.540277], [129.925003, -4.541602], [129.923823, -4.542907], [129.922879, -4.543207], [129.922214, -4.543784], [129.922342, -4.544597], [129.921677, -4.544725], [129.921377, -4.545431], [129.920797, -4.545538], [129.91833, -4.546201], [129.917622, -4.546201], [129.917107, -4.546757], [129.914939, -4.546608], [129.914167, -4.547335], [129.912858, -4.547549], [129.909275, -4.548789], [129.906399, -4.548768], [129.903975, -4.547527], [129.901206, -4.545816], [129.899447, -4.545346], [129.897151, -4.544918], [129.894812, -4.545388], [129.892119, -4.545517]]]}	{"village_name": "Walling Spanciby", "color": "#14b8a6", "population": "1.202 Jiwa", "main_commodity": "Kopra, Pala, & Garam Tradisional", "area_ha": "840 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 48, "area_km2": 8.4, "density": 143}	Batas wilayah administratif resmi Walling Spanciby, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
00cbee65-6b0f-416d-b686-e303ead779a4	Blood Stone	LAYER_HERITAGE	publik	Banda Besar	-4.549417	129.877222	null	{"image_url": "/images/landmarks/concordia.jpg"}		t	2026-11-14 10:01:20.346982+00	2026-11-16 08:15:11.818298+00
40e6c297-edef-4f91-9939-53b85f0efc85	Terminal Dermaga Pulau Ay	LAYER_PUBLIC_SAFETY	publik	Pulau Ay	-4.517628	129.775153	null	{"image_url": "/images/landmarks/dermaga-ay.jpg"}	Dermaga utama tambatan perahu dan speedboat penyeberangan warga serta wisatawan di pesisir Pulau Ay.	t	2026-11-14 05:12:02.872134+00	2026-11-16 08:15:11.818298+00
73b8e90c-890f-423a-8b99-ba0d1a9a49f9	Lava Flow Snorkeling & Coral Reef	LAYER_TOURISM_4A	publik	Gunung Api	-4.505933	129.880038	\N	{"sub_type": "bahari", "highlights": "Karang meja raksasa, ikan kepe-kepe, jarak pandang 25 meter", "boat_access": "5 menit dari pelabuhan Neira", "entry_fee_rp": 25000, "best_time": "08:00 - 15:00 WIT", "guide_available": false, "image_url": "/images/landmarks/lava-flow.jpg"}	Terumbu karang alami yang tumbuh subur di atas batuan lava erupsi Gunung Api 1988. Salah satu spot snorkeling terkaya di dunia.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
dd122ecc-8ec5-45d8-b02d-0b013523ff1f	Pantai Tampa Nama	LAYER_TOURISM_4A	publik	Pulau Ay	-4.536875	129.771709	null	{"sub_type": "Pantai", "guide_available": true, "image_url": "/images/landmarks/pulau-ay.jpg"}		t	2026-11-14 05:48:26.293043+00	2026-11-16 08:15:11.818298+00
a77323b2-93b7-407d-b1ed-f32f26e2c847	Pusar Nagri	LAYER_HERITAGE	publik	Pulau Ay	-4.527741	129.774113	null	{}	\N	t	2026-11-15 00:52:28.023887+00	2026-11-15 00:52:28.023887+00
8ab22ca4-7b61-4c92-972a-bf60e37f8b82	Pohon Sejuta Umat	LAYER_TOURISM_4A	publik	Banda Besar	-4.547597	129.88131	null	{"sub_type": "Wisata Bahari", "guide_available": true}	\N	t	2026-11-14 16:16:00.575271+00	2026-11-14 16:16:00.575271+00
6ca36642-cf66-45f4-b43a-d98f701d8953	Batas Wilayah Lautang	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.565331166666667	129.93588183333333	{"type": "Polygon", "coordinates": [[[129.932899, -4.564554], [129.936032, -4.56372], [129.940195, -4.565816], [129.937942, -4.565816], [129.935324, -4.567527], [129.932899, -4.564554]]]}	{"village_name": "Lautang", "color": "#22c55e", "population": "546 Jiwa", "main_commodity": "Tuna Sirip Kuning & Ikan Cakalang", "area_ha": "470 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 6, "area_km2": 4.7, "density": 116}	Batas wilayah administratif resmi Lautang, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
caccb1bc-ac34-4fc1-906e-d3c16b8f1454	Jalur Penyeberangan Speedboat Neira - Pulau Hatta	LAYER_PUBLIC_SAFETY	publik	Pulau Ay	-4.501645	129.891797	{"type": "LineString", "coordinates": [[129.894737, -4.526902], [129.893804, -4.526298], [129.893879, -4.525191], [129.894319, -4.524373], [129.894935, -4.5241], [129.896336, -4.521924], [129.895338, -4.512843], [129.895209, -4.51202], [129.891272, -4.503527], [129.891797, -4.501645], [129.893374, -4.500458], [129.90081, -4.499709], [129.957747, -4.506182], [130.041347, -4.57416], [130.041915, -4.575335], [130.042291, -4.577281], [130.042022, -4.578458], [130.041733, -4.579121]]}	{"is_route": true, "route_type": "maritime", "transport_mode": "Speedboat", "travel_time": "120 Menit", "total_distance_km": 23.02, "total_distance_nm": 12.43, "waypoints_count": 18, "start_point": "Pelabuhan Laut Utama Banda Neira", "end_point": "Terminal Dermaga Pulau Hatta"}	Jalur penyeberangan speedboat antar-pulau melintasi perairan Selat Ay.	t	2026-11-16 03:26:25.947325+00	2026-11-16 03:26:25.947325+00
e8d27889-7928-4c38-bea0-71cccc2d3fa8	Jalur Penyeberangan Speedboat Neira - Pulau Rhun	LAYER_PUBLIC_SAFETY	publik	Banda Neira	-4.507622	129.726477	{"type": "LineString", "coordinates": [[129.894689, -4.526928], [129.894233, -4.526848], [129.893911, -4.527104], [129.893755, -4.527511], [129.894694, -4.530446], [129.894404, -4.533586], [129.893444, -4.535441], [129.890837, -4.537516], [129.887704, -4.538158], [129.878499, -4.537992], [129.767075, -4.505654], [129.726477, -4.507622], [129.702187, -4.51498], [129.682531, -4.529612], [129.677253, -4.537661], [129.67618, -4.542923], [129.676824, -4.546498], [129.677382, -4.549471], [129.6781, -4.550687], [129.67846, -4.551564], [129.678889, -4.552286], [129.679007, -4.552618]]}	{"is_route": true, "route_type": "maritime", "transport_mode": "Speedboat", "travel_time": "120 Menit - 240 Menit", "total_distance_km": 28.52, "total_distance_nm": 15.4, "waypoints_count": 22, "start_point": "Pelabuhan Laut Utama Banda Neira", "end_point": "Terminal Dermaga Pulau Rhun"}	Jalur penyeberangan speedboat antar-pulau melintasi perairan Selat Ay.	t	2026-11-16 04:27:15.106604+00	2026-11-16 04:27:15.106604+00
bb5f574a-3e3a-403b-8776-1ce5435cead6	Jalur Trekking Gunung Lewerrani	LAYER_PUBLIC_SAFETY	publik	Banda Api	-4.526164	129.887345	{"type": "LineString", "coordinates": [[129.891255, -4.527292], [129.890596, -4.527415], [129.890327, -4.527565], [129.89, -4.527581], [129.889662, -4.527084], [129.889485, -4.527051], [129.889324, -4.526763], [129.889056, -4.52672], [129.888611, -4.526848], [129.888257, -4.52664], [129.887887, -4.526704], [129.887345, -4.526164], [129.887313, -4.525977], [129.886669, -4.525699], [129.886363, -4.525682], [129.884067, -4.524608], [129.88382, -4.524672], [129.882839, -4.524116], [129.88256, -4.523891], [129.881884, -4.523795], [129.881401, -4.523281], [129.880704, -4.522854]]}	{"is_route": true, "route_type": "trekking", "transport_mode": "Jalan Kaki", "travel_time": "240 Menit", "total_distance_km": 1.37, "total_distance_nm": 0.74, "waypoints_count": 22, "start_point": "Pos 1 Gunung Api", "end_point": "Puncak Gunung Lewerrani"}	Jalur pendakian Gunung	t	2026-11-16 04:32:48.594726+00	2026-11-16 04:32:48.594726+00
b5340053-1ac0-474f-ae67-d87b1dd8c90d	Jalur Penyebrangan Neira -> Pulau Ay	LAYER_PUBLIC_SAFETY	publik	Pulau Neira	-4.533673	129.89448	{"type": "LineString", "coordinates": [[129.894726, -4.527005], [129.894308, -4.52693], [129.893986, -4.527133], [129.893868, -4.527524], [129.893889, -4.527796], [129.894013, -4.528128], [129.894372, -4.529139], [129.894753, -4.530438], [129.89448, -4.533673], [129.89361, -4.535502], [129.890842, -4.537663], [129.887667, -4.538336], [129.878483, -4.538207], [129.778619, -4.516673], [129.777305, -4.516593], [129.776076, -4.516887], [129.77525, -4.517539]]}	{"is_route": true, "route_type": "maritime", "transport_mode": "Kapal Penyebrangan", "travel_time": "45 Menit", "total_distance_km": 14.56, "total_distance_nm": 7.86, "waypoints_count": 17, "start_point": "Dermaga Penyebrangan Neira", "end_point": "Dermaga Pulau Ay"}	\N	t	2026-11-15 00:12:03.561621+00	2026-11-15 00:38:52.760008+00
2dff0ea6-992c-49fc-9e12-e711c7c845ad	Pusat Pembangkit Listrik Tenaga Diesel (PLTD Neira PLN)	LAYER_ENERGY_WASTE	resiliensi	Pulau Neira	-4.528092	129.906077	\N	{"image_url": "/images/landmarks/pltd-neira.jpg"}	Pembangkit diesel PLN penyedia daya listrik jaringan utama kota Neira dengan konsumsi solar ~1200 liter per hari.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
50188064-9fcb-4c2a-9d17-0f84627d482b	Batas Wilayah Kampung Baru	LAYER_DESA_ADMIN	zona_wilayah	Pulau Neira	-4.523110368421053	129.90573310526315	{"type": "Polygon", "coordinates": [[[129.899812, -4.515987], [129.907933, -4.512532], [129.908867, -4.517324], [129.908556, -4.518115], [129.908502, -4.519271], [129.907944, -4.519785], [129.907612, -4.520565], [129.907687, -4.52142], [129.908094, -4.521634], [129.908631, -4.52172], [129.910015, -4.522255], [129.909629, -4.523452], [129.908127, -4.52295], [129.907837, -4.523891], [129.907987, -4.526191], [129.907815, -4.527356], [129.907236, -4.528223], [129.906904, -4.529281], [129.90649, -4.529666], [129.905643, -4.530276], [129.905262, -4.53056], [129.904945, -4.530688], [129.904929, -4.53087], [129.904768, -4.530918], [129.90465, -4.530784], [129.904522, -4.530806], [129.904608, -4.524372], [129.90567, -4.524297], [129.905573, -4.523656], [129.906249, -4.523581], [129.906013, -4.519292], [129.903932, -4.519185], [129.902258, -4.519035], [129.901121, -4.518907], [129.900863, -4.518821], [129.901078, -4.517773], [129.900284, -4.516768], [129.899812, -4.515987]]]}	{"village_name": "Kampung Baru", "color": "#ea580c", "population": "3.057 Jiwa", "main_commodity": "Transportasi Udara & Logistik", "area_ha": "570 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 38, "area_km2": 5.7, "density": 537}	Batas wilayah administratif resmi Kampung Baru, Pulau Neira.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
07519f25-3f91-4352-afd3-f6163035304d	Cilu Bintang Estate	LAYER_ACCOMMODATION	publik	Banda Neira	-4.528144	129.898446	null	{}	\N	t	2026-11-16 00:10:58.564001+00	2026-11-16 00:10:58.564001+00
9097f4ee-affd-4de7-8086-dc380dbd2c06	Banyan Resort	LAYER_ACCOMMODATION	publik	Banda Api	-4.530191	129.893702	null	{"price_per_night_rp": 350000}	\N	t	2026-11-16 04:35:10.863595+00	2026-11-16 04:35:10.863595+00
06de42c1-c76a-477d-bd24-67bb5a06de2e	Pantai Nama	LAYER_TOURISM_4A	publik	Pulau Ay	-4.519836	129.780212	null	{"sub_type": "Wisata Alam", "guide_available": true, "image_url": "/images/landmarks/pulau-ay.jpg"}		t	2026-11-14 05:32:06.020685+00	2026-11-16 08:15:11.818298+00
1485298d-6bcc-41a5-8a97-9baef7b0ab1e	Rumah Ex Deputi	LAYER_HERITAGE	publik	Banda Neira	-4.528733	129.90087	null	{"image_url": "/images/landmarks/ex-deputi.jpg"}		t	2026-11-13 23:39:29.034635+00	2026-11-16 08:15:11.818298+00
2af90d2b-cf4d-469a-a56a-50c423a1c52c	Benteng Nassau (Fort Nassau)	LAYER_HERITAGE	publik	Pulau Neira	-4.528057	129.897618	\N	{"era": "VOC Awal Abad 17", "image_url": "/images/landmarks/nassau.jpg"}	Benteng pertama Belanda yang dibangun di atas reruntuhan loji Portugis pada tahun 1609 oleh Laksamana Verhoeff.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
428b309a-5f28-4549-ac87-81dfcf1c79f6	Benteng Concordia (Waer)	LAYER_HERITAGE	publik	Banda Besar	-4.5583	129.9481	null	{"era": "Benteng Peninggalan Masa Kolonialisme", "image_url": "/images/landmarks/concordia.jpg"}		t	2026-11-13 23:59:40.440958+00	2026-11-16 08:15:11.818298+00
5758e179-05f5-4f8c-8758-97cd0f57f3d8	Rumah Budaya Banda Neira	LAYER_HERITAGE	publik	Banda Neira	-4.52564	129.897424	null	{"era": "Rumah Budaya ", "entry_fee_rp": 20000, "image_url": "/images/landmarks/rumah-budaya.jpg"}		t	2026-11-14 00:28:34.602852+00	2026-11-16 08:15:11.818298+00
6585fdc7-0c0b-4884-9c3a-d72e02a97a73	Gereja Tua Banda	LAYER_HERITAGE	publik	Pulau Neira	-4.526933	129.896776	null	{"image_url": "/images/landmarks/gereja-tua.jpg"}		t	2026-11-14 00:30:29.843404+00	2026-11-16 08:15:11.818298+00
8c026a00-f9af-491f-b44b-85d603b3392e	Gereja Betlehem	LAYER_HERITAGE	publik	Pulau Ay	-4.520132	129.773592	null	{"image_url": "/images/landmarks/gereja-betlehem.jpg"}		t	2026-11-14 01:19:21.022044+00	2026-11-16 08:15:11.818298+00
8cb93ee9-6d04-4d62-95b4-1dc8a2c87e53	Rumah Pengasingan dr. Tjipto Mangunkusumo	LAYER_HERITAGE	publik	Banda Neira	-4.528596	129.902875	null	{"era": "Rumah Pengasingan Tokoh Sejarah", "image_url": "/images/landmarks/cipto-mangunkusumo.jpg"}		t	2026-11-14 00:26:59.698582+00	2026-11-16 08:15:11.818298+00
8d653937-33fc-4840-bad2-9a86b6df82a0	Dermaga Penyeberangan Speedboat Neira - Lonthoir	LAYER_PUBLIC_SAFETY	publik	Pulau Neira	-4.527039	129.894823	\N	{"image_url": "/images/landmarks/dermaga-lonthoir.jpg"}	Hub mobilitas warga dan wisatawan menyeberangi selat Neira menuju pulau Banda Besar menggunakan perahu ketinting dan speedboat.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
8ef176f9-03aa-4919-ab6c-6c32da8a6aa2	Benteng Hollandia Lonthoir	LAYER_HERITAGE	publik	Banda Besar	-4.547798	129.881315	null	{"era": "Benteng Lonthoir", "entry_fee_rp": 10000, "image_url": "/images/landmarks/hollandia.jpg"}		t	2026-11-13 23:51:33.627997+00	2026-11-16 08:15:11.818298+00
cd6d2ec5-3676-4c05-bd41-ef72ca97a209	Batas Wilayah Pulau Ay	LAYER_DESA_ADMIN	zona_wilayah	Pulau Ay	-4.52404459375	129.77404759375	{"type": "Polygon", "coordinates": [[[129.763598, -4.518357], [129.763126, -4.521174], [129.764328, -4.523192], [129.766645, -4.526743], [129.768276, -4.52978], [129.769864, -4.533588], [129.772396, -4.537395], [129.774756, -4.53808], [129.776902, -4.536368], [129.779048, -4.534743], [129.780893, -4.533074], [129.782052, -4.530978], [129.783125, -4.529267], [129.78334, -4.527384], [129.784327, -4.524732], [129.784627, -4.523577], [129.78364, -4.522978], [129.782653, -4.521951], [129.781923, -4.520753], [129.780893, -4.519983], [129.779327, -4.519392], [129.776795, -4.518771], [129.775422, -4.518301], [129.774649, -4.517937], [129.77201, -4.518194], [129.770465, -4.517851], [129.768212, -4.518236], [129.766688, -4.517809], [129.765487, -4.517531], [129.765744, -4.516404], [129.764714, -4.516547], [129.763598, -4.518357]]]}	{"village_name": "Pulau Ay", "color": "#ff6600", "population": "1.512 Jiwa", "main_commodity": "", "area_ha": "1319 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 32, "area_km2": 13.19, "density": 115}	Batas wilayah administratif resmi Pulau Ay, Pulau Ay.	t	2026-11-15 00:25:21.655693+00	2026-11-15 15:24:05.079765+00
d2b5861b-1e70-4805-8554-868486ef24f6	Batas Wilayah Merdeka	LAYER_DESA_ADMIN	zona_wilayah	Pulau Neira	-4.506254785714286	129.89702414285713	{"type": "MultiPolygon", "coordinates": [[[[129.892967, -4.50235], [129.893594, -4.5025], [129.894125, -4.502243], [129.894683, -4.502339], [129.894834, -4.50235], [129.894994, -4.502457], [129.895209, -4.502623], [129.895386, -4.503008], [129.895418, -4.503201], [129.895467, -4.503457], [129.895595, -4.5035], [129.895826, -4.503586], [129.896116, -4.503618], [129.896287, -4.503655], [129.896432, -4.503655], [129.89655, -4.503655], [129.896663, -4.503693], [129.896792, -4.503826], [129.896834, -4.503971], [129.896899, -4.50404], [129.896958, -4.504153], [129.897054, -4.504238], [129.89728, -4.504292], [129.897537, -4.504292], [129.897768, -4.504286], [129.897929, -4.504227], [129.898181, -4.504099], [129.89846, -4.503971], [129.898664, -4.503901], [129.898959, -4.503816], [129.899061, -4.503746], [129.899372, -4.503612], [129.899624, -4.503372], [129.89978, -4.503217], [129.899967, -4.503008], [129.900101, -4.502944], [129.900268, -4.502928], [129.901206, -4.503313], [129.901872, -4.503634], [129.902966, -4.504104], [129.896936, -4.507013], [129.89648, -4.505703], [129.8964, -4.505414], [129.896142, -4.505318], [129.895847, -4.504912], [129.895547, -4.504687], [129.895273, -4.50465], [129.895166, -4.504377], [129.89507, -4.504179], [129.894882, -4.504013], [129.894233, -4.504072], [129.893546, -4.504393], [129.893079, -4.504361], [129.892259, -4.504136], [129.892049, -4.503874], [129.892033, -4.503462], [129.892167, -4.503035], [129.892613, -4.502692], [129.892774, -4.502441], [129.892967, -4.50235]]], [[[129.90273, -4.519111], [129.900874, -4.518853], [129.900273, -4.520009], [129.900123, -4.52064], [129.900123, -4.52219], [129.900445, -4.52419], [129.901046, -4.523517], [129.901421, -4.523078], [129.902784, -4.523174], [129.90273, -4.519111]]]]}	{"village_name": "Merdeka", "color": "#38bdf8", "population": "834 Jiwa (234 KK)", "main_commodity": "Perikanan Tangkap, Olahan Pala & Ikan", "area_ha": "295 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "MultiPolygon", "vertex_count": 70, "area_km2": 2.95, "density": 289}	Batas wilayah administratif resmi Merdeka, Pulau Neira.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
42b0c9c7-2b76-4b59-b40a-4e79880e3642	Sumur Air Payau Komunal Warga RT 02 Neira	LAYER_WATER_INFRA	resiliensi	Pulau Neira	-4.527	129.9005	\N	{"live_tds_ppm": 780.0, "station_id": "WS-NEIRA-02", "tank_level_pct": 45.0, "water_quality_status": "PERLU FILTRASI RO (AIR PAYAU)", "water_source": "Sumur Galian Dangkal Warga", "image_url": "/images/landmarks/sumur-lonthoir.jpg"}	Sumur galian komunal warga rentan intrusi air laut saat pasang purnama. Memerlukan pemantauan salinitas dan filtrasi kontinu.	t	2026-11-14 01:34:13.187594+00	2026-11-16 08:15:11.818298+00
1e1a782d-cbf5-4877-9c5e-f7753131955b	Delfika 2 Guesthouse	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.527543	129.895096	null	{}	\N	t	2026-11-16 00:26:30.869549+00	2026-11-16 00:26:30.869549+00
385c70da-6dab-4b4f-a552-26a869af4e4c	Vita Guesthouse	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.526805	129.895467	null	{}	\N	t	2026-11-16 00:27:11.5342+00	2026-11-16 00:27:11.5342+00
9ef3555e-bb91-4b1f-bd0c-67442127a9c3	Green Coconut Guest House	LAYER_ACCOMMODATION	publik	Pulau Ay	-4.519317	129.777669	null	{"image_url": "/images/landmarks/colonial-house.jpg"}		t	2026-11-14 05:40:16.239296+00	2026-11-16 08:15:11.818298+00
1373cc69-5224-415f-8490-59774c53c6c7	Penginapan Nassau	LAYER_ACCOMMODATION	publik	Banda Neira	-4.528717	129.896277	null	{}	\N	t	2026-11-16 00:27:48.636544+00	2026-11-16 00:27:48.636544+00
6095bb99-8b7c-478d-9375-b61b6f1b7bad	Penginapan Likes	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.523434	129.898111	null	{}	\N	t	2026-11-16 00:28:27.395363+00	2026-11-16 00:28:27.395363+00
2b50282b-3837-4e94-ab7d-8201554bf4ab	Kebun Kacong	LAYER_HERITAGE	publik	Banda Besar	-4.547741	129.876831	null	{}	\N	t	2026-11-14 16:24:54.883404+00	2026-11-14 16:24:54.883404+00
98bcb79e-cba1-4784-b6e8-85961318cf1e	Makam Nona Lantsuez	LAYER_HERITAGE	publik	Banda Besar	-4.548276	129.882817	null	{}	\N	t	2026-11-14 16:57:32.073317+00	2026-11-14 16:58:12.450977+00
2db2c248-0209-4027-ae15-1e0dcf539617	Dermaga Boiyauw	LAYER_PUBLIC_SAFETY	publik	Banda Besar	-4.543796	129.890188	null	{}	\N	t	2026-11-15 00:13:27.291991+00	2026-11-15 00:13:27.291991+00
2347646c-5642-4d5d-911a-5eccb2e900de	Dermaga Utama Pulau Hatta	LAYER_PUBLIC_SAFETY	publik	Pulau Hatta	-4.593	130.0385	null	{"facility_type": "Dermaga Penyeberangan", "island": "Pulau Hatta", "image_url": "/images/landmarks/dermaga-hatta.jpg"}	Dermaga utama sandar perahu motor nelayan dan penyeberangan reguler dari Pulau Neira ke Pulau Hatta.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
28221f38-19aa-4b78-9043-539a4fb77008	Baba Lagoon Homestay	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.5245	129.897	null	{"price_range": "Rp 350.000 - Rp 500.000", "waterfront": true, "image_url": "/images/landmarks/baba-lagoon.jpg"}	Homestay tepi dermaga dengan akses langsung melihat kapal tradisional dan terbenamnya matahari di balik Gunung Api.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
cca8be32-bbc8-48c7-ba36-4932669550b5	Puskesmas Perawatan & Pos SAR Banda Neira	LAYER_PUBLIC_SAFETY	publik	Pulau Neira	-4.528897	129.89846	\N	{"image_url": "/images/landmarks/puskesmas-banda.jpg"}	Fasilitas gawat darurat medis pulau 24 jam dengan ruang rawat inap dan ambulans laut penyeberangan darurat ke RSUD Ambon.	t	2026-11-14 01:34:13.187594+00	2026-11-16 08:15:11.818298+00
d8b6ff32-abbb-48be-a962-a436d6e72edf	RSUD Banda	LAYER_DESA_ADMIN	publik	Pulau Neira	-4.515762	129.901764	null	{"image_url": "/images/landmarks/rsud-banda.jpg"}		t	2026-11-14 05:54:48.11321+00	2026-11-16 08:15:11.818298+00
773cc54c-fe8c-4ed6-b00c-df0793d8565e	Batas Wilayah Nusantara	LAYER_DESA_ADMIN	zona_wilayah	Pulau Neira	-4.521585992217899	129.8811323540856	{"type": "MultiPolygon", "coordinates": [[[[129.900155, -4.520725], [129.900101, -4.52234], [129.900402, -4.52418], [129.900423, -4.527142], [129.900434, -4.528693], [129.90038, -4.529602], [129.899833, -4.52941], [129.898975, -4.52942], [129.898471, -4.529624], [129.897569, -4.529827], [129.897076, -4.529945], [129.896969, -4.529827], [129.897167, -4.529271], [129.89677, -4.52895], [129.896185, -4.52887], [129.895536, -4.528618], [129.89507, -4.528506], [129.894946, -4.527896], [129.894683, -4.527522], [129.894721, -4.527201], [129.895155, -4.526763], [129.895354, -4.526522], [129.8961, -4.526009], [129.897183, -4.524442], [129.897253, -4.523934], [129.897972, -4.523089], [129.898224, -4.522891], [129.898272, -4.5228], [129.898417, -4.522955], [129.898894, -4.52242], [129.899544, -4.521634], [129.899704, -4.52119], [129.899978, -4.520923], [129.900155, -4.520463], [129.900155, -4.520725]]], [[[129.892677, -4.532126], [129.892194, -4.534159], [129.8908, -4.535335], [129.889791, -4.535486], [129.88919, -4.535807], [129.888911, -4.535742], [129.888439, -4.535999], [129.887956, -4.535795], [129.887581, -4.535464], [129.886991, -4.535335], [129.88676, -4.53534], [129.886336, -4.535165], [129.886057, -4.535165], [129.885489, -4.535239], [129.885022, -4.534832], [129.884604, -4.534709], [129.884169, -4.533902], [129.883901, -4.533859], [129.883686, -4.534068], [129.883541, -4.534527], [129.882967, -4.534887], [129.882608, -4.535672], [129.882045, -4.535554], [129.881932, -4.535153], [129.881508, -4.53478], [129.881186, -4.534773], [129.88102, -4.534843], [129.880827, -4.534843], [129.880688, -4.534527], [129.88057, -4.534244], [129.880301, -4.534073], [129.87991, -4.534019], [129.879684, -4.534217], [129.879443, -4.534554], [129.879395, -4.534864], [129.879502, -4.535608], [129.879363, -4.535859], [129.878955, -4.535971], [129.87829, -4.535757], [129.87793, -4.535832], [129.877625, -4.535795], [129.877464, -4.535501], [129.877394, -4.535132], [129.877244, -4.534961], [129.876836, -4.534832], [129.876348, -4.534592], [129.876037, -4.534105], [129.87557, -4.533961], [129.87483, -4.533913], [129.874368, -4.533977], [129.874041, -4.533832], [129.874191, -4.533506], [129.874282, -4.532763], [129.874041, -4.532404], [129.873767, -4.531832], [129.872748, -4.531212], [129.871868, -4.530201], [129.871316, -4.529303], [129.870871, -4.529116], [129.870597, -4.529121], [129.870023, -4.529453], [129.869632, -4.530025], [129.869229, -4.530164], [129.8688, -4.530094], [129.868623, -4.529972], [129.868301, -4.529881], [129.868022, -4.529736], [129.867716, -4.529324], [129.867636, -4.528763], [129.867861, -4.528158], [129.868237, -4.527881], [129.868602, -4.527688], [129.868762, -4.527528], [129.868902, -4.527266], [129.868709, -4.526988], [129.868339, -4.526939], [129.868183, -4.526651], [129.867775, -4.526474], [129.867615, -4.526453], [129.867378, -4.526431], [129.867062, -4.526522], [129.866847, -4.526405], [129.866697, -4.526191], [129.866676, -4.52587], [129.866676, -4.525635], [129.866896, -4.525501], [129.867046, -4.525292], [129.867164, -4.524634], [129.867185, -4.524373], [129.866837, -4.52403], [129.866391, -4.523656], [129.866011, -4.523212], [129.865978, -4.5228], [129.866064, -4.522479], [129.866236, -4.522372], [129.866375, -4.521747], [129.866424, -4.521282], [129.866499, -4.521019], [129.866863, -4.520784], [129.866949, -4.520618], [129.867014, -4.520292], [129.866928, -4.520105], [129.866756, -4.519923], [129.866402, -4.519693], [129.866327, -4.519538], [129.866311, -4.519185], [129.866424, -4.518811], [129.86667, -4.518495], [129.866944, -4.518276], [129.867357, -4.518137], [129.867893, -4.518223], [129.868269, -4.517998], [129.868215, -4.517314], [129.868371, -4.516832], [129.868543, -4.516094], [129.86865, -4.515532], [129.869272, -4.514934], [129.869991, -4.514554], [129.870474, -4.514329], [129.870704, -4.514153], [129.870543, -4.513736], [129.87013, -4.513468], [129.870114, -4.513265], [129.870345, -4.51311], [129.870549, -4.512591], [129.870243, -4.512442], [129.87013, -4.512308], [129.870088, -4.512158], [129.870184, -4.511982], [129.870463, -4.511511], [129.870817, -4.511511], [129.871391, -4.511447], [129.871708, -4.511361], [129.872035, -4.511506], [129.872228, -4.511891], [129.872561, -4.512195], [129.873349, -4.511811], [129.873714, -4.511378], [129.874143, -4.510725], [129.874551, -4.50957], [129.874653, -4.509169], [129.874438, -4.508586], [129.874207, -4.507987], [129.874551, -4.50749], [129.874846, -4.507233], [129.875484, -4.507094], [129.876342, -4.506458], [129.876943, -4.505816], [129.876986, -4.505532], [129.877673, -4.505088], [129.878027, -4.504901], [129.878349, -4.50489], [129.878848, -4.505179], [129.879271, -4.505538], [129.879706, -4.506147], [129.880275, -4.506179], [129.8805, -4.505987], [129.881138, -4.505741], [129.881465, -4.505666], [129.882184, -4.505955], [129.882839, -4.506372], [129.88359, -4.506811], [129.883837, -4.507709], [129.884137, -4.508436], [129.883879, -4.509227], [129.884824, -4.509377], [129.885339, -4.509741], [129.886186, -4.510008], [129.887152, -4.510511], [129.887345, -4.512062], [129.888149, -4.512586], [129.88845, -4.512372], [129.889094, -4.512789], [129.889952, -4.512864], [129.890424, -4.513046], [129.891486, -4.511784], [129.892548, -4.511527], [129.893482, -4.512201], [129.893557, -4.513228], [129.892849, -4.514415], [129.892377, -4.514885], [129.89139, -4.514864], [129.890875, -4.514639], [129.890918, -4.515249], [129.891229, -4.515666], [129.89081, -4.51619], [129.891132, -4.516693], [129.890918, -4.518115], [129.890724, -4.520351], [129.892977, -4.521388], [129.893621, -4.522543], [129.893353, -4.523559], [129.892538, -4.524715], [129.89213, -4.525303], [129.892151, -4.526094], [129.891593, -4.526351], [129.891711, -4.526811], [129.891615, -4.527207], [129.892334, -4.527527], [129.893106, -4.52834], [129.893525, -4.528854], [129.893836, -4.530511], [129.893525, -4.531624], [129.892677, -4.532126]]], [[[129.886143, -4.502864], [129.886685, -4.502815], [129.887044, -4.502933], [129.887415, -4.50311], [129.887828, -4.503099], [129.887892, -4.503078], [129.888101, -4.503174], [129.888166, -4.503404], [129.887983, -4.503479], [129.887656, -4.503548], [129.887238, -4.503687], [129.886878, -4.503837], [129.886406, -4.503869], [129.886068, -4.503703], [129.885789, -4.503457], [129.885741, -4.503238], [129.885864, -4.502987], [129.886143, -4.502864]]]]}	{"village_name": "Nusantara", "color": "#34d399", "population": "1.865 Jiwa", "main_commodity": "Pariwisata Bahari & Jasa Perdagangan", "area_ha": "1390 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "MultiPolygon", "vertex_count": 257, "area_km2": 13.9, "density": 147}	Batas wilayah administratif resmi Nusantara, Pulau Neira.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
bf742188-f826-4ad0-855e-3170867b25c5	Batas Wilayah Combir Kasestoren	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.516659078947368	129.94289539473684	{"type": "Polygon", "coordinates": [[[129.943371, -4.507912], [129.946718, -4.507933], [129.946718, -4.509217], [129.945517, -4.510629], [129.945045, -4.511786], [129.944572, -4.512727], [129.944272, -4.513754], [129.944272, -4.515037], [129.944272, -4.516192], [129.945302, -4.51692], [129.94586, -4.518032], [129.945645, -4.519059], [129.944959, -4.520385], [129.944444, -4.521795], [129.944658, -4.522781], [129.945774, -4.523508], [129.946547, -4.52385], [129.94792, -4.525089], [129.948864, -4.525561], [129.940946, -4.523977], [129.941075, -4.52109], [129.940817, -4.520619], [129.940732, -4.520448], [129.940689, -4.519678], [129.939981, -4.518737], [129.93968, -4.51833], [129.939616, -4.518138], [129.940088, -4.517538], [129.93983, -4.517003], [129.939594, -4.516384], [129.939466, -4.515528], [129.939272, -4.514694], [129.939444, -4.513924], [129.940023, -4.513281], [129.939938, -4.512297], [129.93968, -4.511634], [129.941053, -4.509666], [129.943371, -4.507912]]]}	{"village_name": "Combir Kasestoren", "color": "#eab308", "population": "710 Jiwa", "main_commodity": "Perikanan Tradisional & Pala", "area_ha": "900 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 38, "area_km2": 9.0, "density": 79}	Batas wilayah administratif resmi Combir Kasestoren, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
cd537917-07f5-48e5-99e3-40361b4ac0a8	Pulau Nailaka	LAYER_TOURISM_4A	publik	Pulau Rhun	-4.535955	129.696908	null	{"sub_type": "Pulau Nailaka", "highlights": "1616 M (EIC Inggris)", "guide_available": false}	Puing benteng pertahanan garnisun Inggris (East India Company) abad ke-17 sebelum Pulau Rhun ditukar dengan Pulau Manhattan New York dalam Traktat Breda 1667.	t	2026-11-16 02:30:35.394004+00	2026-11-16 03:23:59.288562+00
02a90a5d-f869-44d3-9aa3-9890fdf9e7c3	Perkebunan Pala Tertua Lonthoir	LAYER_KOPERASI_UMKM	publik	Banda Besar	-4.549	129.883	null	{"komoditas": "Pala Banda (Myristica fragrans)", "usia_pohon": "> 100 Tahun", "image_url": "/images/landmarks/kebun-pala.jpg"}	Perkebunan pala tertua di dunia yang dibudidayakan secara turun-temurun di bawah naungan pohon kenari raksasa Lonthoir.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
1e3e52db-b618-4d75-9395-8b785f6f09ac	Pasar Tradisional & Ikan Banda Neira	LAYER_KOPERASI_UMKM	publik	Pulau Neira	-4.5265	129.896	null	{"market_type": "Pasar Tradisional", "komoditas": "Ikan Segar, Rempah & Hasil Bumi", "image_url": "/images/landmarks/pasar-banda.jpg"}	Pusat perdagangan rakyat pesisir, pelelangan ikan cakalang/tuna segar, dan belanja rempah pala warga Neira.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
3f30c972-0802-426d-8157-09038080cb46	Jalur Trekking Kawah Gunung Api	LAYER_TOURISM_4A	publik	Pulau Gunung Api	-4.524832	129.884791	null	{"sub_type": "bahari", "guide_available": false}	Rute pendakian dari pesisir timur Gunung Api melewati batuan vulkanik menuju kawah aktif di ketinggian 640 mdpl.	t	2026-11-16 02:30:35.394004+00	2026-11-16 10:32:41.93935+00
3445d650-79bb-4f97-9067-904f60563592	Penyebrangan Boiyauw (Lonthoir) -> Neira	LAYER_PUBLIC_SAFETY	publik	Pulau Neira	-4.530458	129.894769	{"type": "LineString", "coordinates": [[129.890413, -4.541621], [129.890971, -4.537748], [129.893546, -4.535524], [129.894522, -4.533538], [129.894769, -4.530458], [129.893841, -4.527511], [129.893932, -4.52718], [129.89427, -4.526902], [129.894737, -4.52703]]}	{"is_route": true, "route_type": "maritime", "transport_mode": "Kapal Penyebrangan", "travel_time": "10 Menit", "total_distance_km": 1.89, "total_distance_nm": 1.02, "waypoints_count": 9, "start_point": "Dermaga Penyebrangan Boiyauw", "end_point": "Dermaga Neira"}	\N	t	2026-11-15 00:28:05.009846+00	2026-11-15 00:28:05.009846+00
299b0954-c475-4f3e-befe-4a8da276637f	Abba Homestay	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.5258	129.8978	null	{"price_range": "Rp 250.000 - Rp 400.000", "has_breakfast": true, "image_url": "/images/landmarks/abba-homestay.jpg"}	Homestay nyaman dengan nuansa kekeluargaan khas Banda Neira dan sajian kuliner sarapan selai pala.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
3737916f-2905-4027-8e13-48a92f57979f	The Nutmeg Tree Dive Resort & Resto	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.5238	129.8968	null	{"price_range": "Rp 450.000 - Rp 750.000", "has_dive_center": true, "has_restaurant": true, "image_url": "/images/landmarks/nutmeg-tree-resort.jpg"}	Resor dan restoran tepi laut di pesisir barat Neira dengan fasilitas dive shop dan pemandangan Gunung Api.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
3b01240c-66c1-48b5-b921-0733af37b72b	Vita Guest House Banda	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.526	129.8982	null	{"price_range": "Rp 200.000 - Rp 350.000", "image_url": "/images/landmarks/vita-guesthouse.jpg"}	Penginapan ramah anggaran di jalan utama Neira dekat dengan situs rumah pengasingan Bung Hatta.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
3cda985a-53c3-4482-be95-efb5b6726fea	Makam Perigi Rante (Situs Tragedi 1621)	LAYER_HERITAGE	publik	Pulau Neira	-4.5249	129.8995	null	{"era": "1621 M", "status": "Monumen Sejarah", "image_url": "/images/landmarks/perigi-rante.jpg"}	Monumen peringatan pembantaian 44 Orang Kaya Banda oleh VOC di bawah Jan Pieterszoon Coen pada 8 Mei 1621 demi monopoli pala.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
4d66a7a4-f07e-46f8-92db-ecfe17cb6ac7	Hutan Kelle	LAYER_TOURISM_4A	publik	Banda Besar	-4.548645	129.876096	null	{"sub_type": "Wisata Bahari", "guide_available": true, "image_url": "/images/landmarks/kebun-pala.jpg"}		t	2026-11-14 10:03:10.432616+00	2026-11-16 08:15:11.818298+00
57c059c1-7cc5-483e-962d-b3c377a9c648	Istana Mini VOC Banda	LAYER_HERITAGE	publik	Pulau Neira	-4.528715	129.900531	\N	{"era": "VOC Pemerintahan Kolonial", "image_url": "/images/landmarks/istana-mini.jpg"}	Gedung kantor dan kediaman resmi Gubernur VOC di Banda, arsitektur megah neoklasik yang menjadi prototipe Istana Merdeka Jakarta.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
57f6df6d-4683-4163-9fea-bb14b675c2b5	Rumah Pengasingan Bung Hatta	LAYER_HERITAGE	publik	Pulau Neira	-4.527351	129.89978	\N	{"era": "Pergerakan Nasional Indonesia", "image_url": "/images/landmarks/bung-hatta.jpg"}	Tempat pengasingan Mohammad Hatta oleh kolonial Belanda (1936-1942). Dilengkapi ruang kelas belajar anak-anak Banda dan koleksi buku asli.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
67415f6e-856c-4ed9-a96d-9841f528d8f2	Sablah Parbai	LAYER_TOURISM_4A	publik	Pulau Ay	-4.518757	129.76774	null	{"sub_type": "Wisata Alam", "guide_available": true, "image_url": "/images/landmarks/pulau-ay.jpg"}		t	2026-11-14 05:43:22.793493+00	2026-11-16 08:15:11.818298+00
7f21e7ba-eab0-4a9d-b235-9ee905b1c5fc	Taman Wisata Perairan Laut Banda	LAYER_TOURISM_4A	publik	Pulau Neira	-4.512	129.92	null	{"conservation_area": true, "legal_basis": "KemenKP RI", "image_url": "/images/landmarks/taman-wisata-perairan.jpg"}	Kawasan konservasi perairan nasional Laut Banda seluas 2500 hektar untuk perlindungan biota pelagis dan kima raksasa.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
94d4d599-24b9-4451-87a5-64c74bb9fa52	Rumah Pengasingan Iwa Kusuma Sumantri	LAYER_HERITAGE	publik	Banda Neira	-4.52786	129.901124	null	{"era": "Rumah Pengasingan Tokoh Bersejarah Indonesia", "image_url": "/images/landmarks/iwa-kusuma.jpg"}		t	2026-11-14 00:24:09.09363+00	2026-11-16 08:15:11.818298+00
a140fcc2-ca7f-4ab8-8860-0d1e6fd5e48b	Rumah Pengasingan Sutan Sjahrir	LAYER_HERITAGE	publik	Pulau Neira	-4.525816	129.897333	\N	{"era": "Pergerakan Nasional Indonesia", "image_url": "/images/landmarks/sutan-sjahrir.jpg"}	Tempat tinggal Sutan Sjahrir selama dibuang ke Banda Neira. Menampilkan gramofon kuno, meja kerja diplomasi, dan surat korespondensi.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
a1784def-e160-4935-8815-8ff1ffd2ed0f	Welvaren	LAYER_HERITAGE	publik	Pulau Ay	-4.518642	129.772654	null	{"image_url": "/images/landmarks/welvaren.jpg"}		t	2026-11-14 01:20:41.320803+00	2026-11-16 08:15:11.818298+00
a2678abc-bbcd-4bcd-9951-9c2e8b1814d0	Benteng Revenge Pulau Ay	LAYER_HERITAGE	publik	Pulau Ay	-4.519078	129.773319	\N	{"era": "Konflik VOC vs EIC", "image_url": "/images/landmarks/benteng-revenge.jpg"}	Benteng pertahanan perebutan monopoli rempah antara armada VOC Belanda dan kongsi dagang Inggris EIC tahun 1616.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
aa681c0f-aa2b-4431-8c6f-faa4c4829913	Pondok Wisata Mutiara Guest House	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.5255	129.898	null	{"price_range": "Rp 250.000 - Rp 400.000", "has_wifi": true, "image_url": "/images/landmarks/mutiara-guesthouse.jpg"}	Penginapan legendaris nyaman di pusat kota Neira dengan kebun pala mini di halaman belakang.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
bfddbbe4-6c3f-4f16-bd5e-8aebd2ef1258	Klenteng Sun Hok Bio	LAYER_HERITAGE	publik	Pulau Neira	-4.5273	129.8969	null	{"era": "1689 M", "status": "Cagar Budaya", "image_url": "/images/landmarks/klenteng.jpg"}	Klenteng tertua di Kepulauan Banda yang dibangun pedagang Tionghoa abad ke-17, simbol kerukunan multikultural jalur rempah.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
afd5c5b4-98ad-44ad-b89b-a7ec1d94f0ee	Dermaga Pulau Rhun	LAYER_PUBLIC_SAFETY	publik	Pulau Rhun	-4.552811	129.678969	null	{}	Dermaga utama pendaratan speedboat dan kapal motor nelayan di sisi timur Pulau Rhun.	t	2026-11-16 02:30:35.394004+00	2026-11-16 10:34:02.639412+00
bfe51e55-e9a1-449a-ac58-e7266b47dbee	Batas Wilayah Tanah Rata	LAYER_DESA_ADMIN	zona_wilayah	Pulau Neira	-4.513049416666667	129.90116725	{"type": "Polygon", "coordinates": [[[129.896121, -4.512447], [129.90714, -4.508372], [129.907751, -4.510436], [129.907826, -4.511474], [129.907891, -4.512522], [129.899855, -4.515923], [129.899544, -4.515613], [129.898943, -4.514875], [129.898417, -4.514607], [129.897612, -4.514436], [129.896786, -4.513441], [129.896121, -4.512447]]]}	{"village_name": "Tanah Rata", "color": "#4338ca", "population": "906 Jiwa", "main_commodity": "Hasil Laut & Olahan Ikan Asar", "area_ha": "720 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 12, "area_km2": 7.2, "density": 126}	Batas wilayah administratif resmi Tanah Rata, Pulau Neira.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
99df677b-e297-4630-a81d-b1f982323364	Batas Wilayah Desa Pulau Hatta	LAYER_DESA_ADMIN	zona_wilayah	Pulau Hatta	-4.593501636363636	130.0401195681818	{"type": "Polygon", "coordinates": [[[130.03448, -4.583826], [130.035424, -4.57989], [130.039115, -4.578592], [130.041819, -4.579661], [130.043063, -4.580731], [130.044823, -4.582356], [130.04581, -4.58334], [130.047269, -4.583597], [130.048728, -4.58411], [130.049329, -4.584795], [130.047441, -4.585265], [130.047183, -4.586035], [130.046883, -4.588816], [130.045896, -4.591596], [130.045509, -4.592709], [130.046411, -4.593094], [130.046968, -4.593949], [130.046797, -4.595789], [130.044694, -4.599125], [130.043535, -4.602034], [130.045338, -4.603959], [130.046368, -4.606483], [130.047183, -4.607809], [130.045938, -4.608194], [130.044951, -4.608493], [130.042934, -4.606397], [130.04066, -4.605499], [130.038471, -4.604344], [130.037098, -4.60413], [130.036025, -4.60413], [130.034351, -4.602975], [130.033493, -4.602334], [130.033493, -4.598669], [130.03315, -4.597671], [130.031862, -4.597329], [130.031304, -4.595703], [130.031476, -4.594206], [130.031476, -4.592153], [130.030618, -4.590998], [130.030017, -4.588773], [130.030017, -4.587789], [130.030618, -4.586891], [130.032763, -4.586007], [130.03448, -4.583826]]]}	{"village_name": "Desa Pulau Hatta", "color": "#00ffbf", "population": "681 Jiwa", "main_commodity": "", "area_ha": "1588 Hektar", "area_km2": 15.88, "density": 43, "highlights": "", "demographics": {"total_population": 681}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 44}	Batas wilayah administratif resmi Desa Pulau Hatta, Pulau Hatta.	t	2026-11-15 00:25:21.655693+00	2026-11-16 02:30:35.394004+00
c5d340e0-f92b-4d8d-896c-af80b16cca60	Delfika Homestay & Heritage Villa	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.525779	129.897661	\N	{"price_per_night_rp": 350000, "contact_whatsapp": "6281299887711", "image_url": "/images/landmarks/delfika-homestay.jpg"}	Penginapan bersejarah di pusat kota Neira dengan kebun asri, air minum RO gratis dari tandon komunal, dan sistem solar backup.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
c76d60c8-4fac-473a-87d8-694b649c3e21	Pelabuhan Laut Utama Banda Neira (Dermaga PELNI)	LAYER_PUBLIC_SAFETY	publik	Pulau Neira	-4.524928	129.896722	\N	{"image_url": "/images/landmarks/pelabuhan.jpg"}	Dermaga sandar kapal penumpang PELNI (KM Nggapulu, KM Pangrango, KM Sangiang) dan logistik utama antar-pulau.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
0bb641a4-3b21-4c2c-b82b-1eab21c4aa2f	Batas Wilayah Lonthoir	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.554433161016949	129.89461793220337	{"type": "Polygon", "coordinates": [[[129.862304, -4.546736], [129.86342, -4.546094], [129.864321, -4.545752], [129.864664, -4.545431], [129.865093, -4.545732], [129.866638, -4.545732], [129.867604, -4.545154], [129.868784, -4.544534], [129.869986, -4.544085], [129.87093, -4.543956], [129.872196, -4.543549], [129.873033, -4.543272], [129.873848, -4.543143], [129.874663, -4.542865], [129.876165, -4.54293], [129.876487, -4.543122], [129.876831, -4.543315], [129.877431, -4.54417], [129.879105, -4.545261], [129.879813, -4.545881], [129.881058, -4.546352], [129.882624, -4.547293], [129.882946, -4.547293], [129.884427, -4.547956], [129.885242, -4.547421], [129.886165, -4.548106], [129.887323, -4.547593], [129.888589, -4.546951], [129.892001, -4.547571], [129.892409, -4.54725], [129.894083, -4.547357], [129.89537, -4.546823], [129.898138, -4.546972], [129.897902, -4.547871], [129.899168, -4.548299], [129.903524, -4.548983], [129.906271, -4.550223], [129.908845, -4.550501], [129.924617, -4.547185], [129.926634, -4.545432], [129.928608, -4.541688], [129.93202, -4.543272], [129.93777, -4.547891], [129.949336, -4.554994], [129.950602, -4.557026], [129.951074, -4.557988], [129.951074, -4.558951], [129.950323, -4.560149], [129.949872, -4.560961], [129.948285, -4.56079], [129.946203, -4.56109], [129.945645, -4.561453], [129.944122, -4.563036], [129.943542, -4.564598], [129.942641, -4.565389], [129.94041, -4.565731], [129.936054, -4.56357], [129.932964, -4.564468], [129.928865, -4.560533], [129.914382, -4.562672], [129.913223, -4.567441], [129.911807, -4.565409], [129.910927, -4.565602], [129.91039, -4.563356], [129.908416, -4.563313], [129.907601, -4.563078], [129.906914, -4.563527], [129.906292, -4.563891], [129.905562, -4.563762], [129.905326, -4.564639], [129.904425, -4.564725], [129.90288, -4.563527], [129.903374, -4.562522], [129.901164, -4.559249], [129.900606, -4.558607], [129.899962, -4.557239], [129.89773, -4.557153], [129.896529, -4.557773], [129.896443, -4.558501], [129.893954, -4.559891], [129.893396, -4.559634], [129.893289, -4.558586], [129.893525, -4.557795], [129.892323, -4.556982], [129.890113, -4.557517], [129.89007, -4.558329], [129.888718, -4.559463], [129.88874, -4.560853], [129.888225, -4.562073], [129.88565, -4.560853], [129.884877, -4.558714], [129.885049, -4.55773], [129.884191, -4.556875], [129.884877, -4.555164], [129.884062, -4.554608], [129.884405, -4.552896], [129.881744, -4.552255], [129.879599, -4.552854], [129.879427, -4.553966], [129.878139, -4.554436], [129.873719, -4.556233], [129.874191, -4.557174], [129.87329, -4.557816], [129.873118, -4.560083], [129.871016, -4.560939], [129.868913, -4.562393], [129.868913, -4.564404], [129.865351, -4.562821], [129.864235, -4.562094], [129.86402, -4.560254], [129.861317, -4.557474], [129.860673, -4.555977], [129.861059, -4.553966], [129.860587, -4.55187], [129.861317, -4.550201], [129.860759, -4.549175], [129.861746, -4.548319], [129.862304, -4.546736]]]}	{"village_name": "Lonthoir", "color": "#86efac", "population": "2.325 Jiwa", "main_commodity": "Pala Lonthoir Grade AAA & Minyak Fuli", "area_ha": "1607 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 118, "area_km2": 16.07, "density": 145}	Batas wilayah administratif resmi Lonthoir, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
627dbb26-1154-4fa3-af52-9e0f2d2628b0	Batas Wilayah Uring Tutra	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.569181209302326	129.92486127906977	{"type": "Polygon", "coordinates": [[[129.932878, -4.564682], [129.93556, -4.567869], [129.935367, -4.569751], [129.934895, -4.571463], [129.934144, -4.572469], [129.9335, -4.572833], [129.932899, -4.573088], [129.931655, -4.572639], [129.930925, -4.571913], [129.930453, -4.571464], [129.929788, -4.570736], [129.929123, -4.570373], [129.928651, -4.569945], [129.928393, -4.570266], [129.927835, -4.570672], [129.927342, -4.571057], [129.925818, -4.571057], [129.925668, -4.57018], [129.925368, -4.569646], [129.925218, -4.56956], [129.924853, -4.569517], [129.924381, -4.56956], [129.923544, -4.568982], [129.9229, -4.568255], [129.922578, -4.567956], [129.922278, -4.567614], [129.921913, -4.567485], [129.920261, -4.567485], [129.920261, -4.567849], [129.91936, -4.568084], [129.919124, -4.568769], [129.918544, -4.569731], [129.918351, -4.571014], [129.917622, -4.571014], [129.917257, -4.571314], [129.91657, -4.57033], [129.915562, -4.569752], [129.914188, -4.569025], [129.913201, -4.567571], [129.914188, -4.563849], [129.914811, -4.562544], [129.92893, -4.560747], [129.932878, -4.564682]]]}	{"village_name": "Uring Tutra", "color": "#2dd4bf", "population": "441 Jiwa", "main_commodity": "Pala & Tanaman Hortikultura Kebun", "area_ha": "220 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 43, "area_km2": 2.2, "density": 200}	Batas wilayah administratif resmi Uring Tutra, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
71a009e5-cf20-486f-b065-b8b544f7b089	Batas Wilayah Dender	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.533963471698113	129.95102718867923	{"type": "Polygon", "coordinates": [[[129.943478, -4.531078], [129.9438, -4.528961], [129.944916, -4.524961], [129.949358, -4.525624], [129.949744, -4.526352], [129.950023, -4.526887], [129.95028, -4.527336], [129.950452, -4.527678], [129.950452, -4.528213], [129.950194, -4.528598], [129.950194, -4.52894], [129.950194, -4.529282], [129.950924, -4.529539], [129.95146, -4.529732], [129.952147, -4.530202], [129.952533, -4.530202], [129.953156, -4.530651], [129.953413, -4.530801], [129.953649, -4.531079], [129.954207, -4.531229], [129.955044, -4.531229], [129.955366, -4.531293], [129.955516, -4.531657], [129.955602, -4.532213], [129.955688, -4.532512], [129.955194, -4.532918], [129.954293, -4.533047], [129.954035, -4.533646], [129.953606, -4.533881], [129.953027, -4.534566], [129.952919, -4.535079], [129.952726, -4.535657], [129.952769, -4.535978], [129.952555, -4.53756], [129.952748, -4.538757], [129.952404, -4.539634], [129.952276, -4.540555], [129.952426, -4.540684], [129.952769, -4.541026], [129.952533, -4.54201], [129.952576, -4.543165], [129.953306, -4.543807], [129.953842, -4.544512], [129.954422, -4.544855], [129.949894, -4.543529], [129.947147, -4.542095], [129.94453, -4.540192], [129.943306, -4.538972], [129.945474, -4.536126], [129.94556, -4.534779], [129.94674, -4.533196], [129.946096, -4.532511], [129.943478, -4.531078]]]}	{"village_name": "Dender", "color": "#00eeff", "population": "413 Jiwa", "main_commodity": "Cengkeh Petik & Rumput Laut", "area_ha": "210 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 53, "area_km2": 2.1, "density": 197}	Batas wilayah administratif resmi Dender, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
c576f9cb-83e2-42f7-8c87-0285429d4061	Batas Wilayah Boiyauw	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.546880708333333	129.88882283333334	{"type": "Polygon", "coordinates": [[[129.887935, -4.546126], [129.888815, -4.54588], [129.889984, -4.545613], [129.891229, -4.545495], [129.892044, -4.545528], [129.892194, -4.546384], [129.892194, -4.546886], [129.892344, -4.547122], [129.892044, -4.547325], [129.891368, -4.547325], [129.889845, -4.54711], [129.88948, -4.54711], [129.888504, -4.546769], [129.888268, -4.546908], [129.88786, -4.547068], [129.887227, -4.5474], [129.887098, -4.547614], [129.886433, -4.547827], [129.886068, -4.547956], [129.885607, -4.547742], [129.885532, -4.547442], [129.885371, -4.547335], [129.886369, -4.547046], [129.887935, -4.546126]]]}	{"village_name": "Boiyauw", "color": "#2563eb", "population": "837 Jiwa", "main_commodity": "Pala Organik & Biji Kenari Hutan", "area_ha": "715 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 24, "area_km2": 7.15, "density": 117}	Batas wilayah administratif resmi Boiyauw, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
df35a734-b815-4fbf-837c-cb57d15ff58d	Batas Wilayah Waer	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.5488211666666665	129.9514729166667	{"type": "Polygon", "coordinates": [[[129.93762, -4.547592], [129.943414, -4.539292], [129.94807, -4.542736], [129.954443, -4.545003], [129.956374, -4.54603], [129.956825, -4.546095], [129.957447, -4.546822], [129.957533, -4.547443], [129.957533, -4.548213], [129.957361, -4.54894], [129.956374, -4.549004], [129.956052, -4.549304], [129.955537, -4.549645], [129.954808, -4.549709], [129.953349, -4.549431], [129.951718, -4.54988], [129.950345, -4.550908], [129.949422, -4.551486], [129.948971, -4.551935], [129.948564, -4.55247], [129.948435, -4.553282], [129.948564, -4.554138], [129.948971, -4.554758], [129.93762, -4.547592]]]}	{"village_name": "Waer", "color": "#fb7185", "population": "1.444 Jiwa", "main_commodity": "Pala, Cengkeh, & Perikanan Pesisir", "area_ha": "799 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 24, "area_km2": 7.99, "density": 181}	Batas wilayah administratif resmi Waer, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
e462b364-165d-43a1-9cfa-70e316bdc252	Batas Wilayah Selamon	LAYER_DESA_ADMIN	zona_wilayah	Banda Besar	-4.533643333333333	129.93903223809525	{"type": "Polygon", "coordinates": [[[129.939487, -4.526543], [129.941096, -4.524084], [129.944873, -4.524961], [129.943757, -4.528768], [129.943371, -4.531101], [129.945903, -4.532512], [129.946654, -4.533325], [129.945624, -4.534801], [129.945259, -4.536149], [129.943285, -4.539421], [129.94041, -4.543656], [129.937577, -4.54772], [129.932084, -4.5431], [129.927492, -4.540875], [129.925861, -4.540233], [129.933071, -4.53279], [129.934723, -4.531356], [129.934981, -4.530715], [129.936311, -4.529645], [129.938371, -4.528212], [129.939487, -4.526543]]]}	{"village_name": "Selamon", "color": "#9333ea", "population": "1.620 Jiwa", "main_commodity": "Pala Warisan Adat & Wisata Budaya", "area_ha": "1209 Hektar", "highlights": "", "demographics": {}, "is_zone": true, "polygon_type": "Polygon", "vertex_count": 21, "area_km2": 12.09, "density": 134}	Batas wilayah administratif resmi Selamon, Banda Besar.	t	2026-11-14 16:35:49.933946+00	2026-11-15 15:24:05.079765+00
d2ae1e32-2420-4c50-a92f-976718e28c39	Pantai Pasir Putih Pulau Hatta	LAYER_TOURISM_4A	publik	Pulau Hatta	-4.588	130.045	null	{"attraction_type": "Wisata Pantai & Drop-Off", "sand_type": "Pasir Putih Halus", "image_url": "/images/landmarks/pulau-hatta.jpg"}	Bentangan pantai pasir putih alami menghadap palung laut dalam dengan dinding karang vertikal spektakuler.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
d68b53e4-0000-4ba6-84da-9cf5a41c9319	Puncak Vulkanik Gunung Api Banda	LAYER_TOURISM_4A	publik	Gunung Api	-4.522565	129.879867	\N	{"sub_type": "alam", "guide_available": false, "image_url": "/images/landmarks/gunung-api.jpg"}	Puncak kawah vulkanik aktif berketinggian 640 mdpl dengan pemandangan 360 derajat seluruh gugusan kepulauan Banda.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
dfe9eff9-8121-49a6-bd7c-8caaa2341931	Spot Snorkeling Pulau Sjahrir (Pulau Pisang)	LAYER_TOURISM_4A	publik	Pulau Sjahrir	-4.498	129.932	null	{"attraction_type": "Snorkeling & Diving", "coral_quality": "Sangat Baik", "image_url": "/images/landmarks/pulau-pisang.jpg"}	Terumbu karang alami yang masih sangat perawan di sisi barat Pulau Sjahrir (Pulau Pisang) dengan visibilitas air jernih.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
e54f7982-52a5-44ab-8b7c-b00f27279655	Terminal Dermaga Pulau Ay	LAYER_DESA_ADMIN	publik	Pulau Neira	-4.517805	129.77511	null	{"image_url": "/images/landmarks/dermaga-ay.jpg"}		t	2026-11-14 05:25:27.846515+00	2026-11-16 08:15:11.818298+00
e9c7c7d6-ceea-4a6d-9d21-1e3c749d80f5	Benteng Belgica (Fort Belgica)	LAYER_HERITAGE	publik	Pulau Neira	-4.526116	129.898835	\N	{"era": "VOC Kolonial Belanda", "image_url": "/images/landmarks/belgica.jpg"}	Benteng segi lima bertingkat dibangun Pieter Both tahun 1611 di atas bukit Tabaleku untuk mengawasi seluruh teluk Neira.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
f094a2e1-2222-48c4-acf5-f3da7f60f8b1	Maulana Hotel Banda Neira	LAYER_ACCOMMODATION	publik	Pulau Neira	-4.524368	129.897392	\N	{"price_per_night_rp": 650000, "contact_whatsapp": "6281299887733", "image_url": "/images/landmarks/hotel-maulana.jpg"}	Hotel tepi pantai legendaris Banda didirikan oleh tokoh budaya Des Alwi, pemandangan langsung ke Gunung Api.	t	2026-11-13 13:55:47.696245+00	2026-11-16 08:15:11.818298+00
f310f11a-9721-44a3-9634-b294e1fbe5a9	Benteng Kora-Kora	LAYER_HERITAGE	publik	Pulau Neira	-4.5222	129.9015	null	{"era": "Abad ke-17", "status": "Situs Cagar Budaya", "image_url": "/images/landmarks/benteng-kora-kora.jpg"}	Pos pertahanan maritim VOC peninggalan era perang laut perahu kora-kora di pesisir utara Neira.	t	2026-11-16 02:30:35.394004+00	2026-11-16 08:15:11.818298+00
f7cd1486-147c-432e-a830-da1536e948b3	Sumur Pusaka Lonthoir	LAYER_WATER_INFRA	resiliensi	Banda Besar	-4.547939	129.878333	null	{"image_url": "/images/landmarks/sumur-lonthoir.jpg"}		t	2026-11-14 00:01:53.032585+00	2026-11-16 08:15:11.818298+00
ffcc78a6-a30b-4982-a24a-60f42f3c78a8	Sabla Pante	LAYER_TOURISM_4A	publik	Pulau Ay	-4.522201	129.763641	null	{"sub_type": "Wisata Alam", "highlights": "Pantai Bagian Barat di Pulau Ay", "guide_available": true, "image_url": "/images/landmarks/pulau-ay.jpg"}		t	2026-11-14 05:47:21.467718+00	2026-11-16 08:15:11.818298+00
06919626-8537-41f8-a9e3-30b7124a5196	Dermaga Waer Banda Besar	LAYER_PUBLIC_SAFETY	publik	Banda Besar	-4.5285	129.969	null	{"facility_type": "Dermaga Penyeberangan", "island": "Banda Besar", "image_url": "/images/landmarks/dermaga-waer.jpg"}	Dermaga penyeberangan pesisir tenggara Pulau Banda Besar (Desa Waer) menuju Pulau Neira dan Hatta.	t	2026-11-16 08:15:11.818298+00	2026-11-16 08:15:11.818298+00
51518797-d579-442a-a9a9-5baf109b8f62	Dermaga Selamon Banda Besar	LAYER_PUBLIC_SAFETY	publik	Banda Besar	-4.538	129.961	null	{"facility_type": "Dermaga Tradisional", "island": "Banda Besar", "image_url": "/images/landmarks/dermaga-selamon.jpg"}	Dermaga pesisir timur laut Banda Besar, sentra pendaratan perahu nelayan tradisional Desa Selamon.	t	2026-11-16 08:15:11.818298+00	2026-11-16 08:15:11.818298+00
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: tour_guides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_guides (id, name, license_number, phone_whatsapp, specialties, languages, fee_per_day_rp, photo_url, bio, island_base, is_verified, is_active, rating, trips_completed, created_at, updated_at) FROM stdin;
bbecaad4-5d7e-4581-bea4-d24ff83a6765	Dewi Nusantara	HPI-BANDA-001	6281234567896	Sejarah Benteng VOC, Rumah Bung Hatta & Sutan Sjahrir	Indonesia, English, Dutch	350000.00	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80	Pemandu budaya berlisensi HPI dengan pengalaman lebih dari 8 tahun menceritakan sejarah peradaban rempah dan diplomasi kolonial Banda Neira.	Pulau Neira	t	t	4.95	48	2026-11-13 13:59:14.246035+00	2026-11-13 13:59:14.246035+00
2a5a79d5-68f1-4cee-93ce-21f8da6024b4	Umar Baadilla	HPI-BANDA-002	6281234567897	Snorkeling Lava Flow, Diving Palung Hatta & Konservasi Terumbu	Indonesia, English	450000.00	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80	Instruktur selam bersertifikat PADI dan pemandu bahari spesialis dinding palung Banda serta titik migrasi hiu martil.	Pulau Hatta	t	t	5.00	62	2026-11-13 13:59:14.246035+00	2026-11-13 13:59:14.246035+00
d4329bf7-85ee-4ef9-a1b9-83cef87d6e74	Hasan Wailissa	HPI-BANDA-003	6281234567898	Trekking Kebun Pala Purba Lonthoir & Gastronomi Rempah Kenari	Indonesia, English	300000.00	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80	Putra asli Lonthoir yang memandu napak tilas perkebunan pala tertua abad ke-16 serta edukasi panen kenari dan pala organik.	Banda Besar	t	t	4.88	35	2026-11-13 13:59:14.246035+00	2026-11-13 13:59:14.246035+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
c91ca400-fd2f-45aa-b179-d20559db60a6	0980581d-443b-433b-8f51-13f98f64af79
c91ca400-fd2f-45aa-b179-d20559db60a6	dea7317d-d6d3-4925-bde4-d60a9d5242bc
6f3f70a5-1bda-4955-8019-e49f9834f93a	dea7317d-d6d3-4925-bde4-d60a9d5242bc
0984d44a-2306-4b6a-b99c-3e88626c6cac	300e8067-31cb-47ff-8d39-5a1fd6a66960
0984d44a-2306-4b6a-b99c-3e88626c6cac	b5458387-e634-4084-ac50-f4772ebe018e
025dc036-db13-452a-9da5-1ffcfea175eb	300e8067-31cb-47ff-8d39-5a1fd6a66960
45bddc1b-697a-4930-8f89-1b8137eb65c2	997cdc07-3140-4e1f-be52-e983c7c3c856
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password_hash, full_name, is_active, is_superuser, created_at, updated_at) FROM stdin;
c91ca400-fd2f-45aa-b179-d20559db60a6	admin@bandaneira.desa.id	admin	$2b$12$fmdsEOYlV0TdKfxoNFdheO5aOSPSMHk9KXwlA9ONmHrkt8qyAB9eS	Ahmad Baadilla, S.STP	t	t	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
6f3f70a5-1bda-4955-8019-e49f9834f93a	petugas@bandaneira.desa.id	petugas	$2b$12$sb.zz5rFf3idRdPDiPLYou2cauVE9OhV4swsFm6EzAARFLoORuaqe	Siti Rahma Marasabessy	t	f	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
0984d44a-2306-4b6a-b99c-3e88626c6cac	ketua@bandaneira.desa.id	ketua_kelompok	$2b$12$S0WmBJ0i8M2v3VifUw9Gg.8eNHNDN19.OkcjaDojrfQUJPU6g0yL2	Daud Walalayo	t	f	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
025dc036-db13-452a-9da5-1ffcfea175eb	petani@bandaneira.desa.id	petani	$2b$12$BvC3A7iO2dm4OZgNvOpO2e2Z8klPLwl8X7pSFVCKAAwqg5SZQmY1C	Usman Alkatiri	t	f	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
45bddc1b-697a-4930-8f89-1b8137eb65c2	warga@bandaneira.desa.id	warga	$2b$12$uAeA49ytzib9YCC1la1t0.n2.z1Ok8LOXeHp.FrJFsJL2BG0gfkpG	Nurul Hidayah Baadilla	t	f	2026-11-13 13:59:34.950709+00	2026-11-13 13:59:34.950709+00
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: postgres
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- Name: administrative_requests administrative_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_requests
    ADD CONSTRAINT administrative_requests_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: batch_events batch_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_events
    ADD CONSTRAINT batch_events_pkey PRIMARY KEY (id);


--
-- Name: batch_harvests batch_harvests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_harvests
    ADD CONSTRAINT batch_harvests_pkey PRIMARY KEY (batch_id, harvest_id);


--
-- Name: blockchain_transactions blockchain_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blockchain_transactions
    ADD CONSTRAINT blockchain_transactions_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: coop_accounts coop_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_accounts
    ADD CONSTRAINT coop_accounts_pkey PRIMARY KEY (id);


--
-- Name: coop_transactions coop_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_transactions
    ADD CONSTRAINT coop_transactions_pkey PRIMARY KEY (id);


--
-- Name: farmer_groups farmer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer_groups
    ADD CONSTRAINT farmer_groups_pkey PRIMARY KEY (id);


--
-- Name: farmers farmers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_pkey PRIMARY KEY (id);


--
-- Name: farms farms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farms
    ADD CONSTRAINT farms_pkey PRIMARY KEY (id);


--
-- Name: harvests harvests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvests
    ADD CONSTRAINT harvests_pkey PRIMARY KEY (id);


--
-- Name: iot_telemetry_logs iot_telemetry_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iot_telemetry_logs
    ADD CONSTRAINT iot_telemetry_logs_pkey PRIMARY KEY (id);


--
-- Name: product_batches product_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_batches
    ADD CONSTRAINT product_batches_pkey PRIMARY KEY (id);


--
-- Name: raw_surveys raw_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_surveys
    ADD CONSTRAINT raw_surveys_pkey PRIMARY KEY (id);


--
-- Name: residents residents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residents
    ADD CONSTRAINT residents_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: spatial_features spatial_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spatial_features
    ADD CONSTRAINT spatial_features_pkey PRIMARY KEY (id);


--
-- Name: tour_guides tour_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_guides
    ADD CONSTRAINT tour_guides_pkey PRIMARY KEY (id);


--
-- Name: bookings uq_bookings_booking_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT uq_bookings_booking_code UNIQUE (booking_code);


--
-- Name: coop_accounts uq_coop_accounts_resident_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_accounts
    ADD CONSTRAINT uq_coop_accounts_resident_id UNIQUE (resident_id);


--
-- Name: coop_transactions uq_coop_transactions_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_transactions
    ADD CONSTRAINT uq_coop_transactions_code UNIQUE (transaction_code);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_accommodations_island_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_accommodations_island_name ON public.accommodations USING btree (island_name);


--
-- Name: ix_administrative_requests_resident_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_administrative_requests_resident_id ON public.administrative_requests USING btree (resident_id);


--
-- Name: ix_administrative_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_administrative_requests_status ON public.administrative_requests USING btree (status);


--
-- Name: ix_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: ix_audit_logs_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_entity_id ON public.audit_logs USING btree (entity_id);


--
-- Name: ix_audit_logs_entity_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_entity_name ON public.audit_logs USING btree (entity_name);


--
-- Name: ix_batch_events_batch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_batch_events_batch_id ON public.batch_events USING btree (batch_id);


--
-- Name: ix_batch_events_event_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_batch_events_event_hash ON public.batch_events USING btree (event_hash);


--
-- Name: ix_blockchain_transactions_batch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blockchain_transactions_batch_id ON public.blockchain_transactions USING btree (batch_id);


--
-- Name: ix_blockchain_transactions_data_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blockchain_transactions_data_hash ON public.blockchain_transactions USING btree (data_hash);


--
-- Name: ix_blockchain_transactions_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blockchain_transactions_event_id ON public.blockchain_transactions USING btree (event_id);


--
-- Name: ix_blockchain_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blockchain_transactions_status ON public.blockchain_transactions USING btree (status);


--
-- Name: ix_blockchain_transactions_transaction_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_blockchain_transactions_transaction_hash ON public.blockchain_transactions USING btree (transaction_hash);


--
-- Name: ix_bookings_accommodation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_bookings_accommodation_id ON public.bookings USING btree (accommodation_id);


--
-- Name: ix_bookings_booking_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_bookings_booking_code ON public.bookings USING btree (booking_code);


--
-- Name: ix_coop_accounts_resident_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_coop_accounts_resident_id ON public.coop_accounts USING btree (resident_id);


--
-- Name: ix_coop_transactions_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_coop_transactions_account_id ON public.coop_transactions USING btree (account_id);


--
-- Name: ix_coop_transactions_resident_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_coop_transactions_resident_id ON public.coop_transactions USING btree (resident_id);


--
-- Name: ix_coop_transactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_coop_transactions_type ON public.coop_transactions USING btree (transaction_type);


--
-- Name: ix_farmer_groups_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_farmer_groups_name ON public.farmer_groups USING btree (name);


--
-- Name: ix_farmers_farmer_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_farmers_farmer_code ON public.farmers USING btree (farmer_code);


--
-- Name: ix_farmers_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farmers_name ON public.farmers USING btree (name);


--
-- Name: ix_farms_farm_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_farms_farm_code ON public.farms USING btree (farm_code);


--
-- Name: ix_farms_farmer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farms_farmer_id ON public.farms USING btree (farmer_id);


--
-- Name: ix_farms_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farms_name ON public.farms USING btree (name);


--
-- Name: ix_farms_primary_commodity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_farms_primary_commodity ON public.farms USING btree (primary_commodity);


--
-- Name: ix_harvests_commodity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_harvests_commodity ON public.harvests USING btree (commodity);


--
-- Name: ix_harvests_farm_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_harvests_farm_id ON public.harvests USING btree (farm_id);


--
-- Name: ix_harvests_farmer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_harvests_farmer_id ON public.harvests USING btree (farmer_id);


--
-- Name: ix_harvests_harvest_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_harvests_harvest_code ON public.harvests USING btree (harvest_code);


--
-- Name: ix_iot_telemetry_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_iot_telemetry_logs_created_at ON public.iot_telemetry_logs USING btree (created_at);


--
-- Name: ix_iot_telemetry_logs_station_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_iot_telemetry_logs_station_code ON public.iot_telemetry_logs USING btree (station_code);


--
-- Name: ix_product_batches_batch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_product_batches_batch_code ON public.product_batches USING btree (batch_code);


--
-- Name: ix_product_batches_commodity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_product_batches_commodity ON public.product_batches USING btree (commodity);


--
-- Name: ix_product_batches_public_verification_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_product_batches_public_verification_token ON public.product_batches USING btree (public_verification_token);


--
-- Name: ix_raw_surveys_etl_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_raw_surveys_etl_status ON public.raw_surveys USING btree (etl_status);


--
-- Name: ix_raw_surveys_island_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_raw_surveys_island_name ON public.raw_surveys USING btree (island_name);


--
-- Name: ix_raw_surveys_problem_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_raw_surveys_problem_domain ON public.raw_surveys USING btree (problem_domain);


--
-- Name: ix_raw_surveys_survey_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_raw_surveys_survey_code ON public.raw_surveys USING btree (survey_code);


--
-- Name: ix_residents_full_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_residents_full_name ON public.residents USING btree (full_name);


--
-- Name: ix_residents_nik; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_residents_nik ON public.residents USING btree (nik);


--
-- Name: ix_residents_nik_blind_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_residents_nik_blind_index ON public.residents USING btree (nik_blind_index);


--
-- Name: ix_residents_occupation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_residents_occupation ON public.residents USING btree (occupation);


--
-- Name: ix_residents_verification_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_residents_verification_status ON public.residents USING btree (verification_status);


--
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- Name: ix_spatial_features_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_spatial_features_category ON public.spatial_features USING btree (category);


--
-- Name: ix_spatial_features_island_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_spatial_features_island_name ON public.spatial_features USING btree (island_name);


--
-- Name: ix_spatial_features_layer_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_spatial_features_layer_type ON public.spatial_features USING btree (layer_type);


--
-- Name: ix_spatial_features_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_spatial_features_name ON public.spatial_features USING btree (name);


--
-- Name: ix_tour_guides_is_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tour_guides_is_verified ON public.tour_guides USING btree (is_verified);


--
-- Name: ix_tour_guides_island_base; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tour_guides_island_base ON public.tour_guides USING btree (island_base);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: administrative_requests administrative_requests_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_requests
    ADD CONSTRAINT administrative_requests_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.residents(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: batch_events batch_events_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_events
    ADD CONSTRAINT batch_events_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.product_batches(id) ON DELETE CASCADE;


--
-- Name: batch_events batch_events_recorded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_events
    ADD CONSTRAINT batch_events_recorded_by_user_id_fkey FOREIGN KEY (recorded_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: batch_harvests batch_harvests_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_harvests
    ADD CONSTRAINT batch_harvests_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.product_batches(id) ON DELETE CASCADE;


--
-- Name: batch_harvests batch_harvests_harvest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_harvests
    ADD CONSTRAINT batch_harvests_harvest_id_fkey FOREIGN KEY (harvest_id) REFERENCES public.harvests(id) ON DELETE CASCADE;


--
-- Name: blockchain_transactions blockchain_transactions_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blockchain_transactions
    ADD CONSTRAINT blockchain_transactions_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.product_batches(id) ON DELETE CASCADE;


--
-- Name: blockchain_transactions blockchain_transactions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blockchain_transactions
    ADD CONSTRAINT blockchain_transactions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.batch_events(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_accommodation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_accommodation_id_fkey FOREIGN KEY (accommodation_id) REFERENCES public.accommodations(id) ON DELETE CASCADE;


--
-- Name: coop_accounts coop_accounts_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_accounts
    ADD CONSTRAINT coop_accounts_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.residents(id) ON DELETE CASCADE;


--
-- Name: coop_transactions coop_transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_transactions
    ADD CONSTRAINT coop_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.coop_accounts(id) ON DELETE CASCADE;


--
-- Name: coop_transactions coop_transactions_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coop_transactions
    ADD CONSTRAINT coop_transactions_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.residents(id) ON DELETE CASCADE;


--
-- Name: farmers farmers_farmer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_farmer_group_id_fkey FOREIGN KEY (farmer_group_id) REFERENCES public.farmer_groups(id) ON DELETE SET NULL;


--
-- Name: farmers farmers_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.residents(id) ON DELETE SET NULL;


--
-- Name: farmers farmers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: farms farms_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farms
    ADD CONSTRAINT farms_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id) ON DELETE CASCADE;


--
-- Name: harvests harvests_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvests
    ADD CONSTRAINT harvests_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;


--
-- Name: harvests harvests_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvests
    ADD CONSTRAINT harvests_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id) ON DELETE CASCADE;


--
-- Name: raw_surveys raw_surveys_migrated_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_surveys
    ADD CONSTRAINT raw_surveys_migrated_feature_id_fkey FOREIGN KEY (migrated_feature_id) REFERENCES public.spatial_features(id) ON DELETE SET NULL;


--
-- Name: residents residents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residents
    ADD CONSTRAINT residents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

