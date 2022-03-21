# docker-entrypoint.sh for node.js
# 서버를 시작하기 전에 db가 준비될 때 까지 20초의 텀을 가진다.
# dockerize는 도커 컨테이너의 실행순서를 결정해줄 수 있는 프로그램
echo "wait db server"
dockerize -wait tcp://db:8900 -timeout 20s

echo "start node server"
nodemon index.js