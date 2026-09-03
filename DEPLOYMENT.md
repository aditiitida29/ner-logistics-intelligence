# Cloud Deployment & Architecture Guide
## NER Logistics Intelligence — AI-Powered Accessibility & Logistics Platform for North Eastern Region

---

## 1. Executive Cloud Architecture

The **NER Logistics Intelligence Platform** is built using a **Cloud-First, Offline-First, AI-First, GIS-First, and Security-First** paradigm. While the hackathon MVP operates locally using SQLite, FastAPI, and React, the system is architected for zero-friction horizontal scaling and deployment on major cloud service providers (**AWS, Microsoft Azure, Google Cloud Platform**).

```
+------------------------------------------------------------------------+
¦                        GOVERNMENT & PUBLIC USERS                       ¦
¦    Web Dashboard (Desktop/Tablet)        Field PWA (Mobile/Low Bandwidth)¦
+------------------------------------------------------------------------+
                                    ¦ HTTPS (TLS 1.3)
                                    ?
+------------------------------------------------------------------------+
¦                         GLOBAL CDN & EDGE CACHE                        ¦
¦      AWS CloudFront / Azure Front Door / Google Cloud CDN              ¦
¦       • Static React PWA assets                                        ¦
¦       • Cached regional Vector & Raster Map Tiles (mbtiles / PMTiles)  ¦
+------------------------------------------------------------------------+
                                    ¦
                                    ?
+------------------------------------------------------------------------+
¦                          API GATEWAY & WAF                             ¦
¦     AWS API Gateway / Azure API Mgmt / GCP Cloud Armor + API Gateway   ¦
¦       • DDoS Protection, Rate Limiting & Geo-fencing                   ¦
¦       • JWT Authentication & RBAC Policy Enforcement                   ¦
+------------------------------------------------------------------------+
                                    ¦
                +---------------------------------------+
                ?                                       ?
+-------------------------------+       +--------------------------------+
¦      FASTAPI REST CLUSTER     ¦       ¦       AI ROUTING WORKERS       ¦
¦ AWS ECS Fargate / Azure Apps  ¦       ¦ Celery / Redis / Ray Workers   ¦
¦ Google Cloud Run (Autoscale)  ¦?-----?¦ Multi-factor Route-Risk Engine ¦
¦ • Fleet Telemetry & GPS Ingest¦       ¦ Weather Disruption Predictions ¦
¦ • Incident Lifecycle & Alerts ¦       ¦ Emergency Corridor Optimization¦
+-------------------------------+       +--------------------------------+
                ¦
    +-----------------------------------------------+
    ?                       ?                       ?
+------------------+  +--------------------+  +---------------------------+
¦ MANAGED POSTGRES ¦  ¦ SECURE OBJECT STORE¦  ¦ TELEMETRY / CACHE STORE   ¦
¦   + POSTGIS      ¦  ¦ S3 / Azure Blob /  ¦  ¦ AWS ElastiCache / Redis   ¦
¦ AWS RDS / Aurora ¦  ¦ Google Cloud Store ¦  ¦ • Live GPS vehicle cache  ¦
¦ Azure Flexible   ¦  ¦ • Incident photos  ¦  ¦ • Real-time alerts queue  ¦
¦ GCP Cloud SQL    ¦  ¦ • Vector map tiles ¦  ¦ • Rate-limit tokens       ¦
+------------------+  +--------------------+  +---------------------------+
```

---

## 2. Database Migration Strategy: SQLite to PostgreSQL + PostGIS

The hackathon MVP uses SQLite with SQLAlchemy ORM. In production, this transitions to **PostgreSQL 16+ with the PostGIS 3+ spatial extension**.

### Migration Steps:
1. **Enable PostGIS in Target Cloud Database**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Database Driver Update**:
   Update `backend/requirements.txt`:
   ```txt
   psycopg2-binary==2.9.9
   geoalchemy2==0.14.2
   ```

3. **Update Connection String in Environment**:
   ```bash
   DATABASE_URL=postgresql://ner_admin:<DB_PASSWORD>@db.internal.nerlogistics.gov.in:5432/ner_logistics
   ```

4. **Spatial Geometry Migration**:
   In `backend/app/models/models.py`, replace numeric `latitude` and `longitude` fields with native PostGIS spatial points:
   ```python
   # SQLite MVP
   # latitude = Column(Float)
   # longitude = Column(Float)

   # Production PostGIS
   from geoalchemy2 import Geometry
   geom = Column(Geometry(geometry_type='POINT', srid=4326), index=True)
   corridor_geom = Column(Geometry(geometry_type='LINESTRING', srid=4326))
   ```

