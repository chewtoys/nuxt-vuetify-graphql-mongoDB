<template>
  <div>
    <medium-editor
      v-model="content"
      :readOnly="false"
      :prefill="defaultValue"
      :options="options"
      :onChange="onChange"
      v-on:uploaded="uploadCallback"
    ></medium-editor>
  </div>
</template>

<script>
export default {
  name: 'xd-line',
  components: {},
  props: ['_id', 'title', 'defaultValue'],
  data() {
    return {
      text: '',
      content: ``,
      options: {
        uploadUrl: 'http://localhost:3000/v1/upload/image'
      }
    }
  },
  methods: {
    applyTextEdit: function(operation) {
      this.text = operation.api.origElements.innerHTML
    },
    onChange(content) {
      // eslint-disable-next-line no-console
      console.log('changedd', content)
      this.$emit('update', Object.assign({}, { content: content }))
    },
    uploadCallback(url) {
      console.log('uploaded', url)
    }
  }
}
</script>
<style >
iframe {
  border: none;
}
</style>
