import React, { useState, useMemo } from 'react';
import { 
  Home, 
  CheckSquare, 
  Settings, 
  Plus, 
  Calendar as CalendarIcon, 
  Search, 
  CheckCircle2,
  Circle,
  ChevronDown,
  X,
  Briefcase,
  Clock,
  AlignLeft,
  Tag,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  Palette
} from 'lucide-react';

const TODAY = '2026-06-10';
const TAILWIND_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
  'bg-green-500', 'bg-teal-500', 'bg-blue-500', 
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
];

const MONTHS_NAME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const THEMES = [
  {
    id: 'teal',
    name: 'Teal (Default)',
    mainBg: 'bg-[#285c54]',
    mainText: 'text-[#285c54]',
    mainBorder: 'border-[#285c54]',
    hoverBg: 'hover:bg-[#1e4740]',
    lightBg: 'bg-[#eef7f5]',
    accentText: 'text-[#a7d3cb]'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    mainBg: 'bg-blue-700',
    mainText: 'text-blue-700',
    mainBorder: 'border-blue-700',
    hoverBg: 'hover:bg-blue-800',
    lightBg: 'bg-blue-50',
    accentText: 'text-blue-200'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    mainBg: 'bg-purple-700',
    mainText: 'text-purple-700',
    mainBorder: 'border-purple-700',
    hoverBg: 'hover:bg-purple-800',
    lightBg: 'bg-purple-50',
    accentText: 'text-purple-200'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [userName, setUserName] = useState('Tata');
  const [theme, setTheme] = useState(THEMES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- SHARED STATE ---
  const [categories, setCategories] = useState([
    { name: 'Audit', color: 'bg-purple-500' },
    { name: 'Content Pipeline', color: 'bg-orange-500' }
  ]);
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review Marketing Copy', category: 'Content Pipeline', done: true, date: TODAY, time: '10:00', isAllDay: false, details: 'Review semua copy.' }
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'United Tractors',
      startDate: '2026-06-06',
      endDate: '2026-08-06',
      category: 'Audit',
      progress: 33,
      actions: [
        { id: 101, text: 'Compile asset inventory', date: '2026-06-09', isCompleted: true },
        { id: 102, text: 'Review visual identity compliance', date: TODAY, isCompleted: false },
        { id: 103, text: 'Draft presentation', date: '2026-06-15', isCompleted: false }
      ]
    }
  ]);

  // --- CALENDAR & FILTER STATES ---
  const [calMonth, setCalMonth] = useState(5); 
  const [calYear, setCalYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState(TODAY); 

  // --- MODAL STATES ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  
  // --- FORM STATES ---
  const [taskForm, setTaskForm] = useState({
    title: '', date: TODAY, endDate: '', time: '', isAllDay: false, details: '', category: '', projectId: ''
  });
  
  const [projectForm, setProjectForm] = useState({
    id: null, title: '', startDate: TODAY, endDate: '', category: '',
    actions: [{ id: Date.now(), text: '', date: TODAY, isCompleted: false }]
  });

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(TAILWIND_COLORS[0]);

  const [editingAction, setEditingAction] = useState(null); 
  const [newInlineAction, setNewInlineAction] = useState({ projectId: null, text: '', date: TODAY });

  // --- UTILS ---
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const monthOptions = useMemo(() => {
    let opts = [];
    for(let y = 2026; y <= 2030; y++) {
      let startM = (y === 2026) ? 5 : 0;
      for(let m = startM; m < 12; m++) {
        opts.push({ label: `${MONTHS_NAME[m]} ${y}`, m, y });
      }
    }
    return opts;
  }, []);

  const TABS = [
    { name: 'Dashboard', icon: Home },
    { name: 'My Tasks', icon: CalendarIcon },
    { name: 'Projects', icon: Briefcase },
    { name: 'Settings', icon: Settings }
  ];

  // --- HANDLERS ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryInput.trim() && !categories.find(c => c.name === newCategoryInput.trim())) {
      const newCat = { name: newCategoryInput.trim(), color: newCategoryColor };
      setCategories([...categories, newCat]);
      setTaskForm({ ...taskForm, category: newCat.name });
      setProjectForm({ ...projectForm, category: newCat.name });
      setNewCategoryInput('');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskForm.title) return;

    if (taskForm.projectId) {
      setProjects(projects.map(p => {
        if (p.id === parseInt(taskForm.projectId)) {
          const newAction = { id: Date.now(), text: taskForm.title, date: taskForm.date, isCompleted: false };
          const updatedActions = [...p.actions, newAction];
          const total = updatedActions.length;
          const completed = updatedActions.filter(a => a.isCompleted).length;
          return { ...p, actions: updatedActions, progress: Math.round((completed / total) * 100) };
        }
        return p;
      }));
    } else {
      const newTask = { ...taskForm, id: Date.now(), done: false };
      setTasks([...tasks, newTask]);
    }
    setTaskForm({ title: '', date: TODAY, endDate: '', time: '', isAllDay: false, details: '', category: '', projectId: '' });
    setIsTaskModalOpen(false);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectForm.title) return;
    
    const totalActions = projectForm.actions.length;
    const completedActions = projectForm.actions.filter(a => a.isCompleted).length;
    const progress = totalActions === 0 ? 0 : Math.round((completedActions / totalActions) * 100);

    if (isEditingProject) {
      setProjects(projects.map(p => p.id === projectForm.id ? { ...projectForm, progress } : p));
    } else {
      const newProject = { ...projectForm, id: Date.now(), progress };
      setProjects([...projects, newProject]);
    }
    setProjectForm({ id: null, title: '', startDate: TODAY, endDate: '', category: '', actions: [{ id: Date.now(), text: '', date: TODAY, isCompleted: false }] });
    setIsProjectModalOpen(false);
    setIsEditingProject(false);
  };

  const openEditProject = (project) => {
    setProjectForm(project);
    setIsEditingProject(true);
    setIsProjectModalOpen(true);
  };

  const addProjectActionField = () => {
    setProjectForm({ ...projectForm, actions: [...projectForm.actions, { id: Date.now(), text: '', date: TODAY, isCompleted: false }] });
  };

  const updateProjectActionField = (id, field, value) => {
    setProjectForm({ ...projectForm, actions: projectForm.actions.map(a => a.id === id ? { ...a, [field]: value } : a) });
  };

  const removeProjectActionField = (id) => {
    setProjectForm({ ...projectForm, actions: projectForm.actions.filter(a => a.id !== id) });
  };

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const toggleProjectAction = (projectId, actionId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedActions = p.actions.map(a => a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a);
        const total = updatedActions.length;
        const completed = updatedActions.filter(a => a.isCompleted).length;
        return { ...p, actions: updatedActions, progress: Math.round((completed / total) * 100) };
      }
      return p;
    }));
  };

  const deleteProjectAction = (projectId, actionId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedActions = p.actions.filter(a => a.id !== actionId);
        const total = updatedActions.length;
        const completed = updatedActions.filter(a => a.isCompleted).length;
        return { ...p, actions: updatedActions, progress: total === 0 ? 0 : Math.round((completed / total) * 100) };
      }
      return p;
    }));
  };

  const saveInlineEditAction = () => {
    if (!editingAction.text) return;
    setProjects(projects.map(p => {
      if (p.id === editingAction.projectId) {
        const updatedActions = p.actions.map(a => a.id === editingAction.actionId ? { ...a, text: editingAction.text, date: editingAction.date } : a);
        return { ...p, actions: updatedActions };
      }
      return p;
    }));
    setEditingAction(null);
  };

  const addInlineAction = (projectId) => {
    if (!newInlineAction.text) return;
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedActions = [...p.actions, { id: Date.now(), text: newInlineAction.text, date: newInlineAction.date, isCompleted: false }];
        const total = updatedActions.length;
        const completed = updatedActions.filter(a => a.isCompleted).length;
        return { ...p, actions: updatedActions, progress: Math.round((completed / total) * 100) };
      }
      return p;
    }));
    setNewInlineAction({ projectId: null, text: '', date: TODAY });
  };

  const changeCalMonth = (offset) => {
    let newM = calMonth + offset; let newY = calYear;
    if (newM > 11) { newM = 0; newY++; } else if (newM < 0) { newM = 11; newY--; }
    if (newY < 2026 || (newY === 2026 && newM < 5)) return;
    if (newY > 2030) return;
    setCalMonth(newM); setCalYear(newY);
  };

  // --- DERIVED DATA & SEARCH LOGIC ---
  let sumCompleted = 0; let sumToDo = 0;
  tasks.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() === calMonth && d.getFullYear() === calYear) { if (t.done) sumCompleted++; else sumToDo++; }
  });
  projects.forEach(p => {
    p.actions.forEach(a => {
      const d = new Date(a.date);
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) { if (a.isCompleted) sumCompleted++; else sumToDo++; }
    });
  });
  const sumActiveProjects = projects.filter(p => {
    const start = new Date(p.startDate);
    const end = p.endDate ? new Date(p.endDate) : new Date(2099, 11, 31);
    const filterStart = new Date(calYear, calMonth, 1);
    const filterEnd = new Date(calYear, calMonth + 1, 0);
    return start <= filterEnd && end >= filterStart;
  }).length;

  let combinedAgenda = [];
  if (searchQuery.trim() !== '') {
    // If user is searching, find across all tasks/actions
    const query = searchQuery.toLowerCase();
    const matchedTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      (t.details && t.details.toLowerCase().includes(query))
    );
    const matchedActions = projects.flatMap(p => 
      p.actions.filter(a => a.text.toLowerCase().includes(query))
               .map(a => ({ ...a, isProjectAction: true, projectId: p.id, projectTitle: p.title }))
    );
    combinedAgenda = [...matchedTasks, ...matchedActions];
  } else {
    // Default agenda for selected date
    const agendaTasks = tasks.filter(t => t.date === selectedDate);
    const agendaProjectActions = projects.flatMap(p => 
      p.actions.filter(a => a.date === selectedDate).map(a => ({ ...a, isProjectAction: true, projectId: p.id, projectTitle: p.title }))
    );
    combinedAgenda = [...agendaTasks, ...agendaProjectActions];
  }

  // --- RENDERERS ---
  const renderDashboard = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
      <section className="xl:col-span-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Task Summary</h2>
          <div className="relative">
            <select 
              value={`${calMonth}-${calYear}`} 
              onChange={(e) => { const [m, y] = e.target.value.split('-'); setCalMonth(parseInt(m)); setCalYear(parseInt(y)); }}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 text-xs lg:text-sm font-medium shadow-sm cursor-pointer"
            >
              {monthOptions.map(opt => <option key={`${opt.m}-${opt.y}`} value={`${opt.m}-${opt.y}`}>{opt.label}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{sumCompleted}</span>
            <span className="text-xs lg:text-sm font-medium text-gray-600">Completed</span>
            <span className="text-[10px] lg:text-xs text-gray-400 mt-1">In {MONTHS_NAME[calMonth]}</span>
          </div>
          <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{sumToDo}</span>
            <span className="text-xs lg:text-sm font-medium text-gray-600">To Do</span>
            <span className="text-[10px] lg:text-xs text-gray-400 mt-1">In {MONTHS_NAME[calMonth]}</span>
          </div>
          <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center col-span-2 sm:col-span-1">
            <span className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{sumActiveProjects}</span>
            <span className="text-xs lg:text-sm font-medium text-gray-600">Projects</span>
            <span className="text-[10px] lg:text-xs text-gray-400 mt-1">Active in {MONTHS_NAME[calMonth]}</span>
          </div>
        </div>
      </section>

      <section className="xl:col-span-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">
            {searchQuery ? 'Search Results' : `Tasks for ${selectedDate}`}
          </h2>
        </div>
        <div className="space-y-3 lg:space-y-4">
          {combinedAgenda.filter(t => !(t.done || t.isCompleted)).slice(0, 5).map((item, idx) => {
            const catColorStr = item.isProjectAction 
              ? (categories.find(c => c.name === projects.find(p=>p.id === item.projectId)?.category)?.color)
              : (categories.find(c => c.name === item.category)?.color);
            return (
              <div key={idx} className="bg-white p-3 lg:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                  <button onClick={() => item.isProjectAction ? toggleProjectAction(item.projectId, item.id) : toggleTask(item.id)} className={`flex-shrink-0 text-gray-300 hover:${theme.mainText} transition`}>
                    <Circle className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm lg:text-base text-gray-800 truncate">{item.title || item.text}</h4>
                    <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 truncate">
                      {item.isProjectAction ? `Project: ${item.projectTitle}` : (item.category || 'Uncategorized')}
                    </p>
                  </div>
                </div>
                <div className={`w-1.5 lg:w-2 h-6 lg:h-8 rounded-full flex-shrink-0 ${catColorStr || 'bg-gray-400'}`} />
              </div>
            );
          })}
          {combinedAgenda.filter(t => !(t.done || t.isCompleted)).length === 0 && (
            <p className="text-xs lg:text-sm text-gray-500 italic text-center py-4 bg-white rounded-2xl border border-dashed border-gray-200">
              {searchQuery ? 'No tasks found matching your search.' : 'No uncompleted tasks for this date.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );

  const renderMyTasks = () => {
    const daysInMonth = getDaysInMonth(calMonth, calYear);
    const startDay = getFirstDayOfMonth(calMonth, calYear);
    
    return (
      <div className="flex flex-col gap-6 lg:gap-8 h-full">
        {/* Calendar Section */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex justify-between items-center mb-4 lg:mb-6 min-w-[300px]">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{MONTHS_NAME[calMonth]} {calYear}</h2>
            <div className="flex gap-2">
              <button onClick={() => changeCalMonth(-1)} className="p-1.5 lg:p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={calYear === 2026 && calMonth === 5}>
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button onClick={() => changeCalMonth(1)} className="p-1.5 lg:p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={calYear === 2030 && calMonth === 11}>
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-1 lg:mb-2 min-w-[300px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={day} className="text-center text-[10px] lg:text-sm font-semibold text-gray-400 py-1 lg:py-2">{window.innerWidth < 640 ? day.charAt(0) : day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 lg:gap-2 min-w-[300px]">
            {Array.from({length: startDay}).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[60px] lg:min-h-[100px] border border-gray-50 rounded-lg lg:rounded-xl bg-gray-50/50 p-1 lg:p-2"></div>
            ))}
            
            {Array.from({length: daysInMonth}).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === TODAY;
              
              const dayTasks = tasks.filter(t => t.date === dateStr);
              const activeProjectsForDay = projects.filter(p => dateStr >= p.startDate && (!p.endDate || dateStr <= p.endDate));

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[60px] lg:min-h-[110px] border rounded-lg lg:rounded-xl relative transition cursor-pointer flex flex-col overflow-hidden
                    ${isSelected ? `${theme.mainBorder} shadow-md ${theme.lightBg}` : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="w-full flex flex-col mb-0.5 lg:mb-1">
                    {activeProjectsForDay.map(p => {
                      const catColor = categories.find(c => c.name === p.category)?.color || 'bg-gray-500';
                      return (
                        <div key={`p-${p.id}`} className={`${catColor} text-transparent sm:text-white text-[8px] sm:text-[10px] px-0.5 sm:px-1.5 py-0.5 sm:truncate font-medium shadow-sm mb-[1px] h-1.5 sm:h-auto`}>
                          <span className="hidden sm:inline">{p.title}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="px-1 lg:px-2 pb-1 lg:pb-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-0.5 lg:mb-1">
                      <span className={`text-[10px] lg:text-sm font-bold w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-orange-500 text-white' : (isSelected ? `${theme.mainBg} text-white` : 'text-gray-600')}`}>
                        {day}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-hidden space-y-0.5 lg:space-y-1 mt-0.5 lg:mt-1">
                      {dayTasks.map(t => {
                        const catColor = categories.find(c => c.name === t.category)?.color || 'bg-gray-500';
                        return (
                          <div key={`t-${t.id}`} className="flex items-center gap-1 overflow-hidden">
                            <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full flex-shrink-0 ${catColor}`}></div>
                            <span className={`text-[8px] lg:text-[10px] font-medium truncate hidden sm:inline ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.title}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Agenda Section */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 flex-1">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
            <Clock className={`w-5 h-5 lg:w-6 lg:h-6 ${theme.mainText}`} />
            {searchQuery ? 'Search Results' : 'Agenda'} <span className="text-xs lg:text-sm font-normal text-gray-500">({searchQuery ? `"${searchQuery}"` : selectedDate})</span>
          </h2>
          
          <div className="space-y-3 lg:space-y-4">
            {combinedAgenda.length === 0 ? (
              <p className="text-xs lg:text-sm text-gray-500 italic border border-dashed p-4 rounded-xl text-center">
                {searchQuery ? 'No tasks found.' : 'No tasks or actions scheduled for this date.'}
              </p>
            ) : (
              combinedAgenda.map((item, index) => {
                const isItemDone = item.done || item.isCompleted;
                const catColorStr = item.isProjectAction 
                  ? (categories.find(c => c.name === projects.find(p=>p.id === item.projectId)?.category)?.color)
                  : (categories.find(c => c.name === item.category)?.color);

                return (
                  <div key={index} className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border flex items-start gap-3 lg:gap-4 transition-all relative overflow-hidden ${isItemDone ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white shadow-sm'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${catColorStr || 'bg-gray-300'}`} />
                    <button 
                      onClick={() => item.isProjectAction ? toggleProjectAction(item.projectId, item.id) : toggleTask(item.id)} 
                      className={`flex-shrink-0 text-gray-400 hover:${theme.mainText} mt-0.5 ml-1 lg:ml-2`}
                    >
                      {isItemDone ? <CheckCircle2 className={`w-5 h-5 lg:w-6 lg:h-6 ${theme.mainText}`} /> : <Circle className="w-5 h-5 lg:w-6 lg:h-6" />}
                    </button>
                    <div className="flex-1 overflow-hidden">
                      <h4 className={`font-bold text-sm lg:text-base text-gray-800 truncate ${isItemDone ? 'line-through' : ''}`}>
                        {item.title || item.text}
                      </h4>
                      {item.isProjectAction ? (
                        <p className="text-[10px] lg:text-xs text-gray-500 font-medium mt-1 flex items-center gap-1 truncate">
                          <Briefcase className="w-3 h-3 flex-shrink-0" /> Project: {item.projectTitle}
                        </p>
                      ) : (
                        <div className="text-[10px] lg:text-xs text-gray-500 mt-1 flex gap-3 truncate">
                          {item.time && <span className="flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3"/> {item.time}</span>}
                          {item.category && <span className="flex items-center gap-1 truncate"><Tag className="w-3 h-3 flex-shrink-0"/> {item.category}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Active Projects</h2>
        <button 
          onClick={() => { setProjectForm({ id: null, title: '', startDate: TODAY, endDate: '', category: '', actions: [{ id: Date.now(), text: '', date: TODAY, isCompleted: false }] }); setIsEditingProject(false); setIsProjectModalOpen(true); }}
          className={`${theme.mainBg} text-white px-4 py-2 rounded-xl text-sm font-semibold ${theme.hoverBg} transition flex items-center justify-center gap-2`}
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {projects.map(project => {
        const catColor = categories.find(c => c.name === project.category)?.color || 'bg-gray-500';
        const sortedActions = [...project.actions].sort((a, b) => {
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          if (!a.isCompleted && !b.isCompleted) return a.date.localeCompare(b.date);
          return 0;
        });

        return (
          <div key={project.id} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm border border-gray-100 overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-full h-1 lg:h-1.5 ${catColor}`} />
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 mb-4 lg:mb-6 mt-1 lg:mt-2">
              <div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800">{project.title}</h3>
                  <button onClick={() => openEditProject(project)} className={`p-1.5 text-gray-400 hover:${theme.mainText} hover:${theme.lightBg} rounded-lg transition lg:opacity-0 lg:group-hover:opacity-100`}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 lg:w-4 lg:h-4" /> {project.startDate} to {project.endDate || 'Ongoing'}</span>
                  {project.category && <span className={`px-2 py-0.5 text-white rounded text-[10px] lg:text-xs ${catColor}`}>{project.category}</span>}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className={`text-xl lg:text-2xl font-bold ${theme.mainText}`}>{project.progress}%</span>
                <p className="text-[10px] lg:text-xs text-gray-400">Completed</p>
              </div>
            </div>
            
            <div className="space-y-2 lg:space-y-3 mt-4 border-t border-gray-50 pt-4">
              <h4 className="text-xs lg:text-sm font-bold text-gray-700 mb-2 lg:mb-3">Detailed Action Items</h4>
              
              {sortedActions.map(action => {
                const isEditing = editingAction?.actionId === action.id;
                const isDeadlineToday = action.date === TODAY && !action.isCompleted;

                return (
                  <div key={action.id} className={`flex items-center gap-2 lg:gap-3 p-2 rounded-xl transition border ${action.isCompleted ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 shadow-sm flex-wrap sm:flex-nowrap'}`}>
                    <button onClick={() => toggleProjectAction(project.id, action.id)} className="flex-shrink-0">
                      {action.isCompleted ? <CheckCircle2 className={`w-4 h-4 lg:w-5 lg:h-5 ${theme.mainText}`} /> : <Circle className={`w-4 h-4 lg:w-5 lg:h-5 text-gray-300 hover:${theme.mainText}`} />}
                    </button>
                    
                    {isEditing ? (
                      <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2 w-full">
                        <input type="text" value={editingAction.text} onChange={e => setEditingAction({...editingAction, text: e.target.value})} className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs lg:text-sm outline-none w-full sm:w-auto"/>
                        <input type="date" value={editingAction.date} onChange={e => setEditingAction({...editingAction, date: e.target.value})} className="border border-gray-200 rounded px-2 py-1 text-xs lg:text-sm outline-none"/>
                        <button onClick={saveInlineEditAction} className={`${theme.mainBg} text-white p-1.5 rounded ${theme.hoverBg}`}><Save className="w-3 h-3 lg:w-4 lg:h-4"/></button>
                        <button onClick={() => setEditingAction(null)} className="bg-gray-200 text-gray-600 p-1.5 rounded hover:bg-gray-300"><X className="w-3 h-3 lg:w-4 lg:h-4"/></button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs lg:text-sm flex-1 break-words ${action.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                          {action.text}
                        </span>
                        <span className={`text-[10px] lg:text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${isDeadlineToday ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 border border-transparent'}`}>
                          {action.date}
                        </span>
                        <div className="flex gap-1 ml-auto sm:ml-2">
                          <button onClick={() => setEditingAction({ projectId: project.id, actionId: action.id, text: action.text, date: action.date })} className={`p-1.5 text-gray-400 hover:${theme.mainText} hover:${theme.lightBg} rounded-lg transition`}><Edit2 className="w-3 h-3 lg:w-4 lg:h-4" /></button>
                          <button onClick={() => deleteProjectAction(project.id, action.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3 h-3 lg:w-4 lg:h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {newInlineAction.projectId === project.id ? (
                 <div className={`flex flex-col sm:flex-row sm:items-center gap-2 mt-4 p-2 lg:p-3 ${theme.lightBg} rounded-xl border border-gray-200`}>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                       <input autoFocus type="text" placeholder="Action detail..." value={newInlineAction.text} onChange={e => setNewInlineAction({...newInlineAction, text: e.target.value})} className="flex-1 border border-gray-200 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm outline-none"/>
                       <input type="date" value={newInlineAction.date} onChange={e => setNewInlineAction({...newInlineAction, date: e.target.value})} className="border border-gray-200 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm outline-none"/>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => addInlineAction(project.id)} className={`${theme.mainBg} text-white px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex-1 sm:flex-none justify-center flex`}>Add</button>
                       <button onClick={() => setNewInlineAction({ projectId: null, text: '', date: TODAY })} className="bg-gray-300 text-gray-700 px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex-1 sm:flex-none justify-center flex">Cancel</button>
                    </div>
                 </div>
              ) : (
                <button onClick={() => setNewInlineAction({ projectId: project.id, text: '', date: TODAY })} className={`mt-2 text-xs lg:text-sm ${theme.mainText} font-bold flex items-center gap-1 justify-center w-full py-2 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:${theme.lightBg} transition`}>
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4"/> Add New Action
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl">
      <div className="p-6 lg:p-8 border-b border-gray-100">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1 lg:mb-2">Preferences</h2>
        <p className="text-gray-500 text-xs lg:text-sm">Manage your profile and dashboard theme.</p>
      </div>
      
      <div className="p-6 lg:p-8 space-y-8 lg:space-y-10">
        <div>
          <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><User className="w-4 h-4"/> Display Name</label>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-gray-200 text-base lg:text-lg font-medium" 
          />
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-3 lg:mb-4 flex items-center gap-2"><Palette className="w-4 h-4"/> Dashboard Theme</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            {THEMES.map((t) => (
              <div 
                key={t.id}
                onClick={() => setTheme(t)}
                className={`border-2 rounded-xl p-3 lg:p-4 cursor-pointer transition-all ${theme.id === t.id ? `${t.mainBorder} ${t.lightBg} shadow-md` : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-2 lg:gap-3 mb-2">
                  <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full ${t.mainBg}`}></div>
                  <span className="font-bold text-sm lg:text-base text-gray-800">{t.name}</span>
                </div>
                <div className="flex gap-1">
                  <div className={`w-full h-1.5 lg:h-2 rounded-full ${t.mainBg}`}></div>
                  <div className={`w-1/2 h-1.5 lg:h-2 rounded-full ${t.mainBg} opacity-50`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. MOBILE HEADER (Sembunyi di Desktop) */}
      <header className={`lg:hidden ${theme.mainBg} text-white p-4 rounded-b-3xl flex justify-between items-center z-20 shadow-md flex-shrink-0`}>
        <div className="flex items-center gap-3">
           <div className={`w-10 h-10 rounded-full border-2 border-white/20 bg-black/20 flex items-center justify-center`}>
              <span className="font-bold text-lg uppercase">{userName.charAt(0)}</span>
           </div>
           <div>
             <h1 className="font-bold text-lg leading-tight tracking-wide flex items-center gap-1">
                <CheckSquare className="w-4 h-4 opacity-80" /> Tracker
             </h1>
             <p className={`text-[10px] ${theme.accentText}`}>Hello, {userName}</p>
           </div>
        </div>
      </header>

      {/* 2. DESKTOP SIDEBAR (Sembunyi di Mobile) */}
      <aside className={`hidden lg:flex w-64 ${theme.mainBg} text-white flex-shrink-0 flex-col rounded-r-3xl z-10 h-full transition-colors duration-300`}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-10 font-bold text-xl tracking-wide">
            <CheckSquare className={`w-6 h-6 ${theme.accentText}`} /> Tracker
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className={`w-20 h-20 rounded-full border-4 border-white/20 bg-black/20 flex items-center justify-center mb-4 shadow-lg`}>
              <span className="text-3xl font-bold uppercase">{userName.charAt(0)}</span>
            </div>
            <h2 className="font-semibold text-lg">{userName}</h2>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {TABS.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${activeTab === item.name ? 'bg-white/10 font-medium shadow-sm' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-10 pb-28 lg:pb-10 overflow-y-auto scrollbar-hide flex flex-col relative">
        <header className="hidden lg:flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{activeTab === 'Dashboard' ? `Hello, ${userName}` : activeTab}</h1>
            <p className="text-gray-500 mt-1">Wednesday, 10 June 2026</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..." 
                className={`pl-10 pr-4 py-2.5 bg-white rounded-full text-sm border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-full`} 
              />
            </div>
          </div>
        </header>

        {/* Mobile Search Bar & Title - Muncul hanya di HP */}
        <div className="lg:hidden mb-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..." 
              className="pl-9 pr-4 py-2 bg-white rounded-full text-xs border border-gray-100 shadow-sm focus:outline-none w-full" 
            />
          </div>
          <div className="flex justify-between items-end">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">{activeTab === 'Dashboard' ? `Overview` : activeTab}</h1>
            <p className="text-xs text-gray-500">10 Jun '26</p>
          </div>
        </div>

        <div className="flex-1 max-w-6xl w-full mx-auto">
          {activeTab === 'Dashboard' && renderDashboard()}
          {activeTab === 'My Tasks' && renderMyTasks()}
          {activeTab === 'Projects' && renderProjects()}
          {activeTab === 'Settings' && renderSettings()}
        </div>

        {/* GLOBAL FAB (Floating Action Button) */}
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className={`fixed bottom-20 right-4 lg:bottom-10 lg:right-10 w-14 h-14 lg:w-16 lg:h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-xl ${theme.hoverBg} hover:scale-105 transition-all z-30 group`}
          title="Add New Task"
        >
          <Plus className="w-6 h-6 lg:w-8 lg:h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </main>

      {/* 4. MOBILE BOTTOM NAVIGATION (Sembunyi di Desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 flex justify-around items-center h-16 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         {TABS.map((item) => {
           const isActive = activeTab === item.name;
           return (
             <button 
               key={item.name} 
               onClick={() => setActiveTab(item.name)} 
               className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? theme.mainText : 'text-gray-400'}`}
             >
               <item.icon className={`w-5 h-5 ${isActive ? 'fill-current opacity-20' : ''}`} />
               <span className="text-[9px] font-bold">{item.name}</span>
             </button>
           );
         })}
      </div>

      {/* --- ADD TASK MODAL OVERLAY --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center p-4 lg:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-base lg:text-lg font-bold text-gray-800">Create New Task</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 lg:p-2 rounded-full"><X className="w-4 h-4 lg:w-5 lg:h-5" /></button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-4 lg:p-6 space-y-4 lg:space-y-5">
              <div>
                <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2">Task Title</label>
                <input type="text" autoFocus required value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} placeholder="What needs to be done?" className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm lg:text-lg font-medium" />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2 flex items-center gap-1.5 lg:gap-2"><Briefcase className="w-3 h-3 lg:w-4 lg:h-4"/> Assign to Project</label>
                <select value={taskForm.projectId} onChange={(e) => setTaskForm({...taskForm, projectId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm outline-none focus:ring-1 focus:ring-gray-300 bg-white">
                  <option value="">-- No Project (Standalone Task) --</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-4 bg-gray-50 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-[10px] lg:text-xs font-bold text-gray-500 mb-1">Start Date</label>
                  <input type="date" required value={taskForm.date} onChange={(e) => setTaskForm({...taskForm, date: e.target.value})} className="w-full border border-gray-200 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] lg:text-xs font-bold text-gray-500 mb-1">End Date</label>
                  <input type="date" value={taskForm.endDate} onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})} className="w-full border border-gray-200 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm outline-none bg-white" />
                </div>
                <div className="col-span-2 flex flex-row items-center justify-between mt-1 pt-2 lg:mt-2 lg:pt-3 border-t border-gray-200 gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="allDay" checked={taskForm.isAllDay} onChange={(e) => setTaskForm({...taskForm, isAllDay: e.target.checked, time: ''})} className="w-3 h-3 lg:w-4 lg:h-4 rounded" />
                    <label htmlFor="allDay" className="text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap">All Day</label>
                  </div>
                  {!taskForm.isAllDay && <input type="time" value={taskForm.time} onChange={(e) => setTaskForm({...taskForm, time: e.target.value})} className="border border-gray-200 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm outline-none flex-1 bg-white" />}
                </div>
              </div>

              {!taskForm.projectId && (
                <div>
                  <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2 flex items-center gap-1.5 lg:gap-2"><Tag className="w-3 h-3 lg:w-4 lg:h-4"/> Category</label>
                  <select value={taskForm.category} onChange={(e) => setTaskForm({...taskForm, category: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm outline-none bg-white">
                    <option value="" disabled>{categories.length === 0 ? "No categories" : "Select category..."}</option>
                    {categories.map((cat, i) => <option key={i} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              )}

              <button type="submit" className={`w-full bg-gray-900 text-white font-bold py-3 lg:py-3.5 rounded-xl ${theme.hoverBg} transition mt-2 lg:mt-4 text-sm lg:text-base`}>Save Task</button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PROJECT MODAL OVERLAY --- */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 lg:p-6 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base lg:text-xl font-bold text-gray-800">{isEditingProject ? 'Edit Project' : 'Create Project'}</h3>
              <button onClick={() => { setIsProjectModalOpen(false); setIsEditingProject(false); }} className="text-gray-400 hover:bg-gray-100 p-1.5 lg:p-2 rounded-full"><X className="w-4 h-4 lg:w-5 lg:h-5" /></button>
            </div>
            
            <div className="overflow-y-auto p-4 lg:p-6 scrollbar-hide flex-1">
              <form id="projectForm" onSubmit={handleSaveProject} className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2">Project Title</label>
                  <input type="text" required value={projectForm.title} onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} placeholder="e.g., Q4 Campaign" className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-lg font-medium outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2">Start Date</label>
                    <input type="date" required value={projectForm.startDate} onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})} className="w-full border border-gray-200 rounded-xl px-2 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2">End Date</label>
                    <input type="date" value={projectForm.endDate} onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})} className="w-full border border-gray-200 rounded-xl px-2 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-1 lg:mb-2">Category & Color (Synced)</label>
                  <div className="flex flex-col gap-2 lg:gap-3 mb-2 lg:mb-3 bg-gray-50 p-2 lg:p-3 rounded-xl border border-gray-100">
                    <div className="flex gap-2">
                      <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} placeholder="Add new category..." className="flex-1 border border-gray-200 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm outline-none" />
                      <button type="button" onClick={handleAddCategory} className="bg-gray-200 text-gray-700 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold hover:bg-gray-300">Add</button>
                    </div>
                    <div className="flex gap-1.5 lg:gap-2 flex-wrap">
                      {TAILWIND_COLORS.map(color => (
                        <button type="button" key={color} onClick={() => setNewCategoryColor(color)} className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full ${color} ${newCategoryColor === color ? 'ring-2 ring-offset-1 ring-gray-800' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <select value={projectForm.category} onChange={(e) => setProjectForm({...projectForm, category: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm bg-white outline-none">
                    <option value="" disabled>{categories.length === 0 ? "No categories" : "Select category..."}</option>
                    {categories.map((cat, i) => <option key={i} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-4 lg:p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
               <button form="projectForm" type="submit" className={`w-full ${theme.mainBg} text-white font-bold py-2.5 lg:py-3.5 rounded-xl ${theme.hoverBg} transition text-sm lg:text-base`}>
                 {isEditingProject ? 'Save Changes' : 'Launch Project'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}