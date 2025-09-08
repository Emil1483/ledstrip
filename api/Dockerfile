FROM python:3.11

WORKDIR /app

RUN apt-get install -y python3-libgpiod

COPY api/requirements.txt api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api api

ENV PYTHONPATH=/app

CMD ["python", "api/app.py"]