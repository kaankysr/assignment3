import { useReducer, type Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask}>
      <input name="title" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  )
}

function FilterBar({
  filter,
  counts,
  dispatch,
}: {
  filter: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
      {FILTERS.map((f) => {
        const isActive = filter === f
        return (
          <button
            key={f}
            type="button"
            aria-pressed={isActive}
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              fontWeight: isActive ? 'bold' : 'normal',
              border: isActive ? '2px solid currentColor' : '1px solid gray',
            }}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        )
      })}
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) {
    return <p>No tasks here.</p>
  }

  return (
    <ul>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // State içinde tutmadan render sırasında türetilen değerler (R6)
  const visibleTasks = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar filter={state.filter} counts={counts} dispatch={dispatch} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button type="button" onClick={() => dispatch({ type: 'clearDone' })}>
          Clear done
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'undo' })}
          disabled={state.past.length === 0}
        >
          Undo
        </button>
      </div>
      <TaskList tasks={visibleTasks} dispatch={dispatch} />
    </main>
  )
}
