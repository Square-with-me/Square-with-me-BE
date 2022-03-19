// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge, MonthRecord, BeautyRecord, SportsRecord, StudyRecord, CounselingRecord, CultureRecord, ETCRecord } = require("../models");

module.exports = {
  create: {  
          
        /* 
        오픈되지 않은 뱃지는 자물쇠 처리
        - 프론트에 S3로 자물쇠 이미지 링크만 전달 드리면 될듯, 기본 값으로 설정해두었다가 카테고리 및 해당 뱃지 이미지 링크 드리면 바꾸기

        어느 시점에 뱃지를 지급하게 할건가?
        - batch를 이용하여 매 5초마다 확인하는 방법도 있겠지만 몇 개 안되는 뱃지를 위해 많은 작업을 하는 것은 불필요해 보인다.
        따라서 출석을 했을 때나 방을 나갔을 떄 해당 이벤트를 발생시켜 체크하게 하는 것이 어떨까?
        보통은 방 안에서 활동을 하고 기록이 쌓이므로 방을 나갈 때 기록 측정 후 지급하기로 한다.
        다만 출석을 했을 떄도 체크하는 이유는 간혹 사용자가 강제종료를 할 수 있기 때문이다.
        
        그 외 버그 제보와 같은 특이 케이스는 해당 버튼을 누르면 뱃지를 지급하는 방식을 채택한다.
        결국 실시간으로 바로 뱃지를 지급하기 위해서는 해당 기준을 충족하고 어떤 이벤트를 발생시킬 때가 가장 좋다.

        ex) 운동 뱃지 - 운동 카테고리 방에서 나왔을 때 누적 참여 시간이 100시간 이상일 경우

        <뱃지의 분류 - 현재 뱃지 총 8개>

        1) 로그인과 관련된 것 - 선착순, 1개
        2) 시간과 관련된 것 - 카테고리별, 6개, 방을 나갈 때 (강제종료 로그인을 할 떄도 같이 체크해줘야 한다.-> 강제종료 시에도 시간이 기록된다면 해줘야하지만 아니라면 기준을 충족하지 못할 것이므로 그럴 필요가 없다.)
        3) 버그 제보와 같은 특이케이스, 1개
        방안 [1] admin 페이지 - 관리자만이 접근 가능한 페이지에서 지급하기 [2] 해당 이벤트 발생하자마자 지급 (ex: 버그 제보 버튼 누르자마자 제출)
        현재로서는 특이케이스가 하나뿐이기에 버그 제출 시 발생하도록 하는 것이 좋을 듯, 만약 유의미한 버그 내용인지 확인 후 승인받은 사람에게만 지급하고 싶다면 [1]을 해야함

        그 외 고려할 것
        
        - DB 내 뱃지 기본 값 seeders에 채워보기 (채우긴 했는데 seed파일 수정하는 법이 있는지는 모르겠음)
        - 선착순 뱃지는 선착순 100명 까지만 주도록 하기 - > 남은 뱃지 갯수 체크하는 컬럼추가해서 공백 메꾸도록하기
        - S3로 이미지 올려서 링크따오고 공유제대로 되는 지 확인! (공개 범위 보안 설정 필요)
        - 강제 종료 시 시간 기록 여부 파악하기 -> router.delete가 어떻게 실행되느냐에 따라 다름, 강제종료 시에도 시간 저장 -> 카테고리 별뱃지 로그인할 때도 검사
        - 버그제보 뱃지 생성하기
        - 뱃지 이미지를 뱃지 모델란에 컬럼 추가하여 넣기 -> 완료
        - 뱃지 목록 조회 api부분도 마무리 하기
        - 뱃지 api 설계하여 알려드리기
        - 열리지 않은 뱃지 갯수도 보여주어야 하니 전체뱃지 개수와 생성할 뱃지 리스트

        <추후 문제>
        - 자물쇠로 잠겨있는 뱃지에 커서를 올렸을 떄 힌트 보여주는 것, 어떻게 구현할 것인가?
        - 

        */
      
  },

  update: {
    profileImg: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { profileImg } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        profileImg,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          profileImg: profileImg,
        },
      });
    }),

    nickname: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { nickname } = req.body;

      if(nickname.length < 2 || nickname.length > 8) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임은 2글자 ~ 8글자로 적어주세요."
        });
      };

      if(!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다."
        });
      };

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        nickname,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          nickname,
        },
      });
    }),

    statusMsg: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { statusMsg } = req.body;

      if(statusMsg.length < 1 || statusMsg.length > 20) {
        return res.status(400).json({
          isSuccess: false,
          msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요."
        });
      };

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        statusMsg,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          statusMsg,
        },
      });
    }),

    masterBadge: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { badgeId } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        MasterBadgeId: badgeId,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          MasterBadgeId: badgeId,
        },
      });
    }),
  },

  get: {
    user: asyncWrapper(async (req, res) => {
      const { user } = res.locals;

      return res.status(200).json({
        isSuccess: true,
        data: {
          user,
        }
      });
    }),
    
    // 보유한 뱃지 정보 가져오기는 아직 보류
    badges: asyncWrapper(async (req, res) => {
      const { userId } = res.locals.user;

      return res.status(200).json({
        isSuccess: true,
        // data:
      });
    }),

    records: asyncWrapper(async (req, res) => {
      const { id } = res.locals.user;

      // 주간 기록 가져오기
      const record = await User.findOne({
        where: { id },
        attributes: ["id"],
        include: [{
          model: BeautyRecord,
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        }, {
          model: SportsRecord,
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        }, {
          model: StudyRecord,
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        }, {
          model: CounselingRecord,
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        }, {
          model: CultureRecord,
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        }, {
          model: ETCRecord,
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        }, {
          model: MonthRecord,
          attributes: ["time", "date"],
        }],
      });
      if(!record) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      };

      return res.status(200).json({
        isSuccess: true,
        data: record,
      });
    }),
  },

  delete: {

  },
};