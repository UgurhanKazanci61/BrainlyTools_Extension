import classnames from 'classnames';
import mergeDeep from "merge-deep";
import AddChildren from './helpers/AddChildren';
import SetProps from './helpers/SetProps';
import Icon from "./Icon";

/**
 * @typedef {import("./Icon").IconTypeType} IconTypeType
 * @typedef {import("./Icon").IconElement} IconElement
 * @typedef {import("./Icon").Properties} IconProperties
 *
 * @typedef {'solid'
 * | 'solid-inverted'
 * | 'solid-blue'
 * | 'solid-mint'
 * | 'solid-light'
 * | 'outline'
 * | 'transparent'
 * | 'transparent-light'
 * | 'transparent-inverted'
 * | 'transparent-peach'
 * | 'transparent-mustard'
 * | 'facebook'
 * | "solid-peach"
 * | "solid-mustard"
 * | "transparent-mint"
 * | "transparent-blue"
 * | "outline-mint"
 * | "outline-peach"
 * | "outline-mustard"} ButtonTypeType
 *
 * @typedef {"large" | "medium" | "small" | "xsmall"} ButtonSizeType
 *
 * @typedef {boolean | "small" | "xsmall" | "xxsmall" | "large" | "xlarge" |
 * "xxlarge"} sizeList
 *
 * @typedef {boolean | {
 *  top?: sizeList,
 *  left?: sizeList,
 *  bottom?: sizeList,
 *  right?: sizeList,
 * }} cornerSpaces
 *
 * @typedef {function(): ButtonElement} Hide
 * @typedef {function(): ButtonElement} Show
 * @typedef {function(): ButtonElement} Enable
 * @typedef {function(): ButtonElement} Disable
 * @typedef {function(): ButtonElement} Active
 * @typedef {function(): ButtonElement} Inactive
 * @typedef {function(): ButtonElement} IsDisabled
 * @typedef {function(ButtonTypeType): ButtonElement} ChangeType
 * @typedef {function(ButtonTypeType): ButtonElement} ToggleType
 * @typedef {function(IconElement=): ButtonElement} ChangeIcon
 * @typedef {function(ButtonSizeType=): ButtonElement} ChangeSize
 *
 * @typedef {{
 *  size: ButtonSizeType,
 *  _type: ButtonTypeType,
 *  mainType:ButtonTypeType,
 *  icon: IconElement | HTMLElement,
 *  Hide: Hide,
 *  Show: Show,
 *  Enable: Enable,
 *  Disable: Disable,
 *  Active: Active,
 *  Inactive: Inactive,
 *  ChangeType: ChangeType,
 *  ToggleType: ToggleType,
 *  IsDisabled: IsDisabled,
 *  ChangeIcon: ChangeIcon,
 *  ChangeSize: ChangeSize,
 * }} CustomProperties
 *
 * @typedef {(HTMLAnchorElement | HTMLButtonElement | HTMLLabelElement) &
 * CustomProperties} ButtonElement
 *
 * @typedef {{
 *  tag?: "button" | "a" | "label" | "input",
 *  size?: ButtonSizeType,
 *  type?: ButtonTypeType,
 *  icon?: IconTypeType | IconProperties | HTMLElement,
 *  href?: string,
 *  fullWidth?: boolean,
 *  disabled?: boolean,
 *  children?: import("@style-guide/helpers/AddChildren").ChildrenParamType,
 *  className?: string,
 *  text?: string,
 *  html?: string,
 *  title?: string,
 *  spaced?: cornerSpaces,
 *  [x: string]: *,
 * }} Properties
 */

const sg = "sg-button";
const SGD = `${sg}--`;
const SG_ = `${sg}__`;

/**
 * @param {Properties} param0
 * @returns {ButtonElement}
 */
