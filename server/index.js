import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ensure DB url is configured
if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Set DATABASE_URL in server/.env for PostgreSQL.");
}

// Nodemailer Config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password",
  },
});

async function sendEmail(to, subject, text) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Mock Email (SMTP credentials not configured):");
    console.log(`To: ${to}\nSubject: ${subject}\nText: ${text}\n`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Legal Management System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
  }
}

// Setup Uploads Directory and Multer
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
  }
});
const upload = multer({ storage: storage });

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health
app.get("/api/ping", (req, res) => res.json({ status: "ok" }));

// Dashboard metrics
app.get("/api/dashboard", async (req, res) => {
  try {
    const clients = await prisma.client.count();
    const lawyers = await prisma.lawyer.count();
    const cases = await prisma.case.count();
    const hearings = await prisma.hearing.count({ where: { outcome: "Pending" } });
    return res.json({ clients, lawyers, cases, hearings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to load dashboard stats" });
  }
});

app.get("/api/client-dashboard/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user and the associated client email
    const user = await prisma.user.findUnique({ where: { user_name: username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const client = await prisma.client.findUnique({ where: { email: user.email } });
    if (!client) {
      return res.status(404).json({ error: "Client profile not found" });
    }

    const clientId = client.client_id;
    
    const cases = await prisma.case.findMany({ where: { client_id: clientId }, include: { documents: true, hearings: true } });
    
    const openCasesCount = cases.filter(c => c.status === "Open").length;
    const documentsCount = cases.reduce((acc, curr) => acc + curr.documents.length, 0);
    
    // Find next hearing
    let nextHearing = null;
    let nextHearingDate = null;
    
    cases.forEach(c => {
      c.hearings.forEach(h => {
        if (h.outcome === "Pending") {
          const hDate = new Date(h.hearing_date);
          if (hDate > new Date()) {
            if (!nextHearingDate || hDate < nextHearingDate) {
              nextHearingDate = hDate;
              nextHearing = h;
            }
          }
        }
      });
    });

    let nextHearingText = "No upcoming hearings";
    if (nextHearingDate) {
      const diffTime = Math.abs(nextHearingDate - new Date());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nextHearingText = `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    // Unread messages - using notifications count for now
    const unreadMessagesCount = await prisma.notification.count({ where: { user_id: user.user_id } });

    return res.json({
      openCases: openCasesCount,
      pendingDocuments: documentsCount,
      nextHearing: nextHearingText,
      unreadMessages: unreadMessagesCount
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to load client dashboard stats" });
  }
});

// Get client profile ID by username
app.get("/api/client-profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { user_name: username } });
    if (!user || user.role !== "client") {
      return res.status(404).json({ error: "Client user not found" });
    }
    const client = await prisma.client.findUnique({ where: { email: user.email } });
    if (!client) {
      return res.status(404).json({ error: "Client profile not found" });
    }
    return res.json({ client_id: client.client_id, client_name: client.client_name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to load client profile" });
  }
});

// Users
app.post("/api/users/register", async (req, res) => {
  const { user_name, password, first_name, last_name, email, phone_no, role } = req.body;
  if (!user_name || !password || !first_name || !last_name || !email || !phone_no || !role) {
    return res.status(400).json({ error: "Missing required user fields." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { user_name } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = await prisma.user.create({ data: req.body });
    const response = { ...user };
    delete response.password;
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/users/login", async (req, res) => {
  const { user_name, password } = req.body;
  if (!user_name || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { user_name } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const response = { ...user };
    delete response.password;
    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Clients
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load clients" });
  }
});

app.post("/api/clients", async (req, res) => {
  const { client_name, address, phone_no, email, password } = req.body;
  if (!client_name || !address || !phone_no || !email || !password) {
    return res.status(400).json({ error: "All client fields are required." });
  }

  try {
    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Client with this email already exists." });
    }

    const client = await prisma.client.create({ data: req.body });
    res.status(201).json({ ...client, password: undefined });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/clients/signup", async (req, res) => {
  const { client_name, address, phone_no, email, user_name, password, first_name, last_name } = req.body;
  if (!client_name || !address || !phone_no || !email || !user_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "All signup fields are required." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { user_name } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const client = await prisma.client.create({ data: { client_name, address, phone_no, email, password } });
    const user = await prisma.user.create({ data: {
      user_name,
      password,
      first_name,
      last_name,
      email,
      phone_no,
      role: "client",
    }});

    const response = { client, user: { user_name: user.user_name, role: user.role, email: user.email } };
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/clients/login", async (req, res) => {
  const { user_name, password } = req.body;
  if (!user_name || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { user_name } });
    if (!user || user.role !== "client" || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const response = { ...user };
    delete response.password;
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Lawyers
app.get("/api/lawyers", async (req, res) => {
  try {
    const lawyers = await prisma.lawyer.findMany();
    res.json(lawyers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load lawyers" });
  }
});

app.post("/api/lawyers", async (req, res) => {
  const { lawyer_name, specialization, qualification, phone_no, contact, email, password, user_name, first_name, last_name } = req.body;
  
  if (!lawyer_name || !specialization || !qualification || !phone_no || !contact || !email || !password || !user_name || !first_name || !last_name) {
    return res.status(400).json({ error: "All lawyer and user fields are required." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { user_name } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingLawyer = await prisma.lawyer.findUnique({ where: { email } });
    if (existingLawyer) {
      return res.status(400).json({ error: "Lawyer with this email already exists." });
    }

    const lawyer = await prisma.lawyer.create({ 
      data: { lawyer_name, specialization, qualification, phone_no, contact, email } 
    });

    const user = await prisma.user.create({ data: {
      user_name,
      password,
      first_name,
      last_name,
      email,
      phone_no,
      role: "lawyer",
    }});

    res.status(201).json({ lawyer, user: { user_name: user.user_name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Judges
app.get("/api/judges", async (req, res) => {
  try {
    const judges = await prisma.judge.findMany();
    res.json(judges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load judges" });
  }
});

app.post("/api/judges", async (req, res) => {
  const { judge_name, qualification, email, phone_no, user_name, password, first_name, last_name } = req.body;
  if (!judge_name || !qualification || !email || !phone_no || !user_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "All judge and user fields are required." });
  }
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { user_name } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingJudge = await prisma.judge.findUnique({ where: { email } });
    if (existingJudge) {
      return res.status(400).json({ error: "Judge with this email already exists." });
    }

    const judge = await prisma.judge.create({ data: { judge_name, qualification, email, phone_no } });
    
    const user = await prisma.user.create({ data: {
      user_name,
      password,
      first_name,
      last_name,
      email,
      phone_no,
      role: "judge",
    }});

    res.status(201).json({ judge, user: { user_name: user.user_name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Cases
app.get("/api/cases", async (req, res) => {
  try {
    const cases = await prisma.case.findMany({ include: { client: true, lawyer: true, documents: true } });
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load cases" });
  }
});

app.post("/api/cases", async (req, res) => {
  const { title, filing_date, type, client_id } = req.body;
  if (!title || !filing_date || !type || !client_id) {
    return res.status(400).json({ error: "Title, filing date, type and client_id are required." });
  }
  try {
    const data = {
      ...req.body,
      filing_date: new Date(req.body.filing_date),
      status: req.body.status ?? "Open",
    };
    const created = await prisma.case.create({ data });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Documents
app.post("/api/documents", upload.single('file'), async (req, res) => {
  const { case_id, doc_type } = req.body;
  if (!case_id || !doc_type || !req.file) {
    return res.status(400).json({ error: "case_id, doc_type, and file are required." });
  }
  try {
    const file_path = '/uploads/' + req.file.filename;
    const doc = await prisma.document.create({ 
      data: {
        case_id: Number(case_id),
        doc_type,
        file_path
      } 
    });
    res.status(201).json(doc);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Hearings
app.get("/api/hearings", async (req, res) => {
  try {
    const hearings = await prisma.hearing.findMany({ include: { case: true, judge: true } });
    res.json(hearings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load hearings" });
  }
});

app.post("/api/hearings", async (req, res) => {
  const { case_id, judge_id, hearing_date, outcome } = req.body;
  if (!case_id || !judge_id || !hearing_date || !outcome) {
    return res.status(400).json({ error: "case_id, judge_id, hearing_date, and outcome are required." });
  }
  try {
    const hearing = await prisma.hearing.create({
      data: {
        case_id: Number(case_id),
        judge_id: Number(judge_id),
        hearing_date: new Date(hearing_date),
        outcome,
      },
      include: { judge: true, case: { include: { client: true, lawyer: true } } }
    });
    // Auto-notify all users about the new hearing
    const dateStr = new Date(hearing_date).toLocaleDateString("en-IN", { dateStyle: "medium" });
    await pushNotification(`📅 Hearing scheduled for Case #${case_id} on ${dateStr} (Judge: ${hearing.judge?.judge_name || 'TBD'})`);

    // Send email to client
    if (hearing.case?.client?.email) {
      const subject = `New Hearing Scheduled - Case #${case_id} (${hearing.case.title})`;
      const text = `Dear ${hearing.case.client.client_name},\n\nA new hearing has been scheduled for your case "${hearing.case.title}" (Case #${case_id}).\n\nDate: ${dateStr}\nJudge: ${hearing.judge?.judge_name || 'TBD'}\nOutcome Status: ${outcome}\n\nPlease check your portal dashboard for more details.\n\nRegards,\nLegal Management System Team`;
      await sendEmail(hearing.case.client.email, subject, text);
    }
    res.status(201).json(hearing);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/hearings/:id", async (req, res) => {
  const { id } = req.params;
  const { outcome, notes, hearing_date } = req.body;
  try {
    const hearingData = {};
    if (outcome) hearingData.outcome = outcome;
    if (notes !== undefined) hearingData.notes = notes;
    if (hearing_date) hearingData.hearing_date = new Date(hearing_date);

    const hearing = await prisma.hearing.update({
      where: { hearing_id: Number(id) },
      data: hearingData,
      include: { case: { include: { lawyer: true, client: true } }, judge: true },
    });

    // Sync the parent Case status when a terminal/active outcome is set
    if (outcome) {
      const terminalOutcomes = ["Resolved", "Closed"];
      const activeOutcomes   = ["Pending", "Scheduled", "Adjourned"];

      if (terminalOutcomes.includes(outcome)) {
        await prisma.case.update({
          where: { case_id: hearing.case_id },
          data: { status: outcome },
        });
        await pushNotification(`⚖️ Case #${hearing.case_id} has been ${outcome} by the judge.`);

        // Email Client about closure
        if (hearing.case?.client?.email) {
          await sendEmail(
            hearing.case.client.email,
            `Case Status Update - Case #${hearing.case_id} is now ${outcome}`,
            `Dear ${hearing.case.client.client_name},\n\nYour case "${hearing.case.title}" (Case #${hearing.case_id}) has been marked as ${outcome} by the judge.\n\nJudge's Remarks: ${notes || "None"}\n\nRegards,\nLegal Management System Team`
          );
        }

      } else if (activeOutcomes.includes(outcome)) {
        await prisma.case.update({
          where: { case_id: hearing.case_id },
          data: { status: "Open" },
        });
        await pushNotification(`🗓️ Hearing #${id} for Case #${hearing.case_id} rescheduled / status updated to ${outcome}.`);

        // Email Client about reschedule/update
        if (hearing.case?.client?.email) {
          const dateStr = new Date(hearingData.hearing_date || hearing.hearing_date).toLocaleDateString("en-IN", { dateStyle: "medium" });
          await sendEmail(
            hearing.case.client.email,
            `Hearing Update - Case #${hearing.case_id}`,
            `Dear ${hearing.case.client.client_name},\n\nThe hearing for your case "${hearing.case.title}" (Case #${hearing.case_id}) has been updated.\n\nNew Date: ${dateStr}\nStatus: ${outcome}\nRemarks: ${notes || "None"}\n\nRegards,\nLegal Management System Team`
          );
        }
      }
    }

    res.json(hearing);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Reports
app.post("/api/reports", async (req, res) => {
  const { case_id, summary } = req.body;
  if (!case_id || !summary) {
    return res.status(400).json({ error: "case_id and summary are required." });
  }
  try {
    const report = await prisma.report.create({ data: req.body });
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Helper: create notification for one or all users
async function pushNotification(message, user_id = null) {
  try {
    if (user_id) {
      await prisma.notification.create({ data: { message, user_id } });
    } else {
      // Broadcast to all users
      const users = await prisma.user.findMany({ select: { user_id: true } });
      await Promise.all(
        users.map(u => prisma.notification.create({ data: { message, user_id: u.user_id } }))
      );
    }
  } catch (e) {
    console.error("Notification push failed:", e.message);
  }
}

// Notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? { user_id: Number(user_id) } : {};
    const notes = await prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50,
    });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load notifications" });
  }
});

app.post("/api/notifications", async (req, res) => {
  const { message, user_id } = req.body;
  if (!message || !user_id) {
    return res.status(400).json({ error: "message and user_id are required." });
  }
  try {
    const note = await prisma.notification.create({ data: req.body });
    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    await prisma.notification.delete({ where: { notification_id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/notifications", async (req, res) => {
  const { user_id } = req.query;
  try {
    const where = user_id ? { user_id: Number(user_id) } : {};
    await prisma.notification.deleteMany({ where });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const startServer = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection OK");
  } catch (error) {
    console.error("Database connection failed:", error.message || error);
  }

  app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
};

startServer();
