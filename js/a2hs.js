if (navigator && 'serviceWorker' in navigator) {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        document.querySelectorAll(".a2hs").forEach(function(btn) {
            btn.classList.add("show-pwa");
            btn.onclick = () => e.prompt();
        })        
    });
}