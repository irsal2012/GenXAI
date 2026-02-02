import { ArrowDownTrayIcon, CommandLineIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline'

interface BottomToolbarProps {
  workflowName: string
  onSave: () => void
  onExport: () => void
  onRun: () => void
  isRunning?: boolean
  modelOverride?: string
  onModelOverrideChange?: (value: string) => void
  onResetModelOverride?: () => void
}

const BottomToolbar = ({
  workflowName,
  onSave,
  onExport,
  onRun,
  isRunning,
  modelOverride,
  onModelOverrideChange,
  onResetModelOverride,
}: BottomToolbarProps) => {
  return (
    <div className="group absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-4">
      <div className="h-2 w-32 rounded-full bg-slate-900/40 transition group-hover:w-40" />
      <div className="pointer-events-none absolute bottom-4 w-[680px] translate-y-full opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/90 px-6 py-4 text-slate-700 shadow-2xl backdrop-blur-xl dark:bg-slate-950/80 dark:text-slate-100">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Workflow</div>
            <div className="text-sm font-semibold">{workflowName}</div>
          </div>
          <div className="flex items-center gap-3">
            {onModelOverrideChange && (
              <div className="flex items-center gap-2">
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                  value={modelOverride || ''}
                  onChange={(event) => onModelOverrideChange(event.target.value)}
                  title="Override model for this run"
                >
                  <option value="">Default model</option>
                  <optgroup label="OpenAI Models">
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </optgroup>
                  <optgroup label="Anthropic Models (Claude)">
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</option>
                    <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </optgroup>
                </select>
                {onResetModelOverride && (
                  <button
                    type="button"
                    onClick={onResetModelOverride}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                    title="Reset to the global default model from Settings"
                    aria-label="Reset to the global default model"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onExport}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
            >
              <ArrowDownTrayIcon className="mr-2 inline h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              onClick={onRun}
              className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              {isRunning ? <PauseIcon className="mr-2 inline h-4 w-4" /> : <PlayIcon className="mr-2 inline h-4 w-4" />}
              {isRunning ? 'Running' : 'Run'}
            </button>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <CommandLineIcon className="mr-2 inline h-4 w-4" />
              Cmd + K
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomToolbar