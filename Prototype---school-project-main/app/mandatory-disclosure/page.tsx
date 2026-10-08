'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Info } from 'lucide-react'
import Header from '@/components/header'
import { SiteFooter } from '@/components/home-sections'
import { useSchoolData } from '@/context/school-data-context'
import { CLASSES, ROSTER, SCHOOL_INFO, classRanking } from '@/lib/school-data'

type Row = [string, string]

function Table({ title, letter, rows }: { title: string; letter: string; rows: Row[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h2 className="flex items-center gap-3 bg-slate-900 px-5 py-3 text-lg font-bold text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-sm text-slate-900">{letter}</span>
        {title}
      </h2>
      <dl className="divide-y divide-slate-100">
        {rows.map(([k, v], i) => (
          <div key={k} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[48px_1fr_1fr] sm:gap-4">
            <span className="hidden font-semibold text-slate-400 sm:block">{i + 1}</span>
            <dt className="font-semibold text-slate-600">{k}</dt>
            <dd className="text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function MandatoryDisclosurePage() {
  const { data, ready } = useSchoolData()
  const teachers = new Set([...data.timetables['class-10A'], ...data.timetables.school].map((e) => e.teacher).filter((t) => t !== '—' && t !== 'All Faculty'))
  const latest = [...data.exams].filter((e) => e.published && data.marks[e.id]).sort((a, b) => b.date.localeCompare(a.date))[0]
  const ranked = latest ? CLASSES.flatMap((c) => classRanking(data.marks, latest, c)) : []
  const pass = ranked.length ? `${Math.round((ranked.filter((r) => r.result.passed).length / ranked.length) * 100)}%` : '–'
  const live = (v: string | number) => (ready ? String(v) : '…')

  const docOnRequest = 'Available at the school office (sample)'

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
            <FileText size={16} /> As per CBSE Affiliation Bye-Laws (Appendix IX)
          </p>
          <h1 className="text-3xl font-bold sm:text-5xl">Mandatory Public Disclosure</h1>
          <p className="mt-2 text-blue-100">{SCHOOL_INFO.name}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-12">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            This is a <strong>prototype</strong>. Registration numbers, certificates and dates below are sample values. A real CBSE school must publish its actual details and documents here.
          </p>
        </div>

        <Table
          letter="A"
          title="General information"
          rows={[
            ['Name of the school', SCHOOL_INFO.name],
            ['Affiliation no.', '0000000 (sample)'],
            ['School code', '00000 (sample)'],
            ['Complete address', SCHOOL_INFO.address],
            ['Principal name & qualification', `${SCHOOL_INFO.principal}, M.Sc., B.Ed.`],
            ['School email', SCHOOL_INFO.email],
            ['Contact number', SCHOOL_INFO.phone],
          ]}
        />

        <Table
          letter="B"
          title="Documents and information"
          rows={[
            ['Copies of affiliation / upgradation letter and recent extension', docOnRequest],
            ['Society / Trust / Company registration and renewal certificate', docOnRequest],
            ['No objection certificate (NOC) issued by the State Govt / UT', docOnRequest],
            ['Recognition certificate under RTE Act, 2009', docOnRequest],
            ['Building safety certificate', docOnRequest],
            ['Fire safety certificate', docOnRequest],
            ['DEO certificate for self-certification', docOnRequest],
            ['Water, health and sanitation certificates', docOnRequest],
          ]}
        />

        <Table
          letter="C"
          title="Results and academics"
          rows={[
            ['Fee structure of the school', 'Tuition ₹5,000 per month, due on the 10th (₹60,000 per year)'],
            ['Annual academic calendar', 'See the Events page and the homepage calendar'],
            ['List of School Management Committee (SMC)', docOnRequest],
            ['List of Parent Teacher Association (PTA) members', docOnRequest],
            ['Last three-year board results', 'Not applicable to this prototype'],
            [latest ? `Pass percentage – ${latest.name}` : 'Pass percentage', live(pass)],
          ]}
        />

        <Table
          letter="D"
          title="Staff (teaching)"
          rows={[
            ['Principal', SCHOOL_INFO.principal],
            ['Total number of teachers', live(teachers.size)],
            ['Teacher–student ratio', live(`1 : ${Math.round(ROSTER.length / Math.max(1, teachers.size))}`)],
            ['Details of special educator', 'Sample – to be updated'],
            ['Details of counsellor and wellness teacher', 'Sample – to be updated'],
          ]}
        />

        <Table
          letter="E"
          title="School infrastructure"
          rows={[
            ['Total campus area of the school (in sq. m.)', 'Sample – to be updated'],
            ['Number and size of classrooms', `${CLASSES.length} classrooms in this prototype`],
            ['Number and size of laboratories including computer labs', 'Physics lab, Chemistry lab, Computer lab, Math lab'],
            ['Internet facility', 'Yes'],
            ['Number of girls’ toilets', 'Sample – to be updated'],
            ['Number of boys’ toilets', 'Sample – to be updated'],
            ['Link to YouTube video of the inspection of school', 'Sample – to be updated'],
          ]}
        />

        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:gap-3">
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
