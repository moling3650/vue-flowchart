<template>
  <div class="right-area" ref="right">
    <div v-for="node in nodes"
    :class="node.className"
    :id="node.id"
    ref="nodes"
    :style="node.style">{{ node.text }}</div>
  </div>
</template>

<script>
  export default {
    name: 'RightArea',
    props: {
      jsp: {
        type: Object
      },
      pos: {
        type: Array
      }
    },
    data () {
      return {
        index: 0,
        nodes: [],
        rjsp: this.jsplumb.getInstance()
      }
    },
    methods: {
      init () {
        this.jsp.droppable(this.$refs.right, {
          drop: data => {
            let node = this.createNode(data.drag.el, data.drop.el)
            this.nodes.push(node)
            this.$nextTick(_ => this.initNewNode())
            return true
          }
        })
      },
      createNode (dragEl, dropEl) {
        let rect = dropEl.getBoundingClientRect()
        return {
          className: dragEl.classList[0],
          id: 'node-' + this.index++,
          style: {
            left: this.pos[0] - rect.left - 1 + 'px',
            top: this.pos[1] - rect.top - 1 + 'px'
          }
        }
      },
      initNewNode () {
        let newNode = this.$refs.nodes[this.nodes.length - 1]
        this.rjsp.draggable(newNode, { constrain: true })
        ;['Top', 'Right', 'Bottom', 'Left'].map(pos => {
          this.rjsp.addEndpoint(newNode, {
            isSource: true,
            isTarget: true,
            anchor: pos,
            connector: 'Flowchart'
          })
        })
      }
    },
    mounted () {
      this.init()
    }
  }
</script>

<style lang="css" scoped>
  .right-area {
    position: relative;
  }
</style>
