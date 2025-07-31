# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML website for the Hallie Wells Middle School Competition Math Club. The site uses a single-page application (SPA) architecture with iframe-based content loading for navigation between different pages.

## Architecture

### Main Structure
- `index.html` - Main application shell with navigation and iframe container
- `announcements.html` - Announcements page content (loaded in iframe)
- `club.html` - Club information page content (loaded in iframe)  
- `competitions.html` - Competition details and schedule (loaded in iframe)
- `registration.html` - Registration form page with Google Form link (loaded in iframe)
- `HWMS.jpeg` - School logo image
- `README.md` - Basic project description

### Navigation System
The main `index.html` file implements a navigation system using:
- JavaScript event listeners on navigation items with `data-page` attributes
- Dynamic iframe content loading based on navigation clicks
- Loading and error state management for iframe content
- Sticky navigation with hover effects and active state management

### Styling Approach
- Consistent design system across all pages using CSS custom properties
- Red gradient theme (#dc2626 to #991b1b) used throughout
- Responsive design with mobile-first approach
- Shared CSS patterns for sections, cards, and interactive elements
- CSS animations and transitions for enhanced user experience

### Content Structure
Each content page follows a consistent pattern:
- Full HTML document structure (not fragments)
- Shared styling conventions and color scheme
- Responsive grid layouts for content organization
- Interactive elements with hover states and animations

## Development Workflow

### File Organization
- All HTML files are self-contained with embedded CSS and JavaScript
- No external dependencies or build process required
- Images stored in root directory
- Simple file serving - can be opened directly in browser or served via any static web server

### Making Changes
1. **Navigation Updates**: Modify the navigation in `index.html` and ensure corresponding content files exist
2. **Content Updates**: Edit the individual HTML files (announcements.html, club.html, etc.)
3. **Styling**: Each page has its own embedded styles, but maintain consistency with the established design system
4. **New Pages**: Create new HTML file and add navigation item to `index.html` with appropriate `data-page` attribute

### Key Design Patterns
- Use the established red gradient theme (#dc2626 to #991b1b)
- Maintain responsive grid layouts with `auto-fit` and `minmax()`
- Include hover effects and smooth transitions
- Use semantic HTML structure with proper heading hierarchy
- Implement loading states and error handling for dynamic content

### External Dependencies
- The registration page links to a Google Form: https://forms.gle/PMdmzV79ZZd5jBso6
- Competition information includes links to external competition websites
- No JavaScript frameworks or libraries are used

## Contact Information
- Math Coach: Prof. Jojo (zdongmc@gmail.com)
- School: Hallie Wells Middle School, Clarksburg, MD

## Competitions Featured
The site provides detailed information about middle school math competitions including MOEMS, MATHCOUNTS, AMC 8, Math Kangaroo, Purple Comet Math Meet, and Noetic Learning Math Contest with schedules, costs, and registration details for the 2025-2026 school year.