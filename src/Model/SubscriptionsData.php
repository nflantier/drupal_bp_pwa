<?php

namespace Drupal\service_worker\Model;

use Drupal\Core\Database\Database;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class SubscriptionsData {
  public static $subscriptionsTable = 'service_worker_subscriptions';
  public static $subscriptionsPerPage = 10;

  public static function insert(array $entry, Database $database = null ) {
    $connection = Database::getConnection();
    $return_value = NULL;
    $arguments = [];
    $arguments[':endpoint'] = $entry['subscription_endpoint'];
    $subscription_exist = $connection->select(self::$subscriptionsTable)
      ->fields('service_worker_subscriptions')
      ->where('subscription_endpoint=:endpoint', $arguments)
      ->execute()
      ->fetchAll();
    if ($subscription_exist) {
      return $subscription_exist;
    }
    try {
      $return_value = $connection->insert('service_worker_subscriptions')
        ->fields($entry)
        ->execute();
    }
    catch (\Exception $e) {
      drupal_set_message(t('db_insert failed. Message = %message, query= %query',
      ['%message' => $e->getMessage(), '%query' => $e->query_string]), 'error');
    }
    return $return_value;
  }

  public static function loadAll() {
    // Read all fields from the browser_subscriptions table.
    $connection = Database::getConnection();
    return $connection->select(self::$subscriptionsTable)
      ->fields('service_worker_subscriptions')
      ->execute()
      ->fetchAll();
  }

  /**
   * Batch process to start subscription.
   *
   * @param array $subscriptionsData
   *   Array of subscriptions data.
   * @param string $notification_data
   *   String of notification data.
   */
  public static function sendNotificationStart(array $subscriptionsData, $notification_data) {
    if (!empty($subscriptionsData) && !empty($notification_data)) {
      $vapid_public_key = \Drupal::config('service_worker.settings')->get('vapid_public_key');
      $vapid_private_key = \Drupal::config('service_worker.settings')->get('vapid_private_key');
      $auth = [
        'VAPID' => [
          'subject' => 'https://github.com/Minishlink/web-push-php-example/',
          'publicKey' => $vapid_public_key,
          'privateKey' => $vapid_private_key,
        ],
      ];
      $webPush = new WebPush($auth);
      foreach ($subscriptionsData as $subscription) {
        $subscription_data = unserialize($subscription->subscription_data);
        $subscription_endpoint = $subscription->subscription_endpoint;
        $key = $subscription_data['key'];
        $token = $subscription_data['token'];
        if (!empty($key) && !empty($token) && !empty($subscription_endpoint)) {
          $webPush->sendNotification(
            new Subscription($subscription_endpoint, $key, $token),
            $notification_data,
            TRUE
          );
        }
      }
    }
  }

  /**
   * Batch End process.
   */
  public static function notificationFinished() {
    return TRUE;
  }
}