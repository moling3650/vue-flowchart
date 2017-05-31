<template>
  <div class="left-area">
    <div class="item">
      <div class="square center"></div>
    </div>
    <div class="item">
      <div class="circle center"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LeftArea',
    data () {
      return {

      }
    }
  }
</script>

<style lang="css">
  .left-area > .item {
    position: relative;
    width: 100%;
    height: 200px;
    border-bottom: 1px solid #333;
  }

  .square {
    width: 100px;
    height: 100px;
    border: 1px solid  #333;
    box-sizing: border-box;
  }

  .circle {
    width: 100px;
    height: 100px;
    border: 1px solid  #333;
    border-radius: 50%;
    box-sizing: border-box;
  }

  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
