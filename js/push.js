(function ($, Drupal, drupalSettings) {
    'use strict';
    var public_key = drupalSettings.service_worker.vapid_public_key;
    var askpushmethod = drupalSettings.service_worker.ask_push_method;
    var forceresubscription = drupalSettings.service_worker.force_resubscription
    window.SW_PUSH_EVENT = {subPush : 'subPush', unsubPush : 'unsubPush'}

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

            function equal (ar1, ar2){
                if (ar1.length != ar2.length) return false;
                for (var i = 0 ; i != ar1.byteLength ; i++){
                    if (ar1[i] != ar2[i]) return false;
                }
                return true;
            }

            function push_init(method){
                return navigator.serviceWorker.ready
                .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
                .then(subscription => {
                    //console.log('push', subscription)
                    //console.log('push', method)
                    if (!subscription) {
                        if(method == "fromconfirmdialog"){
                            if(confirm("Subscribe to push ?"))
                                return push_updateSubscription()
                        }else if(method == "fromloading" || method == "fromevent"){
                            return push_updateSubscription()
                        }
                    }else if(forceresubscription){
                        console.log("Forcing resubscription ( manually )")
                        return push_updateSubscription(true)
                    }else if(subscription && !equal( urlBase64ToUint8Array(applicationServerKey) , new Uint8Array(subscription.options.applicationServerKey, 0, 65) ) ){
                        console.log("Forcing resubscription ( key missmatch )")
                        return push_updateSubscription(true)
                    }
                    return subscription
                })
                .then( subscription => {
                    //console.log("push",subscription)
                    //console.log("appserverkey", applicationServerKey)
                    return subscription
                } )
                .catch(e => {
                    // console.error('Error when updating the subscription', e);
                });
            }

            $(window).on(window.SW_PUSH_EVENT.unsubPush, function (e) {
                //console.log('push', 'event unsub triggered')
                push_unsubscribe()
                .then(unsubsuccess => {
                    //console.log('push', unsubsuccess)
                    if(e.callbackEvent)
                        e.callbackEvent(unsubsuccess)
                })
            })
            
            $(window).on(window.SW_PUSH_EVENT.subPush, function (e) {
                //console.log('push', 'event sub triggered')
                push_init('fromevent')
                .then(subscription => {
                    if(e.callbackEvent)
                        e.callbackEvent(subscription)
                })
            })

            function push_updateSubscription(resubing = false) {
                return navigator.serviceWorker.ready
                .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
                .then(subscription => {
                    if (!subscription)
                        return push_subscribe()
                    if(resubing)
                        return push_resubscribe()
                })
                .then(subscription => subscription) // Set your UI to show they have subscribed for push messages.
                .catch(e => {});
            }


            function push_unsubscribe(){
                return navigator.serviceWorker.ready
                .then( serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription() )
                .then( subscription => push_sendUnSubscriptionToServer(subscription, 'POST') )
                .then( subscription => subscription.unsubscribe() , subscription => false)
                .catch(e => false)
            }
            function push_resubscribe(){
                return push_unsubscribe()
                .then(success => {
                        console.log(`Unsubbing success ? ${success}`)
                        return push_subscribe()
                    }
                )
            }
            function push_subscribe() {
                return navigator.serviceWorker.ready
                .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager
                    .subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
                    })
                )
                .then(subscription => push_sendSubscriptionToServer(subscription, 'POST'))
                .catch(e => {
                    if (Notification.permission === 'denied') {} else {}
                });
            }



            function push_sendUnSubscriptionToServer(subscription, method) {
                return fetch('/unsubscribe', {
                    method,
                    body: JSON.stringify({
                        endpoint: subscription.endpoint
                    })
                })
                .then( resp => resp.json() )
                .then( data => subscription )
                .catch(function (err) {});
            }
            
            function push_sendSubscriptionToServer(subscription, method) {
                const key = subscription.getKey('p256dh');
                const token = subscription.getKey('auth');
                return fetch('/subscribe', {
                    method,
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                        key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                        token: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
                    })
                })
                .then( resp => resp.json() ) // Transform the data into json.
                .then( data => subscription )
                .catch(function (err) {});
            }

            push_init(askpushmethod)
            //push_unsubscribe()
        }
    }
})(jQuery, Drupal, drupalSettings);