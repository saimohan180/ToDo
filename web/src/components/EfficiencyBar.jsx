import { TrendingUp, CheckCircle2, ListTodo } from 'lucide-react';

export default function EfficiencyBar({ total, completed, efficiency }) {
  const getEfficiencyColor = () => {
    if (efficiency >= 70) return 'from-accent to-emerald-400';
    if (efficiency >= 40) return 'from-yellow-400 to-amber-400';
    return 'from-red-400 to-rose-400';
  };

  const getTextColor = () => {
    if (efficiency >= 70) return 'text-accent';
    if (efficiency >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#161b22] rounded-2xl p-5 border border-[#30363d]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${efficiency >= 70 ? 'bg-accent/20' : efficiency >= 40 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
            <TrendingUp className={`w-5 h-5 ${getTextColor()}`} />
          </div>
          <span className="text-sm font-medium text-gray-400">Efficiency</span>
        </div>
        <span className={`text-3xl font-bold ${getTextColor()}`}>{efficiency}%</span>
      </div>
      
      <div className="w-full bg-[#21262d] rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getEfficiencyColor()} transition-all duration-500 rounded-full`}
          style={{ width: `${efficiency}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{completed} completed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ListTodo className="w-4 h-4 text-gray-400" />
          <span>{total} total</span>
        </div>
      </div>
    </div>
  );
}
