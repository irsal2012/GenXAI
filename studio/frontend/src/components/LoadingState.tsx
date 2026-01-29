interface LoadingStateProps {
  message?: string
}

const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return (
    <div className="card flex items-center justify-center p-10 text-sm text-slate-500">{message}</div>
  )
}

export default LoadingState