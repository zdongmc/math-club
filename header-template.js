// Shared header template for all pages
const HEADER_HTML = `
    <header class="header">
        <div class="header-content">
            <div class="header-main">
                <div class="header-logo">
                    <img src="HWMS.jpeg" alt="Hallie Wells Middle School Logo" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div class="header-text">
                    <h1>Competition Math Club 2025-2026</h1>
                    <p class="subtitle">Hallie Wells Middle School</p>
                </div>
            </div>
            <nav class="header-nav">
                <a class="nav-item" href="announcements.html" data-page="announcements">📢 Announcements</a>
                <a class="nav-item" href="club.html" data-page="club">ℹ️ Club Info</a>
                <a class="nav-item" href="competitions.html" data-page="competitions">📅 Competition Info</a>
                <a class="nav-item" href="registration.html" data-page="registration">📝 Registration & Records</a>
            </nav>
        </div>
    </header>

    <style>
        /* Header Styles */
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 15px 20px;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.1; }
        }

        .header-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            margin: 0 auto;
        }

        .header-main {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .header-logo img {
            height: 45px;
            width: auto;
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: transform 0.3s ease;
        }

        .header-text h1 {
            font-size: 1.6rem;
            margin: 0;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            line-height: 1.2;
        }

        .header-text .subtitle {
            font-size: 0.85rem;
            opacity: 0.9;
            margin: 2px 0 0 0;
        }

        .header-icons {
            font-size: 3rem;
            margin: 20px 0;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        /* Navigation in Header */
        .header-nav {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .nav-item {
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            text-decoration: none;
            color: #333;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
        }

        .nav-item:hover {
            background: rgba(255, 255, 255, 1);
            color: #dc2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .nav-item.active {
            background: rgba(255, 255, 255, 1);
            color: #dc2626;
            font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .header {
                padding: 10px 15px;
            }
            
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .header-main {
                gap: 15px;
            }
            
            .header-text h1 {
                font-size: 1.4rem;
            }
            
            .header-text .subtitle {
                font-size: 0.8rem;
            }

            .header-nav {
                gap: 10px;
                justify-content: center;
            }

            .nav-item {
                padding: 6px 12px;
                font-size: 0.85rem;
            }
        }
    </style>
`;

function loadHeader() {
    document.getElementById('header-container').innerHTML = HEADER_HTML;
    
    // Set active navigation state based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'announcements.html';
    const pageMap = {
        'announcements.html': 'announcements',
        'club.html': 'club', 
        'competitions.html': 'competitions',
        'registration.html': 'registration'
    };
    
    const currentPageKey = pageMap[currentPage];
    if (currentPageKey) {
        const activeNavItem = document.querySelector(`[data-page="${currentPageKey}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    // Header animation on scroll
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const headerIcons = document.querySelector('.header-icons');
        if (headerIcons) {
            headerIcons.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}