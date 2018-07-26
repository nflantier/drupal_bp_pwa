<?php
namespace Drupal\service_worker\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a Custom A2HS Block.
 *
 * @Block(
 *   id = "pwa_add_to_homescreen",
 *   admin_label = @Translation("A2HS block"),
 *   category = @Translation("A2HS"),
 * )
 */
class A2hsBlock extends BlockBase {

    /**
     * {@inheritdoc}
     */
    public function build() {
        return array(
            '#theme' => 'a2hs',
        );
    }
}