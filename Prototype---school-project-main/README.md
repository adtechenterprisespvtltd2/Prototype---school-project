# EduPro – School Management Portal (Prototype)

A school management prototype built with Next.js. Students, teachers, parents, the principal and the accounts office each get their own portal, and all of them share one set of school records — what a teacher marks shows up for the student and parent straight away.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Logging in

This is a prototype, so there are **no emails or passwords**. Go to `/login` and click a role card to enter that portal:

| Role | Opens | Demo user |
|---|---|---|
| Student | `/student-portal` | Alex Johnson (Class 10A, roll 12) |
| Teacher | `/teacher-portal` | Dr. Sarah Johnson (class teacher, 10A) |
| Parent | `/parent-portal` | Mrs. Emily Johnson (Alex's parent) |
| Principal | `/principal-portal` | Mr. David Brown |
| Accountant | `/accountant-portal` | Mr. Rajesh Kumar |

Each portal only opens for its own role.

## Main features

### Attendance
- **Teacher:** daily register (Present / Absent / Late / Leave) per class, "mark all present", absentee list with parent contact, and a monthly register that exports to CSV. Students under 75% are flagged.
- **Student / Parent:** colour-coded monthly calendar, term percentage, attendance streak and a warning if attendance drops below 75%.
- **Principal:** class-wise attendance for any day, students needing attention, and a 12-day trend.

### Results
- **Teacher:** enter marks in a grid per exam and subject (Enter jumps to the next student), see grades and class analysis live, create exams, and publish or unpublish results.
- **Student / Parent:** report card built from the published marks, with rank, class average per subject, progress across exams and suggested focus areas. Prints on its own page.
- **Principal:** school average, pass rate, subject averages, merit list (downloadable).

### Payment sheet (fees)
- **Accountant:** spreadsheet of every student's 12 monthly fees (₹5,000 due on the 10th) showing paid / part paid / overdue / upcoming. Record a payment, see which months it covers, print a receipt, send reminders, export to CSV.
- **Parent:** Fees tab with online payment — a payment appears on the accountant's sheet immediately.
- **Principal:** the same sheet, view-only.

### Homework
- **Teacher:** assign work to a class with due date, marks and an attachment; track submissions; grade and give feedback.
- **Student:** submit an answer and/or file, see due dates and teacher feedback.
- **Parent:** follow the child's homework and scores.

### Also included
Timetables, notices, notes, important questions, question papers, parent messaging, and the accountant's receipt generator and revenue report.

## About the data

All records are **sample data stored in the browser** (localStorage). Changes appear instantly across portals and browser tabs on the same computer, but other devices keep their own copy.

To start over before a demo, open the user menu (top right, or the ☰ menu on a phone) and choose **Reset demo data**.

For a real deployment the shared records would move to a database (e.g. Supabase or Neon).

## Project structure

```
app/                     Pages – one folder per portal, plus login, notices, events, etc.
components/
  school/                Attendance, results, fees and homework modules shared by the portals
  header.tsx             Navigation, user menu, reset demo data
  protected-route.tsx    Lets only the right role into each portal
context/
  auth-context.tsx       Who is logged in
  school-data-context.tsx  Shared school records, saved to localStorage
lib/
  school-data.ts         Student roster, sample data and grading / fee calculations
  timetable-data.ts      Timetables
```

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Lucide icons
