<template>
  <div class="right-area" ref="right">
    <el-dialog :title="`请${dialogTitle}`" :visible="dialogVisible">
      <el-input v-model="dialogText" auto-complete="off"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="remove" v-show="dialogTitle.startsWith('编辑')">
          删除{{dialogTitle.substr(2,2)}}
        </el-button>
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="summit">确 定</el-button>
      </div>
    </el-dialog>
    <div v-if="nodes.length"
    v-for="node in nodes"
    class="node"
    :class="node.className"
    :id="node.id"
    ref="nodes"
    :style="node.style"
    @dblclick="editNodeText(node)">{{ node.text }}</div>
    <!-- <el-button class="demo" type="primary" @click="getAllNodes">获取所有节点</el-button> -->
    <!-- <el-button class="demo" type="primary" @click="getAlledges">获取所有连接</el-button> -->
    <div  class="demo">
      <el-button type="primary" @click="saveDatas">保存</el-button>
      <el-button type="primary" @click="clearAll">清除</el-button>
      <el-button type="primary" @click="reload">重现</el-button>
    </div>
  </div>
</template>

<script>
  const DynamicAnchors = ['Left', 'Right', 'Top', 'Bottom']

  const connectorStyle = { stroke: '#7AB02C', strokeWidth: 2, joinstyle: 'round' }

  const connectorHoverStyle = { stroke: '#5c96bc', strokeWidth: 3 }

  const endpointStyle = { fill: 'transparent', stroke: '#7AB02C', radius: 7, strokeWidth: 1 }

  const endpointHoverStyle = { fill: '#5c96bc', stroke: '#5c96bc', radius: 7, strokeWidth: 1 }

  const anEndpoint = {
    connector: 'Flowchart',
    endpoint: 'Dot',
    isSource: true,
    isTarget: true,
    paintStyle: endpointStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorStyle: connectorStyle,
    connectorHoverStyle: connectorHoverStyle
  }

  const Common = {
    anchor: 'AutoDefault',
    connector: 'Flowchart',
    endpoint: 'Dot',
    paintStyle: connectorStyle,
    hoverPaintStyle: connectorHoverStyle,
    endpointStyle,
    endpointHoverStyle
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
        datas: null,
        dialogVisible: false,
        dialogTitle: '',
        dialogText: '',
        nodes: [],
        info: null,
        rjsp: this.$jsplumb.getInstance({
          ConnectionOverlays: [
          ['Arrow', { location: 1, id: 'arrow', width: 11, length: 11 }],
          ['Label', { location: 0.3, id: 'label', cssClass: 'jsp-label', events: {dblclick: this.editLabelText} }]
          ]
        })
      }
    },
    methods: {
      init () {
        this.jsp.droppable(this.$refs.right, { drop: this._jspDrop })
        this.rjsp.bind('beforeDrop', this._jspBeforeDrop)
        this._fetchData()
      },
      _jspDrop (info) {
        this.info = info
        this.openDialog('输入新建节点的文本')
      },
      _jspBeforeDrop (info) {
        info.targetId = info.dropEndpoint.elementId
        let connections = this.rjsp.getConnections({ source: info.sourceId, target: info.targetId })
        if (connections.length === 0) {  // 检察是否已经建立过连接
          this.info = info
          this.openDialog('输入新建连接的文本')
        } else {
          this.editLabelText(connections[0].getOverlay('label'))
        }
      },
      openDialog (title) {
        this.dialogTitle = title
        this.dialogVisible = true
      },
      closeDialog () {
        this.dialogTitle = ''
        this.dialogText = ''
        this.dialogVisible = false
      },
      editNodeText (info) {
        this.dialogText = info.text
        this.info = info
        this.openDialog('编辑节点的文本')
      },
      editLabelText (info) {
        this.dialogText = info.labelText
        this.info = info.component
        this.openDialog('编辑连接的文本')
      },
      summit () {
        if (this.dialogTitle === '输入新建节点的文本') {
          this.nodes.push(this._createNode(this.info.drag.el, this.info.drop.el))
          this.$nextTick(_ => this._initNode(this.$refs.nodes[this.nodes.length - 1]))
        } else if (this.dialogTitle === '编辑节点的文本') {
          this.info.text = this.dialogText
        } else if (this.dialogTitle === '输入新建连接的文本') {
          console.log(this.info)
          this._addEdge(this.info)
        } else if (this.dialogTitle === '编辑连接的文本') {
          let labelText = this.dialogText
          this.$nextTick(_ => (this.info.getOverlay('label').setLabel(labelText)))
        }
        this.closeDialog()
      },
      saveDatas () {
        this.datas = {
          nodes: this.nodes.map((node, index) => {
            node.style = this._getStyle(this.$refs.nodes[index])
            return node
          }),
          edges: this.rjsp.getAllConnections().map(connection => {
            return {
              source: connection.sourceId,
              target: connection.targetId,
              labelText: connection.getOverlay('label').labelText
            }
          })
        }
      },
      _getStyle (node) {
        let container = this.$refs.right.getBoundingClientRect()
        let rect = node.getBoundingClientRect()
        return {
          left: rect.left - container.left - node.clientLeft + 'px',
          top: rect.top - container.top - node.clientTop + 'px',
          lineHeight: node.clientHeight + 'px'
        }
      },
      clearAll () {
        this.rjsp.reset()
        this.nodes = []
      },
      reload () {
        this.clearAll()
        this.rjsp.bind('beforeDrop', this._jspBeforeDrop)
        this.nodes = this.datas.nodes
        this.$nextTick(_ => {
          this._initNodes(this.$refs.nodes)
          this._initEdges(this.datas.edges)
        })
      },
      remove () {
        if (this.dialogTitle === '编辑节点的文本') {
          this._removeNode(this.info)
        } else if (this.dialogTitle === '编辑连接的文本') {
          this._removeEgde(this.info)
        }
        this.closeDialog()
      },
      _removeNode (node) {
        this.rjsp.deleteConnectionsForElement(node.id)
        this.saveDatas()
        this.datas.nodes.splice(this.datas.nodes.findIndex(n => n.id === node.id), 1)
        this.reload()
      },
      _removeEgde (egde) {
        this.rjsp.deleteConnection(egde)
        this.saveDatas()
      },
      _addEdge (info) {
        let labelText = this.dialogText
        let c = this.rjsp.connect({ source: info.sourceId, target: info.targetId }, Common)
        this.$nextTick(_ => c.getOverlay('label').setLabel(labelText))
      },
      _createNode (dragEl, dropEl) {
        let rect = dropEl.getBoundingClientRect()
        return {
          className: dragEl.classList[0],
          id: this.$util.uuid(),
          text: this.dialogText,
          style: {
            left: this.pos[0] - rect.left - dragEl.clientLeft + 'px',
            top: this.pos[1] - rect.top - dragEl.clientTop + 'px',
            lineHeight: dragEl.clientHeight + 'px'
          }
        }
      },
      _initNode (node) {
        this.rjsp.draggable(node, { constrain: true })
        DynamicAnchors.map(anchor => this.rjsp.addEndpoint(node, anEndpoint, { anchor }))
        this.rjsp.makeTarget(node)
      },
      _initNodes (nodes) {
        nodes.map(node => this._initNode(node))
      },
      _initEdges (edges) {
        edges.map(edge => this.rjsp.connect(edge, Common).getOverlay('label').setLabel(edge.labelText))
      },
      _fetchData () {
        this.$http.get('/api/data').then(res => {
          this.nodes = res.data.nodes
          this.$nextTick(_ => {
            this._initNodes(this.$refs.nodes)
            this._initEdges(res.data.edges)
          })
        }).catch(err => console.log(err))
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
