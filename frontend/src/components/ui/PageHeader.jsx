import Card from './Card';

function PageHeader({ title, description, action }) {
  return (
    <Card className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Finance AI</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </Card>
  );
}

export default PageHeader;
