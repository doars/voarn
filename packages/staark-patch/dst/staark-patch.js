// ../staark-common/src/array.ts
var arrayify = (data) => Array.isArray(data) ? data : [data];

// ../staark-common/src/conditional.ts
var conditional = (condition, onTruth, onFalse) => {
  let result = condition ? onTruth : onFalse;
  if (typeof result === "function") {
    result = result();
  }
  if (result) {
    return arrayify(result);
  }
  return [];
};

// ../staark-common/src/marker.ts
var marker = "n";

// ../staark-common/src/node.ts
var node = (type, attributesOrContents, contents) => {
  if (typeof attributesOrContents !== "object" || attributesOrContents._ === marker || Array.isArray(attributesOrContents)) {
    contents = attributesOrContents;
    attributesOrContents = void 0;
  }
  return {
    _: marker,
    a: attributesOrContents,
    c: contents ? Array.isArray(contents) ? contents : [contents] : void 0,
    t: type.toUpperCase()
  };
};

// ../staark-common/src/factory.ts
var factory = new Proxy({}, {
  get: (target, type) => {
    if (target[type]) {
      return target[type];
    }
    const typeConverted = (type[0] + type.substring(1).replace(
      /([A-Z])/g,
      (capital) => "-" + capital
    )).toUpperCase();
    return target[type] = (attributesOrContents, contents) => node(
      typeConverted,
      attributesOrContents,
      contents
    );
  }
});

// ../staark-common/src/selector.ts
var BRACKET_CLOSE = "]";
var BRACKET_OPEN = "[";
var DOT = ".";
var EQUAL = "=";
var HASH = "#";
var QUOTE_SINGLE = "'";
var QUOTE_DOUBLE = '"';
var selectorToTokenizer = (selector) => {
  const length = selector.length;
  let i = 0;
  let type = "";
  const attributes = {};
  let tokenA = "";
  let tokenB = true;
  let tokenType = 3 /* type */;
  const storeToken = () => {
    if (tokenA) {
      switch (tokenType) {
        case 0 /* attribute */:
          attributes[tokenA] = tokenB === true ? true : tokenB;
          tokenB = true;
          break;
        case 1 /* class */:
          if (!attributes.class) {
            attributes.class = tokenA;
            break;
          }
          attributes.class += " " + tokenA;
          break;
        case 2 /* id */:
          attributes.id = tokenA;
          break;
        case 3 /* type */:
          type = tokenA;
          break;
      }
      tokenA = "";
    }
  };
  let character;
  let attributeBracketCount;
  const parseAttribute = () => {
    attributeBracketCount = 0;
    while (i < length) {
      character = selector[i];
      i++;
      if (character === EQUAL) {
        tokenB = "";
        character = selector[i];
        const endOnDoubleQuote = character === QUOTE_DOUBLE;
        const endOnSingleQuote = character === QUOTE_SINGLE;
        if (endOnDoubleQuote || endOnSingleQuote) {
          tokenB += character;
          i++;
        }
        while (i < length) {
          character = selector[i];
          if (endOnDoubleQuote && character === QUOTE_DOUBLE || endOnSingleQuote && character === QUOTE_SINGLE) {
            tokenB += character;
            i++;
            break;
          } else if (!endOnDoubleQuote && !endOnSingleQuote && character === BRACKET_CLOSE) {
            break;
          }
          tokenB += character;
          i++;
        }
        if (tokenB[0] === QUOTE_DOUBLE && tokenB[tokenB.length - 1] === QUOTE_DOUBLE || tokenB[0] === QUOTE_SINGLE && tokenB[tokenB.length - 1] === QUOTE_SINGLE) {
          tokenB = tokenB.substring(1, tokenB.length - 1);
        }
        while (i < length) {
          character = selector[i];
          i++;
          if (character === BRACKET_CLOSE) {
            break;
          }
        }
        break;
      } else if (character === BRACKET_OPEN) {
        attributeBracketCount++;
        continue;
      } else if (character === BRACKET_CLOSE) {
        attributeBracketCount--;
        if (attributeBracketCount < 0) {
          break;
        }
        continue;
      }
      tokenA += character;
    }
    storeToken();
  };
  while (i < length) {
    character = selector[i];
    i++;
    if (character === HASH) {
      storeToken();
      tokenType = 2 /* id */;
      continue;
    } else if (character === DOT) {
      storeToken();
      tokenType = 1 /* class */;
      continue;
    } else if (character === BRACKET_OPEN) {
      storeToken();
      tokenType = 0 /* attribute */;
      parseAttribute();
      continue;
    }
    tokenA += character;
  }
  return [type, attributes];
};

// ../staark-common/src/fctory.ts
var fctory = new Proxy({}, {
  get: (target, type) => {
    if (target[type]) {
      return target[type];
    }
    const typeConverted = (type[0] + type.substring(1).replace(
      /([A-Z])/g,
      (capital) => "-" + capital
    )).toUpperCase();
    return target[type] = (selector, contents) => {
      let attributes;
      if (selector) {
        const [_, _attributes] = selectorToTokenizer(selector);
        attributes = _attributes;
      }
      return node(
        typeConverted,
        attributes,
        contents
      );
    };
  }
});

