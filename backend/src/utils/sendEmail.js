import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, token) => {
  try {
    console.log("📧 Starting email verification process for:", email);

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not set in environment variables");
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://ur-pharmacy.vercel.app";
    const verifyLink = `${frontendUrl.replace(/\/$/, "")}/verify/${token}`;

    console.log("📬 Sending verification email to:", email);
    
    const result = await resend.emails.send({
      from: "Ur Pharmacy <onboarding@resend.dev>", // Replace with your domain after adding it to Resend
      to: email,
      subject: "Xac thuc tai khoan - Ur Pharmacy",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; margin-top: 0;">Xac thuc tai khoan</h2>
            <p style="color: #666; font-size: 16px;">Cam on ban da dang ky tai Ur Pharmacy!</p>
            <p style="color: #666; font-size: 16px;">Bam nut ben duoi de kich hoat tai khoan cua ban:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Xac thuc email
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px;">Neu khong the bam nut tren, hay copy link nay vao trinh duyet:</p>
            <p style="color: #4CAF50; font-size: 14px; word-break: break-all;">${verifyLink}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Neu ban khong dang ky tai khoan nay, hay bo qua email nay.</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Email send error:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
