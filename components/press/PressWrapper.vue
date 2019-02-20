<template>
  <press-box :nodes="nodes" :label="label" :type="type">
    <template slot-scope="{ cnodes, clabel, ctype }">
      <press-box :nodes="cnodes" :label="clabel" :type="ctype"/>
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
