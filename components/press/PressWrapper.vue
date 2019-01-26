<template>
  <press-box :nodes="nodes" :label="label" :type="type">
    <template slot-scope="{ nodes, label, type }">
      <press-box :nodes="nodes" :label="label" :type="type"/>
    </template>
  </press-box>
</template>

<script>
import PressBox from './PressBox'
export default {
  name: 'PressWrapper',
  components: { PressBox },
  props: ['label', 'nodes', 'type'],
  created() {
    console.log(this.type, this.label, ' > nodes : ', this.nodes)
  }
}
</script>
