// ==UserScript==
// @name        DLChannel_Safety
// @version     0.1
// @description DLチャンネルでのまとめ編集時に反映ボタンやアイテムのキャンセルボタンを誤操作しないようアラートを出すスクリプト。
// @match       https://ch.dlsite.com/matome/create/*
// @match       https://ch.dlsite.com/matome/create
// @match       https://ch.dlsite.com/matome/*/edit
// @run-at      document-idle
// ==/UserScript==

// 下書きモードかどうか（下書きタグがあるか）
var is_draft = false;
// 下書きモードにしたときに一連のメソッドを実行する
var setDraft = (flag) => {
    if (typeof (flag) === 'boolean' && is_draft !== flag) {
        is_draft = flag;
        if (is_draft) {
            hideSubmitButton();
            setItemChangeObserver();
        }
    }
}

// 下書きモードかどうか記事中のタグから推察する
var setTagSelectorObserver = () => {
    const tagSelector = document.querySelector('#tag-selector');
    if (tagSelector) {
        const tagObserver = new MutationObserver((_records) => {
            for (const el of Array.from(tagSelector.querySelectorAll('span.multiselect__tag'))) {
                if (el.innerText.trim() == '下書き') {
                    el.style.backgroundColor = 'red';
                    setDraft(true);
                    return;
                }
            }
            setDraft(false);
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
// 実行
setTagSelectorObserver();

// 反映ボタンを隠す
var hideSubmitButton = () => {
    const buttons = document.querySelectorAll('.matome-edit-section button.btn');
    if (!buttons || buttons.length == 0) {
        setTimeout(() => {
            hideSubmitButton();
        }, 100);
        return;
    }
    for (const b of Array.from(buttons)) {
        if (b.innerText.trim() === '反映') {
            if (b.disabled !== true) {
                let newButton = b.cloneNode(true);
                b.disabled = true;
                newButton.classList.add('replaced-button', 'btn-green');
                newButton.classList.remove('btn-blue');
                newButton.addEventListener('click', (_e) => {
                    if (confirm('反映ボタンを解除しますか？')) {
                        b.disabled = false;
                        newButton.hidden = true;
                    }
                });
                b.parentElement.insertBefore(newButton, b.nextSibling);
                return;
            }
        }
    }
}

// アイテムの変更に応じてキャンセルボタンを置換するObserver
const itemChangedObserver = new MutationObserver((records) => {
    for (const rec of records) {
        if (rec.type !== 'childList') {
            continue;
        }
        // アイテム編集時はelement-editableからform-groupになるのでそれに合わせる
        if (rec.removedNodes.length > 0) {
            const removed = Array.from(rec.removedNodes);
            if (removed.some(node =>node.classList && node.classList.contains('element-editable'))) {
                const buttons = rec.target.querySelectorAll('button.btn');
                for (const b of buttons) {
                    if (b.innerText.trim() == 'キャンセル') {
                        hideCancelButton(b);
                        return;
                    }
                }
            }
        }
        // 新規アイテム追加時は.element-item要素が増えるのでそれに合わせる
        if (rec.addedNodes.length > 0) {
            const added = Array.from(rec.addedNodes);
            if (added.some(node => node.classList && node.classList.contains('element-item'))) {
                const buttons = rec.target.querySelectorAll('button.btn');
                for (const b of buttons) {
                    if (b.innerText.trim() == 'キャンセル') {
                        hideCancelButton(b);
                        return;
                    }
                }
            }
        }
    }
})

// #items-containerを探してobserveする
var setItemChangeObserver = (retryCount = 0) => {
    const itemsContainer = document.getElementById('items-container');
    const options = { childList: true, subtree: true };
    if (itemsContainer) {
        itemChangedObserver.observe(itemsContainer, options);
    } else {
        if (retryCount > 15) return;
        setTimeout(() => {
            setItemChangeObserver(retryCount + 1);
        }, 100);
    }
}

// キャンセルボタンを置き換える
var hideCancelButton = (cancelButton) => {
    if (!cancelButton) return;
    let newButton = cancelButton.cloneNode(true);
    newButton.addEventListener('click', (_e) => {
        if (confirm('アイテムの内容が消えてしまいますがよろしいですか？')) {
            cancelButton.click();
        }
    });
    newButton.classList.add('replaced-button');
    cancelButton.hidden = true;
    cancelButton.parentElement.insertBefore(newButton, cancelButton);
}

