interface ErrorStateProps {
  message?: string
}

const ErrorState = ({ message = 'Something went wrong.' }: ErrorStateProps) => {
  return (
    <div className="card border border-red-100 bg-red-50 p-6 text-sm text-red-700">{message}</div>
  )
}

export default ErrorState