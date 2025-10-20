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

interface Memorial {
  id: string
  name: string
  lat: number
  lng: number
  story: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    username: string | null
    displayName: string | null
  }
  _count: {
    people: number
    candles: number
    testimonies: number
    images: number
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

export default function AdminMemorialsTab() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingMemorial, setEditingMemorial] = useState<Memorial | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    story: '',
    isPublic: true,
    lat: 0,
    lng: 0
  })

  const fetchMemorials = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/memorials?page=${page}&limit=${pagination.limit}`)
      if (!response.ok) throw new Error('Failed to fetch memorials')

      const data = await response.json()
      setMemorials(data.memorials)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching memorials:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemorials(pagination.page)
  }, [])

  const handleEdit = (memorial: Memorial) => {
    setEditingMemorial(memorial)
    setEditFormData({
      name: memorial.name,
      story: memorial.story || '',
      isPublic: memorial.isPublic,
      lat: memorial.lat,
      lng: memorial.lng
    })
  }

  const handleSaveEdit = async () => {
    if (!editingMemorial) return

    try {
      const response = await fetch('/api/admin/memorials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId: editingMemorial.id,
          data: editFormData
        })
      })

      if (!response.ok) throw new Error('Failed to update memorial')

      setEditingMemorial(null)
      await fetchMemorials(pagination.page)
    } catch (error) {
      console.error('Error updating memorial:', error)
    }
  }

  const handleDelete = async (memorialId: string) => {
    try {
      const response = await fetch(`/api/admin/memorials?id=${memorialId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete memorial')

      await fetchMemorials(pagination.page)
    } catch (error) {
      console.error('Error deleting memorial:', error)
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
      key: 'lat',
      label: 'Coordinates',
      render: (value: number, row: Memorial) => `${value.toFixed(2)}, ${row.lng.toFixed(2)}`
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
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => formatDate(value)
    },
    {
      key: '_count',
      label: 'Content',
      render: (value: any) =>
        `👤 ${value.people} | 🕯️ ${value.candles} | 📝 ${value.testimonies} | 📸 ${value.images}`
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-2xl font-bold">{pagination.total}</div>
          <div className="text-sm text-muted-foreground">Total Memorials</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="text-2xl font-bold">
            {memorials.filter((m) => m.isPublic).length}
          </div>
          <div className="text-sm text-muted-foreground">Public Memorials</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <div className="text-2xl font-bold">
            {memorials.reduce((acc, m) => acc + m._count.candles, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Candles</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="text-2xl font-bold">
            {memorials.reduce((acc, m) => acc + m._count.testimonies, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Testimonies</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={memorials}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchMemorials}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => fetchMemorials(pagination.page)}
      />

      <Dialog open={!!editingMemorial} onOpenChange={() => setEditingMemorial(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Memorial: {editingMemorial?.name}</DialogTitle>
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
              <Label>Story</Label>
              <Textarea
                value={editFormData.story}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, story: e.target.value }))
                }
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={editFormData.lat}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, lat: parseFloat(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={editFormData.lng}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, lng: parseFloat(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={editFormData.isPublic}
                onCheckedChange={(checked) =>
                  setEditFormData((prev) => ({ ...prev, isPublic: checked as boolean }))
                }
              />
              <Label>Public Memorial</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingMemorial(null)}>
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
