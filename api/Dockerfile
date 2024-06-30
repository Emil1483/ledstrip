FROM python:3.11

WORKDIR /app

COPY api/requirements.txt api/requirements.txt
RUN sed -i '/pygame/d' requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY api api

CMD ["python", "api/app.py"]