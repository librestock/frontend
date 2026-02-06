// React 19 has useSyncExternalStore built-in
// This shim redirects packages that import from use-sync-external-store/shim
import { useSyncExternalStore } from 'react'

export { useSyncExternalStore }
export default useSyncExternalStore
