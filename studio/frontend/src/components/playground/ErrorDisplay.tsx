import { ExclamationTriangleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ErrorDisplayProps {
  error: string
  type?: 'validation' | 'runtime' | 'timeout' | 'rate_limit' | 'general'
}

const ErrorDisplay = ({ error, type = 'general' }: ErrorDisplayProps) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'validation':
        return {
          icon: ExclamationTriangleIcon,
          title: 'Validation Error',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          suggestion: 'Please check your input parameters and ensure they match the required format.',
        }
      case 'runtime':
        return {
          icon: XCircleIcon,
          title: 'Runtime Error',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          suggestion: 'The tool encountered an error during execution. Check the error message for details.',
        }
      case 'timeout':
        return {
          icon: ClockIcon,
          title: 'Execution Timeout',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-500',
          suggestion: 'The tool execution exceeded the maximum allowed time (30 seconds). Try simplifying your operation.',
        }
      case 'rate_limit':
        return {
          icon: ExclamationTriangleIcon,
          title: 'Rate Limit Exceeded',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          iconColor: 'text-purple-500',
          suggestion: 'You have exceeded the rate limit for this tool. Please wait before trying again.',
        }
      default:
        return {
          icon: XCircleIcon,
          title: 'Error',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          suggestion: 'An error occurred. Please try again or contact support if the issue persists.',
        }
    }
  }

  const config = getErrorConfig()
  const Icon = config.icon

  // Detect error type from message if not explicitly provided
  const detectErrorType = (errorMsg: string): 'validation' | 'runtime' | 'timeout' | 'rate_limit' | 'general' => {
    const lowerError = errorMsg.toLowerCase()
    if (lowerError.includes('timeout') || lowerError.includes('exceeded') && lowerError.includes('seconds')) {
      return 'timeout'
    }
    if (lowerError.includes('rate limit') || lowerError.includes('too many')) {
      return 'rate_limit'
    }
    if (lowerError.includes('invalid') || lowerError.includes('validation') || lowerError.includes('required')) {
      return 'validation'
    }
    if (lowerError.includes('execution') || lowerError.includes('runtime')) {
      return 'runtime'
    }
    return 'general'
  }

  const detectedType = type === 'general' ? detectErrorType(error) : type
  const finalConfig = detectedType !== type ? getErrorConfig() : config

  return (
    <div className={`rounded-lg border ${finalConfig.borderColor} ${finalConfig.bgColor} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${finalConfig.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`text-sm font-semibold ${finalConfig.textColor} mb-1`}>
            {finalConfig.title}
          </h4>
          <p className={`text-sm ${finalConfig.textColor} mb-2 font-mono`}>
            {error}
          </p>
          <p className="text-xs text-slate-600 italic">
            💡 {finalConfig.suggestion}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay
