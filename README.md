# Nemo-with-me-BE

</br>

<img width="100%" src="https://user-images.githubusercontent.com/48178101/162206566-f759b7de-5cfa-4b33-81e5-7794c093bbee.png">

<h3 align='center'> 🙆 무엇이든 함께 할 수 있는 실시간 화상 채팅 🙆‍♂️ </h3>
  
</br>

## 🛠 기술스택
<p align='center'>
  <img src='https://img.shields.io/badge/Node-v16.13.1-339933?logo=Node.js'/>
  <img src='https://img.shields.io/badge/NPM-CB3837?logo=npm'/>
  <img src='https://img.shields.io/badge/socket.io-v4.4.1-white?logo=Socket.io'/>
  <img src="https://img.shields.io/badge/Express-v4.17.3-009688?logo=Express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-v8.0.23-4479a1?logo=MySQL&logoColor=white" />
  <img src="https://img.shields.io/badge/Sequelize-v6.17.0-52b0e7?logo=Sequelize&logoColor=white" />
  </br>
  <img src="https://img.shields.io/badge/MongoDB-v5.0.6-47A248?logo=MongoDB&logoColor=white" />
  <img src="https://img.shields.io/badge/Passport-v0.5.2-34E27A?logo=Passport&logoColor=white" />
  <img src="https://img.shields.io/badge/Json Web Token-v8.5.1-8a8a8a?logo=JSON Web Tokens&logoColor=white" />
  </br></br>
  Deploy
  </br></br>
  <img src="https://img.shields.io/badge/Git hub-000000?logo=Github&logoColor=white" />
  <img src="https://img.shields.io/badge/Travis CI-3EAAAF?logo=Travis CI&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=Docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Amazon Elastic Beanstalk-232F3E?logo=Amazon AWS&logoColor=white" />
  <img src="https://img.shields.io/badge/Amazon Certificate Manager-232F3E?logo=Amazon AWS&logoColor=white" />
</p>

</br>

## 📌 바로가기

- <a href="https://nemowithme.com"> 🟪 with me </a></br>
- <a href="https://github.com/Square-with-me"> 🟪 Team Repo </a></br>

</br>

## 🔎 주요 기능

