interface StatCardProps {
  label: string
  value: string | number
  helper?: string
}

const StatCard = ({ label, value, helper }: StatCardProps) => {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
    </div>
  )
}

export default StatCard