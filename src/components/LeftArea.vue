<template>
  <div class="left-area">
    <div class="item">
      <div class="square center" ref="square"></div>
    </div>
    <div class="item">
      <div class="circle center" ref="circle"></div>
    </div>
    <div class="item">
      <div class="rect center" ref="rect"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LeftArea',
    props: {
      jsp: {
        type: Object
      }
    },
    data () {
      return {
      }
    },
    methods: {
      init () {
        this.jsp.draggable([this.$refs.square, this.$refs.circle, this.$refs.rect], {
          clone: true,
          // constrain: true,
          // containment: true,
          // start (params) {
          //   console.log('start')
          // },
          drag: params => {
            this.$emit('update-pos', params.pos)
          }
        })
      }
    },
    mounted () {
      this.init()
    }
  }
</script>

<style lang="css">
  .left-area > .item {
    position: relative;
    width: 100%;
    height: 200px;
    /*border-bottom: 1px solid #333;*/
  }

  .center {
    position: absolute;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
  }
</style>
