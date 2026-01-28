import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseStyles = 'rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl shadow-xl'
  const hoverStyles = hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 cursor-pointer' : ''
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
