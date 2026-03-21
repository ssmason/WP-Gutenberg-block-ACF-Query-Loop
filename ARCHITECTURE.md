# Architecture

## Overview

Satori ACF Field Loop is a **dynamic** block: it has no saved content. Output is rendered server-side in `Block::render()` using `get_field()` for the current post in Query Loop context.

## Boot flow

```
plugins_loaded (priority 0)
  → Plugin::instance()->boot()
    → Block::register()   (on init, priority 20)
    → Rest::register()    (on rest_api_init)
    → Assets::register()
```

## Data flow

1. **Editor**: edit.js fetches ACF fields via REST (`/satori-acf-field-loop/v1/fields?post_type={post_type}`).
2. **User selects field**: `fieldKey` attribute is stored (ACF key or selector like `parent_child`).
3. **Frontend**: Block::render() receives `fieldKey`, gets post ID from block context (Query Loop) or `get_the_ID()`, calls `get_field($field_key, $post_id)`.
4. **Output**: Value is formatted (scalar → wp_kses_post; image/link → esc_url, esc_attr, esc_html) and wrapped in block markup.

## REST API

- **GET** `/wp-json/satori-acf-field-loop/v1/fields?post_type={post_type}`
- **Permission**: `edit_posts`
- **Returns**: Flattened ACF fields from field groups attached to the post type.

## Security

- `fieldKey` is sanitized with `sanitize_key()` before use.
- Scalar output is passed through `wp_kses_post()` to prevent XSS.
- Image/link fields use `esc_url()`, `esc_attr()`, `esc_html()`.
