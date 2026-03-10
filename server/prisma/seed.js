import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { user_name: "admin" },
    update: {},
    create: {
      user_name: "admin",
      password: "1234",
      first_name: "Admin",
      last_name: "User",
      email: "admin@lawfirm.com",
      phone_no: "1234567890",
      role: "Admin",
    },
  });

  const lawyer = await prisma.lawyer.upsert({
    where: { lawyer_name: "Adv. Sharma" },
    update: {},
    create: {
      lawyer_name: "Adv. Sharma",
      specialization: "Corporate Law",
      phone_no: "9876543210",
      contact: "sharma@lawfirm.com",
      case_count: 12,
    },
  });

  const client = await prisma.client.upsert({
    where: { email: "client1@firm.com" },
    update: {},
    create: {
      client_name: "Rajesh Kumar",
      address: "123 Main St",
      phone_no: "911234567890",
      email: "client1@firm.com",
      password: "client123",
    },
  });

  const case1 = await prisma.case.upsert({
    where: { title: "Property Dispute" },
    update: {},
    create: {
      title: "Property Dispute",
      filing_date: new Date("2026-03-01"),
      type: "Civil",
      status: "Open",
      client_id: client.client_id,
      lawyer_id: lawyer.lawyer_id,
    },
  });

  await prisma.document.create({
    data: {
      file_path: "/storage/prop-dispute.pdf",
      doc_type: "Evidence",
      case_id: case1.case_id,
    },
  });

  await prisma.hearing.create({
    data: {
      case_id: case1.case_id,
      judge: "Hon. Justice Verma",
      hearing_date: new Date("2026-03-20"),
      outcome: "Pending",
    },
  });

  await prisma.report.create({
    data: {
      case_id: case1.case_id,
      summary: "Case in pre-trial stage",
    },
  });

  await prisma.assignment.create({
    data: {
      lawyer_id: lawyer.lawyer_id,
      case_id: case1.case_id,
    },
  });

  await prisma.notification.create({
    data: {
      message: "Hearing scheduled for Property Dispute",
      user_id: admin.user_id,
    },
  });

  console.log("Seed data created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
