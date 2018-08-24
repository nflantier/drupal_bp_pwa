'use strict';

(function ($, Drupal, drupalSettings) {
    'use strict';

    Drupal.behaviors.handlePushNotificationSettings = {
        attach: function attach(context, settings) {

            if (!(navigator && 'serviceWorker' in navigator)) {
                return;
            }
            if (!('PushManager' in window)) {
                return;
            }
            if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
                return;
            }
            if (!("Notification" in window)) {
                return;
            }
            var state_notifications = document.querySelectorAll(".state-notifications");
            var bt_notifications = document.querySelectorAll(".bt-notifications");
            var bt_notifications_span = bt_notifications.querySelectorAll("span");

            var inner = function inner(val, elems) {
                return elems.forEach(function (element) {
                    element.innerHTML = val;
                });
            };

            bt_notifications.forEach(function (btn) {
                btn.onclick = function (e) {
                    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                        return serviceWorkerRegistration.pushManager.getSubscription();
                    }).then(function (subscription) {
                        if (Notification.permission === 'denied') {
                            return Notification.requestPermission();
                        }
                        if (!subscription) {
                            var _e = createpushevent(window.SW_PUSH_EVENT.subPush, function (subscription) {
                                if (subscription) inner("Se désabonner des notifications", bt_notifications_span);
                            });
                        } else {
                            var _e2 = createpushevent(window.SW_PUSH_EVENT.unsubPush, function (unsubsuccess) {
                                if (unsubsuccess) inner("S' abonner aux notifications", bt_notifications_span);
                            });
                        }
                    });
                };
            });

            if (Notification.permission === 'denied') {
                inner('Les notifications sont bloquées', state_notifications);
                inner("Autoriser les notifications", bt_notifications_span);
                return;
            }
            if (Notification.permission === 'granted') {
                inner('Les notifications sont autorisées', state_notifications);
            } else {
                inner("Les notifications sont en attentes d'autorisation", state_notifications);
            }

            navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                return serviceWorkerRegistration.pushManager.getSubscription();
            }).then(function (subscription) {
                if (!subscription) inner("S' abonner aux notifications", bt_notifications_span);else inner("Se désabonner des notifications", bt_notifications_span);
            });

            function createpushevent(eventName, callback) {
                var e = $.Event(eventName);
                e.callbackEvent = callback;
                $(window).trigger(e);
            }
        }
    };
})(jQuery, Drupal, drupalSettings);