// Function to apply visit marks with debouncing
let markVisitedJobsTimeout;
function markVisitedJobs() {
    if (markVisitedJobsTimeout) {
        clearTimeout(markVisitedJobsTimeout);
    }
    
    markVisitedJobsTimeout = setTimeout(() => {
        chrome.storage.local.get(['visitedJobs'], function(result) {
            const visitedJobs = result.visitedJobs || [];
            const jobCards = document.querySelectorAll('ul[data-cy="job-list"] > li > div.JobCard_JobCard__Tb7pI');
            
            jobCards.forEach(card => {
                const link = card.querySelector('a[data-position-id]');
                if (!link) return;
                
                const jobId = link.getAttribute('data-position-id');
                const thumbArea = card.querySelector('.JobCard_JobCard__thumb__WU1ax');
                
                if (visitedJobs.includes(jobId) && thumbArea) {
                    const existingMark = thumbArea.querySelector('.visited-mark');
                    if (!existingMark) {
                        thumbArea.appendChild(createVisitedMark());
                    }
                }
            });
        });
    }, 300); // 300ms 딜레이
}

// Create a visual marker for visited job posts
function createVisitedMark() {
    const mark = document.createElement('div');
    mark.className = 'visited-mark';
    mark.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
    </svg>`;
    return mark;
}

// Save clicked job ID
function saveClickedJob(jobId) {
    chrome.storage.local.get(['visitedJobs'], function(result) {
        const visitedJobs = result.visitedJobs || [];
        if (!visitedJobs.includes(jobId)) {
            visitedJobs.push(jobId);
            chrome.storage.local.set({ visitedJobs: visitedJobs });
        }
    });
}

// Set up click event listeners
function setupClickListeners() {
    document.addEventListener('click', function(e) {
        const jobLink = e.target.closest('a[data-position-id]');
        if (jobLink) {
            const jobId = jobLink.getAttribute('data-position-id');
            if (jobId) {
                saveClickedJob(jobId);
            }
        }
    });
}

// Check if the current page is the main page
function isMainPage() {
    return !window.location.pathname.startsWith('/wd/');
}

// Set up observer for DOM changes with throttling
let lastObserverRun = 0;
const THROTTLE_DELAY = 1000; // 1초

const observer = new MutationObserver(function(mutations) {
    const now = Date.now();
    if (now - lastObserverRun >= THROTTLE_DELAY) {
        markVisitedJobs();
        lastObserverRun = now;
    }
});

// Start observing
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});

// Initialize and execute
(function() {
    if (isMainPage()) {
        setupClickListeners();
        markVisitedJobs();
    }
})();
