<template>
  <div>
    <div v-for="line in lines" :key="line.id">
      <xdLine :post="line"/>
    </div>
  </div>
</template>

<script>
import xdLine from '@/components/plugins/XdLine'
export default {
  components: {
    xdLine
  },
  data() {
    return {
      lines: [
        {
          id: '1',
          title: 'dd',
          text: 'Extend Editor',
          type: '#',
          completed: true
        }
      ]
    }
  }
}
</script>
