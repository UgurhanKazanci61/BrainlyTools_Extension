import classnames from 'classnames';
import AddChildren from './helpers/AddChildren';

/**
 * @typedef {{
 *  partial?: boolean,
 *  children?: import("@style-guide/helpers/AddChildren").ChildrenParamType,
 *  className?: string,
 * }} Properties
 */
const SG = "sg-overlay";
const SGD = `${SG}--`;

/**
 * @param {Properties} param0
 */
export default function({ partial, children, className, ...props } = {}) {
  const overlayClass = classnames(SG, {
      [`${SGD}partial`]: partial
    },
    className);

  let container = document.createElement("div");
  container.className = overlayClass;

  AddChildren(container, children);

  if (props)
    for (let [propName, propVal] of Object.entries(props))
      container[propName] = propVal;

  return container;
}