// ../staark-common/src/identifier.ts
var identifierCount = 0;
var identifier = (prefix) => prefix + "-" + identifierCount++;

// ../staark-common/src/match.ts
var match = (pattern, lookup) => {
  if (lookup && pattern in lookup && lookup[pattern]) {
    let result = lookup[pattern];
    if (typeof result === "function") {
      result = result();
      if (!result) {
        return [];
      }
    }
    return arrayify(result);
  }
  return [];
};

// ../staark-common/src/nde.ts
var nde = (selector, contents) => {
  const [type, attributes] = selectorToTokenizer(selector);
  return {
    _: marker,
    a: attributes,
    c: contents ? Array.isArray(contents) ? contents : [contents] : void 0,
    t: type.toUpperCase()
  };
};

// ../staark-common/src/element.ts
var childrenToNodes = (element) => {
  var _a;
  const abstractChildNodes = [];
  for (let i = 0; i < element.childNodes.length; i++) {
    const childNode = element.childNodes[i];
    if (childNode instanceof Text) {
      abstractChildNodes.push(
        (_a = childNode.textContent) != null ? _a : ""
      );
    } else {
      let attributes = {};
      for (let i2 = 0; i2 < childNode.attributes.length; i2++) {
        const attribute = childNode.attributes[i2];
        attributes[attribute.name] = attribute.value;
      }
      abstractChildNodes.push(
        node(
          childNode.nodeName,
          attributes,
          childrenToNodes(childNode)
        )
      );
    }
  }
  return abstractChildNodes;
};

