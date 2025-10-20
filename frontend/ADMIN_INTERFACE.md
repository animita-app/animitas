# Admin Interface Documentation

## Overview

The admin interface provides centralized management of users, memorials, and memorial lists with a secure, role-based access system.

**Access:** `/admin`
**Restricted to:** Selected usernames (currently: `@icarus` and `@admin`)

---

## Features

### 🔐 Authentication & Authorization

- **Admin Check:** Only users with specific usernames can access the admin panel
- **Session-based:** Uses NextAuth sessions for authentication
- **API Protection:** All admin endpoints verify user permissions
- **Configurable:** Easy to add/remove admin usernames in `lib/admin.ts`

### 📊 Data Management

#### Users Tab (`/admin`)
- **View all users** with pagination
- **Columns displayed:**
  - Username
  - Display Name
  - Phone Number
  - Role (Free, Premium, Admin)
  - Account Creation Date
  - Statistics (memorials, candles, testimonies, lists)

- **Actions:**
  - ✏️ Edit: Update display name and user role
  - 🗑️ Delete: Remove user account
  - 🔄 Refresh: Reload user list

- **Analytics Cards:**
  - Total users count
  - Admin count
  - Premium users count
  - Free users count

#### Memorials Tab (`/admin`)
- **View all memorials** with pagination
- **Columns displayed:**
  - Memorial Name
  - Created By (username or display name)
  - Coordinates (latitude, longitude)
  - Visibility Status (Public/Private)
  - Creation Date
  - Content Stats (people, candles, testimonies, images)

- **Actions:**
  - ✏️ Edit: Modify name, story, location, and visibility
  - 🗑️ Delete: Remove memorial
  - 🔄 Refresh: Reload memorial list

- **Analytics Cards:**
  - Total memorials
  - Public memorials count
  - Total candles lit
  - Total testimonies

#### Lists Tab (`/admin`)
- **View all memorial lists** with pagination
- **Columns displayed:**
  - List Name
  - Created By
  - Visibility Status (Public/Private)
  - View Count
  - Creation Date
  - Stats (items, collaborators, saves)

- **Actions:**
  - ✏️ Edit: Modify name, description, and visibility
  - 🗑️ Delete: Remove list
  - 🔄 Refresh: Reload list

- **Analytics Cards:**
  - Total lists
  - Public lists count
  - Total items in lists
  - Total views across lists

---

## Technical Architecture

### File Structure

```
frontend/
├── lib/
│   └── admin.ts                          # Admin auth helpers
├── app/
│   ├── admin/
│   │   └── page.tsx                      # Admin dashboard main page
│   └── api/
│       └── admin/
│           ├── users/
│           │   └── route.ts              # Users CRUD endpoints
│           ├── memorials/
│           │   └── route.ts              # Memorials CRUD endpoints
│           └── lists/
│               └── route.ts              # Lists CRUD endpoints
├── components/
│   ├── admin/
│   │   ├── data-table.tsx                # Reusable data table component
│   │   ├── admin-users-tab.tsx           # Users management tab
│   │   ├── admin-memorials-tab.tsx       # Memorials management tab
│   │   └── admin-lists-tab.tsx           # Lists management tab
│   └── ui/
│       ├── tabs.tsx                      # Tabs component
│       ├── table.tsx                     # Table component
│       ├── select.tsx                    # Select dropdown component
│       └── [other UI components]
```

### API Endpoints

All endpoints require authentication and admin role verification.

#### Users Management
- **GET** `/api/admin/users?page=1&limit=10`
  - Fetch users with pagination
  - Returns: `{ users: User[], pagination: PaginationState }`

- **PATCH** `/api/admin/users`
  - Update user data
  - Body: `{ userId: string, data: { role, displayName } }`
  - Returns: Updated user object

- **DELETE** `/api/admin/users?id=USER_ID`
  - Delete user and cascade delete related data
  - Returns: `{ success: true }`

#### Memorials Management
- **GET** `/api/admin/memorials?page=1&limit=10`
  - Fetch memorials with pagination
  - Returns: `{ memorials: Memorial[], pagination: PaginationState }`

- **PATCH** `/api/admin/memorials`
  - Update memorial data
  - Body: `{ memorialId: string, data: { name, story, isPublic, lat, lng } }`
  - Returns: Updated memorial object

- **DELETE** `/api/admin/memorials?id=MEMORIAL_ID`
  - Delete memorial and cascade delete related data
  - Returns: `{ success: true }`

#### Lists Management
- **GET** `/api/admin/lists?page=1&limit=10`
  - Fetch memorial lists with pagination
  - Returns: `{ lists: MemorialList[], pagination: PaginationState }`

