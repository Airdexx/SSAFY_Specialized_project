// 찜 목록
import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { fetchLikedProperties, unlikeProperty } from "../../../common/api/api";
import "./Zzim.css";
import Navbar from "../../../common/navbar/Navbar";
import { useDispatch, useSelector } from "react-redux";
import blankImg from "../../../assets/logo/512image.png";
import { FaHeart } from "react-icons/fa";
import {
  // setSelectedPropertyId,
  setSelectedRoomType,
} from "../../../store/slices/roomListSlice";
import { useNavigate } from "react-router-dom";

const Zzim = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [groupedZzims, setGroupedZzims] = useState({});
  const user = useSelector((state) => state.auth?.user);
  const [flag, setFlag] = useState(false);

  const handleCardClick = (property) => {
    dispatch(setSelectedRoomType("찜"));
    navigate("/map", {
      state: {
        selectedPropertyId: property.propertyId,
      },
    });
  };

  useEffect(() => {
    if (!user?.idx) return;

    fetchLikedProperties(user.idx).then((zzims) => {
      // 구 단위로 그룹핑
      const grouped = zzims.reduce((acc, item) => {
        const gu = item.address.split(" ")[1];
        if (!acc[gu]) acc[gu] = [];
        acc[gu].push(item);
        return acc;
      }, {});
      setGroupedZzims(grouped);
    });
  }, [user?.idx, flag]);

  if (user === null) {
    return (
      <div className="zzim-page">
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "100px" }}>
          사용자 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  const getRoomType = (roomBathCount) => {
    // 숫자에 해당하는 매핑 객체
    const roomTypeMapping = {
      1: "원룸",
      2: "투룸",
      3: "쓰리룸",
      4: "포룸", // 필요에 따라 다른 문자열로 변경 가능
    };

    // roomBathCount 값이 존재하는지 확인 후, '/'를 기준으로 split하여 첫번째 값 추출
    if (roomBathCount) {
      const count = roomBathCount.split("/")[0];
      return roomTypeMapping[count] || "";
    }
    return "";
  };

  const toggleLike = async (room, e) => {
    e.stopPropagation();
    const { propertyId } = room;
    if (user === null) return alert("로그인이 필요합니다.");

    await unlikeProperty(propertyId, user.idx);
    setFlag((prevFlag) => !prevFlag);

  };

  // 카드 클릭 시: Redux에 선택된 매물 정보 및 검색 키워드(주소) 업데이트 후 map 페이지로 이동
  // const handleCardClick = (room) => {
  //   dispatch(setSelectedPropertyId(room.propertyId));

  //   navigate("/map", {
  //     state: {
  //       lat: room.latitude,
  //       lng: room.longitude,
  //       property: room, // ✅ 클릭한 매물도 함께 넘기기
  //     },
  //   });
  // };
  return (
    <div className="zzim-page">
      <Navbar />
      <h2 className="zzim-title">찜한 매물</h2>
      {Object.keys(groupedZzims).length === 0 ? (
        <div className="empty-card">
          <p className="animate-text">
            <span>매</span>
            <span>물</span>
            <span>을</span>
            <span>&nbsp;</span>
            <span>찜</span>
            <span>해</span>
            <span>&nbsp;</span>
            <span>보</span>
            <span>세</span>
            <span>요</span>
            <span>!</span>
            <span>!</span>
          </p>
        </div>
      ) : (
        Object.keys(groupedZzims).map((gu) => (
          <div key={gu} className="zzim-gu-section">
            <h3 className="gu-name">{gu}</h3>
            <div className="zzim-list">
              {groupedZzims[gu].map((room) => (
                <div
                  key={room.propertyId}
                  className="zzim-card"
                  onClick={() => handleCardClick(room)}
                >
                  <img
                    src={room.imageUrl || blankImg}
                    alt="매물 이미지"
                    className="zzim-img"
                  />
                  <button
                    onClick={(e) => toggleLike(room, e)}
                    className="zzim-delete-btn"
                  >
                    <FaHeart color="red" size={24} />
                  </button>
                  <div className="zzim-info">
                    <span className="zzim-room-type">
                      {getRoomType(room.roomBathCount)}
                    </span>
                    <p className="price">{room.price}</p>
                    <p className="desc">{room.description}</p>
                    <p className="addr">{room.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Zzim;
