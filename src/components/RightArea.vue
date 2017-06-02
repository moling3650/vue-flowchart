<template>
  <div class="right-area" ref="right">
    <el-dialog title="请输入文字" :visible.sync="dialogVisible">
      <el-input v-model="nodeText" auto-complete="off"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNode">确 定</el-button>
      </div>
    </el-dialog>
    <div v-for="node in nodes"
    class="node"
    :class="node.className"
    :id="node.id"
    ref="nodes"
    :style="node.style">{{ node.text }}</div>
    <!-- <el-button class="demo" type="primary" @click="saveAllNodes">保存所有节点</el-button> -->
    <el-button class="demo" type="primary" @click="getAllConnections">获取所有连接</el-button>
  </div>
</template>

<script>
  // const basicType = {
  //   connector: 'StateMachine',
  //   paintStyle: { stroke: 'red', strokeWidth: 4 },
  //   hoverPaintStyle: { stroke: 'blue' },
  //   overlays: [ 'Arrow' ]
  // }
  // this is the paint style for the connecting lines..
  const connectorPaintStyle = {
    strokeWidth: 2,
    stroke: '#61B7CF',
    joinstyle: 'round',
    outlineStroke: 'white',
    outlineWidth: 2
  }
  // .. and this is the hover style.
  const connectorHoverStyle = {
    strokeWidth: 3,
    stroke: '#216477',
    outlineWidth: 5,
    outlineStroke: 'white'
  }

  const endpointHoverStyle = {
    fill: '#216477',
    stroke: '#216477'
  }

  // the definition of source endpoints (the small blue ones)
  const sourceEndpoint = {
    endpoint: 'Dot',
    paintStyle: {
      stroke: '#7AB02C',
      fill: 'transparent',
      radius: 7,
      strokeWidth: 1
    },
    isSource: true,
    connector: [ 'Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},
    overlays: [
      [
        'Label',
        {
          location: [0.5, 1.5],
          label: 'Drag',
          cssClass: 'endpointSourceLabel',
          visible: false
        }
      ]
    ]
  }

  // the definition of target endpoints (will appear when the user drags a connection)
  const targetEndpoint = {
    endpoint: 'Dot',
    paintStyle: { fill: '#7AB02C', radius: 7 },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: -1,
    dropOptions: { hoverClass: 'hover', activeClass: 'active' },
    isTarget: true,
    overlays: [[
      'Label',
      { location: [0.5, -0.5], label: 'Drop', cssClass: 'endpointTargetLabel', visible: false }
    ]]
  }

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
        dialogVisible: false,
        nodeText: '',
        dropData: null,
        index: 0,
        nodes: [],
        connections: [],
        saveData: {},
        rjsp: this.jsplumb.getInstance({
          ConnectionOverlays: [
            [
              'Arrow',
              {
                location: 1,
                visible: true,
                width: 10,
                length: 20,
                id: 'ARROW',
                events: {
                  click () { window.alert('you clicked on the arrow overlay') }
                }
              }
            ],
            [
              'Label',
              {
                location: 0.5,
                label: '',
                id: 'label',
                cssClass: 'aLabel'
              }
            ]
          ]
        })
      }
    },
    methods: {
      init () {
        this.jsp.droppable(this.$refs.right, {
          drop: data => {
            this.dropData = data
            this.nodeText = ''
            this.dialogVisible = true
            return true
          }
        })
        this._fetchNodes()
      },
      _createNode (dragEl, dropEl) {
        let rect = dropEl.getBoundingClientRect()
        return {
          className: dragEl.classList[0],
          id: 'node-' + ++this.index,
          text: this.nodeText,
          style: {
            left: this.pos[0] - rect.left + 'px',
            top: this.pos[1] - rect.top + 'px',
            lineHeight: dragEl.clientHeight + 'px'
          }
        }
      },
      _addaddEndpoints (el, sourceAnchors, targetAnchors) {
        sourceAnchors.map(anchor => {
          let uuid = `${el.id}_${anchor}`
          this.rjsp.addEndpoint(el.id, sourceEndpoint, { anchor, uuid })
        })
        targetAnchors.map(anchor => {
          let uuid = `${el.id}_${anchor}`
          this.rjsp.addEndpoint(el.id, targetEndpoint, { anchor, uuid })
        })
      },
      _initNewNode () {
        let newNode = this.$refs.nodes[this.nodes.length - 1]
        this.rjsp.draggable(newNode, { constrain: true })
        this._addaddEndpoints(newNode, ['Bottom'], ['Top', 'Left', 'Right'])
      },
      addNode () {
        let node = this._createNode(this.dropData.drag.el, this.dropData.drop.el)
        this.nodes.push(node)
        this.$nextTick(_ => this._initNewNode())
        this.dialogVisible = false
      },
      _fetchNodes () {
        this.$http.get('/api/data').then(res => {
          this.nodes = res.data.nodes
          this.connections = res.data.connections
          this.index = this.nodes.length
          this.$nextTick(_ => {
            this.$refs.nodes.map(node => {
              this.rjsp.draggable(node, { constrain: true })
              this._addaddEndpoints(node, ['Bottom'], ['Top', 'Left', 'Right'])
              this.connections.map(uuids => this.rjsp.connect({ uuids, editable: true }))
            })
          })
        }).catch(err => {
          console.log(err)
        })
      },
      saveAllNodes () {
        this.$http.post('/api/data', this.nodes).then(res => {
          console.log(res)
        }).catch(err => console.log(err))
        // console.log(JSON.stringfiy(this.nodes))
      },
      getAllConnections () {
        this.connections = this.rjsp.getAllConnections().map(item => {
          let [source, target] = item.getAttachedElements()
          return [
            `${source.elementId}_${source.anchor.type}`,
            `${target.elementId}_${target.anchor.type}`
          ]
        })
      }
    },
    mounted () {
      this.init()
      // this.rjsp.registerConnectionType('basic', basicType)
      // this.rjsp.bind('click', function (conn, originalEvent) {
      //   // if (confirm('Delete connection from ' + conn.sourceId + ' to ' + conn.targetId + '?'))
      //   // instance.detach(conn);
      //   conn.toggleType('basic')
      // })
    }
  }
</script>

<style lang="css" scoped>
  .right-area {
    position: relative;
  }

  .demo {
    position: fixed;
  }

  .node {
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    text-align: center;
  }
</style>
