<template>
  <press-wrapper :nodes="page.nodes" :type="page.type" :label="page.label"></press-wrapper>
</template>

<script>
import PressWrapper from '@/components/press/PressWrapper'
export default {
  components: {
    PressWrapper
  },
  computed: {
    page() {
      return this.$store.getters['pages/getPageById']('index')
    }
  }
}
</script>
