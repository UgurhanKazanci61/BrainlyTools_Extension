import classnames from 'classnames';
import AddChildren from '../helpers/AddChildren';

/**
 * @typedef {boolean
 * | "xxsmall"
 * | "xsmall"
 * | "small"
 * | "normal"
 * | "large"
 * | "xlarge"
 * | "xxlarge"
 * } Size
 * @typedef {{
 *  children?: import("@style-guide/helpers/AddChildren").ChildrenParamType,
 *  spacedTop?: Size,
 *  spacedBottom?: Size,
 *  spaced?: boolean,
 *  spacedSmall?: boolean,
 *  full?: boolean,
 *  className?: string,
 * }} Properties
 */
const sg = "sg-content-box";
const SGD = `${sg}--`

/**
 * @param {Properties} param0
 */
export default function({
  children,
  spacedTop,
  spacedBottom,
  spaced,
  spacedSmall,
  full,
  className,
  ...props
} = {}) {
  const contentBoxClass = classnames(sg, {
    [`${SGD}spaced`]: spaced,
    [`${SGD}spaced-small`]: spacedSmall,
    [`${SGD}full`]: full,
    [`${SGD}spaced-top`]: spacedTop === "normal" || spacedTop === true,
    [`${SGD}spaced-top-${spacedTop || ''}`]: spacedTop &&
      !(spacedTop === "normal" || spacedTop === true),
    [`${SGD}spaced-bottom`]: spacedBottom === "normal" ||
      spacedBottom === true,
    [`${SGD}spaced-bottom-${spacedBottom || ''}`]: spacedBottom &&
      !(spacedBottom === "normal" || spacedBottom === true)
  }, className);

  let div = document.createElement("div");
  div.className = contentBoxClass;

  AddChildren(div, children);

  if (props)
    for (let [propName, propVal] of Object.entries(props))
      div[propName] = propVal;

  return div;
}
