# SEO Content Generator

A dynamic web application for generating location-based service pages for businesses. This tool creates SEO-optimized page structures by combining service keywords with city/state data.

## Features

- 🎯 **Dynamic Prompt Types**: Load prompt types via webhook
- 🔑 **Webhook Keywords**: Automatically load service keywords
- 🏙️ **Location Matrix**: Generate city + keyword combinations
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works on desktop and mobile
- 📊 **CSV Export**: Download generated matrix data
- 🚀 **Page Generation**: Send data to backend for WordPress integration

## Quick Start

### 1. Deploy to GitHub Pages

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Access your site at `https://yourusername.github.io/repository-name`

### 2. Load Data via Webhooks

The application expects data to be loaded via JavaScript function calls:

#### Load Prompt Types
```javascript
window.loadPromptTypes({
    prompt_types: ["service_areas_prompt", "location_pages_prompt", "city_landing_pages"]
});
```

#### Load Keywords
```javascript
window.loadKeywords({
    keywords: [
        "windows installation",
        "door replacement", 
        "roof repair",
        "siding installation"
    ]
});
```

## File Structure

```
├── index.html      # Main HTML structure
├── styles.css      # CSS styling with dark mode
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Integration Methods

### Method 1: Direct Function Calls
```javascript
// Load prompt types
window.loadPromptTypes({
    prompt_types: ["service_areas_prompt"]
});

// Load keywords
window.loadKeywords({
    keywords: ["windows installation", "door replacement"]
});
```

### Method 2: PostMessage (for iframe integration)
```javascript
iframe.contentWindow.postMessage({
    type: 'prompt_types_data',
    payload: {
        prompt_types: ["service_areas_prompt"]
    }
}, '*');

iframe.contentWindow.postMessage({
    type: 'keywords_data', 
    payload: {
        keywords: ["windows installation", "door replacement"]
    }
}, '*');
```

### Method 3: Custom Events
```javascript
// Dispatch prompt types
const promptEvent = new CustomEvent('promptTypesData', { 
    detail: { prompt_types: ["service_areas_prompt"] }
});
document.dispatchEvent(promptEvent);

// Dispatch keywords
const keywordEvent = new CustomEvent('keywordsData', { 
    detail: { keywords: ["windows installation"] }
});
document.dispatchEvent(keywordEvent);
```

## Generated Output

The application generates a matrix with the following structure:

| City | State | Service Keyword | URL Slug | Full URL | Page Title |
|------|-------|-----------------|----------|----------|------------|
| Boston | MA | windows installation | /locations/boston/windows-installation | yoursite.com/locations/boston/windows-installation | Windows Installation in Boston, MA |

## Backend Integration

The "Generate Pages" button sends a POST request to `/api/generate-pages` with:

```json
{
    "matrix": [...],
    "websiteUrl": "yoursite.com",
    "promptType": "service_areas_prompt",
    "timestamp": "2025-01-XX..."
}
```

## Dark Mode

Dark mode preference is automatically saved to localStorage and persists across sessions.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

To run locally:

1. Clone the repository
2. Open `index.html` in a web browser
3. Use the webhook integration methods above to load data

## License

MIT License - feel free to use and modify as needed.