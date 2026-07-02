export const content = {
  en: `# Time-Series Databases

## What Makes Time-Series Data Different

Time-series data has unique characteristics that make general-purpose databases inefficient for it:

\`\`\`
Characteristics:
  1. Append-only       — new data always has a newer timestamp, rarely updated
  2. High write rate   — millions of data points per second (IoT, metrics, trading)
  3. Time-ordered      — queries almost always include a time range filter
  4. High compression  — values change slowly (delta encoding is extremely effective)
  5. Retention         — old data expires (you rarely need 5-year-old CPU metrics)
  6. Downsampling      — recent data at 1s resolution, old data at 1min resolution

Typical query pattern:
  "Give me the average CPU usage per minute for the last 24 hours for host web-01"
  → NOT a point lookup, NOT a join — a time-windowed aggregation
\`\`\`

A general-purpose database handles these poorly:
\`\`\`
PostgreSQL storing 1M metrics/second:
  → Table grows by 86 billion rows per day
  → B-tree index updates become random I/O bottleneck
  → No built-in compression for repeating float values
  → No automatic downsampling or expiry
  → VACUUM can't keep up with dead tuple accumulation
\`\`\`

## InfluxDB Architecture

InfluxDB is the most widely deployed open-source time-series database. Version 1.x and 2.x use the **TSM (Time-Structured Merge Tree)** engine — a custom storage engine inspired by LSM trees but optimized for time-series patterns.

### Data Model

\`\`\`
InfluxDB line protocol:
  measurement,tag_key=tag_value field_key=field_value timestamp

Example:
  cpu,host=web-01,region=us-east usage_idle=87.3,usage_user=8.2 1704067200000000000
  │   │              │            │                               │
  │   └─ tags ───────┘            └─ fields ──────────────────    └─ nanosecond timestamp
  └─ measurement name

Concepts:
  Measurement: like a table name (cpu, memory, http_requests)
  Tags:        indexed metadata — host, region, service (string key=value)
  Fields:      actual measurements — usage_idle, bytes_used (typed values)
  Timestamp:   nanosecond precision Unix timestamp
\`\`\`

**Critical distinction: tags vs fields**
\`\`\`
Tags:
  - Indexed (inverted index)
  - Used in WHERE clauses and GROUP BY
  - String type only
  - Low cardinality (host names, regions, service names)
  - Stored once per series, not per data point

Fields:
  - NOT indexed
  - Contain actual measurements
  - Float64, int64, string, boolean
  - High cardinality OK (the actual values)
  - Stored for every data point

Series = unique combination of measurement + tag set
  cpu,host=web-01,region=us-east  → series 1
  cpu,host=web-02,region=us-east  → series 2
  cpu,host=web-01,region=us-west  → series 3
\`\`\`

High cardinality in tags is the #1 performance killer in InfluxDB:
\`\`\`
BAD:  cpu,request_id=abc123def456  ← unique per request = billions of series
GOOD: http_requests,host=web-01,status=200 ← bounded series count

High cardinality causes:
  - Series index grows unbounded in memory
  - Query planning becomes slow (must enumerate all matching series)
  - Write performance degrades (too many series to track)
\`\`\`

### TSM Engine — Time-Structured Merge Tree

\`\`\`
Write path:
  1. Write to WAL (write-ahead log) for durability
  2. Write to Cache (in-memory, sorted by series + timestamp)
  3. Return success

Background:
  4. Cache snapshot → flush to TSM file when cache exceeds threshold (25MB default)
  5. TSM files compacted periodically (levels 1-4)

Read path:
  1. Query Cache (most recent data)
  2. Query TSM files (older data)
  3. Merge results, apply aggregations
\`\`\`

### TSM File Format

\`\`\`
TSM File:
┌─────────────────────────────────┐
│  Header (magic number, version) │
├─────────────────────────────────┤
│  Blocks                         │  compressed time+value data
│  [ Block: series_1, t1-t1000 ]  │  up to 1000 values per block
│  [ Block: series_1, t1001-t2000]│
│  [ Block: series_2, t1-t1000 ]  │
│  ...                            │
├─────────────────────────────────┤
│  Index                          │  series key → block offsets
│  [ series_key | min_t | max_t   │
│    | offset | size | ... ]      │
├─────────────────────────────────┤
│  Footer (index offset)          │
└─────────────────────────────────┘
\`\`\`

Each block contains up to 1000 timestamps and values for one series. Blocks are compressed independently.

### Compression Algorithms

This is where TSDBs dramatically outperform general-purpose databases:

**Timestamp compression — Delta-of-Delta encoding:**
\`\`\`
Raw timestamps (nanoseconds):
  1704067200000000000
  1704067201000000000
  1704067202000000000
  1704067203000000000

Delta (difference between consecutive):
  1000000000, 1000000000, 1000000000

Delta-of-delta (difference between deltas):
  0, 0, 0  ← all zeros for perfectly regular intervals!

Gorilla paper (Facebook, 2015): regular timestamps compress to ~1.37 bits/timestamp
vs 64 bits raw = 47x compression
\`\`\`

**Float compression — XOR encoding (Gorilla):**
\`\`\`
Observation: consecutive float values in time-series change slowly.
  87.3, 87.4, 87.2, 87.3, 87.5 — small changes

IEEE 754 double XOR between consecutive values:
  87.3 XOR 87.4 = only a few bits differ (same exponent, similar mantissa)
  
XOR result has:
  Leading zeros:  many (same sign bit, same exponent)
  Meaningful bits: few (only the changed bits)

Encoding:
  If XOR == 0 (value unchanged): store 1 bit "0"
  Else: store leading zeros count + meaningful bits

Facebook reported: float compression to ~1.37 bits/value on average
vs 64 bits raw = 47x compression

Combined: timestamps + values ≈ 12 bytes per data point
vs 16 bytes raw = 25% overhead for columnar binary
vs PostgreSQL row: ~100 bytes per data point (row overhead + indexes)
→ 8x storage reduction vs PostgreSQL
\`\`\`

### Retention Policies and Continuous Queries

\`\`\`sql
-- InfluxDB 1.x retention policy (auto-delete old data)
CREATE RETENTION POLICY "one_week" ON "metrics"
  DURATION 7d
  REPLICATION 1
  DEFAULT

CREATE RETENTION POLICY "one_year" ON "metrics"
  DURATION 52w
  REPLICATION 1

-- Continuous query: automatically downsample every minute
CREATE CONTINUOUS QUERY "downsample_cpu_1m" ON "metrics"
BEGIN
  SELECT mean(usage_idle) AS usage_idle,
         mean(usage_user) AS usage_user
  INTO "one_year"."cpu_1m"
  FROM "cpu"
  GROUP BY time(1m), host, region
END
\`\`\`

\`\`\`
Downsampling pipeline:
  Raw data (1s resolution) → retained 1 week
       ↓ continuous query aggregates every minute
  1m averages → retained 1 year
       ↓ continuous query aggregates every hour
  1h averages → retained 5 years

Storage savings: 60x (1s → 1m) × 60x (1m → 1h) = 3600x less storage for old data
\`\`\`

## TimescaleDB — PostgreSQL for Time-Series

TimescaleDB is a PostgreSQL extension that adds time-series optimizations while keeping full SQL compatibility. It automatically partitions tables into **chunks** by time.

\`\`\`sql
-- Create a hypertable (TimescaleDB's partitioned time-series table)
CREATE TABLE metrics (
  time        TIMESTAMPTZ NOT NULL,
  host        TEXT NOT NULL,
  cpu_usage   DOUBLE PRECISION,
  memory_bytes BIGINT
);

SELECT create_hypertable('metrics', 'time', chunk_time_interval => INTERVAL '1 day');

-- TimescaleDB automatically creates chunks:
-- _timescaledb_internal._hyper_1_1_chunk  (2024-01-01 to 2024-01-02)
-- _timescaledb_internal._hyper_1_2_chunk  (2024-01-02 to 2024-01-03)
-- etc.

-- Queries automatically route to relevant chunks (partition pruning)
EXPLAIN SELECT avg(cpu_usage) FROM metrics
WHERE time > now() - INTERVAL '1 hour'
  AND host = 'web-01';
-- Only scans today's chunk, not entire table history
\`\`\`

### Continuous Aggregates

\`\`\`sql
-- Materialized view that auto-refreshes
CREATE MATERIALIZED VIEW cpu_1m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 minute', time) AS bucket,
  host,
  avg(cpu_usage) AS avg_cpu,
  max(cpu_usage) AS max_cpu,
  min(cpu_usage) AS min_cpu
FROM metrics
GROUP BY bucket, host
WITH NO DATA;

-- Set refresh policy
SELECT add_continuous_aggregate_policy('cpu_1m',
  start_offset => INTERVAL '1 hour',
  end_offset   => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute'
);

-- Query the materialized view (fast, pre-aggregated)
SELECT bucket, host, avg_cpu
FROM cpu_1m
WHERE bucket > now() - INTERVAL '24 hours'
ORDER BY bucket DESC;
\`\`\`

### Compression in TimescaleDB

\`\`\`sql
-- Enable compression on old chunks
ALTER TABLE metrics SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'host',
  timescaledb.compress_orderby = 'time DESC'
);

-- Auto-compress chunks older than 7 days
SELECT add_compression_policy('metrics', INTERVAL '7 days');

-- Check compression ratio
SELECT
  chunk_name,
  pg_size_pretty(before_compression_total_bytes) AS before,
  pg_size_pretty(after_compression_total_bytes) AS after,
  round(compression_ratio::numeric, 2) AS ratio
FROM chunk_compression_stats('metrics');
-- Typical: 10-20x compression for time-series data
\`\`\`

TimescaleDB uses **columnar compression** within chunks — the same column-oriented approach as analytical databases, applied selectively to cold data.

## Prometheus — Pull-Based Metrics

Prometheus is a monitoring-focused TSDB with a unique **pull model** — it scrapes metrics from targets instead of receiving pushes.

\`\`\`
Architecture:
  Targets (app servers, databases, etc.)
    expose /metrics endpoint (Prometheus format)
  Prometheus server
    scrapes targets every 15s (configurable)
    stores in local TSDB
  Alertmanager
    receives alerts from Prometheus, routes notifications
  Grafana
    queries Prometheus, visualizes dashboards
\`\`\`

### Prometheus Storage (TSDB)

\`\`\`
Prometheus local storage:
  2-hour blocks in memory (head block)
  Compacted to disk blocks every 2 hours
  Each block: chunks/, index, tombstones, meta.json

Block structure:
  chunks/000001   ← compressed series data (XOR encoding, same as Gorilla)
  index           ← inverted index: label → series IDs + timestamps
  tombstones      ← deleted time ranges
  meta.json       ← block metadata (min/max time, stats)

Default retention: 15 days (configurable with --storage.tsdb.retention.time)
\`\`\`

### PromQL

\`\`\`promql
# Instant vector: current value
http_requests_total{job="api", status="200"}

# Range vector: values over time window
http_requests_total{job="api"}[5m]

# Rate (per-second rate over 5 minutes)
rate(http_requests_total{job="api", status="200"}[5m])

# Aggregation across instances
sum(rate(http_requests_total{status="200"}[5m])) by (job)

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)
/
sum(rate(http_requests_total[5m])) by (job)

# 99th percentile latency (from histogram)
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job)
)

# Predict disk full in 4 hours using linear regression
predict_linear(node_filesystem_free_bytes[1h], 4 * 3600) < 0
\`\`\`

### Prometheus Limitations

\`\`\`
Single server only (no built-in clustering)
  → Use Thanos or Cortex for multi-server setups

Not for long-term storage (15 days default)
  → Use remote_write to send to long-term storage (InfluxDB, Cortex, Thanos)

Approximate aggregations (counters can reset)
  → Always use rate() on counters, never raw values

Not for events (only for metrics)
  → Use Loki (log aggregation) for events
\`\`\`

## Choosing a Time-Series Database

\`\`\`
InfluxDB:
  ✓ High write throughput (millions of points/sec)
  ✓ Built-in retention and downsampling
  ✓ Good compression
  ✗ High cardinality kills performance
  ✗ InfluxQL/Flux learning curve
  Best for: IoT, infrastructure metrics, sensor data

TimescaleDB:
  ✓ Full SQL (joins, complex queries)
  ✓ PostgreSQL ecosystem (extensions, tools)
  ✓ Excellent compression on cold data
  ✗ More complex setup than InfluxDB
  ✗ Slightly lower raw write throughput than InfluxDB
  Best for: when you need SQL + time-series (financial, application metrics)

Prometheus:
  ✓ Standard for infrastructure monitoring
  ✓ Huge ecosystem (exporters for everything)
  ✓ Pull model simplifies service discovery
  ✗ Not for long-term storage
  ✗ Single server only
  Best for: monitoring and alerting (not analytics)

ClickHouse (as TSDB):
  ✓ Fastest analytical queries on time-series
  ✓ Petabyte scale
  ✓ SQL
  ✗ Complex setup
  ✗ Not optimized for high-frequency small writes
  Best for: analytics on time-series (not real-time monitoring)
\`\`\`
`,

  fr: `# Bases de données séries temporelles

## Ce qui rend les données de séries temporelles différentes

\`\`\`
Caractéristiques :
  1. Append-only       — les nouvelles données ont toujours un timestamp plus récent
  2. Taux d'écriture élevé — millions de points de données par seconde
  3. Ordonnées dans le temps — les requêtes incluent presque toujours un filtre de plage temporelle
  4. Haute compression  — les valeurs changent lentement (encodage delta très efficace)
  5. Rétention          — les vieilles données expirent
  6. Sous-échantillonnage — données récentes à 1s, vieilles données à 1min
\`\`\`

## Architecture InfluxDB

InfluxDB utilise le moteur **TSM (Time-Structured Merge Tree)** — inspiré des LSM trees mais optimisé pour les séries temporelles.

### Modèle de données

\`\`\`
Protocole de ligne InfluxDB :
  mesure,clé_tag=valeur_tag clé_champ=valeur_champ timestamp

Exemple :
  cpu,host=web-01,region=us-east usage_idle=87.3 1704067200000000000

Concepts :
  Mesure : comme un nom de table (cpu, mémoire)
  Tags :   métadonnées indexées — host, region (faible cardinalité)
  Champs : mesures réelles — usage_idle (haute cardinalité OK)
  Timestamp : précision nanoseconde
\`\`\`

**La haute cardinalité dans les tags est le principal tueur de performance dans InfluxDB :**
\`\`\`
MAUVAIS : cpu,request_id=abc123  ← unique par requête = milliards de séries
BON :     http_requests,host=web-01,status=200  ← nombre de séries borné
\`\`\`

### Algorithmes de compression

**Compression des timestamps — encodage Delta-de-Delta :**
\`\`\`
Timestamps bruts : 1704067200, 1704067201, 1704067202, 1704067203
Deltas : 1, 1, 1
Delta-de-delta : 0, 0, 0 ← tous zéros pour des intervalles parfaitement réguliers !

Article Gorilla (Facebook, 2015) : timestamps réguliers → ~1.37 bits/timestamp
vs 64 bits brut = compression 47x
\`\`\`

**Compression des flottants — encodage XOR (Gorilla) :**
\`\`\`
Observation : les valeurs float consécutives changent lentement.
  87.3, 87.4, 87.2 — petits changements

XOR de flottants IEEE 754 consécutifs :
  Nombreux zéros de tête (même exposant)
  Peu de bits significatifs (seulement les bits qui ont changé)

Facebook : compression float → ~1.37 bits/valeur en moyenne
vs 64 bits brut = compression 47x

Combiné : ~12 octets par point de données
vs PostgreSQL ligne : ~100 octets → réduction de stockage 8x
\`\`\`

### Politiques de rétention

\`\`\`sql
-- Politique de rétention (suppression automatique)
CREATE RETENTION POLICY "une_semaine" ON "metrics"
  DURATION 7d REPLICATION 1 DEFAULT

-- Requête continue : sous-échantillonnage automatique
CREATE CONTINUOUS QUERY "sous_echantillon_cpu_1m" ON "metrics"
BEGIN
  SELECT mean(usage_idle) AS usage_idle
  INTO "une_annee"."cpu_1m"
  FROM "cpu"
  GROUP BY time(1m), host
END
\`\`\`

## TimescaleDB — PostgreSQL pour les séries temporelles

\`\`\`sql
-- Créer une hypertable
SELECT create_hypertable('metrics', 'time', chunk_time_interval => INTERVAL '1 day');

-- Vue matérialisée qui se rafraîchit automatiquement
CREATE MATERIALIZED VIEW cpu_1m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 minute', time) AS bucket,
  host,
  avg(cpu_usage) AS avg_cpu
FROM metrics
GROUP BY bucket, host
WITH NO DATA;
\`\`\`

## Prometheus — Métriques basées sur le pull

Architecture unique : **modèle pull** — scrape les métriques des cibles au lieu de recevoir des push.

### PromQL

\`\`\`promql
# Taux (taux par seconde sur 5 minutes)
rate(http_requests_total{job="api", status="200"}[5m])

# Taux d'erreur
sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)
/
sum(rate(http_requests_total[5m])) by (job)

# Latence au 99e percentile
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job)
)

# Prédire si le disque sera plein dans 4 heures
predict_linear(node_filesystem_free_bytes[1h], 4 * 3600) < 0
\`\`\`

## Choisir une base de données de séries temporelles

\`\`\`
InfluxDB :
  ✓ Haut débit d'écriture (millions de points/sec)
  ✓ Rétention et sous-échantillonnage intégrés
  ✗ La haute cardinalité tue les performances
  Meilleur pour : IoT, métriques infrastructure, données capteurs

TimescaleDB :
  ✓ SQL complet (jointures, requêtes complexes)
  ✓ Écosystème PostgreSQL
  ✗ Débit d'écriture brut légèrement inférieur à InfluxDB
  Meilleur pour : quand vous avez besoin de SQL + séries temporelles

Prometheus :
  ✓ Standard pour la surveillance infrastructure
  ✓ Modèle pull simplifie la découverte de services
  ✗ Pas pour le stockage à long terme
  Meilleur pour : surveillance et alertes
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "Why is high cardinality in InfluxDB tags — like storing a unique request_id per data point — a critical performance problem?",
      options: [
        "InfluxDB has a hard limit of 1 million unique tag values",
        "High cardinality tags create a new series per unique tag combination — the series index grows unbounded in memory, query planning must enumerate all matching series, and write performance degrades as the system tracks billions of series",
        "High cardinality tags cause data compression to fail",
        "InfluxDB stores tags as JSON which becomes slow to parse at high cardinality"
      ],
      correct: 1,
    },
    {
      question: "How does delta-of-delta timestamp encoding achieve 47x compression for regular time-series data?",
      options: [
        "It removes duplicate timestamps from the data",
        "It stores only every 47th timestamp and interpolates the rest",
        "For perfectly regular intervals the delta between consecutive timestamps is constant, making the delta-of-delta zero — runs of zeros compress to almost nothing",
        "It converts nanosecond timestamps to second precision before storing"
      ],
      correct: 2,
    },
    {
      question: "What is the fundamental difference between InfluxDB's TSM engine and TimescaleDB's approach to time-series storage?",
      options: [
        "TSM uses LSM trees while TimescaleDB uses B-trees exclusively",
        "TSM is a purpose-built engine with custom compression and series-aware storage; TimescaleDB extends PostgreSQL with automatic time-based partitioning into chunks while keeping standard B-tree storage and adding columnar compression for cold data",
        "TSM stores data in memory only; TimescaleDB stores data on disk",
        "TSM supports SQL while TimescaleDB uses a custom query language"
      ],
      correct: 1,
    },
    {
      question: "Why should you always use rate() instead of raw counter values in Prometheus?",
      options: [
        "Raw counter values are stored as strings and cannot be used in calculations",
        "Prometheus counters reset to zero when a process restarts — rate() correctly handles resets by detecting them and calculating the rate across the reset boundary",
        "rate() applies automatic smoothing that reduces noise in metrics",
        "Raw counters in Prometheus have a maximum value of 2^32 after which they stop incrementing"
      ],
      correct: 1,
    },
    {
      question: "What is the key advantage of Gorilla XOR float compression for time-series data?",
      options: [
        "XOR compression works on integers but not floats — the question contains an error",
        "Consecutive float values in time-series data change slowly — their IEEE 754 XOR has many leading zero bits (same exponent, similar mantissa), allowing the meaningful changed bits to be stored with minimal overhead",
        "XOR compression is lossless only for values below 1000.0",
        "Gorilla compression works by rounding floats to 2 decimal places before storing"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi la haute cardinalité dans les tags InfluxDB — comme stocker un request_id unique par point de données — est-elle un problème critique de performance ?",
      options: [
        "InfluxDB a une limite stricte de 1 million de valeurs de tag uniques",
        "Les tags à haute cardinalité créent une nouvelle série par combinaison unique de tags — l'index des séries grandit sans limite en mémoire, la planification des requêtes doit énumérer toutes les séries correspondantes, et les performances d'écriture se dégradent",
        "Les tags à haute cardinalité font échouer la compression des données",
        "InfluxDB stocke les tags en JSON qui devient lent à analyser à haute cardinalité"
      ],
      correct: 1,
    },
    {
      question: "Comment l'encodage delta-de-delta des timestamps atteint-il une compression 47x pour les données de séries temporelles régulières ?",
      options: [
        "Il supprime les timestamps dupliqués des données",
        "Il ne stocke qu'un timestamp tous les 47 et interpole le reste",
        "Pour des intervalles parfaitement réguliers, le delta entre timestamps consécutifs est constant, rendant le delta-de-delta zéro — les séries de zéros se compressent en presque rien",
        "Il convertit les timestamps en nanosecondes à la précision seconde avant stockage"
      ],
      correct: 2,
    },
    {
      question: "Quelle est la différence fondamentale entre le moteur TSM d'InfluxDB et l'approche de TimescaleDB pour le stockage de séries temporelles ?",
      options: [
        "TSM utilise des LSM trees tandis que TimescaleDB utilise exclusivement des B-trees",
        "TSM est un moteur dédié avec compression personnalisée ; TimescaleDB étend PostgreSQL avec un partitionnement automatique basé sur le temps en chunks tout en gardant le stockage B-tree standard et en ajoutant une compression en colonnes pour les données froides",
        "TSM stocke les données en mémoire uniquement ; TimescaleDB sur disque",
        "TSM supporte SQL tandis que TimescaleDB utilise un langage de requête personnalisé"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi devriez-vous toujours utiliser rate() plutôt que les valeurs brutes de compteur dans Prometheus ?",
      options: [
        "Les valeurs brutes de compteur sont stockées comme des chaînes et ne peuvent pas être utilisées dans des calculs",
        "Les compteurs Prometheus se réinitialisent à zéro quand un processus redémarre — rate() gère correctement les réinitialisations en les détectant et en calculant le taux à travers la frontière de réinitialisation",
        "rate() applique un lissage automatique qui réduit le bruit dans les métriques",
        "Les compteurs bruts dans Prometheus ont une valeur maximale de 2^32 après laquelle ils cessent de s'incrémenter"
      ],
      correct: 1,
    },
    {
      question: "Quel est l'avantage clé de la compression XOR de Gorilla pour les données de séries temporelles ?",
      options: [
        "La compression XOR fonctionne sur les entiers mais pas les flottants",
        "Les valeurs float consécutives dans les données de séries temporelles changent lentement — leur XOR IEEE 754 a de nombreux bits zéro de tête (même exposant, mantisse similaire), permettant de stocker les bits significatifs changés avec un overhead minimal",
        "La compression XOR est sans perte uniquement pour les valeurs inférieures à 1000.0",
        "La compression Gorilla arrondit les flottants à 2 décimales avant stockage"
      ],
      correct: 1,
    },
  ],
};
