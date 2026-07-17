import { cn } from '../../utils/cn';

function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft w-full max-w-full',
        'dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
