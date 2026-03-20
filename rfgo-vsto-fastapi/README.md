# RFGo PhotoKey rfgo-vsto-fastapi

FastAPI rfgo-vsto-fastapi for managing semiconductor photo-key data.

## Requirements
- Docker & Docker Compose
- Python 3.14+ (or any 3.9+ with `uv`)

## Setup & Run

1. **Start Database**
   ```bash
   docker-compose up -d
   ```

2. **Install Dependencies**
   ```bash
   cd rfgo-vsto-fastapi
   uv sync
   ```

3. **Run API Server**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

## API Endpoints
- `POST /api/v1/upload`: Upload parsed Excel data.
- `GET /api/v1/products`: List products and their saved keys.
- `GET /api/v1/restore/{key_id}`: Get workbook data for Excel restoration.

