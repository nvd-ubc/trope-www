import type { HTMLAttributes } from 'react'

type TableProps = HTMLAttributes<HTMLTableElement>

export function Table({ className, ...props }: TableProps) {
  const classes = ['w-full border-collapse text-sm', className].filter(Boolean).join(' ')
  return <table className={classes} {...props} />
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  const classes = ['bg-slate-50 text-xs uppercase tracking-wide text-slate-500', className]
    .filter(Boolean)
    .join(' ')
  return <thead className={classes} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  const classes = ['border-b border-slate-100', className].filter(Boolean).join(' ')
  return <tr className={classes} {...props} />
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  const classes = ['px-3 py-3 text-slate-700', className].filter(Boolean).join(' ')
  return <td className={classes} {...props} />
}

export function TableHeaderCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  const classes = ['px-3 py-3 text-left font-semibold text-slate-600', className]
    .filter(Boolean)
    .join(' ')
  return <th className={classes} {...props} />
}
