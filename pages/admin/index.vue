<template>
  <press-wrapper :nodes="tree.nodes" :type="tree.type" :label="tree.label"></press-wrapper>
</template>

<script>
import PressWrapper from '~/components/press/PressWrapper.vue'

export default {
  components: {
    PressWrapper
  }
}
</script>
