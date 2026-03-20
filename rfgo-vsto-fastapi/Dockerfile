# Multi-stage build for FastAPI using standard Python
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app

# Install build dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtualenv to keep dependencies isolated
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy dependency files
# Note: Since the project uses uv (pyproject.toml/uv.lock), 
# we can use pip to install from pyproject.toml if compatible, 
# or copy a generated requirements.txt
COPY pyproject.toml ./
# If uv.lock is present but we want standard pip:
# We'll install the project dependencies. 
# For safety in standard python images, we'll use pip install.
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir . || pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary pydantic-settings python-dotenv

# Final Stage
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy the application code
COPY . .

EXPOSE 8000

# Start with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
