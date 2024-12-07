// 숨기기 버튼 생성
function createHideButton() {
    const button = document.createElement('button');
    button.className = 'hide-job-button';
    button.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
    `;
    return button;
}

// 숨긴 채용공고 저장
function saveHiddenJob(jobId, card) {
    chrome.storage.local.get(['hiddenJobs', 'hiddenJobsInfo'], function(result) {
        const hiddenJobs = result.hiddenJobs || [];
        const hiddenJobsInfo = result.hiddenJobsInfo || {};
        
        if (!hiddenJobs.includes(jobId)) {
            // 채용공고 ID 저장
            hiddenJobs.push(jobId);
            
            // 채용공고 정보 저장
            const link = card.querySelector('a[data-position-id]');
            hiddenJobsInfo[jobId] = {
                positionName: link.querySelector('.JobCard_JobCard__body__position__CyaGY')?.textContent,
                companyName: link.querySelector('.CompanyNameWithLocationPeriod_CompanyNameWithLocationPeriod__company__j_pad')?.textContent
            };
            
            // 스토리지에 저장
            chrome.storage.local.set({ 
                hiddenJobs: hiddenJobs,
                hiddenJobsInfo: hiddenJobsInfo
            });
        }
    });
}

// 숨긴 채용공고 표시 처리
function markHiddenJobs() {
    chrome.storage.local.get(['hiddenJobs'], function(result) {
        const hiddenJobs = result.hiddenJobs || [];
        const jobCards = document.querySelectorAll('ul[data-cy="job-list"] > li > div.JobCard_JobCard__Tb7pI');
        
        jobCards.forEach(card => {
            const link = card.querySelector('a[data-position-id]');
            if (!link) return;
            
            const jobId = link.getAttribute('data-position-id');
            const thumbArea = card.querySelector('.JobCard_JobCard__thumb__WU1ax');
            
            // 이미 숨겨진 채용공고는 화면에서 숨김
            if (hiddenJobs.includes(jobId)) {
                card.closest('.Card_Card__WdaEk').classList.add('job-card-hidden');
                return;
            }
            
            // 숨기기 버튼이 없는 경우에만 추가
            if (thumbArea && !thumbArea.querySelector('.hide-job-button')) {
                const hideButton = createHideButton();
                hideButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    saveHiddenJob(jobId, card);
                    card.closest('.Card_Card__WdaEk').classList.add('job-card-hidden');
                });
                
                thumbArea.appendChild(hideButton);
            }
        });
    });
}

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'restoreJob') {
        const jobCard = document.querySelector(`a[data-position-id="${request.jobId}"]`)?.closest('.Card_Card__WdaEk');
        if (jobCard) {
            jobCard.classList.remove('job-card-hidden');
            // 복원된 카드에 hide 버튼 다시 추가
            const thumbArea = jobCard.querySelector('.JobCard_JobCard__thumb__WU1ax');
            if (thumbArea && !thumbArea.querySelector('.hide-job-button')) {
                const hideButton = createHideButton();
                hideButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    saveHiddenJob(request.jobId, jobCard);
                    jobCard.classList.add('job-card-hidden');
                });
                
                thumbArea.appendChild(hideButton);
            }
        }
    }
});