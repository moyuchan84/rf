# Multi-stage build for FastAPI using standard Python
FROM python:3.12-slim-bookworm AS builder

# [Offline Build Support] Optional: Pass internal PIP index
ARG PIP_INDEX_URL
ARG PIP_TRUSTED_HOST

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml ./

# Upgrade pip and install with mirror support if provided
RUN pip install --no-cache-dir --upgrade pip && \
    if [ -n "$PIP_INDEX_URL" ]; then \
        pip install --no-cache-dir --index-url $PIP_INDEX_URL --trusted-host $PIP_TRUSTED_HOST . || \
        pip install --no-cache-dir --index-url $PIP_INDEX_URL --trusted-host $PIP_TRUSTED_HOST fastapi uvicorn sqlalchemy psycopg2-binary pydantic-settings python-dotenv; \
    else \
        pip install --no-cache-dir . || \
        pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary pydantic-settings python-dotenv; \
    fi

# Final Stage
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy the application code
COPY . .
# [HTTPS Support] Copy internal certificates
COPY certs ./certs

EXPOSE 8000

# Start with uvicorn - using shell to allow optional SSL flags
CMD ["sh", "-c", "if [ -f certs/private.key ] && [ -f certs/public.crt ]; then \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile certs/private.key --ssl-certfile certs/public.crt; \
    else \
    uvicorn app.main:app --host 0.0.0.0 --port 8000; \
    fi"]
