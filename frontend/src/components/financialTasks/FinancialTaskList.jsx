import FinancialTaskCard from './FinancialTaskCard';

function FinancialTaskList({ tasks, onComplete, onEdit, onDelete, onGenerateTransaction, loading }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {tasks.map((task) => (
        <FinancialTaskCard
          key={task.id}
          task={task}
          loading={loading}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onGenerateTransaction={onGenerateTransaction}
        />
      ))}
    </div>
  );
}

export default FinancialTaskList;
