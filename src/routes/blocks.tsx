import { createFileRoute, Outlet } from '@tanstack/react-router'

/**
 * Layout for the blocks tree. Like the components layout it only provides the
 * route seam: the index route is the catalog and `$name` is a block page.
 */
export const Route = createFileRoute('/blocks')({
  component: BlocksLayout,
})

function BlocksLayout() {
  return <Outlet />
}
