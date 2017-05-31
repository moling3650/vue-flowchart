<template>
  <div id="app">
    <left-area></left-area>
    <right-area></right-area>
  </div>
</template>

<script>
  import LeftArea from './components/LeftArea'
  import RightArea from './components/RightArea'

  export default {
    name: 'app',
    components: {
      LeftArea,
      RightArea
    }
  }
</script>

<style>
  html, body, #app, .left-area, .right-area {
    position: relative;
    height: 100%;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 0;
  }

  .left-area, .right-area {
    display: inline-block;
    border: 1px solid #333;
  }

  .left-area {
    width: 20%;
  }

  .right-area {
    width: 75%;
    margin-left: 5%;
  }
</style>
