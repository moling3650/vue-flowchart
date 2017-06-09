<template>
  <div id="app">
    <left-area :jsp="jsp" @update-pos="updatePosition"></left-area>
    <right-area :jsp="jsp" :pos="pos"></right-area>
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
    },
    data () {
      return {
        jsp: this.$jsplumb.getInstance(),
        pos: [0, 0]
      }
    },
    methods: {
      updatePosition (pos) {
        this.pos = pos
      }
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

  .square {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 1px solid #333;
    border-radius: 5px;
    box-sizing: border-box;
  }

  .circle {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 1px solid #333;
    border-radius: 50%;
    box-sizing: border-box;
  }

  .rect {
    position: absolute;
    top: 25px;
    width: 100px;
    height: 50px;
    border: 1px solid #333;
    box-sizing: border-box;
  }

  .diamond {
    position: absolute;
    top: 25px;
    width: 100px;
    height: 72px;
    background: #fff url(QQ截图20170609173054.png) 0 0 no-repeat;
    -webkit-background-size: 100px 72px;
    background-size: 100px 72px;
    box-sizing: border-box;
  }

  .jsp-label {
    background-color: white;
    padding: 0.4em;
    font: 12px sans-serif;
    color: #444;
    z-index: 21;
    border: 1px dotted gray;
    opacity: 0.8;
    cursor: pointer;
  }

  .jsp-label.jtk-hover {
    background-color: #5c96bc;
    color: white;
    border: 1px solid white;
  }
</style>
