-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_no" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Lawyer" (
    "lawyer_id" SERIAL NOT NULL,
    "lawyer_name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "phone_no" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "case_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("lawyer_id")
);

-- CreateTable
CREATE TABLE "Client" (
    "client_id" SERIAL NOT NULL,
    "client_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone_no" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "Case" (
    "case_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "filing_date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,
    "lawyer_id" INTEGER,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("case_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "doc_id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "doc_type" TEXT NOT NULL,
    "case_id" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("doc_id")
);

-- CreateTable
CREATE TABLE "Hearing" (
    "hearing_id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "judge" TEXT NOT NULL,
    "hearing_date" TIMESTAMP(3) NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "Hearing_pkey" PRIMARY KEY ("hearing_id")
);

-- CreateTable
CREATE TABLE "Report" (
    "report_id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "assignment_id" SERIAL NOT NULL,
    "lawyer_id" INTEGER NOT NULL,
    "case_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Report_case_id_key" ON "Report"("case_id");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("lawyer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hearing" ADD CONSTRAINT "Hearing_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("lawyer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("case_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
