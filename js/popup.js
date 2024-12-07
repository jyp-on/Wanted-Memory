// 숨긴 채용공고 정보를 저장할 객체
let hiddenJobsInfo = {};

// 채용공고 복원 함수
function restoreJob(jobId) {
    chrome.storage.local.get(['hiddenJobs', 'hiddenJobsInfo'], function(result) {
        const hiddenJobs = result.hiddenJobs || [];
        const currentHiddenJobsInfo = result.hiddenJobsInfo || {};
        
        // hiddenJobs 배열에서 해당 jobId 제거
        const updatedHiddenJobs = hiddenJobs.filter(id => id !== jobId);
        
        // hiddenJobsInfo 객체에서 해당 jobId 정보 제거
        const updatedHiddenJobsInfo = { ...currentHiddenJobsInfo };
        delete updatedHiddenJobsInfo[jobId];
        
        // 스토리지 업데이트
        chrome.storage.local.set({ 
            hiddenJobs: updatedHiddenJobs,
            hiddenJobsInfo: updatedHiddenJobsInfo 
        }, function() {
            // DOM에서 해당 항목 제거
            const jobElement = document.querySelector(`[data-job-id="${jobId}"]`);
            if (jobElement) {
                jobElement.remove();
            }
            
            // 현재 활성화된 탭에 메시지 전송
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'restoreJob',
                        jobId: jobId
                    });
                }
            });
            
            // 목록이 비었는지 확인
            checkEmptyList();
            
            // 로컬 상태 업데이트
            hiddenJobsInfo = updatedHiddenJobsInfo;
        });
    });
}

// 빈 목록 체크 및 표시
function checkEmptyList() {
    const listElement = document.getElementById('hiddenJobsList');
    if (!listElement.querySelector('.hidden-job-item')) {
        listElement.innerHTML = '<div class="no-items">숨긴 채용공고가 없습니다</div>';
    }
}

// 채용공고 항목 HTML 생성
function createJobItemHTML(jobId, jobInfo) {
    return `
        <div class="hidden-job-item" data-job-id="${jobId}">
            <div class="hidden-job-info">
                <div class="position-name">${jobInfo.positionName || '직무명 없음'}</div>
                <div class="company-name">${jobInfo.companyName || '회사명 없음'}</div>
            </div>
            <button class="restore-button">복원</button>
        </div>
    `;
}

// 초기 로드
document.addEventListener('DOMContentLoaded', function() {
    const listElement = document.getElementById('hiddenJobsList');
    const toggleSection = document.getElementById('toggleSection');
    const toggleButton = toggleSection.querySelector('.toggle-button');
    
    // 토글 기능 추가
    toggleSection.addEventListener('click', function() {
        listElement.classList.toggle('active');
        toggleButton.classList.toggle('active');
    });
    
    // 복원 버튼 클릭 이벤트 위임
    listElement.addEventListener('click', function(e) {
        if (e.target.classList.contains('restore-button')) {
            const jobItem = e.target.closest('.hidden-job-item');
            if (jobItem) {
                const jobId = jobItem.dataset.jobId;
                restoreJob(jobId);
            }
        }
    });
    
    // 숨긴 채용공고 목록 로드
    chrome.storage.local.get(['hiddenJobs', 'hiddenJobsInfo'], function(result) {
        const hiddenJobs = result.hiddenJobs || [];
        hiddenJobsInfo = result.hiddenJobsInfo || {};
        
        if (hiddenJobs.length === 0) {
            listElement.innerHTML = '<div class="no-items">숨긴 채용공고가 없습니다</div>';
            return;
        }
        
        // 숨긴 채용공고 목록 표시
        hiddenJobs.forEach(jobId => {
            const jobInfo = hiddenJobsInfo[jobId] || {};
            listElement.insertAdjacentHTML('beforeend', createJobItemHTML(jobId, jobInfo));
        });
    });
}); 