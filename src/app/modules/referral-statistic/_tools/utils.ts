//TODO  should be typed
export const BinarySearchNearestPoint = (
  sortedData,
  x,
  y,
  xAccessor,
  yAccessor
): number => {
  let left = 0;
  let right = sortedData.length - 1;
  let closestIndex = -1;
  let closestDistance = Infinity;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const dataPoint = sortedData[mid];

    const distance = Math.sqrt(
      Math.pow(x - xAccessor(dataPoint), 2) +
        Math.pow(y - yAccessor(dataPoint), 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = mid;
    }

    xAccessor(dataPoint) < x ? (left = mid + 1) : (right = mid - 1);
  }

  return closestIndex;
};

//TODO should be test and tested
export const CompareTimestamps = (a, b) => {
  const timestampA =
    a.timestamp instanceof Date
      ? a.timestamp.getTime()
      : Date.parse(a.timestamp);

  const timestampB =
    b.timestamp instanceof Date
      ? b.timestamp.getTime()
      : Date.parse(b.timestamp);

  return timestampA - timestampB;
};
