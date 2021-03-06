import MakeExpire from "./MakeExpire";

/**
 * A function for, do something when the element's are found on DOM
 * @param {string} query - Element selector string
 * @param {{
 *  parent?: HTMLElement | Document,
 *  noError?: boolean,
 * }} [param1]
 * @returns {Promise<Element>}
 **/
export default function WaitForElement(query, {
  noError,
  parent = document,
} = {}) {
  return new Promise((resolve, reject) => {
    let element,
      _loop_expireTime = MakeExpire();

    let _loop = setInterval(() => {
      if (_loop_expireTime < Date.now()) {
        clearInterval(_loop);
        if (!noError) {
          reject("Can't find anything with: " + query);
        }

        return false;
      }

      element = parent.querySelector(query);

      if (element) {
        clearInterval(_loop);
        resolve(element);
      }
    });
  });
}
