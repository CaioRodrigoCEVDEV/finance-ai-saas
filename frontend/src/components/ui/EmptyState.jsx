import Card from './Card';

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      {Icon ? <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"><Icon className="h-6 w-6" /></div> : null}
      <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}

export default EmptyState;
