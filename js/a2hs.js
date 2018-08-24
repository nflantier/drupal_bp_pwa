'use strict';

jQuery(document).ready(function ($) {
    if (navigator && 'serviceWorker' in navigator) {
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            document.querySelectorAll(".bt-a2hs").forEach(function (btn) {
                btn.classList.add("show-a2hs");
                btn.querySelectorAll("span").forEach(function (sp) {
                    sp.onclick = function () {
                        return e.prompt();
                    };
                });
            });
        });
    }
});