# Cloud Deployment & Multi-Cloud Architecture Guide
## AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)

---

## 1. Architecture Overview

The **NER Logistics Intelligence Platform** is architected according to modern enterprise cloud and offline-first standards:

```
                  +-------------------------------------------------------+
                  |               CloudFlare / Cloud CDN                 |
                  |           (DDoS Protection, Edge SSL Termination)     |
                  +---------------------------+---------------------------+
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
         +---------v-----------+                               +---------v-----------+
         |   Vite + React PWA  |                               |    FastAPI Python   |
         |  Static Web Hosting |                               |  Container Service  |
         | (S3 / GCS / Storage)|                               | (ECS / Cloud Run /  |
         |  Service Worker +   |                               |  Container Apps)    |
         |  IndexedDB Offline  |                               +----------+----------+
         +---------------------+                                          |
                                                                          |
                                      +-----------------------------------+-----------------------------------+
                                      |                                                                       |
                            +---------v-----------+                                                 +---------v-----------+
                            | Managed PostgreSQL  |                                                 | Cloud Object Store  |
                            |      + PostGIS      |                                                 |  (S3 / GCS / Blob)  |
                            | (RDS / Cloud SQL)   |                                                 | (Encrypted Photos)  |
                            +---------------------+                                                 +---------------------+
```

---

## 2. Multi-Cloud Deployment Options

### Option A: Amazon Web Services (AWS)
* **Frontend:** Amazon S3 static website bucket fronted by Amazon CloudFront CDN with TLS 1.3.
* **Backend API:** AWS Elastic Container Service (ECS) with AWS Fargate (serverless containers) behind an Application Load Balancer (ALB).
* **Database:** Amazon RDS for PostgreSQL (Multi-AZ) with PostGIS extension enabled and KMS AES-256 storage encryption.
* **Media & Photos:** Amazon S3 bucket with server-side SSE-KMS encryption and pre-signed URLs.

### Option B: Google Cloud Platform (GCP)
* **Frontend:** Cloud Storage bucket with Cloud CDN and HTTPS Load Balancing.
* **Backend API:** Cloud Run (serverless autoscaling container runtime).
* **Database:** Cloud SQL for PostgreSQL with PostGIS extension, customer-managed encryption keys (CMEK), and high availability.
* **Media & Photos:** Google Cloud Storage (GCS) Standard bucket with CMEK.

### Option C: Microsoft Azure
* **Frontend:** Azure Static Web Apps or Azure Blob Storage Static Web Hosting with Azure Front Door.
* **Backend API:** Azure Container Apps or Azure App Service for Linux Containers.
* **Database:** Azure Database for PostgreSQL Flexible Server with PostGIS extension and storage encryption.
* **Media & Photos:** Azure Blob Storage with customer-managed keys (CMK).

---

## 3. Database Migration: SQLite to PostgreSQL + PostGIS

The development environment uses SQLite (`ner_logistics.db`). In production, execute the following PostGIS schema migration:

