export const HEADER_VISIBILITY_CHANGE = 'HEADER_VISIBILITY_CHANGE';

export function headerVisibilityChange(isVisible) {
  return {
    type: HEADER_VISIBILITY_CHANGE,
    isVisible: isVisible,
  }
};

