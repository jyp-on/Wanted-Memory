// 방문한 공고 ID를 저장하는 함수
function markAsVisited(jobId) {
    chrome.storage.local.get(['visitedJobs'], function(result) {
        let visitedJobs = result.visitedJobs || [];
        if (!visitedJobs.includes(jobId)) {
            visitedJobs.push(jobId);
            chrome.storage.local.set({ visitedJobs: visitedJobs });
        }
    });
}

// 체크마크 SVG 생성
function createCheckmarkSVG() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="16" 
             height="16" 
             viewBox="0 0 24 24" 
             style="fill: white;">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
    `;
}

// 방문 표시 요소 생성 및 스타일 직접 적용
function createVisitedMark() {
    const visitedMark = document.createElement('div');
    visitedMark.className = 'visited-mark';
    
    // 인라인 스타일 직접 적용
    Object.assign(visitedMark.style, {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: '#00c853',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999999',
        pointerEvents: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    });
    
    visitedMark.innerHTML = createCheckmarkSVG();
    return visitedMark;
}

// 방문 표시를 적용하는 함수
function markVisitedJobs() {
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
                if (existingMark) {
                    existingMark.remove();
                }
                thumbArea.appendChild(createVisitedMark());
            }
        });
    });
}

// 클릭한 공고 ID 저장
function saveClickedJob(jobId) {
    chrome.storage.local.get(['visitedJobs'], function(result) {
        const visitedJobs = result.visitedJobs || [];
        if (!visitedJobs.includes(jobId)) {
            visitedJobs.push(jobId);
            chrome.storage.local.set({ visitedJobs: visitedJobs });
        }
    });
}

// 방문 표시 제거 함수
function removeVisitedMarks() {
    const marks = document.querySelectorAll('.visited-mark');
    marks.forEach(mark => mark.remove());
}

// 클릭 이벤트 리스너 설정
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

// 메인 페이지인지 확인하는 함수
function isMainPage() {
    return !window.location.pathname.startsWith('/wd/');
}

// 초기화 및 실행
(function() {
    if (isMainPage()) {
        setupClickListeners();
        markVisitedJobs();
    }
})();

// DOM 변경 감지를 위한 옵저버 설정
const observer = new MutationObserver(function(mutations) {
    markVisitedJobs();
});

// 옵저버 시작
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});
