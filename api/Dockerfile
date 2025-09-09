FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgpiod-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install gpiod

COPY api/requirements.txt api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api api

ENV PYTHONPATH=/app

CMD ["python", "api/app.py"]