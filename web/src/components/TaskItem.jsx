import { Trash2, Circle, CheckCircle2 } from 'lucide-react';

export default function TaskItem({ task, onToggle, onDelete }) {
  const isDone = task.status === 'done';
  
  return (
    <div className="group bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all flex items-center gap-4">
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 transition-transform hover:scale-110"
      >
        {isDone ? (
          <CheckCircle2 className="w-6 h-6 text-accent" />
        ) : (
          <Circle className="w-6 h-6 text-gray-500 hover:text-accent transition-colors" />
        )}
      </button>
      
      <span
        className={`flex-1 transition-all ${
          isDone
            ? 'line-through text-gray-500'
            : 'text-gray-200'
        }`}
      >
        {task.title}
      </span>
      
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
