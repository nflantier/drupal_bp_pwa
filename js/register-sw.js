(function ( Drupal, drupalSettings) {
    Drupal.behaviors.registerSW = {
        attach: function attach(context) {
            if (navigator && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    try{
                        navigator.serviceWorker.register('/'+drupalSettings.service_worker.filename+'.js')
                    }catch(err){
                        console.log('SW registration failed')
                    }
                    /*.then(registration => console.log('Service Worker registered'))
                    .catch(err => 'SW registration failed')*/});
            }
        }
    }
})(Drupal, drupalSettings);