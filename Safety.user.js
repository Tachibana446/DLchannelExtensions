// ==UserScript==
// @name        DLChannel_Safety
// @version     0.1
// @match       https://*.dlsite.com/matome/create/*
// @run-at      document-idle
// ==/UserScript==


is_draft = false;
// 下書きモードかどうか記事中のタグから推察する
setTagSelectorObserver = () => {
    const tagSelector = document.querySelector('#tag-selector');
    if (tagSelector) {
        const tagObserver = new MutationObserver((_records) => {
            for (const el of Array.from(tagSelector.querySelectorAll('span.multiselect__tag'))) {
                if (el.innerText.trim() == '下書き') {
                    el.style.backgroundColor = 'red';
                    is_draft = true;
                    return;
                }
            }
            is_draft = false;
        })
        tagObserver.observe(tagSelector, { childList: true, subtree: true })
    }
    else {
        setTimeout(() => {
            console.log('retry setTagSelectorObs');
            setTagSelectorObserver();
        }, 100);
    }
}

setTagSelectorObserver();