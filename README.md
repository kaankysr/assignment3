Arda Kaan Kayserlioğlu 2100004912

# Assignment 3: Task Manager with a Reducer

## Bonus 1: Undo
The reducer state shape is `{ tasks: Task[]; filter: Filter; past: Task[][] }`, where `past` acts as a history stack storing snapshots of previous `tasks` arrays before any task-modifying action (`add`, `advance`, `remove`, or `clearDone`). Changing the active filter (`setFilter`) does not push to `past`, while dispatching `undo` pops the most recent task list back into `tasks` and removes that snapshot from `past`.

## Bonus 2: Tests
```text
RUN  v5.1.0 C:/Users/Admin/Downloads/starter/assignment3

 ✓ src/taskReducer.test.ts (9 tests) 9ms
   ✓ taskReducer (8)
     ✓ adds a task with status todo 3ms
     ✓ advances a task through todo -> in-progress -> done -> todo 0ms
     ✓ removes a task by id 0ms
     ✓ changes filter without altering tasks or past history 1ms
     ✓ clears only done tasks and preserves filter 0ms
     ✓ supports undo for task changes and ignores undo when past is empty 0ms
     ✓ never mutates the previous state (Object.freeze check) 1ms
     ✓ handles edge cases: unknown id and clearDone with no done tasks 0ms
   ✓ filterTasks and countByFilter (1)
     ✓ filters tasks and calculates accurate counts including empty and post-delete states 1ms

 Test Files  1 passed (1)
      Tests  9 passed (9)


## Bonus 3: Explain your reducer
A reducer must be a pure function because React relies on referential equality (Object.is) to detect state changes and schedule re-renders. If a reducer mutates the existing state object or array in place, the object reference remains identical, causing React to skip updating the UI and breaking features like time-travel debugging or undo history.

The caller generates the task ID using crypto.randomUUID() rather than the reducer because random value generation is a side effect. Keeping side effects outside the reducer ensures that calling taskReducer(state, action) with identical inputs always produces the exact same output, making the logic deterministic and straightforward to unit test without mocking.

The filtered task list and status counts are derived during rendering instead of being stored in state to maintain a single source of truth. Storing filteredTasks or counts separately would risk synchronization bugs—for instance, deleting a task or advancing its status could update tasks while leaving the stored counts or visible list stale and out of sync.

Moving filter into the reducer state alongside tasks made state transitions centralized and predictable. Rather than coordinating multiple useState hooks across components, every user interaction is modeled explicitly as an action, making the entire state lifecycle self-contained and easy to verify in unit tests.

https://github.com/kaankysr/assignment3