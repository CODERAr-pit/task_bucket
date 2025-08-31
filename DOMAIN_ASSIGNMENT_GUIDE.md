# Domain-Specific Task Assignment - Usage Examples

## Overview
The Domain-Specific Task Assignment feature allows you to assign tasks to specific groups based on:
- **Domain**: Web Development, Content Writing, Graphic Designing, Video Editing, General
- **Year/Batch**: 1st Year, 2nd Year, 3rd Year, 4th Year
- **Combinations**: Mix and match domains and years

## Usage Examples

### Example 1: Assign to All 3rd Year Web Development Members
1. Open TaskForm
2. Click "Group Selection" mode
3. Set filters:
   - Domain: "Web Development"
   - Year/Batch: "3rd Year"
4. All 3rd year web development members will be shown and can be selected

### Example 2: Assign to Multiple Years in Same Domain
1. Click "Group Selection" mode
2. Set filters:
   - Domain: "Content Writing"
   - Multiple Years: Select "2nd Year" and "3rd Year"
3. All 2nd and 3rd year content writing members will be shown

### Example 3: Assign to All Members of a Domain
1. Click "Group Selection" mode
2. Set filters:
   - Domain: "Graphic Designing"
   - Year/Batch: "All Years"
3. All graphic designing members regardless of year will be shown

### Example 4: Individual Selection (Current Behavior)
1. Click "Individual Selection" mode
2. Search and select specific users
3. Use search bar to find users by name, email, domain, or year

## API Endpoints

### GET /api/tasks/users/filtered
Query parameters:
- `domain`: Filter by domain (optional)
- `role`: Filter by single role/year (optional)
- `roles`: Filter by multiple roles/years (comma-separated, optional)

Examples:
- `/api/tasks/users/filtered?domain=Web Development&role=3rd Year`
- `/api/tasks/users/filtered?domain=Content Writing&roles=2nd Year,3rd Year`
- `/api/tasks/users/filtered?role=4th Year`

### GET /api/tasks/users/filter-options
Returns available domains, roles, and their combinations with counts.

## UI Features

### Two Selection Modes:
1. **Individual Selection**: Traditional user-by-user selection with search
2. **Group Selection**: Filter-based selection by domain and year

### Filter Options:
- **Domain Dropdown**: All available domains + "All Domains"
- **Single Year Dropdown**: All available years + "All Years"
- **Multiple Years Toggles**: Select multiple years (overrides single year)

### Bulk Actions:
- **Select All Visible**: Select all users matching current filters
- **Deselect All Visible**: Deselect all visible users
- **Clear All**: Remove all selections

### Visual Indicators:
- User cards show: Name, Year, Domain, Email
- Selected users highlighted with green accent
- Real-time count of filtered and selected users
- Selected users summary with remove buttons

## Benefits

1. **Efficient Bulk Assignment**: Quickly assign tasks to entire teams or year groups
2. **Precise Targeting**: Combine domain expertise with seniority levels
3. **Flexible Selection**: Switch between individual and group modes as needed
4. **Visual Feedback**: Clear indication of who's selected and why
5. **Backward Compatible**: Existing individual selection still works

## Implementation Status

✅ Backend API endpoints created
✅ Frontend component implemented
✅ Integration with TaskForm completed
✅ Filter options and bulk actions added
✅ Visual design and UX implemented

## Next Steps for Testing

1. Create some test users with different domains and roles
2. Test the filtering API endpoints
3. Verify the frontend component renders correctly
4. Test task creation with domain-specific assignments
5. Verify task visibility respects assignments
