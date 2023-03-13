# chess-engine-exp

1. Собрать Docker образ:

docker build -t chess-engine-exp .

2. Запустить контейнер из собранного образа:

docker run -d -p 6000:6000 chess-engine-exp

или

docker run -dp 6000:6000 chess-engine-exp

Где -d позволяет запустить контейнер в фоновом режиме, -p определяет порт, который будет использоваться в контейнере и на машине хоста, а chess-engine-exp это имя собранного Docker образа.