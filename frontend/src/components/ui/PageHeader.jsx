import Card from './Card';

function PageHeader({ title, description, action, eyebrow = 'FinanceAI', className = '' }) {
  return (
    <Card className={`flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between ${className}`}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-content-primary sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-content-secondary">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </Card>
  );
}

export default PageHeader;
