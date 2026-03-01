FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./

ENV UV_PYTHON_PREFERENCE=only-system

RUN apt-get update && apt-get install -y --no-install-recommends \
    procps \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN uv sync --frozen --no-dev

COPY . .

CMD ["uv", "run", "agent.py", "start"]
