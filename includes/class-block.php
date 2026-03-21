<?php

/**
 * Block registration for ACF Field Loop.
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

use WP_Block;

/**
 * Block registration class.
 *
 * @category Plugin
 * @package  SatoriAcfFieldLoop
 * @author   Stephen Mason <stephen@satori.digital>
 * @license  GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link     https://github.com/ssmason/satori-acf-field-loop
 */
class Block
{
    /**
     * Registers the block type.
     *
     * @return void
     */
    public function register(): void
    {
        $block_json_path = SATORI_ACF_FIELD_LOOP_PLUGIN_DIR . 'block.json';

        if (! file_exists($block_json_path)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
                trigger_error(
                    'Satori ACF Field Loop: block.json not found.',
                    E_USER_WARNING
                );
            }

            return;
        }

        register_block_type(
            $block_json_path,
            [
                'render_callback' => [$this, 'render'],
            ]
        );
    }

    /**
     * Renders the block on the frontend.
     *
     * Outputs the ACF field value for the current post in Query Loop context.
     *
     * @param array<string, mixed> $attributes Block attributes.
     * @param string               $content    Saved block content (unused).
     * @param WP_Block             $block      Block instance with context.
     *
     * @return string
     */
    public function render(array $attributes, string $content, WP_Block $block): string
    {
        $field_key = sanitize_key((string) ($attributes['fieldKey'] ?? ''));

        if (empty($field_key)) {
            return '';
        }

        if (! function_exists('get_field')) {
            return '';
        }

        $post_id = $this->_getPostId($block);

        if (! $post_id) {
            return '';
        }

        $value = get_field($field_key, $post_id);

        if ($value === null || $value === false) {
            return '';
        }

        $content = $this->_formatValue($value, $attributes);
        $wrapper = get_block_wrapper_attributes(
            ['class' => 'satori-acf-field-block'],
            $block
        );

        return sprintf('<div %1$s>%2$s</div>', $wrapper, $content);
    }

    /**
     * Gets the post ID from block context or current post.
     *
     * @param WP_Block $block Block instance.
     *
     * @return int|null Post ID or null.
     */
    private function _getPostId(WP_Block $block): ?int
    {
        $context = $block->context ?? [];

        if (isset($context['postId']) && is_numeric($context['postId'])) {
            return (int) $context['postId'];
        }

        $post_id = get_the_ID();

        return $post_id ? (int) $post_id : null;
    }

    /**
     * Formats the field value for output.
     *
     * @param mixed               $value      Raw field value.
     * @param array<string,mixed> $attributes Block attributes.
     *
     * @return string
     */
    private function _formatValue($value, array $attributes): string
    {
        if (is_scalar($value)) {
            return wp_kses_post((string) $value);
        }

        if (is_array($value) && isset($value['url'])) {
            return $this->_formatImageOrLink($value);
        }

        if (is_object($value)) {
            return '';
        }

        return '';
    }

    /**
     * Formats an image or link field for output.
     *
     * @param array<string,mixed> $data Image/link array (url, alt, title, etc.).
     *
     * @return string
     */
    private function _formatImageOrLink(array $data): string
    {
        $url = $data['url'] ?? '';

        if (empty($url)) {
            return '';
        }

        $esc_url = esc_url($url);

        if (isset($data['alt']) && $data['alt'] !== '') {
            $alt   = esc_attr((string) $data['alt']);
            $width = isset($data['width']) ? (int) $data['width'] : 0;
            $height = isset($data['height']) ? (int) $data['height'] : 0;
            $img   = sprintf('<img src="%s" alt="%s"', $esc_url, $alt);
            if ($width > 0) {
                $img .= sprintf(' width="%d"', $width);
            }
            if ($height > 0) {
                $img .= sprintf(' height="%d"', $height);
            }
            $img .= '>';

            return $img;
        }

        $title = esc_html((string) ($data['title'] ?? ''));
        $target = ! empty($data['target']) ? ' target="_blank" rel="noopener"' : '';

        return sprintf('<a href="%s"%s>%s</a>', $esc_url, $target, $title ?: $esc_url);
    }
}
