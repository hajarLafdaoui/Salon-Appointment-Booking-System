# Browse Services Page - Design & Structure

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVBAR                               │
│  Home | Services | My Appointments | Profile | Book Now    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PAGE HEADER                             │
│                                                             │
│              Our Services                                  │
│  Choose from a wide range of beauty services designed     │
│  to help you look and feel your best.                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   CATEGORY TABS (Sticky)                    │
│                                                             │
│  [All] [Hair] [Skincare] [Nails] [Makeup] [Brows] [Spa]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SERVICES GRID                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  │    Card      │  │    Card      │  │    Card      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  │    Card      │  │    Card      │  │    Card      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  │    Card      │  │    Card      │  │    Card      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Service Card Structure

```
┌─────────────────────────────────┐
│                                 │
│      SERVICE IMAGE              │
│      (220px height)             │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Haircut                        │
│  (Service Name)                 │
│                                 │
│  Professional haircut and       │
│  styling tailored to your look. │
│  (Description - 1 line)         │
│                                 │
│  ⏱ 30 min    💲 $25            │
│  (Duration)  (Price)           │
│                                 │
│  ┌─────────────────────────────┐│
│  │     [ Book Now ]            ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (1200px+)
```
┌─────────────────────────────────────────────────────────────┐
│  [Card]  [Card]  [Card]  [Card]  [Card]  [Card]            │
│  [Card]  [Card]  [Card]  [Card]  [Card]  [Card]            │
│  [Card]  [Card]  [Card]                                    │
└─────────────────────────────────────────────────────────────┘
Grid: 3 columns
Card Width: ~300px
Gap: 30px
```

### Tablet (768px - 1199px)
```
┌─────────────────────────────────────────────────────────────┐
│  [Card]  [Card]  [Card]                                    │
│  [Card]  [Card]  [Card]                                    │
│  [Card]  [Card]  [Card]                                    │
│  [Card]  [Card]  [Card]                                    │
│  [Card]  [Card]  [Card]                                    │
│  [Card]  [Card]  [Card]                                    │
└─────────────────────────────────────────────────────────────┘
Grid: 2 columns
Card Width: ~250px
Gap: 20px
```

### Mobile (< 768px)
```
┌─────────────────────────────────┐
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
│  [Card]                         │
└─────────────────────────────────┘
Grid: 1 column
Card Width: 100%
Gap: 15px
```

## Color Scheme

### Primary Colors
- **Gradient Pink**: `#ff69b4` to `#ff1493`
- **Text Dark**: `#2c3e50`
- **Text Light**: `#7f8c8d`
- **Background**: `#f5f7fa` to `#c3cfe2`

### Interactive States
- **Hover**: Translate up 8px, enhanced shadow
- **Active Tab**: Full gradient background, white text
- **Inactive Tab**: Light border, gray text

## Typography

### Headings
- **Page Title**: 3rem, bold, dark color
- **Service Name**: 1.3rem, semi-bold, dark color
- **Subtitle**: 1.1rem, regular, light color

### Body Text
- **Description**: 0.9rem, regular, light color
- **Details**: 0.9rem, medium weight, gray color

## Animations

### Page Load
- Services fade in with slight upward movement
- Duration: 0.5s ease

### Card Hover
- Translate up 8px
- Shadow increases
- Image scales 1.05x
- Duration: 0.3s ease

### Tab Click
- Smooth color transition
- Duration: 0.3s ease

## Interactive Elements

### Category Tabs
- **Default**: White background, gray border, gray text
- **Hover**: Pink border, pink text, slight lift
- **Active**: Pink gradient background, white text, shadow

### Book Now Button
- **Default**: Pink gradient, white text
- **Hover**: Lift up 2px, enhanced shadow
- **Active**: Return to normal position

### Service Cards
- **Default**: White background, subtle shadow
- **Hover**: Lift up 8px, enhanced shadow, image zoom

## States

### Loading State
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   Loading services...                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Failed to load services                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│        No services available in this category.              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## User Flow

```
1. User clicks "Services" in navbar
   ↓
2. Browse Services page loads
   ↓
3. All services displayed (default)
   ↓
4. User clicks category tab (e.g., "Hair")
   ↓
5. Services filter in real-time
   ↓
6. User clicks "Book Now" on service card
   ↓
7. Redirects to booking page with service pre-selected
```

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Alt text on all images
- Keyboard navigation support
- Color contrast meets WCAG standards
- Focus states on interactive elements
- Loading/error states clearly communicated

## Performance Optimizations

- Lazy loading on images
- CSS animations use GPU acceleration
- Responsive grid prevents layout shift
- Sticky tabs don't cause reflow
- Smooth transitions at 60fps

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

---

**Design is clean, professional, and user-friendly!** ✨
