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
