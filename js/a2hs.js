if (navigator && 'serviceWorker' in navigator) {
    //window.addEventListener('load', function() {
        var deferredPrompt;
        var classBtn = '.a2hs';
        var btns = document.querySelectorAll(classBtn);
        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            btns.forEach(function(btn) {
                btn.classList.add("show-pwa");
                btn.onclick = () => e.prompt();
            })
            /*e.preventDefault();
            deferredPrompt = e;
            deferredPrompt.prompt();
            if (typeof document.querySelectorAll === "function") {
                btns = document.querySelectorAll(classBtn);
                btns.forEach(function(btn) {
                    btn.classList.add("show-pwa");
                })
    
                btns.addEventListener('click', (e) => {
                    console.log("..bouton cliqué")
                    e.target.classList.remove("show-pwa");
                    deferredPrompt.prompt();
                    
                    deferredPrompt.userChoice
                      .then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                          console.log('User accepted the A2HS prompt');
                        } else {
                          console.log('User dismissed the A2HS prompt');
                        }
                        deferredPrompt = null;
                    });
                });
            }*/
            
        });
    //});
}