import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client (Server-Side)
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      company: "Delta Mithapukur Broadband & Network Services",
      timestamp: new Date().toISOString(),
      aiConfigured: !!ai,
    });
  });

  // Simulated Notification API - WhatsApp
  app.post("/api/notify/whatsapp", (req, res) => {
    const { recipient, recipientType, title, message, ticketId, cid } = req.body;
    console.log(`[WHATSAPP ALERT] Sent to ${recipientType} (${recipient}): Ticket #${ticketId} - CID ${cid}`);
    res.json({
      success: true,
      channel: "WhatsApp",
      sentAt: new Date().toISOString(),
      recipient,
      recipientType,
      formattedPreview: `*Delta Mithapukur Alert*\n*Ticket #${ticketId}*\nCID: ${cid}\n*Subject:* ${title}\n*Details:* ${message}\n_Status updated by System_`,
    });
  });

  // Simulated Notification API - Email
  app.post("/api/notify/email", (req, res) => {
    const { recipient, recipientType, title, message, ticketId, cid, clientEmail } = req.body;
    const targetEmail = clientEmail || recipient || "client@deltamithapukur.com";
    console.log(`[EMAIL ALERT] Sent to ${recipientType} (${targetEmail}): Ticket #${ticketId} - CID ${cid}`);
    res.json({
      success: true,
      channel: "Email",
      sentAt: new Date().toISOString(),
      recipient: targetEmail,
      recipientType,
      subject: `[Delta Mithapukur ISP] Support Ticket #${ticketId} Update (${cid})`,
      bodyHtml: `<div style="font-family:Arial,sans-serif;padding:24px;background-color:#f8fafc;border-radius:12px;border:1px solid #cbd5e1;max-width:600px;margin:0 auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;border-bottom:2px solid #005baa;">
          <h2 style="color:#005baa;margin:0;font-size:20px;">📡 Delta Mithapukur ISP & NOC Support</h2>
          <span style="background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;">Ticket Alert</span>
        </div>
        <p style="margin-top:16px;color:#334155;"><strong>Ticket ID:</strong> #${ticketId} | <strong>Client ID:</strong> ${cid}</p>
        <p style="color:#1e293b;font-weight:bold;font-size:16px;">${title}</p>
        <div style="background:#ffffff;padding:16px;border-left:4px solid #10b981;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.05);margin:16px 0;color:#1e293b;line-height:1.5;">
          ${message}
        </div>
        <p style="font-size:12px;color:#64748b;margin-top:20px;">Delta Mithapukur Support Desk: support@deltamithapukur.com | Hotline: +880 1700-000000</p>
      </div>`,
    });
  });

  // Dedicated Email System API Endpoints
  let emailConfig = {
    smtpHost: "smtp.deltamithapukur.com",
    smtpPort: "587",
    smtpUser: "noc-alerts@deltamithapukur.com",
    senderName: "Delta Mithapukur ISP NOC Desk",
    supportEmail: "support@deltamithapukur.com",
    nocEmail: "noc@deltamithapukur.com",
    managerEmail: "manager@deltamithapukur.com",
    autoNotifyClientOnTicket: true,
    autoNotifyNocOnTicket: true,
    autoNotifyManagerOnUrgent: true,
    status: "Active & Connected (SMTP 587)",
  };

  // WhatsApp Business Cloud API Config & Webhook Server Logic
  let waConfig = {
    wabaId: "WABA-8801700998877",
    phoneNumberId: "PNID-1092837482910",
    displayPhone: "+880 1700-000000",
    appId: "102938475610293",
    appSecret: "••••••••••••••••••••••••",
    accessToken: "EAAG871239102938475610293847561029384756102938475",
    verifyToken: "delta_mithapukur_wa_secret_2026",
    webhookUrl: "https://deltamithapukur.com/api/whatsapp/webhook",
    autoResponderEnabled: true,
    autoCreateTicketOnLos: true,
    apiVersion: "v19.0",
    status: "Connected & Verified (Meta Cloud API v19.0)",
  };

  app.get("/api/whatsapp/config", (req, res) => {
    res.json({ success: true, config: waConfig });
  });

  app.post("/api/whatsapp/config", (req, res) => {
    waConfig = { ...waConfig, ...req.body };
    console.log("[WHATSAPP CLOUD API CONFIG UPDATED]", waConfig);
    res.json({ success: true, config: waConfig, message: "WhatsApp Business API server config updated" });
  });

  // Meta Webhook Verification Endpoint (GET)
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === waConfig.verifyToken) {
      console.log("[META WEBHOOK VERIFIED] Handshake successful with token:", token);
      return res.status(200).send(challenge);
    }
    res.sendStatus(403);
  });

  // Meta Inbound Webhook Event Receiver (POST)
  app.post("/api/whatsapp/webhook", (req, res) => {
    const body = req.body;
    console.log("[INBOUND WHATSAPP WEBHOOK EVENT RECEIVED]", JSON.stringify(body, null, 2));

    let replyMessage = "প্রিয় গ্রাহক, ডেল্টা মিঠাপুকুর ব্রডব্যান্ড আপনার বার্তাটি পেয়েছে। আমাদের নোক ইঞ্জিনিয়ার আপনার বিষয়টি দেখছে।";
    let ticketCreated = false;
    let ticketId = null;

    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (message && message.type === "text") {
        const text = message.text.body || "";
        const fromPhone = message.from || "";
        const senderName = changes?.value?.contacts?.[0]?.profile?.name || "WhatsApp Client";

        if (text.toLowerCase().includes("los") || text.toLowerCase().includes("red") || text.toLowerCase().includes("ডাউন")) {
          ticketCreated = true;
          ticketId = `T-${new Date().getFullYear()}-00${Math.floor(10 + Math.random() * 90)}`;
          replyMessage = `🚨 [AUTOMATED NOC ALERT] প্রিয় ${senderName}, আপনার অপটিক্যাল ফাইবারে RED LOS সংকেতের বার্তা পেয়ে আমরা সাপোর্ট টিকেট #${ticketId} তৈরি করেছি। মিঠাপুকুর নোক টিম আপনার লাইনের সিগন্যাল পর্যবেক্ষণ করছে।`;
        } else if (text.toLowerCase().includes("bill") || text.toLowerCase().includes("pay") || text.toLowerCase().includes("বিকাশ")) {
          replyMessage = `💳 [DELTA BILLING BOT] প্রিয় ${senderName}, বিল পরিশোধ করতে ডেল্টা মিঠাপুকুর বিকাশ মার্চেন্ট নম্বর: 01700-000000 (Make Payment). আপনার চলতি মাসের বিল পেইড স্ট্যাটাসে রয়েছে।`;
        } else if (text.toLowerCase().includes("status") || text.toLowerCase().includes("টিকেট")) {
          replyMessage = `📊 [TICKET TRACKER] প্রিয় ${senderName}, আপনার সক্রিয় টিকেট সমাধান প্রক্রিয়াধীন রয়েছে। টেকনিশিয়ান মাঠে নিয়োজিত আছে।`;
        }
      }
    } catch (e) {
      console.error("Error processing WA webhook body:", e);
    }

    res.json({
      success: true,
      processedAt: new Date().toISOString(),
      ticketCreated,
      ticketId,
      replyMessage,
    });
  });

  // WhatsApp HSM Template Sender
  app.post("/api/whatsapp/send-template", (req, res) => {
    const { recipientPhone, templateName, ticketId } = req.body;
    console.log(`[WHATSAPP HSM DISPATCH] Template: ${templateName} -> ${recipientPhone} (Ticket #${ticketId})`);
    res.json({
      success: true,
      messageId: `wamid.HBgM${Date.now()}`,
      template: templateName,
      recipient: recipientPhone,
      status: "delivered",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/email/settings", (req, res) => {
    res.json({ success: true, settings: emailConfig });
  });

  app.post("/api/email/settings", (req, res) => {
    emailConfig = { ...emailConfig, ...req.body };
    console.log("[EMAIL CONFIG UPDATED]", emailConfig);
    res.json({ success: true, settings: emailConfig, message: "Email server configuration saved successfully" });
  });

  // Endpoint to simulate receiving a ticket via Email (Inbound Client Email)
  app.post("/api/email/inbound", (req, res) => {
    const { fromEmail, fromName, subject, body, area, phone } = req.body;
    const generatedTicketId = `T-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const generatedCid = `CID-${Math.floor(1000 + Math.random() * 9000)}`;

    console.log(`[INBOUND EMAIL TICKET RECEIVED] From: ${fromEmail} (${fromName}) - Subject: ${subject}`);

    res.json({
      success: true,
      message: "Client email successfully received and converted to trackable support ticket",
      ticket: {
        id: generatedTicketId,
        cid: generatedCid,
        clientName: fromName || "Email Client",
        clientPhone: phone || "01700-000000",
        clientEmail: fromEmail,
        area: area || "Mithapukur Sadar",
        title: subject || "Support request via Email",
        description: body || "Client submitted support query via support@deltamithapukur.com",
        status: "Open",
        priority: subject?.toLowerCase().includes("urgent") || subject?.toLowerCase().includes("down") ? "Urgent" : "Medium",
        source: "Inbound Email",
      }
    });
  });

  // AI NOC Diagnostic & Bengali Reply Generator
  app.post("/api/ai/diagnose", async (req, res) => {
    try {
      const { ticketTitle, ticketDescription, category, area, clientName, cid, opticalPower, pingMs } = req.body;

      if (!ai) {
        // High quality Bengali fallback response if key is not configured
        return res.json({
          success: true,
          mode: "fallback",
          summaryBengali: `গ্রাহক ${clientName} (${cid}, এলাকা: ${area || 'মিঠাপুকুর'}) - ${category} সমস্যা সংক্রান্ত টিকেট বুক করেছেন।`,
          nocSteps: [
            "১. মিঠাপুকুর পপ (POP) সুইচ পোর্ট ও অপটিক্যাল স্প্লিটার ফাইবার পাওয়ার লেভেল চেক করুন।",
            "২. গ্রাহকের ONU ডায়াগনস্টিক ট্র্যাকার রিড ব্যাক নিন (Rx Power -18dBm থেকে -25dBm এর মধ্যে থাকা উচিত)।",
            "৩. ফিল্ড টেকনিশিয়ানকে ক্লায়েন্ট লোকেশনে ক্যাবল লস ও প্যাচ কর্ড টেস্ট করার জন্য অ্যাসাইন করুন।",
            "৪. লাইন ওকে হলে VLAN ও PPPoE সার্ভিস টোকেন রিস্টার্ট করুন।"
          ],
          clientReplyBengali: `প্রিয় ${clientName} (${cid}), ডেল্টা মিঠাপুকুর নোক টিম আপনার "${ticketTitle}" বিষয়টি পর্যবেক্ষণ করছে। আমাদের টেকনিক্যাল টিম ${area || 'আপনার এলাকায়'} কাজ শুরু করেছে। দ্রুত সমাধান পাওয়া মাত্রই আপনাকে আপডেট জানানো হবে। ধন্যবাদ!`,
          recommendedPriority: "High"
        });
      }

      const prompt = `You are the AI Chief NOC Diagnostics System for "Delta Mithapukur", a high-speed Fiber Broadband ISP operating in Mithapukur, Rangpur, Bangladesh.
Analyze this client support ticket and respond with structured JSON only in Bengali/English mix:

Ticket Data:
- Client: ${clientName} (CID: ${cid})
- Area: ${area}
- Category: ${category}
- Title: ${ticketTitle}
- Description: ${ticketDescription}
- Optical Power Reading: ${opticalPower || '-21.5 dBm'}
- Ping Latency: ${pingMs || '32ms'}

Please return JSON with:
1. "summaryBengali": Concise 2-sentence explanation of root issue in Bengali.
2. "nocSteps": Array of 4 technical step-by-step diagnostic/fix instructions for NOC team in Bengali.
3. "clientReplyBengali": Polite professional status update SMS/WhatsApp draft for client in Bengali.
4. "recommendedPriority": "Urgent" | "High" | "Medium" | "Low"
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        mode: "ai",
        ...parsed
      });
    } catch (error: any) {
      console.error("AI NOC Diagnosis Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI diagnostic report",
      });
    }
  });

  // Setup Vite Dev Middleware or Static Server
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Delta Mithapukur Support Server listening on port ${PORT}`);
  });
}

startServer();