// src/library/patch.ts
var MATCH_CAPITALS = /[A-Z]+(?![a-z])|[A-Z]/g;
var HYPHENATE = (part, offset) => (offset ? "-" : "") + part;
var updateAttributes = (element, newAttributes, oldAttributes) => {
  if (newAttributes) {
    for (const name in newAttributes) {
      let value = newAttributes[name];
      if (value) {
        const type = typeof value;
        if (type === "function") {
          if (oldAttributes && oldAttributes[name]) {
            if (oldAttributes[name] === value) {
              continue;
            } else {
              element.removeEventListener(
                name,
                oldAttributes[name]
              );
            }
          }
          element.addEventListener(
            name,
            value
          );
        } else {
          if (name === "class") {
            if (typeof value === "object") {
              if (Array.isArray(value)) {
                value = value.join(" ");
              } else {
                let classNames = "";
                for (const className in value) {
                  if (value[className]) {
                    classNames += " " + className;
                  }
                }
                value = classNames;
              }
            }
            element.className = value;
          } else if (name === "style" && typeof value === "object") {
            for (let styleName in value) {
              let styleValue = value[styleName];
              styleName = styleName.replace(MATCH_CAPITALS, HYPHENATE).toLowerCase();
              if (Array.isArray(styleValue)) {
                styleValue = styleValue.join(" ");
              }
              element.style.setProperty(
                styleName,
                styleValue
              );
            }
            if (oldAttributes && oldAttributes[name] && typeof oldAttributes[name] === "object" && !Array.isArray(oldAttributes[name])) {
              for (let styleName in oldAttributes[name]) {
                if (!(styleName in value)) {
                  styleName = styleName.replace(MATCH_CAPITALS, HYPHENATE).toLowerCase();
                  element.style.removeProperty(
                    styleName
                  );
                }
              }
            }
          } else {
            if (type === "boolean") {
              if (!value) {
                element.removeAttribute(name);
                continue;
              }
              value = "true";
            } else if (type !== "string") {
              value = value.toString();
            }
            if (name === "value" && element.value !== value) {
              element.value = value;
            } else if (name === "checked") {
              element.checked = newAttributes[name];
            }
            element.setAttribute(name, value);
          }
        }
      }
    }
  }
  if (oldAttributes) {
    for (const name in oldAttributes) {
      if (!newAttributes || !newAttributes[name]) {
        if (typeof oldAttributes[name] === "function") {
          element.removeEventListener(
            name,
            oldAttributes[name]
          );
        } else if (name === "class") {
          element.className = "";
        } else if (name === "style") {
          element.style = "";
        } else {
          if (name === "value") {
            element.value = "";
          } else if (name === "checked") {
            element.checked = false;
          }
          element.removeAttribute(name);
        }
      }
    }
  }
};
var prepare = (rootElement, oldAbstractTree) => {
  const updateElementTree = (element, newChildAbstracts, oldChildAbstracts, elementAbstract) => {
    var _a, _b, _c;
    let newIndex = 0;
    let newCount = 0;
    if (newChildAbstracts) {
      for (; newIndex < newChildAbstracts.length; newIndex++) {
        const newAbstract = newChildAbstracts[newIndex];
        let matched = false;
        if (oldChildAbstracts) {
          for (let oldIndex = newIndex - newCount; oldIndex < oldChildAbstracts.length; oldIndex++) {
            const oldAbstract = oldChildAbstracts[oldIndex];
            if (oldAbstract.t && newAbstract.t === oldAbstract.t || !oldAbstract.t && !newAbstract.t) {
              matched = true;
              if (newIndex !== oldIndex + newCount) {
                element.insertBefore(
                  element.childNodes[oldIndex + newCount],
                  element.childNodes[newIndex]
                );
                oldChildAbstracts.splice(
                  newIndex - newCount,
                  0,
                  ...oldChildAbstracts.splice(
                    oldIndex,
                    1
                  )
                );
              }
              if (newAbstract.t) {
                updateAttributes(
                  element.childNodes[newIndex],
                  newAbstract.a,
                  oldAbstract.a
                );
                updateElementTree(
                  element.childNodes[newIndex],
                  newAbstract.c,
                  oldAbstract.c,
                  oldAbstract
                );
              } else if (oldAbstract !== newAbstract) {
                element.childNodes[newIndex].textContent = newAbstract;
              }
              break;
            }
          }
        }
        if (!matched) {
          let childElement;
          if (newAbstract.t) {
            childElement = document.createElement(
              newAbstract.t
            );
            if (newAbstract.a) {
              updateAttributes(
                childElement,
                newAbstract.a
              );
            }
            if (newAbstract.c) {
              updateElementTree(
                childElement,
                newAbstract.c
              );
            }
            const insertAdjacentElement = (element2, elementAbstract2, position) => {
              if (position && (!elementAbstract2 || elementAbstract2.t)) {
                element2.insertAdjacentElement(
                  position,
                  childElement
                );
              } else {
                element2.parentNode.insertBefore(
                  childElement,
                  element2
                );
              }
            };
            if (newIndex === 0) {
              insertAdjacentElement(
                element,
                elementAbstract,
                "afterbegin"
              );
            } else if (((_a = oldChildAbstracts == null ? void 0 : oldChildAbstracts.length) != null ? _a : 0) + newCount > newIndex) {
              insertAdjacentElement(
                element.childNodes[newIndex]
                // (oldChildAbstracts as NodeContent[])[newIndex + newCount],
                // 'beforebegin',
              );
            } else {
              insertAdjacentElement(
                element,
                elementAbstract,
                "beforeend"
              );
            }
          } else {
            const insertAdjacentText = (element2, elementAbstract2, position) => {
              if (position && (!elementAbstract2 || elementAbstract2.t)) {
                element2.insertAdjacentText(
                  position,
                  newAbstract
                );
              } else {
                element2.parentNode.insertBefore(
                  document.createTextNode(newAbstract),
                  element2
                );
              }
            };
            if (newIndex === 0) {
              insertAdjacentText(
                element,
                elementAbstract,
                "afterbegin"
              );
            } else if (((_b = oldChildAbstracts == null ? void 0 : oldChildAbstracts.length) != null ? _b : 0) + newCount > newIndex) {
              insertAdjacentText(
                element.childNodes[newIndex]
                // (oldChildAbstracts as NodeContent[])[newIndex + newCount],
                // 'beforebegin',
              );
            } else {
              insertAdjacentText(
                element,
                elementAbstract,
                "beforeend"
              );
            }
          }
          newCount++;
        }
      }
    }
    const elementLength = ((_c = oldChildAbstracts == null ? void 0 : oldChildAbstracts.length) != null ? _c : 0) + newCount;
    if (elementLength >= newIndex) {
      for (let i = elementLength - 1; i >= newIndex; i--) {
        element.childNodes[i].remove();
      }
    }
  };
  const _rootElement = typeof rootElement === "string" ? document.querySelector(rootElement) || document.body.appendChild(
    document.createElement("div")
  ) : rootElement;
  if (typeof oldAbstractTree === "string") {
    try {
      oldAbstractTree = JSON.parse(oldAbstractTree);
    } catch (error) {
      oldAbstractTree = void 0;
    }
  }
  oldAbstractTree != null ? oldAbstractTree : oldAbstractTree = childrenToNodes(_rootElement);
  return (newAbstractTree) => {
    if (newAbstractTree) {
      newAbstractTree = arrayify(newAbstractTree);
      updateElementTree(
        _rootElement,
        newAbstractTree,
        oldAbstractTree
      );
      oldAbstractTree = newAbstractTree;
    } else {
      for (let i = _rootElement.childNodes.length - 1; i >= 0; i--) {
        _rootElement.childNodes[i].remove();
      }
      oldAbstractTree = [];
    }
  };
};
export {
  conditional,
  factory,
  fctory,
  identifier,
  match,
  nde,
  node,
  prepare
};
//# sourceMappingURL=staark-patch.js.map
