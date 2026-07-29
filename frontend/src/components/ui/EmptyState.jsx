import Card from './Card';

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      {Icon ? <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div> : null}
      <h3 className="mt-5 text-xl font-semibold text-content-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-content-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}

export default EmptyState;
