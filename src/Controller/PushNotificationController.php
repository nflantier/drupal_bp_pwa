<?php

namespace Drupal\service_worker\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Database\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\service_worker\Model\SubscriptionsData;

/**
 * Controller routines for Browser push notification.
 */
class PushNotificationController extends ControllerBase {

  protected $database;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
        $container->get('database')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(Connection $database) {
    $this->database = $database;
  }
  /**
   * This event will be triggered when user subscribe for notification.
   */
  public function subscribe(Request $request) {
    if ($request) {
      $data = json_decode($request->getContent(), TRUE);
      $entry['subscription_endpoint'] = $data['endpoint'];
      $entry['subscription_data'] = serialize(['key' => $data['key'], 'token' => $data['token']]);
      $entry['registered_on'] = strtotime(date('Y-m-d H:i:s'));
      $success = SubscriptionsData::insert($entry);
      return new JsonResponse([$data]);
    }
  }

  
  public function subscriptionList() {
    // The table description.
    $header = [
      [
        'data' => $this->t('Id'),
      ],
      ['data' => $this->t('Subscription Endpoint')],
      [
        'data' => $this->t('Registeration Date'),
      ],
    ];
    $getFields = [
      'id',
      'subscription_endpoint',
      'registered_on',
    ];
    $query = $this->database->select(SubscriptionsDatastorage::$browserSubscriptionTable);
    $query->fields(SubscriptionsDatastorage::$browserSubscriptionTable, $getFields);
    // Limit the rows to 50 for each page.
    $pager = $query->extend('Drupal\Core\Database\Query\PagerSelectExtender')
      ->limit(SubscriptionsDatastorage::$browserSubscriptionCount);
    $result = $pager->execute();

    // Populate the rows.
    $rows = [];
    foreach ($result as $row) {
      $rows[] = [
        'data' => [
          'id' => $row->id,
          'register_id' => $row->subscription_endpoint,
          'date' => date('d/m/Y', $row->registered_on),
        ],
      ];
    }
    if (empty($rows)) {
      $markup = $this->t('No record found.');
    }
    else {
      $markup = $this->t('List of All Subscribed Users.');
    }
    $build = [
      '#markup' => $markup,
    ];
    // Generate the table.
    $build['config_table'] = [
      '#theme' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];

    $build['pager'] = [
      '#type' => 'pager',
    ];
    return $build;
  }
}