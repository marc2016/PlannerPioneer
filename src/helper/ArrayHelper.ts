function moveToFirst<T>(array: T[], item: T): T[] {
  // Find the index of the item in the array
  const index = array.indexOf(item);

  // Check if the item exists in the array
  if (index === -1) {
    throw new Error("Item not found in the array");
  }

  // Remove the item from its current position
  array.splice(index, 1);

  // Add the item to the beginning of the array
  array.unshift(item);

  return array;
}

export { moveToFirst };