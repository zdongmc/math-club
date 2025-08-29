# MOEMS Detective Academy - Math Competition Training

An interactive web application for middle school students (grades 6-8) to learn MOEMS (Math Olympiad) vocabulary and concepts through an immersive detective-themed experience. This is a comprehensive single HTML page with embedded CSS and JavaScript.

## Current Implementation

### Design & Theme
- **Detective Academy theme** with mystery-solving math challenges organized as criminal cases
- **Clean, modern design** with red gradient theme (#dc2626 to #991b1b) 
- **Responsive layout** that works on Chromebooks and mobile devices
- **Professional card-based interface** with glassmorphism effects
- **Detective ranking system** with progressive badges and famous detective comparisons

### Game Structure & Mechanics
- **Team badge assignment** with custom detective team names
- **10 comprehensive cases** covering all major MOEMS topics
- **Question-by-question navigation** with Previous/Next buttons for better focus
- **Real-time scoring system** with Evidence Points
- **Progressive detective ranking** from Detective Trainee to Mathematical Mastermind
- **Case completion tracking** with visual progress indicators

### Content Structure - 10 Detective Cases

#### Case File #001: "The Mystery of 121"
- Number properties analysis (palindrome, perfect square, composite, odd)
- Greatest Common Factor (GCF) of 24 and 36
- Digit sum calculation (456)

#### Case File #002: "The Factor Conspiracy"  
- Factor identification for the number 12
- Complete analysis of prime number 17 (square root, classification, parity)

#### Case File #003: "The Fraction Forgery"
- Proper fraction classification (3/4, 1/5, 2/3 vs improper fractions)
- Percentage to simplest fraction conversion (45% = 9/20)

#### Case File #004: "The Vocabulary Heist"
- Mathematical vocabulary matching (median, mode, palindrome, composite)
- Rectangular solid properties (6 faces, 12 edges, 8 vertices)

#### Case File #005: "The Statistics Scandal"
- Statistical analysis (mean, median, mode, range) of data set: 85, 92, 78, 92, 88, 75, 92, 90
- Triangle classification validation (equilateral, isosceles, scalene, right, acute, obtuse)
- Quadrilateral type identification (rectangle, square, parallelogram, rhombus, trapezoid)

#### Case File #006: "Operation 1,331"
- Complete number analysis of 1,331 (palindrome, perfect cube, 4-digit, composite, odd, digit sum 8, multiple of 11)
- Mathematical relationships and proportional reasoning

#### Case File #007: "The Equation Enigma"
- Algebraic equation solving (3x + 7 = 22, x = 5)
- Coordinate geometry (quadrant identification for point (4, -2))
- Angle classification (90° = right angle)
- Square root calculation (√64 = 8)

#### Case File #008: "The Advanced Numbers Conspiracy"
- Scientific notation (4,560,000 = 4.56 × 10⁶)
- Ratio problem solving (3:5 ratio)
- Isosceles triangle properties
- Percentage increase calculation (200 to 250 = 25%)

#### Case File #009: "The Integer Underground"
- Signed number operations (-8 + 3 × (-2) - (-5) = -9)
- Complex fraction division (2/3 ÷ 1/4 = 8/3)
- Integer properties of -15 (negative, integer, odd)
- Decimal to percentage conversion (0.75 = 75%)

#### Case File #010: "The Divisibility Code"
- Divisibility rules application (4,572 divisible by 2, 3, 4, 6)
- Volume calculation (rectangular solid 4×3×2 = 24)
- Prime factorization (60 = 2² × 3 × 5)
- Set theory (counting numbers less than 5: {1,2,3,4} = 4 elements)

### Technical Features
- **Question-by-question navigation** with inline Previous/Next buttons in question titles
- **Dynamic case loading** with smooth transitions between questions
- **Real-time scoring** with immediate feedback on submissions
- **Detective ranking system** with 8 progressive levels (0-245 points)
- **Responsive grid layout** for case selection interface
- **Mobile-friendly design** with proper viewport and touch interactions
- **Case completion tracking** with visual indicators and progress updates

### Scoring & Ranking System
- **Evidence Points** awarded based on accuracy across question types
- **Multiple choice questions**: 10 points maximum with accuracy-based scoring
- **Dropdown selections**: 3-10 points per correct answer
- **Number inputs**: 3-4 points each for exact matches
- **Complex multi-part questions**: Variable points per component

#### Detective Ranks (Evidence Points Required)
1. **Detective Trainee** (0+ points) - 🥉
2. **Junior Detective** (25+ points) - 🔍  
3. **Street Detective** (50+ points) - 👮‍♂️
4. **Private Investigator** (85+ points) - 🕵️‍♂️
5. **Senior Detective** (125+ points) - 🎖️
6. **Master Detective** (170+ points) - 🏆
7. **Legendary Sleuth** (210+ points) - 👑
8. **Mathematical Mastermind** (235+ points) - 🧠

### Styling Details
- **Red gradient theme** (#dc2626 to #991b1b) throughout interface
- **Card-based layout** with rounded corners and subtle shadows  
- **Glassmorphism effects** with backdrop-filter blur on key components
- **Responsive typography** using Segoe UI font family
- **Interactive elements** with hover states, transforms, and color transitions
- **Mobile-optimized** with media queries for different screen sizes

### JavaScript Functionality
- **Game state management** tracking team name, scores, completion status
- **Question navigation** with Previous/Next functionality between questions within cases
- **Answer validation** with immediate scoring and feedback
- **Detective ranking** updates based on cumulative Evidence Points
- **Case progression** logic with completion tracking
- **Dynamic UI updates** for score display, rank advancement, and case status

### Educational Value
- **Comprehensive MOEMS coverage** spanning all major competition topics
- **Progressive difficulty** from basic concepts to Division M advanced problems
- **Vocabulary reinforcement** through contextual problem-solving
- **Real-world application** of mathematical concepts in detective scenarios
- **Self-paced learning** with ability to review previous questions before submission

### Deployment
Complete, self-contained HTML file optimized for:
- **GitHub Pages** direct deployment
- **School networks** with minimal bandwidth requirements
- **Chromebook compatibility** for classroom use
- **Mobile devices** for home practice and review

This implementation provides a comprehensive math competition training tool that engages middle school students through gamification while covering essential MOEMS vocabulary and problem-solving skills.