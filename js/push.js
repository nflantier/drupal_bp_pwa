//service worker ready
//then serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription()
//if pas de subscription
    //update subscription
    /*serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
    }))*/
    //return send subscription to server
        //fetch to 91../subscribe JSON format endpoint key token
        /*
                SERVER STORE USER AND CREDS
        */

(function ($, Drupal, drupalSettings) {
    'use strict';
    var public_key = drupalSettings.service_worker.vapid_public_key;
    Drupal.behaviors.handlePushNotification = {
        attach: function (context, settings) {
            var applicationServerKey = public_key;
            if (!(applicationServerKey)) {
                return;
            }
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
            if (Notification.permission === 'denied') {
                return;
            }



            function urlBase64ToUint8Array(base64String) {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');
        
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
        
                for (let i = 0; i < rawData.length; ++i) {
                  outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            }





            navigator.serviceWorker.ready.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
                if (!subscription) {
                        // We aren't subscribed to push, so enable subscription.
                        // return;.
                        //for now automatic subscription
                    if(confirm("Subscribe to push ?"))
                        push_updateSubscription();
                }
            })
            .then(subscription => subscription)
            .catch(e => {
                // console.error('Error when updating the subscription', e);
            });
      




            function push_updateSubscription() {
                navigator.serviceWorker.ready.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
                .then(subscription => {
                  if (!subscription) {
                        // We aren't subscribed to push, so enable subscription.
                    push_subscribe();
                    return;
                  }
                  // Return push_sendSubscriptionToServer(subscription, 'PUT');.
                })
                .then(subscription => subscription) // Set your UI to show they have subscribed for push messages.
                .catch(e => {
                    // console.error('Error when updating the subscription', e);
                });
            }




            
            function push_subscribe() {
                navigator.serviceWorker.ready
                .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
                }))
                .then(subscription => {
                    // Subscription was successful
                    // create subscription on your server.
                    return push_sendSubscriptionToServer(subscription, 'POST');
                })
                .then(subscription => subscription )
                .catch(e => {
                    if (Notification.permission === 'denied') {
                            // The user denied the notification permission which
                            // means we failed to subscribe and the user will need
                            // to manually change the notification permission to
                            // subscribe to push messages.
                            // console.warn('Notifications are denied by the user.');
                    }
                    else {
                            // A problem occurred with the subscription; common reasons
                            // include network errors or the user skipped the permission.
                            // console.error('Impossible to subscribe to push notifications', e);
                            // changePushButtonState('disabled');.
                    }
                });
            }




            
            function push_sendSubscriptionToServer(subscription, method) {
                const key = subscription.getKey('p256dh');
                const token = subscription.getKey('auth');
                // console.log(btoa(String.fromCharCode.apply(null, new Uint8Array(key))));
                // console.log( btoa(String.fromCharCode.apply(null, new Uint8Array(token))));
                // console.log(subscription.endpoint);
                return fetch('/subscribe', {
                    method,
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                        key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                        token: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
                    })
                })
                .then((resp) => resp.json())
                .then(function (data) {})
                .catch(function (err) {});
            }
        }
    }
})(jQuery, Drupal, drupalSettings);