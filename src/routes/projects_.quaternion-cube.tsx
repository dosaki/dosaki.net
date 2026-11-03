import { createFileRoute } from '@tanstack/react-router'
import { QuaternionCube } from '../experiments/quaternion/QuaternionCube'

// The trailing underscore on `projects_` keeps the URL under /projects without
// nesting the page inside projects.tsx, which has no <Outlet>.
export const Route = createFileRoute('/projects_/quaternion-cube')({
  component: QuaternionCube,
})
