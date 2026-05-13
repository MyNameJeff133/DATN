import axios from "axios";

export const sendVerificationEmail = async (email, token) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Thiếu EMAIL_USER hoặc EMAIL_PASS trong .env");
  }

  const frontendUrl = process.env.FRONTEND_URL || "https://ur-pharmacy.vercel.app";
  const verifyLink = `${frontendUrl.replace(/\/$/, "")}/verify/${token}`;

  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Ur Pharmacy",
        email: process.env.EMAIL_USER,
      },
      to: [{ email }],
      subject: "Xác thực tài khoản - Ur Pharmacy",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:16px;">
            <h2 style="color:#0f172a;">Xác thực tài khoản</h2>
            <p style="color:#475569; font-size:16px;">
              Cảm ơn bạn đã đăng ký tài khoản tại Ur Pharmacy.
            </p>
            <p style="color:#475569; font-size:16px;">
              Nhấn nút bên dưới để xác thực email:
            </p>
            <div style="text-align:center; margin:30px 0;">
              <a
                href="${verifyLink}"
                style="background:#0e7490; color:white; padding:12px 24px; text-decoration:none; border-radius:10px; display:inline-block; font-weight:bold;"
              >
                Xác thực Email
              </a>
            </div>
            <p style="font-size:14px; color:#64748b;">
              Nếu nút không hoạt động, hãy copy link này:
            </p>
            <p style="word-break:break-all; color:#0e7490;">${verifyLink}</p>
            <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0;" />
            <p style="font-size:12px; color:#94a3b8;">
              Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.
            </p>
          </div>
        </div>
      `,
    },
    {
      headers: {
        accept: "application/json",
        "api-key": process.env.EMAIL_PASS,
        "content-type": "application/json",
      },
    },
  );

  return response.data;
};