- **PATCH** `/api/admin/lists`
  - Update list data
  - Body: `{ listId: string, data: { name, description, isPublic } }`
  - Returns: Updated list object

- **DELETE** `/api/admin/lists?id=LIST_ID`
  - Delete list and cascade delete related data
  - Returns: `{ success: true }`

### Components

#### `DataTable` Component
Generic, reusable table component for displaying paginated data.

```tsx
interface Column {
  key: string                           // Data field key
  label: string                         // Column header
  sortable?: boolean                   // Future: sorting support
  render?: (value, row) => ReactNode   // Custom rendering
  width?: string                       // Column width
}

<DataTable
  columns={columns}
  data={data}
  loading={loading}
  pagination={pagination}
  onPageChange={handlePageChange}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
/>
```

#### Tab Components
Each tab (`AdminUsersTab`, `AdminMemorialsTab`, `AdminListsTab`) handles:
- Data fetching
- Pagination
- Edit/Delete operations
- Form dialogs for editing
- Analytics cards
- Real-time updates

---

## Security Considerations

### Access Control

**Protected Route:** The `/admin` page redirects unauthorized users to home

```typescript
export default async function AdminPage() {
  const session = await getServerSession()

  if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
    redirect('/')
  }
  // ...
}
```

### API Endpoint Protection

Every admin API endpoint verifies authentication:

```typescript
const session = await getServerSession()

if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Data Validation

- Only whitelisted fields can be updated
- `allowedFields` array controls what can be modified
- Prevents unintended field updates

```typescript
const allowedFields = ['role', 'displayName', 'instagramHandle', 'tiktokHandle']
const updateData = Object.fromEntries(
  Object.entries(data).filter(([key]) => allowedFields.includes(key))
)
```

### Database Cascade Deletes

Deleting users, memorials, or lists properly cascades deletes through relationships:
- User deletion removes: candles, testimonies, memorial creations, lists
- Memorial deletion removes: candles, testimonies, images, list associations
- List deletion removes: list items, collaborators, saves

---

## Adding Admin Users

To add or modify admin usernames:

1. Edit `/lib/admin.ts`
2. Update the `ADMIN_USERNAMES` array:

```typescript
const ADMIN_USERNAMES = ['icarus', 'admin', 'newadmin']
```

3. Commit changes and deploy

---

## Usage Examples

### View Admin Dashboard

```bash
# Navigate to admin page
https://yourdomain.com/admin

# Only accessible if logged in as admin user
```

### Edit User Role

1. Navigate to Admin Dashboard → Users tab
2. Find user in table
3. Click ✏️ Edit button
4. Change role (Free → Premium → Admin)
5. Click "Save Changes"

### Delete Memorial

1. Navigate to Admin Dashboard → Memorials tab
2. Find memorial in table
3. Click 🗑️ Delete button
4. Confirm deletion in popup
5. Memorial and all related data deleted

### Refresh Lists

1. Navigate to Admin Dashboard → Lists tab
2. Click 🔄 Refresh button in top right
3. Data reloads from database

---

## Performance Considerations

### Pagination

- Default: 10 items per page
- Configurable in tab components
- Uses `skip` and `take` for database efficiency

### Counting

Efficient `_count` queries for relationship statistics:
- Counts are computed during fetch, not iterated
- Example: `_count: { candles: true, testimonies: true }`

### Optimizations

- Server-side pagination (not loading all data)
- Selective field selection in queries
- No N+1 problems with explicit joins

---

## Future Enhancements

- [ ] Search/filter functionality
- [ ] Sorting by column
- [ ] Bulk actions (delete multiple)
- [ ] Export to CSV
- [ ] Admin activity logs
- [ ] Role-based permissions (MANAGE_USERS, MANAGE_MEMORIALS, etc.)
- [ ] User activity analytics
- [ ] Memorial moderation queue
- [ ] Content flagging system

---

## Troubleshooting

### Admin Page Shows "Access Denied"

**Issue:** User is not in `ADMIN_USERNAMES`
**Solution:** Add username to `lib/admin.ts` and redeploy

### Edit Dialog Not Saving

**Issue:** API endpoint error or network issue
**Solution:** Check browser console for error messages, verify API route exists

### Data Not Refreshing

**Issue:** Pagination state not updating
**Solution:** Click "Refresh" button or change page manually

### Slow Data Loading

**Issue:** Large dataset causing slow queries
**Solution:** Reduce page size limit, add database indexes on frequently searched fields

---

## Support

For issues or questions about the admin interface:
1. Check browser console for error messages (F12)
2. Verify API endpoints in Network tab
3. Review server logs at `/api/admin/*`
4. Ensure user has admin role

---

**Last Updated:** 2025-10-20
**Version:** 1.0.0
