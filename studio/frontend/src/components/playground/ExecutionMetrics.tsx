import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface ExecutionMetricsProps {
  executionTime?: number
  success?: boolean
  rateLimitStats?: {
    executions_last_minute: number
    executions_last_hour: number
    max_per_minute: number
    max_per_hour: number
    remaining_minute: number
    remaining_hour: number
  }
}

const ExecutionMetrics = ({ executionTime, success, rateLimitStats }: ExecutionMetricsProps) => {
  if (!executionTime && !rateLimitStats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Execution Time */}
      {executionTime !== undefined && (
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Execution Time</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {executionTime.toFixed(3)}s
          </div>
        </div>
      )}

      {/* Success Status */}
      {success !== undefined && (
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            {success ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium text-slate-700">Status</span>
          </div>
          <div
            className={`text-2xl font-bold ${
              success ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {success ? 'Success' : 'Failed'}
          </div>
        </div>
      )}

      {/* Rate Limit Stats */}
      {rateLimitStats && (
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-700 mb-2">Rate Limits</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Per Minute</span>
                <span>
                  {rateLimitStats.executions_last_minute}/{rateLimitStats.max_per_minute}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    rateLimitStats.remaining_minute < 10
                      ? 'bg-red-500'
                      : rateLimitStats.remaining_minute < 20
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${
                      (rateLimitStats.executions_last_minute /
                        rateLimitStats.max_per_minute) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Per Hour</span>
                <span>
                  {rateLimitStats.executions_last_hour}/{rateLimitStats.max_per_hour}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    rateLimitStats.remaining_hour < 100
                      ? 'bg-red-500'
                      : rateLimitStats.remaining_hour < 200
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${
                      (rateLimitStats.executions_last_hour / rateLimitStats.max_per_hour) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExecutionMetrics
