# Project Model Documentation

## Complete Project Structure

### 1. Basic Information
```json
{
  "title": "Modern 3BHK Apartment Renovation",
  "slug": "modern-3bhk-apartment-renovation",
  "category": "ObjectId (ref: Category)",
  "description": "A modern minimalistic 3BHK designed with warm tones, ambient lighting, and space-saving furniture."
}
```

### 2. Client & Location
```json
{
  "clientName": "Mr. Sharma Residence",
  "location": "Gurgaon, Haryana",
  "city": "Gurgaon",
  "state": "Haryana"
}
```

### 3. Project Specifications
```json
{
  "projectSize": {
    "value": 1500,
    "unit": "sqft"
  },
  "duration": {
    "value": 45,
    "unit": "days"
  },
  "budget": {
    "min": 800000,
    "max": 1000000,
    "currency": "INR",
    "display": "₹8,00,000 - ₹10,00,000"
  }
}
```

### 4. Design Details
```json
{
  "designStyle": "Modern",
  "highlights": [
    "Italian marble flooring",
    "Modular kitchen",
    "Custom built wardrobe",
    "Ambient cove lighting",
    "Wallpaper accent wall"
  ]
}
```

### 5. Images & Media
```json
{
  "images": {
    "thumbnail": "https://cloudinary.com/...",
    "gallery": [
      {
        "url": "https://cloudinary.com/...",
        "caption": "Spacious living room with modern furniture",
        "room": "Living Room",
        "order": 1
      }
    ],
    "beforeAfter": {
      "before": "https://cloudinary.com/...",
      "after": "https://cloudinary.com/..."
    }
  },
  "video": {
    "url": "https://youtube.com/...",
    "thumbnail": "https://cloudinary.com/...",
    "duration": 45,
    "platform": "youtube"
  }
}
```

### 6. Materials & Technologies
```json
{
  "materials": [
    {
      "name": "Royal Matte Paint",
      "brand": "Asian Paints",
      "category": "Paint"
    },
    {
      "name": "Premium Ply",
      "brand": "Century Ply",
      "category": "Woodwork"
    },
    {
      "name": "Door Hardware",
      "brand": "Hafele",
      "category": "Hardware"
    }
  ]
}
```

### 7. Room Details
```json
{
  "rooms": [
    {
      "name": "Living Room",
      "area": 300,
      "features": ["False ceiling", "Ambient lighting", "TV unit"],
      "images": ["url1", "url2"]
    },
    {
      "name": "Master Bedroom",
      "area": 200,
      "features": ["Walk-in wardrobe", "Attached bathroom"],
      "images": ["url3", "url4"]
    }
  ]
}
```

### 8. Project Features
```json
{
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "balconies": 2,
    "hasModularKitchen": true,
    "hasFalseCeiling": true,
    "hasWardrobes": true,
    "hasPooja": true,
    "hasStudyRoom": false,
    "parking": 1
  }
}
```

### 9. Client Testimonial
```json
{
  "testimonial": {
    "text": "Amazing work by the team! Transformed our house into a dream home.",
    "rating": 5,
    "clientName": "Mr. & Mrs. Sharma",
    "date": "2024-10-15"
  }
}
```

### 10. Project Status & Meta
```json
{
  "status": "completed",
  "completionDate": "2024-10-01",
  "metaTitle": "Modern 3BHK Apartment | Live With Designs",
  "metaDescription": "See our modern 3BHK apartment renovation in Gurgaon...",
  "tags": ["modern", "3bhk", "apartment", "gurgaon", "minimalist"],
  "isActive": true,
  "isFeatured": true,
  "views": 0,
  "likes": 0
}
```

## API Endpoints

### Get Projects with Filters
```
GET /api/projects?category=residential&location=Gurgaon&designStyle=Modern&minBudget=500000&maxBudget=1000000
```

### Get Single Project
```
GET /api/projects/slug/:slug
```

### Get Filter Options
```
GET /api/projects/filters/options
```

### Create Project (Admin)
```
POST /api/projects
Authorization: Bearer {token}
```

### Update Project (Admin)
```
PUT /api/projects/:id
Authorization: Bearer {token}
```

### Delete Project (Admin)
```
DELETE /api/projects/:id
Authorization: Bearer {token}
```

### Like Project
```
POST /api/projects/:id/like
```

## Available Filters

1. **Category** - Filter by category ID
2. **Location** - Filter by location (regex search)
3. **City** - Filter by city
4. **State** - Filter by state
5. **Design Style** - Exact match (Modern, Minimalist, etc.)
6. **Budget Range** - Min/Max budget
7. **Size Range** - Min/Max project size
8. **Status** - completed, ongoing, upcoming
9. **Featured** - Show only featured projects
10. **Search** - Search in title, description, tags

## Design Styles Available

- Modern
- Minimalist
- Luxury
- Scandinavian
- Traditional
- Contemporary
- Industrial
- Bohemian
- Mid-Century Modern
- Rustic
- Eclectic
- Asian Zen
- Art Deco

## Example Complete Project Object

```json
{
  "title": "Luxury Villa Interior - Gurgaon",
  "slug": "luxury-villa-interior-gurgaon",
  "category": "64a1f2e3c8d9b1a2c3d4e5f6",
  "description": "A luxurious 5BHK villa designed with premium materials and elegant aesthetics.",
  "clientName": "Confidential Client",
  "location": "DLF Phase 5, Gurgaon",
  "city": "Gurgaon",
  "state": "Haryana",
  "projectSize": {
    "value": 4500,
    "unit": "sqft"
  },
  "duration": {
    "value": 3,
    "unit": "months"
  },
  "budget": {
    "min": 5000000,
    "max": 6000000,
    "currency": "INR",
    "display": "₹50,00,000 - ₹60,00,000"
  },
  "designStyle": "Luxury",
  "highlights": [
    "Italian marble flooring",
    "Designer ceiling with cove lighting",
    "Custom-made furniture",
    "Premium wallpapers",
    "Smart home automation"
  ],
  "images": {
    "thumbnail": "https://res.cloudinary.com/...",
    "gallery": [
      {
        "url": "https://res.cloudinary.com/...",
        "caption": "Grand living room with chandelier",
        "room": "Living Room",
        "order": 1
      }
    ]
  },
  "materials": [
    {
      "name": "Italian Marble",
      "brand": "Imported",
      "category": "Flooring"
    }
  ],
  "features": {
    "bedrooms": 5,
    "bathrooms": 6,
    "hasModularKitchen": true,
    "hasFalseCeiling": true,
    "hasWardrobes": true
  },
  "status": "completed",
  "isFeatured": true
}
```
