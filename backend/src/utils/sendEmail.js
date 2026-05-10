import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  try {
    console.log("📧 Starting email verification process for:", email);
    console.log("Email config:", {
      user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + "***" : "NOT SET",
      pass: process.env.EMAIL_PASS ? "SET" : "NOT SET",
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    console.log("🔗 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const frontendUrl = process.env.FRONTEND_URL || "https://ur-pharmacy.vercel.app";
    const verifyLink = `${frontendUrl.replace(/\/$/, "")}/verify/${token}`;

    console.log("📬 Sending email to:", email);
    const result = await transporter.sendMail({
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

    console.log("✅ Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Email send error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
    });
    throw error;
  }
};
