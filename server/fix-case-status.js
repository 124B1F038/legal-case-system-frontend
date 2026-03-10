// One-shot: sync Case status for any existing Hearings that are Closed/Resolved
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const hearings = await prisma.hearing.findMany({
  where: { outcome: { in: ["Closed", "Resolved"] } },
});

for (const h of hearings) {
  await prisma.case.update({
    where: { case_id: h.case_id },
    data: { status: h.outcome },
  });
  console.log(`✅  Case #${h.case_id} -> ${h.outcome}`);
}

console.log(`Done. Fixed ${hearings.length} case(s).`);
await prisma.$disconnect();
