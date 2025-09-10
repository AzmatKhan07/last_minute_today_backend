#!/usr/bin/env node

/**
 * GoDaddy Email Setup Helper
 * This script helps you test your GoDaddy email configuration
 */

const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("🔧 GoDaddy Email Configuration Test\n");

// Check if .env file exists
const fs = require("fs");
if (!fs.existsSync(".env")) {
  console.log("❌ .env file not found!");
  console.log(
    "📝 Please copy env.example to .env and configure your email settings:"
  );
  console.log("   cp env.example .env");
  console.log("   # Then edit .env with your GoDaddy email credentials\n");
  process.exit(1);
}

// Display current configuration
console.log("📧 Current Email Configuration:");
console.log(`   Host: ${process.env.EMAIL_HOST || "Not set"}`);
console.log(`   Port: ${process.env.EMAIL_PORT || "Not set"}`);
console.log(`   User: ${process.env.EMAIL_USER || "Not set"}`);
console.log(`   Company Email: ${process.env.COMPANY_EMAIL || "Not set"}\n`);

// Test email configuration
async function testEmailConfig() {
  try {
    console.log("🧪 Testing email configuration...\n");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    // Send test email
    console.log("📤 Sending test email...");
    const testEmail = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.COMPANY_EMAIL,
      subject: "Test Email from Last Minutes Today Backend",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Email Configuration Test</h1>
            <p style="color: white; margin: 10px 0 0 0;">Last Minutes Today</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Configuration Successful!</h2>
            <p>Your GoDaddy email is properly configured and working.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</p>
            <p><strong>SMTP Port:</strong> ${process.env.EMAIL_PORT}</p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This is a test email from your Last Minutes Today backend</p>
          </div>
        </div>
      `,
      text: `
        Email Configuration Test - Last Minutes Today
        
        Your GoDaddy email is properly configured and working.
        
        Timestamp: ${new Date().toISOString()}
        SMTP Host: ${process.env.EMAIL_HOST}
        SMTP Port: ${process.env.EMAIL_PORT}
        
        This is a test email from your Last Minutes Today backend.
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${process.env.COMPANY_EMAIL}\n`);

    console.log("🎉 GoDaddy email configuration is working perfectly!");
    console.log("📧 Check your email inbox for the test message.\n");
  } catch (error) {
    console.log("❌ Email configuration test failed!");
    console.log("🔍 Error details:", error.message);
    console.log("\n🛠️  Troubleshooting tips:");
    console.log("   1. Check your email password in .env file");
    console.log("   2. Try alternative SMTP settings:");
    console.log("      EMAIL_HOST=smtpout.secureserver.net");
    console.log("      EMAIL_PORT=465");
    console.log("   3. Verify your GoDaddy email account is active");
    console.log("   4. Check if your hosting provider blocks SMTP ports\n");
  }
}

// Run the test
testEmailConfig();
