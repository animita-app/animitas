'use client'

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { formatDate, getErrorMessage } from '@/lib/utils'
import { showSuccess, showError } from '@/lib/notifications'
import { apiPatch, apiDelete, apiGet } from '@/lib/api'

interface User {
  id: string
  phone: string | null
  username: string | null
  displayName: string | null
  email: string | null
  profilePicture: string | null
  role: string
  phoneVerified: string | null
  emailVerified: string | null
  instagramHandle: string | null
  tiktokHandle: string | null
  createdAt: string
  updatedAt: string
  _count: {
    candles: number
    testimonies: number
    memorialsCreated: number
    listsCreated: number
  }
}

interface PaginationState {
  page: number
  limit: number
  total: number
  pages: number
}


const formatBadge = (value: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    PREMIUM: 'bg-blue-100 text-blue-800',
    FREE: 'bg-gray-100 text-gray-800'
  }
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${colors[value] || ''}`}>
      {value}
    </span>
  )
}

export default function AdminUsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({ role: '', displayName: '' })

  const fetchUsers = async (page: number = 1) => {
    setLoading(true)
    try {
      const { data } = await apiGet(`/admin/users?page=${page}&limit=${pagination.limit}`)
      if (data) {
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      showError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(pagination.page)
  }, [])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      role: user.role,
      displayName: user.displayName || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      const { data, error } = await apiPatch('/admin/users', {
        userId: editingUser.id,
        data: editFormData
      })

      if (error) throw new Error(error)

      showSuccess('User updated successfully')
      setEditingUser(null)
      await fetchUsers(pagination.page)
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await apiDelete(`/admin/users?id=${userId}`)

      if (error) throw new Error(error)

      showSuccess('User deleted successfully')
      await fetchUsers(pagination.page)
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }

  const columns = [
    {
      key: 'username',
      label: 'Username',
      render: (value: string | null) => value || '-'
    },
    {
      key: 'displayName',
      label: 'Display Name',
      render: (value: string | null) => value || '-'
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string | null) => value || '-'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => formatBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => formatDate(value)
    },
    {
      key: '_count',
      label: 'Stats',
      render: (value: any) =>
        `📮 ${value.memorialsCreated} | 🕯️ ${value.candles} | 📝 ${value.testimonies} | 📋 ${value.listsCreated}`
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-2xl font-bold">{pagination.total}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === 'PREMIUM').length}
          </div>
          <div className="text-sm text-muted-foreground">Premium Users</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === 'FREE').length}
          </div>
          <div className="text-sm text-muted-foreground">Free Users</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => fetchUsers(pagination.page)}
      />

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input
                value={editFormData.displayName}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, displayName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editFormData.role} onValueChange={(value) =>
                setEditFormData((prev) => ({ ...prev, role: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
