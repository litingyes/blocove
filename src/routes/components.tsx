import { createFileRoute, Outlet } from '@tanstack/react-router'

/**
 * Layout for the components tree. It renders nothing of its own: the index
 * route is the catalog and `$name` is an item page, so a shared shell would
 * show the catalog above every item.
 */
export const Route = createFileRoute('/components')({
  component: ComponentsLayout,
})

function ComponentsLayout() {
  return <Outlet />
}
