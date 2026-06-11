import { cn } from '../../utils/cn';

function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={cn('rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