export default function({
  tag = "button",
  size,
  type,
  icon,
  href,
  fullWidth,
  disabled,
  children,
  className,
  text,
  html,
  title,
  spaced,
  ...props
} = {}) {
  if (text && html)
    throw "Content should be filled either with text or html";

  const btnClass = classnames(sg, {
      [SGD + size]: size,
      [SGD + type]: type,
      [`${SGD}disabled`]: disabled,
      [`${SGD}full-width`]: fullWidth
    },
    className
  );

  if (href)
    tag = "a";

  /**
   * @type {ButtonElement}
   */
  let button = (document.createElement(tag));
  button.className = btnClass;

  props.size = size;
  props._type = type;
  props.mainType = type;
  props.Hide = _Hide;
  props.Show = _Show;
  props.Enable = _Enable;
  props.Disable = _Disable;
  props.Active = _Active;
  props.Inactive = _Inactive;
  props.ChangeType = _ChangeType;
  props.ToggleType = _ToggleType;
  props.IsDisabled = _IsDisabled;
  props.ChangeIcon = _ChangeIcon;
  props.ChangeSize = _ChangeSize;

  if (spaced) {
    let styles = [];

    if (typeof spaced == "boolean")
      styles.push(`${SGD}spaced`);

    if (typeof spaced == "object")
      for (let [corner, size] of Object.entries(spaced)) {
        if (typeof size == "boolean")
          styles.push(`${SGD}spaced-${corner}`);
        else {
          styles.push(`${SGD}spaced-${corner}-${size}`);
        }
      }

    button.classList.add(...styles);
  }

  if (disabled && button instanceof HTMLButtonElement)
    button.disabled = true;

  if (href && button instanceof HTMLAnchorElement)
    button.href = href;

  if (title)
    button.title = title;

  SetProps(button, props);

  if (text || html || children) {
    let textElement = document.createElement("span");
    textElement.className = `${SG_}text`;

    if (html)
      textElement.innerHTML = html;
    else if (text)
      textElement.innerText = text;

    AddChildren(textElement, children);

    button.appendChild(textElement);
  }

  if (icon) {
    if (typeof icon == "string" || !("innerText" in icon)) {
      /**
       * @type {IconProperties}
       */
      let iconProps = {
        size: size == "xsmall" ? 18 : 24,
        color: "adaptive",
      };

      if (typeof icon === "string")
        iconProps.type = icon;
      else
        iconProps = mergeDeep(iconProps, icon);

      button.icon = Icon(iconProps);
    } else
      button.icon = icon;

    _AddIcon.bind(button)(button.icon);
  }

  return button;
}

/**
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function _Hide() {
  this.classList.add("js-hidden")

  return this;
}

/**
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function _Show() {
  this.classList.remove("js-hidden")

  return this;
}

/**
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function _Disable() {
  if (this instanceof HTMLButtonElement)
    this.disabled = true;

  this.classList.add(`${SGD}disabled`)

  return this;
}

/**
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function _Enable() {
  if (this instanceof HTMLButtonElement)
    this.disabled = false;

  this.classList.remove(`${SGD}disabled`);

  return this;
}

/**
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function _Active() {
  this.classList.add(`${SGD}active`);

  return this;
}

/**
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function _Inactive() {
  this.classList.remove(`${SGD}active`);

  return this;
}

/**
 * typedef {ChangeType} ChangeType
 * @this {ButtonElement}
 * @param {ButtonTypeType} type
 * returns {ButtonElement}
 */
function _ChangeType(type) {
  this.classList.remove(SGD + this._type);
  this.classList.remove(SGD + this.mainType);
  this.classList.add(SGD + type);

  this._type = type;
  this.mainType = type;

  return this;
}

/**
 * typedef {ChangeType} ChangeType
 * @this {ButtonElement}
 * @param {ButtonSizeType} [size]
 * returns {ButtonElement}
 */
function _ChangeSize(size) {
  if (this.size)
    this.classList.remove(SGD + this.size);

  if (size)
    this.classList.add(SGD + size);

  this.size = size;

  return this;
}

/**
 * typedef {ToggleType} ToggleType
 * @this {ButtonElement}
 * @param {ButtonTypeType} type
 * @returns {ButtonElement}
 */
function _ToggleType(type) {
  this.classList.toggle(SGD + this.mainType);

  let hasNewClass = this.classList.toggle(SGD + type);
  this._type = hasNewClass ? type : this.mainType;

  return this;
}

/**
 * @this {ButtonElement}
 */
function _IsDisabled() {
  return this.classList.contains(`${SGD}disabled`);
}

/**
 * @this {ButtonElement}
 * @param {IconElement} [icon]
 */
function _ChangeIcon(icon) {
  if (!icon)
    return _DeleteIcon.bind(this)();

  if (!this.icon)
    return _AddIcon.bind(this)(icon);

  let iconContainer = this.querySelector(`.${SG_}icon`);

  this.icon.remove();
  /* iconContainer.childNodes.forEach(node => node.remove()); */
  iconContainer.appendChild(icon);

  this.icon = icon;

  return this;
}

/**
 * @this {ButtonElement}
 * @param {IconElement} icon
 */
function _AddIcon(icon) {
  this.icon = icon;
  let iconContainer = document.createElement("span");

  iconContainer.appendChild(icon);
  iconContainer.classList.add(`${SG_}icon`);

  this.insertBefore(iconContainer, this.firstChild);

  return this;
}

/**
 * @this {ButtonElement}
 */
function _DeleteIcon() {
  this.icon = undefined;
  let icon = this.querySelector(`.${SG_}icon`);

  if (icon)
    icon.remove();
}
