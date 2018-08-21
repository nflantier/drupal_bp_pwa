'use strict';

(function (Drupal, drupalSettings) {
    Drupal.behaviors.registerSW = {
        attach: function attach(context, settings) {
            if (navigator && 'serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                    try {
                        navigator.serviceWorker.register('/' + drupalSettings.service_worker.filename + '.js');
                    } catch (err) {
                        console.log('SW registration failed');
                    }
                });
            }
        }
    };
})(Drupal, drupalSettings);