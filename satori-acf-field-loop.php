<?php

/**
 * Plugin Name: Satori ACF Field Loop
 * Plugin URI:  https://github.com/ssmason/satori-acf-field-loop
 * Description: ACF Field block for Query Loop – output ACF fields inside Query Loop patterns.
 * Version:     1.0.0
 * Author:      Stephen Mason
 * Author URI:  https://satori.digital
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: satori-acf-field-loop
 *
 * @category Plugin
 * @package  SatoriAcfFieldLoop
 * @author   Stephen Mason <stephen@satori.digital>
 * @license  GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link     https://github.com/ssmason/satori-acf-field-loop
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

define('SATORI_ACF_FIELD_LOOP_VERSION', '1.0.0');
define('SATORI_ACF_FIELD_LOOP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SATORI_ACF_FIELD_LOOP_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once SATORI_ACF_FIELD_LOOP_PLUGIN_DIR . 'includes/class-autoloader.php';
SatoriAcfFieldLoop\Autoloader::register();

require_once SATORI_ACF_FIELD_LOOP_PLUGIN_DIR . 'includes/class-plugin.php';

/**
 * Boots the plugin on plugins_loaded.
 *
 * @return void
 */
add_action(
    'plugins_loaded',
    static function (): void {
        SatoriAcfFieldLoop\Plugin::instance()->boot();
    },
    0
);
