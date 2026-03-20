<?php

/**
 * Asset registration and enqueue.
 *
 * PHP version 8+
 *
 * @category Plugin
 * @package  SatoriAcfFieldLoop
 * @author   Stephen Mason <stephen@satori.digital>
 * @license  GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link     https://github.com/ssmason/satori-acf-field-loop
 */

declare(strict_types=1);

namespace SatoriAcfFieldLoop;

/**
 * Assets class.
 *
 * @category Plugin
 * @package  SatoriAcfFieldLoop
 * @author   Stephen Mason <stephen@satori.digital>
 * @license  GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link     https://github.com/ssmason/satori-acf-field-loop
 */
class Assets
{
    /**
     * Registers hooks for asset enqueue.
     *
     * Block assets (editorScript, editorStyle) are enqueued by WordPress from
     * block.json when the block is rendered. This method is a placeholder
     * for any future global assets.
     *
     * @return void
     */
    public function register(): void
    {
        // Block assets are loaded via block.json metadata.
    }
}
