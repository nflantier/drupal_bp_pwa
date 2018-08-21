'use strict';

jQuery(document).ready(function ($) {
    if (navigator && 'serviceWorker' in navigator) {
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            document.querySelectorAll(".a2hs").forEach(function (btn) {
                btn.classList.add("show-pwa");
                btn.onclick = function () {
                    return e.prompt();
                };
            });
        });
    }
});