<template>
  <div class="popup-overlay" v-if="visible">
    <div class="popup-content">
      <button class="close-btn" @click="closePopup">x</button>
      <div class="popup-body">
        <slot></slot>
      </div>
      <div class="popup-buttons">
        <slot name="buttons"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BoardPopup",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    closePopup() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 100%;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.close-btn:hover {
  color: #333;
}

.popup-body {
  margin-bottom: 20px;
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
