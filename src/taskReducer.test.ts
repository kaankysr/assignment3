import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State } from './taskReducer'
import { filterTasks, countByFilter } from './filter'

describe('taskReducer', () => {
  it('adds a task with status todo', () => {
    const state = taskReducer(initialState, { type: 'add', id: '1', title: 'Study React' })
    expect(state.tasks).toEqual([{ id: '1', title: 'Study React', status: 'todo' }])
    expect(state.filter).toBe('all')
  })

  it('advances a task through todo -> in-progress -> done -> todo', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('in-progress')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('done')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('todo')
  })

  it('removes a task by id', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'Task 2' })
    state = taskReducer(state, { type: 'remove', id: '1' })

    expect(state.tasks).toEqual([{ id: '2', title: 'Task 2', status: 'todo' }])
  })

  it('changes filter without altering tasks or past history', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    const pastBeforeFilter = state.past
    state = taskReducer(state, { type: 'setFilter', filter: 'done' })

    expect(state.filter).toBe('done')
    expect(state.tasks).toHaveLength(1)
    expect(state.past).toBe(pastBeforeFilter)
  })

  it('clears only done tasks and preserves filter', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Done task' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'Todo task' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'setFilter', filter: 'all' })

    state = taskReducer(state, { type: 'clearDone' })
    expect(state.tasks).toEqual([{ id: '2', title: 'Todo task', status: 'todo' }])
    expect(state.filter).toBe('all')
  })

  it('supports undo for task changes and ignores undo when past is empty', () => {
    const unchanged = taskReducer(initialState, { type: 'undo' })
    expect(unchanged).toBe(initialState)

    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'clearDone' })
    expect(state.tasks).toHaveLength(0)

    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks).toEqual([{ id: '1', title: 'Task 1', status: 'done' }])
  })

  it('never mutates the previous state (Object.freeze check)', () => {
    const frozenTask = Object.freeze({ id: '1', title: 'Immutable', status: 'todo' as const })
    const frozenState: State = Object.freeze({
      tasks: Object.freeze([frozenTask]) as unknown as State['tasks'],
      filter: 'all',
      past: Object.freeze([] as State['past']) as unknown as State['past'],
    })

    const nextState = taskReducer(frozenState, { type: 'advance', id: '1' })
    expect(nextState).not.toBe(frozenState)
    expect(nextState.tasks).not.toBe(frozenState.tasks)
    expect(frozenState.tasks[0].status).toBe('todo')
    expect(nextState.tasks[0].status).toBe('in-progress')
  })

  it('handles edge cases: unknown id and clearDone with no done tasks', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    const afterUnknownAdvance = taskReducer(state, { type: 'advance', id: 'non-existent' })
    expect(afterUnknownAdvance.tasks).toEqual(state.tasks)

    const afterUnknownRemove = taskReducer(state, { type: 'remove', id: 'non-existent' })
    expect(afterUnknownRemove.tasks).toEqual(state.tasks)

    const afterEmptyClear = taskReducer(state, { type: 'clearDone' })
    expect(afterEmptyClear.tasks).toEqual(state.tasks)
  })
})

describe('filterTasks and countByFilter', () => {
  it('filters tasks and calculates accurate counts including empty and post-delete states', () => {
    expect(filterTasks([], 'all')).toEqual([])
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })

    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'T1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'T2' })
    state = taskReducer(state, { type: 'add', id: '3', title: 'T3' })
    state = taskReducer(state, { type: 'advance', id: '2' })
    state = taskReducer(state, { type: 'advance', id: '3' })
    state = taskReducer(state, { type: 'advance', id: '3' })

    expect(filterTasks(state.tasks, 'all')).toHaveLength(3)
    expect(filterTasks(state.tasks, 'todo')).toHaveLength(1)
    expect(filterTasks(state.tasks, 'in-progress')).toHaveLength(1)
    expect(filterTasks(state.tasks, 'done')).toHaveLength(1)
    expect(countByFilter(state.tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })

    state = taskReducer(state, { type: 'remove', id: '2' })
    expect(countByFilter(state.tasks)).toEqual({ all: 2, todo: 1, 'in-progress': 0, done: 1 })
  })
})