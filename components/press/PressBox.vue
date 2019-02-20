<script>
import sample from '@/components/plugins/Sample'

export default {
  functional: true,
  name: 'PressBox',
  props: {
    type: {
      type: String,
      require: true,
      default: ''
    },
    label: {
      type: String,
      require: true,
      default: ''
    },
    nodes: {
      type: Array,
      require: true,
      default: null,
      useDefaultForNull: true
    }
  },
  render(h, { props, listeners, slots, data }) {
    function createButton(item) {
      return h(
        'v-toolbar',
        {
          attrs: {
            dense: false,
            floating: false
          }
        },
        [
          h('v-toolbar-title', [`${item.label}`]),
          h('v-spacer'),
          h('v-btn', { attrs: { icon: true } }, ['dk'])
        ]
      )
    }

    function createContainer(item) {
      return h(
        'v-container',
        {
          class: {
            grey: true
          },
          attrs: {
            fluid: true
          }
        },
        [createButton(item), ...createNodes(item.nodes, 'layout')]
      )
    }

    function createLayout(item) {
      return h(
        'v-layout',
        {
          class: {
            red: true
          },
          attrs: {
            row: true,
            wrap: true,
            xs12: true,
            'align-center': true,
            'justify-center': true
          }
        },
        item.nodes
          ? [createButton(item), ...createNodes(item.nodes, 'flex')]
          : [createButton(item), `${item.type} - ${item.label}`]
      )
    }

    function createFlex(item) {
      return h(
        'v-flex',
        {
          class: {
            yellow: true
          },
          attrs: {
            xs12: true,
            sm6: true,
            md3: true,
            'align-center': true,
            'justify-center': true
          }
        },
        item.comp
          ? [createButton(item), h(sample)]
          : [createButton(item), `${item.type} - ${item.label}`]
      )
    }

    function createCard(item) {
      return h(
        'v-card',
        {
          class: {
            blue: true
          },
          attrs: {
            xs12: true,
            'align-center': true,
            'justify-center': true
          }
        },
        [createButton(item), `${item.type} - ${item.label}`]
      )
    }

    function chooseNode(nodeName, item) {
      let node = null
      switch (nodeName) {
        case 'layout':
          node = createLayout(item)
          break
        case 'flex':
          node = createFlex(item)
          break
        case 'card':
          node = createCard(item)
          break
        default:
          node = createContainer(item)
      }
      return node
    }

    function createNodes(nodes, nodeName) {
      return nodes.map(function(item) {
        return item.nodes ? createScopedSlot(item) : chooseNode(item.type, item)
      })
    }

    function createScopedSlot(item) {
      return data.scopedSlots.default({
        nodes: item.nodes,
        label: item.label,
        type: item.type
      })
    }

    let grid = null
    if (props.type === 'container') {
      console.log('container!!')
      grid = createContainer(props)
    } else if (props.type === 'layout') {
      console.log('layout!!')
      grid = createLayout(props)
    } else if (props.type === 'flex') {
      console.log('flex!!')
      grid = createFlex(props)
    } else {
      console.log('card!!')
      grid = createCard(props)
    }
    return grid
  }
}
</script>

<style scoped>
.layout {
  min-height: 100px;
}
.flex {
  min-height: 80px;
}
.v-card {
  min-height: 60px;
}
.fab-container {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>
