// restrictions: dairy-free, meat-free, fish-free, gluten-free, egg-free, nut-free
/**
 * Restrictions:
 * 0: dairy-free
 * 1: meat-free
 * 2: fish-free
 * 3: gluten-free
 * 4: egg-free
 * 5: nut-free
 */

import { Menu } from "@prisma/client";

export function decodeRestriction(restrictionsArray: boolean[]) {
  const restrictions = {
    DAIRY_FREE: restrictionsArray[0],
    MEAT_FREE: restrictionsArray[1],
    FISH_FREE: restrictionsArray[2],
    GLUTEN_FREE: restrictionsArray[3],
    EGG_FREE: restrictionsArray[4],
    NUT_FREE: restrictionsArray[5],
  };
  return restrictions;
}

export function filterMenuByRestriction(menu: Menu[], restrictions: boolean[]) {
  const filteredMenus = menu.filter((menu) => {
    /**
     * restrictions : menu.restrictions
     * 1 : 1 = true
     * 1 : 0 = false
     * 0 : 1 = true
     * 0 : 0 = true
     */
    return (
      compare(restrictions[0], menu.restrictions[0]) &&
      compare(restrictions[1], menu.restrictions[1]) &&
      compare(restrictions[2], menu.restrictions[2]) &&
      compare(restrictions[3], menu.restrictions[3]) &&
      compare(restrictions[4], menu.restrictions[4]) &&
      compare(restrictions[5], menu.restrictions[5])
    );
  });

  return filteredMenus;
}

function compare(a: boolean, b: boolean) {
  if (a === undefined || b === undefined) return false;

  if (!a) return true; // case 0 : *
  if (b) return true; // case * : 1
  return false; // case 1 : 0
}

export function binaryStringToBooleanArray(binaryString: string): boolean[] {
  const booleanArray: boolean[] = [];

  for (let i = 0; i < binaryString.length; i++) {
    booleanArray.push(Boolean(Number(binaryString[i])));
  }

  return booleanArray;
}
