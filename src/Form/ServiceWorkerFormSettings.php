<?php
namespace Drupal\service_worker\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Minishlink\WebPush\VAPID;

/**
 * Configure example settings for this site.
 */
class ServiceWorkerFormSettings extends ConfigFormBase {
  /** 
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'service_worker_settings_form';
  }

  /** 
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'service_worker.settings',
    ];
  }

  /** 
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('service_worker.settings');
  
    $filename = $config->get('filename');
    $manifestfilename = $config->get('manifestfilename');
    $themecolor = $config->get('themecolor');

    $form['filename'] = array(
        '#type' => 'textfield',
        '#title' => $this->t('FileName of the service worker (whitout extension)'),
        '#default_value' => $filename,
    );

    $form['manifestfilename'] = array(
        '#type' => 'textfield',
        '#title' => $this->t('FileName of the manifest (whitout extension)'),
        '#default_value' => $manifestfilename,
    );

    $form['themecolor'] = array(
        '#type' => 'textfield',
        '#title' => $this->t("Theme's color"),
        '#default_value' => $themecolor,
    );
    
    $form['enable_push_notifications'] = array(
      '#type' => 'checkbox',
      '#title' => t("Enable push notifications"),
      '#default_value' =>  $config->get('enable_push_notifications'),
    );

    $form['vapid_public_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Public Key'),
      '#maxlength' => 100,
      '#default_value' => $config->get('vapid_public_key'),
    ];

    $form['vapid_private_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Private Key'),
      '#maxlength' => 100,
      '#default_value' => $config->get('vapid_private_key'),
    ];

    $form['to_generate'] = array(
      '#type' => 'checkbox',
      '#title' => t("Re-generate VAPID keys"),
      '#default_value' => false,
      '#weight' => 100,
    );

    return parent::buildForm($form, $form_state);
  }

  /** 
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    parent::submitForm($form, $form_state);
    $this->config('service_worker.settings')
      ->set('filename', $form_state->getValue('filename'))
      ->set('manifestfilename', $form_state->getValue('manifestfilename'))
      ->set('enable_push_notifications', $form_state->getValue('enable_push_notifications'))
      ->set('themecolor', $form_state->getValue('themecolor'))
      ->save();
    $generate = $form_state->getValue('to_generate');
    if( $generate == true || $generate == 1 ){
      $keys = VAPID::createVapidKeys();
      $this->config('service_worker.settings')
        ->set('vapid_public_key', $keys['publicKey'])
        ->set('vapid_private_key', $keys['privateKey'])
        ->save();
    }
  }

}