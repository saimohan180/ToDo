import { useState } from 'react';
import { Plus, Send } from 'lucide-react';

export default function TaskInput({ onAdd, placeholder = "Add a task..." }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    
    if (trimmed) {
      onAdd(trimmed);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className={`relative flex items-center bg-[#161b22] border rounded-xl transition-all ${
        focused ? 'border-accent shadow-lg shadow-accent/10' : 'border-[#30363d]'
      }`}>
        <div className="pl-4">
          <Plus className={`w-5 h-5 transition-colors ${focused ? 'text-accent' : 'text-gray-500'}`} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-4 text-gray-200 placeholder-gray-500 focus:outline-none"
        />
        {input.trim() && (
          <button
            type="submit"
            className="mr-2 p-2 rounded-lg bg-accent text-dark-bg hover:bg-accent/90 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
