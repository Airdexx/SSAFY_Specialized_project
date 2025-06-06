import React from "react";
import kakao from "../../../assets/images/kakao.png"
import './KakaoLogin.css'
const KakaoLogin = () => {

    const handleKakaoLogin = () => {
        const redirectUri = `${window.location.origin}/auth/kakao/callback`;
        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = KAKAO_AUTH_URL;
    };


return (
    <button className="kakao-button" onClick={handleKakaoLogin}>
        <img src={kakao} alt="카카오로그인" className="kakao" />
    </button>
)
}

export default KakaoLogin;