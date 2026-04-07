import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import {
  Layout,
  Plus,
  ArrowLeft,
  StickyNote,
  Type,
  Square,
  Circle,
  Trash2,
  Move,
  Link2,
  Palette,
  MoreVertical,
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Triangle,
  Diamond,
  X,
  Check,
  GripVertical,
} from 'lucide-react';

const STICKY_COLORS = [
  '#fef08a', // yellow
  '#bbf7d0', // green
  '#fecaca', // red
  '#bfdbfe', // blue
  '#e9d5ff', // purple
  '#fed7aa', // orange
  '#fce7f3', // pink
  '#ccfbf1', // teal
];

const CONNECTION_COLORS = [
  '#888888',
  '#ef4444',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f97316',
  '#ec4899',
];

// Board List View
function BoardList({ boards, onSelectBoard, onCreateBoard, onDeleteBoard }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const handleCreate = async () => {
    if (!newBoardName.trim()) return;
    await onCreateBoard({ name: newBoardName, description: newBoardDesc });
    setNewBoardName('');
    setNewBoardDesc('');
    setShowCreate(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Boards</h1>
              <p className="text-sm text-slate-400">Visual workspace for ideas</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            New Board
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Board</h2>
            <input
              type="text"
              placeholder="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newBoardDesc}
              onChange={(e) => setNewBoardDesc(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-20 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newBoardName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Grid */}
      <div className="flex-1 overflow-auto p-6">
        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <Layout className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No boards yet</h3>
            <p className="text-slate-500 mb-4">Create your first board to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
                onClick={() => onSelectBoard(board)}
              >
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: board.background || '#1a1a2e' }}
                >
                  <Layout className="w-12 h-12 text-white/20" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{board.name}</h3>
                  {board.description && (
                    <p className="text-sm text-slate-400 truncate mt-1">{board.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {board.element_count || 0} elements
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBoard(board.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Board Canvas View
function BoardCanvas({ board, elements, connections, onBack, onUpdate }) {
  const canvasRef = useRef(null);
  const [localElements, setLocalElements] = useState(elements);
  const [localConnections, setLocalConnections] = useState(connections);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [editingElement, setEditingElement] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);

  useEffect(() => {
    setLocalElements(elements);
    setLocalConnections(connections);
  }, [elements, connections]);

  const addElement = async (type, x = 200, y = 200) => {
    const defaultProps = {
      sticky: { width: 200, height: 150, color: '#fef08a', content: '' },
      text: { width: 300, height: 80, color: '#ffffff', content: 'Text' },
      shape: { width: 120, height: 120, color: '#3b82f6', shape_type: 'rectangle' },
    };
    
    const props = defaultProps[type] || defaultProps.sticky;
    const result = await api.boards.addElement(board.id, { type, x, y, ...props });
    setLocalElements([...localElements, result.element]);
    setSelectedElement(result.element.id);
    setTool('select');
  };

  const updateElement = async (elementId, updates) => {
    await api.boards.updateElement(board.id, elementId, updates);
    setLocalElements(localElements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = async (elementId) => {
    await api.boards.deleteElement(board.id, elementId);
    setLocalElements(localElements.filter(el => el.id !== elementId));
    setLocalConnections(localConnections.filter(
      c => c.from_element_id !== elementId && c.to_element_id !== elementId
    ));
    setSelectedElement(null);
  };

  const addConnection = async (fromId, toId) => {
    if (fromId === toId) return;
    const existing = localConnections.find(
      c => (c.from_element_id === fromId && c.to_element_id === toId) ||
           (c.from_element_id === toId && c.to_element_id === fromId)
    );
    if (existing) return;
    
    const result = await api.boards.addConnection(board.id, {
      from_element_id: fromId,
      to_element_id: toId,
    });
    setLocalConnections([...localConnections, result.connection]);
  };

  const deleteConnection = async (connectionId) => {
    await api.boards.deleteConnection(board.id, connectionId);
    setLocalConnections(localConnections.filter(c => c.id !== connectionId));
  };

  const getElementCenter = (el) => ({
    x: el.x + el.width / 2,
    y: el.y + el.height / 2,
  });

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else {
        setSelectedElement(null);
        setConnecting(null);
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (dragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragging.offsetX;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragging.offsetY;
      setLocalElements(localElements.map(el =>
        el.id === dragging.id ? { ...el, x, y } : el
      ));
    } else if (resizing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      const el = localElements.find(e => e.id === resizing.id);
      if (el) {
        const newWidth = Math.max(80, mouseX - el.x);
        const newHeight = Math.max(60, mouseY - el.y);
        setLocalElements(localElements.map(e =>
          e.id === resizing.id ? { ...e, width: newWidth, height: newHeight } : e
        ));
      }
    }
  };

  const handleCanvasMouseUp = async () => {
    if (dragging) {
      const el = localElements.find(e => e.id === dragging.id);
      if (el) await updateElement(el.id, { x: el.x, y: el.y });
    }
    if (resizing) {
      const el = localElements.find(e => e.id === resizing.id);
      if (el) await updateElement(el.id, { width: el.width, height: el.height });
    }
    setDragging(null);
    setResizing(null);
    setIsPanning(false);
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    
    if (tool === 'connect') {
      if (connecting) {
        addConnection(connecting, element.id);
        setConnecting(null);
      } else {
        setConnecting(element.id);
      }
      return;
    }
    
    setSelectedElement(element.id);
    api.boards.bringToFront(board.id, element.id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    setDragging({
      id: element.id,
      offsetX: mouseX - element.x,
      offsetY: mouseY - element.y,
    });
  };

  const handleResizeMouseDown = (e, element) => {
    e.stopPropagation();
    setResizing({ id: element.id });
  };

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    const isConnecting = connecting === element.id;
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move transition-shadow ${
          isSelected ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20' : ''
        } ${isConnecting ? 'ring-2 ring-green-500' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          zIndex: element.z_index || 0,
        }}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        onDoubleClick={() => setEditingElement(element.id)}
      >
        {/* Element Content */}
        {element.type === 'sticky' && (
          <div
            className="w-full h-full rounded-lg shadow-md p-3 overflow-hidden"
            style={{ backgroundColor: element.color }}
          >
            {editingElement === element.id ? (
              <textarea
                className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-800"
                value={element.content}
                onChange={(e) => {
                  setLocalElements(localElements.map(el =>
                    el.id === element.id ? { ...el, content: e.target.value } : el
                  ));
                }}
                onBlur={async () => {
                  await updateElement(element.id, { content: element.content });
                  setEditingElement(null);
                }}
                autoFocus
              />
            ) : (
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{element.content || 'Double-click to edit'}</p>
            )}
          </div>
        )}
        
        {element.type === 'text' && (
          <div className="w-full h-full flex items-center justify-center">
            {editingElement === element.id ? (
              <input
                type="text"
                className="w-full text-center bg-transparent focus:outline-none text-white text-lg font-medium"
                value={element.content}
                onChange={(e) => {
                  setLocalElements(localElements.map(el =>
                    el.id === element.id ? { ...el, content: e.target.value } : el
                  ));
                }}
                onBlur={async () => {
                  await updateElement(element.id, { content: element.content });
                  setEditingElement(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateElement(element.id, { content: element.content });
                    setEditingElement(null);
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="text-white text-lg font-medium">{element.content || 'Text'}</span>
            )}
          </div>
        )}
        
        {element.type === 'shape' && (
          <div className="w-full h-full flex items-center justify-center">
            {element.shape_type === 'circle' ? (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: element.color }}
              />
            ) : element.shape_type === 'triangle' ? (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: `${element.width / 2}px solid transparent`,
                  borderRight: `${element.width / 2}px solid transparent`,
                  borderBottom: `${element.height}px solid ${element.color}`,
                }}
              />
            ) : element.shape_type === 'diamond' ? (
              <div
                className="w-3/4 h-3/4 rotate-45"
                style={{ backgroundColor: element.color }}
              />
            ) : (
              <div
                className="w-full h-full rounded-lg"
                style={{ backgroundColor: element.color }}
              />
            )}
          </div>
        )}

        {/* Resize Handle */}
        {isSelected && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full cursor-se-resize hover:bg-cyan-400"
            onMouseDown={(e) => handleResizeMouseDown(e, element)}
          />
        )}
      </div>
    );
  };

  const renderConnection = (conn) => {
    const fromEl = localElements.find(e => e.id === conn.from_element_id);
    const toEl = localElements.find(e => e.id === conn.to_element_id);
    if (!fromEl || !toEl) return null;

    const from = getElementCenter(fromEl);
    const to = getElementCenter(toEl);

    return (
      <g key={conn.id}>
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={conn.color}
          strokeWidth={conn.stroke_width}
          strokeDasharray={conn.style === 'dashed' ? '8,4' : conn.style === 'dotted' ? '2,2' : ''}
          className="cursor-pointer hover:stroke-red-500"
          onClick={() => deleteConnection(conn.id)}
        />
        {/* Arrow head */}
        <polygon
          points={`0,-5 10,0 0,5`}
          fill={conn.color}
          transform={`translate(${to.x},${to.y}) rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI})`}
        />
      </g>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h2 className="font-semibold text-white">{board.name}</h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded-lg transition-colors ${tool === 'select' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-600'}`}
            title="Select"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => addElement('sticky', 150 + Math.random() * 200, 150 + Math.random() * 200)}
            className={`p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-600`}
            title="Add Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
          </button>
          <button
            onClick={() => addElement('text', 150 + Math.random() * 200, 150 + Math.random() * 200)}
            className={`p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-600`}
            title="Add Text"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => addElement('shape', 150 + Math.random() * 200, 150 + Math.random() * 200)}
            className={`p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-600`}
            title="Add Shape"
          >
            <Square className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-600 mx-1" />
          <button
            onClick={() => setTool(tool === 'connect' ? 'select' : 'connect')}
            className={`p-2 rounded-lg transition-colors ${tool === 'connect' ? 'bg-green-500 text-white' : 'text-slate-400 hover:bg-slate-600'}`}
            title="Connect Elements"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-slate-400" />
          </button>
          <span className="text-sm text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        style={{ backgroundColor: board.background || '#1a1a2e' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* Grid Background */}
        <div
          className="canvas-bg absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* Connecting Line Preview */}
        {connecting && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm z-50">
            Click another element to connect, or click empty space to cancel
          </div>
        )}

        {/* Transform Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Connections SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <g className="pointer-events-auto">
              {localConnections.map(renderConnection)}
            </g>
          </svg>

          {/* Elements */}
          {localElements.map(renderElement)}
        </div>
      </div>

      {/* Selected Element Panel */}
      {selectedElement && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-xl">
          {(() => {
            const element = localElements.find(e => e.id === selectedElement);
            if (!element) return null;
            
            return (
              <>
                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker ? null : element.id)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Change Color"
                  >
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: element.color }} />
                  </button>
                  {showColorPicker === element.id && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-800 border border-slate-700 rounded-lg flex gap-1">
                      {STICKY_COLORS.map(color => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded ${element.color === color ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            updateElement(element.id, { color });
                            setShowColorPicker(null);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Shape type for shapes */}
                {element.type === 'shape' && (
                  <div className="flex items-center gap-1 border-l border-slate-600 pl-2">
                    {[
                      { type: 'rectangle', icon: Square },
                      { type: 'circle', icon: Circle },
                      { type: 'triangle', icon: Triangle },
                      { type: 'diamond', icon: Diamond },
                    ].map(({ type, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => updateElement(element.id, { shape_type: type })}
                        className={`p-2 rounded-lg transition-colors ${
                          element.shape_type === type ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteElement(element.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors border-l border-slate-600 pl-2 ml-1"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Main Boards Component
export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await api.boards.list();
      setBoards(data);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectBoard = async (board) => {
    try {
      const data = await api.boards.get(board.id);
      setSelectedBoard(board);
      setBoardData(data);
    } catch (error) {
      console.error('Failed to load board:', error);
    }
  };

  const createBoard = async (board) => {
    try {
      const result = await api.boards.create(board);
      setBoards([result.board, ...boards]);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const deleteBoard = async (id) => {
    if (!confirm('Delete this board? This cannot be undone.')) return;
    try {
      await api.boards.delete(id);
      setBoards(boards.filter(b => b.id !== id));
      if (selectedBoard?.id === id) {
        setSelectedBoard(null);
        setBoardData(null);
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const handleBack = () => {
    setSelectedBoard(null);
    setBoardData(null);
    loadBoards();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (selectedBoard && boardData) {
    return (
      <BoardCanvas
        board={boardData.board}
        elements={boardData.elements}
        connections={boardData.connections}
        onBack={handleBack}
      />
    );
  }

  return (
    <BoardList
      boards={boards}
      onSelectBoard={selectBoard}
      onCreateBoard={createBoard}
      onDeleteBoard={deleteBoard}
    />
  );
}