5. **Alembic Automated Migrations**:
   Run schema migrations using Alembic:
   ```bash
   alembic init alembic
   alembic revision --autogenerate -m "Migrate to PostGIS schemas"
   alembic upgrade head
   ```

---

## 3. Database Security & Encryption at Rest

In accordance with Government of India Cybersecurity Guidelines (CERT-In) and National Data Governance Policy:

1. **Encryption at Rest**:
   - **AWS RDS**: Enable KMS encryption using a Customer Managed Key (CMK) with AES-256 (`aws/rds`).
   - **Azure PostgreSQL Flexible Server**: Enable Customer-Managed Key (CMK) with Azure Key Vault.
   - **GCP Cloud SQL**: Enable Customer-Managed Encryption Keys (CMEK) backed by Google Cloud KMS.

2. **Encryption in Transit**:
   - Mandate `sslmode=require` or `sslmode=verify-full` on all backend database connection pools.
   - Mandate TLS 1.3 for all client-facing and internal microservice communications.

3. **Row-Level Security (RLS)**:
   - For multi-state segregation, activate PostgreSQL Row-Level Security (RLS) policies so State Admins can only view and mutate records corresponding to their assigned state jurisdiction (`state = current_setting('app.current_state')`).

---

## 4. Multi-Cloud Deployment Blueprints

### Blueprint A: Amazon Web Services (AWS)
- **Frontend PWA**: Hosted on AWS S3, delivered via **Amazon CloudFront** edge distribution with custom SSL certificate from AWS ACM.
- **Backend API**: Packaged into Docker container, deployed on **AWS ECS Fargate** behind an Application Load Balancer (ALB).
- **Database**: **Amazon RDS for PostgreSQL** (Multi-AZ deployment for 99.99% availability) with PostGIS extension.
- **Object Storage**: **Amazon S3** bucket (`ner-incident-evidence`) with SSE-S3 / SSE-KMS encryption and public read blocked.
- **Monitoring & Observability**: **Amazon CloudWatch** Container Insights, metric alarms for route latency, and AWS X-Ray for distributed tracing.

### Blueprint B: Google Cloud Platform (GCP)
- **Frontend PWA**: Deployed to **Cloud Storage** bucket backed by **Cloud CDN**.
- **Backend API**: Serverless container execution on **Google Cloud Run** (min instances: 2, max: 50, autoscaling based on concurrent request load).
- **Database**: **Cloud SQL for PostgreSQL** with Private Service Connect (PSC) within a dedicated VPC.
- **Object Storage**: **Google Cloud Storage (GCS)** bucket with fine-grained IAM access control and Uniform Bucket-Level Access.
- **Monitoring & Logging**: **Google Cloud Operations Suite (formerly Stackdriver)** with structured JSON logging and alerting policies.

### Blueprint C: Microsoft Azure
- **Frontend PWA**: Deployed via **Azure Static Web Apps** with integrated CDN.
- **Backend API**: Deployed on **Azure Container Apps** (ACA) with Dapr sidecars.
- **Database**: **Azure Database for PostgreSQL Flexible Server**.
- **Object Storage**: **Azure Blob Storage** (Hot tier) with Private Endpoint.
- **Monitoring**: **Azure Application Insights** and Log Analytics Workspace.

---

## 5. Offline Maps & Regional Map Tile Architecture

To prevent system failure in remote valleys of Arunachal Pradesh, Nagaland, and Mizoram with no mobile connectivity:

1. **PWA Map Caching**:
   - The React Leaflet frontend leverages the Service Worker (`public/sw.js`) and Cache Storage API to cache OpenStreetMap raster tiles previously inspected by the user.

2. **Production Offline Vector Tiles (PMTiles / MBTiles)**:
   - In production, pre-packaged regional map bundles of the 8 NER states are generated using **Protomaps / PMTiles** format (typically ~80MB per state).
   - Field Officers and Drivers can trigger a one-tap download ("Download Offline Map for Arunachal Pradesh") during terminal dispatch.
   - The PWA stores these tiles inside IndexedDB using a service worker interceptor, allowing full zoom levels (0 to 15) even in airplane mode.

---

## 6. Docker Containerization Specification

### Backend `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend `Dockerfile`:
```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Web Server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./ner_logistics.db
      - JWT_SECRET_KEY=ner_super_secret_production_key_2026_gov_in
      - ENVIRONMENT=production
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 7. Zero-Trust Security & Operational Compliance

1. **Input Validation**: All payloads validated with Pydantic schemas; strict MIME-type and byte validation for image uploads.
2. **Secrets Management**: No credentials or private keys in source code; injection via cloud secret managers (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager).
3. **Audit Trails**: All incident submissions, route re-evaluations, and delivery status updates logged with timestamp, user ID, IP address, and cryptographic integrity hashes.
