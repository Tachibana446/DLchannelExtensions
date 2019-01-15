// ==UserScript==
// @name        DLsite_HideImage
// @version     0.1
// @description 見たくないものから目を逸らして生き続けたい。
// @match       https://www.dlsite.com/*
// @run-at      document-idle
// ==/UserScript==

const atag = document.querySelector('a[href="https://www.dlsite.com/maniax/promo/voice-cm"]');
if (atag) {
    const img = atag.getElementsByTagName('img')[0];
    if (img) {
        atag.removeChild(img);
        let alt = document.createElement('div');
        alt.textContent = '代替画像';
        alt.style.backgroundColor = 'palegreen';
        alt.style.color = 'white';
        alt.style.width = '215px';
        alt.style.height = '215px';
        atag.appendChild(alt);
    }
}