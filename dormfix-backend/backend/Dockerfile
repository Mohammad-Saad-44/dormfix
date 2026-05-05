FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install flask flask-cors flask-jwt-extended psycopg2-binary bcrypt

EXPOSE 5000

CMD ["python", "app.py"]