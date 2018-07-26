<?php
namespace Drupal\service_worker\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

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

    return parent::buildForm($form, $form_state);
  }

  /** 
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
      \Drupal::configFactory()->getEditable('service_worker.settings')
      ->set('filename', $form_state->getValue('filename'))
      ->set('manifestfilename', $form_state->getValue('manifestfilename'))
      ->set('themecolor', $form_state->getValue('themecolor'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}