'use client'

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'

interface MemorialList {
  id: string
  name: string
  description: string | null
  thumbnailPicture: string | null
  isPublic: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    username: string | null
    displayName: string | null
  }
  _count: {
    items: number
    collaborators: number
    saves: number
  }
}

interface PaginationState {
  page: number
  limit: number
  total: number
  pages: number
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export default function AdminListsTab() {
  const [lists, setLists] = useState<MemorialList[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingList, setEditingList] = useState<MemorialList | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  })

  const fetchLists = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/lists?page=${page}&limit=${pagination.limit}`)
      if (!response.ok) throw new Error('Failed to fetch lists')

      const data = await response.json()
      setLists(data.lists)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists(pagination.page)
  }, [])

  const handleEdit = (list: MemorialList) => {
    setEditingList(list)
    setEditFormData({
      name: list.name,
      description: list.description || '',
      isPublic: list.isPublic
    })
  }

  const handleSaveEdit = async () => {
    if (!editingList) return

    try {
      const response = await fetch('/api/admin/lists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: editingList.id,
          data: editFormData
        })
      })

      if (!response.ok) throw new Error('Failed to update list')

      setEditingList(null)
      await fetchLists(pagination.page)
    } catch (error) {
      console.error('Error updating list:', error)
    }
  }

  const handleDelete = async (listId: string) => {
    try {
      const response = await fetch(`/api/admin/lists?id=${listId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete list')

      await fetchLists(pagination.page)
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name'
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (value: any) => value?.displayName || value?.username || '-'
    },
    {
      key: 'isPublic',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-sm ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Public' : 'Private'}
        </span>
      )
    },
    {
      key: 'viewCount',
      label: 'Views',
      render: (value: number) => value
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
        `📋 ${value.items} items | 👥 ${value.collaborators} collaborators | 💾 ${value.saves} saves`
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-2xl font-bold">{pagination.total}</div>
          <div className="text-sm text-muted-foreground">Total Lists</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="text-2xl font-bold">
            {lists.filter((l) => l.isPublic).length}
          </div>
          <div className="text-sm text-muted-foreground">Public Lists</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="text-2xl font-bold">
            {lists.reduce((acc, l) => acc + l._count.items, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Items</div>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <div className="text-2xl font-bold">
            {lists.reduce((acc, l) => acc + l.viewCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Views</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={lists}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchLists}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => fetchLists(pagination.page)}
      />

      <Dialog open={!!editingList} onOpenChange={() => setEditingList(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit List: {editingList?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={editFormData.isPublic}
                onCheckedChange={(checked) =>
                  setEditFormData((prev) => ({ ...prev, isPublic: checked as boolean }))
                }
              />
              <Label>Public List</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingList(null)}>
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
