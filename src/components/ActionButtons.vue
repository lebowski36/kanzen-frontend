<template>
  <div class="action-buttons">
    <button class="add-btn" @click="onAdd">+</button>
    <button class="edit-btn" @click="onEdit">✏️</button>
    <button
      class="delete-btn"
      @click="onDelete"
      :class="{ pressed: isDeleteMode }"
    >
      🗑️
    </button>
  </div>
</template>

<script>
export default {
  props: {
    isDeleteMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["add", "edit", "delete"],
  methods: {
    onAdd() {
      this.$emit("add");
    },
    onEdit() {
      this.$emit("edit");
    },
    onDelete() {
      this.$emit("delete");
    },
  },
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  align-items: center;
}

.add-btn,
.edit-btn,
.delete-btn {
  margin-left: 10px;
  font-size: 1.5rem;
  background: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-btn:hover,
.edit-btn:hover,
.delete-btn:hover {
  background: #e0e0e0;
}

.pressed {
  background: #f8d7da;
}
</style>
