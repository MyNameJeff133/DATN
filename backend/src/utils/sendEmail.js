import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const verifyLink = `${frontendUrl.replace(/\/$/, "")}/verify/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xac thuc tai khoan",
    html: `
      <h2>Xac thuc tai khoan</h2>
      <p>Bam nut ben duoi de kich hoat tai khoan:</p>
      <a
        href="${verifyLink}"
        style="
          display:inline-block;
          padding:10px 20px;
          background:#4CAF50;
          color:white;
          text-decoration:none;
          border-radius:5px;
        "
      >
        Xac thuc email
      </a>
      <p>Neu khong bam duoc, hay dung link sau:</p>
      <p>${verifyLink}</p>
    `,
  });
};
