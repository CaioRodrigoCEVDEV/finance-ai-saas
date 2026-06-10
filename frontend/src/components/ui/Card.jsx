import { cn } from '../../utils/cn';

function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={cn('rounded-3xl border border-slate-200 bg-white p-6 shadow-soft', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
