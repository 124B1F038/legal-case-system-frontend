import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding test data...\n");

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { user_name: "Admin" },
    update: {},
    create: {
      user_name:  "Admin",
      password:   "1234",
      first_name: "Admin",
      last_name:  "User",
      email:      "admin@legalms.com",
      phone_no:   "9000000001",
      role:       "admin",
    },
  });
  console.log("✅  Admin user:", admin.user_name);

  // ── 2. Client ─────────────────────────────────────────────────────────────
  const client = await prisma.client.upsert({
    where: { email: "john.doe@client.com" },
    update: {},
    create: {
      client_name: "John Doe",
      address:     "42 Baker Street, Mumbai",
      phone_no:    "9000000002",
      email:       "john.doe@client.com",
      password:    "1234",
    },
  });
  console.log("✅  Client:", client.client_name, "| Login email: john.doe@client.com | Pass: 1234");

  // ── 3. Lawyer (profile + login account) ───────────────────────────────────
  const lawyer = await prisma.lawyer.upsert({
    where: { email: "alex.sharma@lawfirm.com" },
    update: {},
    create: {
      lawyer_name:    "Alex Sharma",
      specialization: "Criminal Law",
      qualification:  "L.L.B, L.L.M",
      phone_no:       "9000000003",
      contact:        "alex.sharma@lawfirm.com",
      email:          "alex.sharma@lawfirm.com",
    },
  });
  console.log("✅  Lawyer:", lawyer.lawyer_name);

  await prisma.user.upsert({
    where: { user_name: "lawyer_alex" },
    update: {},
    create: {
      user_name:  "lawyer_alex",
      password:   "1234",
      first_name: "Alex",
      last_name:  "Sharma",
      email:      "lawyer.alex@legalms.com",
      phone_no:   "9000000033",
      role:       "lawyer",
    },
  });
  console.log("✅  Lawyer login: lawyer_alex / 1234");

  // ── 4. Judge (profile + login account) ────────────────────────────────────
  const judge = await prisma.judge.upsert({
    where: { email: "hon.patel@court.gov" },
    update: {},
    create: {
      judge_name:    "Hon. Rajesh Patel",
      qualification: "J.D., 20 years on bench",
      email:         "hon.patel@court.gov",
      phone_no:      "9000000004",
    },
  });
  console.log("✅  Judge:", judge.judge_name);

  await prisma.user.upsert({
    where: { user_name: "judge_patel" },
    update: {},
    create: {
      user_name:  "judge_patel",
      password:   "1234",
      first_name: "Rajesh",
      last_name:  "Patel",
      email:      "judge.patel@legalms.com",
      phone_no:   "9000000044",
      role:       "judge",
    },
  });
  console.log("✅  Judge login: judge_patel / 1234");

  // ── 5. Sample Case linked to Client & Lawyer ──────────────────────────────
  const existingCase = await prisma.case.findFirst({
    where: { title: "State vs. Doe (Sample)" },
  });

  if (!existingCase) {
    const sampleCase = await prisma.case.create({
      data: {
        title:       "State vs. Doe (Sample)",
        filing_date: new Date("2024-01-15"),
        type:        "Criminal",
        status:      "Open",
        client_id:   client.client_id,
        lawyer_id:   lawyer.lawyer_id,
      },
    });
    console.log("✅  Sample case:", sampleCase.title);

    await prisma.hearing.create({
      data: {
        case_id:      sampleCase.case_id,
        judge_id:     judge.judge_id,
        hearing_date: new Date("2024-03-20"),
        outcome:      "Pending",
      },
    });
    console.log("✅  Sample hearing created.");
  } else {
    console.log("ℹ️   Sample case already exists – skipping.");
  }

  console.log("\n🎉  Seeding complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Role     │ Username           │ Password");
  console.log("───────────┼────────────────────┼──────────");
  console.log("  Admin    │ Admin              │ 1234");
  console.log("  Client   │ john.doe@client.com│ 1234  (email-based login)");
  console.log("  Lawyer   │ lawyer_alex        │ 1234");
  console.log("  Judge    │ judge_patel        │ 1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌  Seed error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
