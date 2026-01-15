{
  "meta": {
    "app_name": "KinesioCRM",
    "type": "Private CRM for Psycho Kinesiologist",
    "audience": "Solo practitioner and assistants",
    "primary_tasks": ["Login", "View KPIs", "Manage Clients", "Manage Visits", "Search & Filter", "View Statistics & Year-end summaries"],
    "success_actions": ["Create/edit clients", "Log visits quickly", "Find records fast", "Export/print year-end summaries"]
  },
  "brand_attributes": ["calming", "professional", "trustworthy", "clear", "gentle"],
  "typography": {
    "fonts": {
      "heading": "Space Grotesk",
      "body": "Manrope"
    },
    "google_fonts": [
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
    ],
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "h3": "text-base md:text-lg font-semibold",
      "body": "text-sm md:text-base leading-relaxed",
      "small": "text-xs text-muted-foreground"
    },
    "letter_spacing": {"tight": "-0.01em", "normal": "0", "wide": "0.01em"}
  },
  "color_system": {
    "note": "All colors ensure AA contrast on white or near-white cards. Greens/teals are primary; lavender as accent only.",
    "css_tokens_hsl": {
      "--background": "168 31% 98%",            
      "--foreground": "195 15% 12%",             
      "--card": "0 0% 100%",
      "--card-foreground": "195 15% 12%",
      "--muted": "180 16% 94%",
      "--muted-foreground": "195 10% 35%",
      "--primary": "172 39% 35%",                
      "--primary-foreground": "0 0% 100%",
      "--secondary": "210 20% 96%",
      "--secondary-foreground": "195 20% 15%",
      "--accent": "266 42% 85%",                 
      "--accent-foreground": "230 25% 16%",
      "--success": "155 38% 36%",
      "--warning": "38 92% 45%",
      "--destructive": "2 84% 58%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "180 10% 88%",
      "--input": "180 10% 88%",
      "--ring": "172 39% 35%",
      "--chart-1": "172 39% 40%",
      "--chart-2": "187 45% 38%",
      "--chart-3": "266 42% 62%",
      "--chart-4": "38 92% 60%",
      "--chart-5": "155 38% 40%",
      "--radius": "0.75rem"
    },
    "application": [
      "Use white/near-white cards on a misty teal background",
      "Primary actions in deep teal, secondary in light gray/teal, accent chips/links in lavender (limited)",
      "High-contrast text: foreground on background >= 7:1 for body"
    ]
  },
  "gradients": {
    "allowed": [
      "soft mint to light teal: hsl(160 40% 96%) -> hsl(172 39% 92%)",
      "seafoam to pale lavender: hsl(166 40% 95%) -> hsl(266 42% 95%)"
    ],
    "usage": "Sections only (hero/login header, dashboard banner). Keep <20% viewport. Never on tables or text-heavy cards.",
    "prohibited": "No dark/saturated blue→purple/pink, no gradient on small UI elements"
  },
  "textures": {
    "noise_overlay_css": ".bg-noise::before{content:'';position:absolute;inset:0;background-image:url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'80\\' height=\\'80\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'.8\\' numOctaves=\\'2\\' stitchTiles=\\'stitch\\'/></filter><rect width=\\'100%\\' height=\\'100%\\' filter=\\'url(%23n)\\' opacity=\\'0.03\\'/></svg>');pointer-events:none}" 
  },
  "spacing_radius_shadows": {
    "spacing": "Use 8px baseline. Section padding: py-8 md:py-12 lg:py-16. Card padding: p-4 md:p-6.",
    "radius": "rounded-lg on cards, rounded-md on inputs/buttons, rounded-full for chips/avatars",
    "shadows": {
      "card": "shadow-[0_1px_2px_rgba(16,24,40,0.06),_0_8px_24px_rgba(16,24,40,0.06)]",
      "elevated": "shadow-[0_8px_32px_rgba(16,24,40,0.10)]",
      "focus_ring": "ring-2 ring-offset-2 ring-[hsl(var(--ring))]"
    }
  },
  "grid_system": {
    "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    "columns": {
      "mobile": "grid-cols-1",
      "tablet": "md:grid-cols-2",
      "desktop": "lg:grid-cols-12"
    },
    "patterns": {
      "dashboard_kpis": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6",
      "cards_to_grid": "on mobile: stacked cards; on desktop: 12-col grid with 4-4-4 or 8-4 splits",
      "tables": "card wrapper with scroll-area on mobile"
    }
  },
  "components": {
    "buttons": {
      "style": "Professional/Corporate",
      "tokens": {
        "--btn-radius": "0.6rem",
        "--btn-shadow": "0 1px 2px rgba(16,24,40,.06)",
        "--btn-motion": "transition-colors duration-200 ease-out"
      },
      "variants": {
        "primary": "bg-[hsl(var(--primary))] text-white hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        "secondary": "bg-secondary text-secondary-foreground hover:bg-teal-50",
        "ghost": "bg-transparent text-[hsl(var(--foreground))] hover:bg-secondary",
        "destructive": "bg-[hsl(var(--destructive))] text-white hover:bg-red-600"
      },
      "sizes": {"sm": "h-9 px-3", "md": "h-10 px-4", "lg": "h-11 px-6"},
      "micro": "Hover shade shift + slight translate-y-0.5 on active. No transition: all."
    },
    "forms": {
      "fields": ["Input", "Textarea", "Select", "RadioGroup", "Checkbox", "Switch"],
      "rules": [
        "Every control: visible Label, helper text, aria-invalid on error",
        "Use shadcn Calendar in Popover for date selections"
      ]
    },
    "navigation": {
      "topbar": "Logo left, search center, user menu right; sticky top with subtle shadow",
      "sidebar": "Collapsible on mobile (Drawer). Active item indicated with left border-teal-500"
    },
    "tables": {
      "usage": "Use Table with sticky header on desktop; compact on mobile with Card rows",
      "empty_state": "Use Card + muted icon + copy + primary button"
    },
    "dialogs": {
      "confirm": "AlertDialog for destructive actions (delete client/visit)",
      "sheet": "Use Sheet for quick visit add on mobile"
    },
    "feedback": {
      "toasts": "sonner: success on save, warning when leaving unsaved",
      "skeletons": "Skeleton for KPI cards, tables, and profile pane",
      "errors": "Alert with variant=destructive above forms"
    }
  },
  "component_path": {
    "Button": "./components/ui/button",
    "Input": "./components/ui/input",
    "Label": "./components/ui/label",
    "Textarea": "./components/ui/textarea",
    "Select": "./components/ui/select",
    "Switch": "./components/ui/switch",
    "RadioGroup": "./components/ui/radio-group",
    "Checkbox": "./components/ui/checkbox",
    "Card": "./components/ui/card",
    "Tabs": "./components/ui/tabs",
    "Table": "./components/ui/table",
    "Dialog": "./components/ui/dialog",
    "AlertDialog": "./components/ui/alert-dialog",
    "Sheet": "./components/ui/sheet",
    "Popover": "./components/ui/popover",
    "Calendar": "./components/ui/calendar",
    "DropdownMenu": "./components/ui/dropdown-menu",
    "Command": "./components/ui/command",
    "Badge": "./components/ui/badge",
    "Separator": "./components/ui/separator",
    "Skeleton": "./components/ui/skeleton",
    "Tooltip": "./components/ui/tooltip",
    "Sonner": "./components/ui/sonner"
  },
  
  "layouts": {
    "login": {
      "pattern": "Split-screen on desktop: left calming image, right auth card; single column on mobile",
      "classes": "min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[hsl(var(--background))]",
      "card": "max-w-md w-full p-6 md:p-8 bg-card rounded-lg shadow"
    },
    "dashboard": {
      "header": "Greeting, quick filter (date range), export button",
      "kpis": "4-up KPI cards; mobile 2-up",
      "sections": ["Recent visits table", "Top topics list", "Visits over time (chart)"]
    },
    "clients": {
      "list": "Card list on mobile with key fields; Data table on desktop with sticky header, search and filters",
      "detail": "Two-column on desktop (8/4): timeline of visits + client info card; single column stack on mobile"
    },
    "statistics": {
      "filters": "Year picker, topic multi-select, date range",
      "content": "Line/Bar charts with Recharts; summary cards; printable year-end section"
    }
  },
  "search_and_filter": {
    "global_search": "Command dialog (⌘K) to search clients/topics",
    "list_filters": "Input for name, Select for topic, Calendar for range; badges show active filters with clear-all"
  },
  "motion_microinteractions": {
    "library": "framer-motion",
    "rules": [
      "No universal transition-all. Only transition-colors/opacities/transforms per element.",
      "KPI cards fade-in + slight upward motion on mount",
      "Button press scale 0.98; tooltip spring 150ms"
    ]
  },
  "accessibility": {
    "forms": ["Every input must have <Label htmlFor>", "Describe errors near controls", "Use aria-live for toasts"],
    "focus": "Visible focus ring using --ring",
    "contrast": "Ensure AA (4.5:1 body, 3:1 large text)",
    "motion_pref": "Respect prefers-reduced-motion: reduce motion to fades"
  },
  "responsive_rules": [
    "Mobile first: stack sections, hide non-essential columns",
    "Use Drawer/Sheet for filters on mobile",
    "Use ScrollArea for wide tables"
  ],
  "data_testid_conventions": {
    "rule": "Every interactive and key informational element MUST include data-testid using kebab-case that describes role",
    "examples": [
      "data-testid=\"login-form-submit-button\"",
      "data-testid=\"client-search-input\"",
      "data-testid=\"clients-table\"",
      "data-testid=\"add-visit-button\"",
      "data-testid=\"delete-client-confirm-button\"",
      "data-testid=\"kpi-total-clients\"",
      "data-testid=\"stats-year-select\""
    ]
  },
  "libraries": {
    "install": [
      "npm i framer-motion",
      "npm i recharts",
      "npm i dayjs"
    ],
    "usage_notes": [
      "Recharts for line/bar/donut with our color tokens",
      "dayjs for date handling and formatting"
    ]
  },
  "charts": {
    "colors": {
      "primary": "hsl(var(--chart-1))",
      "teal": "hsl(var(--chart-2))",
      "lavender": "hsl(var(--chart-3))",
      "amber": "hsl(var(--chart-4))",
      "green": "hsl(var(--chart-5))"
    },
    "empty_state": "Card with muted copy and a button to add data",
    "example_line_chart_js": "import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';\nexport function VisitsOverTime({ data }) {\n  if (!data?.length) {\n    return (<div className=\"p-6 text-sm text-muted-foreground\" data-testid=\"chart-empty\">No data for selection</div>);\n  }\n  return (\n    <div className=\"h-64 w-full\" data-testid=\"visits-over-time-chart\">\n      <ResponsiveContainer width=\"100%\" height=\"100%\">\n        <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>\n          <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#E6F0EE\" />\n          <XAxis dataKey=\"label\" tick={{ fontSize: 12 }} />\n          <YAxis tick={{ fontSize: 12 }} />\n          <Tooltip />\n          <Line type=\"monotone\" dataKey=\"visits\" stroke=\"hsl(var(--chart-2))\" strokeWidth={2} dot={false} />\n        </LineChart>\n      </ResponsiveContainer>\n    </div>\n  );\n}",
    "example_bar_chart_js": "import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';\nexport function TopTopicsChart({ data }) {\n  if (!data?.length) return null;\n  return (\n    <div className=\"h-64 w-full\" data-testid=\"top-topics-chart\">\n      <ResponsiveContainer width=\"100%\" height=\"100%\">\n        <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>\n          <CartesianGrid strokeDasharray=\"2 4\" stroke=\"#E6F0EE\" />\n          <XAxis dataKey=\"topic\" tick={{ fontSize: 12 }} />\n          <YAxis tick={{ fontSize: 12 }} />\n          <Tooltip />\n          <Bar dataKey=\"count\" fill=\"hsl(var(--chart-5))\" radius={[6,6,0,0]} />\n        </BarChart>\n      </ResponsiveContainer>\n    </div>\n  );\n}"
  },
  "forms_and_validation": {
    "date_picker_js": "import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';\nimport { Calendar } from './components/ui/calendar';\nimport dayjs from 'dayjs';\nexport function DateField({ value, onChange }){\n  return (\n    <Popover>\n      <PopoverTrigger asChild>\n        <button className=\"h-10 px-3 rounded-md border bg-white text-left w-full\" data-testid=\"date-field-button\">{value ? dayjs(value).format('MMM D, YYYY') : 'Select date'}</button>\n      </PopoverTrigger>\n      <PopoverContent className=\"p-0\">\n        <Calendar mode=\"single\" selected={value} onSelect={onChange} initialFocus />\n      </PopoverContent>\n    </Popover>\n  );\n}",
    "confirm_dialog_js": "import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './components/ui/alert-dialog';\nexport function DeleteClientConfirm({ onConfirm }){\n  return (\n    <AlertDialog>\n      <AlertDialogTrigger asChild>\n        <button className=\"bg-red-600 text-white h-10 px-4 rounded-md\" data-testid=\"delete-client-button\">Delete client</button>\n      </AlertDialogTrigger>\n      <AlertDialogContent>\n        <AlertDialogHeader>\n          <AlertDialogTitle>Delete client?</AlertDialogTitle>\n          <AlertDialogDescription>This will remove client and all visits. This action cannot be undone.</AlertDialogDescription>\n        </AlertDialogHeader>\n        <AlertDialogFooter>\n          <AlertDialogCancel data-testid=\"delete-client-cancel-button\">Cancel</AlertDialogCancel>\n          <AlertDialogAction onClick={onConfirm} data-testid=\"delete-client-confirm-button\">Delete</AlertDialogAction>\n        </AlertDialogFooter>\n      </AlertDialogContent>\n    </AlertDialog>\n  );\n}"
  },
  "example_code_snippets": {
    "login_page_js": "import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';\nimport { Label } from './components/ui/label';\nimport { Input } from './components/ui/input';\nimport { Button } from './components/ui/button';\nimport { Toaster } from './components/ui/sonner';\nexport default function Login(){\n  return (\n    <div className=\"min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[hsl(var(--background))]\">\n      <div className=\"hidden lg:block relative bg-noise\">\n        <img src=\"https://images.unsplash.com/photo-1655435600406-6968a32a3a34?auto=format&fit=crop&w=1200&q=80\" alt=\"calming water texture\" className=\"absolute inset-0 w-full h-full object-cover\" />\n      </div>\n      <div className=\"flex items-center justify-center p-6 md:p-12\">\n        <Card className=\"w-full max-w-md\">\n          <CardHeader>\n            <CardTitle className=\"text-2xl font-semibold tracking-tight\">Welcome back</CardTitle>\n          </CardHeader>\n          <CardContent>\n            <form className=\"space-y-4\" data-testid=\"login-form\">\n              <div className=\"space-y-2\">\n                <Label htmlFor=\"email\">Email</Label>\n                <Input id=\"email\" name=\"email\" type=\"email\" autoComplete=\"email\" required data-testid=\"login-email-input\" />\n              </div>\n              <div className=\"space-y-2\">\n                <Label htmlFor=\"password\">Password</Label>\n                <Input id=\"password\" name=\"password\" type=\"password\" required data-testid=\"login-password-input\" />\n              </div>\n              <Button className=\"w-full\" data-testid=\"login-form-submit-button\">Sign in</Button>\n            </form>\n          </CardContent>\n        </Card>\n      </div>\n      <Toaster />\n    </div>\n  );\n}",
    "filter_bar_js": "import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';\nimport { Input } from './components/ui/input';\nimport { Button } from './components/ui/button';\nexport function ClientListFilters(){\n  return (\n    <div className=\"flex flex-col sm:flex-row gap-2 sm:items-end\" data-testid=\"client-filters\">\n      <div className=\"flex-1\">\n        <Input placeholder=\"Search name\" data-testid=\"client-search-input\" />\n      </div>\n      <Select>\n        <SelectTrigger className=\"w-[200px]\" data-testid=\"topic-filter\"><SelectValue placeholder=\"Topic\" /></SelectTrigger>\n        <SelectContent>\n          <SelectItem value=\"stress\">Stress</SelectItem>\n          <SelectItem value=\"sleep\">Sleep</SelectItem>\n        </SelectContent>\n      </Select>\n      <Button variant=\"secondary\" data-testid=\"clear-filters-button\">Clear</Button>\n    </div>\n  );\n}"
  },
  "states": {
    "loading": "Skeletons for KPIs, table rows, and profile sidebar",
    "empty": "Illustrative empty states with short guidance and primary button",
    "error": "Alert destructive with retry"
  },
  "icons": {
    "library": "lucide-react (already included)",
    "usage": "Use outline icons in muted-foreground; avoid emoji icons"
  },
  "image_urls": [
    {
      "url": "https://images.unsplash.com/photo-1655435600406-6968a32a3a34?crop=entropy&cs=srgb&fm=jpg&q=85",
      "category": "login/hero background",
      "description": "Calming water texture in teal for login left column"
    },
    {
      "url": "https://images.unsplash.com/photo-1652615404377-666b31036645?crop=entropy&cs=srgb&fm=jpg&q=85",
      "category": "empty states",
      "description": "Minimal plant on table to convey calm"
    },
    {
      "url": "https://images.unsplash.com/photo-1594389026194-9af889e5104a?crop=entropy&cs=srgb&fm=jpg&q=85",
      "category": "decorative divider",
      "description": "Soft teal textile texture for section banner"
    },
    {
      "url": "https://images.unsplash.com/photo-1587649921720-b25baba94b3a?crop=entropy&cs=srgb&fm=jpg&q=85",
      "category": "about/profile placeholder",
      "description": "Soft floral accent for optional information card"
    }
  ],
  "instructions_to_main_agent": [
    "Inject font links in index.html and set CSS variables in :root (index.css) to color_system.css_tokens_hsl",
    "Adopt container and grid patterns across pages",
    "For all buttons/links/inputs/menus/tables add data-testid as per conventions",
    "Use shadcn Calendar for visit date selection",
    "Implement alert dialogs for deletes and show sonner toasts on save",
    "Build statistics with Recharts using provided snippets and color tokens",
    "Ensure gradients only in section backgrounds and under 20% viewport",
    "Test on mobile first: cards stack, tables scroll horizontally"
  ]
}


<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
