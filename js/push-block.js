(function ($, Drupal, drupalSettings) {
    'use strict';
    Drupal.behaviors.handlePushNotificationSettings = {
        attach: function (context, settings) {

            if (!(navigator && 'serviceWorker' in navigator)) {
                return;
            }
            if (!('PushManager' in window)) {
                return;
            }
            if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
                return;
            }
            if (!("Notification" in window)){
                return;
            }
            const state_notifications = document.querySelectorAll(".state-notifications")
            const bt_notifications = document.querySelectorAll(".bt-notifications")

            const inner = (val, elems) => elems.forEach(function(element) {
                element.innerHTML = val
            })


            bt_notifications.forEach(function(btn) {
                btn.onclick = (e) => {
                    navigator.serviceWorker.ready
                    .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
                    .then(subscription => {
                        if (Notification.permission === 'denied'){
                            return Notification.requestPermission()
                        }
                        if(!subscription){
                            const e = createpushevent(window.SW_PUSH_EVENT.subPush, (subscription)=> {
                                if(subscription)
                                    inner("Se désabonner des notifications", bt_notifications)
                            })
                        }else{
                            const e = createpushevent(window.SW_PUSH_EVENT.unsubPush, (unsubsuccess)=> {
                                if(unsubsuccess)
                                    inner("S' abonner aux notifications", bt_notifications)
                            })
                        }
                    })
                }
            })
            
            if (Notification.permission === 'denied') {
                inner('Les notifications sont bloquées', state_notifications)
                inner("Autoriser les notifications", bt_notifications)
                return;
            }
            if(Notification.permission === 'granted') {
                inner('Les notifications sont autorisées', state_notifications)
            }else{
                inner("Les notifications sont en attentes d'autorisation", state_notifications)
            }
            
            navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
                if(!subscription)
                    inner("S' abonner aux notifications", bt_notifications)
                else
                    inner("Se désabonner des notifications", bt_notifications)
            })


            function createpushevent(eventName, callback){
                let e = $.Event(eventName)
                e.callbackEvent = callback
                $(window).trigger(e)
            }

        }
    }
})(jQuery, Drupal, drupalSettings);