<?php

/**
 * REST API endpoints for ACF field selection.
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

use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * REST API class.
 *
 * @category Plugin
 * @package  SatoriAcfFieldLoop
 * @author   Stephen Mason <stephen@satori.digital>
 * @license  GPL-2.0-or-later https://www.gnu.org/licenses/gpl-2.0.html
 * @link     https://github.com/ssmason/satori-acf-field-loop
 */
class Rest
{
    /**
     * REST namespace.
     *
     * @var string
     */
    private const NAMESPACE = 'satori-acf-field-loop/v1';

    /**
     * Registers REST routes.
     *
     * @return void
     */
    public function register(): void
    {
        register_rest_route(
            self::NAMESPACE,
            '/fields',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'             => [$this, 'getFields'],
                'permission_callback' => function (): bool {
                    return current_user_can('edit_posts');
                },
                'args'                => [
                    'post_type' => [
                        'type'              => 'string',
                        'required'         => false,
                        'default'          => 'post',
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ]
        );
    }

    /**
     * Returns ACF fields for the given post type.
     *
     * @param WP_REST_Request $request Request object.
     *
     * @return WP_REST_Response
     */
    public function getFields(WP_REST_Request $request): WP_REST_Response
    {
        $post_type = $request->get_param('post_type') ?: 'post';

        if (! function_exists('acf_get_field_groups') || ! function_exists('acf_get_fields')) {
            return new WP_REST_Response(
                ['fields' => [], 'message' => 'ACF is not active.'],
                200
            );
        }

        $groups = acf_get_field_groups(['post_type' => $post_type]);
        $fields = [];

        foreach ($groups as $group) {
            $group_fields = acf_get_fields($group['key']);
            if (! is_array($group_fields)) {
                continue;
            }
            foreach ($group_fields as $field) {
                $fields = array_merge(
                    $fields,
                    $this->_flattenFields($field)
                );
            }
        }

        return new WP_REST_Response(['fields' => $fields], 200);
    }

    /**
     * Flattens fields: groups are replaced by their children; children with
     * their own sub_fields are left as-is (one level only).
     *
     * @param array<string, mixed> $field ACF field array.
     *
     * @return array<int, array<string, string>>
     */
    private function _flattenFields(array $field): array
    {
        $sub_fields = $field['sub_fields'] ?? [];

        if (! empty($sub_fields)) {
            $parent_label = $field['label'] ?? $field['name'] ?? '';
            $result      = [];
            foreach ($sub_fields as $sub) {
                $label = $sub['label'] ?? $sub['name'] ?? '';
                if ($parent_label !== '') {
                    $label = $label . ' (' . $parent_label . ')';
                }
                $result[] = [
                    'key'   => $sub['key'],
                    'name'  => $sub['name'],
                    'label' => $label,
                    'type'  => $sub['type'] ?? 'text',
                ];
            }

            return $result;
        }

        return [
            [
                'key'   => $field['key'],
                'name'  => $field['name'],
                'label' => $field['label'] ?? $field['name'],
                'type'  => $field['type'] ?? 'text',
            ],
        ];
    }
}
