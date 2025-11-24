# Design Guidelines: Notion ⇄ Zoho Cliq Integration

## Design Approach
**Selected Approach:** Design System with Productivity Tool Inspiration

Drawing from **Notion's** clean content hierarchy, **Linear's** crisp typography and minimal interface, and **Slack's** embedded app patterns. This integration prioritizes clarity, efficiency, and seamless embedding within Cliq's interface.

**Core Principle:** Information-dense without feeling cluttered. Every pixel serves the user's workflow.

---

## Typography

**Font Family:**
- Primary: Inter (via Google Fonts CDN) - excellent for UI density and readability
- Monospace: JetBrains Mono - for IDs, timestamps, technical details

**Type Scale:**
- Headings: 
  - Widget titles: 18px/semibold
  - Section headers: 14px/semibold
  - Card titles: 16px/medium
- Body text: 14px/regular
- Secondary text (timestamps, metadata): 12px/regular
- Button labels: 14px/medium
- Input labels: 13px/medium

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 3, 4, 6, and 8
- Component padding: p-4 to p-6
- Section spacing: gap-4 or gap-6
- Card spacing: p-4 internally, gap-3 between cards
- Tight spacing for list items: gap-2
- Widget container: p-6

**Container Strategy:**
- Widget max-width: 100% (respects Cliq's iframe constraints)
- Content areas: max-w-full with internal padding
- Cards: full-width within containers
- Modals (if used): max-w-md centered

---

## Component Library

### Core Components

**1. Widget Dashboard Container**
- Clean white/neutral background
- Subtle border or elevation
- Tab navigation at top (My Tasks | Recent Docs | Search | Activity)
- Active tab indicator with underline or subtle highlight
- Content area below with consistent padding

**2. Task Cards**
- Compact horizontal layout
- Checkbox/status indicator (left)
- Task title (prominent, truncate long titles)
- Metadata row: due date, assignee (small, secondary styling)
- Hover state: subtle elevation/border change
- Click to open in Notion (external link icon)

**3. Document List Items**
- Icon indicating doc type (left, 20x20px)
- Document title (medium weight)
- Last edited timestamp (right, secondary text)
- Recent activity indicator if applicable

**4. Search Interface**
- Search input: full-width, prominent
- Results below: grouped by type (Tasks, Docs, Databases)
- Each result: icon + title + breadcrumb path
- Empty state: centered message with connect/search guidance

**5. Slash Command Response Cards**
- Success: green accent border-left
- Error: red accent border-left  
- Info: blue accent border-left
- Title + description layout
- Action button if applicable (e.g., "View in Notion")
- Compact format fitting Cliq's message width

**6. Message Action Modal** (if applicable)
- Header: "Save to Notion"
- Form fields:
  - Database selector (dropdown)
  - Title (pre-filled from message)
  - Tags input (optional)
  - Due date picker (optional)
- Footer: Cancel | Save buttons (Save = primary)

**7. Connection Status Banner**
- Appears when not connected
- Icon + message + "Connect Notion" button
- Dismissible or persistent until connected

**8. Activity Feed Items**
- Timeline-style layout
- Icon indicator (task created, updated, etc.)
- Action description with linked entities
- Timestamp (relative: "2 hours ago")

**9. Settings Screen**
- Section headers for organization
- Toggle switches for notifications/reminders
- Connected account info display
- Disconnect button (secondary, destructive)

**10. Empty States**
- Centered icon (48x48px, subtle)
- Message explaining state
- Primary action button when applicable
- Examples: "No tasks yet", "Search Notion", "Connect your account"

**11. Loading States**
- Skeleton screens for cards/lists
- Spinner for search/actions (centered, 24px)
- Progress indicators for OAuth flow

**12. Error States**
- Inline error messages below inputs
- Toast/banner for system errors
- Retry button for failed actions

---

## Navigation & Interaction Patterns

**Widget Tabs:**
- Horizontal tab bar fixed at top
- Icon + label for each section
- Smooth transition between views (no page reload feel)

**List Interactions:**
- Hover states: subtle background change
- Click actions: external link for Notion items
- Swipe gestures not needed (desktop-focused)

**Forms:**
- Labels above inputs
- Placeholders for guidance
- Validation feedback inline
- Focus states with subtle border highlight

---

## Data Display Patterns

**Task Properties:**
- Status badges: rounded pills with icon + text
- Due dates: formatted relative when close ("Today", "Tomorrow", "Dec 1")
- Assignees: avatar + name or just initials in circle
- Priority: colored dot indicator

**Timestamps:**
- Relative for recent ("5m ago", "2h ago")  
- Absolute for older ("Dec 1, 2024")

**Links to Notion:**
- External link icon (top-right of cards)
- Subtle, not distracting

**Metadata Hierarchy:**
- Primary: task/doc title
- Secondary: status, assignee
- Tertiary: timestamps, IDs

---

## Responsive Behavior

**Primary Target:** Desktop Cliq (embedded widget)
**Constraints:** Must work in iframe, typically 400-600px width

- Single column layouts
- Stack elements vertically
- Horizontal scrolling avoided
- Touch-friendly tap targets (44px min)

---

## Accessibility

- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Keyboard navigation support (tab order, enter to submit)
- Focus indicators on all interactive elements
- Sufficient contrast ratios (WCAG AA minimum)
- Form error announcements

---

## Animations

**Minimal and purposeful:**
- Tab transitions: 150ms ease
- Card hover: 100ms ease  
- Modal open/close: 200ms ease with scale
- Loading spinners: smooth rotation
- No decorative animations

---

## Icons

**Library:** Heroicons (via CDN)
- 20px for inline icons (status, links)
- 24px for section icons, empty states
- 16px for metadata icons (calendar, user)

---

## Images

**Not applicable** - This is a data/productivity interface embedded in Cliq. No hero images or marketing imagery needed. Interface relies on icons, typography, and structured data display.

---

## Key Design Decisions

1. **Embedded Context:** Design fits Cliq's constraints, not fighting against iframe width limits
2. **Information Density:** Show maximum relevant data without clutter - users are here to work
3. **Consistency:** Reusable card patterns across tasks, docs, search results  
4. **Status Clarity:** Always show connection state, loading states, errors clearly
5. **Action Accessibility:** Primary actions always visible, no hidden overflow menus