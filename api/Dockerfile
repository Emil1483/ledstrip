FROM python:3.11

WORKDIR /app

COPY api/requirements.txt api/requirements.txt
RUN sed -i '/pygame/d' api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api api

ENV PYTHONPATH=/app

CMD ["python", "api/app.py"]