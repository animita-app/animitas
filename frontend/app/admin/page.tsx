import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { canAccessAdmin } from '@/lib/admin'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminUsersTab from '@/components/admin/admin-users-tab'
import AdminMemorialsTab from '@/components/admin/admin-memorials-tab'
import AdminListsTab from '@/components/admin/admin-lists-tab'

export default async function AdminPage() {
  const session = await getServerSession()

  if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
    redirect('/')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, memorials, and lists</p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="memorials">Memorials</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="memorials" className="space-y-4">
            <AdminMemorialsTab />
          </TabsContent>

          <TabsContent value="lists" className="space-y-4">
            <AdminListsTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
