# TaskFlow - Quick Start Guide

## Install & Run (30 seconds)

```bash
cd /opt/projects/ToDo
npm install          # Install dependencies (if not done)
npm run build:web    # Build frontend (if not done)
npm start            # Start on port 4010
```

**Open**: http://localhost:4010

---

## First Steps

### 1. Create Your First Project (1 minute)
1. Click **Projects** (📁) in sidebar
2. Click **+ New** button
3. Enter "Work" as name
4. Select blue color (#3b82f6)
5. Click **Create**

### 2. Add Tasks to Project (30 seconds)
1. Select "Work" project
2. Type "Review code" in input
3. Press Enter
4. Task appears in project!

### 3. Try the Focus Timer (2 minutes)
1. Click **Focus** (⏱️) in sidebar
2. Click **25** (25-minute preset)
3. Click **Start**
4. Watch the timer count down
5. Click **Pause** or **Reset** to stop

### 4. Add a Flexible Task (30 seconds)
1. Click **Just Todo** (📥) in sidebar
2. Type task title
3. Click **📅 Add Date** button
4. Pick a date
5. Select a project (optional)
6. Click **Add Task**

### 5. Check Your Calendar (30 seconds)
1. Click **Calendar** (📆) in sidebar
2. See monthly grid with stats
3. Click any day to view its tasks
4. Green = high efficiency, Yellow = medium, Red = low

---

## Key Features at a Glance

### Navigation (Sidebar)
- 📅 **Today** - Current day's tasks with date scroller
- 🌅 **Tomorrow** - Plan for tomorrow
- 📥 **Just Todo** - Inbox with flexible creation
- 📁 **Projects** - Organize by project
- ⏱️ **Focus** - Pomodoro timer + alarms
- 📆 **Calendar** - Monthly view
- ✅ **Done** - Completed tasks with filters

### Projects
- **Create**: Click + New
- **Colors**: 6 options (green, blue, orange, red, purple, pink)
- **Stats**: Shows total tasks, completed, efficiency %
- **Delete**: Hover over project, click 🗑️

### Focus Timer
- **Durations**: 15, 25, 45, 60 minutes
- **Controls**: Start, Pause, Reset
- **Sound**: Plays when timer completes
- **Stats**: Tracks sessions and minutes

### Enhanced Inbox
- **No Date**: Just type and add (traditional)
- **With Date**: Click date button, pick date
- **With Project**: Select from dropdown
- **Both**: Combine date + project

### Calendar
- **Navigate**: Previous/Next/Today buttons
- **View**: Click any day to see tasks
- **Colors**: Green ≥70%, Yellow 40-69%, Red <40%

---

## Common Tasks

### Mark Task Complete
- Click checkbox next to task
- Task shows strikethrough
- Stats update automatically

### Delete Task
- Hover over task
- Click 🗑️ button
- Confirms deletion

### Set an Alarm
1. Go to Focus page
2. Enter time (e.g., 14:30)
3. Click **Add**
4. Alarm will trigger at that time

### Filter Done Tasks
1. Go to Done page
2. Click: All / Today / Week / Month
3. View filtered completed tasks

---

## Port Configuration

**Default**: 4010

**Custom port**:
```bash
PORT=4020 npm start
```

**Dev mode** (hot reload):
```bash
npm run dev
```
- Backend: http://localhost:4010
- Frontend: http://localhost:5173

---

## Tips & Tricks

1. **Use Projects** for work/personal separation
2. **Date Scroller** in Today view for quick navigation
3. **Focus Timer** for productivity bursts
4. **Calendar** to see productivity trends
5. **Filters in Done** to review accomplishments
6. **Flexible Inbox** for capturing ideas quickly

---

## Troubleshooting

**Port already in use?**
```bash
PORT=4020 npm start
```

**Need to reset database?**
```bash
rm -rf data/taskflow.db*
npm start
# Database recreated automatically
```

**Build issues?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:web
npm start
```

---

## Next Steps

✅ Create 2-3 projects with different colors
✅ Add tasks to each project
✅ Try a 25-minute focus session
✅ Set an alarm for later today
✅ Use the date picker to schedule tasks
✅ Check the calendar view
✅ Complete some tasks and check Done page

---

## Documentation

- **README.md** - Complete documentation
- **README-ENHANCED.md** - New features guide
- **ENHANCED-COMPLETE.md** - Implementation summary
- **test-enhanced.sh** - Test all features

---

**Enjoy TaskFlow! 🚀**

*Local-first task management with projects, focus tools, and beautiful UI.*
