import FinancialTaskCard from './FinancialTaskCard';

function FinancialTaskList({ tasks, onToggleStatus, onEdit, onDelete, loading }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {tasks.map((task) => (
        <FinancialTaskCard
          key={task.id}
          task={task}
          loading={loading}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default FinancialTaskList;
