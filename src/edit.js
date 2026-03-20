/**
 * ACF Field block – editor component.
 *
 * @package SatoriAcfFieldLoop
 * @author  Stephen Mason <stephen@satori.digital>
 */

import { useBlockProps } from '@wordpress/block-editor';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Edit component for the ACF Field block.
 *
 * @param {Object} props            Component props.
 * @param {Object} props.attributes Block attributes.
 * @param {Function} props.setAttributes Update attributes callback.
 * @param {Object} props.context    Block context (postId, postType).
 * @return {JSX.Element}
 */
export default function Edit({ attributes, setAttributes, context }) {
    const { fieldKey } = attributes;
    const postType = context?.postType || 'post';

    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        apiFetch({
            path: `/satori-acf-field-loop/v1/fields?post_type=${encodeURIComponent(postType)}`,
        })
            .then((res) => {
                setFields(res.fields || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || __('Failed to load fields.', 'satori-acf-field-loop'));
                setFields([]);
                setLoading(false);
            });
    }, [postType]);

    const options = [
        { value: '', label: __('— Select field —', 'satori-acf-field-loop') },
        ...fields.map((f) => ({
            value: f.key,
            label: `${f.label} (${f.name})`,
        })),
    ];

    const blockProps = useBlockProps({
        className: 'satori-acf-field-block',
    });

    const inspector = (
        <InspectorControls>
            <PanelBody title={__('ACF Field', 'satori-acf-field-loop')} initialOpen={true}>
                {loading ? (
                    <Spinner />
                ) : (
                    <SelectControl
                        label={__('Field', 'satori-acf-field-loop')}
                        value={fieldKey}
                        options={options}
                        onChange={(v) => setAttributes({ fieldKey: v || '' })}
                        help={
                            !context?.postId
                                ? __('Place this block inside a Query Loop to display field data.', 'satori-acf-field-loop')
                                : undefined
                        }
                    />
                )}
                {error && (
                    <p className="components-base-control__help" style={{ color: '#cc1818' }}>
                        {error}
                    </p>
                )}
            </PanelBody>
        </InspectorControls>
    );

    const selectedField = fields.find((f) => f.key === fieldKey);
    const previewLabel = selectedField
        ? `${selectedField.label} (${selectedField.name})`
        : __('Select an ACF field', 'satori-acf-field-loop');

    return (
        <>
            {inspector}
            <div {...blockProps}>
                <span className="satori-acf-field-preview">
                    {fieldKey ? `[${previewLabel}]` : previewLabel}
                </span>
            </div>
        </>
    );
}
