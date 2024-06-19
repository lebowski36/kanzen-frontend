// useDragAndDrop.js
import { ref } from "vue";

export function useDragAndDrop() {
  const draggedItem = ref(null);

  const dragStart = (item, index) => {
    draggedItem.value = { ...item, originalIndex: index };
  };

  const dragEnter = (event, index) => {
    if (draggedItem.value) {
      draggedItem.value.targetIndex = index;
    }
  };

  const dragOver = (event) => {
    event.preventDefault();
  };

  const drop = (items, column, updateCallback) => {
    if (!draggedItem.value) return;
    const updatedItem = { ...draggedItem.value, status: column };
    items = items.filter((item) => item._id !== draggedItem.value._id);

    const itemsInColumn = items.filter((item) => item.status === column);

    if (
      typeof draggedItem.value.targetIndex === "undefined" ||
      draggedItem.value.targetIndex >= itemsInColumn.length
    ) {
      itemsInColumn.push(updatedItem);
    } else {
      itemsInColumn.splice(draggedItem.value.targetIndex, 0, updatedItem);
    }

    items = items
      .filter((item) => item.status !== column)
      .concat(itemsInColumn);
    updateCallback(items, updatedItem);
    draggedItem.value = null;
  };
  const dropStatus = (event, items, updateCallback) => {
    event.preventDefault(); // Add this line for clarity
    if (!Array.isArray(items)) {
      console.error("dropStatus: 'items' is not an array", items);
      return;
    }

    if (!draggedItem.value) return;

    const fromIndex = draggedItem.value.originalIndex;
    const toIndex = draggedItem.value.targetIndex;

    if (fromIndex !== toIndex) {
      const itemToMove = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, itemToMove);
      updateCallback(items);
    }

    draggedItem.value = null;
  };

  return { dragStart, dragEnter, dragOver, drop, dropStatus };
}