### 3.1 PostgreSQL + PostGIS Initialization Script
```sql
-- Enable PostGIS extension for spatial queries and geofencing
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & RBAC
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Districts & Geographies
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326),
    accessibility_score DOUBLE PRECISION DEFAULT 80.0,
    risk_score DOUBLE PRECISION DEFAULT 20.0,
    incident_count INTEGER DEFAULT 0,
    vehicle_count INTEGER DEFAULT 0,
    connectivity_level VARCHAR(50) DEFAULT 'High',
    weather_summary VARCHAR(100) DEFAULT 'Clear',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_districts_geom ON districts USING GIST (location);

-- Incidents & Field Disruptions
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(30) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326),
    location_name VARCHAR(150) NOT NULL,
    reported_by VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255),
    status VARCHAR(30) DEFAULT 'Active',
    estimated_restoration VARCHAR(50) DEFAULT '4 Hours',
    district_name VARCHAR(100),
    sync_status VARCHAR(50) DEFAULT 'Synced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_incidents_geom ON incidents USING GIST (location);

-- Vehicles & Telemetry
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(30) UNIQUE NOT NULL,
    driver VARCHAR(100) NOT NULL,
    driver_contact VARCHAR(30) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326),
    speed DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'Moving',
    eta VARCHAR(50) DEFAULT 'On Schedule',
    current_corridor VARCHAR(100),
    heading DOUBLE PRECISION DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vehicles_geom ON vehicles USING GIST (location);

-- Deliveries & Missions
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    delivery_code VARCHAR(50) UNIQUE NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(30),
    driver VARCHAR(100),
    priority VARCHAR(30) DEFAULT 'Normal',
    status VARCHAR(30) DEFAULT 'In Transit',
    eta VARCHAR(50) NOT NULL,
    risk_score DOUBLE PRECISION DEFAULT 20.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Corridors & Strategic Routes
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    estimated_time_mins INTEGER NOT NULL,
    risk_score DOUBLE PRECISION DEFAULT 20.0,
    accessibility_score DOUBLE PRECISION DEFAULT 80.0,
    status VARCHAR(30) DEFAULT 'Accessible',
    is_emergency_corridor BOOLEAN DEFAULT FALSE,
    waypoints JSONB NOT NULL,
    corridor_geom GEOMETRY(LineString, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_routes_geom ON routes USING GIST (corridor_geom);

-- System Alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(30) NOT NULL,
    location VARCHAR(150) NOT NULL,
    related_type VARCHAR(50),
    related_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to keep PostGIS points synced with lat/lng
CREATE OR REPLACE FUNCTION update_geom_point() RETURNS trigger AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_districts_geom BEFORE INSERT OR UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_geom_point();
CREATE TRIGGER trg_incidents_geom BEFORE INSERT OR UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_geom_point();
CREATE TRIGGER trg_vehicles_geom BEFORE INSERT OR UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_geom_point();
```

---

## 4. Environment Variables Configuration

Create a `.env` file in the backend root directory (see `.env.example`):
```ini
# Production Environment
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=change-this-to-a-very-long-random-32-byte-hex-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (PostgreSQL with PostGIS)
DATABASE_URL=postgresql://ner_admin:YourStrongPassword123@db.nerlogistics.internal:5432/ner_logistics_db

# Cloud Object Storage for Incident Photos
STORAGE_PROVIDER=aws_s3 # aws_s3 | gcs | azure_blob | local
S3_BUCKET_NAME=ner-logistics-incident-media-prod
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# CORS Allowed Origins
CORS_ORIGINS=https://nerlogistics.gov.in,https://app.nerlogistics.gov.in
```

---

## 5. Containerization with Docker

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (`docker-compose.prod.yml`)
```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.3-alpine
    restart: always
    environment:
      POSTGRES_DB: ner_logistics_db
      POSTGRES_USER: ner_admin
      POSTGRES_PASSWORD: SecretPostgresPassword123!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - DATABASE_URL=postgresql://ner_admin:SecretPostgresPassword123!@db:5432/ner_logistics_db
      - ENVIRONMENT=production
      - SECRET_KEY=prod-secret-key-32-byte-hex-value-sample
    depends_on:
      - db
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 6. Security Hardening & Compliance

1. **Encryption at Rest:** 
   - Managed DB disk volumes encrypted with AWS KMS / GCP Cloud KMS / Azure Key Vault (AES-256).
   - Sensitive columns (tokens, driver contact PII) hashed or encrypted.
2. **Encryption in Transit:**
   - Enforce HTTPS / TLS 1.3 across all client-to-server and inter-service communications.
   - HSTS header (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
3. **Role-Based Access Control (RBAC):**
   - 5 strictly separated roles (`super_admin`, `state_admin`, `field_officer`, `logistics_operator`, `driver`).
   - Token validation on every mutating endpoint with department and role checks.
4. **Resilience & Fault Tolerance:**
   - Multi-AZ database deployment with automatic failover.
   - PWA Service Worker offline caching ensures zero user-facing downtime during hill terrain signal outages.
