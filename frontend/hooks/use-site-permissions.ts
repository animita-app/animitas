import { useUser } from '@/contexts/user-context'

interface PermissionTarget {
  creator_id: string
}

export function useSitePermissions(site?: PermissionTarget | null) {
  const { currentUser, isEditor, isSuperadmin, isAuthenticated } = useUser()

  const isCreator = !!site && !!currentUser && currentUser.id === site.creator_id
  const canEdit = isEditor || isSuperadmin || isCreator
  const canDelete = isCreator || isSuperadmin
  const canManageInsights = isEditor || isSuperadmin

  return { isCreator, canEdit, canDelete, canManageInsights, isEditor, isSuperadmin, isAuthenticated, currentUser }
}
