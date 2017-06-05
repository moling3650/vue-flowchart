<template>
  <div class="right-area" ref="right">
    <el-dialog :title="`请输入${dialogType}`" :visible.sync="dialogVisible">
      <el-input v-model="text" auto-complete="off"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="summit">确 定</el-button>
      </div>
    </el-dialog>
    <div v-for="node in nodes"
    class="node"
    :class="node.className"
    :id="node.id"
    ref="nodes"
    :style="node.style"
    @dblclick="editNode(node)">{{ node.text }}</div>
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
        dialogType: '',
        text: '',
        isAutoSetLable: false,
        connection: null,
        dropData: null,
        node: null,
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
                label: '请输入条件',
                id: 'label',
                cssClass: 'jsp-label',
                events: {
                  dblclick: this.editLabel
                }
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
            this.dialogType = 'node'
            this.text = ''
            this.dialogVisible = true
            return true
          }
        })
        this._fetchNodes()
        this.rjsp.bind('connection', this._connection)
      },
      editNode (node) {
        this.dialogType = 'edit-node'
        this.text = node.text
        this.node = node
        this.dialogVisible = true
      },
      editLabel (label) {
        this.dialogType = 'edit-label'
        this.text = label.labelText
        this.connection = label.component09
        this.dialogVisible = true
      },
      _connection (info) {
        this.connection = info.connection
        if (!this.isAutoSetLable) {
          this.dialogType = 'label'
          this.text = ''
          this.dialogVisible = true
        } else {
          this._addLabel()
        }
      },
      _createNode (dragEl, dropEl) {
        let rect = dropEl.getBoundingClientRect()
        return {
          className: dragEl.classList[0],
          id: 'node-' + ++this.index,
          text: this.text,
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
        this._addaddEndpoints(newNode, ['Top', 'Bottom'], ['Left', 'Right'])
      },
      summit () {
        if (this.dialogType === 'node') {
          this._addNode()
        } else if (this.dialogType === 'label') {
          this._addLabel()
        } else if (this.dialogType === 'edit-node') {
          this.node.text = this.text
        } else if (this.dialogType === 'edit-label') {
          this.connection.getOverlay('label').setLabel(this.text)
        }
        this.dialogVisible = false
      },
      _addLabel () {
        this.$nextTick(_ => {
          if (this.text) {
            this.connection.getOverlay('label').setLabel(this.text)
          } else {
            this.connection.hideOverlay('label')
          }
        })
      },
      _addNode () {
        let node = this._createNode(this.dropData.drag.el, this.dropData.drop.el)
        this.nodes.push(node)
        this.$nextTick(_ => this._initNewNode())
      },
      _fetchNodes () {
        this.$http.get('/api/data').then(res => {
          this.nodes = res.data.nodes
          this.connections = res.data.connections
          this.index = this.nodes.length
          this.$nextTick(_ => {
            this.$refs.nodes.map(node => {
              this.rjsp.draggable(node, { constrain: true })
              this._addaddEndpoints(node, ['Top', 'Bottom'], ['Left', 'Right'])
            })
            this.isAutoSetLable = true
            this.connections.map(connection => {
              this.text = connection.label
              this.rjsp.connect({ uuids: connection.uuids, editable: true })
            })
            this.isAutoSetLable = false
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
    cursor: pointer;
  }
</style>