<details>
  <summary>⏱ 공용 타이머</summary> </br>
  
  - 시간 제한을 필요로 하는 작업을 할 때 사용자들이 함께 정한 시간 동안 집중할 수 있도록 공용 타이머 기능을 구현했습니다. 
  - 시간 제한을 필요로 하는 작업의 예: 스터디, 운동, 스케치, 마피아 게임 등 </br>
  </br>

  ![타이머](https://user-images.githubusercontent.com/77830226/161819311-b0cc09c7-7dcb-44ed-9f91-32509c4af994.gif)  
</details>

<details>
  <summary>👥 실시간 화상 채팅</summary> </br>
  
  - 마이크 on/off , 카메라 on/off 기능을 통해 화상채팅 사용자들이 자율적으로 선택해 사용할 수 있으며, 이모티콘을 눌러 간단한 감정 표현도 주고받을 수 있습니다. 
  </br>

  ![채팅 이모티콘](https://user-images.githubusercontent.com/77830226/161819289-32fbe0fc-566d-4983-a0e0-feaa78456a01.gif) 
</details>

<details>
  <summary>📊 기록 그래프</summary> </br>
  
  - 사용자가 🟪 with me 에서 얼마만큼 활동했는지 시각적으로 볼 수 있도록 마이페이지를 그래프 형태로 표현했습니다.
  - 오늘과 이번 주 참여 기록에서는 카테고리별 참여 기록을, 이번 달 참여 기록에서는 하루 총 참여 시간을 확인할 수 있습니다.
  - 뱃지를 함께 볼 수 있도록 구성해 사용자가 서비스를 이용하며 성취감을 느낄 수 있도록 하고 원하는 대표 뱃지를 설정해 다른 참여자에게 보여줄 수 있도록 구현했습니다.
  </br>
  
  ![마이페이지 기록](https://user-images.githubusercontent.com/77830226/161819359-b1ba80bc-4765-4c58-ae5b-61408d768299.gif)
</details>

</br>

## How to use
```
1. fork & clone
2. npm install
3. create .env
4. create MySQL DB: npx sequelize db:create
5. npm run dev
6. create seeds: npx sequelize db:seed:all
```

## Architecture
![architecture-BE](https://user-images.githubusercontent.com/48178101/161919048-e18c46fc-fb15-4362-b747-eca052ebaa2c.png)

</br>

## ERD
![ERD](https://user-images.githubusercontent.com/48178101/162151638-892fe55b-e63e-4b87-be4d-370ace7dc677.png)

</br>

## Contributors
|name|position|github|
|------|---|---|
|장현광|Node.js|https://github.com/Hyeon-Gwang|
|장창훈|Node.js|https://github.com/Hoon333|
|황성원|Node.js|https://github.com/Magiof|

</br>

## Feature
1. `Node.js & Express`를 이용한 웹 애플리케이션 서버
2. 유저, 방 정보, 뱃지, 카테고리 등 테이블간의 관계를 기반으로 `MySQL` 선택, `Sequelize ORM` 사용
3. 유저 참여 기록과 이용 로그를 `MongoDB`로 분리, `mongoose ODM` 사용
4. `JWT`를 이용한 로그인 인증
5. 클라리언트와 webRTC stream, 메시지, 타이머 정보 교환 등을 위해 `socket` 이용
6. 최근 일주일, 한달간 유저의 총 참여 시간을 분 단위로 기록
7. Travis CI - Docker - AWS Elastic Beanstalk으로 이어지는 `CI/CD 파이프라인`
8. `AWS RDS와 Atlas`를 이용하여 데이터베이스 분리
9. 비즈니스 로직을 Controller로 분리 & Controller에 한해 `Typescript` 적용

</br>

## 트러블 슈팅 & 기술적 도전
#### - MySQL과 MongoDB 분리
1. 도입 이유: 초기에는 유저의 총 참여 시간을 MySQL에 기록하였습니다. 하지만 MySQL로 한 유저당 일주일간 6개의 카테고리별 기록과 한 달 31일간의 데이터를 기록한다는 것이 특별한 메리트가 없다는 생각과 함께 입, 퇴장 시간을 로그로 남겨 놓으면 추후에 이 데이터를 활용할 수 있을 것이라고 판단이 들어 분리하였습니다.
2. 한계: 쿼리 성능 테스트를 통해 성능 비교를 해 볼 생각이었지만, 성능 비교까지는 나아가지 못했습니다.
3. 배운 점: 추후에 테스를 할 것을 고려하기보다 먼저 성능 비교를 해보고 확실한 근거를 찾아 적용하는 것이 좋다는 것을 배울 수 있었습니다.

#### - Docker 도입
1. 문제상황: 로컬에서는 잘 실행되던 서버가 배포를 하고 나면 의도한대로 작동하지 않을 때가 있습니다. 저희의 경우도 배포환경에서의 테스트 과정에서 갑자기 서버가 제대로 실행되지 않았던 때가 있었습니다. 로컬과 배포 서버의 노드의 버전차이 때문에 모듈 인스톨이 제대로 되지 않아 생긴 문제였습니다.
2. 해결방법: 노드 버전을 바꿔주는 것으로 해결할 수는 있었지만, `인스턴스를 새로 만들 때마다 여러 명령어들을 직접 입력하여 환경을 맞춰주는 것은 번거로운 일`이었습니다. 이를 해결하기 위해 `Docker를 통한 서버 코드화`를 진행하였습니다.

#### - Travis CI 도입
1. 도입 이유: `Travis CI`는 여러 개발자가 동시다발적으로 하나의 어플리케이션을 작업하는 만큼 CI를 활용해 서로 충돌할 수 있는 문제를 방지하고, `GitHub` – `Docker` – `AWS` 배포로 이어지는 과정이 번거롭고 수동으로 진행할 시 문제가 발생할 여지가 있어서 현재 가장 많이 사용되는 툴이며 많은 레퍼런스를 가지고 있다는 장점 때문에 도입하였습니다.
2. 도입 과정의 문제점: `OpenSSL`을 통해 환경변수를 암호화하여 푸쉬했을 때, Travis가 이를 `복호화하는 과정에서 에러가 발생`해서 빌드에 여러 번 실패하였습니다. 찾아본 해결법들을 적용해보았지만 해결되지 않았습니다. 직접 Travis 빌드 로그를 살펴보다가 중 `OpenSSL의 버전 정보`를 알게 되었고, 곧이어 `빌드 환경이 ubuntu 16.04로 다소 낮다는 것을 발견`하였습니다. 먼저 `Ubuntu 버전을 18.04로 업그레이드`해보았고, `OpenSSL의 버전 정보도 로컬 환경과 같아졌습니다`. 이에 따라 복호화도 정상적으로 진행될 수 있었습니다.

#### - Typescript 도입
1. 도입 이유: 첫 배포 테스트 이후 `많은 타입 에러가 발생`하였습니다. 타입스크립트는 자바스크립트 버그의 15%를 사전에 방지가 가능하다는 것, 프로젝트에 사용한 자바스트립트와 100% 호환이 가능하다는 점에서 타입스크립트를 도입하였습니다. 도입 이후에는 타입을 엄격하게 선언함으로써 프로젝트의 신뢰성을 높이면서, 기존 `자바스크립트를 사용시 발생할 수 있던 버그를 색출, 수정하면서 미리 방지가 가능해졌습니다`. 
2. 한계: 기존 자바스크립트만을 사용하는 프로젝트 환경에서 타입스크립트로의 전환이 한번에 이루어지기 힘들었습니다. sequelize 공식문서에도 나와있듯(https://sequelize.org/docs/v6/other-topics/typescript/) 둘을 동시에 연계해서 사용하는 방식은 지양해야 합니다. 저희는 sequelize에서 typeORM으로, 궁극적으로 모든 파일을 자바스크립트에서 타입스크립트로 전환하는 것을 목표로 점진적으로 업데이트하고 있습니다.

#### - 주간, 월간 기록 초기화
1. 문제 상황: 이번 주 혹은 이번 달 참여 시간을 보여주어야 하는데 주 혹은 월이 바뀌면 기록이 초기화 되어야 한다.
2. 

</br>

## ⏰ 프로젝트 기간

|||
|:------:|---|
|총 기간| 2월 25일 ~ 4월 8일 (6주)|
|배포일| 4월 1일|
|서비스 개선| 4월 1일 ~ 4월 8일|
