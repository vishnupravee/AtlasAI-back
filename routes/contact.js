const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const ContactMessage = require("../models/ContactMessage");

// POST /send message
router.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    console.log("Received contact message:", { name, email, message });
    

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    // Save to MongoDB
    const saved = await ContactMessage.create({
      name,
      email,
      message,
      meta: {
        userAgent: req.headers["user-agent"],
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      },
    });
console.log("Saved contact message to MongoDB:", saved._id);

    // Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
//     const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

    // Send email
    await transporter.sendMail({
      from: `"RJ ATLAS Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New contact from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/>${message.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <small>Message ID: ${saved._id}</small>
      `,
    });

    res.json({ success: true, id: saved._id });
  } catch (err) {
    console.error("❌ Send error:", err);
    res.status(500).json({ success: false, error: "Failed to send/save message." });
  }
});

// GET /messages (optional admin route)
router.get("/messages", async (req, res) => {
  const docs = await ContactMessage.find().sort({ createdAt: -1 }).limit(50);
  res.json(docs);
});

module.exports = router;
