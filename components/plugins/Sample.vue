<template>
  <div>
    <h1>Hello World!</h1>
    <ul>
      <li v-for="i in 10" :key="i">{{ i }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Sample'
}
</script>
