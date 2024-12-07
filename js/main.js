// 메인 페이지 여부 확인
function isMainPage() {
    return !window.location.pathname.startsWith('/wd/');
}

// 페이지 변경 감지 및 처리를 위한 옵저버 설정
let lastObserverRun = 0;
const THROTTLE_DELAY = 500;

const observer = new MutationObserver((mutations) => {
    const now = Date.now();
    if (now - lastObserverRun >= THROTTLE_DELAY) {
        if (isMainPage()) {
            markHiddenJobs();
            markVisitedJobs();
            
        }
        lastObserverRun = now;
    }
});

// 옵저버 시작
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});

// 초기 실행
(function() {
    if (isMainPage()) {
        markHiddenJobs();     // from hideMark.js
        setupClickListeners(); // from visitedMark.js
        markVisitedJobs();    // from visitedMark.js
    }
})(); 