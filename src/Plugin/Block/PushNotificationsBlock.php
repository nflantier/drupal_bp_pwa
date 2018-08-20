<?php
namespace Drupal\service_worker\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a Push notifications settings Block.
 *
 * @Block(
 *   id = "pwa_push_notifications",
 *   admin_label = @Translation("Push notifications settings Block"),
 *   category = @Translation("PWA"),
 * )
 */
class PushNotificationsBlock extends BlockBase {

    /**
     * {@inheritdoc}
     */
    public function build() {
        return array(
            '#theme' => 'pushnotifications',
        );
    }
}