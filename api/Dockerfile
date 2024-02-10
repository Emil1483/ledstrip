FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN sed -i '/pygame/d' requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]