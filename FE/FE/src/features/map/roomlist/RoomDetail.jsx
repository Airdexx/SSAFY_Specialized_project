import { useEffect, useState, useRef } from "react";
import "./RoomDetail.css";
import { getPropertyDetail, fetchCommuteTime } from "../../../common/api/api";
import defaultImage from "../../../assets/logo/192image.png";
import date from "../../../assets/images/detail_png/date.png";
import floor from "../../../assets/images/detail_png/floor.png";
import room from "../../../assets/images/detail_png/room.png";
import size from "../../../assets/images/detail_png/size.png";
import direction from "../../../assets/images/detail_png/direction.png";
import { useSelector } from "react-redux"; // ✅ 사용자 정보 가져오기
import AiGraphPanel from "./ai_recommend/AiGraphPanel";

const RoomDetail = ({ propertyId }) => {

  const [detail, setDetail] = useState(null);
  const detailRef = useRef(null); // ✅ 이 ref로 RoomDetail 영역 추적
  const [commute, setCommute] = useState(null); // ⬅️ 통근 시간 상태
  const user = useSelector((state) => state.auth.user); // ⬅️ 사용자 정보
  const filterValues = useSelector((state) => state.roomList.filterValues); // ✅ 슬라이더 값
  const source = useSelector((state) => state.roomList.selectedPropertySource); // ✅ 추천 여부 판단

  const aiRecommendedRoom = useSelector((state) =>
    state.roomList.aiRecommendedList.find((r) => r.propertyId === propertyId)
  );

  useEffect(() => {
    const fetchDetail = async () => {

      // AI 추천 탭에서 받은 매물일 경우
      if (aiRecommendedRoom) {
        setDetail(aiRecommendedRoom);
        if (user.idx && aiRecommendedRoom.latitude && aiRecommendedRoom.longitude) {
          const commuteData = await fetchCommuteTime({
            userId: user.idx,
            lat: aiRecommendedRoom.latitude,
            lon: aiRecommendedRoom.longitude,
          });
          setCommute(commuteData);
        }
        return;
      }


      const data = await getPropertyDetail(propertyId);
      if (data) setDetail(data);

      // ✅ 통근 시간 요청 (userId + 매물 좌표)
      if (user?.idx && data.latitude && data.longitude) {

        const commuteData = await fetchCommuteTime({
          userId: user.idx,
          lat: data.latitude,
          lon: data.longitude,
        });
        setCommute(commuteData);
      }
    };
    fetchDetail();
  }, [propertyId, aiRecommendedRoom]);


  const formatFee = (fee) => {
    if (!fee || fee === 0) return "없음";
    return `${Math.round(fee / 10000)}만원`;
  };

  if (!detail) return null; // 아직 로딩 중

  return (
    <div className="room-detail" ref={detailRef}>
        {/* <img
        src={close}
        alt="닫기"
        onClick={() => dispatch(setSelectedPropertyId(null))}
        className="close-btn"
        /> */}
      <div className="detail-scrollable">
        <img
          src={detail.imageUrl || defaultImage}
          alt="매물 이미지"
          className="detail-image"
        />

        <div className="detail-info">
          <p className="detail-address">{detail.address}</p>
          <h2>
            {detail.contractType} {detail.price}
          </h2>
          <p>관리비 {formatFee(detail.maintenanceFee)}</p>
          <div className="detail-description">{detail.description}</div>

          {user?.idx ? (
            commute ? (
              <div className="commute-section">
                <div className="commute-title">🚩 {commute.destination}</div>
                <div className="commute-all">
                  <div className="commute-line">
                    <span>🚗</span>
                    <span>{commute.drivingTimeString}</span>
                  </div>
                  <div className="commute-line">
                    <span>🚇</span>
                    <span>{commute.transitTimeString}</span>
                  </div>
                  <div className="commute-line">
                    <span>🚶</span>
                    <span>{commute.walkingTimeString}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="commute-section">
                <div className="commute-title">
                  <span className="spinner" /> 기준지와의 이동 시간 계산 중...
                </div>
              </div>
            )
          ) : (
            <div className="commute-section">
              <div className="commute-title" style={{ fontWeight: "bold", color: "#666" }}>
                로그인을 하면 예상 이동 시간을 확인할 수 있습니다.
              </div>
            </div>
          )}

          {/* ✅ AI 추천 그래프 컴포넌트 */}
          {aiRecommendedRoom && (
            <>
              <hr />
              <AiGraphPanel room={detail} values={filterValues} />
            </>
          )}

          <hr />

          <div className="detail-line">
            <img src={date} alt="날짜 아이콘" className="detail-icons" />
            <p>{detail.moveInDate || "-"}</p>
          </div>

          <div className="detail-line">
            <img src={size} alt="면적 아이콘" className="detail-icons" />
            <p>{detail.area || "-"}</p>
          </div>

          <div className="detail-line">
            <img src={floor} alt="층수 아이콘" className="detail-icons" />
            <p>{detail.floorInfo || "-"}</p>
          </div>
          <div className="detail-line">
            <img src={room} alt="방욕실 아이콘" className="detail-icons" />
            <p>{detail.roomBathCount || "-"}</p>
          </div>
          <div className="detail-line">
            <img src={direction} alt="방향" className="detail-icons" />
            <p>{detail.direction || "-"}</p>
          </div>
            {/* <div className="detail-fixed-footer">
            <img src={phone} alt="전화" />
            <img src={chat} alt="메시지" />
            </div> */}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
