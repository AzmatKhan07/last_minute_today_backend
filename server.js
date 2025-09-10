const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com", "https://www.yourdomain.com"] // Replace with your actual domain
        : ["http://localhost:3000", "http://localhost:5173"], // Vite default ports
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create email transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  // GoDaddy specific configuration
  if (
    process.env.EMAIL_HOST &&
    (process.env.EMAIL_HOST.includes("secureserver.net") ||
      process.env.EMAIL_HOST.includes("lastminutetoday.com"))
  ) {
    config.secure = process.env.EMAIL_PORT === "465";
    config.requireTLS = process.env.EMAIL_PORT === "587";
  }

  console.log("📧 Email transporter configured for:", process.env.EMAIL_HOST);
  return nodemailer.createTransport(config);
};

// Email template
const createEmailTemplate = (formData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
        <p style="color: white; margin: 10px 0 0 0;">Last Minutes Today</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${formData.name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${
            formData.email
          }" style="color: #667eea;">${formData.email}</a></p>
          <p style="margin: 10px 0;"><strong>Website:</strong> ${
            formData.website || "Not provided"
          }</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; color: #555;">${formData.message}</p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Reply directly to: <a href="mailto:${
              formData.email
            }" style="color: #1976d2;">${formData.email}</a></strong>
          </p>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">This email was sent from your Last Minutes Today contact form</p>
      </div>
    </div>
  `;
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Last Minutes Today Email API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { name, email, website, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Prepare email data
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.COMPANY_EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: createEmailTemplate({ name, email, website, message }),
      text: `
        New Contact Form Submission from ${name}
        
        Name: ${name}
        Email: ${email}
        Website: ${website || "Not provided"}
        Message: ${message}
        
        Reply to: ${email}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    res.json({
      success: true,
      message: "Email sent successfully! We'll get back to you soon.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email sending error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 CORS enabled for: ${
      process.env.NODE_ENV === "production" ? "production domains" : "localhost"
    }`
  );
});

module.exports = app;
