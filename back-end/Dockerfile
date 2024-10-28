FROM python:3.12-alpine3.20

WORKDIR /app

RUN apk add --no-cache npm gcc
RUN apk add --no-cache musl-dev

COPY requirements.txt .

RUN pip install -r requirements.txt

ENV PYTHONUNBUFFERED=1
RUN npm install -g nodemon

ENV REDIS_URL=redis://redis/0

CMD granian --interface asgi main:app --reload --host 0.0.0.0 --port 8030