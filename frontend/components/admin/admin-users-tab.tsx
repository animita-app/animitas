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
import { format } from 'date-fns'

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

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
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
      const response = await fetch(`/api/admin/users?page=${page}&limit=${pagination.limit}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
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
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          data: editFormData
        })
      })

      if (!response.ok) throw new Error('Failed to update user')

      setEditingUser(null)
      await fetchUsers(pagination.page)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete user')

      await fetchUsers(pagination.page)
    } catch (error) {
      console.error('Error deleting user:', error)
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
