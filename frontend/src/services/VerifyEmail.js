import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VerifyEmail() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");

  useEffect(() => {

    api.get(`/auth/verify/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));

  }, [token]);

  if (status === "loading") {
    return <h2>Đang xác thực email...</h2>;
  }

  if (status === "error") {
    return <h2>Token không hợp lệ</h2>;
  }

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>

      <h2>🎉 Xác thực email thành công</h2>

      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop:"20px",
          padding:"10px 20px",
          background:"green",
          color:"white",
          border:"none",
          borderRadius:"5px"
        }}
      >
        Đăng nhập
      </button>

    </div>
  );
}