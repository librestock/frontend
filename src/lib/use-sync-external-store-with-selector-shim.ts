// React 19 has useSyncExternalStore built-in
// This shim provides useSyncExternalStoreWithSelector for packages that need it
import { useRef, useSyncExternalStore } from 'react'

export { useSyncExternalStore }

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: undefined | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  const selectedRef = useRef<Selection | null>(null)

  const selection = useSyncExternalStore(
    subscribe,
    () => {
      const nextSnapshot = getSnapshot()
      const nextSelection = selector(nextSnapshot)

      if (selectedRef.current !== null && isEqual) {
        if (isEqual(selectedRef.current, nextSelection)) {
          return selectedRef.current
        }
      }

      selectedRef.current = nextSelection
      return nextSelection
    },
    getServerSnapshot ? () => selector(getServerSnapshot()) : undefined,
  )

  return selection
}
