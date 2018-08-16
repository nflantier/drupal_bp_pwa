<?php

namespace Drupal\service_worker\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\service_worker\Model\SubscriptionsData;

/**
 * Class PushNotificationForm.
 *
 * @package Drupal\browser_push_notification\Form
 */
class PushNotificationForm extends FormBase {
    
  protected $database;

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database')
    );
  }

  public function __construct(Connection $database) {
    $this->database = $database;
  }

  public function getFormId() {
    return 'push_notification_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {

    // Form constructor.
    $form['sendMessage'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Push Notification Details'),
    ];
    $form['sendMessage']['title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Notification Title'),
      '#required' => TRUE,
      '#size' => 100,
      '#description' => $this->t('Enter the Title of the Notification.'),
    ];

    $form['sendMessage']['body'] = [
      '#type' => 'textarea',
      '#required' => TRUE,
      '#title' => $this->t('Notification Message'),
      '#maxlength' => 300,
      '#description' => $this->t('Enter the Message of the Notification.'),
    ];

    $form['sendMessage']['icon'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Notification Image URL'),
      '#description' => $this->t('Enter the Image URL which will show in the Notification.'),
    ];

    $form['sendMessage']['url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Notification URL'),
      '#description' => $this->t('Enter the URL on which user will redirect after clicking on Notification.Eg.http://example.com/test-contents'),
    ];

    $form['sendMessage']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Send Notification'),
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state) {
    $url = $form_state->getValue('url');
    if (!empty($url) && !(filter_var($url, FILTER_VALIDATE_URL))) {
      $form_state->setErrorByName('url', $this->t('Not a valid url.'));
    }

    $icon = $form_state->getValue('icon');
    if (!empty($icon) && !(filter_var($icon, FILTER_VALIDATE_URL))) {
      $form_state->setErrorByName('icon', $this->t('Not a valid image url.'));
    }
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $entry = [
      'title' => $form_state->getValue('title'),
      'body' => $form_state->getValue('body'),
      'icon' => $form_state->getValue('icon'),
      'url' => $form_state->getValue('url'),
    ];
    $notification_data = implode('<br>', array_filter($entry));
    $subscriptions = SubscriptionsData::loadAll();
    $vapid_public_key = $this->config('service_worker.settings')->get('vapid_public_key');
    $vapid_private_key = $this->config('service_worker.settings')->get('vapid_private_key');
    if (empty($vapid_public_key) && empty($vapid_private_key)) {
      drupal_set_message($this->t('Please set public & private key.'), 'error');
    }
    if (!empty($subscriptions) && !empty($vapid_public_key) && !empty($vapid_private_key)) {
      $batch = [
        'title' => $this->t('Sending Push Notification...'),
        'operations' => [
          [
            '\Drupal\service_worker\Model\SubscriptionsData::sendNotificationStart',
            [$subscriptions, $notification_data],
          ],
        ],
        'finished' => '\Drupal\service_worker\Model\SubscriptionsData::notificationFinished',
      ];
      batch_set($batch);
      drupal_set_message($this->t('Push notification sent successfully to  @entry users', ['@entry' => print_r(count($subscriptions), TRUE)]));
    }
    else {
      drupal_set_message($this->t('Subscription list is empty.'), 'error');
    }
  }
}