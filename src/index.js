/**
 * ACF Field block – registration.
 *
 * @package SatoriAcfFieldLoop
 * @author  Stephen Mason <stephen@satori.digital>
 */

import './style.css';
import { registerBlockType } from '@wordpress/blocks';
import blockData from '../block.json';
import Edit from './edit';
import save from './save';

registerBlockType(blockData, {
    edit: Edit,
    save,
});
