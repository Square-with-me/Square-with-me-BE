# Nemo-with-me-BE

</br>

<p align='center'>
<img width="540" alt="네모위드미" src="https://user-images.githubusercontent.com/77830226/161585283-36e4a2aa-d171-464a-8204-c7b2e67631a2.png">
</p>

</br>

<h3 align='center'> 🙆 무엇이든 함께 할 수 있는 실시간 화상 채팅 🙆‍♂️ </h3>
  
</br></br></br>

## 📌 바로가기
- <a href="https://nemowithme.com"> 🟪 with me 바로가기 </a></br>
- <a href="https://github.com/Square-with-me/Square-with-me-BE"> 📁 백엔드 GitHub Repository </a></br>
- <a href="https://www.youtube.com/watch?v=FtRGOCRLCSY&feature=youtu.be"> 🎥 프로젝트 발표 영상 보러가기 </a>
- <a href="https://smart-surprise-3fe.notion.site/with-me-6638767634654e5490df2991947906f6"> 🟪 with me 팀노션 (Brochure) </a></br>
- <a href="https://www.instagram.com/nemo_with_me/"> 🟪 with me 인스타그램 </a></br>

</br></br></br>

## ⏰ 프로젝트 기간

</br>

||기간 (2022)|
|:------:|---|
|총 기간| 2월 25일 ~ 4월 8일 (6주)|
|배포일| 4월 1일|
|사용자 설문조사| 4월 1일 ~ 4월 7일|
|서비스 개선| 4월 1일 ~ 4월 8일|

</br></br></br>


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
  
- 마이크 on/off , 카메라 on/off 기능을 통해 화상채팅 사용자들이 자율적으로 선택해 사용할 수 있으며,
</br>이모티콘을 눌러 간단한 감정 표현도 주고받을 수 있습니다. 
    
</br>

![채팅 이모티콘](https://user-images.githubusercontent.com/77830226/161819289-32fbe0fc-566d-4983-a0e0-feaa78456a01.gif) 
    
</details>

<details>
<summary>📊 기록 그래프</summary> </br>

- 사용자가 🟪 with me 에서 얼마만큼 활동했는지 시각적으로 볼 수 있도록 마이페이지를 그래프 형태로 표현했습니다.
- 오늘과 이번 주 참여 기록에서는 카테고리별 참여 기록을, 이번 달 참여 기록에서는 하루 총 참여 시간을 확인할 수 있습니다.
- 뱃지를 함께 볼 수 있도록 구성해 사용자가 서비스를 이용하며 성취감을 느낄 수 있도록 하고
</br> 원하는 대표 뱃지를 설정해 다른 참여자에게 보여줄 수 있도록 구현했습니다.
    
</br>
  
![마이페이지 기록](https://user-images.githubusercontent.com/77830226/161819359-b1ba80bc-4765-4c58-ae5b-61408d768299.gif)
    
</details>

</br></br>



## 🛠 기술스택

</br>

>### 🧑‍💻 백엔드
</br>
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
  <img src="https://img.shields.io/badge/Travis CI-3EAAAF?logo=Travis CI&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=Docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Amazon Elastic Beanstalk-232F3E?logo=Amazon AWS&logoColor=white" />
  <img src="https://img.shields.io/badge/Amazon Certificate Manager-232F3E?logo=Amazon AWS&logoColor=white" />
</p>

</br></br>



## How to use
```
1. fork
2. clone
3. npm install
4. create .env
5. create MySQL DB: npx sequelize db:create
6. npm run dev
7. create seeds: npx sequelize db:seed:all
```

## Architecture
![architecture-BE](https://user-images.githubusercontent.com/48178101/161919048-e18c46fc-fb15-4362-b747-eca052ebaa2c.png)

## Contributors
|name|position|github|
|------|---|---|
|장현광|Node.js|https://github.com/Hyeon-Gwang|
|장창훈|Node.js|https://github.com/Hoon333|
|황성원|Node.js|https://github.com/Magiof|


![최종단체사진](https://user-images.githubusercontent.com/77830226/161935598-84bde947-0ebe-42e2-b262-c7db4a1a5deb.jpg)
