<?php

/**
 * Fired when the plugin is uninstalled.
 *
 * @category Plugin
 * @package  SatoriAcfFieldLoop
 * @author   Stephen Mason <stephen@satori.digital>
 * @license  GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link     https://github.com/ssmason/satori-acf-field-loop
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Plugin does not store options or transients.
// Add cleanup here if future versions add persistent data.
